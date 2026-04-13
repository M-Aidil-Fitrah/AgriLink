"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/types";
import { OrderStatus } from "@prisma/client";

export type OrderInput = {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLon?: number;
  note?: string;
};

/**
 * Fetch the user's primary location from the database.
 */
export async function getUserPrimaryLocation(): Promise<ActionResult<{ address: string; lat: number; lon: number } | null>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const location = await prisma.location.findFirst({
      where: { userId: session.user.id, isPrimary: true }
    });
    
    if (!location) return { success: true, data: null };
    
    return { 
      success: true, 
      data: { 
        address: location.address || "", 
        lat: location.latitude, 
        lon: location.longitude 
      } 
    };
  } catch {
    return { success: false, error: "Failed to fetch location." };
  }
}

/**
 * Refined Order Creation Action - Optimized for DB Compatibility
 */
export async function createOrderAction(input: OrderInput): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the base order, including the geographic coordinates
      const order = await tx.order.create({
        data: {
          userId: session.user.id,
          total: Math.floor(input.total),
          deliveryAddress: input.deliveryAddress,
          deliveryLat: input.deliveryLat ?? null,
          deliveryLon: input.deliveryLon ?? null,
          note: input.note || null,
          status: "PENDING",
        }
      });

      // 2. Create the associated items
      await tx.orderItem.createMany({
        data: input.items.map(item => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      });

      return order;
    });

    revalidatePath("/dashboard/pesanan");
    return { success: true, data: { id: result.id } };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("ORDER_CREATE_EXCEPTION:", err.message);
    
    // Fallback for general database errors
    return { success: false, error: `Sistem gagal memproses: ${err.message}` };
  }
}

/**
 * Updates the status of an existing order.
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult<void>> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    revalidatePath("/dashboard/pesanan");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: `Gagal memperbarui status: ${err.message}` };
  }
}
