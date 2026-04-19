'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'py-4' : 'py-6'
            }`}
        >
            <div className="container mx-auto px-4 max-w-7xl">
                <div 
                    className={`flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 ${
                        isScrolled 
                        ? 'bg-white/95 backdrop-blur-md shadow-sm border border-stone-200/60' 
                        : 'bg-transparent'
                    }`}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
                            <Image 
                                src="/logo_agrilink.png" 
                                alt="Logo Agrilink" 
                                fill 
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-stone-950">
                            AgriLink
                        </span>
                    </Link>

                    {/* Desktop Nav - Focused on Dashboard */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link 
                            href="/dashboard/produk"
                            className="text-[13px] font-medium tracking-wide text-stone-600 hover:text-green-600 transition-colors"
                        >
                            Lihat Dashboard
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-3">
                        <Link 
                            href="/login" 
                            className="text-[13px] font-semibold text-stone-600 hover:text-stone-950 px-4 py-2 transition-colors hidden sm:block"
                        >
                            Masuk
                        </Link>
                        <Link 
                            href="/register" 
                            className="bg-green-600 hover:bg-green-700 text-white text-[13px] font-bold px-6 py-2.5 rounded-full transition-all shadow-sm shadow-green-200 flex items-center gap-2 group"
                        >
                            Mulai Sekarang
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        {/* Mobile Toggle */}
                        <button 
                            className="md:hidden p-2 text-stone-950"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-4 right-4 mt-2 bg-white rounded-4xl border border-stone-200/60 overflow-hidden shadow-sm md:hidden"
                    >
                        <div className="flex flex-col gap-4 p-6">
                            <Link 
                                href="/dashboard/produk"
                                className="text-lg font-semibold text-stone-950 px-2 py-1"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Lihat Dashboard
                            </Link>
                            <hr className="border-stone-100" />
                            <Link 
                                href="/login" 
                                className="text-lg font-semibold text-stone-950 px-2 py-1"
                            >
                                Masuk
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};
