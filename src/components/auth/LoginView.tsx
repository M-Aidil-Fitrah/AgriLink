'use client';

import LoginForm from "./LoginForm";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeadingWord } from "./AuthComponents";

export function LoginView() {
    const headingLines = [
        "KEMBALI",
        "KE EKOSISTEM",
        "PANGAN",
        "TERPERCAYA."
    ];

    return (
        <main className="h-screen w-full flex overflow-hidden bg-[#f2f4f0]">
            {/* Left Panel - Editorial Style */}
            <motion.div 
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                className="hidden lg:flex w-[55%] h-full relative flex-col justify-between p-16"
            >
                {/* Background & Overlays */}
                <Image
                    src="/auth/login_bg.png"
                    alt="Rice Terrace Landscape"
                    fill
                    className="object-cover z-0"
                    priority
                />
                <div className="absolute inset-0 bg-green-950/80 z-10" />
                
                {/* Grid Pattern Overlay */}
                <div 
                    className="absolute inset-0 z-20 opacity-[0.06] pointer-events-none" 
                    style={{ 
                        backgroundImage: `linear-gradient(to right, #86efac 1px, transparent 1px), linear-gradient(to bottom, #86efac 1px, transparent 1px)`,
                        backgroundSize: '48px 48px'
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
                            Selamat Datang Kembali
                        </motion.span>
                        
                        <h1 className="text-white font-black leading-[0.85] uppercase tracking-tighter" style={{ fontSize: 'clamp(42px, 4.5vw, 68px)' }}>
                            {headingLines.map((line, i) => (
                                <div key={i} className="flex flex-wrap">
                                    {line.split(' ').map((word, j) => (
                                        <HeadingWord 
                                            key={j} 
                                            word={word} 
                                            delay={0.9 + (i * 0.1) + (j * 0.05)} 
                                            isGreen={i === headingLines.length - 1}
                                        />
                                    ))}
                                </div>
                            ))}
                        </h1>
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="relative z-30"
                >
                    <p className="text-white/45 text-[13px] leading-relaxed max-w-xs font-medium">
                        Lanjutkan langkah Anda mendukung petani lokal. Ciptakan ekosistem pangan cerdas hanya dengan satu klik.
                    </p>
                </motion.div>
            </motion.div>

            {/* Right Panel - Form Container */}
            <div className="flex-1 h-full bg-[#f2f4f0] relative flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
                {/* Mobile Header */}
                <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Image src="/logo_agrilink.png" width={24} height={24} alt="Logo" className="object-contain" />
                    <span className="font-bold text-stone-900 uppercase tracking-widest text-sm">
                        AgriLink
                    </span>
                </div>

                <LoginForm />
            </div>
        </main>
    );
}
