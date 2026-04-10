"use client";

import { useCart } from "@/context/CartContext";
import { ChevronLeft, ShieldCheck, MapPin, CreditCard, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { createOrderAction } from "@/app/actions/orderActions";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CheckoutPage() {
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
        total: totalPrice + 2000, // including service fee
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100/50"
        >
          <CheckCircle2 className="w-16 h-16" />
        </motion.div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Pembayaran Selesai!</h2>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">
            Terima kasih! Pesanan Anda telah diterima dan diteruskan ke petani. Halaman akan berpindah secara otomatis...
          </p>
        </div>
      </div>
    );
  }

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
    <div className="max-w-7xl mx-auto px-6 py-10 pb-32">
      <Link href="/dashboard/produk" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-colors mb-8 group">
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Lanjut Belanja
      </Link>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-bold flex items-center gap-3">
          <X className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
           <h1 className="text-5xl font-black text-gray-900 tracking-tight">Pembayaran</h1>

           {/* Alamat Section */}
           <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xs space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                    Alamat Pengiriman
                 </h3>
                 <button className="text-sm font-bold text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-full transition-colors">Ubah Alamat</button>
              </div>
              <div className="p-8 bg-gray-50/50 rounded-3xl border border-gray-100/50 relative overflow-hidden group">
                 <div className="relative z-10">
                    <p className="font-extrabold text-gray-900 text-lg">Rumah Utama (Andi)</p>
                    <p className="text-gray-500 mt-2 font-medium leading-relaxed max-w-md">Jl. Syiah Kuala No. 123, Kuta Alam, Banda Aceh, 23123</p>
                    <div className="flex items-center gap-4 mt-4">
                      <p className="text-xs font-bold text-gray-400 bg-gray-200/50 px-3 py-1.5 rounded-lg tracking-wide uppercase">Kontak: 0812-xxxx-xxxx</p>
                      <span className="text-[10px] font-black text-emerald-600 uppercase border border-emerald-200 px-2 py-1 rounded-md">Utama</span>
                    </div>
                 </div>
                 <MapPin className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-200/50 -rotate-12" />
              </div>
           </div>

           {/* Ringkasan Produk */}
           <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xs space-y-8">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                Ringkasan Pesanan
              </h3>
              <div className="space-y-2">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-6 p-6 hover:bg-gray-50 rounded-3xl transition-all group border border-transparent hover:border-gray-100">
                      <div className="w-20 h-20 relative bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                         <Image src={item.images?.[0] || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 flex justify-between items-start">
                         <div>
                            <h4 className="font-extrabold text-gray-900 text-lg">{item.name}</h4>
                            <p className="text-sm text-gray-400 font-bold mb-2 uppercase tracking-tight">{item.farmerName}</p>
                            <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{item.quantity} x Rp {item.price.toLocaleString("id-ID")}</span>
                         </div>
                         <span className="font-extrabold text-gray-900 text-lg">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-emerald-900 text-white rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                 <div className="space-y-2">
                   <h3 className="text-lg font-bold opacity-60 uppercase tracking-widest text-emerald-200">Total Tagihan</h3>
                   <p className="text-4xl font-black tracking-tighter">Rp {(totalPrice + 2000).toLocaleString("id-ID")}</p>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center opacity-70">
                       <span className="font-medium">Subtotal Produk</span>
                       <span className="font-bold tracking-tight">Rp {totalPrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-70">
                       <span className="font-medium">Biaya Layanan</span>
                       <span className="font-bold tracking-tight">Rp 2.000</span>
                    </div>
                 </div>

                 <div className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black uppercase tracking-widest text-emerald-300">Metode Bayar</div>
                      <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-0.5 rounded uppercase">Otomatis</span>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 p-5 rounded-3xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer group/btn">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                        <CreditCard className="w-6 h-6" />
                       </div>
                       <div className="flex-1">
                          <p className="font-extrabold text-sm">Virtual Account BCA</p>
                          <p className="text-xs opacity-50 font-medium">Proses Instan & Aman</p>
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={handleCheckout}
                  disabled={isPending}
                  className="w-full h-16 bg-white text-emerald-900 rounded-[24px] font-black text-lg hover:bg-emerald-50 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                 >
                    {isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Bayar Sekarang"
                    )}
                 </button>

                 <div className="flex items-center gap-2 justify-center text-[10px] font-black opacity-40 mt-6 tracking-widest uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    Agrilink Security Verified
                 </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-700/50 rounded-full blur-[80px] pointer-events-none opacity-50"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/30 rounded-full blur-[80px] pointer-events-none opacity-50"></div>
           </div>

           <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                  <Info className="w-5 h-5" />
               </div>
               <h4 className="font-black text-amber-900 text-sm uppercase tracking-tight">Penting</h4>
             </div>
             <p className="text-xs font-bold text-amber-800/80 leading-relaxed uppercase tracking-tighter">
                Klik tombol &quot;Bayar Sekarang&quot; di atas untuk mensimulasikan pembayaran yang sudah selesai. Pesanan akan langsung diteruskan ke dasbor petani.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function Info(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
