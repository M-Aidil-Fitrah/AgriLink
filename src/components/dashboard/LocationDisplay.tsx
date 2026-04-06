"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export function LocationDisplay() {
  const [locationName, setLocationName] = useState("Menunggu lokasi...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Public Reverse Geocoding API specifically customized for simple demo extraction
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`, {
              headers: {
                "Accept-Language": "id-ID"
              }
            });
            const data = await res.json();
            
            const shortLoc = data.address?.city || data.address?.town || data.address?.county || "Lokasi Ditemukan";
            setLocationName(`${shortLoc}, ID`);
          } catch (e) {
            setLocationName("Lokasi Aktif");
          }
        },
        () => {
          setLocationName("Jakarta, ID"); // Fallback
        }
      );
    } else {
      setLocationName("Jakarta, ID"); // Fallback
    }
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors" title="Lokasi terdeteksi untuk menampilkan rekomendasi terdekat">
      <MapPin className="w-4 h-4 text-emerald-600" />
      {locationName}
    </div>
  );
}
