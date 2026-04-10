import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, Heart, TreePine, ShoppingCart } from "lucide-react";
import { calculateFoodMiles } from "@/lib/metrics";
import { ProductWithFarmer } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { CultivationMethod } from "@prisma/client";

const CULTIVATION_LABELS: Record<CultivationMethod, string> = {
  ORGANIC: "Organik",
  HYDROPONIC: "Hidroponik",
  CONVENTIONAL: "Konvensional",
  OTHER: "Lainnya",
};

const BUYER_LAT = 5.5483;
const BUYER_LON = 95.3238;

export default async function DashboardOverview() {
  const session = await auth();
  if (!session) return null;

  const [ordersCount, favorites, products, spending, itemsCount] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.favorite.count({ where: { userId: session.user.id } }),
    prisma.product.findMany({
      take: 4,
      where: { stock: { gt: 0 } },
      include: { farmer: { select: { id: true, name: true } } },
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
  ]);

  const totalSpent = spending._sum.total ?? 0;
  const totalBought = itemsCount._sum.quantity ?? 0;
  const userName = session.user.name?.split(" ")[0] ?? "Teman";

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto space-y-8">
      {/* Compact Hero */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative rounded-2xl p-7 overflow-hidden bg-emerald-600 text-white shadow-lg">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold tracking-tight">
              Halo, <span className="text-emerald-200">{userName}!</span>
            </h2>
            <p className="text-emerald-100/90 text-sm font-medium mt-1">
              Sudahkah Anda berbelanja sayur segar hari ini?
            </p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-2xl"></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[200px]">
           <div className="w-11 h-11 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-gray-900">5.2</span>
           </div>
           <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Jarak Terdekat</p>
              <p className="text-xs font-bold text-gray-800 mt-1">Sangat Dekat</p>
           </div>
        </div>
      </div>

      {/* Tighter Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pesanan", value: ordersCount.toString(), Icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Favorit", value: favorites.toString(), Icon: Heart, color: "text-red-500", bg: "bg-red-50" },
          { label: "Total Belanja", value: `Rp ${(totalSpent/1000).toFixed(0)}rb`, Icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pembelian", value: `${totalBought} Pack`, Icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color} shrink-0`}>
              <metric.Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">{metric.label}</p>
              <span className="text-sm font-black text-gray-900 leading-none">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Balanced 1-Row Recommendation Block */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
            Produk Terbaru
          </h3>
          <Link href="/dashboard/produk" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-200 pb-0.5">Lihat Semua</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="relative w-full aspect-[16/11] bg-gray-50 overflow-hidden">
                <Link href={`/dashboard/produk/${product.id}`}>
                  <Image 
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"} 
                    alt={product.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-all duration-300"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </Link>
                <div className="absolute top-2 left-2">
                  <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-md text-[8px] font-bold text-emerald-800 uppercase shadow-sm">
                    {CULTIVATION_LABELS[product.cultivationMethod]}
                  </span>
                </div>
              </div>
              <div className="p-3 flex flex-col flex-1">
                <Link href={`/dashboard/produk/${product.id}`} className="mb-2">
                  <h4 className="font-bold text-gray-900 text-[11px] truncate uppercase tracking-tight leading-none group-hover:text-emerald-600 transition-colors">{product.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1.5 opacity-70">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                    <p className="text-[9px] font-semibold text-gray-500 truncate">{product.farmer.name || "Petani"}</p>
                  </div>
                </Link>
                <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-0.5">Mulai Dari</p>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-black text-emerald-700">Rp {product.price.toLocaleString("id-ID")}</span>
                      <span className="text-[8px] font-bold text-gray-400">/{product.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
