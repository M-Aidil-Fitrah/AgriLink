import { ProductCategory, CultivationMethod } from "@prisma/client";
import { FoodMilesCategory, FreshnessResult, FreshnessImpactReason } from "./types";

// ─────────────────────────────────────────────────────────────
// FOOD MILES
// ─────────────────────────────────────────────────────────────

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
  const rawKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((rawKm * 1.23).toFixed(1));
}

/**
 * Menghitung jarak rute perjalanan nyata (jalan darat) menggunakan OSRM API.
 * Jika API gagal/rate-limit, akan fallback menggunakan faktor rute (Haversine * 1.23).
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
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) throw new Error("OSRM Rate limit or error");

    const data = await response.json() as {
      code: string;
      routes?: { distance: number }[];
    };
    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      throw new Error("No route found");
    }

    const distanceKm = data.routes[0].distance / 1000;
    return parseFloat(distanceKm.toFixed(1));
  } catch {
    return calculateFoodMiles(lat1, lon1, lat2, lon2);
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

// ─────────────────────────────────────────────────────────────
// SHELF LIFE PER KATEGORI (hari)
// ─────────────────────────────────────────────────────────────

const SHELF_LIFE_DAYS: Record<ProductCategory, number> = {
  LEAFY_GREEN: 4,       // Bayam, kangkung — sangat cepat layu
  FRUIT_SOFT: 6,        // Tomat, mangga, anggur, pepaya
  FRUIT_HARD: 14,       // Jeruk, semangka, apel
  ROOT_VEGETABLE: 21,   // Wortel, kentang, ubi, singkong
  GRAIN_DRY: 180,       // Beras, jagung, kacang kering
  HERB_SPICE: 10,       // Jahe, kunyit, cabai, daun bawang
  VEGETABLE_OTHER: 7,   // Fallback default
};

// ─────────────────────────────────────────────────────────────
// COMPOSITE FRESHNESS SCORE — ALGORITMA UTAMA
// ─────────────────────────────────────────────────────────────

/**
 * Hitung Composite Freshness Score.
 *
 * Formula:
 *   baseScore  = 100 × e^(-2.5 × t/T)       [Exponential decay]
 *   finalScore = clamp(baseScore + cultivationBonus, 0, 100)
 *
 * - t = hari sejak panen
 * - T = shelf life kategori (hari)
 * - Decay constant k=2.5  → produk turun cepat mendekati shelf life
 */
export function getFreshnessScore(
  harvestDate: Date | null,
  productCategory: ProductCategory = "VEGETABLE_OTHER",
  cultivationMethod: CultivationMethod = "CONVENTIONAL"
): FreshnessResult {
  if (!harvestDate) {
    return {
      score: 0,
      label: "Tidak Terverifikasi",
      color: "text-gray-500 bg-gray-50 border-gray-200",
      reasons: [
        {
          type: "warning" as const,
          text: "Tanggal panen belum dicatat oleh petani. Kesegaran tidak dapat diverifikasi.",
        },
      ],
    };
  }

  const today = new Date();
  const diffMs = today.getTime() - harvestDate.getTime();
  const daysSinceHarvest = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const shelfLifeDays = SHELF_LIFE_DAYS[productCategory];

  // Skor dasar: Exponential Decay
  const k = 2.5;
  const baseScore = 100 * Math.exp(-k * (daysSinceHarvest / shelfLifeDays));

  // Bonus metode budidaya
  const cultivationBonus = getCultivationBonus(cultivationMethod);

  const rawScore = baseScore + cultivationBonus;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Label & warna berdasarkan persentase dari shelf life
  const shelfLifeRatio = daysSinceHarvest / shelfLifeDays;

  let label: string;
  let color: string;

  if (score >= 85) {
    label = "Sangat Segar";
    color = "text-emerald-700 bg-emerald-100 border-emerald-300";
  } else if (score >= 65) {
    label = "Segar";
    color = "text-emerald-500 bg-emerald-50 border-emerald-200";
  } else if (score >= 40) {
    label = "Cukup Segar";
    color = "text-amber-600 bg-amber-50 border-amber-200";
  } else if (score > 0) {
    label = "Segera Dikonsumsi";
    color = "text-orange-600 bg-orange-50 border-orange-200";
  } else {
    label = "Melewati Batas Optimal";
    color = "text-red-600 bg-red-50 border-red-200";
  }

  const reasons = buildFreshnessReasons({
    daysSinceHarvest,
    shelfLifeDays,
    shelfLifeRatio,
    productCategory,
    cultivationMethod,
    score,
  });

  return { score, label, color, reasons };
}

