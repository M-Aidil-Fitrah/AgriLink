"use client";

import { useCart } from "@/context/CartContext";
import { ChevronLeft, ShieldCheck, MapPin, CreditCard, ShoppingBag, Loader2, CheckCircle2, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { createOrderAction } from "@/app/actions/orderActions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function CheckoutView() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = () => {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction({
        items: items.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price
        })),
        total: totalPrice + 2000, 
        deliveryAddress: "Jl. Syiah Kuala No. 123, Kuta Alam, Banda Aceh, 23123"
      });

      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          clearCart();
          router.push("/dashboard/pesanan");
        }, 3000);
      } else {
        setError(result.error);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Selesai!</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-xs mx-auto">Pesanan Anda telah diterima petani.</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ShoppingBag className="w-10 h-10 text-gray-200" />
        <h2 className="text-lg font-bold text-gray-900 uppercase">Keranjang Kosong</h2>
        <Link href="/dashboard/produk" className="text-sm font-black text-emerald-600 underline uppercase tracking-widest">Ke Katalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-6 pb-24">
      <Link href="/dashboard/produk" className="inline-flex items-center gap-1.5 text-xs font-black text-gray-400 hover:text-emerald-600 transition-all mb-6 uppercase tracking-[0.2em]">
        <ChevronLeft className="w-3.5 h-3.5" />
        Kembali Belanja
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
           <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-4">Pembayaran</h1>

           <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                 <h3 className="text-xs font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <MapPin className="w-4 h-4" />
                    </div>
                    Alamat Pengiriman
                 </h3>
                 <button className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest">Ubah</button>
              </div>
              <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-100/50 relative overflow-hidden group">
                 <div className="relative z-10">
                    <p className="font-black text-gray-900 text-sm uppercase tracking-tight">Rumah Utama (Andi)</p>
                    <p className="text-gray-500 mt-1 text-xs font-medium leading-relaxed max-w-sm">Jl. Syiah Kuala No. 123, Kuta Alam, Banda Aceh, 23123</p>
                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-[10px] font-black text-gray-400 bg-gray-200/50 px-3 py-1 rounded uppercase tracking-wider">0812-xxxx-xxxx</span>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-3 py-1 rounded uppercase tracking-wider">Utama</span>
                    </div>
                 </div>
                 <MapPin className="absolute -bottom-2 -right-2 w-20 h-20 text-gray-100 pointer-events-none -rotate-12" />
              </div>
           </div>

           <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest border-b border-gray-50 pb-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                Daftar Produk
              </h3>
              <div className="divide-y divide-gray-50">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-5 py-4 group">
                      <div className="w-16 h-16 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                         <Image src={item.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                         <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1.5">{item.farmerName}</p>
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-tight leading-none mb-2">{item.name}</h4>
                            <span className="text-[11px] font-bold text-gray-400">{item.quantity} {item.unit} x Rp {item.price.toLocaleString("id-ID")}</span>
                         </div>
                         <span className="font-black text-gray-900 text-sm">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-8">
           <div className="bg-emerald-900 text-white rounded-[2rem] p-7 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-7">
                 <div>
                   <h3 className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em] mb-2">Total Tagihan</h3>
                   <p className="text-3xl font-black tracking-tighter">Rp {(totalPrice + 2000).toLocaleString("id-ID")}</p>
                 </div>

                 <div className="space-y-3 pt-5 border-t border-white/10 text-[11px] font-bold opacity-60 uppercase tracking-widest">
                    <div className="flex justify-between items-center">
                       <span>Subtotal</span>
                       <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span>Biaya Layanan</span>
                       <span>Rp 2.000</span>
                    </div>
                 </div>

                 <div className="pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Metode Bayar</div>
                      <span className="text-[8px] font-black bg-white/10 px-2 py-0.5 rounded uppercase">Otomatis</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/btn">
                       <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-black text-[11px] uppercase tracking-tight leading-none">V-Account BCA</p>
                          <p className="text-[9px] opacity-40 mt-1 uppercase font-bold">Instan & Aman</p>
                       </div>
                    </div>
                 </div>

                 {error && (
                   <p className="text-[10px] font-bold text-red-300 bg-red-900/40 p-2.5 rounded-lg border border-red-800/50">{error}</p>
                 )}

                 <button 
                  onClick={handleCheckout}
                  disabled={isPending}
                  className="w-full h-12 bg-white text-emerald-900 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                 >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "BAYAR SEKARANG"}
                 </button>

                 <div className="flex items-center gap-2 justify-center text-[9px] font-black opacity-30 tracking-[0.2em] uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AGRILINK SECURE
                 </div>
              </div>
           </div>

           <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-800/80 leading-relaxed uppercase tracking-tighter">
                 Simulasi pembayaran otomatis. Pesanan akan langsung diteruskan ke dasbor petani.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
