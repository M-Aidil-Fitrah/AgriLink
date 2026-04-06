import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, Heart, TreePine, Star } from "lucide-react";
import { DynamicMap } from "./DynamicMap";
import Image from "next/image";
import { calculateFoodMiles, getFoodMilesCategory, getFreshnessScore } from "@/lib/metrics";
import { Product, User } from "@prisma/client";

interface ExtendedProduct extends Product {
  latitude?: number | null;
  longitude?: number | null;
  farmer?: User | null;
}

export default async function DashboardOverview() {
  const session = await auth();
  if (!session) return null;

  const [orders, products] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.product.findMany({ take: 4, include: { farmer: true } })
  ]);
  const favorites = 0; // Note: Waiting for Prisma regenerate

  const extProducts = products as unknown as ExtendedProduct[];

  let avgMiles = 0;
  if (extProducts.length > 0) {
    const valid = extProducts.filter(p => p.latitude != null && p.longitude != null);
    if (valid.length > 0) {
      const sum = valid.reduce((acc, p) => acc + calculateFoodMiles(p.latitude as number, p.longitude as number, -6.2, 106.8), 0);
      avgMiles = Math.round(sum / valid.length);
    }
  }

  const userName = session.user.name?.split(" ")[0] || "Teman";

  return (
    <div className="p-8 pb-20">
      {/* Title & Food Miles Area Split */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full">
        {/* Welcome Section */}
        <div className="w-full lg:w-2/3 relative rounded-3xl p-8 overflow-hidden bg-emerald-900/5">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent to-emerald-100/50" />
          <h2 className="text-3xl font-extrabold text-gray-900 relative z-10">
            Selamat pagi, <span className="text-emerald-600">{userName}!</span>
          </h2>
          <p className="text-gray-500 mt-2 font-medium relative z-10 max-w-sm">
            Temukan produk segar langsung dari petani lokal, lebih dekat, lebih segar.
          </p>
        </div>

        {/* Food Miles Widget on Top Right */}
        <div className="w-full lg:w-1/3 bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-6 justify-between lg:justify-center">
            <div>
               <h3 className="font-bold text-gray-900 text-sm mb-1">Food Miles Indikator</h3>
               <p className="text-xs font-semibold text-gray-500">Rata-rata jarak</p>
            </div>
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white shrink-0 shadow-sm relative">
               <div className="text-center">
                  <span className="text-lg font-extrabold text-gray-900 block leading-none mt-1">{avgMiles === 0 ? "-" : avgMiles}</span>
                  <span className="text-[9px] font-bold text-emerald-600">km</span>
               </div>
            </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Pesanan Aktif", value: orders.toString(), sub: orders > 0 ? "Diproses" : "Belum ada pesanan", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Favorit", value: favorites.toString(), sub: "Tersimpan", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
          { label: "Total Kontribusi", value: "Rp 0", sub: "Ke petani lokal", icon: TreePine, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Skor Kesegaran", value: "4.8/5", sub: "Sangat Segar", icon: Star, color: "text-amber-500", bg: "bg-amber-50" }
        ].map((metric, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-default">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color}`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-gray-600">{metric.label}</span>
            </div>
            <div className="mt-auto">
              <span className="text-2xl font-extrabold text-gray-900 line-clamp-1">{metric.value}</span>
              <p className="text-xs font-semibold text-gray-400 mt-1 bg-gray-50 w-fit px-2 py-1 rounded-md">{metric.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column (Products) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Rekomendasi Produk</h3>
            <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Lihat semua</button>
          </div>
          
          {extProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {extProducts.map((p) => {
                const distance = (p.latitude != null && p.longitude != null) ? calculateFoodMiles(p.latitude, p.longitude, -6.2, 106.8) : null;
                const distanceCat = distance !== null ? getFoodMilesCategory(distance) : null;
                const freshness = p.harvestDate ? getFreshnessScore(new Date(p.harvestDate)) : null;

                return (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-lg transition-all cursor-pointer group flex flex-col relative">
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                       {freshness && (
                         <div className={`px-2 py-1 rounded-md text-[10px] font-bold border shadow-sm ${freshness.color}`}>
                           {freshness.score}/100 • {freshness.label}
                         </div>
                       )}
                       {distanceCat && (
                         <div className={`px-2 py-1 rounded-md text-[10px] font-bold border shadow-sm ${distanceCat.color}`}>
                           {distance} km • {distanceCat.label}
                         </div>
                       )}
                    </div>

                    <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3 relative overflow-hidden">
                      <img src={p.image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=400"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{p.name}</h4>
                    <p className="text-xs text-gray-500 mb-2 truncate">{p.farmer?.name || "Petani Lokal"}</p>
                    <div className="mt-auto flex justify-between items-end">
                      <p className="text-sm font-extrabold text-emerald-700">Rp {p.price?.toLocaleString("id-ID") || 0} <span className="text-[10px] text-gray-400 font-medium">/kg</span></p>
                      <button className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Package className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
               <p className="text-gray-500 font-medium">Produk tidak tersedia saat ini.</p>
               <p className="text-xs text-gray-400 mt-1">Petani kami sedang menyiapkan panen terbaik!</p>
            </div>
          )}
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[300px]">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Peta Produk Terdekat</h3>
             </div>
             <div className="w-full flex-1 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm relative overflow-hidden">
                <DynamicMap />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
