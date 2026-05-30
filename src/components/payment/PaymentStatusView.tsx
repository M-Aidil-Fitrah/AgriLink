"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { 
  ShieldCheck, 
  Check, 
  Clock, 
  XCircle, 
  ArrowRight,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getMidtransStatusAction } from "@/app/actions/paymentActions";
import { updateOrderStatus } from "@/app/actions/orderActions";
import { toast } from "react-hot-toast";
import { MidtransChargeResponse } from "@/lib/midtrans-types";

type StatusState = "loading" | "settlement" | "pending" | "expire" | "deny" | "cancel" | "error";

export default function PaymentStatusView() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [status, setStatus] = useState<StatusState>("loading");
  const [data, setData] = useState<MidtransChargeResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!orderId || !mounted) return;

    const fetchStatus = async () => {
      try {
        const result = await getMidtransStatusAction(orderId);
        if (result.success && result.data) {
          setData(result.data);
          const midtransStatus = result.data.transaction_status;
          
          if (midtransStatus === "settlement" || midtransStatus === "capture") {
            setStatus("settlement");
            // Sync status to database
            await updateOrderStatus(orderId, "PROCESSING");
            toast.success("Pembayaran Berhasil! Pesanan Anda sedang diproses.");
          } else if (midtransStatus === "pending") {
            setStatus("pending");
            toast.loading("Menunggu Pembayaran...", { duration: 3000 });
          } else if (midtransStatus === "expire") {
            setStatus("expire");
            toast.error("Maaf, Pembayaran telah kedaluwarsa.");
          } else if (midtransStatus === "deny" || midtransStatus === "cancel") {
            setStatus("cancel");
            toast.error("Pembayaran dibatalkan atau ditolak.");
          } else {
            setStatus("pending");
          }
        } else {
          setStatus("error");
          toast.error("Gagal mengambil status pesanan.");
        }
      } catch (err: unknown) {
        console.error("STATUS_FETCH_ERROR:", err);
        setStatus("error");
      }
    };

    fetchStatus();
  }, [orderId, mounted]);

  const getStatusConfig = () => {
    switch (status) {
      case "settlement":
        return {
          icon: Check,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          title: "Pembayaran Berhasil",
          desc: "Terima kasih! Pesanan Anda telah diterima dan akan segera diteruskan ke petani.",
          buttonText: "Lihat Pesanan Saya",
          buttonLink: "/dashboard/pesanan"
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          title: "Menunggu Pembayaran",
          desc: "Kami masih menunggu konfirmasi pembayaran Anda dari sistem Midtrans.",
          buttonText: "Cek Status Lagi",
          action: () => window.location.reload(),
          buttonLink: "#"
        };
      case "expire":
      case "deny":
      case "cancel":
        return {
          icon: XCircle,
          color: "text-rose-500",
          bgColor: "bg-rose-500/10",
          title: "Transaksi Gagal",
          desc: "Mohon maaf, transaksi Anda tidak dapat diproses atau telah kedaluwarsa.",
          buttonText: "Beli Ulang",
          buttonLink: "/marketplace"
        };
      default:
        return {
          icon: Clock,
          color: "text-slate-400",
          bgColor: "bg-slate-100",
          title: "Memuat Data...",
          desc: "Sedang menyelaraskan status pembayaran Anda dengan sistem kami.",
          buttonText: "Kembali ke Beranda",
          buttonLink: "/"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 md:h-16 border-b border-black/10 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
              <Image src="/logo_agrilink.png" alt="Logo AgriLink" fill className="object-contain" priority />
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-950">AgriLink</span>
          </Link>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
          <span className="text-slate-400">01 — Checkout</span>
          <span className="text-slate-300">→</span>
          <span className="text-slate-400">02 — Payment</span>
          <span className="text-slate-300">→</span>
          <span className="text-emerald-900">03 — Confirmation</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure</span>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 md:p-6">
        <div className="max-w-xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="text-center"
          >
            {/* Status Icon - More Compact */}
            <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <Icon className={`w-8 h-8 ${config.color}`} strokeWidth={2.5} />
            </div>

            <h1 className="text-3xl md:text-[42px] font-light tracking-[-0.04em] leading-tight mb-2">
              {config.title.toUpperCase()}<span className="text-emerald-500">.</span>
            </h1>
            
            <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              {config.desc}
            </p>

            {/* Order Details Card - Smaller Padding */}
            <div className="bg-[#f2f4f0]/50 border border-black/5 rounded-2xl p-6 mb-8 text-left">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">ID Pesanan</p>
                  <p className="text-sm font-mono font-medium text-slate-900">#{orderId.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Metode</p>
                  <p className="text-sm font-medium text-slate-900">{data?.payment_type?.toUpperCase().replace("_", " ") || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Total Bayar</p>
                  <p className="text-sm font-medium text-slate-900">Rp {parseInt(data?.gross_amount || "0").toLocaleString("id-ID")}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-0.5">Waktu</p>
                  <p className="text-sm font-medium text-slate-900">{data ? new Date(data.transaction_time).toLocaleString("id-ID") : "-"}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href={config.buttonLink} 
                onClick={config.action}
                className="w-full sm:w-auto bg-emerald-900 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 group hover:bg-emerald-800 transition-all duration-300 shadow-lg shadow-emerald-900/10"
              >
                {config.buttonText}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto bg-white border border-black/10 text-slate-900 px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
