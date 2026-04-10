import { ProductWithFarmer } from "@/lib/types";
import { ProductGallery } from "./ProductGallery";
import { AddToCartSection } from "./AddToCartSection";
import { ProductFarmerCard, ProductAttribute } from "./ProductInfoComponents";
import { Calendar, Leaf, Info, Star, ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getFreshnessScore } from "@/lib/metrics";
import React from "react";

export function ProductDetails({ product }: { product: ProductWithFarmer }) {
  const freshness = getFreshnessScore(product.harvestDate);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
      <Link 
        href="/dashboard/produk" 
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors mb-8 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Katalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Gallery */}
        <div className="space-y-8">
           <ProductGallery image={product.image} name={product.name} />
           <div className="bg-emerald-50/50 rounded-[32px] p-8 border border-emerald-100/50">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Info className="w-5 h-5" />
                 </div>
                 <h3 className="font-extrabold text-gray-900 text-lg">Deskripsi Produk</h3>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">
                {product.description || "Petani belum memberikan deskripsi lengkap untuk produk ini. Namun, kami menjamin kualitas dan kesegarannya karena dikirim langsung setelah masa panen."}
              </p>
           </div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
             <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                   {product.cultivationMethod.replace("_", " ")}
                </span>
                <div className="flex items-center gap-1 ml-2">
                   {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                   <span className="text-[10px] font-bold text-gray-400 ml-1">(4.8/5)</span>
                </div>
             </div>
             <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">{product.name}</h1>
             
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-emerald-700">Rp {product.price.toLocaleString("id-ID")}</span>
                <span className="text-lg font-bold text-gray-400">/ {product.unit}</span>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
             <ProductAttribute 
                icon={Calendar} 
                label="Masa Panen" 
                value={product.harvestDate ? new Date(product.harvestDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—"} 
                color="bg-blue-50 text-blue-600"
             />
             <ProductAttribute 
                icon={Leaf} 
                label="Kesegaran" 
                value={`${freshness.score}/100 (${freshness.label})`} 
                color="bg-amber-50 text-amber-600"
             />
          </div>

          <div className="mb-10">
             <AddToCartSection product={product} />
          </div>

          <div className="space-y-4">
             <h3 className="font-extrabold text-gray-900 text-lg">Informasi Penjual</h3>
             <ProductFarmerCard farmer={product.farmer} />
          </div>

          {/* Guarantee Section */}
          <div className="mt-10 p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center gap-5">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
             </div>
             <div>
                <p className="font-extrabold text-gray-900 leading-tight">Jaminan Kualitas AgriLink</p>
                <p className="text-sm text-gray-500 font-medium mt-1">Produk dikembalikan 100% jika tidak sesuai atau rusak.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
