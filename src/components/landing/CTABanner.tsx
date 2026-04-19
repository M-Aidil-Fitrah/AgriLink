'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CTABanner = () => {
    const fadeUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        },
        viewport: { once: true }
    };

    return (
        <section className="container mx-auto px-4 py-16 max-w-7xl">
            <motion.div 
                {...fadeUp}
                className="bg-green-950 rounded-[3rem] p-10 md:p-20 relative overflow-hidden group shadow-2xl shadow-green-950/20"
            >
                {/* Background Pattern & Glow */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(#22c55e 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
                />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/30 transition-all duration-700" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-3 mb-8">
                            <Sparkles className="text-green-400" size={20} />
                            <span className="text-[11px] font-bold tracking-[0.2em] text-green-400 uppercase">Ayo Bergabung Sekarang</span>
                        </div>
                        <h2 className="text-5xl md:text-[80px] leading-[0.9] font-extrabold text-white uppercase not-italic tracking-tighter mb-0">
                            Mulai Perjalanan <br />
                            <span className="text-green-500 italic">Pangan Sehat</span> <br />
                            Anda <span className="text-green-500 italic">Hari Ini.</span>
                        </h2>
                    </div>

                    <div className="lg:col-span-4 lg:pt-12">
                        <p className="text-green-100/70 text-lg font-medium mb-10 leading-relaxed max-w-sm">
                            Jadilah bagian dari revolusi pangan yang lebih adil bagi petani dan konsumen.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/register" 
                                className="bg-green-500 text-green-950 px-10 py-5 rounded-full font-bold text-[16px] flex items-center justify-center gap-3 hover:bg-white transition-all group uppercase tracking-wide"
                            >
                                Daftar Sekarang
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link 
                                href="/dashboard/produk" 
                                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full font-bold text-[16px] flex items-center justify-center hover:bg-white/20 transition-all uppercase tracking-wide"
                            >
                                Lihat Katalog
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};
