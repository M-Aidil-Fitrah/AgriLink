"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";

const MAP_CENTER: [number, number] = [5.5483, 95.3238]; // Banda Aceh default

// Fix Leaflet default icon once, outside component
function fixLeafletIcon() {
  type DefaultIconPrototype = typeof L.Icon.Default.prototype & {
    _getIconUrl?: unknown;
  };
  delete (L.Icon.Default.prototype as DefaultIconPrototype)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function MapWidget() {
  const iconFixed = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<[number, number]>(MAP_CENTER);

  useEffect(() => {
    if (!iconFixed.current) {
      fixLeafletIcon();
      iconFixed.current = true;
    }

    // setMounted is valid here – it syncs client-only state post-hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.warn("Geolocation access denied. Using default Banda Aceh.");
        }
      );
    }
  }, []);

  if (!mounted)
    return (
      <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse text-gray-500 font-medium">
        Memuat Peta...
      </div>
    );

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 relative z-0">
      <MapContainer
        center={location}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[200px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={location}>
          <Popup className="font-sans">
            <span className="font-bold text-emerald-700">Lokasi Anda</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
