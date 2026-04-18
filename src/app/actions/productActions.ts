"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { CultivationMethod, Product } from "@prisma/client";
import { ActionResult, SellerLocation } from "@/lib/types";

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
        farmerId: session.user.id,
      },
    });

    revalidatePath("/dashboard/farmer-produk");
    revalidatePath("/dashboard/produk");
    revalidatePath("/dashboard");
    return { success: true, data: { id: product.id } };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("CREATE_PRODUCT_ERROR:", err);

    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
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
      },
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

export async function getMyProducts(): Promise<Product[]> {
  const session = await auth();
  if (!session) return [];

  return prisma.product.findMany({
    where: { farmerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Returns seller locations from their SellerApplication (not product coordinates).
 */
export async function getStoreLocations(): Promise<SellerLocation[]> {
  const sellers = await prisma.sellerApplication.findMany({
    where: {
      status: "APPROVED",
      latitude: { not: null },
      longitude: { not: null },
    },
    select: {
      userId: true,
      businessName: true,
      businessAddress: true,
      businessType: true,
      mainCommodity: true,
      latitude: true,
      longitude: true,
      businessPhotoUrl: true,
      user: {
        select: {
          _count: {
            select: { products: { where: { stock: { gt: 0 } } } }
          }
        }
      }
    },
  });

  return sellers
    .filter(s => s.latitude !== null && s.longitude !== null)
    .map(s => ({
      userId: s.userId,
      businessName: s.businessName,
      businessAddress: s.businessAddress,
      businessType: s.businessType,
      mainCommodity: s.mainCommodity,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      businessPhotoUrl: s.businessPhotoUrl as string,
      productCount: s.user._count.products
    }));
}

export async function searchProducts(query: string): Promise<{
  id: string;
  name: string;
  images: string[];
  price: number;
  unit: string;
  origin: string | null;
  farmer: {
    id: string;
    name: string | null;
    sellerApplication: {
      businessName: string;
      businessAddress: string;
    } | null;
  };
}[]> {
  if (!query || query.trim().length < 2) return [];

  const productsRaw = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { origin: { contains: query, mode: "insensitive" } },
        {
          farmer: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              {
                sellerApplication: {
                  businessName: { contains: query, mode: "insensitive" },
                },
              },
            ],
          },
        },
      ],
      stock: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      images: true,
      price: true,
      unit: true,
      origin: true,
      farmer: {
        select: {
          id: true,
          name: true,
          sellerApplication: {
            select: {
              businessName: true,
              businessAddress: true,
            },
          },
        },
      },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const { supabaseServer } = await import("@/lib/supabaseServer");
  return productsRaw.map((product) => {
    const images = (product.images as string[]).map((path) => {
      if (path.startsWith("http")) return path;
      const { data: { publicUrl } } = supabaseServer.storage.from("agrilink-uploads").getPublicUrl(path);
      return publicUrl;
    });
    return { ...product, images };
  });
}
