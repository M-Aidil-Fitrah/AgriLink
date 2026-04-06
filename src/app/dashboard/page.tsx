import { auth } from "@/auth";
import { Package, Heart, TreePine, Star } from "lucide-react";
import { DynamicMap } from "@/components/dashboard/DynamicMap";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name?.split(" ")[0] || "Teman";

  return (
    <div className="p-8 pb-20">
      {/* Title Area */}
      <div className="mb-8 relative rounded-3xl p-8 overflow-hidden bg-emerald-900/5">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent to-emerald-100/50" />
        <h2 className="text-3xl font-extrabold text-gray-900 relative z-10">
          Selamat pagi, <span className="text-emerald-600">{userName}!</span>
        </h2>
        <p className="text-gray-500 mt-2 font-medium relative z-10 max-w-lg">
          Temukan produk segar langsung dari petani lokal, lebih dekat, lebih segar.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Pesanan Aktif", value: "2", sub: "Lihat pesanan", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Favorit", value: "8", sub: "Lihat favorit", icon: Heart, color: "text-red-500", bg: "bg-red-50" },
          { label: "Food Miles Rata-rata", value: "120 km", sub: "Dekat", icon: TreePine, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Skor Kesegaran Rata-rata", value: "4.6/5", sub: "Sangat Segar", icon: Star, color: "text-amber-500", bg: "bg-amber-50" }
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
        <div className="xl:col-span-2 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Rekomendasi Produk Segar</h3>
              <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Lihat semua</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Product Cards Mockup */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="w-full aspect-square bg-gray-100 rounded-xl mb-3 relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm">4.8</div>
                    <img src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=400&auto=format&fit=crop" alt="Sayuran" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Sayuran Segar</h4>
                  <p className="text-xs text-gray-500 mb-2">Petani Budi • Lembang</p>
                  <p className="text-sm font-extrabold text-emerald-700">Rp 16.000 <span className="text-[10px] text-gray-400 font-medium">/kg</span></p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex justify-between items-center text-center">
            <div>
               <h4 className="font-bold text-gray-900">Langsung dari Petani</h4>
               <p className="text-xs text-gray-500 mt-1">Tanpa perantara</p>
            </div>
            <div>
               <h4 className="font-bold text-gray-900">Transparan</h4>
               <p className="text-xs text-gray-500 mt-1">Lacak asal produk</p>
            </div>
            <div>
               <h4 className="font-bold text-gray-900">Lebih Segar</h4>
               <p className="text-xs text-gray-500 mt-1">Dipanen baru</p>
            </div>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-8">
           {/* Map Widget Mockup */}
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Peta Produk Terdekat</h3>
             </div>
             <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm relative overflow-hidden">
                <DynamicMap />
             </div>
           </div>

           {/* Food Miles Widget Mockup */}
           <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
             <h3 className="font-bold text-gray-900 mb-1">Food Miles Indicator</h3>
             <p className="text-xs text-gray-500 mb-6 font-medium">Rata-rata jarak produk</p>
             <div className="flex justify-center items-center">
                <div className="w-32 h-32 rounded-full border-[12px] border-emerald-500 border-b-emerald-100 flex items-center justify-center">
                   <div className="text-center">
                      <span className="text-xl font-extrabold text-gray-900 block">120 km</span>
                      <span className="text-[10px] font-bold text-emerald-600">Dekat</span>
                   </div>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
