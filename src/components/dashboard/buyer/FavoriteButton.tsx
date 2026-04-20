"use client";

import { useTransition, useOptimistic } from "react";
import { toggleFavorite } from "@/app/actions/favoriteActions";
import { Heart } from "lucide-react";
import { toast } from "react-hot-toast";

import { useRouter } from "next/navigation";

export function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: string;
  initialFavorited: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  // Optimistic UI for instant feedback
  const [optimisticFavorited, addOptimisticFavorite] = useOptimistic(
    initialFavorited,
    (state, newState: boolean) => newState
  );

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Start transition
    startTransition(async () => {
      // Toggle optimistically
      addOptimisticFavorite(!optimisticFavorited);
      
      const result = await toggleFavorite(productId);
      
      if (!result.success) {
        if (result.error === "Tidak terautentikasi") {
          toast.error("Silakan login untuk menambahkan favorit.");
          router.push("/login");
          return;
        }
        toast.error(result.error || "Gagal memperbarui favorit");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm transition-all border ${
        optimisticFavorited
          ? "bg-rose-500 text-white border-rose-500"
          : "bg-white/90 backdrop-blur-sm text-gray-400 border-gray-100 hover:text-rose-400"
      } ${isPending ? "opacity-70 scale-95" : "hover:scale-105 active:scale-95"}`}
    >
      <Heart 
        className={`w-3.5 h-3.5 transition-transform duration-300 ${isPending ? 'scale-110' : ''}`} 
        fill={optimisticFavorited ? "currentColor" : "none"} 
      />
    </button>
  );
}
