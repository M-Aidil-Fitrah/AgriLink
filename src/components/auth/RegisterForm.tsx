'use client';

import { useState, useTransition } from "react";
import { registerUser } from "@/app/actions/authActions";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatedInput, PasswordStrength } from "./AuthComponents";

export default function RegisterForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    
    // State for local validation
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const pwMismatch = confirmPassword !== '' && password !== confirmPassword;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (pwMismatch) return;

        const formData = new FormData(e.currentTarget);
        // All registrations default to USER role in backend, 
        // but we follow current logic of not changing actions.

        startTransition(async () => {
            const res = await registerUser(null, formData);
            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/login");
            }
        });
    };

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
                        Buat Akun Baru
                    </span>
                    <h2 className="text-stone-950 font-extrabold text-[28px] md:text-[32px] uppercase leading-tight tracking-tighter">
                        MULAI PERJALANAN <br />
                        ANDA HARI INI.
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                        <AnimatedInput 
                            label="Nama Lengkap" 
                            name="name" 
                            placeholder="Budi Santoso" 
                            required 
                            delay={0.38}
                        />

                        <AnimatedInput 
                            label="Alamat Email" 
                            name="email" 
                            type="email" 
                            placeholder="anda@email.com" 
                            required 
                            delay={0.44}
                        />
                    </div>

                    <div className="space-y-2">
                        <AnimatedInput 
                            label="Kata Sandi" 
                            name="password" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            showPasswordToggle
                            delay={0.5}
                            onChange={setPassword}
                        />
                        <PasswordStrength password={password} />
                    </div>

                    <div className="space-y-2">
                        <AnimatedInput 
                            label="Konfirmasi Kata Sandi" 
                            name="confirmPassword" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                            showPasswordToggle
                            delay={0.56}
                            onChange={setConfirmPassword}
                        />
                        <AnimatePresence>
                            {confirmPassword && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`text-[11px] font-semibold ${pwMismatch ? 'text-red-500' : 'text-green-600'}`}
                                >
                                    {pwMismatch ? 'Kata sandi tidak cocok' : 'Kata sandi cocok'}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 text-[13px] font-medium p-4 rounded-2xl border border-red-100"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isPending || pwMismatch}
                        className="w-full bg-stone-950 hover:bg-green-700 text-white rounded-full py-4 text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isPending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'DAFTAR SEKARANG'
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
                        Sudah memiliki akun?{' '}
                        <Link href="/login" className="text-stone-900 font-bold hover:text-green-600 transition-colors group inline-flex items-center gap-1">
                            Masuk Sekarang
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
