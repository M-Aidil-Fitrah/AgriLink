'use client';

import { m } from 'framer-motion';
import Image from 'next/image';
import { Search, Package, Navigation, Heart } from 'lucide-react';

export const HowItWorksBento = ({ images }: { images: { howItWorks: string } }) => {
    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        whileInView: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        },
        viewport: { once: true }
    });

    const steps = [
        { icon: <Search size={22} />, title: 'Pilih Produk', desc: 'Eksplor produk segar dari petani terdekat berdasarkan koordinat Anda.', span: 'md:col-span-1' },
        { icon: <Package size={22} />, title: 'Cek Traceability', desc: 'Lihat kapan dipanen, siapa petaninya, dan skor kesegarannya.', span: 'md:col-span-1' },
        { icon: <Navigation size={22} />, title: 'Optimasi Jarak', desc: 'Pesanan dikirim melalui rute terdekat untuk menekan jejak karbon.', span: 'md:col-span-1' },
        { icon: <Heart size={22} />, title: 'Dukung Petani', desc: 'Pembayaran diterima petani secara adil tanpa potongan tengkulak.', span: 'md:col-span-1' },
    ];

    return (
        <section className="container mx-auto px-4 py-16 max-w-7xl">
            <m.div 
                {...fadeUp(0)}
                className="rounded-4xl overflow-hidden relative min-h-[600px] flex flex-col justify-between p-8 md:p-16 border border-stone-200/60 shadow-xl"
            >
                {/* Background Image & Overlay */}
                <Image 
                    src={images.howItWorks} 
                    alt="Sustainable Farming" 
                    fill 
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-green-950 via-green-950/40 to-transparent" />
                
                {/* Header Content */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="max-w-xl">
                        <span className="text-[11px] font-bold tracking-[0.18em] text-green-400 uppercase mb-6 block">
                            Alur Kerja Platform
                        </span>
                        <h2 className="text-3xl md:text-6xl font-extrabold text-white uppercase not-italic tracking-tighter leading-[0.9]">
                            Mudah, <br />
                            Transparan, <br />
                            <span className="text-green-500 italic text-4xl md:text-7xl">Terpercaya.</span>
                        </h2>
                    </div>
                    <div className="md:w-1/3 pt-4 md:pt-[100px]">
                        <p className="text-stone-300 font-medium leading-relaxed opacity-90">
                            Kami memangkas rantai pasok tradisional yang panjang untuk memastikan produk sampai ke tangan Anda secepat mungkin dengan kualitas yang terjaga.
                        </p>
                    </div>
                </div>

                {/* Steps Cards Grid */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-auto pt-16">
                    {steps.map((step, i) => (
                        <m.div 
                            key={i}
                            {...fadeUp(0.2 + (i * 0.1))}
                            className={`bg-white rounded-4xl p-8 border border-stone-200/60 flex flex-col justify-between hover:border-green-200 transition-all group ${step.span}`}
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-700 mb-6 group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-500">
                                {step.icon}
                            </div>
                            <h3 className="text-lg font-extrabold text-stone-900 uppercase tracking-tight mb-3">
                                <span className="text-green-500 font-bold mr-2">{i + 1}.</span> {step.title}
                            </h3>
                            <p className="text-[13px] text-stone-500 leading-relaxed font-medium">
                                {step.desc}
                            </p>
                        </m.div>
                    ))}
                </div>
            </m.div>
        </section>
    );
};