// ─────────────────────────────────────────────────────────────
// DAMPAK FOOD MILES TERHADAP ESTIMASI KONDISI SAAT TIBA
// ─────────────────────────────────────────────────────────────

export type FoodMilesImpact = {
  estimatedScore: number;
  estimatedLabel: string;
  estimatedColor: string;
  reasons: string[];
};

/**
 * Menghitung estimasi skor kesegaran saat produk tiba di lokasi pembeli,
 * dengan memperhitungkan waktu perjalanan dari jarak distribusi.
 *
 * Asumsi kecepatan rata-rata logistik darat Indonesia: 40 km/jam.
 * Skor berkurang proporsional terhadap tambahan hari perjalanan estimasi.
 */
export function getFoodMilesImpact(
  baseFreshnessScore: number,
  distanceKm: number,
  productCategory: ProductCategory,
  cultivationMethod: CultivationMethod
): FoodMilesImpact {
  const reasons: string[] = [];

  // Estimasi waktu perjalanan dalam hari (kecepatan rerata logistik darat 40 km/jam)
  const travelHours = distanceKm / 40;
  const travelDays = travelHours / 24;

  const shelfLifeDays = SHELF_LIFE_DAYS[productCategory];

  // Penurunan skor akibat perjalanan: proporsional terhadap decay rate kategori
  const k = 2.5;
  // Rasio penurunan tambahan akibat travelDays terhadap shelf life
  const decayMultiplier = Math.exp(-k * (travelDays / shelfLifeDays));
  const estimatedRawScore = baseFreshnessScore * decayMultiplier;
  const estimatedScore = Math.min(100, Math.max(0, Math.round(estimatedRawScore)));

  const scoreDrop = baseFreshnessScore - estimatedScore;

  // Bangun alasan dinamis
  if (distanceKm > 100) {
    reasons.push(
      `Jarak distribusi ${distanceKm.toFixed(0)} km tergolong jauh dan berpotensi mengurangi kualitas produk secara signifikan selama pengiriman.`
    );
  } else if (distanceKm > 50) {
    reasons.push(
      `Jarak distribusi ${distanceKm.toFixed(0)} km memerlukan waktu pengiriman yang cukup lama dan dapat mempengaruhi kesegaran.`
    );
  } else if (distanceKm > 10) {
    reasons.push(
      `Jarak distribusi ${distanceKm.toFixed(0)} km masih dalam batas wajar, namun tetap ada penurunan kecil selama perjalanan.`
    );
  } else {
    reasons.push(
      `Jarak distribusi ${distanceKm.toFixed(0)} km sangat dekat. Produk diperkirakan tiba dalam kondisi optimal.`
    );
  }

  if (shelfLifeDays <= 4 && distanceKm > 30) {
    reasons.push(
      `Kategori produk ini memiliki masa simpan sangat pendek (${shelfLifeDays} hari). Pengiriman jarak jauh sangat tidak direkomendasikan.`
    );
  }

  if (
    (cultivationMethod === "CONVENTIONAL" || cultivationMethod === "OTHER") &&
    distanceKm > 50
  ) {
    reasons.push(
      `Metode budidaya konvensional dengan jarak jauh dapat mempercepat penurunan kualitas produk.`
    );
  }

  if (cultivationMethod === "ORGANIC" && distanceKm <= 50) {
    reasons.push(
      `Metode organik tanpa bahan pengawet kimia mempertahankan kualitas lebih baik pada distribusi jarak dekat.`
    );
  }

  if (cultivationMethod === "HYDROPONIC") {
    reasons.push(
      `Produk hidroponik umumnya memiliki kadar air lebih tinggi, sehingga lebih rentan terhadap kondisi pengiriman.`
    );
  }

  if (scoreDrop >= 20) {
    reasons.push(
      `Perkiraan penurunan skor cukup signifikan (${scoreDrop} poin) akibat kombinasi jarak dan karakteristik produk.`
    );
  } else if (scoreDrop >= 5) {
    reasons.push(
      `Penurunan skor estimasi ${scoreDrop} poin, masih dalam batas toleransi distribusi normal.`
    );
  }

  let estimatedLabel: string;
  let estimatedColor: string;

  if (estimatedScore >= 85) {
    estimatedLabel = "Sangat Segar";
    estimatedColor = "text-emerald-700 bg-emerald-100 border-emerald-300";
  } else if (estimatedScore >= 65) {
    estimatedLabel = "Segar";
    estimatedColor = "text-emerald-500 bg-emerald-50 border-emerald-200";
  } else if (estimatedScore >= 40) {
    estimatedLabel = "Cukup Segar";
    estimatedColor = "text-amber-600 bg-amber-50 border-amber-200";
  } else if (estimatedScore > 0) {
    estimatedLabel = "Segera Dikonsumsi";
    estimatedColor = "text-orange-600 bg-orange-50 border-orange-200";
  } else {
    estimatedLabel = "Melewati Batas Optimal";
    estimatedColor = "text-red-600 bg-red-50 border-red-200";
  }

  return { estimatedScore, estimatedLabel, estimatedColor, reasons };
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getCultivationBonus(method: CultivationMethod): number {
  switch (method) {
    case "ORGANIC":      return 5;
    case "HYDROPONIC":   return 2;
    case "CONVENTIONAL": return -3;
    case "OTHER":        return 0;
  }
}

function buildFreshnessReasons({
  daysSinceHarvest,
  shelfLifeDays,
  shelfLifeRatio,
  productCategory,
  cultivationMethod,
  score,
}: {
  daysSinceHarvest: number;
  shelfLifeDays: number;
  shelfLifeRatio: number;
  productCategory: ProductCategory;
  cultivationMethod: CultivationMethod;
  score: number;
}): FreshnessImpactReason[] {
  const reasons: FreshnessImpactReason[] = [];
  const categoryLabel = CATEGORY_LABEL[productCategory];

  // Alasan utama: usia panen
  if (daysSinceHarvest === 0) {
    reasons.push({ type: "positive", text: "Dipanen hari ini. Kualitas dan nutrisi berada di puncak tertinggi." });
  } else if (shelfLifeRatio < 0.3) {
    reasons.push({ type: "positive", text: `Dipanen ${daysSinceHarvest} hari lalu. Masih sangat jauh dari batas optimal untuk kategori ${categoryLabel} (${shelfLifeDays} hari).` });
  } else if (shelfLifeRatio < 0.6) {
    reasons.push({ type: "neutral", text: `Dipanen ${daysSinceHarvest} hari lalu. Kualitas masih baik, namun mulai mendekati pertengahan masa simpan untuk ${categoryLabel}.` });
  } else if (shelfLifeRatio < 0.9) {
    reasons.push({ type: "warning", text: `Dipanen ${daysSinceHarvest} hari lalu. Mendekati batas optimal konsumsi untuk kategori ${categoryLabel} (${shelfLifeDays} hari). Segera konsumsi setelah diterima.` });
  } else {
    reasons.push({ type: "negative", text: `Sudah dipanen ${daysSinceHarvest} hari lalu dan melewati batas optimal untuk ${categoryLabel}. Periksa kondisi fisik sebelum dikonsumsi.` });
  }

  // Alasan metode budidaya
  if (cultivationMethod === "ORGANIC") {
    reasons.push({ type: "positive", text: "Metode organik: bebas bahan kimia sintetis, mendukung kualitas nutrisi alami." });
  } else if (cultivationMethod === "HYDROPONIC") {
    reasons.push({ type: "positive", text: "Metode hidroponik: kondisi tumbuh terkontrol, kualitas seragam dan terstandarisasi." });
  } else if (cultivationMethod === "CONVENTIONAL") {
    reasons.push({ type: "neutral", text: "Metode konvensional dengan pupuk standar. Skor dikurangi sedikit karena potensi residu." });
  }

  // Alasan kategori
  if (shelfLifeDays <= 4 && score < 70) {
    reasons.push({ type: "warning", text: `Kategori sayuran daun sangat sensitif terhadap waktu. Konsumsi sesegera mungkin setelah diterima.` });
  }

  return reasons;
}

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  LEAFY_GREEN: "Sayuran Daun",
  FRUIT_SOFT: "Buah Lunak",
  FRUIT_HARD: "Buah Keras",
  ROOT_VEGETABLE: "Umbi & Akar",
  GRAIN_DRY: "Biji-bijian & Kering",
  HERB_SPICE: "Rempah & Bumbu",
  VEGETABLE_OTHER: "Sayuran Lainnya",
};

export { CATEGORY_LABEL };
