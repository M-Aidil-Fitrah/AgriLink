"use client";

import dynamic from "next/dynamic";

const MapWidgetComponent = dynamic(() => import("@/components/dashboard/MapWidget"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse text-gray-500 font-medium">
      Memuat Peta...
    </div>
  )
});

export function DynamicMap({ markers = [] }: { markers?: any[] }) {
  // We use any[] here to avoid circular dependencies with product types, 
  // but the underlying MapWidget handles the actual drawing.
  return <MapWidgetComponent markers={markers} />;
}
