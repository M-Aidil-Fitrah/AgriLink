import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/dashboard/buyer/ProductDetails";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  const rawProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          sellerApplication: {
            select: {
              businessName: true,
              businessAddress: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!rawProduct) {
    notFound();
  }

  // Check if current user has a delivered order containing this product
  const hasDeliveredOrder = currentUserId
    ? (await prisma.order.findFirst({
        where: {
          userId: currentUserId,
          status: OrderStatus.DELIVERED,
          items: { some: { productId: id } },
        },
        select: { id: true },
      })) !== null
    : false;

  // Resolve image paths to URLs
  const { supabaseServer } = await import("@/lib/supabaseServer");
  const images = ((rawProduct.images as string[]) || []).map((path) => {
    if (path.startsWith("http")) return path;
    const {
      data: { publicUrl },
    } = supabaseServer.storage.from("agrilink-uploads").getPublicUrl(path);
    return publicUrl;
  });

  const product = {
    ...rawProduct,
    images,
    farmer: {
      ...rawProduct.farmer,
    },
  };

  return (
    <ProductDetails
      product={product}
      currentUserId={currentUserId}
      hasDeliveredOrder={hasDeliveredOrder}
    />
  );
}
