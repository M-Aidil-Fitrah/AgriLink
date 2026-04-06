import { prisma } from "@/lib/prisma";
import { JejakView } from "@/components/dashboard/buyer/JejakView";

export default async function JejakPage() {
  const products = await prisma.product.findMany({
    where: { stock: { gt: 0 } },
    include: {
      farmer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const productRows = products.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    latitude: p.latitude,
    longitude: p.longitude,
    harvestDate: p.harvestDate ? p.harvestDate.toISOString() : null,
    farmerName: p.farmer.name,
    origin: p.origin,
  }));

  return <JejakView products={productRows} />;
}
