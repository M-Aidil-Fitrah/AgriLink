import { ProductWithFarmer } from "@/lib/types";
import { ProductGallery } from "./ProductGallery";
import { AddToCartSection } from "./AddToCartSection";
import { ProductFarmerCard, ProductAttribute } from "./ProductInfoComponents";
import { FreshnessSection } from "./FreshnessSection";
import { Calendar, MapPin, Info, ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export function ProductDetails({ product }: { product: ProductWithFarmer }) {
  const harvestDate = product.harvestDate ? new Date(product.harvestDate) : null;

  const sellerLat = product.farmer.sellerApplication?.latitude ?? null;
  const sellerLon = product.farmer.sellerApplication?.longitude ?? null;

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-4 md:py-6 pb-20">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/produk"
        className="inline-flex items-center gap-1.5 text-[9px] font-black text-gray-400 hover:text-emerald-600 transition-all mb-4 tracking-widest uppercase"
      >
        <ChevronLeft className="w-3 h-3" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Gallery */}
        <div className="lg:col-span-5">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Right Col: All Info */}
        <div className="lg:col-span-7 flex flex-col pt-1">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
                {product.cultivationMethod.replace("_", " ")}
              </span>
              <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                Terverifikasi
              </span>
            </div>

            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-4 uppercase">
              {product.name}
            </h1>

            <div className="flex items-end gap-1.5">
              <div className="flex flex-col">
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Harga
                </p>
                <span className="text-2xl font-black text-emerald-700 leading-none">
                  Rp {product.price.toLocaleString("id-ID")}
                </span>
              </div>
              <span className="text-xs font-bold text-gray-400 mb-0.5 pb-0.5">
                / {product.unit}
              </span>
            </div>
          </div>

          {/* Compact Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <ProductAttribute
              icon={Calendar}
              label="Tanggal Panen"
              value={
                product.harvestDate
                  ? new Date(product.harvestDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Belum dicatat"
              }
              color="bg-white text-blue-600 border border-gray-50 shadow-sm"
            />
            <ProductAttribute
              icon={MapPin}
              label="Asal Daerah"
              value={
                product.farmer.sellerApplication?.businessAddress ||
                product.origin ||
                "—"
              }
              color="bg-white text-emerald-600 border border-gray-50 shadow-sm"
            />
          </div>

          <div className="mb-6">
            <AddToCartSection product={product} />
          </div>

          <div className="space-y-4">
            {/* Store Info */}
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <h3 className="font-bold text-gray-900 text-[10px] tracking-widest uppercase opacity-40 px-1">
                Dijual Oleh
              </h3>
              <ProductFarmerCard farmer={product.farmer} />
            </div>

            {/* Freshness + Food Miles Impact */}
            <div className="pt-4 border-t border-gray-50">
              <h3 className="font-bold text-gray-900 text-[10px] tracking-widest uppercase opacity-40 px-1 mb-3">
                Analisis Kesegaran
              </h3>
              <FreshnessSection
                harvestDate={harvestDate}
                productCategory={product.productCategory}
                cultivationMethod={product.cultivationMethod}
                sellerLat={sellerLat}
                sellerLon={sellerLon}
              />
            </div>

            {/* Description */}
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Info className="w-3 h-3" />
                </div>
                <h3 className="font-bold text-gray-900 text-[10px] tracking-tight uppercase">
                  Deskripsi Produk
                </h3>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed text-[11px]">
                {product.description ||
                  "Kualitas dan kesegaran dijamin karena dikirim langsung oleh petani lokal segera setelah masa panen berakhir."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
