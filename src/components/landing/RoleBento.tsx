'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';

export const RoleBento = ({ images }: { images: { farmer: string, buyer: string } }) => {
    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        whileInView: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        },
        viewport: { once: true }
    });

    return (
        <section className="container mx-auto px-4 py-16 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Farmer Role Card */}
                <m.div 
                    {...fadeUp(0)}
                    className="relative rounded-4xl overflow-hidden min-h-[500px] group flex flex-col justify-end p-10 border border-stone-200/60"
                >
                    <Image 
                        src={images.farmer} 
                        alt="Join as Farmer" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-green-950 via-green-950/40 to-transparent" />
                    
                    <div className="relative z-10">
                        <span className="text-[11px] font-bold tracking-[0.18em] text-green-400 uppercase mb-6 block">
                            Untuk Produsen
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase not-italic tracking-tighter mb-8 leading-[0.9]">
                            Jual Lebih <br />
                            <span className="text-green-500 italic">Menguntungkan,</span> <br />
                            Tanpa Perantara.
                        </h2>
                        
                        <ul className="mb-10 space-y-3">
                            {['Akses pasar langsung', 'Sistem pembayaran transparan', 'Dashboard manajemen stok', 'Layanan penjemputan hasil panen'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-green-100/70 text-sm font-medium">
                                    <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                                        <Check size={12} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link 
                            href="/register" 
                            className="inline-flex bg-green-500 text-green-950 px-8 py-4 rounded-full font-bold text-[14px] items-center gap-3 hover:bg-green-400 transition-all uppercase tracking-wide"
                        >
                            Daftar Jadi Petani
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </m.div>

                {/* Buyer Role Card */}
                <m.div 
                    {...fadeUp(0.1)}
                    className="relative rounded-4xl overflow-hidden min-h-[500px] group flex flex-col justify-end p-10 border border-stone-200/60"
                >
                    <Image 
                        src={images.buyer} 
                        alt="Shop as Buyer" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-stone-950 via-stone-950/40 to-transparent" />
                    
                    <div className="relative z-10">
                        <span className="text-[11px] font-bold tracking-[0.18em] text-stone-300 uppercase mb-6 block">
                            Untuk Konsumen
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase not-italic tracking-tighter mb-8 leading-[0.9]">
                            Belanja Produk <br />
                            <span className="text-green-500 italic">Segar</span> Dengan <br />
                            <span className="text-green-500 italic">Transparansi.</span>
                        </h2>
                        
                        <ul className="mb-10 space-y-3">
                            {['Hasil panen hari ini', 'Dukung ekonomi lokal', 'Kualitas terverifikasi', 'Lacak jejak karbon Anda'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-stone-300 text-sm font-medium">
                                    <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-green-400">
                                        <Check size={12} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>

                        <Link 
                            href="/dashboard/produk" 
                            className="inline-flex bg-white text-stone-950 px-8 py-4 rounded-full font-bold text-[14px] items-center gap-3 hover:bg-stone-100 transition-all uppercase tracking-wide"
                        >
                            Mulai Belanja Sekarang
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </m.div>
            </div>
        </section>
    );
};
