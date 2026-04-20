import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PesananViewClient } from "./client/PesananViewClient";

export async function PesananView() {
  const session = await auth();
  if (!session) return null;

  const rawOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              price: true,
              unit: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Resolve image paths to URLs
  const { supabaseServer } = await import("@/lib/supabaseServer");
  const orders = rawOrders.map((order) => {
    const items = order.items.map((item) => {
      if (!item.product) return item;
      const images = (item.product.images as string[] || []).map((path) => {
        if (path.startsWith("http")) return path;
        const { data: { publicUrl } } = supabaseServer.storage.from("agrilink-uploads").getPublicUrl(path);
        return publicUrl;
      });
      return { ...item, product: { ...item.product, images } };
    });
    return { ...order, items };
  });

  return <PesananViewClient initialOrders={orders} />;
}
