import { prisma } from "@/lib/prisma";
import { JejakView } from "@/components/dashboard/buyer/JejakView";
import { ProductRow } from "@/lib/types";

export default async function JejakPage() {
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    include: {
      farmer: {
        select: {
          id: true,
          name: true,
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
    },
    orderBy: { createdAt: "desc" },
  });

  // Resolve image paths to URLs
  const { supabaseServer } = await import("@/lib/supabaseServer");

  const productRows: ProductRow[] = await Promise.all(
    products.map(async (p) => {
      const images = (p.images as string[]).map((path) => {
        if (path.startsWith("http")) return path;
        const {
          data: { publicUrl },
        } = supabaseServer.storage
          .from("agrilink-uploads")
          .getPublicUrl(path);
        return publicUrl;
      });

      return {
        id: p.id,
        name: p.name,
        images,
        price: p.price,
        stock: p.stock,
        unit: p.unit,
        farmerId: p.farmer.id,
        harvestDate: p.harvestDate ? p.harvestDate.toISOString() : null,
        cultivationMethod: p.cultivationMethod,
        productCategory: p.productCategory,
        farmerName:
          p.farmer.sellerApplication?.businessName ||
          p.farmer.name ||
          "Petani",
        origin:
          p.origin ||
          p.farmer.sellerApplication?.businessAddress ||
          "Lokasi tidak diketahui",
        sellerLat: p.farmer.sellerApplication?.latitude ?? null,
        sellerLon: p.farmer.sellerApplication?.longitude ?? null,
      };
    })
  );

  return <JejakView products={productRows} />;
}
