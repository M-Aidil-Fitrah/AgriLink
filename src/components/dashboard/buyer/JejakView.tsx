"use client";

import { useEffect, useState } from "react";
import {
  calculateRoadDistance,
  getFoodMilesCategory,
  getFreshnessScore,
  CATEGORY_LABEL,
} from "@/lib/metrics";
import { FoodMilesCategory, ProductRow } from "@/lib/types";
import { Leaf, MapPin, ArrowRight, Loader2, Star, Search, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";

type ProductWithMetrics = ProductRow & {
  distance: number | null;
  distanceCat: FoodMilesCategory | null;
  freshnessScore: number;
  freshnessLabel: string;
  freshnessColor: string;
};

export function JejakView({ products }: { products: ProductRow[] }) {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [computed, setComputed] = useState<ProductWithMetrics[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCultivation, setSelectedCultivation] = useState<string>("ALL");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setTimeout(() => {
        setUserLat(5.5483);
        setUserLon(95.3238);
      }, 0);
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
      }
    );
  }, []);

  useEffect(() => {
    async function calculateAllMetrics() {
      if (userLat === null || userLon === null || products.length === 0) return;

      setIsCalculating(true);
      const results = await Promise.all(
        products.map(async (p) => {
          let distance: number | null = null;
          if (p.sellerLat != null && p.sellerLon != null) {
            distance = await calculateRoadDistance(
              p.sellerLat,
              p.sellerLon,
              userLat,
              userLon
            );
          }

          const distanceCat =
            distance !== null ? getFoodMilesCategory(distance) : null;

          const harvestDate = p.harvestDate ? new Date(p.harvestDate) : null;
          const freshness = getFreshnessScore(
            harvestDate,
            p.productCategory,
            p.cultivationMethod
          );

          return {
            ...p,
            distance,
            distanceCat,
            freshnessScore: freshness.score,
            freshnessLabel: freshness.label,
            freshnessColor: freshness.color,
          };
        })
      );

      setComputed(
        results.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        })
      );
      setIsCalculating(false);
    }

    calculateAllMetrics();
  }, [userLat, userLon, products]);

  const filteredProducts = computed.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.farmerName && p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "ALL" || p.productCategory === selectedCategory;
    const matchesCultivation = selectedCultivation === "ALL" || p.cultivationMethod === selectedCultivation;
    
    return matchesSearch && matchesCategory && matchesCultivation;
  });

  const validDistances = filteredProducts
    .map((p) => p.distance)
    .filter((d): d is number => d !== null);

  const avgMiles =
    validDistances.length > 0
      ? parseFloat(
          (
            validDistances.reduce((a, b) => a + b, 0) / validDistances.length
          ).toFixed(1)
        )
      : null;

  const avgFreshness =
    filteredProducts.length > 0
      ? Math.round(
          filteredProducts.reduce((a, b) => a + b.freshnessScore, 0) / filteredProducts.length
        )
      : null;

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Traceability
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            Ditelusuri dari lahan petani ke lokasi Anda — Freshness Score berbasis kategori produk &amp; metode budidaya
          </p>
        </div>
        {isCalculating && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Menghitung Metrik...
            </span>
          </div>
        )}
      </div>

      {avgMiles !== null && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-2">
                Rerata Food Miles
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{avgMiles}</span>
                <span className="text-sm font-bold opacity-80">KM</span>
              </div>
            </div>
            <Leaf className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 rotate-12" />
          </div>

          {avgFreshness !== null && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                Rerata Freshness
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-xl font-black text-gray-900">{avgFreshness}</p>
                <span className="text-xs text-gray-400 font-bold">/100</span>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Menampilkan
            </p>
            <p className="text-xl font-black text-gray-900">{filteredProducts.length} <span className="text-sm text-gray-400">/ {products.length}</span></p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Terverifikasi GPS
            </p>
            <p className="text-xl font-black text-gray-900">
              {validDistances.length}
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama produk atau nama penanam..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-xl text-sm font-bold text-gray-900 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-xl text-[11px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Kategori</option>
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCultivation}
              onChange={(e) => {
                setSelectedCultivation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-xl text-[11px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Teknik Budidaya</option>
              <option value="ORGANIC">Organik</option>
              <option value="HYDROPONIC">Hidroponik</option>
              <option value="CONVENTIONAL">Konvensional</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((p) => (
          <div
            key={p.id}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col"
          >
            <div className="relative w-full aspect-16/11 bg-gray-100 overflow-hidden">
              <Image
                src={
                  p.images?.[0] ||
                  "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"
                }
                alt={p.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              {/* Freshness badge overlay */}
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[9px] font-black border ${p.freshnessColor} leading-none`}>
                {p.freshnessScore}/100
              </div>
            </div>

            <div className="p-3.5 flex flex-col flex-1">
              <div className="mb-3">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {CATEGORY_LABEL[p.productCategory]}
                </p>
                <h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">
                  {p.name}
                </h4>
                <div className="flex flex-col gap-1 mt-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate">
                      {p.origin || "Lokasi Petani"}
                    </p>
                  </div>
                  {p.distance !== null && (
                    <p className="text-[10px] text-emerald-600 font-bold">
                      {p.distance.toFixed(1).replace(".", ",")} km dari lokasi Anda
                    </p>
                  )}
                </div>
              </div>

              {/* Freshness label */}
              <div className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider mb-3 ${p.freshnessColor}`}>
                <div className="flex items-center gap-1">
                  <Star className="w-2.5 h-2.5" />
                  {p.freshnessLabel}
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-bold text-gray-300 uppercase leading-none mb-1">
                    Penanam
                  </p>
                  <p className="text-xs font-black text-gray-900 truncate">
                    {p.farmerName}
                  </p>
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
        {filteredProducts.length === 0 && !isCalculating && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Produk Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1">Coba sesuaikan kata kunci pencarian atau ganti filter kategori dan metode budidaya untuk menemukan produk.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
