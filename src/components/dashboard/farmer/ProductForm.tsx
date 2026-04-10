"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CultivationMethod, Product as PrismaProduct } from "@prisma/client";
import { createProduct, updateProduct, ProductInput } from "@/app/actions/productActions";

// Temporary type override until prisma generate is run locally
type Product = PrismaProduct & { images: string[] };
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type MapPickerProps = {
  initialLat?: number | null;
  initialLon?: number | null;
  onChange: (coords: { lat: number; lon: number }) => void;
};

const MapPicker = dynamic<MapPickerProps>(
  () => import("./MapPicker").then((mod) => mod.MapPicker as ComponentType<MapPickerProps>),
  { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400 uppercase tracking-widest">Memuat Peta...</div>
  }
);

const CULTIVATION_OPTIONS: { value: CultivationMethod; label: string }[] = [
  { value: "ORGANIC", label: "Organik" },
  { value: "HYDROPONIC", label: "Hidroponik" },
  { value: "CONVENTIONAL", label: "Konvensional" },
  { value: "OTHER", label: "Lainnya" },
];

const UNIT_OPTIONS = ["kg", "ikat", "buah", "liter", "pack", "gram"];

export function ProductForm({ product }: { product?: Product | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(product?.latitude ?? null);
  const [lon, setLon] = useState<number | null>(product?.longitude ?? null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  function handleMapChange({ lat, lon }: { lat: number; lon: number }) {
    setLat(lat);
    setLon(lon);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const input: ProductInput = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      images: images,
      unit: formData.get("unit") as string,
      harvestDate: formData.get("harvestDate") as string,
      cultivationMethod: formData.get("cultivationMethod") as CultivationMethod,
      origin: formData.get("origin") as string,
      latitude: lat,
      longitude: lon,
    };

    startTransition(async () => {
      const result = product
        ? await updateProduct(product.id, input)
        : await createProduct(input);

      if (!result.success) {
        setError(result.error);
      } else {
        router.push("/dashboard/farmer-produk");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="px-5 py-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-2xl">
          {error}
        </div>
      )}

      {/* Informasi Dasar */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 space-y-5">
        <h3 className="font-bold text-gray-900">Informasi Produk</h3>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Nama Produk</label>
          <input
            name="name"
            defaultValue={product?.name}
            required
            placeholder="Contoh: Bayam Organik Segar"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Deskripsi</label>
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            rows={3}
            placeholder="Jelaskan tentang produk Anda..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Harga (Rp)</label>
            <input
              name="price"
              type="number"
              min={0}
              defaultValue={product?.price}
              required
              placeholder="15000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Satuan</label>
            <select
              name="unit"
              defaultValue={product?.unit ?? "kg"}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-emerald-400"
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Stok</label>
            <input
              name="stock"
              type="number"
              min={0}
              defaultValue={product?.stock}
              required
              placeholder="100"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Tanggal Panen</label>
            <input
              name="harvestDate"
              type="date"
              defaultValue={
                product?.harvestDate
                  ? new Date(product.harvestDate).toISOString().split("T")[0]
                  : ""
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Metode Budidaya</label>
          <select
            name="cultivationMethod"
            defaultValue={product?.cultivationMethod ?? "CONVENTIONAL"}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-emerald-400"
          >
            {CULTIVATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Asal Daerah</label>
          <input
            name="origin"
            defaultValue={product?.origin ?? ""}
            placeholder="Contoh: Aceh Besar, Aceh"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <ImageUpload
          label="Foto Produk"
          hint="Maksimal 3 foto. Gunakan foto berkualitas tinggi (Maks 2MB per foto)"
          value={images}
          onChange={(val) => setImages(val as string[])}
          folder="products"
          maxImages={3}
        />
      </section>

      {/* Lokasi Kebun */}
      <section className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4">
        <div>
          <h3 className="font-bold text-gray-900">Lokasi Lahan</h3>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Tentukan koordinat kebun untuk kalkulasi Food Miles pembeli
          </p>
        </div>
        <MapPicker
          initialLat={lat}
          initialLon={lon}
          onChange={handleMapChange}
        />
      </section>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {product ? "Simpan Perubahan" : "Upload Produk"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
