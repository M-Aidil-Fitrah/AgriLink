import { prisma } from "@/lib/prisma";
import { SellerWithProducts } from "@/lib/types";
import { TokoViewClient } from "./client/TokoViewClient";

async function getApprovedSellers(): Promise<SellerWithProducts[]> {
  const sellers = await prisma.sellerApplication.findMany({
    where: { status: "APPROVED" },
    select: {
      userId: true,
      businessName: true,
      businessAddress: true,
      businessType: true,
      mainCommodity: true,
      description: true,
      businessPhotoUrl: true,
      latitude: true,
      longitude: true,
      user: {
        select: {
          _count: {
            select: { products: { where: { stock: { gt: 0 } } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const { supabaseServer } = await import("@/lib/supabaseServer");

  return sellers.map((s) => {
    let photoUrl = s.businessPhotoUrl;
    if (photoUrl && !photoUrl.startsWith("http")) {
      const { data: { publicUrl } } = supabaseServer.storage
        .from("agrilink-uploads")
        .getPublicUrl(photoUrl);
      photoUrl = publicUrl;
    }
    return {
      userId: s.userId,
      businessName: s.businessName,
      businessAddress: s.businessAddress,
      businessType: s.businessType,
      mainCommodity: s.mainCommodity,
      description: s.description,
      businessPhotoUrl: photoUrl,
      latitude: s.latitude,
      longitude: s.longitude,
      productCount: s.user._count.products,
    };
  });
}

export async function TokoView() {
  const allSellers = await getApprovedSellers();

  return <TokoViewClient sellers={allSellers} />;
}
