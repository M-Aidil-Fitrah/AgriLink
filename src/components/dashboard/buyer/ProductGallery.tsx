"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";

export function ProductGallery({ image, name }: { image: string | null; name: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-[40px] bg-gray-50 border border-gray-100 group">
      <motion.div 
        className="w-full h-full relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=800"}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 ease-out"
          style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Subtle Overlay Bloom */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>

      {/* Decorative Badges */}
      <div className="absolute top-8 left-8 flex flex-col gap-3">
         <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Stok Tersedia</span>
         </div>
      </div>
    </div>
  );
}
