"use client";

import { useEffect, useState, useMemo } from "react";
import { calculateFoodMiles, getFoodMilesCategory } from "@/lib/metrics";
import { FoodMilesCategory, ProductRow } from "@/lib/types";
import { MapPin, Leaf, AlertCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ProductWithMetrics = ProductRow & {
  distance: number | null;
  distanceCat: FoodMilesCategory | null;
};

export function JejakView({ products }: { products: ProductRow[] }) {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserLat(5.5483);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserLon(95.3238);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
      },
      () => {
        setUserLat(5.5483);
        setUserLon(95.3238);
        setLocationError(true);
      }
    );
  }, []);

  const computed = useMemo(() => {
    if (userLat === null || userLon === null) return [];

    const result: ProductWithMetrics[] = products.map((p) => {
      const distance =
        p.latitude != null && p.longitude != null
          ? calculateFoodMiles(p.latitude, p.longitude, userLat, userLon)
          : null;
      const distanceCat = distance !== null ? getFoodMilesCategory(distance) : null;
      return { ...p, distance, distanceCat };
    });

    return result.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });
  }, [userLat, userLon, products]);

  const validDistances = computed
    .map((p) => p.distance)
    .filter((d): d is number => d !== null);
  const avgMiles =
    validDistances.length > 0
      ? Math.round(validDistances.reduce((a, b) => a + b, 0) / validDistances.length)
      : null;

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Traceability</h2>
        <p className="text-sm text-gray-400 font-medium">
          Ditelusuri dari lahan petani ke lokasi Anda
        </p>
      </div>

      {avgMiles !== null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">Rerata Food Miles</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-3xl font-black">{avgMiles}</span>
                 <span className="text-sm font-bold opacity-80">KM</span>
               </div>
             </div>
             <Leaf className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 rotate-12" />
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Produk</p>
             <p className="text-xl font-black text-gray-900">{computed.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Terverifikasi GPS</p>
             <p className="text-xl font-black text-gray-900">{validDistances.length}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {computed.map((p) => (
          <div key={p.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
            <div className="relative w-full aspect-[16/11] bg-gray-100 overflow-hidden">
              <Image src={p.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" />
              {p.distance !== null && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-lg text-[9px] font-black text-white shadow-sm border border-white/20 uppercase">
                    {p.distance} KM
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 flex flex-col flex-1">
              <div className="mb-4">
                <h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">{p.name}</h4>
                <div className="flex items-center gap-1.5 mt-1.5">
                   <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                   <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{p.origin || "Lokasi Petani"}</p>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-bold text-gray-300 uppercase leading-none mb-1">Penanam</p>
                  <p className="text-xs font-black text-gray-900 truncate">{p.farmerName}</p>
                </div>
                <Link 
                  href={`/dashboard/produk/${p.id}`}
                  className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
