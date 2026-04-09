"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name: string; email: string }) {
  const session = await auth();
  if (!session) return { error: "Tidak terautentikasi" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name, email: data.email },
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (_error) {
    return { error: "Gagal memperbarui profil" };
  }
}

export async function getMyLocations() {
  const session = await auth();
  if (!session) return [];
  return prisma.location.findMany({
    where: { userId: session.user.id },
    orderBy: { isPrimary: "desc" },
  });
}

export async function addLocation(data: { label: string; address: string; latitude: number; longitude: number; isPrimary: boolean }) {
  const session = await auth();
  if (!session) return { error: "Tidak terautentikasi" };

  try {
    if (data.isPrimary) {
      await prisma.location.updateMany({
        where: { userId: session.user.id },
        data: { isPrimary: false },
      });
    }

    await prisma.location.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (_error) {
    return { error: "Gagal menambah lokasi" };
  }
}

export async function deleteLocation(id: string) {
  const session = await auth();
  if (!session) return { error: "Tidak terautentikasi" };

  try {
    await prisma.location.delete({
      where: { id, userId: session.user.id },
    });
    revalidatePath("/dashboard/profil");
    return { success: true };
  } catch (_error) {
    return { error: "Gagal menghapus lokasi" };
  }
}
