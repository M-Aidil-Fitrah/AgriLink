'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, Zap } from 'lucide-react';

export const HeroBento = ({ images }: { images: { hero: string } }) => {
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
        <section className="container mx-auto px-4 pt-32 pb-8 max-w-7xl">
            <motion.div 
                {...fadeUp}
                className="bg-white rounded-4xl border border-stone-200/60 overflow-hidden shadow-sm"
            >
                <div className="p-8 md:p-12">
                    {/* Top Label */}
                    <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block text-[11px] font-bold tracking-[0.18em] text-stone-400 uppercase mb-8"
                    >
                        Marketplace Pertanian Berkelanjutan
                    </motion.span>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* Heading Area */}
                        <div className="lg:col-span-7">
                            <h1 className="text-6xl md:text-[80px] leading-[0.9] font-extrabold text-stone-950 uppercase tracking-tighter mb-8 not-italic">
                                Panen <br />
                                <span className="text-green-600 italic">Langsung,</span> <br />
                                Segar <br />
                                <span className="text-green-600 italic">Terjamin.</span>
                            </h1>
                            
                            <p className="text-lg text-stone-500 max-w-md mb-10 leading-relaxed">
                                Platform yang menghubungkan petani lokal dengan konsumen secara cerdas, transparan, dan berkelanjutan.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    href="/dashboard/produk" 
                                    className="bg-stone-950 text-white px-8 py-4 rounded-full font-bold text-[15px] flex items-center gap-3 hover:bg-stone-800 transition-all group"
                                >
                                    Eksplor Katalog
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link 
                                    href="/register?role=farmer" 
                                    className="bg-white border border-stone-200 text-stone-950 px-8 py-4 rounded-full font-bold text-[15px] hover:bg-stone-50 transition-all"
                                >
                                    Jadi Mitra Petani
                                </Link>
                            </div>
                        </div>

                        {/* Image & Metric Area */}
                        <div className="lg:col-span-5 relative">
                            <div className="rounded-3xl overflow-hidden aspect-4/5 relative">
                                <Image 
                                    src={images.hero} 
                                    alt="Aerial Farm View" 
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                
                                {/* Floating Metrics */}
                                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                                    <motion.div 
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-3 shadow-lg self-start"
                                    >
                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
                                            <Zap size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Food Miles</p>
                                            <p className="text-sm font-bold text-stone-950">Rata-rata 4.2km</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        initial={{ x: 20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 flex items-center gap-3 shadow-lg self-end"
                                    >
                                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white">
                                            <Leaf size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Freshness Score</p>
                                            <p className="text-sm font-bold text-stone-950">9.8 / 10 Optimal</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Strip */}
                <div className="border-t border-stone-100 bg-stone-50/50 grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-100">
                    {[
                        { label: 'Petani Aktif', value: '2.400+' },
                        { label: 'Produk Terjual', value: '18.000+' },
                        { label: 'Jarak Terpendek', value: '0.8km' },
                        { label: 'Kepuasan Rata-rata', value: '98%' },
                    ].map((stat, i) => (
                        <div key={i} className="p-8 text-center">
                            <p className="text-3xl font-extrabold text-stone-950 mb-1">{stat.value}</p>
                            <p className="text-[11px] uppercase font-bold tracking-widest text-stone-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};
