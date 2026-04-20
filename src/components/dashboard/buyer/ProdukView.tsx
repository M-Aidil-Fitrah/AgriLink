import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ProdukViewClient } from "./ProdukViewClient";

export async function ProdukView() {
  const session = await auth();

  const productsRaw = await prisma.product.findMany({
    where: {
      stock: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      images: true,
      price: true,
      stock: true,
      unit: true,
      cultivationMethod: true,
      productCategory: true,
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
    orderBy: { createdAt: "desc" },
  });

  // Resolve image paths to URLs
  const { supabaseServer } = await import("@/lib/supabaseServer");
  const products = productsRaw.map((product) => {
    const images = (product.images as string[]).map((path) => {
      if (path.startsWith("http")) return path;
      const {
        data: { publicUrl },
      } = supabaseServer.storage.from("agrilink-uploads").getPublicUrl(path);
      return publicUrl;
    });
    return { ...product, images };
  });

  const userFavorites = session?.user?.id ? await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  }) : [];
  const favoritedIds = userFavorites.map((f) => f.productId);

  return <ProdukViewClient products={products} favoritedIds={favoritedIds} />;
}
