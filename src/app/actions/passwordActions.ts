"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function updatePassword(data: { oldPass: string; newPass: string; confirmPass: string }) {
  const session = await auth();
  if (!session) return { error: "Tidak terautentikasi" };

  if (data.newPass !== data.confirmPass) {
    return { error: "Konfirmasi password baru tidak cocok" };
  }

  if (data.newPass.length < 6) {
    return { error: "Password baru minimal 6 karakter" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.password) {
        return { error: "User tidak ditemukan" };
    }

    const isValid = await bcrypt.compare(data.oldPass, user.password);
    if (!isValid) {
      return { error: "Password lama salah" };
    }

    const hashed = await bcrypt.hash(data.newPass, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed }
    });

    return { success: true };
  } catch (_error) {
    return { error: "Gagal memperbarui password" };
  }
}
