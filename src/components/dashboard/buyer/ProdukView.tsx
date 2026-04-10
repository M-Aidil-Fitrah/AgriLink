import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getFreshnessScore, getFoodMilesCategory, calculateFoodMiles } from "@/lib/metrics";
import { ProductWithFarmer } from "@/lib/types";
import { FavoriteButton } from "./FavoriteButton";
import { CultivationMethod } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";

const CULTIVATION_LABELS: Record<CultivationMethod, string> = {
  ORGANIC: "Organik",
  HYDROPONIC: "Hidroponik",
  CONVENTIONAL: "Konvensional",
  OTHER: "Lainnya",
};

const BUYER_LAT = 5.5483;
const BUYER_LON = 95.3238; // Default Banda Aceh - ideally from user's saved location

export async function ProdukView({ q, method }: { q?: string; method?: string }) {
  const session = await auth();
  if (!session) return null;

  const products = await prisma.product.findMany({
    where: {
      stock: { gt: 0 },
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(method ? { cultivationMethod: method as CultivationMethod } : {}),
    },
    include: {
      farmer: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  }) as ProductWithFarmer[];

  const userFavorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  const favoritedIds = new Set(userFavorites.map((f) => f.productId));

  return (
    <div className="p-8 pb-20">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Katalog Produk</h2>
          <p className="text-gray-500 font-medium mt-1">
            {products.length} produk tersedia dari petani lokal
          </p>
        </div>
        <form method="GET" className="flex gap-3">
          <div className="relative">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari produk..."
              className="pl-4 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-emerald-200 w-60"
            />
          </div>
          <select
            name="method"
            defaultValue={method}
            className="px-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-700 outline-none"
          >
            <option value="">Semua Metode</option>
            {Object.entries(CULTIVATION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-semibold text-lg">Produk tidak tersedia</p>
          <p className="text-gray-400 text-sm mt-2">Coba ubah filter pencarian Anda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const freshness = getFreshnessScore(product.harvestDate);
            const distance =
              product.latitude != null && product.longitude != null
                ? calculateFoodMiles(product.latitude, product.longitude, BUYER_LAT, BUYER_LON)
                : null;
            const distanceCat = distance !== null ? getFoodMilesCategory(distance) : null;
            const isFavorited = favoritedIds.has(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="relative w-full aspect-square">
                  <Link href={`/dashboard/produk/${product.id}`}>
                    <Image
                      src={
                        product.image ||
                        "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=400"
                      }
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </Link>
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.harvestDate && (
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${freshness.color}`}>
                        {freshness.score}/100 {freshness.label}
                      </span>
                    )}
                    {distanceCat && (
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${distanceCat.color}`}>
                        {distance} km · {distanceCat.label}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <FavoriteButton productId={product.id} initialFavorited={isFavorited} />
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <Link href={`/dashboard/produk/${product.id}`} className="block group/title">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 mb-1">
                      {CULTIVATION_LABELS[product.cultivationMethod]}
                    </p>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover/title:text-emerald-600 transition-colors uppercase truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{product.farmer.name}</p>
                  </Link>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <span className="text-base font-extrabold text-gray-900">
                        Rp {product.price.toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">/{product.unit}</span>
                    </div>
                    <AddToCartButton 
                      item={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image,
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
