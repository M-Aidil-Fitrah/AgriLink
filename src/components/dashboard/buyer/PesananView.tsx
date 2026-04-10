import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

const STATUS_MAP: Record<
  OrderStatus,
  { label: string; color: string; Icon: React.ElementType }
> = {
  PENDING: {
    label: "Menunggu",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    Icon: Clock,
  },
  PROCESSING: {
    label: "Diproses",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    Icon: Package,
  },
  SHIPPED: {
    label: "Dikirim",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    Icon: Truck,
  },
  DELIVERED: {
    label: "Selesai",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    Icon: CheckCircle,
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "text-red-600 bg-red-50 border-red-200",
    Icon: XCircle,
  },
};

export async function PesananView() {
  const session = await auth();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              price: true,
              unit: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 pb-20">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Pesanan Saya</h2>
          <p className="text-gray-500 font-medium mt-1">
            Lacak status pengiriman produk Anda
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">Belum ada pesanan</p>
          <p className="text-gray-400 text-sm mt-2">
            Pesanan yang Anda buat akan muncul di sini
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = STATUS_MAP[order.status];
            const StatusIcon = statusInfo.Icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Header Pesanan */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <p className="text-xs font-bold text-gray-400 tracking-wider">
                      ID: #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${statusInfo.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* List Item */}
                <div className="p-6 divide-y divide-gray-50">
                  {order.items.map((item) => {
                    const product = item.product;
                    return (
                      <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-5">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden relative shrink-0">
                          <Image
                            src={
                              product?.images?.[0] ||
                              "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"
                            }
                            alt={product?.name ?? "Produk"}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate">
                            {product?.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.quantity} {product?.unit} × Rp{" "}
                            {item.price.toLocaleString("id-ID")}
                          </p>
                          <p className="text-sm font-extrabold text-emerald-700 mt-2">
                            Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Pesanan */}
                <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    Alamat: <span className="font-medium text-gray-600">{order.deliveryAddress || "-"}</span>
                  </p>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Bayar</p>
                    <p className="text-lg font-black text-gray-900 leading-tight">
                      Rp {order.total.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
