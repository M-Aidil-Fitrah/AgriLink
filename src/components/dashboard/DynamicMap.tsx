"use client";

import dynamic from "next/dynamic";
import type { SellerLocation } from "@/lib/types";

const MapWidgetComponent = dynamic(() => import("@/components/dashboard/MapWidget"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 rounded-3xl flex items-center justify-center animate-pulse text-slate-400 font-bold border border-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Memuat Peta Interaktif...</span>
      </div>
    </div>
  ),
});

export function DynamicMap({ markers = [], isMapPage = false }: { markers?: SellerLocation[], isMapPage?: boolean }) {
  return <MapWidgetComponent markers={markers} isMapPage={isMapPage} />;
}
