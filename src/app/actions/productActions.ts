"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { CultivationMethod } from "@prisma/client";
import { ActionResult } from "@/lib/types";

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  unit: string;
  harvestDate: string;
  cultivationMethod: CultivationMethod;
  origin: string;
  latitude: number | null;
  longitude: number | null;
};

export async function createProduct(
  input: ProductInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session || session.user.role !== "FARMER") {
    return { success: false, error: "Sesi tidak ditemukan atau Anda bukan Petani. Silakan login ulang." };
  }

  // 1. Validasi Input Dasar
  if (!input.name || input.name.trim().length === 0) return { success: false, error: "Nama produk harus diisi" };
  if (!input.price || input.price < 0) return { success: false, error: "Harga tidak valid" };
  if (input.stock === undefined || input.stock < 0) return { success: false, error: "Stok tidak boleh negatif" };
  if (!input.unit) return { success: false, error: "Satuan (kg/ikat/dll) harus diisi" };

  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description || null,
        price: input.price,
        stock: input.stock,
        images: input.images,
        unit: input.unit || "kg",
        harvestDate: (input.harvestDate && !isNaN(new Date(input.harvestDate).getTime())) 
          ? new Date(input.harvestDate) 
          : null,
        cultivationMethod: input.cultivationMethod,
        origin: input.origin || null,
        latitude: input.latitude,
        longitude: input.longitude,
        farmerId: session.user.id,
      } as Parameters<typeof prisma.product.create>[0]["data"],
    });

    revalidatePath("/dashboard/farmer-produk");
    revalidatePath("/dashboard/produk");
    revalidatePath("/dashboard");
    return { success: true, data: { id: product.id } };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("CREATE_PRODUCT_ERROR:", err);
    // Cek error spesifik Prisma jika ada
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === "P2002") {
       return { success: false, error: "Nama produk ini sudah digunakan" };
    }
    
    return { success: false, error: `Gagal membuat produk di database: ${err.message || "Unknown error"}` };
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session || session.user.role !== "FARMER") {
    return { success: false, error: "Tidak memiliki akses" };
  }

  try {
    const existing = await prisma.product.findFirst({
      where: { id, farmerId: session.user.id },
    });
    if (!existing) return { success: false, error: "Produk tidak ditemukan" };

    await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description || null,
        price: input.price,
        stock: input.stock,
        images: input.images,
        unit: input.unit || "kg",
        harvestDate: (input.harvestDate && !isNaN(new Date(input.harvestDate).getTime())) 
          ? new Date(input.harvestDate) 
          : null,
        cultivationMethod: input.cultivationMethod,
        origin: input.origin || null,
        latitude: input.latitude,
        longitude: input.longitude,
      } as Parameters<typeof prisma.product.update>[0]["data"],
    });

    revalidatePath("/dashboard/farmer-produk");
    revalidatePath("/dashboard/produk");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    console.error("UPDATE_PRODUCT_ERROR:", error);
    return { success: false, error: "Gagal memperbarui produk" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult<void>> {
  const session = await auth();
  if (!session || session.user.role !== "FARMER") {
    return { success: false, error: "Tidak memiliki akses" };
  }

  try {
    await prisma.product.delete({
      where: { id, farmerId: session.user.id },
    });

    revalidatePath("/dashboard/farmer-produk");
    revalidatePath("/dashboard/produk");
    return { success: true, data: undefined };
  } catch (error: unknown) {
    console.error("DELETE_PRODUCT_ERROR:", error);
    return { success: false, error: "Gagal menghapus produk" };
  }
}

export async function getMyProducts() {
  const session = await auth();
  if (!session) return [];

  return prisma.product.findMany({
    where: { farmerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}
export async function getStoreLocations() {
  const products = await prisma.product.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      stock: { gt: 0 }
    },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });

  return products;
}
