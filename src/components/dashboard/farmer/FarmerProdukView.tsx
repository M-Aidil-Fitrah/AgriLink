import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { FarmerProdukViewClient } from "./client/FarmerProdukViewClient";

export async function FarmerProdukView() {
  const session = await auth();
  if (!session) return null;

  const productsRaw = await prisma.product.findMany({
    where: { farmerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Resolve image paths to URLs
  const { supabaseServer } = await import("@/lib/supabaseServer");
  const products = productsRaw.map((product) => {
    const images = (product.images as string[] || []).map((path) => {
      if (path.startsWith("http")) return path;
      const { data: { publicUrl } } = supabaseServer.storage.from("agrilink-uploads").getPublicUrl(path);
      return publicUrl;
    });
    return { ...product, images };
  });

  return <FarmerProdukViewClient products={products} />;
}
