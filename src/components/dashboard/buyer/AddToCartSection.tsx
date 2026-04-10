"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductWithFarmer } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

export function AddToCartSection({ product }: { product: ProductWithFarmer }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = (redirect = false) => {
    if (product.stock === 0) return;
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
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-gray-100 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-7 h-7 flex items-center justify-center hover:text-emerald-600 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-10 text-center text-sm font-black text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-7 h-7 flex items-center justify-center hover:text-emerald-600 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
             Tersedia: <span className="text-gray-900">{product.stock} {product.unit}</span>
          </div>
        </div>
        
        <div className="text-right">
           <p className="text-[8px] font-bold text-gray-400 uppercase leading-none">Subtotal</p>
           <p className="text-xs font-black text-emerald-700 mt-1">Rp {(product.price * quantity).toLocaleString("id-ID")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => handleAddToCart(false)}
          disabled={isAdding || product.stock === 0}
          className="flex-1 relative h-10 bg-white border border-emerald-600 text-emerald-700 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-emerald-50 flex items-center justify-center gap-2 overflow-hidden group disabled:opacity-50 disabled:border-gray-200 disabled:text-gray-300"
        >
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-3 h-3 animate-spin" />
              </motion.div>
            ) : showSuccess ? (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Done
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5">
                <ShoppingCart className="w-3 h-3" />
                + Keranjang
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => handleAddToCart(true)}
          disabled={isAdding || product.stock === 0}
          className="flex-[1.5] h-10 bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none"
        >
          <CreditCard className="w-3 h-3" />
          Beli Sekarang
        </button>
      </div>
    </div>
  );
}
