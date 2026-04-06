"use client";

import { useEffect, useState } from "react";
import { calculateFoodMiles, getFoodMilesCategory, getFreshnessScore } from "@/lib/metrics";
import { FoodMilesCategory, FreshnessResult } from "@/lib/types";
import { MapPin, Leaf, AlertCircle } from "lucide-react";
import Image from "next/image";

type ProductRow = {
  id: string;
  name: string;
  image: string | null;
  latitude: number | null;
  longitude: number | null;
  harvestDate: string | null;
  farmerName: string | null;
  origin: string | null;
};

type ProductWithMetrics = ProductRow & {
  distance: number | null;
  distanceCat: FoodMilesCategory | null;
  freshness: FreshnessResult;
};

export function JejakView({ products }: { products: ProductRow[] }) {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [computed, setComputed] = useState<ProductWithMetrics[]>([]);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserLat(5.5483);
       
      setUserLon(95.3238);
       
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

  useEffect(() => {
    if (userLat === null || userLon === null) return;

    const result: ProductWithMetrics[] = products.map((p) => {
      const distance =
        p.latitude != null && p.longitude != null
          ? calculateFoodMiles(p.latitude, p.longitude, userLat, userLon)
          : null;
      const distanceCat = distance !== null ? getFoodMilesCategory(distance) : null;
      const freshness = getFreshnessScore(p.harvestDate ? new Date(p.harvestDate) : null);
      return { ...p, distance, distanceCat, freshness };
    });

    result.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setComputed(result);
  }, [userLat, userLon, products]);

  const validDistances = computed
    .map((p) => p.distance)
    .filter((d): d is number => d !== null);
  const avgMiles =
    validDistances.length > 0
      ? Math.round(validDistances.reduce((a, b) => a + b, 0) / validDistances.length)
      : null;

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Jejak Produk</h2>
        <p className="text-gray-500 font-medium mt-1">
          Lacak jarak tempuh dan kesegaran produk dari lahan petani
        </p>
      </div>

      {locationError && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Akses lokasi ditolak. Menggunakan lokasi default Banda Aceh untuk kalkulasi.
        </div>
      )}

      {avgMiles !== null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 bg-white flex flex-col items-center justify-center shrink-0">
              <span className="text-xl font-black text-gray-900 leading-none">{avgMiles}</span>
              <span className="text-[10px] font-bold text-emerald-600">km</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Rata-rata Food Miles</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {getFoodMilesCategory(avgMiles).label}
              </p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-6">
            <Leaf className="w-6 h-6 text-emerald-500 mb-2" />
            <p className="font-bold text-gray-900 text-sm">Produk Dilacak</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{computed.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-6">
            <MapPin className="w-6 h-6 text-emerald-500 mb-2" />
            <p className="font-bold text-gray-900 text-sm">Produk dengan Lokasi</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{validDistances.length}</p>
          </div>
        </div>
      )}

      {computed.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-semibold text-lg">Memuat data jejak produk...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {computed.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-5 hover:shadow-sm transition-shadow"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                <Image
                  src={
                    p.image ||
                    "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"
                  }
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm truncate">{p.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.farmerName} · {p.origin || "Lokasi tidak diketahui"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {p.distance !== null && p.distanceCat ? (
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${p.distanceCat.color}`}
                  >
                    {p.distance} km · {p.distanceCat.label}
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold border text-gray-400 bg-gray-50 border-gray-200">
                    Lokasi tidak tersedia
                  </span>
                )}
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${p.freshness.color}`}
                >
                  {p.freshness.score}/100 · {p.freshness.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
