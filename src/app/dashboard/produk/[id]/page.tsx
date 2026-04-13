import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/dashboard/buyer/ProductDetails";
import { notFound } from "next/navigation";
import { ProductWithFarmer } from "@/lib/types";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
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
              businessAddress: true
            }
          }
        }
      }
    }
  });

  if (!rawProduct) {
    notFound();
  }

  // Resolve image paths to URLs
  const { supabaseServer } = await import("@/lib/supabaseServer");
  const images = (rawProduct.images as string[] || []).map((path) => {
    if (path.startsWith("http")) return path;
    const { data: { publicUrl } } = supabaseServer.storage.from("agrilink-uploads").getPublicUrl(path);
    return publicUrl;
  });

  const product = { ...rawProduct, images } as ProductWithFarmer;

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
