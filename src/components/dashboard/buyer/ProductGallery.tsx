"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Fallback if no images
  const displayImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=800"];
  const activeImage = displayImages[activeIndex];

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  return (
    <div className="space-y-4">
      {/* Main Display - Compact Height */}
      <div className="relative aspect-square md:aspect-auto md:h-[400px] overflow-hidden rounded-[2.5rem] bg-gray-50 border border-gray-100 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full relative"
          >
            <Image
              src={activeImage}
              alt={name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {displayImages.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all text-gray-900 border border-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all text-gray-900 border border-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Fullscreen Trigger - Smaller */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 w-9 h-9 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-all text-gray-900 border border-white/20 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full">
          {displayImages.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} 
            />
          ))}
        </div>
      </div>

      {/* Thumbnails Row - Compact */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 px-1">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all
                ${idx === activeIndex ? 'border-emerald-500 shadow-sm transform -translate-y-0.5' : 'border-transparent opacity-60 hover:opacity-100'}
              `}
            >
              <Image src={img} alt={`${name} thumb ${idx}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 bg-black/95 flex items-center justify-center p-4 md:p-12"
          >
            <button
              onClick={() => { setIsFullscreen(false); setIsZoomed(false); }}
              className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10000"
            >
              <X className="w-6 h-6" />
            </button>

            <div className={`relative w-full h-full flex items-center justify-center overflow-auto cursor-zoom-in ${isZoomed ? 'cursor-zoom-out' : ''}`}>
              <motion.div
                layout
                onClick={() => setIsZoomed(!isZoomed)}
                className={`relative transition-all duration-500 ease-in-out ${isZoomed ? 'w-[150vw] md:w-[200vw] h-auto' : 'w-full h-full'}`}
              >
                <Image
                  src={activeImage}
                  alt={name}
                  fill={!isZoomed}
                  width={isZoomed ? 2400 : undefined}
                  height={isZoomed ? 2400 : undefined}
                  className={`object-contain transition-all ${isZoomed ? 'rounded-none' : 'rounded-3xl'}`}
                  quality={100}
                />
              </motion.div>
            </div>

            {/* Navigation in Fullscreen */}
            {!isZoomed && displayImages.length > 1 && (
              <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="w-16 h-16 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all pointer-events-auto"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="w-16 h-16 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all pointer-events-auto"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
