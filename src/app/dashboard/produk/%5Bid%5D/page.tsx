import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/dashboard/buyer/ProductDetails";
import { notFound } from "next/navigation";
import { ProductWithFarmer } from "@/lib/types";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  }) as ProductWithFarmer | null;

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
