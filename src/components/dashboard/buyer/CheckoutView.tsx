"use client";

import { useCart } from "@/context/CartContext";
import { useState, useTransition } from "react";
import { createOrder } from "@/app/actions/orderActions";
import { useRouter } from "next/navigation";
import { MapPin, ShoppingBag, CreditCard, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type MapPickerProps = {
  initialLat?: number | null;
  initialLon?: number | null;
  onChange: (coords: { lat: number; lon: number }) => void;
};

const MapPicker = dynamic<MapPickerProps>(
  () => import("../farmer/MapPicker").then((mod) => mod.MapPicker as ComponentType<MapPickerProps>),
  { 
    ssr: false, 
    loading: () => <div className="h-48 w-full bg-gray-100 animate-pulse rounded-2xl" />
  }
);

export function CheckoutView() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [note, setNote] = useState("");

  if (items.length === 0 && !success) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-sm py-20">
         <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
         </div>
         <h2 className="text-xl font-bold text-gray-900">Keranjang Kosong</h2>
         <p className="text-gray-500 mt-2 mb-6">Tambahkan produk ke keranjang sebelum melakukan checkout.</p>
         <button 
           onClick={() => router.push("/dashboard/produk")}
           className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
         >
           Ke Katalog Produk
         </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center py-20">
         <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
         </div>
         <h2 className="text-3xl font-extrabold text-gray-900">Pesanan Berhasil!</h2>
         <p className="text-gray-600 font-medium mt-3">Pesanan Anda telah diteruskan ke petani. Silakan cek status pengiriman secara berkala.</p>
         <div className="mt-10 grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push("/dashboard/pesanan")}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all"
            >
              Cek Pesanan
            </button>
            <button 
              onClick={() => router.push("/dashboard/produk")}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all"
            >
              Belanja Lagi
            </button>
         </div>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!address) { setError("Alamat pengiriman wajib diisi"); return; }
    if (!coords) { setError("Pilih lokasi pengiriman di peta"); return; }

    startTransition(async () => {
      const res = await createOrder({
        items: items.map(i => ({ productId: i.id, quantity: i.quantity, price: i.price })),
        total: totalPrice,
        note,
        deliveryAddress: address,
        deliveryLat: coords.lat,
        deliveryLon: coords.lon,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        clearCart();
      }
    });
  };

  return (
    <div className="p-8 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Checkout</h2>

        {/* Alamat Pengiriman */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
           <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
             <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <MapPin className="w-4 h-4" />
             </div>
             <div>
                <h3 className="font-extrabold text-gray-900 text-sm">Alamat Pengiriman</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tentukan tujuan pengiriman produk</p>
             </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nama Jalan / Komplek / No. Rumah</label>
                 <textarea 
                   rows={2}
                   value={address}
                   onChange={(e) => setAddress(e.target.value)}
                   placeholder="Jl. Thamrin No. 123, Lt. 2..."
                   className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 rounded-2xl text-sm font-medium text-gray-900 outline-none transition-all resize-none"
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Pin Point Lokasi (Map)</label>
                 <div className="h-64 rounded-2xl overflow-hidden border border-gray-100">
                    <MapPicker onChange={setCoords} />
                 </div>
                 {coords && (
                   <p className="text-[10px] font-bold text-emerald-600 mt-1">Koordinat Terpilih: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}</p>
                 )}
              </div>
           </div>
        </div>

        {/* Ringkasan Belanja */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
           <div className="flex items-center gap-3 pb-4 border-b border-gray-50 mb-4">
             <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <ShoppingBag className="w-4 h-4" />
             </div>
             <h3 className="font-extrabold text-gray-900 text-sm">Produk yang Dibeli</h3>
           </div>
           
           <div className="divide-y divide-gray-50">
              {items.map(item => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                   <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden relative shrink-0">
                      <Image src={item.image || "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"} alt={item.name} fill className="object-cover" sizes="64px" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{item.farmerName}</p>
                      <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-gray-400 font-medium">{item.quantity} {item.unit} × Rp {item.price.toLocaleString("id-ID")}</p>
                   </div>
                   <p className="text-sm font-extrabold text-gray-900">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-6">
         {/* Ringkasan Pembayaran */}
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-extrabold text-gray-900 mb-6">Ringkasan Pembayaran</h3>
            
            <div className="space-y-4 mb-6">
               <div className="flex justify-between text-sm font-medium text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gray-900">Rp {totalPrice.toLocaleString("id-ID")}</span>
               </div>
               <div className="flex justify-between text-sm font-medium text-gray-500">
                  <span>Biaya Ongkos Kirim</span>
                  <span className="text-emerald-600 font-bold italic">Gratis (Promo)</span>
               </div>
               <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Total Bayar</span>
                  <span className="text-2xl font-extrabold text-emerald-700">Rp {totalPrice.toLocaleString("id-ID")}</span>
               </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 flex items-start gap-3 mb-8">
               <CreditCard className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
               <div>
                  <p className="text-xs font-bold text-emerald-800">Metode Pembayaran</p>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5">Transfer Bank Manual (Konfirmasi via Admin)</p>
               </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>
            )}

            <button
               onClick={handleCheckout}
               disabled={isPending}
               className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
               {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buat Pesanan Sekarang"}
               {!isPending && <ChevronRight className="w-5 h-5" />}
            </button>
         </div>
      </div>
    </div>
  );
}
