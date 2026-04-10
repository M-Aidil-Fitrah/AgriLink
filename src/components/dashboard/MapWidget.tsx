"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, MapPin, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAP_CENTER: [number, number] = [5.5483, 95.3238];

type MapItem = {
    id: string;
    name?: string;
    latitude: number | null;
    longitude: number | null;
    price?: number;
    unit?: string;
    farmer?: { name: string | null };
};

export default function MapWidget({ markers = [] }: { markers?: MapItem[] }) {
  const iconFixed = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<[number, number]>(MAP_CENTER);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!iconFixed.current) {
      // Define internal interface for Leaflet private property workaround
      interface LeafletIconPrototype extends L.Icon.Default {
        _getIconUrl?: unknown;
      }
      
      delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
      
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      iconFixed.current = true;
    }
    
    const timeout = setTimeout(() => {
        setMounted(true);
    }, 0);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!mounted) return <div className="w-full h-full bg-gray-100 rounded-2xl animate-pulse" />;

  const mapContent = (
    <div className={`relative w-full h-full transition-all duration-500 overflow-hidden ${isFullscreen ? '' : 'rounded-2xl border border-gray-100'}`}>
        <button 
           onClick={toggleFullscreen}
           className="absolute top-4 right-4 z-999 p-2 bg-white/90 backdrop-blur shadow-lg rounded-xl text-emerald-700 hover:bg-white transition-all"
        >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <MapContainer
            center={location}
            zoom={13}
            scrollWheelZoom={true}
            className="w-full h-full"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* User Location */}
            <Marker position={location}>
                <Popup>
                    <div className="font-sans p-1">
                        <p className="font-bold text-emerald-800 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Lokasi Anda
                        </p>
                    </div>
                </Popup>
            </Marker>

            {/* Store/Farmer Markers */}
            {markers.filter(m => m.latitude && m.longitude).map(m => (
                <Marker key={m.id} position={[m.latitude!, m.longitude!]}>
                    <Popup maxWidth={200}>
                        <div className="font-sans p-1 space-y-2">
                           <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                <Store className="w-3 h-3" /> {m.farmer?.name || "Petani Lokal"}
                           </div>
                           <h4 className="font-extrabold text-gray-900 leading-tight">{m.name}</h4>
                           {m.price !== undefined && (
                             <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                                 <span className="text-sm font-black text-emerald-700">Rp {m.price.toLocaleString("id-ID")}</span>
                                 <span className="text-[10px] text-gray-400 font-bold">/{m.unit}</span>
                             </div>
                           )}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-99999 bg-white"
          >
            {mapContent}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
