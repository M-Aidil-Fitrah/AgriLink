"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { ActionResult } from "@/lib/types";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  items: CartItem[];
  note?: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLon?: number;
};

export async function createOrder(
  input: CreateOrderInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session) return { success: false, error: "Tidak terautentikasi" };

  try {
    // Fetch products to validate stock and price
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== input.items.length) {
      return { success: false, error: "Satu atau lebih produk tidak valid" };
    }

    // Validate stock
    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return { success: false, error: "Produk tidak ditemukan" };
      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Stok ${product.name} tidak mencukupi`,
        };
      }
    }

    const total = input.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    // Create order + decrement stock in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          note: input.note || null,
          deliveryAddress: input.deliveryAddress || null,
          deliveryLat: input.deliveryLat ?? null,
          deliveryLon: input.deliveryLon ?? null,
          items: {
            create: input.items.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
              };
            }),
          },
        },
      });

      // Decrement stock
      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    revalidatePath("/dashboard/pesanan");
    return { success: true, data: { id: order.id } };
  } catch {
    return { success: false, error: "Gagal membuat pesanan" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session || session.user.role !== "FARMER") {
    return { success: false, error: "Tidak memiliki akses" };
  }

  try {
    // Verify that this order contains the farmer's products
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            product: { farmerId: session.user.id },
          },
        },
      },
    });

    if (!order) return { success: false, error: "Pesanan tidak ditemukan" };

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/dashboard/pesanan");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Gagal memperbarui status pesanan" };
  }
}
