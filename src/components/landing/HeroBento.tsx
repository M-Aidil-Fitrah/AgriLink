'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const HeroBento = ({ images }: { images: { hero: string } }) => {
    const fadeUp = {
        initial: { opacity: 0, y: 15 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        }
    };

    return (
        <section className="container mx-auto px-4 pt-32 pb-8 max-w-7xl">
                <m.div 
                    {...fadeUp}
                    className="bg-white rounded-4xl border border-stone-200/60 overflow-hidden shadow-sm"
                >
                    <div className="p-8 md:p-12">
                        {/* Top Label */}
                        <m.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block text-[11px] font-bold tracking-[0.18em] text-stone-400 uppercase mb-8"
                        >
                            Marketplace Pertanian Berkelanjutan
                        </m.span>

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
                                    href="/register" 
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
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                
                            
                            </div>
                        </div>
                    </div>
                </div>

                </m.div>
            </section>
    );
};
