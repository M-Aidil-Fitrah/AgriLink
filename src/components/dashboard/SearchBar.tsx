"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, Store, Leaf, X, Loader2 } from "lucide-react";
import { searchProducts } from "@/app/actions/productActions";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SearchResult = Awaited<ReturnType<typeof searchProducts>>[number];

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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

  const handleSelect = useCallback((productId: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/dashboard/produk/${productId}`);
  }, [router]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <div className="relative group">
        <Search
          className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            isLoading
              ? "text-emerald-500"
              : "text-gray-400 group-focus-within:text-emerald-500"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Cari produk..."
          className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-2 focus:ring-emerald-50 text-gray-900 text-sm font-medium rounded-full pl-9 pr-8 py-2 outline-none transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
            aria-label="Hapus pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[260px]">
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                <div className="px-3 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  Hasil Pencarian
                </div>
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelect(product.id)}
                    className="w-full text-left flex items-center gap-3 p-2.5 hover:bg-emerald-50 rounded-xl transition-all group"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-5 h-5 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                          {product.name}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                          Rp {product.price.toLocaleString("id-ID")}/{product.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                        <div className="flex items-center gap-1 min-w-0">
                          <Store className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          <span className="truncate">
                            {product.farmer.sellerApplication?.businessName ||
                              product.farmer.name}
                          </span>
                        </div>
                        {product.origin && (
                          <div className="flex items-center gap-1 shrink-0">
                            <MapPin className="w-2.5 h-2.5 text-red-400" />
                            <span className="truncate max-w-[80px]">
                              {product.origin}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  Tidak ada hasil
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Coba kata kunci lain untuk &quot;{query}&quot;
                </p>
              </div>
            ) : null}
          </div>

          {results.length > 0 && (
            <div className="bg-gray-50 p-2 border-t border-gray-100">
              <Link
                href={`/dashboard/produk?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-white rounded-lg transition-all"
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
