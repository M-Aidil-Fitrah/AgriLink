import { prisma } from "@/lib/prisma";
import { SellerWithProducts } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Package, Leaf, ChevronRight } from "lucide-react";

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

export async function TokoView({ q }: { q?: string }) {
  const allSellers = await getApprovedSellers();

  const sellers = q
    ? allSellers.filter((s) =>
        s.businessName.toLowerCase().includes(q.toLowerCase()) ||
        s.businessAddress.toLowerCase().includes(q.toLowerCase()) ||
        s.mainCommodity.toLowerCase().includes(q.toLowerCase())
      )
    : allSellers;

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Toko Petani</h2>
          <p className="text-sm text-gray-500 font-medium">
            {sellers.length} toko dari mitra petani kami
          </p>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama toko, komoditas..."
            className="px-4 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all w-full sm:w-64 shadow-sm"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 shrink-0"
          >
            Cari
          </button>
        </form>
      </div>

      {sellers.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Toko tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sellers.map((store) => (
            <Link
              key={store.userId}
              href={`/dashboard/toko/${store.userId}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Store Image */}
              <div className="relative w-full aspect-16/11 overflow-hidden bg-emerald-50">
                {store.businessPhotoUrl ? (
                  <Image
                    src={store.businessPhotoUrl}
                    alt={store.businessName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-10 h-10 text-emerald-300" />
                  </div>
                )}
                {/* Business type badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-emerald-800 uppercase tracking-wider shadow-sm border border-emerald-50">
                    {store.businessType}
                  </span>
                </div>
              </div>

              {/* Store Info */}
              <div className="p-3.5 flex flex-col flex-1">
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors uppercase truncate tracking-tight">
                    {store.businessName}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1.5 opacity-80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                      <p className="text-[10px] font-bold text-gray-700 truncate uppercase mt-0.5">
                        {store.mainCommodity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <p className="text-[9px] font-bold truncate tracking-wide">
                        {store.businessAddress}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Package className="w-3 h-3" />
                    <span className="text-[10px] font-bold">
                      {store.productCount} produk
                    </span>
                  </div>
                  <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
