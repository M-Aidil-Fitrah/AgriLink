"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  ArrowRight, 
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
import { createMidtransTransactionAction, getMidtransStatusAction } from "@/app/actions/paymentActions";
import { toast } from "react-hot-toast";
import { MidtransChargeResponse } from "@/lib/midtrans-types";

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
      { id: "bni_va", label: "BNI", sub: "VIRTUAL ACCOUNT", group: "va", icon: Building2 },
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
    groupLabel: "Convenience Store",
    items: [
      { id: "indomaret", label: "Indomaret", sub: "GERAI", group: "cstore", icon: Store },
      { id: "alfamart", label: "Alfamart", sub: "GERAI", group: "cstore", icon: Store },
    ]
  }
];

type PaymentState = "select" | "instruction";

export default function PaymentView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart } = useCart();
  
  const rawTotal: string | null = searchParams.get("total");
  const rawShippingCost: string | null = searchParams.get("shippingCost");
  const rawShippingId: string | null = searchParams.get("shippingId");
  const note: string | null = searchParams.get("note");
  const address: string | null = searchParams.get("address");
  const rawItemsCount: string | null = searchParams.get("itemsCount");
  
  const total: number = rawTotal ? parseInt(rawTotal, 10) : 0;
  const itemsCount: number = rawItemsCount ? parseInt(rawItemsCount, 10) : 0;

  const shipping: number = rawShippingCost ? parseInt(rawShippingCost, 10) : 25000;
  
  // Dynamic Service Fee Calculation based on Midtrans standards
  const getServiceFee = (method: PaymentMethod | null, subtotal: number): number => {
    if (!method) return 2500; // Default placeholder
    
    switch (method.group) {
      case "va":
        return 4000; // Standard VA fee
      case "qris_ewallet":
        if (method.id === "qris") return Math.round(subtotal * 0.007); // QRIS GPN 0.7%
        return Math.round(subtotal * 0.02); // E-Wallet (GoPay/ShopeePay) ~2%
      case "cstore":
        return 5000; // Standard C-Store fee
      default:
        return 2500;
    }
  };

  const [state, setState] = useState<PaymentState>("select");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [midtransResponse, setMidtransResponse] = useState<MidtransChargeResponse | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Calculate totals dynamically
  // Note: 'total' from URL already includes a default 2500 service fee from checkout, 
  // so we subtract it first to get the base subtotal.
  const baseSubtotal = total - shipping - 2500;
  const serviceFee = getServiceFee(selectedMethod, baseSubtotal);
  const currentTotal = baseSubtotal + shipping + serviceFee;
  const itemTotal = baseSubtotal;

  useEffect(() => {
    const existingOrderId = searchParams.get("orderId");
    if (existingOrderId && state === "select") {
      const fetchStatus = async () => {
        setLoading(true);
        const result = await getMidtransStatusAction(existingOrderId);
        if (result.success && result.data) {
          const status = result.data.transaction_status;
          if (status === "settlement" || status === "capture") {
            // Only clear cart if it's a fresh cart checkout (not direct buy, not re-paying existing order)
            const isDirectBuy = searchParams.get("directBuy") === "true";
            const isExistingOrder = !!searchParams.get("orderId");
            if (!isDirectBuy && !isExistingOrder) {
              clearCart();
            }
            router.push(`/payment/status/${existingOrderId}`);
            return;
          } else if (status === "pending") {
            setMidtransResponse(result.data);
            setState("instruction");
            
            const pType = result.data.payment_type;
            let methodId = "";
            if (pType === "bank_transfer") {
              methodId = `${result.data.va_numbers?.[0]?.bank}_va` || "bca_va";
            } else if (pType === "echannel") {
              methodId = "mandiri";
            } else if (pType === "qris") {
              methodId = "qris";
            } else if (pType === "cstore") {
              methodId = result.data.store || "indomaret";
            }
            
            const foundMethod = PAYMENT_METHODS.flatMap(g => g.items).find(m => m.id === methodId);
            if (foundMethod) setSelectedMethod(foundMethod);
            
          } else if (status === "expire" || status === "cancel" || status === "deny") {
            toast.error("Transaksi ini sudah kedaluwarsa atau dibatalkan. Silakan beli ulang.");
          }
        }
        setLoading(false);
      };
      fetchStatus();
    }
  }, [searchParams, state, clearCart, router]);

  useEffect(() => {
    if (midtransResponse) {
      const txTime = new Date(midtransResponse.transaction_time).getTime();
      const now = new Date().getTime();
      
      let expiryTime;
      if (midtransResponse.expiry_time) {
        expiryTime = new Date(midtransResponse.expiry_time).getTime();
      } else {
        expiryTime = txTime + (24 * 60 * 60 * 1000);
      }
      
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000) - 5);
      setTimeLeft(diff);
    }
  }, [midtransResponse]);

  useEffect(() => {
    if (state === "instruction" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev: number) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state, timeLeft]);

  // Automatic Polling for Payment Status
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      const orderId = midtransResponse?.order_id || searchParams.get("orderId");
      if (!orderId || state !== "instruction") return;

      try {
        const result = await getMidtransStatusAction(orderId);
        if (result.success && result.data) {
          const status = result.data.transaction_status;
          
          if (status === "settlement" || status === "capture") {
            toast.success("Pembayaran berhasil dikonfirmasi!", {
              id: "payment-success", // Prevent duplicate toasts
            });
            
            // Only clear cart if it's a fresh cart checkout
            const isDirectBuy = searchParams.get("directBuy") === "true";
            const isExistingOrder = !!searchParams.get("orderId");
            if (!isDirectBuy && !isExistingOrder) {
              clearCart();
            }

            router.push(`/payment/status/${orderId}`);
          } else if (status === "expire" || status === "cancel" || status === "deny") {
            toast.error("Transaksi telah berakhir atau dibatalkan.");
            setState("select");
          }
        }
      } catch (error: unknown) {
        console.error("Polling error:", error);
      }
    };

    if (state === "instruction") {
      // Check every 5 seconds
      intervalId = setInterval(checkStatus, 5000);
      // Immediate check
      checkStatus();
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [state, midtransResponse?.order_id, searchParams, router, clearCart]);

  const handlePay = async (): Promise<void> => {
    if (!selectedMethod) {
      toast.error("Pilih metode pembayaran terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const isDirectBuy = searchParams.get("directBuy") === "true";
      const directProductId = searchParams.get("productId");
      const directQuantity = parseInt(searchParams.get("quantity") || "1");
      const existingOrderId = searchParams.get("orderId");

      let orderId = existingOrderId;
      let midtransItems = [];

      if (existingOrderId) {
        midtransItems = [
          {
            id: existingOrderId,
            price: currentTotal,
            quantity: 1,
            name: `Pelunasan Pesanan #${existingOrderId.slice(-8).toUpperCase()}`
          }
        ];
      } else {
        // 1. Create new order in DB
        const orderItems = (isDirectBuy && directProductId) 
          ? [{ 
              productId: directProductId, 
              quantity: directQuantity, 
              price: Math.round(itemTotal / directQuantity) 
            }]
          : items.map((item: CartItem) => ({
              productId: item.id,
              quantity: item.quantity,
              price: Math.round(item.price)
            }));

        const orderResult = await createOrderAction({
          total: currentTotal,
          items: orderItems,
          deliveryAddress: address || "Alamat tidak tersedia",
          note: note || undefined,
          shippingMethod: rawShippingId || "",
          shippingCost: shipping,
          paymentMethod: selectedMethod.id
        });

        if (!orderResult.success) {
          toast.error(orderResult.error || "Gagal membuat pesanan.");
          setLoading(false);
          return;
        }

        orderId = orderResult.data.id;
        midtransItems = [
          ...orderItems.map((oi, idx) => ({
            id: oi.productId,
            price: oi.price,
            quantity: oi.quantity,
            name: `Item ${idx + 1}`
          })),
          { id: "SHIPPING_FEE", price: shipping, quantity: 1, name: "Ongkos Kirim" },
          { id: "SERVICE_FEE", price: serviceFee, quantity: 1, name: "Biaya Layanan" }
        ];
      }

      if (!orderId) {
        toast.error("ID Pesanan tidak ditemukan.");
        setLoading(false);
        return;
      }

      // 2. Charge Midtrans (or Resume if already pending)
      let midtransResult;
      if (existingOrderId) {
        // Double check status first to avoid 406 conflict
        const statusCheck = await getMidtransStatusAction(existingOrderId);
        if (statusCheck.success && statusCheck.data && 
           (statusCheck.data.transaction_status === "pending" || 
            statusCheck.data.transaction_status === "settlement" || 
            statusCheck.data.transaction_status === "capture")) {
          midtransResult = statusCheck;
        } else {
          midtransResult = await createMidtransTransactionAction({
            orderId: orderId,
            grossAmount: currentTotal,
            paymentMethod: selectedMethod.id,
            customerDetails: {
              firstName: "Customer",
              email: "customer@example.com",
              phone: "08123456789"
            },
            items: midtransItems
          });
        }
      } else {
        midtransResult = await createMidtransTransactionAction({
          orderId: orderId,
          grossAmount: currentTotal,
          paymentMethod: selectedMethod.id,
          customerDetails: {
            firstName: "Customer",
            email: "customer@example.com",
            phone: "08123456789"
          },
          items: midtransItems
        });
      }

      if (midtransResult.success && midtransResult.data) {
        setMidtransResponse(midtransResult.data);
        setState("instruction");
      } else {
        toast.error(midtransResult.error || "Pembayaran gagal diproses.");
      }
    } catch (error: unknown) {
      console.error("PAY_ERROR:", error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (): Promise<void> => {
    const isDirectBuy = searchParams.get("directBuy") === "true";
    const isExistingOrder = !!searchParams.get("orderId");

    if (midtransResponse?.order_id) {
      if (!isDirectBuy && !isExistingOrder) {
        clearCart();
      }
      router.push(`/payment/status/${midtransResponse.order_id}`);
    } else {
      const existingOrderId = searchParams.get("orderId");
      if (existingOrderId) {
        // Re-paying existing order should never clear cart
        router.push(`/payment/status/${existingOrderId}`);
      } else {
        toast.error("Gagal menemukan ID Pesanan.");
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-24">
      {/* Header */}
      <header className="h-16 border-b border-black/10 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
              <Image src="/logo_agrilink.png" alt="Logo AgriLink" fill className="object-contain" priority />
            </div>
            <span className="font-bold text-xl tracking-tight text-stone-950">AgriLink</span>
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
                                      <div className="pt-2 flex items-center justify-end text-[10px] font-bold tracking-widest uppercase text-emerald-900 gap-1.5">
                                        <Lock className="w-3 h-3" />
                                        Diamankan oleh Midtrans
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
                            {selectedMethod.id === "mandiri" 
                              ? `${midtransResponse?.biller_code} ${midtransResponse?.bill_key}`
                              : midtransResponse?.va_numbers?.[0]?.va_number || midtransResponse?.permata_va_number || "Gagal memuat VA"}
                          </div>
                          <button 
                            onClick={() => {
                              const val = selectedMethod.id === "mandiri" 
                                ? `${midtransResponse?.biller_code}${midtransResponse?.bill_key}`
                                : midtransResponse?.va_numbers?.[0]?.va_number || midtransResponse?.permata_va_number;
                              if (val) {
                                navigator.clipboard.writeText(val);
                                toast.success("Nomor disalin!");
                              }
                            }}
                            className="bg-emerald-900 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 mx-auto hover:bg-emerald-800 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Salin Nomor
                          </button>
                          
                          <div className="mt-12 text-left max-w-md mx-auto">
                            <h4 className="font-medium mb-4">Cara membayar</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                              {[
                                "Buka aplikasi mobile banking Anda.",
                                "Pilih menu Transfer > Virtual Account.",
                                `Masukkan nomor VA: ${selectedMethod.id === "mandiri" ? midtransResponse?.bill_key : midtransResponse?.va_numbers?.[0]?.va_number || midtransResponse?.permata_va_number}`,
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

                      {selectedMethod.group === "qris_ewallet" && (selectedMethod.id === "qris" || selectedMethod.id === "gopay" || selectedMethod.id === "shopeepay") && (
                        <div className="text-center">
                          {(() => {
                            let qrUrl = midtransResponse?.actions?.find((a) => 
                              a.name.toLowerCase().includes("qr") || 
                              a.url.toLowerCase().includes("qr-code")
                            )?.url;

                            if (!qrUrl && midtransResponse?.transaction_id) {
                              const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
                              const baseUrl = isProd ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
                              qrUrl = `${baseUrl}/v2/qris/${midtransResponse.transaction_id}/qr-code`;
                            }

                            if (qrUrl) {
                              return (
                                <div className="w-[224px] h-[224px] bg-white border border-black/5 rounded-2xl mx-auto flex items-center justify-center relative mb-6 overflow-hidden">
                                  <Image src={qrUrl} alt="QRIS" width={224} height={224} className="w-full h-full object-contain" unoptimized />
                                </div>
                              );
                            }

                            return (
                              <div className="w-[224px] h-[224px] bg-slate-50 border border-black/5 rounded-2xl mx-auto flex items-center justify-center relative mb-6">
                                <QrCode className="w-48 h-48 text-emerald-900 opacity-20" strokeWidth={1} />
                                <p className="absolute text-[10px] font-bold text-slate-400">Tunggu sebentar...</p>
                              </div>
                            );
                          })()}
                          <p className="text-xs font-bold tracking-widest uppercase text-slate-500">
                            Scan menggunakan aplikasi apapun
                          </p>
                        </div>
                      )}

                      {selectedMethod.group === "cstore" && (
                        <div className="text-center">
                          <p className="text-sm text-slate-500 mb-2">Kode Pembayaran</p>
                          <div className="text-[36px] font-light tracking-tight text-emerald-900 mb-6 font-mono">
                            {midtransResponse?.payment_code || "MENUNGGU..."}
                          </div>
                          <p className="text-sm text-slate-600 max-w-sm mx-auto">
                            Tunjukkan kode ini ke kasir {selectedMethod.label} terdekat. Kasir akan mengkonfirmasi detail pesanan Anda.
                          </p>
                          <button 
                            onClick={() => {
                              if (midtransResponse?.payment_code) {
                                navigator.clipboard.writeText(midtransResponse.payment_code);
                                toast.success("Kode disalin!");
                              }
                            }}
                            className="mt-4 bg-emerald-900 text-white px-6 py-2.5 rounded-full font-medium flex items-center gap-2 mx-auto hover:bg-emerald-800 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Salin Kode
                          </button>
                        </div>
                      )}

                      {selectedMethod.group === "card" && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-emerald-600" />
                          </div>
                          <h3 className="font-medium text-lg mb-2">Memproses Kartu...</h3>
                          <p className="text-sm text-slate-500">Silakan ikuti instruksi 3D Secure yang muncul.</p>
                        </div>
                      )}
                      
                      <div className="mt-10 pt-8 border-t border-black/5 text-center">
                        <button 
                          onClick={handleCheckStatus}
                          className="w-full bg-emerald-900 text-white py-4 rounded-xl font-semibold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                        >
                          Cek Status Pembayaran
                          <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="mt-4 text-xs text-slate-400">
                          Klik tombol di atas untuk memverifikasi status pembayaran Anda.
                        </p>
                      </div>
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
                  Rp {currentTotal.toLocaleString("id-ID")}
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
                    disabled={!selectedMethod || loading}
                    className="w-full bg-white text-[#1a3d2e] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 group hover:bg-emerald-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-[#1a3d2e] border-t-transparent rounded-full animate-spin group-hover:border-white"></div>
                    ) : (
                      <>
                        Bayar Rp {currentTotal.toLocaleString("id-ID")}
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
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
