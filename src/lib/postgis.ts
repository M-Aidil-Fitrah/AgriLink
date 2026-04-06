import { prisma } from "./prisma";
import { NearbyProductRow } from "./types";

/**
 * Cari produk terdekat menggunakan PostGIS ST_DWithin.
 * Fallback ke Haversine di lib/metrics.ts jika kolom 'geog' belum terisi.
 */
export async function findNearbyProducts(
  lat: number,
  lon: number,
  radiusKm: number = 100
): Promise<NearbyProductRow[]> {
  return prisma.$queryRaw<NearbyProductRow[]>`
    SELECT
      p.*,
      ROUND(
        (ST_Distance(
          p.geog,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
        ) / 1000)::numeric,
        1
      ) AS distance_km
    FROM "Product" p
    WHERE p.geog IS NOT NULL
      AND p.stock > 0
      AND ST_DWithin(
        p.geog,
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
        ${radiusKm * 1000}
      )
    ORDER BY distance_km ASC
    LIMIT 20
  `;
}

/**
 * Hitung rata-rata Food Miles semua produk ke lokasi pembeli.
 */
export async function getAverageFoodMilesPostGIS(
  lat: number,
  lon: number
): Promise<number> {
  const result = await prisma.$queryRaw<[{ avg_km: number }]>`
    SELECT
      COALESCE(
        ROUND(
          AVG(
            ST_Distance(
              p.geog,
              ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
            ) / 1000
          )::numeric,
          1
        ),
        0
      ) AS avg_km
    FROM "Product" p
    WHERE p.geog IS NOT NULL AND p.stock > 0
  `;
  return Number(result[0]?.avg_km ?? 0);
}
