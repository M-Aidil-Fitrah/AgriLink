"use client";

import { useState, useTransition } from "react";
import { registerUser } from "@/app/actions/authActions";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // All registrations default to USER role
    formData.append("role", "USER");

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
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm p-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 my-auto"
    >
      <div className="flex flex-col items-center text-center mb-6">
        <Image src="/logo_agrilink.png" width={80} height={80} alt="Agrilink Logo" className="w-14 h-14 object-contain mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Buat Akun</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium">
          Bergabung sebagai pembeli dan mulai berbelanja
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Nama Lengkap</label>
          <div className="relative group">
            <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="name"
              placeholder="Budi Santoso"
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Alamat Email</label>
          <div className="relative group">
            <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              placeholder="anda@email.com"
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold tracking-wide text-gray-700">Kata Sandi</label>
          <div className="relative group">
            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full pl-12 pr-4 py-3 bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 font-medium"
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
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isPending}
          className="w-full relative overflow-hidden flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-bold tracking-wide transition-all hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm mt-6"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="relative z-10 flex items-center gap-2">Buat Akun</span>
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center">
        <div className="border-t border-gray-100 pt-4 text-sm text-gray-500 font-medium">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-all">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
