"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState, useMemo } from "react";
import { Maximize2, Minimize2, Navigation, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SellerLocation } from "@/lib/types";
import Link from "next/link";

const MAP_CENTER: [number, number] = [5.5483, 95.3238];

// Custom Icons
const createUserIcon = (): L.DivIcon => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative flex items-center justify-center p-4">
        <div class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40"></div>
        <div class="relative inline-flex h-5 w-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createFarmerIcon = (): L.DivIcon => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="relative flex flex-col items-center group transition-all duration-300">
        <div class="relative bg-emerald-600 text-white p-2 rounded-2xl shadow-xl border border-white/20 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
        </div>
        <div class="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 shadow-lg"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

export default function MapWidget({ markers = [] }: { markers?: SellerLocation[] }) {
  const iconFixed = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<[number, number]>(MAP_CENTER);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const userIcon = useMemo(() => createUserIcon(), []);
  const farmerIcon = useMemo(() => createFarmerIcon(), []);

  useEffect(() => {
    if (!iconFixed.current) {
      interface LeafletIconPrototype extends L.Icon.Default {
        _getIconUrl?: () => string;
      }
      const proto = L.Icon.Default.prototype as LeafletIconPrototype;
      delete proto._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      iconFixed.current = true;
    }

    const timeout = setTimeout(() => setMounted(true), 0);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => console.warn("Geolocation denied")
      );
    }
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted)
    return (
      <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center border border-slate-100">
        <span className="text-slate-400 font-medium">Inisialisasi Peta...</span>
      </div>
    );

  const mapContent = (
    <div className={`relative w-full h-full transition-all duration-500 overflow-hidden ${isFullscreen ? "" : "rounded-3xl shadow-xl"}`}>
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-6 right-6 z-1000 p-3 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl text-emerald-700 hover:bg-white transition-all border border-white hover:scale-105 active:scale-95"
        title={isFullscreen ? "Minimize" : "Full Screen"}
      >
        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
      </button>

      <MapContainer
        center={location}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User Location */}
        <Marker position={location} icon={userIcon}>
          <Popup closeButton={false} minWidth={180}>
            <div className="p-4 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Navigation className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Posisi Anda</p>
                  <p className="text-sm font-extrabold text-slate-800">Sedang Di Sini</p>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Seller Markers */}
        {markers.map((m) => (
          <Marker key={m.userId} position={[m.latitude, m.longitude]} icon={farmerIcon}>
            <Popup closeButton={false} minWidth={220}>
              <div className="overflow-hidden">
                <div className="bg-emerald-600 p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {m.businessType}
                    </span>
                  </div>
                  <h4 className="font-black text-base leading-tight mb-1">{m.businessName}</h4>
                  <p className="text-white/80 text-xs font-medium flex items-center gap-1">
                    <Store className="w-3 h-3" /> {m.mainCommodity}
                  </p>
                </div>

                <div className="p-4 bg-white">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">{m.businessAddress}</p>
                  <Link
                    href={`/dashboard/toko/${m.userId}`}
                    className="block w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors text-center"
                  >
                    Kunjungi Toko
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );

  return (
    <>
      <div className="w-full h-full">{mapContent}</div>
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-99999 bg-white flex flex-col"
          >
            <div className="flex-1">{mapContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
