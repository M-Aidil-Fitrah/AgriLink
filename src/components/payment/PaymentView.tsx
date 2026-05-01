"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  Sprout, 
  ArrowRight, 
  Check, 
  CreditCard,
  QrCode,
  Building2,
  Store,
  Lock,
  Copy,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart, type CartItem } from "@/context/CartContext";
import { createOrderAction } from "@/app/actions/orderActions";
import { toast } from "react-hot-toast";

type PaymentMethodGroup = "va" | "qris_ewallet" | "card" | "cstore";

export type PaymentMethod = {
  id: string;
  label: string;
  sub: string;
  group: PaymentMethodGroup;
  icon: React.ElementType;
};

type PaymentGroup = {
  groupLabel: string;
  items: PaymentMethod[];
};

const PAYMENT_METHODS: PaymentGroup[] = [
  {
    groupLabel: "Bank Transfer (Virtual Account)",
    items: [
      { id: "bca_va", label: "BCA", sub: "VIRTUAL ACCOUNT", group: "va", icon: Building2 },
      { id: "bca_bni", label: "BNI", sub: "VIRTUAL ACCOUNT", group: "va", icon: Building2 },
      { id: "mandiri", label: "Mandiri Bill Payment", sub: "VIRTUAL ACCOUNT", group: "va", icon: Building2 },
    ]
  },
  {
    groupLabel: "QRIS & E-Wallet",
    items: [
      { id: "qris", label: "QRIS", sub: "ALL SUPPORTED APPS", group: "qris_ewallet", icon: QrCode },
      { id: "gopay", label: "GoPay", sub: "E-WALLET", group: "qris_ewallet", icon: QrCode },
      { id: "shopeepay", label: "ShopeePay", sub: "E-WALLET", group: "qris_ewallet", icon: QrCode },
    ]
  },
  {
    groupLabel: "Kartu",
    items: [
      { id: "card", label: "Kartu Kredit / Debit", sub: "VISA · MASTERCARD · JCB", group: "card", icon: CreditCard },
    ]
  },
  {
    groupLabel: "Convenience Store",
    items: [
      { id: "indomaret", label: "Indomaret", sub: "GERAI", group: "cstore", icon: Store },
      { id: "alfamart", label: "Alfamart", sub: "GERAI", group: "cstore", icon: Store },
    ]
  }
];

type PaymentState = "select" | "instruction" | "success";

