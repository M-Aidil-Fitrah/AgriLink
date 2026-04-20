'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Star, MapPin } from 'lucide-react';

export const ProductBento = ({ images }: { images: { tomatoes: string } }) => {
    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        whileInView: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        },
        viewport: { once: true }
    });

    const products = [
        { name: 'Bayam Organik', location: 'Kab. Malang', price: 'Rp 4.500', unit: '/ ikat', miles: '0.8km', freshness: '9.8', color: '#e8f5e9' },
        { name: 'Tomat Cherry', location: 'Batu', price: 'Rp 12.000', unit: '/ 500g', miles: '4.2km', freshness: '9.5', color: '#fce4ec' },
        { name: 'Selada', location: 'Kota Malang', price: 'Rp 8.500', unit: '/ 250g', miles: '1.5km', freshness: '9.9', color: '#f3e5f5' },
        { name: 'Jagung Manis', location: 'Kediri', price: 'Rp 7.000', unit: '/ kg', miles: '12km', freshness: '9.2', color: '#fff9c4' },
    ];

    return (
        <section className="container mx-auto px-4 py-16 max-w-7xl">
            {/* Minimal Header */}
            <div className="flex justify-between items-end mb-8 px-2">
                <div>
                    <span className="text-[11px] font-bold tracking-[0.18em] text-stone-400 uppercase mb-3 block">
                        Katalog Unggulan
                    </span>
                    <h2 className="text-4xl font-extrabold text-stone-950 uppercase tracking-tighter">
                        Pilih Produk <span className="text-green-600 font-bold">Terbaik</span> <br /> 
                        Sesuai <span className="text-green-600 font-bold">Kebutuhanmu.</span>
                    </h2>
                </div>
                <Link href="/dashboard/produk" className="hidden md:flex items-center gap-2 text-[13px] font-bold text-green-600 uppercase tracking-widest hover:gap-3 transition-all underline decoration-2 underline-offset-8">
                    Lihat Semua
                    <ArrowRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Left Billboard Card */}
                <m.div 
                    {...fadeUp(0)}
                    className="md:col-span-5 bg-green-950 rounded-4xl overflow-hidden relative group min-h-[400px] flex flex-col justify-end p-10"
                >
                    <Image 
                        src={images.tomatoes} 
                        alt="Product Showcase" 
                        fill 
                        className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-green-950 via-green-950/40 to-transparent" />
                    
                    <div className="relative z-10">
                        <h3 className="text-[40px] leading-none font-extrabold text-white uppercase not-italic mb-6">
                            18.000+ Produk <br />
                            <span className="text-green-500 italic">Segar</span> Langsung <br />
                            <span className="text-green-500 italic">Dari Kebun.</span>
                        </h3>
                        <p className="text-green-100/70 text-sm max-w-xs mb-8 font-medium">
                            Setiap pembelian mendukung kesejahteraan petani lokal dan lingkungan yang sehat.
                        </p>
                        <Link 
                            href="/dashboard/produk" 
                            className="inline-flex bg-green-500 text-green-950 px-8 py-4 rounded-full font-bold text-[14px] items-center gap-3 hover:bg-green-400 transition-all uppercase tracking-wide shadow-lg shadow-green-900/20"
                        >
                            Jelajah Sekarang
                        </Link>
                    </div>
                </m.div>

                {/* Right Product Grid */}
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((product, i) => (
                        <m.div 
                            key={i}
                            {...fadeUp(0.1 + (i * 0.1))}
                            className="bg-white rounded-4xl p-5 border border-stone-200/60 flex flex-col group hover:border-green-200 transition-all"
                        >
                            {/* Visual Area */}
                            <div 
                                className="aspect-4/3 rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden group-hover:shadow-md transition-shadow"
                                style={{ backgroundColor: product.color }}
                            >
                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <Star size={10} className="fill-amber-500 text-amber-500" />
                                    <span className="text-[10px] font-bold text-stone-950">4.9</span>
                                </div>
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Organik</span>
                                </div>
                                
                                {/* Placeholder for actual product icons */}
                                <div className="text-stone-300 transform group-hover:scale-110 transition-transform">
                                    <ShoppingCart size={48} strokeWidth={1} />
                                </div>
                            </div>
                            
                            {/* Info Area */}
                            <div className="flex flex-col gap-1 mb-4">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-extrabold text-stone-950 uppercase tracking-tight text-lg">{product.name}</h4>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400">
                                        <MapPin size={10} />
                                        {product.location}
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-green-600">{product.price}</span>
                                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{product.unit}</span>
                                </div>
                            </div>

                            <hr className="border-stone-100 mb-4" />

                            <div className="flex justify-between items-center">
                                <div className="flex gap-3">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-tighter">Food Miles</span>
                                        <span className="text-[11px] font-bold text-stone-950 underline decoration-green-400 underline-offset-4">{product.miles}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-tighter">Freshness</span>
                                        <span className="text-[11px] font-bold text-stone-950 underline decoration-amber-400 underline-offset-4">{product.freshness}/10</span>
                                    </div>
                                </div>
                                <button className="w-10 h-10 bg-stone-950 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
                                    <ShoppingCart size={16} />
                                </button>
                            </div>
                        </m.div>
                    ))}
                </div>
            </div>
            
            <div className="mt-8 md:hidden">
                <Link href="/dashboard/produk" className="flex items-center justify-center gap-2 bg-white border border-stone-200 p-4 rounded-3xl text-sm font-bold text-stone-950 uppercase tracking-widest">
                    Lihat Katalog Lengkap
                    <ArrowRight size={14} />
                </Link>
            </div>
        </section>
    );
};
