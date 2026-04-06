"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export function LocationDisplay() {
  const [locationName, setLocationName] = useState("Menunggu lokasi...");

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocationName("Banda Aceh, ID");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`,
            { headers: { "Accept-Language": "id-ID" } }
          );
          const data = (await res.json()) as {
            address?: {
              city?: string;
              town?: string;
              county?: string;
            };
          };
          const shortLoc =
            data.address?.city ||
            data.address?.town ||
            data.address?.county ||
            "Lokasi Ditemukan";
          setLocationName(`${shortLoc}, ID`);
        } catch {
          setLocationName("Lokasi Aktif");
        }
      },
      () => {
        setLocationName("Banda Aceh, ID");
      }
    );
  }, []);

  return (
    <div
      className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
      title="Lokasi terdeteksi untuk menampilkan rekomendasi terdekat"
    >
      <MapPin className="w-4 h-4 text-emerald-600" />
      {locationName}
    </div>
  );
}
