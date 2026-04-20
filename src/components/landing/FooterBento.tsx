'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail as Instagram, Mail as Twitter, Mail as Facebook, Mail, MapPin, Phone } from 'lucide-react';

export const FooterBento = () => {
    return (
        <section className="container mx-auto px-4 pt-8 pb-12 max-w-7xl">
            <div className="bg-stone-950 rounded-4xl p-10 md:p-16 text-white">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-5">
                        <Link href="/" className="flex items-center gap-2 group mb-8">
                            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
                                <Image 
                                    src="/logo_agrilink.png" 
                                    alt="Logo Agrilink" 
                                    fill 
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-bold text-2xl tracking-tight">
                                AgriLink
                            </span>
                        </Link>
                        <p className="text-stone-400 text-lg leading-relaxed max-w-sm mb-10 font-medium">
                            Solusi digital untuk ekosistem pertanian yang lebih adil, berkelanjutan, dan transparan bagi semua.
                        </p>
                        
                        <div className="space-y-4 mb-10">
                            {[
                                { icon: <MapPin size={18} />, text: 'Jl. Sultan Malikul Saleh No. 123, Kota Banda Aceh, Indonesia' },
                                { icon: <Phone size={18} />, text: '+62 812 3456 7890' },
                                { icon: <Mail size={18} />, text: 'hello@agrilink.id' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 text-stone-400 hover:text-green-400 transition-colors">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-semibold">{item.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            {[
                                { icon: <Instagram key="inst" />, name: 'Instagram' },
                                { icon: <Twitter key="twit" />, name: 'Twitter' },
                                { icon: <Facebook key="face" />, name: 'Facebook' }
                            ].map((social) => (
                                <Link key={social.name} href="#" className="w-12 h-12 bg-white/5 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all">
                                    {social.icon}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { title: 'Platform', links: ['Tentang Kami', 'Cara Kerja', 'Sustainability', 'Testimoni'] },
                            { title: 'Produk', links: ['Sayuran Segar', 'Buah-buahan', 'Bumbu Dapur', 'Paket Hemat'] },
                            { title: 'Dukungan', links: ['Pusat Bantuan', 'Syarat & Ketentuan', 'Kebijakan Privasi', 'Kemitraan'] },
                            { title: 'Karir', links: ['Lowongan', 'Kultur', 'Engineering', 'Marketing'] },
                        ].map((col, i) => (
                            <div key={i}>
                                <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-8">{col.title}</h4>
                                <ul className="space-y-4">
                                    {col.links.map((link, j) => (
                                        <li key={j}>
                                            <Link href="#" className="text-[13px] font-bold text-stone-400 hover:text-green-400 transition-colors uppercase tracking-widest leading-none">
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[11px] font-bold text-stone-500 uppercase tracking-[0.3em]">
                        © 2026 AgriLink Indonesia. All Rights Reserved.
                    </p>
                    <div className="flex gap-8">
                        <Link href="#" className="text-[10px] font-bold text-stone-600 uppercase tracking-widest hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="text-[10px] font-bold text-stone-600 uppercase tracking-widest hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="text-[10px] font-bold text-stone-600 uppercase tracking-widest hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
