'use client';

import RegisterForm from "./RegisterForm";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeadingWord } from "./AuthComponents";

export function RegisterView() {
    const headingLines = [
        "BERGABUNG",
        "BERSAMA",
        "PETANI &",
        "PEMBELI",
        "INDONESIA."
    ];

    const bulletItems = [
        "Dukungan langsung untuk komunitas petani lokal.",
        "Akses produk segar dengan transparansi penuh.",
        "Kontribusi nyata untuk sistem pangan berkelanjutan."
    ];

    return (
        <main className="min-h-[100dvh] w-full flex overflow-hidden bg-[#f2f4f0]">
            {/* Left Panel - Editorial Style */}
            <motion.div 
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                className="hidden lg:flex w-[48%] h-full relative flex-col justify-between p-16"
            >
                {/* Background & Overlays */}
                <Image
                    src="/auth/register_bg.png"
                    alt="Rice Paddy Field Sunrise"
                    fill
                    className="object-cover z-0"
                    priority
                />
                <div className="absolute inset-0 bg-green-950/80 z-10" />
                
                {/* Dot Pattern Overlay */}
                <div 
                    className="absolute inset-0 z-20 opacity-[0.05] pointer-events-none" 
                    style={{ 
                        backgroundImage: `radial-gradient(circle, #86efac 1px, transparent 1px)`,
                        backgroundSize: '32px 32px'
                    }} 
                />

                {/* Content */}
                <div className="relative z-30">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="flex items-center gap-2 mb-20"
                    >
                         <div className="relative w-8 h-8">
                            <Image 
                                src="/logo_agrilink.png" 
                                alt="Logo Agrilink" 
                                fill 
                                className="object-contain"
                            />
                        </div>
                        <span className="font-bold uppercase tracking-[0.2em] text-[15px] text-white">
                            AgriLink
                        </span>
                    </motion.div>

                    {/* Reveal Heading */}
                    <div className="max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.85, duration: 0.4 }}
                            className="block text-[#86efac] text-[11px] font-bold uppercase tracking-[0.4em] mb-6"
                        >
                            Mulai Perjalanan Anda
                        </motion.span>
                        
                        <h1 className="text-white font-black leading-[0.85] uppercase tracking-tighter" style={{ fontSize: 'clamp(36px, 4vw, 60px)' }}>
                            {headingLines.map((line, i) => (
                                <div key={i} className="flex flex-wrap">
                                    {line.split(' ').map((word, j) => (
                                        <HeadingWord 
                                            key={j} 
                                            word={word} 
                                            delay={0.9 + (i * 0.1) + (j * 0.05)} 
                                            isGreen={i >= headingLines.length - 2}
                                        />
                                    ))}
                                </div>
                            ))}
                        </h1>
                    </div>
                </div>

                <div className="relative z-30 space-y-8">
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="text-white/45 text-[13px] leading-relaxed max-w-xs font-medium"
                    >
                        Jadilah bagian dari revolusi pangan yang lebih adil bagi petani dan konsumen.
                    </motion.p>

                    <div className="space-y-3">
                        {bulletItems.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.6 + (i * 0.1), duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                <span className="text-[12px] text-white/45 font-medium">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Panel - Form Container */}
            <div className="flex-1 min-h-[100dvh] bg-[#f2f4f0] relative flex items-center justify-center py-16 px-5 sm:px-8 lg:px-12 overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                    <Image src="/logo_agrilink.png" width={24} height={24} alt="Logo" className="object-contain" />
                    <span className="font-bold text-stone-900 uppercase tracking-widest text-sm">
                        AgriLink
                    </span>
                </div>

                <RegisterForm />
            </div>
        </main>
    );
}
