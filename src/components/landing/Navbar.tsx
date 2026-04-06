"use client";

import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 transition-transform group-hover:rotate-12 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900 group-hover:text-emerald-700 transition-colors">
            Agrilink<span className="text-emerald-500">.</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <Link href="#misi" className="hover:text-emerald-600 transition-colors">Misi Kami</Link>
          <Link href="#katalog" className="hover:text-emerald-600 transition-colors">Katalog Hasil Bumi</Link>
          <Link href="#jejak" className="hover:text-emerald-600 transition-colors">Jejak Karbon</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:block px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">
            Masuk
          </Link>
          <Link href="/register" className="px-5 py-2.5 bg-gray-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Bergabung
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
