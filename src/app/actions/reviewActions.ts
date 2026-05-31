"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export type ReviewActionResult = {
  success?: boolean;
  error?: string;
};

export type SubmitReviewInput = {
  productId: string;
  rating: number;
  comment: string;
};

export async function submitReview(
  input: SubmitReviewInput
): Promise<ReviewActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Anda harus login untuk memberikan ulasan" };
  }

  const { productId, rating, comment } = input;

  // Validate rating range
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { error: "Rating harus berupa angka bulat antara 1 sampai 5" };
  }

  // Check if user has purchased & received this product (DELIVERED status)
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: OrderStatus.DELIVERED,
      items: {
        some: {
          productId,
        },
      },
    },
  });

  if (!deliveredOrder) {
    return {
      error:
        "Anda hanya bisa memberikan ulasan setelah pesanan produk ini diterima (status Delivered)",
    };
  }

  // Check for existing review (upsert — update if already reviewed)
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  if (existingReview) {
    await prisma.review.update({
      where: { id: existingReview.id },
      data: {
        rating,
        comment: comment.trim() || null,
      },
    });
  } else {
    await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        comment: comment.trim() || null,
      },
    });
  }

  revalidatePath(`/dashboard/produk/${productId}`);
  return { success: true };
}
