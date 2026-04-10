import { MapPin, ShieldCheck, LucideIcon } from "lucide-react";
import { ProductWithFarmer } from "@/lib/types";

export function ProductFarmerCard({ farmer }: { farmer: ProductWithFarmer["farmer"] }) {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl text-emerald-700 font-bold border border-emerald-200">
          {farmer.name?.[0] || "P"}
        </div>
        <div>
          <h4 className="font-extrabold text-gray-900 text-lg line-clamp-1">{farmer.name}</h4>
          <div className="flex items-center gap-1.5 text-emerald-600">
             <ShieldCheck className="w-3.5 h-3.5" />
             <span className="text-[10px] uppercase font-black tracking-widest">Verified Seller</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
          <MapPin className="w-4 h-4 text-emerald-500" />
          <span>Banda Aceh, Indonesia</span>
        </div>
        <button className="w-full py-3 bg-gray-50 hover:bg-emerald-50 text-gray-900 hover:text-emerald-700 font-bold text-sm rounded-2xl transition-all border border-transparent hover:border-emerald-100">
          Kunjungi Toko
        </button>
      </div>
    </div>
  );
}

export function ProductAttribute({ icon: Icon, label, value, color }: { icon: LucideIcon, label: string, value: string, color: string }) {
  return (
    <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        <p className="text-sm font-extrabold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
