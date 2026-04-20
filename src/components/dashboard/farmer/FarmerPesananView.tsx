import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { FarmerPesananViewClient } from "./client/FarmerPesananViewClient";


export async function FarmerPesananView() {
  const session = await auth();
  if (!session) return null;

  const ordersRaw = await prisma.order.findMany({
    where: {
      items: {
        some: { product: { farmerId: session.user.id } },
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      items: {
        where: { product: { farmerId: session.user.id } },
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
  const orders = ordersRaw.map((order) => {
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

  return <FarmerPesananViewClient initialOrders={orders} />;
}
