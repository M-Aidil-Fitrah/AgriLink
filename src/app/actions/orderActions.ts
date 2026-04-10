"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types";

export type OrderInput = {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  deliveryAddress: string;
};

export async function createOrderAction(input: OrderInput): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Silakan login terlebih dahulu untuk melakukan checkout." };
  }

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: input.total,
        deliveryAddress: input.deliveryAddress,
        status: "PENDING",
        items: {
          create: input.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    // Revalidate for both buyer and farmer dashboards
    revalidatePath("/dashboard/pesanan");
    revalidatePath("/dashboard");
    
    return { success: true, data: { id: order.id } };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("CREATE_ORDER_ERROR:", err);
    return { success: false, error: `Gagal membuat pesanan: ${err.message || "Unknown error"}` };
  }
}
