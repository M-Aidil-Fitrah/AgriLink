"use client";

import { useCart, CartItem } from "@/context/CartContext";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

export function AddToCartButton({ item }: { item: CartItem }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`relative group flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all
        ${added 
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200'}
      `}
    >
      {added ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Ditambahkan
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          Beli
        </>
      )}
    </button>
  );
}
