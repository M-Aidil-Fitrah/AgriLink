"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";
import { createNotification } from "./notificationActions";

export type OrderInput = {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  note?: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLon?: number;
};

export async function createOrder(data: OrderInput) {
  const session = await auth();
  if (!session) return { error: "Tidak terautentikasi" };

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total: data.total,
          note: data.note,
          deliveryAddress: data.deliveryAddress,
          deliveryLat: data.deliveryLat,
          deliveryLon: data.deliveryLon,
          status: "PENDING",
        },
      });

      // 2. Create order items
      await tx.orderItem.createMany({
        data: data.items.map((item) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // 3. Update product stocks and Notify Farmers
      const farmerIds = new Set<string>();
      
      for (const item of data.items) {
        const prod = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
          select: { farmerId: true, name: true }
        });
        farmerIds.add(prod.farmerId);
      }

      // 4. Send notifications to all unique farmers in this order
      for (const fId of farmerIds) {
          await createNotification({
              userId: fId,
              title: "Pesanan Baru Masuk",
              message: `Anda memiliki pesanan baru senilai Rp ${data.total.toLocaleString("id-ID")}`,
              type: "ORDER_STATUS",
              link: "/dashboard/pesanan"
          });
      }

      return newOrder;
    });

    revalidatePath("/dashboard/pesanan");
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order", error);
    return { error: "Gagal memproses pesanan" };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await auth();
  if (!session) return { error: "Tidak terautentikasi" };

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/dashboard/pesanan");
    return { success: true };
  } catch (error) {
    console.error("Failed to update order status", error);
    return { error: "Gagal memperbarui status pesanan" };
  }
}
