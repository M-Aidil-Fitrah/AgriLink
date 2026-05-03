"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CultivationMethod, ProductCategory } from "@prisma/client";
import { Search, Filter, MapPin } from "lucide-react";
import { FavoriteButton } from "./FavoriteButton";
import { BuyButtons } from "./BuyButtons";
import { CATEGORY_LABEL } from "@/lib/metrics";
import { Pagination } from "@/components/ui/Pagination";

const CULTIVATION_LABELS: Record<CultivationMethod, string> = {
  ORGANIC: "Organik",
  HYDROPONIC: "Hidroponik",
  CONVENTIONAL: "Konvensional",
  OTHER: "Lainnya",
};

type ProductClientType = {
  id: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
  unit: string;
  cultivationMethod: CultivationMethod;
  productCategory: ProductCategory;
  origin: string | null;
  farmer: {
    id: string;
    name: string | null;
    sellerApplication: {
      businessName: string;
      businessAddress: string;
    } | null;
  };
};

interface Props {
  products: ProductClientType[];
  favoritedIds: string[];
}

export function ProdukViewClient({ products, favoritedIds: initialFavorites }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCultivation, setSelectedCultivation] = useState<string>("ALL");
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const favoritedIdsSet = new Set(initialFavorites);

  const filteredProducts = products.filter((p) => {
    const businessName = p.farmer.sellerApplication?.businessName || p.farmer.name || "Petani";
    const location = p.origin || p.farmer.sellerApplication?.businessAddress || "";

    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "ALL" || p.productCategory === selectedCategory;
    const matchesCultivation = selectedCultivation === "ALL" || p.cultivationMethod === selectedCultivation;
    
    return matchesSearch && matchesCategory && matchesCultivation;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Katalog Produk</h2>
          <p className="text-sm text-gray-500 font-medium">
            {filteredProducts.length} produk dari mitra petani kami
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk, toko, atau lokasi..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-xl text-sm font-bold text-gray-900 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-xl text-[11px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCultivation}
              onChange={(e) => {
                setSelectedCultivation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-xl text-[11px] font-bold text-gray-900 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Budidaya</option>
              {Object.entries(CULTIVATION_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {paginatedProducts.map((product) => {
          const isFavorited = favoritedIdsSet.has(product.id);
          const businessName = product.farmer.sellerApplication?.businessName || product.farmer.name || "Petani";
          const location = product.origin || product.farmer.sellerApplication?.businessAddress || "Lokasi tidak diketahui";

          return (
            <div
              key={product.id}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative w-full aspect-16/11 overflow-hidden">
                <Link href={`/dashboard/produk/${product.id}`}>
                  <Image
                    src={
                      product.images[0] ||
                      "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"
                    }
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                </Link>
                <div className="absolute top-2 left-2 flex gap-1 items-start flex-col">
                  <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-emerald-800 uppercase tracking-wider shadow-sm border border-emerald-50">
                    {CULTIVATION_LABELS[product.cultivationMethod]}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <FavoriteButton productId={product.id} initialFavorited={isFavorited} />
                </div>
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                <Link href={`/dashboard/produk/${product.id}`} className="mb-3">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors uppercase truncate tracking-tight">
                    {product.name}
                  </h3>
                  <div className="flex flex-col gap-1 mt-1.5 opacity-80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                      <p className="text-[10px] font-bold text-gray-700 truncate uppercase mt-0.5">
                        {businessName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <p className="text-[9px] font-bold truncate tracking-wide">{location}</p>
                    </div>
                  </div>
                </Link>

                <div className="mt-auto pt-3 border-t border-gray-50 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mb-1">
                        Harga
                      </p>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-[13px] font-black text-emerald-700">
                          Rp {product.price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400">/ {product.unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  <BuyButtons
                    item={{
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      images: product.images,
                      unit: product.unit,
                      farmerId: product.farmer.id,
                      farmerName: businessName,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Produk Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1">Coba kata kunci atau kombinasi filter lain.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
