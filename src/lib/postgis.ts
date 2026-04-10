import { prisma } from "./prisma";
import { NearbyProductRow } from "./types";

interface RawNearbyProduct {
  id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
  unit: string;
  origin: string | null;
  latitude: number | null;
  longitude: number | null;
  harvestDate: Date | null;
  farmerName: string | null;
  distance: number;
}

/**
 * Cari produk terdekat menggunakan PostGIS ST_DWithin.
 * Mengambil data produk lengkap beserta nama petaninya.
 */
export async function findNearbyProducts(
  lat: number,
  lon: number,
  radiusKm: number = 100
): Promise<NearbyProductRow[]> {
  const products = await prisma.$queryRaw<RawNearbyProduct[]>`
    SELECT
      p.id,
      p.name,
      p.images,
      p.price,
      p.stock,
      p.unit,
      p.origin,
      p.latitude,
      p.longitude,
      p."harvestDate",
      u.name AS "farmerName",
      ROUND(
        (ST_Distance(
          p.geog,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography
        ) / 1000)::numeric,
        1
      ) AS distance
    FROM "Product" p
    LEFT JOIN "User" u ON p."farmerId" = u.id
    WHERE p.geog IS NOT NULL
      AND p.stock > 0
      AND ST_DWithin(
        p.geog,
        ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)::geography,
        ${radiusKm * 1000}
      )
    ORDER BY distance ASC
    LIMIT 20
  `;

  return products.map((p): NearbyProductRow => ({
    id: p.id,
    name: p.name,
    images: Array.isArray(p.images) ? p.images : [],
    price: Number(p.price),
    stock: p.stock,
    unit: p.unit,
    origin: p.origin,
    latitude: p.latitude,
    longitude: p.longitude,
    harvestDate: p.harvestDate ? p.harvestDate.toISOString() : null,
    farmerName: p.farmerName,
    distance: Number(p.distance)
  }));
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
