import { MapPin, ShieldCheck, LucideIcon } from "lucide-react";
import { ProductWithFarmer } from "@/lib/types";

export function ProductFarmerCard({ farmer }: { farmer: ProductWithFarmer["farmer"] }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-base text-emerald-700 font-black border border-emerald-100">
          {farmer.name?.[0] || "P"}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{farmer.name}</h4>
          <div className="flex items-center gap-1.5 text-emerald-600">
             <ShieldCheck className="w-3 h-3" />
             <span className="text-[8px] uppercase font-black tracking-widest">Verified</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
          <MapPin className="w-3 h-3 text-emerald-500" />
          <span>Banda Aceh</span>
        </div>
        <button className="px-4 py-1.5 bg-gray-50 hover:bg-emerald-50 text-gray-800 hover:text-emerald-700 font-bold text-[10px] rounded-lg border border-transparent hover:border-emerald-100 transition-all">
          Lihat Toko
        </button>
      </div>
    </div>
  );
}

export function ProductAttribute({ icon: Icon, label, value, color }: { icon: LucideIcon, label: string, value: string, color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm grow">
      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none block">{label}</span>
        <p className="text-xs font-black text-gray-900 mt-1 leading-none">{value}</p>
      </div>
    </div>
  );
}
