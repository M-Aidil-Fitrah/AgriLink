"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { type CartItem } from "@/context/CartContext";
import { calculateFoodMiles, getFreshnessScore } from "@/lib/metrics";
import {
  ShieldCheck,
  MapPin,
  Sprout,
  Truck,
  ArrowRight,
  Check,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";

export type CheckoutViewProps = {
  userName: string;
  userAddress: string;
  userPhone: string;
  userLat: number;
  userLon: number;
  directBuyItem?: CartItem | null;
};

type ShippingOption = {
  id: string;
  label: string;
  sub: string;
  price: number;
  desc: string;
};

const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "sameday", label: "Same-day", sub: "EXPRESS", price: 25000, desc: "Hari ini" },
  { id: "coldchain", label: "Cold-chain", sub: "CHILLED", price: 35000, desc: "Sayur segar" },
  { id: "eco", label: "Eco delivery", sub: "REGULAR", price: 0, desc: "Gratis" }
];

export default function CheckoutView({
  userName,
  userAddress,
  userPhone,
  userLat,
  userLon,
  directBuyItem,
}: CheckoutViewProps) {
  const router = useRouter();
  
  const [sessionItems, setSessionItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!directBuyItem) {
      const saved = sessionStorage.getItem("agrilink_checkout_items");
      if (saved) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSessionItems(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse checkout items", e);
        }
      }
    }
  }, [directBuyItem]);

  const items = useMemo<CartItem[]>(() => {
    if (directBuyItem) return [directBuyItem];
    return sessionItems;
  }, [directBuyItem, sessionItems]);

  const totalPrice = useMemo(
    () => items.reduce((acc, i) => acc + i.price * i.quantity, 0),
    [items]
  );
  const totalItemsCount = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const [shippingMethod, setShippingMethod] = useState<ShippingOption>(SHIPPING_OPTIONS[0]);
  const [note, setNote] = useState<string>("");
  const [coupon, setCoupon] = useState<string>("");
  const [couponActive, setCouponActive] = useState<boolean>(false);

  // For direct buy local state
  const [directQuantity, setDirectQuantity] = useState(directBuyItem?.quantity || 1);
  
  const currentTotalPrice = directBuyItem ? (directBuyItem.price * directQuantity) : totalPrice;
  const discount: number = couponActive ? 5000 : 0;
  const serviceFee: number = 2500;
  const finalTotal: number = currentTotalPrice + shippingMethod.price + serviceFee - discount;

  // Calculate Distances and Freshness for each item
  const itemsWithMetrics = useMemo(() => {
    return items.map(item => {
      // 1. Distance
      let distance = 0;
      if (userLat && userLon && item.farmerLat && item.farmerLon) {
        distance = calculateFoodMiles(userLat, userLon, item.farmerLat, item.farmerLon);
      }

      // 2. Freshness
      const freshness = getFreshnessScore(
        item.harvestDate ? new Date(item.harvestDate) : null,
        item.category,
        item.cultivationMethod
      );

      return { ...item, distance, freshness };
    });
  }, [items, userLat, userLon]);

  // Average Food Miles (Weighted by items count if needed, but simple average is fine for display)
  const averageFoodMiles = useMemo(() => {
    if (itemsWithMetrics.length === 0) return 0;
    const totalDist = itemsWithMetrics.reduce((acc, i) => acc + i.distance, 0);
    return totalDist / itemsWithMetrics.length;
  }, [itemsWithMetrics]);

  // Dynamic Arrival Estimation based on distance
  const getEstimation = () => {
    if (averageFoodMiles === 0) return "Estimasi tiba 2–3 hari";
    if (averageFoodMiles < 5) return "Estimasi tiba 1–2 jam (Sangat Dekat)";
    if (averageFoodMiles < 20) return "Estimasi tiba 3–6 jam (Dekat)";
    if (averageFoodMiles < 100) return "Estimasi tiba 1 hari (Antar Kota)";
    return "Estimasi tiba 2–3 hari (Luar Kota)";
  };

  const updateQuantity = (id: string, newQty: number) => {
    if (directBuyItem && id === directBuyItem.id) {
      setDirectQuantity(Math.max(1, newQty));
    } else {
      setSessionItems((prev) => {
        const next = prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i));
        sessionStorage.setItem("agrilink_checkout_items", JSON.stringify(next));
        return next;
      });
    }
  };

  const getImageUrl = (path: string | undefined): string => {
    if (!path) return "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200";
    if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("/")) return path;
    return `https://osfmxafgxfasdfjyqvgt.supabase.co/storage/v1/object/public/agrilink-uploads/${path}`;
  };

  const handleCheckout = (): void => {
    const params = new URLSearchParams({
      total: finalTotal.toString(),
      itemsCount: (directBuyItem ? directQuantity : totalItemsCount).toString(),
      shippingId: shippingMethod.id,
      shippingCost: shippingMethod.price.toString(),
      note: note,
      address: userAddress,
      lat: userLat.toString(),
      lon: userLon.toString(),
    });

    if (directBuyItem) {
      params.append("productId", directBuyItem.productId);
      params.append("quantity", directQuantity.toString());
      params.append("directBuy", "true");
    } else {
      // Items are passed via sessionStorage to PaymentView.
      params.append("checkoutSession", "true");
    }

    router.push(`/payment?${params.toString()}`);
  };

  const handleApplyCoupon = (): void => {
    if (coupon.trim().toUpperCase() === "AGRILINK10") {
      setCouponActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24">
      {/* Header */}
      <header className="h-14 md:h-16 border-b border-black/10 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
              <Image 
                src="/logo_agrilink.png" 
                alt="Logo Agrilink" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-950">
              AgriLink
            </span>
          </Link>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
          <span className="text-emerald-900">01 — Checkout</span>
          <span className="text-slate-300">→</span>
          <span className="text-slate-400">02 — Payment</span>
          <span className="text-slate-300">→</span>
          <span className="text-slate-400">03 — Confirmation</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure</span>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 mt-6 md:mt-12">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-slate-400 hover:text-slate-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Kembali
        </button>

        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12"
        >
          <h1 className="text-4xl md:text-[64px] font-light tracking-[-0.04em] leading-none">
            CHECKOUT<span className="text-emerald-500">.</span>
          </h1>
          <div className="text-sm font-medium text-slate-500 pb-2">
            {directBuyItem ? directQuantity : totalItemsCount} item · Food miles {averageFoodMiles.toFixed(1).replace(".", ",")} km
          </div>
        </motion.div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 md:gap-16">
          
          {/* Kolom Kiri */}
          <div className="space-y-12">
            
            {/* A: Alamat Pengiriman */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-xs tracking-[0.32em] text-slate-400">A</span>
                <h2 className="text-lg font-medium">Alamat pengiriman</h2>
                <div className="flex-1 h-px bg-black/10"></div>
              </div>
              <div className="border border-black/10 rounded-xl overflow-hidden bg-white">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-lg border border-black/5 shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-lg">{userName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-emerald-900 text-white">Default</span>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border border-emerald-900/20 text-emerald-900">Verified</span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed max-w-md">{userAddress}</p>
                        <p className="text-slate-500 text-sm mt-2">{userPhone}</p>
                      </div>
                    </div>
                    <Link 
                      href="/profile?tab=address"
                      className="text-xs font-bold tracking-widest uppercase text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
                <div className="bg-[#f2f4f0] px-6 py-4 flex items-center gap-3 border-t border-black/5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-medium text-emerald-900">
                    {getEstimation()} · Food miles tertimbang {averageFoodMiles.toFixed(1).replace(".", ",")} km
                  </span>
                </div>
              </div>
            </section>

            {/* B: Daftar Produk */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-xs tracking-[0.32em] text-slate-400">B</span>
                <h2 className="text-lg font-medium">Daftar produk</h2>
                <div className="flex-1 h-px bg-black/10"></div>
              </div>
              <div className="border border-black/10 rounded-xl bg-white divide-y divide-black/5">
                {itemsWithMetrics.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Keranjang kosong.</div>
                ) : (
                  itemsWithMetrics.map((item, idx: number) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-black/5 relative">
                          <Image 
                            src={getImageUrl(item.images?.[0])} 
                            alt={item.name} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-600 mb-1">
                            {item.farmerName}
                          </p>
                          <h3 className="font-medium text-base mb-2">{item.name}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> 
                              Jarak {item.distance.toFixed(1).replace(".", ",")} km
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-1">
                              <Sprout className={`w-3 h-3 ${item.freshness.score >= 85 ? 'text-emerald-600' : item.freshness.score >= 65 ? 'text-emerald-500' : 'text-amber-500'}`} /> 
                              Fresh {item.freshness.score}%
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>Rp {item.price.toLocaleString("id-ID")}/{item.unit}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <span className="font-bold text-lg">Rp {(item.price * (directBuyItem && item.id === directBuyItem.id ? directQuantity : item.quantity)).toLocaleString("id-ID")}</span>
                        <div className="flex items-center border border-black/10 rounded-md overflow-hidden bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, (directBuyItem && item.id === directBuyItem.id ? directQuantity : item.quantity) - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-emerald-900 hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums">{directBuyItem && item.id === directBuyItem.id ? directQuantity : item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, (directBuyItem && item.id === directBuyItem.id ? directQuantity : item.quantity) + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-emerald-900 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* C: Pilihan Pengiriman */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-xs tracking-[0.32em] text-slate-400">C</span>
                <h2 className="text-lg font-medium">Pilihan pengiriman</h2>
                <div className="flex-1 h-px bg-black/10"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {SHIPPING_OPTIONS.map((opt) => {
                  const isActive = shippingMethod.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setShippingMethod(opt)}
                      className={`relative p-5 rounded-xl text-left transition-all duration-300 ${
                        isActive 
                          ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20" 
                          : "bg-white text-slate-900 border border-black/10 hover:border-emerald-600/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? "bg-white/10" : "bg-[#f2f4f0]"}`}>
                          <Truck className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-700"}`} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? "border-emerald-400 bg-emerald-400" : "border-slate-300"}`}>
                          {isActive && <Check className="w-3 h-3 text-emerald-950" strokeWidth={3} />}
                        </div>
                      </div>
                      <div className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${isActive ? "text-emerald-300" : "text-emerald-700"}`}>
                        {opt.sub}
                      </div>
                      <h3 className="font-medium text-base mb-1">{opt.label}</h3>
                      <p className={`text-sm ${isActive ? "text-white/80" : "text-slate-500"}`}>
                        {opt.price === 0 ? "Gratis" : `Rp ${opt.price.toLocaleString("id-ID")}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* D: Catatan untuk petani */}
            <section>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-xs tracking-[0.32em] text-slate-400">D</span>
                <h2 className="text-lg font-medium">Catatan untuk petani <span className="text-slate-400 font-normal">(Opsional)</span></h2>
                <div className="flex-1 h-px bg-black/10"></div>
              </div>
              <textarea 
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="tolong dipanen pagi hari, kemas tanpa plastik"
                className="w-full border border-black/10 rounded-xl p-4 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              />
            </section>

          </div>

          {/* Kolom Kanan */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="bg-[#1a3d2e] text-white rounded-2xl p-8 shadow-xl shadow-emerald-900/10">
                <h3 className="text-xs font-bold tracking-widest uppercase text-white/60 mb-2">Ringkasan pesanan</h3>
                <div className="text-3xl md:text-[40px] font-normal tracking-[-0.04em] leading-none mb-1">
                  Rp {finalTotal.toLocaleString("id-ID")}
                </div>
                <div className="text-emerald-400 text-sm font-medium mb-8">Total tagihan</div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="font-medium text-white">Rp {currentTotalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Pengiriman</span>
                    <span className="font-medium text-white">
                      {shippingMethod.price === 0 ? "Gratis" : `Rp ${shippingMethod.price.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Biaya layanan</span>
                    <span className="font-medium text-white">Rp {serviceFee.toLocaleString("id-ID")}</span>
                  </div>
                  {couponActive && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-400">Diskon kupon</span>
                      <span className="font-medium text-emerald-400">- Rp {discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-white/15 w-full mb-8"></div>

                {/* Kupon */}
                <div className="mb-8">
                  {couponActive ? (
                    <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#1a3d2e]" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-400">Kupon aktif</p>
                        <p className="text-xs text-emerald-400/80">Hemat Rp 5.000</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 border-b border-white/20 pb-2 focus-within:border-emerald-400 transition-colors">
                      <input 
                        type="text" 
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="AGRILINK10"
                        className="bg-transparent border-none outline-none w-full text-sm placeholder:text-white/30 uppercase"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        className="text-xs font-medium px-3 py-1.5 bg-emerald-600 rounded text-white hover:bg-emerald-500 transition-colors shrink-0"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="w-full bg-white text-[#1a3d2e] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 group hover:bg-emerald-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjut ke pembayaran
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-xs font-bold tracking-widest uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  AgriLink Secure
                </div>
              </div>

              {/* Edu Card */}
              <div className="mt-6 bg-white border border-y-slate-200 border-r-slate-200 border-l-2 border-l-emerald-500 p-5 shadow-sm rounded-r-xl">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  <span className="text-slate-900 font-bold">Traceable.</span> Setiap produk dapat dilacak hingga ke petani asal. Pembayaran diteruskan langsung tanpa perantara.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
