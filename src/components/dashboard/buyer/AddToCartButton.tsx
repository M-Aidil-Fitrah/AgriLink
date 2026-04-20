"use client";

import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { useRouter } from "next/navigation";

/** Props for AddToCartButton — pass product-level data; CartItem.id will be assigned by the DB */
type AddToCartProps = Omit<CartItem, "id">;

export function AddToCartButton({ item }: { item: AddToCartProps }) {
  const { addItem, isAuthenticated } = useCart();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Silakan masuk/login untuk menambah ke keranjang.");
      router.push("/login");
      return;
    }

    // Optimistic id — server action will replace it with the real DB id
    addItem({ ...item, id: `optimistic-${item.productId}` });
    setAdded(true);
    toast.success(`${item.name} ditambahkan ke keranjang`);
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
