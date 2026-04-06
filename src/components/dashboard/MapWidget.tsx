"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

const MAP_CENTER: [number, number] = [-6.200000, 106.816666]; // Jakarta default

export default function MapWidget() {
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<[number, number]>(MAP_CENTER);

  useEffect(() => {
    setMounted(true);
    // Fix leaf icon issue in react-leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          console.warn("Geolocation access denied or failed. Using default.");
        }
      );
    }
  }, []);

  if (!mounted) return <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse text-gray-500 font-medium">Memuat Peta...</div>;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-100 relative z-0">
      <MapContainer center={location} zoom={13} scrollWheelZoom={false} className="w-full h-full min-h-[200px]">
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
