"use client";

import { useCart } from "@/context/CartContext";
import { ChevronLeft, ShieldCheck, MapPin, CreditCard, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
           <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900">Keranjang Anda Kosong</h2>
          <p className="text-gray-500 font-medium mt-1">Silakan pilih produk terlebih dahulu sebelum checkout.</p>
        </div>
        <Link href="/dashboard/produk" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100">
           Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 pb-32">
      <Link href="/dashboard/produk" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors mb-8 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Lanjut Belanja
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>

           {/* Alamat Section Placeholder */}
           <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Alamat Pengiriman
                 </h3>
                 <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Ubah Alamat</button>
              </div>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                 <p className="font-bold text-gray-900">Rumah Utama (Andi)</p>
                 <p className="text-sm text-gray-500 mt-1 leading-relaxed">Jl. Syiah Kuala No. 123, Kuta Alam, Banda Aceh, 23123</p>
                 <p className="text-xs text-gray-400 mt-1">Kontak: 0812-xxxx-xxxx</p>
              </div>
           </div>

           {/* Ringkasan Produk */}
           <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-gray-900">Ringkasan Pesanan</h3>
              <div className="space-y-4">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
                      <div className="w-16 h-16 relative bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                         <Image src={item.image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-900">{item.name}</h4>
                         <p className="text-xs text-gray-400 font-bold">{item.farmerName}</p>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-sm font-bold text-gray-500">{item.quantity} x Rp {item.price.toLocaleString("id-ID")}</span>
                            <span className="font-extrabold text-gray-900">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Payment Summary */}
        <div className="space-y-6">
           <div className="bg-emerald-900 text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                 <h3 className="text-xl font-bold opacity-80">Total Pembayaran</h3>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center opacity-70">
                       <span className="font-medium">Subtotal</span>
                       <span className="font-bold">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-70">
                       <span className="font-medium">Biaya Layanan</span>
                       <span className="font-bold">Rp 2.000</span>
                    </div>
                    <div className="h-px bg-white/20 my-4"></div>
                    <div className="flex justify-between items-center">
                       <span className="text-lg font-bold">Total Bayar</span>
                       <span className="text-2xl font-black">Rp {(totalPrice + 2000).toLocaleString("id-ID")}</span>
                    </div>
                 </div>

                 <div className="pt-4">
                    <div className="mb-4 text-xs font-bold uppercase tracking-widest opacity-50">Transfer Via</div>
                    <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
                       <CreditCard className="w-6 h-6" />
                       <div className="flex-1">
                          <p className="font-bold">Virtual Account BCA</p>
                          <p className="text-[10px] opacity-60">Pengecekan Otomatis</p>
                       </div>
                    </div>
                 </div>

                 <button className="w-full h-16 bg-white text-emerald-900 rounded-3xl font-black text-lg hover:bg-emerald-50 transition-all shadow-xl active:scale-95">
                    Bayar Sekarang
                 </button>

                 <div className="flex items-center gap-2 justify-center text-[10px] font-bold opacity-60 mt-4">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PEMBAYARAN TERENCANA & AMAN
                 </div>
              </div>

              {/* Decorative Circle BG */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
           </div>

           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
             <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 shrink-0">
                <CreditCard className="w-5 h-5" />
             </div>
             <p className="text-[11px] font-bold text-amber-800 leading-relaxed uppercase tracking-tighter">
                Sistem pembayaran instan akan segera hadir. Saat ini kami hanya mendukung pembayaran mandiri via Transfer.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
