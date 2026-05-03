"use client";

import React, { useState, useMemo } from "react";
import { useCart, type CartItem } from "@/context/CartContext";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Store,
  ArrowRight,
  Check,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoreGroup = {
  farmerId: string;
  farmerName: string;
  items: CartItem[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getImageUrl(path: string | undefined): string {
  if (!path) return "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200";
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("/")) return path;
  return `https://osfmxafgxfasdfjyqvgt.supabase.co/storage/v1/object/public/agrilink-uploads/${path}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    removeItem,
    removeItems,
    updateQuantity,
    isCartOpen,
    closeCart,
    isLoading,
  } = useCart();

  // Track selected cart item IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Group items by farmer/store
  const storeGroups = useMemo<StoreGroup[]>(() => {
    const map = new Map<string, StoreGroup>();
    for (const item of items) {
      const existing = map.get(item.farmerId);
      if (existing) {
        existing.items.push(item);
      } else {
        map.set(item.farmerId, {
          farmerId: item.farmerId,
          farmerName: item.farmerName,
          items: [item],
        });
      }
    }
    return Array.from(map.values());
  }, [items]);

  // Sync selection: remove IDs that no longer exist in items
  const validIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const syncedSelectedIds = useMemo(
    () => new Set([...selectedIds].filter((id) => validIds.has(id))),
    [selectedIds, validIds]
  );

  const selectedItems = useMemo(
    () => items.filter((i) => syncedSelectedIds.has(i.id)),
    [items, syncedSelectedIds]
  );

  const selectedTotal = useMemo(
    () => selectedItems.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [selectedItems]
  );

  const selectedCount = useMemo(
    () => selectedItems.reduce((acc, i) => acc + i.quantity, 0),
    [selectedItems]
  );

  // ── Selection helpers ──────────────────────────────────────────────────────

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStore = (group: StoreGroup) => {
    const allSelected = group.items.every((i) => syncedSelectedIds.has(i.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        group.items.forEach((i) => next.delete(i.id));
      } else {
        group.items.forEach((i) => next.add(i.id));
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (syncedSelectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  // ── Checkout ───────────────────────────────────────────────────────────────

  const handleCheckout = () => {
    if (syncedSelectedIds.size === 0) {
      toast.error("Pilih minimal 1 produk untuk checkout.");
      return;
    }

    // Pass checkout items to sessionStorage so CheckoutView has them even after they are deleted from cart
    const itemsToCheckout = items.filter(i => syncedSelectedIds.has(i.id));
    sessionStorage.setItem("agrilink_checkout_items", JSON.stringify(itemsToCheckout));

    // Delete them immediately from cart DB as requested by user
    removeItems(Array.from(syncedSelectedIds));

    const params = new URLSearchParams({
      fromCart: "true",
      checkoutSession: "true"
    });

    closeCart();
    router.push(`/checkout?${params.toString()}`);
  };

  // ── Delete selected ────────────────────────────────────────────────────────

  const handleDeleteSelected = () => {
    if (syncedSelectedIds.size === 0) return;
    removeItems([...syncedSelectedIds]);
    setSelectedIds(new Set());
    toast.success(`${syncedSelectedIds.size} produk dihapus dari keranjang.`);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AnimatePresence>
      {/* Backdrop */}
      {isCartOpen && (
        <motion.div
          key="cart-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99998]"
        />
      )}

      {/* Drawer */}
      {isCartOpen && (
        <motion.div
          key="cart-drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[99999] flex flex-col"
        >
          {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">Keranjang Belanja</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {items.length} Produk · {storeGroups.length} Toko
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading && items.length === 0 ? (
                /* Loading skeleton */
                <div className="flex flex-col items-center justify-center h-full gap-4 py-20 px-6">
                  <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-gray-400">Memuat keranjang...</p>
                </div>
              ) : items.length === 0 ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20 px-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">Keranjang Kosong</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-[200px]">
                      Mulai belanja produk segar langsung dari petani lokal.
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-emerald-700 transition-all"
                  >
                    Lihat Produk
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-1">

                  {/* Select All row */}
                  <div className="flex items-center justify-between px-2 py-3 mb-2">
                    <button
                      onClick={toggleAll}
                      className="flex items-center gap-2.5 text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
                    >
                      {/* Checkbox without partial state to strictly function as Select All */}
                      <CheckboxIcon 
                        checked={syncedSelectedIds.size === items.length && items.length > 0} 
                        partial={false} 
                      />
                      Pilih Semua ({items.length})
                    </button>
                    {syncedSelectedIds.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus ({syncedSelectedIds.size})
                      </button>
                    )}
                  </div>

                  {/* Store groups */}
                  {storeGroups.map((group) => {
                    const allSelected = group.items.every((i) => syncedSelectedIds.has(i.id));
                    const someSelected = group.items.some((i) => syncedSelectedIds.has(i.id));
                    return (
                      <div key={group.farmerId} className="mb-4 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                        {/* Store header */}
                        <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <button onClick={() => toggleStore(group)} className="shrink-0">
                            <CheckboxIcon checked={allSelected} partial={!allSelected && someSelected} />
                          </button>
                          <Store className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider truncate">
                            {group.farmerName}
                          </span>
                        </div>

                        {/* Items in this store */}
                        <div className="divide-y divide-gray-50">
                          {group.items.map((item) => {
                            const isChecked = syncedSelectedIds.has(item.id);
                            return (
                              <div
                                key={item.id}
                                className={`flex gap-3 p-4 transition-colors ${isChecked ? "bg-emerald-50/40" : "bg-white"}`}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className="shrink-0 mt-1"
                                >
                                  <CheckboxIcon checked={isChecked} partial={false} />
                                </button>

                                {/* Image */}
                                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative shrink-0 border border-gray-100">
                                  <Image
                                    src={getImageUrl(item.images?.[0])}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-1">
                                    <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">
                                      {item.name}
                                    </h4>
                                    <button
                                      onClick={() => {
                                        removeItem(item.id);
                                        setSelectedIds((prev) => {
                                          const next = new Set(prev);
                                          next.delete(item.id);
                                          return next;
                                        });
                                      }}
                                      className="text-gray-300 hover:text-red-500 transition-colors p-0.5 shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <p className="text-xs font-bold text-emerald-700 mt-1">
                                    Rp {item.price.toLocaleString("id-ID")}
                                    <span className="text-gray-400 font-normal">/{item.unit}</span>
                                  </p>

                                  <div className="flex items-center justify-between mt-2">
                                    {/* Quantity controls */}
                                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100">
                                      <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-l-lg transition-all text-gray-500"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-8 text-center text-xs font-bold text-gray-900 tabular-nums">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-r-lg transition-all text-gray-500"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <p className="text-xs font-bold text-gray-700">
                                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer — only when there are items */}
            {items.length > 0 && (
              <div className="p-5 border-t border-gray-100 bg-white shrink-0 space-y-3">
                {/* Summary */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Total Dipilih ({selectedCount} item)
                    </p>
                    <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
                      {syncedSelectedIds.size > 0
                        ? `Rp ${selectedTotal.toLocaleString("id-ID")}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={syncedSelectedIds.size === 0 || isLoading}
                  className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout ({syncedSelectedIds.size} dipilih)
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-gray-400 font-medium">
                  Pilih produk lalu lanjutkan ke pengiriman & pembayaran.
                </p>
              </div>
            )}
          </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Shared Checkbox Icon ─────────────────────────────────────────────────────

function CheckboxIcon({ checked, partial }: { checked: boolean; partial: boolean }) {
  if (checked) {
    return (
      <span className="w-5 h-5 rounded-md bg-emerald-600 border-2 border-emerald-600 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
    );
  }
  if (partial) {
    return (
      <span className="w-5 h-5 rounded-md bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shrink-0">
        <span className="w-2 h-0.5 bg-emerald-600 rounded-full" />
      </span>
    );
  }
  return (
    <span className="w-5 h-5 rounded-md border-2 border-gray-300 bg-white flex shrink-0" />
  );
}
