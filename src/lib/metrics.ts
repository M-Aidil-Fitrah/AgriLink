import { FoodMilesCategory, FreshnessResult } from "./types";

/**
 * Haversine formula – menghitung jarak garis lurus dua titik dalam km.
 * Menggunakan circuity factor 1.23 sebagai estimasi koreksi jalan darat.
 * (rata-rata empiris jaringan jalan perkotaan Indonesia)
 */
export function calculateFoodMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  // Kalikan dengan circuity factor 1.23 untuk estimasi jarak via jalan
  const rawKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((rawKm * 1.23).toFixed(1));
}

/**
 * Menghitung jarak rute perjalanan nyata (jalan darat) menggunakan OSRM API.
 * Jika API gagal/rate-limit, akan fallback menggunakan faktor rute (Haversine * 1.35).
 */
export async function calculateRoadDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`,
      { next: { revalidate: 3600 } } // Cache 1 jam, cegah rate limit
    );
    if (!response.ok) throw new Error("OSRM Rate limit or error");
    
    const data = await response.json();
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }
    
    // Distance in meters, convert to KM with 1 decimal place
    const distanceKm = data.routes[0].distance / 1000;
    return parseFloat(distanceKm.toFixed(1));
  } catch (error) {
    // Fallback: calculateFoodMiles sudah menyertakan circuity factor 1.23
    const estimated = calculateFoodMiles(lat1, lon1, lat2, lon2);
    return estimated;
  }
}


/**
 * Klasifikasi jarak Food Miles.
 */
export function getFoodMilesCategory(distance: number): FoodMilesCategory {
  if (distance <= 10)
    return {
      label: "Sangat Dekat",
      color: "text-emerald-700 bg-emerald-100 border-emerald-300",
    };
  if (distance <= 50)
    return {
      label: "Dekat",
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    };
  if (distance <= 100)
    return {
      label: "Sedang",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    };
  return {
    label: "Jauh",
    color: "text-red-600 bg-red-50 border-red-200",
  };
}

/**
 * Hitung Freshness Score dari tanggal panen.
 * Depresiasi 10 poin per hari sejak panen.
 */
export function getFreshnessScore(harvestDate: Date | null): FreshnessResult {
  if (!harvestDate) {
    return {
      score: 0,
      label: "Tidak Diketahui",
      color: "text-gray-500 bg-gray-50 border-gray-200",
    };
  }
  const today = new Date();
  const diff = Math.max(
    0,
    Math.floor(
      (today.getTime() - harvestDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  const score = Math.max(0, 100 - diff * 10);

  if (score >= 90)
    return {
      score,
      label: "Sangat Segar",
      color: "text-emerald-700 bg-emerald-100 border-emerald-300",
    };
  if (score >= 70)
    return {
      score,
      label: "Segar",
      color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    };
  if (score >= 50)
    return {
      score,
      label: "Cukup Segar",
      color: "text-amber-600 bg-amber-50 border-amber-200",
    };
  return {
    score,
    label: "Kurang Segar",
    color: "text-red-500 bg-red-50 border-red-200",
  };
}
