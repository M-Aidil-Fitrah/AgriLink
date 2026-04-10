import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { calculateFoodMiles } from "@/lib/metrics";
import { FavoriteButton } from "./FavoriteButton";
import { CultivationMethod } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";
import { ProductWithFarmer } from "@/lib/types";

const CULTIVATION_LABELS: Record<CultivationMethod, string> = {
  ORGANIC: "Organik",
  HYDROPONIC: "Hidroponik",
  CONVENTIONAL: "Konvensional",
  OTHER: "Lainnya",
};

const BUYER_LAT = 5.5483;
const BUYER_LON = 95.3238;

export async function ProdukView({ q, method }: { q?: string; method?: string }) {
  const session = await auth();
  if (!session) return null;

  const products = (await prisma.product.findMany({
    where: {
      stock: { gt: 0 },
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(method ? { cultivationMethod: method as CultivationMethod } : {}),
    },
    include: {
      farmer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })) as ProductWithFarmer[];

  const userFavorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  const favoritedIds = new Set(userFavorites.map((f) => f.productId));

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Katalog Produk</h2>
          <p className="text-sm text-gray-500 font-medium">
            {products.length} produk dari petani lokal
          </p>
        </div>
        <form method="GET" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari produk..."
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-emerald-500 w-48 shadow-sm"
          />
          <select
            name="method"
            defaultValue={method}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 outline-none focus:border-emerald-500 shadow-sm"
          >
            <option value="">Semua</option>
            {Object.entries(CULTIVATION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md">
            Filter
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500 font-medium">Produk tidak tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => {
            const distance = product.latitude != null && product.longitude != null
                ? calculateFoodMiles(product.latitude, product.longitude, BUYER_LAT, BUYER_LON)
                : null;
            const isFavorited = favoritedIds.has(product.id);

            return (
              <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative w-full aspect-[16/11] overflow-hidden">
                  <Link href={`/dashboard/produk/${product.id}`}>
                    <Image
                      src={product.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                  </Link>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-emerald-800 uppercase tracking-wider shadow-sm border border-emerald-50">
                      {CULTIVATION_LABELS[product.cultivationMethod]}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <FavoriteButton productId={product.id} initialFavorited={isFavorited} />
                  </div>
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <Link href={`/dashboard/produk/${product.id}`} className="mb-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors uppercase truncate tracking-tight">{product.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1 opacity-70">
                       <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                       <p className="text-[10px] font-semibold text-gray-500 truncate">{product.farmer.name || "Petani"}</p>
                    </div>
                  </Link>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Harga</p>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-sm font-black text-emerald-700">Rp {product.price.toLocaleString("id-ID")}</span>
                        <span className="text-[9px] font-bold text-gray-400">/ {product.unit}</span>
                      </div>
                    </div>
                    <AddToCartButton 
                      item={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        images: product.images || [],
                        unit: product.unit,
                        farmerId: product.farmer.id,
                        farmerName: product.farmer.name || "Petani",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
