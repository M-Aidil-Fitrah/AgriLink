"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Package, Leaf, ChevronRight, Search } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import { SellerWithProducts } from "@/lib/types";

interface Props {
  sellers: SellerWithProducts[];
}

export function TokoViewClient({ sellers }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredSellers = sellers.filter((s) =>
    s.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.businessAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mainCommodity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedSellers = filteredSellers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 pb-20 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Toko Petani</h2>
          <p className="text-sm text-gray-500 font-medium">
            {filteredSellers.length} toko dari mitra petani kami
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama toko, komoditas, atau alamat..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-xl text-sm font-bold text-gray-900 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {paginatedSellers.map((store) => (
          <Link
            key={store.userId}
            href={`/dashboard/toko/${store.userId}`}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Store Image */}
            <div className="relative w-full aspect-16/11 overflow-hidden bg-emerald-50">
              {store.businessPhotoUrl ? (
                <Image
                  src={store.businessPhotoUrl}
                  alt={store.businessName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-emerald-300" />
                </div>
              )}
              {/* Business type badge */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[9px] font-bold text-emerald-800 uppercase tracking-wider shadow-sm border border-emerald-50">
                  {store.businessType}
                </span>
              </div>
            </div>

            {/* Store Info */}
            <div className="p-3.5 flex flex-col flex-1">
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-emerald-600 transition-colors uppercase truncate tracking-tight">
                  {store.businessName}
                </h3>
                <div className="flex flex-col gap-1 mt-1.5 opacity-80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <p className="text-[10px] font-bold text-gray-700 truncate uppercase mt-0.5">
                      {store.mainCommodity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    <p className="text-[9px] font-bold truncate tracking-wide">
                      {store.businessAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Package className="w-3 h-3" />
                  <span className="text-[10px] font-bold">
                    {store.productCount} produk
                  </span>
                </div>
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredSellers.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Toko Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 max-w-md mt-1">Coba kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(filteredSellers.length / ITEMS_PER_PAGE)}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
