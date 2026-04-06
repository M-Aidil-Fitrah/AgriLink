"use client";

import { useActionState, useState } from "react";
import { authenticate } from "@/app/actions/authActions";
import { motion } from "framer-motion";
import { Leaf, LogIn, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm p-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100"
    >
      <div className="flex flex-col items-start mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Selamat Datang</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">Silakan masuk ke akun Anda</p>
      </div>

      <form action={dispatch} className="space-y-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Alamat Email</label>
          <div className="relative group">
            <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="email"
              name="email"
              placeholder="anda@email.com"
              required
              className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Kata Sandi</label>
          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 font-medium"
            />
          </div>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-red-600 text-sm font-medium flex items-center gap-2 p-4 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-100"
          >
            {errorMessage}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isPending}
          className="w-full relative overflow-hidden flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-bold tracking-wide transition-all hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm mt-4"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="relative z-10 flex items-center gap-2">Masuk</span>
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 font-medium">
        Belum memiliki akun?{" "}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all">
          Buat Akun Baru
        </Link>
      </div>
    </motion.div>
  );
}
