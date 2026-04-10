"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductWithFarmer } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export function AddToCartSection({ product }: { product: ProductWithFarmer }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = (redirect = false) => {
    setIsAdding(true);
    setTimeout(() => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        unit: product.unit,
        farmerId: product.farmerId,
        farmerName: product.farmer.name || "Petani Lokal",
        quantity: quantity,
      });
      setIsAdding(false);
      setShowSuccess(true);
      if (redirect) {
        router.push("/dashboard/checkout");
      } else {
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-16 text-center text-lg font-black text-gray-900">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm font-bold text-gray-400">
           Tersedia <span className="text-gray-900 font-extrabold">{product.stock} {product.unit}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => handleAddToCart(false)}
          disabled={isAdding || product.stock === 0}
          className="flex-1 relative h-16 bg-white border-2 border-emerald-600 text-emerald-700 rounded-3xl font-black text-lg transition-all hover:bg-emerald-50 flex items-center justify-center gap-3 overflow-hidden group"
        >
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div key="loading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Loader2 className="w-6 h-6 animate-spin" />
              </motion.div>
            ) : showSuccess ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Masuk Keranjang
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Tambah Keranjang
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => handleAddToCart(true)}
          disabled={isAdding || product.stock === 0}
          className="flex-1 h-16 bg-emerald-700 text-white rounded-3xl font-black text-lg hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
        >
          <CreditCard className="w-6 h-6" />
          Beli Sekarang
        </button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 text-emerald-800">
               <CheckCircle2 className="w-5 h-5 text-emerald-500" />
               <span className="text-sm font-bold">Berhasil masuk keranjang!</span>
            </div>
            <Link href="/dashboard/checkout" className="text-sm font-black text-emerald-700 hover:text-emerald-900 underline decoration-2 underline-offset-4">
               Ke Checkout
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
