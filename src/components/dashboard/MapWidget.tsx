"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Maximize2,
  Minimize2,
  Store,
  Search,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  ChevronLeft,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SellerLocation } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { calculateFoodMiles } from "@/lib/metrics";
import MarkerClusterGroup from "react-leaflet-cluster";

const MAP_CENTER: [number, number] = [5.5483, 95.3238];

const createClusterCustomIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  let size = "w-10 h-10";
  if (count > 10) size = "w-12 h-12";
  if (count > 50) size = "w-14 h-14";

  return L.divIcon({
    html: `
      <div class="${size} bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
        <div class="flex flex-col items-center">
          <span class="text-white text-[12px] font-black leading-none">${count}</span>
          <span class="text-white text-[6px] font-bold uppercase tracking-tighter opacity-80 leading-none mt-0.5">Toko</span>
        </div>
      </div>
    `,
    className: "custom-marker-cluster",
    iconSize: L.point(40, 40, true),
  });
};

const createModernMarker = (
  name: string,
  distance?: number,
  isSelected: boolean = false,
  isUser: boolean = false
): L.DivIcon => {
  const themeColor = isUser ? "bg-blue-600" : "bg-emerald-500";
  const borderColor = isUser
    ? "border-blue-200"
    : isSelected
      ? "border-emerald-500"
      : "border-emerald-100";
  const textColor = isUser ? "text-blue-900" : "text-emerald-900";

  const storeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>`;
  const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

  const distanceHtml =
    !isUser && distance !== undefined
      ? `<span class="text-[9px] font-bold text-emerald-600/70 leading-none truncate">${distance.toLocaleString("id-ID")} km</span>`
      : "";

  return L.divIcon({
    className: "modern-marker !overflow-visible",
    html: `
      <div class="relative flex flex-col items-center">
        <div class="flex items-center bg-white border-2 ${borderColor} p-0.5 rounded-full shadow-2xl transition-all duration-300">
          <div class="w-8 h-8 ${themeColor} rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
            ${isUser ? homeIcon : storeIcon}
          </div>
          <div class="${isUser ? "max-w-0 opacity-0 overflow-hidden" : "px-3 max-w-[200px] opacity-100"} flex flex-col min-w-0">
            <span class="text-[11px] font-black ${textColor} leading-none truncate tracking-tight uppercase">${name}</span>
            ${distanceHtml}
          </div>
        </div>
        <div class="w-3 h-3 bg-white border-b-2 border-r-2 ${borderColor} rotate-45 -mt-1.5 shadow-sm z-[-1]"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  });
};

const createUserIcon = (): L.DivIcon =>
  createModernMarker("LOKASI ANDA", undefined, false, true);

function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (isNaN(center[0]) || isNaN(center[1])) return;
    map.flyTo(center, zoom ?? map.getZoom(), {
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);
  return null;
}

type MarkerWithDistance = SellerLocation & { distance: number };

