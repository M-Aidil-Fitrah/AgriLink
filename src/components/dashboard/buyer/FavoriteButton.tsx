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
      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all border ${
        initialFavorited
          ? "bg-red-500 text-white border-red-500"
          : "bg-white text-gray-400 border-gray-100 hover:text-red-400"
      } ${isPending ? "opacity-50" : ""}`}
    >
      <Heart className="w-4 h-4" fill={initialFavorited ? "currentColor" : "none"} />
    </button>
  );
}
