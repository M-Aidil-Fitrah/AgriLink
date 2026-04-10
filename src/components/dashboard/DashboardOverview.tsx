import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Package, Heart, TreePine, ShoppingCart } from "lucide-react";
import { DynamicMap } from "./DynamicMap";
import { calculateFoodMiles } from "@/lib/metrics";
import { ProductWithFarmer } from "@/lib/types";
import { getStoreLocations } from "@/app/actions/productActions";
import Image from "next/image";
import Link from "next/link";

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
    getStoreLocations()
  ]);

  const totalSpent = spending._sum.total ?? 0;
  const totalBought = itemsCount._sum.quantity ?? 0;
  const userName = session.user.name?.split(" ")[0] ?? "Teman";

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      {/* Compact Hero */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative rounded-2xl p-8 overflow-hidden bg-emerald-600 text-white shadow-lg">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold tracking-tight mb-1">
              Halo, <span className="text-emerald-200">{userName}!</span>
            </h2>
            <p className="text-emerald-100 text-sm font-medium opacity-90">
              Temukan hasil panen terbaik hari ini.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[220px]">
           <div className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center shrink-0">
              <span className="text-sm font-black text-gray-900 leading-none">5.2</span>
              <span className="text-[8px] font-black text-emerald-600 mt-0.5">KM</span>
           </div>
           <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Food Miles</p>
              <p className="text-xs font-bold text-gray-800">Sangat Dekat</p>
           </div>
        </div>
      </div>

      {/* Tighter Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pesanan", value: ordersCount.toString(), Icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Favorit", value: favorites.toString(), Icon: Heart, color: "text-red-500", bg: "bg-red-50" },
          { label: "Total Belanja", value: `Rp ${(totalSpent/1000).toFixed(0)}rb`, Icon: TreePine, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pembelian", value: `${totalBought} Pack`, Icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((metric) => (
          <div key={metric.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center ${metric.color} shrink-0`}>
              <metric.Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{metric.label}</p>
              <span className="text-base font-black text-gray-900 leading-none">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Rekomendasi</h3>
            <Link href="/dashboard/produk" className="text-xs font-bold text-emerald-600">Lokal</Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/dashboard/produk/${product.id}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="relative w-full aspect-[16/10] bg-gray-50 overflow-hidden">
                  <Image src={product.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"} alt={product.name} fill className="object-cover group-hover:scale-105 transition-all" />
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">{product.name}</h4>
                  <p className="text-[9px] text-gray-400 font-semibold uppercase mt-1">{product.farmer.name}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-black text-emerald-700">Rp {product.price.toLocaleString("id-ID")}</span>
                    <span className="text-[9px] text-gray-400">/ {product.unit}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Peta Petani</h3>
          <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm h-[400px] overflow-hidden">
            <div className="w-full h-full rounded-xl overflow-hidden relative border border-gray-50">
              <DynamicMap markers={storeLocations} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
