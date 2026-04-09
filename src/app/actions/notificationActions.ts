"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getMyNotifications() {
  const session = await auth();
  if (!session) return [];
  
  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function markAsRead(id: string) {
  const session = await auth();
  if (!session) return;

  await prisma.notification.update({
    where: { id, userId: session.user.id },
    data: { read: true },
  });
  revalidatePath("/");
}

/**
 * Utility to create notification (Server-side internal)
 */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  return prisma.notification.create({
    data,
  });
}
