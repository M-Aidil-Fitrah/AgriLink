"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export type AdminActionResult = {
  success?: boolean;
  error?: string;
};

export async function getAllUsers() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return [];

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { orders: true, products: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteUser(userId: string): Promise<AdminActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Akses ditolak" };
  if (userId === session.user.id) return { error: "Tidak dapat menghapus akun sendiri" };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(
  userId: string,
  role: Role
): Promise<AdminActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Akses ditolak" };

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function createUser(formData: FormData): Promise<AdminActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Akses ditolak" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  if (!name || !email || !password || !role) return { error: "Semua field wajib diisi" };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Email sudah terdaftar" };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashed, role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getAdminStats() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;

  const [totalUsers, totalFarmers, totalOrders, totalProducts, pendingApplications] =
    await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "FARMER" } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.sellerApplication.count({ where: { status: "PENDING" } }),
    ]);

  return { totalUsers, totalFarmers, totalOrders, totalProducts, pendingApplications };
}
