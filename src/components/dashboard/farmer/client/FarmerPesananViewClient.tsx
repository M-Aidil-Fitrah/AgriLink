"use client";

import { useState } from "react";
import { OrderStatus } from "@prisma/client";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { UpdateStatusButton } from "../UpdateStatusButton";
import { Pagination } from "@/components/ui/Pagination";

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; color: string; Icon: React.ElementType; filterLabel: string }
> = {
  PENDING: { label: "Menunggu", filterLabel: "Menunggu", color: "text-amber-600 bg-amber-50 border-amber-200", Icon: Clock },
  PROCESSING: { label: "Diproses", filterLabel: "Diproses", color: "text-blue-600 bg-blue-50 border-blue-200", Icon: Package },
  SHIPPED: { label: "Dikirim", filterLabel: "Dikirim", color: "text-purple-600 bg-purple-50 border-purple-200", Icon: Truck },
  DELIVERED: { label: "Selesai", filterLabel: "Selesai", color: "text-emerald-600 bg-emerald-50 border-emerald-200", Icon: CheckCircle },
  CANCELLED: { label: "Dibatalkan", filterLabel: "Dibatalkan", color: "text-red-600 bg-red-50 border-red-200", Icon: XCircle },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

type OrderItemWithProduct = {
  id: string;
  quantity: number;
  price: number;
  product: { id: string; name: string; images: string[]; price: number; unit: string } | null;
};

type OrderWithItems = {
  id: string;
  status: OrderStatus;
  createdAt: Date;
  deliveryAddress: string | null;
  note: string | null;
  total: number;
  user?: { id: string; name: string | null; email: string | null; role: string } | null;
  items: OrderItemWithProduct[];
};

export function FarmerPesananViewClient({
  initialOrders,
}: {
  initialOrders: OrderWithItems[];
}) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredOrders = initialOrders.filter(
    (order) => selectedStatus === "ALL" || order.status === selectedStatus
  );

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Pesanan Masuk</h2>
        <p className="text-gray-500 font-medium mt-1">
          {initialOrders.length} pesanan diterima
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-gray-50/50 p-2 rounded-2xl w-fit">
        <button
          onClick={() => { setSelectedStatus("ALL"); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedStatus === "ALL"
              ? "bg-white text-emerald-700 shadow-sm border border-gray-100"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
          }`}
        >
          Semua
        </button>
        {Object.entries(STATUS_MAP).map(([key, info]) => {
          const status = key as OrderStatus;
          const isActive = selectedStatus === status;
          return (
            <button
              key={status}
              onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-white text-emerald-700 shadow-sm border border-gray-100"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
              }`}
            >
              <info.Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-500" : ""}`} />
              {info.filterLabel}
            </button>
          );
        })}
      </div>

      {currentOrders.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">Belum ada pesanan</p>
          <p className="text-gray-400 text-sm mt-2">
            Pesanan dengan status tersebut akan muncul di sini
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {currentOrders.map((order) => {
            const statusInfo = STATUS_MAP[order.status];
            const StatusIcon = statusInfo.Icon;
            const nextStatus = NEXT_STATUS[order.status];

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Pesanan #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      Pembeli: {order.user?.name ?? order.user?.email ?? "Pembeli Anonim"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </span>
                    {nextStatus && (
                      <UpdateStatusButton orderId={order.id} targetStatus={nextStatus} />
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                        <Image
                          src={
                            item.product?.images?.[0] ||
                            "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"
                          }
                          alt={item.product?.name ?? "Produk"}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.product?.unit} × Rp{" "}
                          {item.price?.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm shrink-0">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-gray-50 gap-4">
                  <div className="flex-1 space-y-1">
                    {order.note && (
                      <p className="text-xs text-gray-500 italic">
                        <span className="font-bold not-italic">Catatan:</span> {order.note}
                      </p>
                    )}
                    {order.deliveryAddress && (
                      <p className="text-xs text-gray-500 font-medium">
                        <span className="font-bold text-gray-700">Kirim ke:</span> {order.deliveryAddress}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Pesanan</p>
                    <p className="text-lg font-black text-emerald-700">
                      Rp {order.total?.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
