"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { SellerApplicationStatus } from "@prisma/client";
import { createNotification } from "./notificationActions";

export type SellerApplicationFormData = {
  fullName: string;
  nik: string;
  ktpPhotoUrl: string;
  selfiePhotoUrl: string;
  phone: string;
  address: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  latitude: number | null;
  longitude: number | null;
  businessPhotoUrl: string;
  description: string;
  mainCommodity: string;
};

export type ApplicationActionResult = { 
  success?: boolean; 
  error?: string;
};

export async function submitSellerApplication(
  data: SellerApplicationFormData
): Promise<ApplicationActionResult> {
  const session = await auth();
  if (!session) return { error: "Tidak terautentikasi" };
  if (session.user.role !== "USER") return { error: "Hanya pengguna biasa yang dapat mengajukan" };

  const existing = await prisma.sellerApplication.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    if (existing.status === "PENDING") return { error: "Pengajuan Anda sedang diproses" };
    if (existing.status === "APPROVED") return { error: "Akun Anda sudah disetujui sebagai seller" };
    // REJECTED - allow resubmit by updating
    await prisma.sellerApplication.update({
      where: { userId: session.user.id },
      data: {
        ...data,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        status: "PENDING",
        adminNote: null,
        reviewedAt: null,
        reviewedBy: null,
      },
    });
    revalidatePath("/dashboard/ajukan-seller");
    return { success: true };
  }

  await prisma.sellerApplication.create({
    data: {
      userId: session.user.id,
      ...data,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    },
  });

  revalidatePath("/dashboard/ajukan-seller");
  return { success: true };
}

export async function getMyApplication() {
  const session = await auth();
  if (!session) return null;
  return prisma.sellerApplication.findUnique({
    where: { userId: session.user.id },
  });
}

// ADMIN ACTIONS
export async function reviewSellerApplication(
  applicationId: string,
  decision: SellerApplicationStatus,
  adminNote: string
): Promise<ApplicationActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return { error: "Akses ditolak" };

  const application = await prisma.sellerApplication.findUnique({
    where: { id: applicationId },
  });
  if (!application) return { error: "Pengajuan tidak ditemukan" };

  await prisma.$transaction(async (tx) => {
    await tx.sellerApplication.update({
      where: { id: applicationId },
      data: {
        status: decision,
        adminNote,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    });

    if (decision === "APPROVED") {
      await tx.user.update({
        where: { id: application.userId },
        data: { role: "FARMER" },
      });
      
      await createNotification({
          userId: application.userId,
          title: "Pendaftaran Seller Disetujui!",
          message: "Selamat! Akun Anda telah resmi menjadi Seller di Agrilink. Silakan login ulang untuk melihat dashboard baru.",
          type: "APPLICATION",
          link: "/dashboard"
      });
    } else if (decision === "REJECTED") {
      await createNotification({
          userId: application.userId,
          title: "Pendaftaran Seller Ditolak",
          message: `Mohon maaf, pengajuan Anda belum dapat kami proses. Alasan: ${adminNote}`,
          type: "APPLICATION",
          link: "/dashboard/ajukan-seller"
      });
    }
  });

  revalidatePath("/admin/aplikasi");
  return { success: true };
}

export async function getAllApplications() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return [];

  return prisma.sellerApplication.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
