import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, Heart, TreePine, ShoppingCart } from "lucide-react";
import { DynamicMap } from "./DynamicMap";
import { calculateFoodMiles, getFoodMilesCategory, getFreshnessScore } from "@/lib/metrics";
import { ProductWithFarmer } from "@/lib/types";
import { getStoreLocations } from "@/app/actions/productActions";
import Image from "next/image";

const BUYER_LAT = 5.5483;
const BUYER_LON = 95.3238;

export default async function DashboardOverview() {
  const session = await auth();
  if (!session) return null;

  const [ordersCount, favorites, products, spending, itemsCount, storeLocations] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.product.findMany({
      take: 4,
      where: { stock: { gt: 0 } },
      include: { farmer: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    }) as Promise<ProductWithFarmer[]>,
    prisma.order.aggregate({
      where: { userId: session.user.id },
      _sum: { total: true },
    }),
    prisma.orderItem.aggregate({
        where: { order: { userId: session.user.id } },
        _sum: { quantity: true }
    }),
    getStoreLocations()
  ]);

  const totalSpent = spending._sum.total ?? 0;
  const totalBought = itemsCount._sum.quantity ?? 0;

  const userName = session.user.name?.split(" ")[0] ?? "Teman";

  const validProducts = products.filter(
    (p) => p.latitude != null && p.longitude != null
  );
  const avgMiles =
    validProducts.length > 0
      ? Math.round(
          validProducts.reduce(
            (acc, p) =>
              acc + calculateFoodMiles(p.latitude!, p.longitude!, BUYER_LAT, BUYER_LON),
            0
          ) / validProducts.length
        )
      : null;

  return (
    <div className="p-8 pb-20">
      {/* Top Row */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="flex-1 relative rounded-3xl p-8 overflow-hidden bg-emerald-50 border border-emerald-100">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Selamat pagi, <span className="text-emerald-600">{userName}!</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium max-w-sm">
            Temukan produk segar langsung dari petani lokal, lebih dekat, lebih segar.
          </p>
        </div>

        {avgMiles !== null && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 min-w-[240px]">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-emerald-50 shrink-0">
              <span className="text-xl font-black text-gray-900 leading-none">{avgMiles}</span>
              <span className="text-[10px] font-bold text-emerald-600">km</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Food Miles</h3>
              <p className="text-xs font-semibold text-gray-500 mt-1">
                {getFoodMilesCategory(avgMiles).label} · Rata-rata jarak
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Pesanan", value: ordersCount.toString(), sub: "Seluruh transaksi", Icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Favorit", value: favorites.toString(), sub: "Tersimpan", Icon: Heart, color: "text-red-500", bg: "bg-red-50" },
          { label: "Total Pengeluaran", value: `Rp ${totalSpent.toLocaleString("id-ID")}`, sub: "Ke petani lokal", Icon: TreePine, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Total Pembelian", value: totalBought.toString(), sub: "Produk terbeli", Icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color} mb-4`}>
              <metric.Icon className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-gray-900 block">{metric.value}</span>
            <p className="text-xs font-semibold text-gray-400 mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Rekomendasi Produk</h3>
          </div>
          {products.length === 0 ? (
            <div className="py-16 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-100">
              <p className="text-gray-500 font-medium">Produk tidak tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products.map((product) => {
                const freshness = getFreshnessScore(product.harvestDate);
                const distance =
                  product.latitude != null && product.longitude != null
                    ? calculateFoodMiles(product.latitude, product.longitude, BUYER_LAT, BUYER_LON)
                    : null;
                const distCat = distance !== null ? getFoodMilesCategory(distance) : null;

                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group flex flex-col hover:shadow-md transition-shadow">
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                      <Image
                        src={product.image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=400"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.harvestDate && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${freshness.color}`}>
                            {freshness.score}/100
                          </span>
                        )}
                        {distCat && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${distCat.color}`}>
                            {distance}km
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{product.farmer.name}</p>
                      <p className="text-sm font-extrabold text-emerald-700 mt-2">
                        Rp {product.price.toLocaleString("id-ID")}
                        <span className="text-xs text-gray-400 font-normal ml-1">/{product.unit}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[600px] lg:h-auto">
          <h3 className="font-bold text-gray-900 mb-4">Peta Toko Terdekat</h3>
          <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden relative">
            <DynamicMap markers={storeLocations} />
          </div>
        </div>
      </div>
    </div>
  );
}
