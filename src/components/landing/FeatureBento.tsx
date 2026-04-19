'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check, Info, MapPin, Sparkles } from 'lucide-react';

export const FeatureBento = ({ images }: { images: { tomatoes: string } }) => {
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
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Dark Feature Card */}
                    <motion.div 
                        {...fadeUp(0)}
                        className="md:col-span-5 bg-green-950 rounded-4xl overflow-hidden relative group min-h-[400px] flex flex-col justify-end p-10"
                    >
                        <div className="relative z-10">
                            <span className="text-[11px] font-bold tracking-[0.18em] text-green-400/60 uppercase mb-6 block">
                                Inovasi Pertanian
                            </span>
                            <h3 className="text-[40px] leading-none font-extrabold text-white uppercase italic mb-6">
                                Teknologi <br />
                                <span className="text-green-500 not-italic">Untuk</span> <br />
                                Petani <br />
                                <span className="text-green-500 not-italic">Modern</span>
                            </h3>
                            
                            <ul className="space-y-4">
                                {['Digital Leaflet Integration', 'Food Miles Calculation', 'Direct Market Access', 'Freshness Scoring System'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-green-100/80 text-sm font-medium">
                                        <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                                            <Check size={12} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Abstract background element */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-600/20 blur-[100px] rounded-full group-hover:bg-green-600/30 transition-all duration-700" />
                    </motion.div>

                    {/* Right Grid Area */}
                    <div className="md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Food Miles Card */}
                        <motion.div 
                            {...fadeUp(0.1)}
                            className="bg-white rounded-4xl p-8 border border-stone-200/60 flex flex-col justify-between"
                        >
                            <div className="aspect-4/3 rounded-2xl mb-5 flex items-center justify-center relative overflow-hidden group-hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 font-bold">
                                    <MapPin size={20} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-extrabold text-stone-950 uppercase tracking-tight mb-3">
                                    Food Miles <span className="text-green-600 font-bold">Indicator</span>
                                </h3>
                                <p className="text-sm text-stone-500 leading-relaxed mb-6">
                                    Menghitung jarak dari lahan ke meja makan Anda secara real-time. Semakin dekat, semakin segar.
                                </p>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Efficiency</span>
                                    <span className="text-lg font-black text-stone-950">94%</span>
                                </div>
                                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '94%' }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-green-600 rounded-full"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Freshness Score Card */}
                        <motion.div 
                            {...fadeUp(0.2)}
                            className="bg-white rounded-4xl p-8 border border-stone-200/60 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="text-xl font-extrabold text-stone-950 uppercase tracking-tight mb-3">
                                    Freshness <span className="text-amber-500 font-bold">Scoring</span>
                                </h3>
                                <p className="text-sm text-stone-500 leading-relaxed mb-6">
                                    Algoritma cerdas yang menilai kualitas produk berdasarkan waktu panen dan masa transportasi.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-6 gap-1 items-end h-12">
                                {[40, 60, 45, 90, 75, 100].map((h, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }}
                                        className="bg-amber-100 group-hover:bg-amber-200 transition-colors w-full rounded-t-sm"
                                        style={{ backgroundColor: i === 5 ? '#f59e0b' : undefined }}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Large Image/Traceability Card */}
                        <motion.div 
                            {...fadeUp(0.3)}
                            className="md:col-span-2 bg-white rounded-4xl overflow-hidden border border-stone-200/60 relative h-[280px] group"
                        >
                            <Image 
                                src={images.tomatoes} 
                                alt="Fresh Harvest" 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 80vw"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-green-950 via-green-950/40 to-transparent" />
                            <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white">
                                        <Info size={12} />
                                    </div>
                                    <span className="text-[11px] font-bold tracking-[0.2em] text-green-400 uppercase">Traceability</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-white uppercase not-italic tracking-tighter mb-2">
                                    Lacak Dari <span className="text-green-500 italic">Benih</span> <br /> 
                                    Hingga <span className="text-green-500 italic">Meja Makan</span>
                                </h3>
                                <p className="text-stone-300 text-sm max-w-lg mb-0 font-medium opacity-80">
                                    Setiap produk dapat anda pantau.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
                
            </div>
        </section>
    );
};
