'use client';

import { m } from 'framer-motion';
import { Star } from 'lucide-react';

export const TestimonialBento = () => {
    const fadeUp = (delay = 0) => ({
        initial: { opacity: 0, y: 20 },
        whileInView: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
        },
        viewport: { once: true }
    });

    const testimonials = [
        { 
            name: 'Andi Saputra', 
            role: 'Mitra Petani - Batu', 
            content: 'Sejak bergabung dengan AgriLink, saya tidak lagi kesulitan menjual hasil panen. Pembayarannya cepat dan harganya sangat adil dibanding tengkulak di pasar.', 
            initial: 'A', 
            color: 'bg-green-600',
            span: 'md:col-span-1'
        },
        { 
            name: 'Siti Rahma', 
            role: 'Ibu Rumah Tangga', 
            content: 'Biasanya selada di supermarket sudah layu, tapi di AgriLink saya bisa beli yang baru dipanen pagi hari dan sampai di rumah siang hari. Skor kesegarannya sangat membantu!', 
            initial: 'S', 
            color: 'bg-amber-600',
            span: 'md:col-span-1'
        },
        { 
            name: 'Restoran Hijau', 
            role: 'Pemilik Restoran', 
            content: 'Transparansi traceability AgriLink menjadi nilai jual tambahan bagi menu kami. Pelanggan kami sangat menghargai ketika tahu dari mana sayuran mereka berasal secara detail.', 
            initial: 'R', 
            color: 'bg-purple-600',
            span: 'md:col-span-1'
        },
        { 
            name: 'Budi Hartono', 
            role: 'Mitra Petani - Malang', 
            content: 'Digitalisasi pertanian yang dibawa AgriLink sangat membantu kami yang awalnya gaptek. Sekarang manajemen stok jadi jauh lebih rapi dan terukur.', 
            initial: 'B', 
            color: 'bg-blue-600',
            span: 'md:col-span-2'
        },
        { 
            name: 'Maya Putri', 
            role: 'Pecinta Hidroponik', 
            content: 'Suka banget sama fitur Food Miles-nya. Jadi lebih sadar lingkungan sambil tetap dapat sayuran kualitas terbaik.', 
            initial: 'M', 
            color: 'bg-rose-600',
            span: 'md:col-span-1'
        },
    ];

    return (
        <section className="container mx-auto px-4 py-16 max-w-7xl">
            <div className="flex flex-col items-center mb-12">
                <span className="text-[11px] font-bold tracking-[0.18em] text-stone-400 uppercase mb-3 text-center block">
                    Suara Komunitas
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-stone-950 uppercase not-italic tracking-tighter text-center">
                    Tumbuh <span className="text-green-600 italic">Bersama</span> <br /> 
                    Di <span className="text-green-600 italic">AgriLink.</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testimonials.map((t, i) => (
                    <m.div 
                        key={i}
                        {...fadeUp(0.1 + (i * 0.1))}
                        className={`bg-white rounded-4xl p-8 border border-stone-200/60 flex flex-col justify-between hover:border-green-200 transition-all group ${t.span}`}
                    >
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 ${t.color} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-current/20`}>
                                    {t.initial}
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-stone-950 uppercase mb-1 leading-none">{t.name}</h4>
                                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest leading-none">{t.role}</p>
                                </div>
                            </div>
                            <p className="text-stone-600 text-[15px] leading-relaxed font-medium mb-8">
                                &ldquo;{t.content}&rdquo;
                            </p>
                        </div>
                        
                        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={14} className="fill-green-600 text-green-600" />
                                ))}
                            </div>
                            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Terverifikasi</span>
                        </div>
                    </m.div>
                ))}
            </div>
        </section>
    );
};
