"use client";

import { useEffect, useState } from "react";
import { ProductCategory, CultivationMethod } from "@prisma/client";
import {
  getFreshnessScore,
  getFoodMilesImpact,
  calculateRoadDistance,
  CATEGORY_LABEL,
} from "@/lib/metrics";
import { FreshnessImpactReason } from "@/lib/types";
import { Leaf, MapPin, Truck, AlertCircle, CheckCircle2, Info, TrendingDown } from "lucide-react";

type Props = {
  harvestDate: Date | null;
  productCategory: ProductCategory;
  cultivationMethod: CultivationMethod;
  sellerLat: number | null;
  sellerLon: number | null;
};

function ReasonIcon({ type }: { type: FreshnessImpactReason["type"] }) {
  switch (type) {
    case "positive":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />;
    case "neutral":
      return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
    case "warning":
      return <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
    case "negative":
      return <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />;
  }
}

export function FreshnessSection({
  harvestDate,
  productCategory,
  cultivationMethod,
  sellerLat,
  sellerLon,
}: Props) {
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoadingDistance, setIsLoadingDistance] = useState(false);

  const freshness = getFreshnessScore(harvestDate, productCategory, cultivationMethod);
  const categoryLabel = CATEGORY_LABEL[productCategory];

  useEffect(() => {
    if (!sellerLat || !sellerLon) return;

    const resolveDistance = async () => {
      setIsLoadingDistance(true);
      try {
        if (!("geolocation" in navigator)) {
          setIsLoadingDistance(false);
          return;
        }

        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const dist = await calculateRoadDistance(
                  sellerLat,
                  sellerLon,
                  pos.coords.latitude,
                  pos.coords.longitude
                );
                setDistance(dist);
              } finally {
                setIsLoadingDistance(false);
                resolve();
              }
            },
            () => {
              setIsLoadingDistance(false);
              resolve();
            },
            { timeout: 5000 }
          );
        });
      } catch {
        setIsLoadingDistance(false);
      }
    };

    void resolveDistance();
  }, [sellerLat, sellerLon]);


  const impact =
    distance !== null
      ? getFoodMilesImpact(freshness.score, distance, productCategory, cultivationMethod)
      : null;

  return (
    <div className="space-y-4">
      {/* Base Freshness Score */}
      <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Freshness Score
              </p>
              <p className="text-[9px] font-bold text-gray-500">{categoryLabel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900 leading-none">
              {freshness.score}
              <span className="text-xs text-gray-400 font-bold">/100</span>
            </p>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${freshness.color}`}>
              {freshness.label}
            </span>
          </div>
        </div>

        {/* Score bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${
              freshness.score >= 65
                ? "bg-emerald-500"
                : freshness.score >= 40
                ? "bg-amber-500"
                : "bg-red-500"
            }`}
            style={{ width: `${freshness.score}%` }}
          />
        </div>

        {/* Base freshness reasons */}
        <div className="space-y-1.5">
          {freshness.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <ReasonIcon type={r.type} />
              <p className="text-[10px] font-medium text-gray-600 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Food Miles Impact — Estimasi Tiba */}
      {sellerLat && sellerLon && (
        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Estimasi Tiba Dalam Kondisi
              </p>
              {distance !== null && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-emerald-500" />
                  <p className="text-[9px] font-bold text-gray-500">
                    Jarak jalan nyata: {distance.toFixed(1)} km
                  </p>
                </div>
              )}
            </div>
          </div>

          {isLoadingDistance ? (
            <div className="flex items-center gap-2 py-2">
              <div className="w-4 h-4 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-[10px] font-medium text-gray-400">Menghitung jarak ke lokasi Anda...</p>
            </div>
          ) : impact !== null ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-500">Skor saat diterima (estimasi):</p>
                <div className="text-right">
                  <p className="text-xl font-black text-gray-900 leading-none">
                    {impact.estimatedScore}
                    <span className="text-xs text-gray-400 font-bold">/100</span>
                  </p>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${impact.estimatedColor}`}>
                    {impact.estimatedLabel}
                  </span>
                </div>
              </div>

              {/* Impact bar comparison */}
              <div className="mb-3 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-bold text-gray-400 w-24 shrink-0">Kondisi Sekarang</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${freshness.score}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-gray-600 w-8 text-right">{freshness.score}</span>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-bold text-gray-400 w-24 shrink-0">Estimasi Tiba</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${
                        impact.estimatedScore >= 65 ? "bg-emerald-500" : impact.estimatedScore >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${impact.estimatedScore}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-gray-600 w-8 text-right">{impact.estimatedScore}</span>
                </div>
              </div>

              {/* Dynamic impact reasons */}
              <div className="space-y-1.5">
                {impact.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Info className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-medium text-gray-600 leading-relaxed">{reason}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[10px] font-medium text-gray-400 py-1">
              Aktifkan GPS atau pastikan izin lokasi diberikan untuk melihat estimasi kondisi saat tiba.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