export default function PaymentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart } = useCart();
  
  const rawTotal: string | null = searchParams.get("total");
  const rawItemsCount: string | null = searchParams.get("itemsCount");
  const rawShippingCost: string | null = searchParams.get("shippingCost");
  const rawShippingId: string | null = searchParams.get("shippingId");
  const note: string | null = searchParams.get("note");
  const address: string | null = searchParams.get("address");
  
  const total: number = rawTotal ? parseInt(rawTotal, 10) : 0;
  const itemsCount: number = rawItemsCount ? parseInt(rawItemsCount, 10) : 0;

  const shipping: number = rawShippingCost ? parseInt(rawShippingCost, 10) : 25000;
  const serviceFee: number = 2500;
  const itemTotal: number = total > 0 ? total - shipping - serviceFee : 0;

  const [state, setState] = useState<PaymentState>("select");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");

  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);

  useEffect(() => {
    if (state === "instruction") {
      const timer = setInterval(() => {
        setTimeLeft((prev: number) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state]);

  const handlePay = (): void => {
    if (!selectedMethod) return;
    setState("instruction");
  };

  const handleFinish = async (): Promise<void> => {
    const isDirectBuy = searchParams.get("directBuy") === "true";
    const directProductId = searchParams.get("productId");
    const directQuantity = parseInt(searchParams.get("quantity") || "1");

    // Call backend to create the order
    if (isDirectBuy && directProductId) {
      try {
        const result = await createOrderAction({
          total: total,
          items: [{
            productId: directProductId,
            quantity: directQuantity,
            price: itemTotal / directQuantity
          }],
          deliveryAddress: address || "Alamat tidak tersedia",
          note: note || undefined,
          shippingMethod: rawShippingId || "",
          shippingCost: shipping,
          paymentMethod: selectedMethod?.id || ""
        });

        if (!result.success) {
          toast.error(result.error || "Gagal membuat pesanan.");
          return;
        }
      } catch (err) {
        console.error("PAYMENT_DIRECT_BUY_ERROR:", err);
        toast.error("Terjadi masalah koneksi. Silakan coba lagi.");
        return;
      }
    } else if (items.length > 0) {
      try {
        const result = await createOrderAction({
          total: total,
          items: items.map((item: CartItem) => ({
            productId: item.id, // In cart context, item.id is the product unique ID from DB
            quantity: item.quantity,
            price: item.price
          })),
          deliveryAddress: address || "Alamat tidak tersedia",
          note: note || undefined,
          shippingMethod: rawShippingId || "",
          shippingCost: shipping,
          paymentMethod: selectedMethod?.id || ""
        });

        if (!result.success) {
          toast.error(result.error || "Gagal membuat pesanan.");
          return;
        }
      } catch (err) {
        console.error("PAYMENT_FINISH_ERROR:", err);
        toast.error("Terjadi masalah koneksi. Silakan coba lagi.");
        return;
      }
    }

    setState("success");
    setTimeout(() => {
      clearCart();
      router.push("/dashboard/pesanan?order=success");
    }, 2400);
  };

  const formatTime = (seconds: number): string => {
    const m: string = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s: string = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24">
      {/* Header */}
      <header className="h-16 border-b border-black/10 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40">
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
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-slate-400">01 — Checkout</span>
          <span className="text-slate-300">→</span>
          <span className="text-emerald-900">02 — Payment</span>
          <span className="text-slate-300">→</span>
          <span className="text-slate-400">03 — Confirmation</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure</span>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 mt-12">
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
          className="mb-12"
        >
          <h1 className="text-[64px] font-light tracking-[-0.04em] leading-none">
            PEMBAYARAN<span className="text-emerald-500">.</span>
          </h1>
        </motion.div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
          
          {/* Kolom Kiri */}
          <div className="relative">
            <AnimatePresence mode="wait">
              
              {/* STATE 1: SELECT */}
              {state === "select" && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-mono text-xs tracking-[0.32em] text-slate-400">A</span>
                    <h2 className="text-lg font-medium">Pilih metode pembayaran</h2>
                    <div className="flex-1 h-px bg-black/10"></div>
                  </div>

                  {PAYMENT_METHODS.map((group: PaymentGroup, gIdx: number) => (
                    <div key={gIdx} className="mb-8">
                      <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 ml-1">
                        {group.groupLabel}
                      </h3>
                      <div className="border border-black/10 rounded-xl bg-white overflow-hidden divide-y divide-black/5">
                        {group.items.map((method: PaymentMethod) => {
                          const isActive: boolean = selectedMethod?.id === method.id;
                          const Icon: React.ElementType = method.icon;
                          return (
                            <div key={method.id}>
                              <button
                                onClick={() => setSelectedMethod(method)}
                                className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
                                  isActive ? "bg-emerald-900 text-white" : "hover:bg-slate-50 text-slate-900"
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                                    isActive ? "border-white/20 bg-white/10" : "border-black/5 bg-white"
                                  }`}>
                                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-700"}`} />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{method.label}</h4>
                                    <p className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${
                                      isActive ? "text-emerald-400" : "text-slate-400"
                                    }`}>
                                      {method.sub}
                                    </p>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  isActive ? "border-emerald-400" : "border-slate-300"
                                }`}>
                                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>}
                                </div>
                              </button>

                              {/* Card Form Expand */}
                              <AnimatePresence>
                                {isActive && method.group === "card" && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="overflow-hidden bg-white text-slate-900"
                                  >
                                    <div className="p-6 border-t border-black/5 space-y-4">
                                      <input 
                                        type="text" 
                                        placeholder="Nomor kartu" 
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                        className="w-full border-b border-black/10 pb-2 bg-transparent focus:outline-none focus:border-emerald-500 transition-colors"
                                      />
                                      <input 
                                        type="text" 
                                        placeholder="Nama di kartu" 
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value)}
                                        className="w-full border-b border-black/10 pb-2 bg-transparent focus:outline-none focus:border-emerald-500 transition-colors"
                                      />
                                      <div className="grid grid-cols-2 gap-4">
                                        <input 
                                          type="text" 
                                          placeholder="MM/YY" 
                                          value={cardExpiry}
                                          onChange={(e) => setCardExpiry(e.target.value)}
                                          className="w-full border-b border-black/10 pb-2 bg-transparent focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                        <input 
                                          type="text" 
                                          placeholder="CVV" 
                                          value={cardCvv}
                                          onChange={(e) => setCardCvv(e.target.value)}
                                          className="w-full border-b border-black/10 pb-2 bg-transparent focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                      </div>
                                      <div className="pt-2 flex items-center justify-end text-[10px] font-bold tracking-widest uppercase text-emerald-900 gap-1.5">
                                        <Lock className="w-3 h-3" />
                                        Diamankan oleh Midtrans 3-D Secure
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* STATE 2: INSTRUCTION */}
              {state === "instruction" && selectedMethod && (
                <motion.div
                  key="instruction"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="border border-black/10 rounded-xl bg-white overflow-hidden">
                    <div className="bg-[#f2f4f0] px-6 py-4 flex items-center justify-between border-b border-black/5">
                      <span className="font-medium text-slate-700">{selectedMethod.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Bayar sebelum</span>
                        <span className="font-mono font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded tabular-nums">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>

                    <div className="p-8">
                      {selectedMethod.group === "va" && (
                        <div className="text-center">
                          <p className="text-sm text-slate-500 mb-2">Nomor Virtual Account</p>
                          <div className="text-[36px] font-light tracking-tight text-emerald-900 mb-6 font-mono">
                            8077 1234 5678 9012
                          </div>
                          <button className="bg-emerald-900 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 mx-auto hover:bg-emerald-800 transition-colors">
                            <Copy className="w-4 h-4" />
                            Salin Nomor
                          </button>
                          
                          <div className="mt-12 text-left max-w-md mx-auto">
                            <h4 className="font-medium mb-4">Cara membayar</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                              {[
                                "Buka aplikasi mobile banking Anda.",
                                "Pilih menu Transfer > Virtual Account.",
                                "Masukkan nomor VA di atas.",
                                "Pastikan nama penerima adalah AgriLink.",
                                "Masukkan PIN untuk menyelesaikan."
                              ].map((step: string, i: number) => (
                                <li key={i} className="flex gap-3">
                                  <span className="font-bold text-emerald-600">{(i+1).toString().padStart(2, "0")}</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {selectedMethod.group === "qris_ewallet" && selectedMethod.id === "qris" && (
                        <div className="text-center">
                          <div className="w-[224px] h-[224px] bg-slate-50 border border-black/5 rounded-2xl mx-auto flex items-center justify-center relative mb-6">
                            <QrCode className="w-48 h-48 text-emerald-900" strokeWidth={1} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-emerald-900 rounded-lg flex items-center justify-center shadow-lg">
                                <Sprout className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                          <p className="text-xs font-bold tracking-widest uppercase text-slate-500">
                            Scan menggunakan aplikasi apapun
                          </p>
                        </div>
                      )}

                      {selectedMethod.group === "qris_ewallet" && selectedMethod.id !== "qris" && (
                        <div className="text-center py-12">
                          <p className="text-lg mb-8">Anda akan diarahkan ke <span className="font-bold">{selectedMethod.label}</span>...</p>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-8 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                            <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                            <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
                          </div>
                        </div>
                      )}

                      {selectedMethod.group === "cstore" && (
                        <div className="text-center">
                          <p className="text-sm text-slate-500 mb-2">Kode Pembayaran</p>
                          <div className="text-[36px] font-light tracking-tight text-emerald-900 mb-6 font-mono">
                            AGRI29384756
                          </div>
                          <p className="text-sm text-slate-600 max-w-sm mx-auto">
                            Tunjukkan kode ini ke kasir {selectedMethod.label} terdekat. Kasir akan mengkonfirmasi detail pesanan Anda.
                          </p>
                        </div>
                      )}

                      {selectedMethod.group === "card" && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-emerald-600" />
                          </div>
                          <h3 className="font-medium text-lg mb-2">Memproses Kartu...</h3>
                          <p className="text-sm text-slate-500">Mohon jangan tutup halaman ini.</p>
                        </div>
                      )}

                      <div className="mt-12">
                        <button 
                          onClick={handleFinish}
                          className="w-full bg-emerald-900 text-white py-4 rounded-xl font-semibold hover:bg-emerald-500 transition-colors"
                        >
                          Saya sudah membayar
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STATE 3: SUCCESS */}
              {state === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[500px] flex items-center justify-center border border-black/10 rounded-xl bg-white"
                >
                  <div className="text-center">
                    <motion.div 
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 220, 
                        damping: 18,
                        delay: 0.15 
                      }}
                      className="w-20 h-20 bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-900/20"
                    >
                      <Check className="w-10 h-10 text-white" strokeWidth={3} />
                    </motion.div>
                    <h2 className="text-[40px] font-normal tracking-tight mb-3">Pembayaran diterima</h2>
                    <p className="text-slate-600 mb-6">Pesananmu langsung diteruskan ke petani.</p>
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-600">
                      <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
                      Mengalihkan…
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Kolom Kanan */}
          <div>
            <div className="sticky top-24">
              <div className="bg-[#1a3d2e] text-white rounded-2xl p-8 shadow-xl shadow-emerald-900/10">
                <h3 className="text-xs font-bold tracking-widest uppercase text-white/60 mb-2">Ringkasan pesanan</h3>
                <div className="text-[40px] font-normal tracking-[-0.04em] leading-none mb-1">
                  Rp {total.toLocaleString("id-ID")}
                </div>
                <div className="text-emerald-400 text-sm font-medium mb-8">Total tagihan</div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Item ({itemsCount})</span>
                    <span className="font-medium text-white">Rp {itemTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Pengiriman</span>
                    <span className="font-medium text-white">Rp {shipping.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Biaya layanan</span>
                    <span className="font-medium text-white">Rp {serviceFee.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="h-px bg-white/15 w-full mb-6"></div>

                {/* Metode Terpilih Block */}
                <div className="mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-xs font-bold tracking-widest uppercase text-white/40 mb-3">Metode terpilih</div>
                    {selectedMethod ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                          <selectedMethod.icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{selectedMethod.label}</div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">{selectedMethod.sub}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-white/40 italic">Belum dipilih</div>
                    )}
                  </div>
                </div>

                {state === "select" && (
                  <button 
                    onClick={handlePay}
                    disabled={!selectedMethod}
                    className="w-full bg-white text-[#1a3d2e] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 group hover:bg-emerald-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Bayar Rp {total.toLocaleString("id-ID")}
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    PCI-DSS Compliant
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                    <Lock className="w-4 h-4" />
                    256-bit encryption
                  </div>
                </div>
                <div className="text-center text-[10px] font-bold tracking-widest uppercase text-white/30 mt-4">
                  Powered by Midtrans
                </div>
              </div>

              {/* Info Card */}
              <div className="mt-6 bg-white border border-black/5 p-5 rounded-xl text-sm text-slate-500 leading-relaxed">
                Simulasi otomatis. Saat pembayaran terkonfirmasi, pesanan langsung diteruskan ke dasbor petani.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