function StoreCard({
  m,
  isSelected,
  onSelect,
  getImageUrl,
}: {
  m: MarkerWithDistance;
  isSelected: boolean;
  onSelect: (store: SellerLocation) => void;
  getImageUrl: (path: string) => string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-3xl border transition-all cursor-pointer group relative ${
        isSelected
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-gray-50 hover:border-emerald-100 hover:bg-gray-50/50"
      }`}
      onClick={() => onSelect(m)}
    >
      <div className="flex gap-4">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100/50 shadow-sm">
          {m.businessPhotoUrl ? (
            <Image
              src={getImageUrl(m.businessPhotoUrl)}
              alt={m.businessName}
              fill
              sizes="56px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-emerald-200">
              <Store className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-black text-gray-900 text-[13px] leading-tight truncate uppercase tracking-tight">
            {m.businessName}
          </h4>
          <p className="text-[9px] font-bold text-gray-400 mt-1 flex items-center gap-1 uppercase truncate">
            <MapPin className="w-2 h-2" /> {m.businessAddress}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-gray-300 uppercase leading-none mb-1">
                Jarak
              </span>
              <span className="text-[10px] font-black text-emerald-600 tracking-tight">
                {m.distance} Km
              </span>
            </div>
            <div className="w-px h-5 bg-gray-100" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-gray-300 uppercase leading-none mb-1">
                Produk
              </span>
              <span className="text-[10px] font-black text-gray-800 tracking-tight">
                {m.productCount} Item
              </span>
            </div>
            {isSelected && (
              <ChevronRight className="ml-auto w-4 h-4 text-emerald-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MapWidget({ markers = [] }: { markers?: SellerLocation[] }) {
  const iconFixed = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>(MAP_CENTER);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MAP_CENTER);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "products" | "name">("distance");
  const [showFilters, setShowFilters] = useState(false);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedId(null);
    setSortBy("distance");
    setMapCenter(userLocation);
  }, [userLocation]);

  const getImageUrl = useCallback((path: string): string => {
    if (!path || path.startsWith("http")) return path;
    return `https://osfmxafgxfasdfjyqvgt.supabase.co/storage/v1/object/public/agrilink-uploads/${path}`;
  }, []);

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

    const timer = setTimeout(() => setMounted(true), 0);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(loc);
          setMapCenter(loc);
        },
        () => console.warn("Geolocation denied")
      );
    }

    return () => clearTimeout(timer);
  }, []);

  const filteredMarkers = useMemo((): MarkerWithDistance[] => {
    const result: MarkerWithDistance[] = markers
      .filter(
        (m) =>
          (m.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.mainCommodity.toLowerCase().includes(searchQuery.toLowerCase())) &&
          !isNaN(m.latitude) &&
          !isNaN(m.longitude)
      )
      .map((m) => ({
        ...m,
        distance: calculateFoodMiles(
          userLocation[0],
          userLocation[1],
          m.latitude,
          m.longitude
        ),
      }));

    if (sortBy === "distance") result.sort((a, b) => a.distance - b.distance);
    else if (sortBy === "products") result.sort((a, b) => b.productCount - a.productCount);
    else if (sortBy === "name") result.sort((a, b) => a.businessName.localeCompare(b.businessName));

    return result;
  }, [markers, searchQuery, userLocation, sortBy]);

  const hasInteraction = searchQuery.length > 0 || selectedId !== null;

  const displayList = useMemo((): MarkerWithDistance[] => {
    if (selectedId) return filteredMarkers.filter((m) => m.userId === selectedId);
    return filteredMarkers.slice(0, 5);
  }, [filteredMarkers, selectedId]);

  const handleStoreSelect = useCallback((store: SellerLocation) => {
    if (isNaN(store.latitude) || isNaN(store.longitude)) return;
    setSelectedId(store.userId);
    setMapCenter([store.latitude, store.longitude]);
  }, []);

  if (!mounted)
    return (
      <div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center border border-slate-100">
        <span className="text-slate-400 font-medium">Inisialisasi Peta...</span>
      </div>
    );

  const sidebar = (
    <AnimatePresence>
      {showSidebar && (
        <motion.div
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute inset-y-0 left-0 w-full max-w-[340px] sm:max-w-[380px] bg-white border-r border-gray-100 z-20 flex flex-col shadow-2xl"
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-gray-900 tracking-tight">
                  Sebaran Toko
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  {hasInteraction
                    ? `${displayList.length} dari ${filteredMarkers.length} Toko`
                    : `${filteredMarkers.length} Toko Ditemukan`}
                </p>
              </div>
              {/* Always-visible close button */}
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Tutup sidebar"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Cari toko atau produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
                {hasInteraction && (
                  <button
                    onClick={resetFilters}
                    className="px-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-1 group"
                    title="Reset Filter"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-[8px] font-black uppercase">Reset</span>
                      <span className="text-[8px] font-bold uppercase">filter</span>
                    </div>
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Urutkan:{" "}
                  {sortBy === "distance"
                    ? "Terdekat"
                    : sortBy === "products"
                      ? "Produk Terbanyak"
                      : "Nama A-Z"}
                </button>

                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl p-3 z-50 space-y-1"
                    >
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
                        Pilih Pengurutan
                      </p>
                      {(
                        [
                          { id: "distance", label: "Jarak Terdekat", icon: MapPin },
                          { id: "products", label: "Produk Terbanyak", icon: Store },
                          { id: "name", label: "Nama Toko (A-Z)", icon: ChevronRight },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setSortBy(opt.id);
                            setShowFilters(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all ${
                            sortBy === opt.id
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                              : "hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Store List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-10">
            {hasInteraction ? (
              <>
                {displayList.map((m) => (
                  <StoreCard
                    key={m.userId}
                    m={m}
                    isSelected={selectedId === m.userId}
                    onSelect={handleStoreSelect}
                    getImageUrl={getImageUrl}
                  />
                ))}
                {displayList.length === 0 && (
                  <div className="py-16 text-center opacity-50">
                    <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Toko tidak ditemukan
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center opacity-40 px-8">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-50/50">
                  <MapPin className="w-6 h-6" />
                </div>
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                  Cari nama toko atau produk untuk melihat daftar lokasi
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const mapContent = (
    <div className="relative w-full h-full flex overflow-hidden font-sans">
      {sidebar}

      {/* Open sidebar button — always visible when sidebar closed */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute left-4 top-4 z-10 p-2.5 bg-white shadow-xl rounded-2xl text-emerald-600 hover:text-emerald-700 border border-gray-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          aria-label="Buka daftar toko"
        >
          <div className="w-5 h-5 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Store className="w-3 h-3" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest pr-1 hidden sm:block">
            Daftar Toko
          </span>
          <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
        </button>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl text-gray-900 hover:text-emerald-600 transition-all border border-white hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest pr-1 hidden sm:block">
            {isFullscreen ? "Kecilkan" : "Layar Penuh"}
          </span>
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full z-0 font-sans"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapController center={mapCenter} />

          {!isNaN(userLocation[0]) && !isNaN(userLocation[1]) && (
            <Marker position={userLocation} icon={createUserIcon()} />
          )}

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            maxClusterRadius={60}
          >
            {filteredMarkers.map((m) => (
              <Marker
                key={m.userId}
                position={[m.latitude, m.longitude]}
                icon={createModernMarker(
                  m.businessName,
                  m.distance,
                  selectedId === m.userId
                )}
                eventHandlers={{
                  click: () => setSelectedId(m.userId),
                }}
              >
                <Popup closeButton={false} minWidth={280} className="modern-popup">
                  <div className="overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-28 h-28 sm:h-auto bg-emerald-50 shrink-0">
                      {m.businessPhotoUrl ? (
                        <Image
                          src={getImageUrl(m.businessPhotoUrl)}
                          alt={m.businessName}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                          <Store className="w-8 h-8 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="px-1.5 py-0.5 bg-emerald-100 rounded text-[6px] font-black text-emerald-700 uppercase tracking-widest">
                          {m.businessType}
                        </span>
                        <h4 className="font-black text-emerald-900 text-xs leading-tight uppercase tracking-tighter truncate mt-1">
                          {m.businessName}
                        </h4>
                        <p className="text-[8px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-tighter truncate mt-0.5">
                          <MapPin className="w-2 h-2" /> {m.businessAddress}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[8px] font-black text-emerald-600">
                          {m.productCount} Produk
                        </span>
                        <Link
                          href={`/dashboard/toko/${m.userId}`}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-emerald-700 transition-all flex items-center justify-center active:scale-95 shadow-md shadow-emerald-200"
                        >
                          LIHAT TOKO
                        </Link>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
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
            className="fixed inset-0 z-[99999] bg-white flex flex-col overflow-hidden"
          >
            <div className="flex-1">{mapContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
