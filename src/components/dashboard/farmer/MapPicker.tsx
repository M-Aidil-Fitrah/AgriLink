"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

type LatLon = { lat: number; lon: number };

export function MapPicker({
  initialLat,
  initialLon,
  onChange,
}: {
  initialLat?: number | null;
  initialLon?: number | null;
  onChange: (coords: LatLon) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<LatLon>({
    lat: initialLat ?? 5.5483,
    lon: initialLon ?? 95.3238,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      import("leaflet/dist/leaflet.css");

      // Fix default icon
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) return;

      // Clear any existing map
      mapRef.current.innerHTML = "";

      const map = L.map(mapRef.current).setView([coords.lat, coords.lon], 13);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap contributors",
        }
      ).addTo(map);

      const marker = L.marker([coords.lat, coords.lon], { draggable: true }).addTo(map);
      marker.bindPopup("Lokasi kebun Anda").openPopup();

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const newCoords = { lat: pos.lat, lon: pos.lng };
        setCoords(newCoords);
        onChange(newCoords);
      });

      map.on("click", (e: L.LeafletMouseEvent) => {
        const newCoords = { lat: e.latlng.lat, lon: e.latlng.lng };
        marker.setLatLng(e.latlng);
        setCoords(newCoords);
        onChange(newCoords);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
        <p className="text-gray-400 font-medium text-sm">Memuat peta...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={mapRef} className="w-full h-64 rounded-2xl overflow-hidden border border-gray-200" />
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
        <span>
          Klik peta atau seret penanda untuk menentukan lokasi lahan.{" "}
          <span className="font-bold text-gray-700">
            {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
          </span>
        </span>
      </div>
    </div>
  );
}
