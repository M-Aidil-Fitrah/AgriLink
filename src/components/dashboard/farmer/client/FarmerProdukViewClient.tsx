"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Search, Filter } from "lucide-react";
import { CultivationMethod, ProductCategory } from "@prisma/client";
import { DeleteProductButton } from "../DeleteProductButton";
import { Pagination } from "@/components/ui/Pagination";
import { CATEGORY_LABEL } from "@/lib/metrics";

const CULTIVATION_LABELS: Record<CultivationMethod, string> = {
  ORGANIC: "Organik",
  HYDROPONIC: "Hidroponik",
  CONVENTIONAL: "Konvensional",
  OTHER: "Lainnya",
};

interface ProductClient {
  id: string;
  name: string;
  images: string[];
  cultivationMethod: CultivationMethod;
  productCategory: ProductCategory;
  stock: number;
  unit: string;
  price: number;
  updatedAt: Date;
}

interface Props {
  products: ProductClient[];
}

export function FarmerProdukViewClient({ products }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCultivation, setSelectedCultivation] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.productCategory === selectedCategory;
    const matchesCultivation = selectedCultivation === "ALL" || p.cultivationMethod === selectedCultivation;
    
    return matchesSearch && matchesCategory && matchesCultivation;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 md:p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Etalase Sayur</h2>
          <p className="text-sm text-gray-500 font-medium">
            {filteredProducts.length} produk di katalog Anda
          </p>
        </div>
        <Link
          href="/dashboard/farmer-produk/tambah"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          TAMBAH PRODUK
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama produk Anda..."
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
          return (
            <div key={product.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex flex-col">
              <div className="relative w-full aspect-16/11 overflow-hidden">
                <Image
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=300"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-emerald-800 uppercase shadow-sm">
                    {CULTIVATION_LABELS[product.cultivationMethod]}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-white/50">
                    <p className="text-sm font-black text-gray-900 leading-none">{product.stock} {product.unit}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight uppercase truncate tracking-tight">
                    {product.name}
                  </h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-2">Update: {new Date(product.updatedAt).toLocaleDateString('id-ID')}</p>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-gray-300 uppercase leading-none mb-1">Harga</p>
                    <p className="text-sm font-black text-gray-900">Rp {product.price.toLocaleString("id-ID")}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dashboard/farmer-produk/${product.id}/edit`}
                      className="w-8 h-8 bg-gray-50 text-gray-400 flex items-center justify-center rounded-lg hover:bg-emerald-50 hover:text-emerald-600 border border-transparent hover:border-emerald-100 transition-all shadow-sm"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
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
            <p className="text-sm text-gray-500 max-w-md mt-1">Belum ada produk aktif atau coba sesuaikan kata kunci pencarian Anda.</p>
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
