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
  image: string;
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
    return { success: false, error: "Tidak memiliki akses" };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description || null,
        price: input.price,
        stock: input.stock,
        image: input.image || null,
        unit: input.unit || "kg",
        harvestDate: input.harvestDate ? new Date(input.harvestDate) : null,
        cultivationMethod: input.cultivationMethod,
        origin: input.origin || null,
        latitude: input.latitude,
        longitude: input.longitude,
        farmerId: session.user.id,
      },
    });

    revalidatePath("/dashboard/farmer-produk");
    revalidatePath("/dashboard/produk");
    revalidatePath("/dashboard");
    return { success: true, data: { id: product.id } };
  } catch {
    return { success: false, error: "Gagal membuat produk" };
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
        image: input.image || null,
        unit: input.unit || "kg",
        harvestDate: input.harvestDate ? new Date(input.harvestDate) : null,
        cultivationMethod: input.cultivationMethod,
        origin: input.origin || null,
        latitude: input.latitude,
        longitude: input.longitude,
      },
    });

    revalidatePath("/dashboard/farmer-produk");
    revalidatePath("/dashboard/produk");
    return { success: true, data: undefined };
  } catch {
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
  } catch {
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
