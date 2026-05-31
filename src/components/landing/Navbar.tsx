'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';

interface NavbarProps {
    isLoggedIn: boolean;
}

export const Navbar = ({ isLoggedIn }: NavbarProps) => {
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
        <m.nav
                initial={{ y: -12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled ? 'py-3 md:py-4' : 'py-4 md:py-6'
                }`}
            >
            <div className="container mx-auto px-4 max-w-7xl">
                <div 
                    className={`flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3 rounded-full transition-all duration-300 ${
                        isScrolled 
                        ? 'bg-white/95 backdrop-blur-md shadow-sm border border-stone-200/60' 
                        : 'bg-transparent'
                    }`}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1.5 md:gap-2 group shrink-0">
                        <div className="relative w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform">
                            <Image 
                                src="/logo_agrilink.png" 
                                alt="Logo Agrilink" 
                                fill 
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="font-bold text-base md:text-xl tracking-tight text-stone-950">
                            AgriLink
                        </span>
                    </Link>

                    {/* Desktop Nav - Focused on Dashboard */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link 
                            href="/dashboard"
                            className="text-[13px] font-medium tracking-wide text-stone-600 hover:text-green-600 transition-colors"
                        >
                            Lihat Dashboard
                        </Link>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {isLoggedIn ? (
                            /* User is logged in — show only "Mulai Sekarang" as dashboard link */
                            <Link 
                                href="/dashboard" 
                                className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-[13px] font-bold px-4 py-2 md:px-6 md:py-2.5 rounded-full transition-all shadow-sm shadow-green-200 flex items-center gap-1.5 md:gap-2 group whitespace-nowrap"
                            >
                                Mulai Sekarang
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            /* Guest — show Login + Register */
                            <>
                                <Link 
                                    href="/login" 
                                    className="text-[13px] font-semibold text-stone-600 hover:text-stone-950 px-4 py-2 transition-colors hidden sm:block"
                                >
                                    Masuk
                                </Link>
                                <Link 
                                    href="/register" 
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-[13px] font-bold px-4 py-2 md:px-6 md:py-2.5 rounded-full transition-all shadow-sm shadow-green-200 flex items-center gap-1.5 md:gap-2 group whitespace-nowrap"
                                >
                                    Mulai Sekarang
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </>
                        )}
                        
                        {/* Mobile Toggle */}
                        <button 
                            className="md:hidden p-1.5 -mr-1.5 text-stone-950"
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
                    <m.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-4 right-4 mt-2 bg-white rounded-4xl border border-stone-200/60 overflow-hidden shadow-sm md:hidden"
                    >
                        <div className="flex flex-col gap-4 p-6">
                            <Link 
                                href="/dashboard"
                                className="text-base md:text-lg font-semibold text-stone-950 px-2 py-1"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Lihat Dashboard
                            </Link>
                            <hr className="border-stone-100" />
                            {isLoggedIn ? (
                                <Link 
                                    href="/dashboard" 
                                    className="text-base md:text-lg font-semibold text-green-600 px-2 py-1"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Mulai Sekarang
                                </Link>
                            ) : (
                                <Link 
                                    href="/login" 
                                    className="text-base md:text-lg font-semibold text-stone-950 px-2 py-1"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Masuk
                                </Link>
                            )}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </m.nav>
    );
};
