"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types";

export async function toggleFavorite(
  productId: string
): Promise<ActionResult<{ favorited: boolean }>> {
  const session = await auth();
  if (!session) return { success: false, error: "Tidak terautentikasi" };

  try {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/dashboard/favorit");
      revalidatePath("/dashboard/produk");
      return { success: true, data: { favorited: false } };
    } else {
      await prisma.favorite.create({
        data: { userId: session.user.id, productId },
      });
      revalidatePath("/dashboard/favorit");
      revalidatePath("/dashboard/produk");
      return { success: true, data: { favorited: true } };
    }
  } catch {
    return { success: false, error: "Gagal memperbarui favorit" };
  }
}
