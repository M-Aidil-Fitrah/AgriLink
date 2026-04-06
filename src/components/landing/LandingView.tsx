"use client";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Leaf } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function LandingView() {
  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900 flex flex-col pt-24 font-sans text-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 lg:py-24 grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            Revolusi Pangan Nusantara
          </div>
          
          <h1 className="text-5xl lg:text-[4rem] font-black leading-[1.1] tracking-tight text-gray-900">
             Makan Sehat, <br/>Langsung dari <span className="text-emerald-600 block">Akarnya.</span>
          </h1>
          
          <p className="text-lg text-gray-600 font-medium max-w-lg leading-relaxed">
             Agrilink memotong jalur distribusi panjang. Kami menghubungkan Anda langsung dengan petani lokal bersertifikasi untuk memastikan setiap sayur di piring Anda lebih segar, berkeadilan, dan berkelanjutan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
             <Link href="/register" className="inline-flex items-center justify-center h-14 px-8 text-base font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-md">
                Mulai Berbelanja
             </Link>
             <Link href="#cara-kerja" className="inline-flex items-center justify-center h-14 px-8 text-base font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-all">
                Bagaimana Cara Kerjanya?
             </Link>
          </div>
        </div>

        {/* Clean Hero Image Grid */}
        <div className="relative">
           <div className="aspect-4/3 rounded-3xl overflow-hidden bg-gray-100 relative">
              <Image
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop"
                className="object-cover"
                alt="Sayuran segar"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
           </div>
           
           {/* Floating Info Box */}
           <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-gray-100 hidden md:flex flex-row items-center gap-4">
             <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6" />
             </div>
             <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Metode Panen</p>
                <p className="font-extrabold text-gray-900">100% Organik</p>
             </div>
           </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section id="cara-kerja" className="bg-gray-50 py-24 border-y border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
           <h2 className="text-3xl font-extrabold text-gray-900 mb-16 tracking-tight">Kualitas Premium, Harga Petani.</h2>
           
           <div className="grid md:grid-cols-3 gap-12 text-left">
             <div>
               <div className="w-16 h-16 bg-white rounded-2xl mb-6 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50 text-2xl font-black">1</div>
               <h3 className="text-xl font-bold text-gray-900 mb-3">Tanpa Perantara</h3>
               <p className="text-gray-500 font-medium leading-relaxed">Produk diantarkan langsung dari kebun ke rumah Anda dalam 24 jam. Keadilan harga untuk petani, harga masuk akal untuk Anda.</p>
             </div>
             <div>
               <div className="w-16 h-16 bg-white rounded-2xl mb-6 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50 text-2xl font-black">2</div>
               <h3 className="text-xl font-bold text-gray-900 mb-3">Transparansi Asal</h3>
               <p className="text-gray-500 font-medium leading-relaxed">Ketahui secara spesifik dari lahan mana wortel atau cabai Anda berasal. Setiap produk memiliki jejak digital yang 100% dapat dipercaya.</p>
             </div>
             <div>
               <div className="w-16 h-16 bg-white rounded-2xl mb-6 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-50 text-2xl font-black">3</div>
               <h3 className="text-xl font-bold text-gray-900 mb-3">Jejak Karbon Rendah</h3>
               <p className="text-gray-500 font-medium leading-relaxed">Sistem Food Miles indikator kami memastikan rute terpendek dan tersingkat untuk meminimalkan polusi emisi logistik pada alam.</p>
             </div>
           </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
