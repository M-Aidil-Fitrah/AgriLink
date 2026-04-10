"use client";

import { useTransition } from "react";
import { toggleFavorite } from "@/app/actions/favoriteActions";
import { Heart } from "lucide-react";

export function FavoriteButton({
  productId,
  initialFavorited,
}: {
  productId: string;
  initialFavorited: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(() => {
      toggleFavorite(productId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm transition-all border ${
        initialFavorited
          ? "bg-rose-500 text-white border-rose-500"
          : "bg-white/90 backdrop-blur-sm text-gray-400 border-gray-100 hover:text-rose-400"
      } ${isPending ? "opacity-50 scale-95" : "hover:scale-105 active:scale-95"}`}
    >
      <Heart className="w-3.5 h-3.5" fill={initialFavorited ? "currentColor" : "none"} />
    </button>
  );
}
