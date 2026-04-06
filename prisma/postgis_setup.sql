-- ============================================================
-- AgriLink: PostGIS Setup for Supabase
-- Jalankan script ini di Supabase SQL Editor SETELAH migrate/db push
-- ============================================================

-- 1. Aktifkan ekstensi PostGIS (umumnya sudah aktif di Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tambahkan kolom geography ke tabel Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS geog geography(Point, 4326);

-- 3. Tambahkan kolom geography ke tabel Location
ALTER TABLE "Location" ADD COLUMN IF NOT EXISTS geog geography(Point, 4326);

-- 4. Tambahkan kolom geography untuk koordinat pengiriman di Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS delivery_geog geography(Point, 4326);

-- 5. Fungsi trigger untuk sinkronisasi lat/lon -> PostGIS geography (Product)
CREATE OR REPLACE FUNCTION sync_product_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geog = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Fungsi trigger untuk sinkronisasi lat/lon -> PostGIS geography (Location)
CREATE OR REPLACE FUNCTION sync_location_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geog = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geog = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Fungsi trigger untuk sinkronisasi koordinat pengiriman (Order)
CREATE OR REPLACE FUNCTION sync_order_delivery_geography()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."deliveryLat" IS NOT NULL AND NEW."deliveryLon" IS NOT NULL THEN
    NEW.delivery_geog = ST_SetSRID(ST_MakePoint(NEW."deliveryLon", NEW."deliveryLat"), 4326)::geography;
  ELSE
    NEW.delivery_geog = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Buat trigger untuk Product
DROP TRIGGER IF EXISTS product_geography_sync ON "Product";
CREATE TRIGGER product_geography_sync
  BEFORE INSERT OR UPDATE OF latitude, longitude ON "Product"
  FOR EACH ROW EXECUTE FUNCTION sync_product_geography();

-- 9. Buat trigger untuk Location
DROP TRIGGER IF EXISTS location_geography_sync ON "Location";
CREATE TRIGGER location_geography_sync
  BEFORE INSERT OR UPDATE OF latitude, longitude ON "Location"
  FOR EACH ROW EXECUTE FUNCTION sync_location_geography();

-- 10. Buat trigger untuk Order delivery
DROP TRIGGER IF EXISTS order_delivery_geography_sync ON "Order";
CREATE TRIGGER order_delivery_geography_sync
  BEFORE INSERT OR UPDATE OF "deliveryLat", "deliveryLon" ON "Order"
  FOR EACH ROW EXECUTE FUNCTION sync_order_delivery_geography();

-- 11. Sinkronisasi data yang sudah ada
UPDATE "Product"
SET geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

UPDATE "Location"
SET geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 12. Buat spatial index untuk performa query jarak
CREATE INDEX IF NOT EXISTS product_geog_idx ON "Product" USING GIST(geog);
CREATE INDEX IF NOT EXISTS location_geog_idx ON "Location" USING GIST(geog);
