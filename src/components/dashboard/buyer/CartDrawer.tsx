"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart, X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-101 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">Keranjang Belanja</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{totalItems} Produk dipilih</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                  <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">Keranjang Kosong</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Mulai belanja produk segar langsung dari petani lokal.</p>
                  </div>
                  <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm shadow-sm hover:bg-emerald-700 transition-all">
                    Lihat Produk
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden relative shrink-0 border border-gray-100">
                      <Image 
                        src={item.image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">{item.farmerName}</p>
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.name}</h4>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-extrabold text-gray-900 mt-1">Rp {item.price.toLocaleString("id-ID")}<span className="text-[10px] text-gray-400 font-medium font-sans">/{item.unit}</span></p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs font-bold text-gray-400">Total: <span className="text-gray-900">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span></p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-xl font-extrabold text-emerald-700">Rp {totalPrice.toLocaleString("id-ID")}</span>
                </div>
                <Link
                  href="/dashboard/checkout"
                  onClick={onClose}
                  className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-[0.98]"
                >
                  Checkout Sekarang
                </Link>
                <p className="text-[10px] text-center text-gray-400 font-medium">Lanjutkan untuk memilih alamat pengiriman dan jasa kurir.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
