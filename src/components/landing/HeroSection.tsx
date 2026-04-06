"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Sprout, HandHeart, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <section className="relative w-full min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden bg-gray-50">
      {/* Decorative gradient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/50 mix-blend-multiply blur-3xl opacity-70 animate-pulse" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-300/40 mix-blend-multiply blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start text-left"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 shadow-sm text-sm font-bold text-emerald-700 mb-6">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Transparansi Pangan Dimulai di Sini
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Pangan Sehat <br/> <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">Langsung dari Sumbernya.</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed font-medium">
            Jembatani meja makan Anda dengan kebun petani lokal. Nikmati produk pangan terverifikasi segar, minim emisi transportasi, dan dukung langsung para pahlawan pangan kita secara adil.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register" className="group flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:bg-emerald-600 shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1">
              Mulai Belanja 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#misi" className="flex items-center justify-center px-8 py-4 rounded-2xl font-bold bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
              Pelajari Lebih Lanjut
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8 border-t border-gray-200 pt-8 w-full">
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-gray-900">100%</span>
              <span className="text-sm font-semibold text-gray-500">Jejak Transparan</span>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div className="flex flex-col">
              <span className="text-3xl font-extrabold text-gray-900">0 km</span>
              <span className="text-sm font-semibold text-gray-500">Pajak Middleman</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           transition={{ duration: 1, delay: 0.3 }}
           className="relative mt-8 lg:mt-0"
        >
          <div className="relative w-full aspect-4/5 md:aspect-3/4 lg:aspect-square max-w-[500px] mx-auto rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
            <img 
              src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=1500&auto=format&fit=crop" 
              alt="Petani panen segar" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 to-transparent" />
            
            {/* Floating Badges */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="absolute top-8 -left-8 md:-left-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-sm font-bold text-gray-900">Organik Tersertifikasi</p>
                 <p className="text-xs font-semibold text-emerald-600">Terjamin Segar</p>
              </div>
            </motion.div>

            <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-12 -right-4 md:-right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-sm font-bold text-gray-900">Food Miles Ekstra Rendah</p>
                 <p className="text-xs font-semibold text-gray-500">Panen lokal, emisi minimal</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
