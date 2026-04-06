import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { OrderStatus } from "@prisma/client";
import { UpdateStatusButton } from "./UpdateStatusButton";
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react";

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

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PROCESSING",
  PROCESSING: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export async function FarmerPesananView() {
  const session = await auth();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: { product: { farmerId: session.user.id } },
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      items: {
        where: { product: { farmerId: session.user.id } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
              unit: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">Pesanan Masuk</h2>
        <p className="text-gray-500 font-medium mt-1">
          {orders.length} pesanan diterima
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-24 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-semibold text-lg">Belum ada pesanan</p>
          <p className="text-gray-400 text-sm mt-2">
            Pembelian dari pembeli akan muncul di sini
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
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
                      Pembeli: {order.user.name ?? order.user.email}
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
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={
                            item.product.image ||
                            "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=200"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.product.unit} × Rp{" "}
                          {item.price.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 text-sm shrink-0">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                  {order.note && (
                    <p className="text-xs text-gray-500 italic">Catatan: {order.note}</p>
                  )}
                  {order.deliveryAddress && (
                    <p className="text-xs text-gray-500 font-medium">
                      Kirim ke: {order.deliveryAddress}
                    </p>
                  )}
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500 font-semibold">Total</p>
                    <p className="text-lg font-extrabold text-emerald-700">
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
