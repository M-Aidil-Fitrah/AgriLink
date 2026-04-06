"use client";

import { useState, useTransition } from "react";
import { registerUser } from "@/app/actions/authActions";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, UserPlus, Mail, Lock, User, Tractor, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'USER' | 'FARMER'>('USER');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("role", selectedRole);
    
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
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md p-8 sm:p-10 bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] border border-emerald-50"
    >
      <div className="flex flex-col items-center mb-8">
        <motion.div 
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-14 h-14 bg-linear-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mb-5 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <Leaf className="w-7 h-7" />
        </motion.div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bergabung Bersama Kami</h2>
        <p className="text-gray-500 text-sm mt-3 font-medium">Buat akun untuk memulai</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          type="button"
          onClick={() => setSelectedRole('USER')}
          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${selectedRole === 'USER' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.1)] scale-105' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500'}`}
        >
          <User className="w-6 h-6 mb-2" />
          <span className="font-bold text-sm">Pembeli</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedRole('FARMER')}
          className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${selectedRole === 'FARMER' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.1)] scale-105' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500'}`}
        >
          <Tractor className="w-6 h-6 mb-2" />
          <span className="font-bold text-sm">Petani</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Nama Lengkap</label>
          <div className="relative group">
            <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Alamat Email</label>
          <div className="relative group">
            <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="email"
              name="email"
              placeholder="anda@email.com"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Kata Sandi</label>
          <div className="relative group">
            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all duration-300 font-medium shadow-sm"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-600 text-sm font-medium flex items-center gap-2 p-4 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-100"
            >
              <ShieldCheck className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -5px rgba(16,185,129,0.4)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isPending}
          className="w-full relative overflow-hidden group flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-emerald-500 text-white py-4 px-4 rounded-2xl font-bold tracking-wide transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(16,185,129,0.3)] mt-6"
        >
          {isPending ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="relative z-10 flex items-center gap-2">Buat Akun Baru <UserPlus className="w-5 h-5" /></span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500 font-medium">
        Sudah memiliki akun?{" "}
        <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-bold hover:underline transition-all">
          Masuk Sekarang
        </Link>
      </div>
    </motion.div>
  );
}
