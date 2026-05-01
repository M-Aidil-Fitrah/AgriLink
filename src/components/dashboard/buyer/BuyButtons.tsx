"use client";

import { useCart, type CartItem } from "@/context/CartContext";
import { Check, ShoppingCart, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { createPortal } from "react-dom";

type BuyButtonsProps = Omit<CartItem, "id">;

export function BuyButtons({ item }: { item: BuyButtonsProps }) {
  const { addItem, isAuthenticated } = useCart();
  const [added, setAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Silakan masuk/login untuk menambah ke keranjang.");
      router.push("/login");
      return;
    }

    addItem({ ...item, id: `optimistic-${item.productId}` });
    setAdded(true);
    toast.success(`${item.name} ditambahkan ke keranjang`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Silakan masuk/login untuk membeli.");
      router.push("/login");
      return;
    }
    setShowModal(true);
  };

  const proceedToCheckout = () => {
    router.push(`/checkout?productId=${item.productId}&quantity=${quantity}`);
  };

  const getImageUrl = (path: string | undefined): string => {
    if (!path) return "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200";
    if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("/")) return path;
    return `https://osfmxafgxfasdfjyqvgt.supabase.co/storage/v1/object/public/agrilink-uploads/${path}`;
  };

  // Quick Buy Modal Component to be Portaled
  const modalContent = (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Ringkasan Beli</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl overflow-hidden relative border border-gray-100 shrink-0">
                  <Image 
                    src={getImageUrl(item.images?.[0])} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5 truncate">{item.farmerName}</p>
                  <h4 className="font-bold text-gray-900 text-sm truncate uppercase mb-1">{item.name}</h4>
                  <p className="text-xs font-bold text-gray-400">Rp {item.price.toLocaleString("id-ID")}/{item.unit}</p>
                </div>
              </div>

              <div className="space-y-4 bg-gray-50 p-4 rounded-2xl mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Jumlah</span>
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-3 h-3 text-gray-900" />
                    </button>
                    <span className="w-10 text-center text-sm font-black text-gray-900 tabular-nums">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-gray-900" />
                    </button>
                  </div>
                </div>
                <div className="h-px bg-gray-200 w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Total Harga</span>
                  <span className="text-base font-black text-emerald-700">Rp {(item.price * quantity).toLocaleString("id-ID")}</span>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]"
              >
                Lanjut Checkout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div className="flex items-center gap-1.5 w-full">
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 h-9 rounded-lg font-black text-[10px] transition-all shadow-sm shadow-emerald-200 uppercase tracking-widest"
        >
          Beli Sekarang
        </button>
        
        <button
          onClick={handleAddToCart}
          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all border
            ${added 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
              : 'bg-white text-emerald-600 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50'}
          `}
          title="Tambah ke Keranjang"
        >
          {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
        </button>
      </div>

      {typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
