"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Store, Leaf, X, Loader2 } from "lucide-react";
import { searchProducts } from "@/app/actions/productActions";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof searchProducts>>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchProducts(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (productId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/dashboard/produk/${productId}`);
  };

  return (
    <div className="w-full max-w-xl relative" ref={dropdownRef}>
      <div className="relative group">
        <Search className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLoading ? 'text-emerald-500' : 'text-gray-400 group-focus-within:text-emerald-500'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Cari produk segar, petani, atau lokasi..."
          className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 text-gray-900 text-sm font-medium rounded-full pl-12 pr-10 py-2.5 outline-none transition-all"
        />
        {query && (
          <button 
            onClick={() => { setQuery(""); setResults([]); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-height-[400px] overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hasil Pencarian</div>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.id)}
                    className="w-full text-left flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-xl transition-all group"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      {product.images?.[0] ? (
                        <Image 
                          src={product.images[0]} 
                          alt={product.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {product.name}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Rp {product.price.toLocaleString("id-ID")}/{product.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Store className="w-3 h-3 text-emerald-500" />
                          <span className="truncate">{product.farmer.sellerApplication?.businessName || product.farmer.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" />
                          <span className="truncate">{product.origin}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Tidak ada hasil ditemukan</p>
                <p className="text-xs text-gray-500 mt-1">Coba kata kunci lain untuk &quot;{query}&quot;</p>
              </div>
            ) : null}
          </div>
          
          {results.length > 0 && (
            <div className="bg-gray-50 p-2 border-t border-gray-100">
              <Link 
                href={`/dashboard/produk?q=${query}`}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-all"
              >
                Lihat Semua Hasil Untuk &quot;{query}&quot;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
