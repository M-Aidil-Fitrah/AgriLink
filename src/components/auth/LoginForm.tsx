'use client';

import { useActionState, useEffect } from "react";
import { authenticate } from "@/app/actions/authActions";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AnimatedInput } from "./AuthComponents";
import { toast } from "react-hot-toast";

export default function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

    useEffect(() => {
        if (errorMessage) {
            toast.error(errorMessage);
        }
    }, [errorMessage]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-[440px]"
        >
            <div className="bg-white rounded-4xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
                {/* Header Card */}
                <div className="mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-600 mb-3 block">
                        Masuk Akun
                    </span>
                    <h2 className="text-stone-950 font-extrabold text-[28px] md:text-[34px] uppercase leading-tight tracking-tighter">
                        SELAMAT <br />
                        DATANG KEMBALI.
                    </h2>
                </div>

                <form action={dispatch} className="space-y-4">
                    <AnimatedInput 
                        label="Alamat Email" 
                        name="email" 
                        type="email" 
                        placeholder="anda@email.com" 
                        required 
                        delay={0.4}
                    />

                    <div className="space-y-2">
                        <AnimatedInput 
                            label="Kata Sandi" 
                            name="password" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            showPasswordToggle
                            delay={0.48}
                        />
                        <div className="flex justify-end">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.54 }}
                            >
                                <Link 
                                    href="#" 
                                    className="text-[12px] font-semibold text-green-600 hover:text-green-700 transition-colors"
                                >
                                    Lupa kata sandi?
                                </Link>
                            </motion.div>
                        </div>
                    </div>

                    {errorMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 text-[13px] font-medium p-4 rounded-2xl border border-red-100"
                        >
                            {errorMessage}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isPending}
                        className="w-full bg-stone-950 hover:bg-green-700 text-white rounded-full py-4 text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isPending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'MASUK SEKARANG'
                        )}
                    </motion.button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-100"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[11px] text-stone-300 uppercase tracking-widest leading-none">atau</span>
                    </div>
                </div>

                {/* Switch Page */}
                <div className="text-center">
                    <p className="text-[13px] text-stone-400 font-medium">
                        Belum memiliki akun?{' '}
                        <Link href="/register" className="text-stone-900 font-bold hover:text-green-600 transition-colors group inline-flex items-center gap-1">
                            Buat Akun Gratis
                            <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </p>
                </div>
            </div>

            <div className="text-center mt-6">
                <Link href="/" className="text-[12px] text-stone-400 hover:text-stone-600 transition-colors font-medium">
                    ← Kembali ke Beranda
                </Link>
            </div>
        </motion.div>
    );
}
