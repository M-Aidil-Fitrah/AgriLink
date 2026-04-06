"use client"

import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col justify-center items-center text-center px-4 bg-agrilink-light dark:bg-agrilink-dark">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-agrilink-dark dark:text-agrilink-light mb-6">
          Marketplace Pertanian Berkelanjutan
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          Hubungkan petani langsung dengan konsumen. Sajikan kesegaran tanpa batas, ciptakan rantai pangan yang transparan, sehat, dan berdampak.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-agrilink-main text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:bg-agrilink-dark transition-colors"
        >
          Belanja Sekarang
        </motion.button>
      </motion.div>
    </section>
  )
}
