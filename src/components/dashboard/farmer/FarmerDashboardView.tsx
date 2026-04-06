import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Package, ShoppingBag, MapPin } from "lucide-react";

export async function FarmerDashboardView() {
  const session = await auth();
  if (!session) return null;

  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      where: { farmerId: session.user.id },
      select: { id: true, stock: true, latitude: true, longitude: true },
    }),
    prisma.order.findMany({
      where: { items: { some: { product: { farmerId: session.user.id } } } },
      select: { id: true, total: true, status: true, createdAt: true },
    }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(
    (o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "SHIPPED"
  ).length;
  const productsWithLocation = products.filter(
    (p) => p.latitude != null && p.longitude != null
  ).length;
  const userName = session.user.name?.split(" ")[0] ?? "Petani";

  return (
    <div className="p-8 pb-20">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-emerald-900 text-white p-8 mb-8">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=1200')] bg-cover bg-center opacity-20" />
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2">
            Selamat datang, <span className="text-emerald-400">{userName}!</span>
          </h2>
          <p className="text-emerald-100 font-medium max-w-lg">
            Pantau performa penjualan Anda, kelola katalog, dan pastikan produk terbaik sampai ke tangan pembeli.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: "Total Pendapatan",
            value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
            Icon: TrendingUp,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
          },
          {
            label: "Total Produk",
            value: `${products.length}`,
            Icon: Package,
            bg: "bg-blue-50",
            color: "text-blue-600",
          },
          {
            label: "Pesanan Aktif",
            value: `${activeOrders}`,
            Icon: ShoppingBag,
            bg: "bg-amber-50",
            color: "text-amber-600",
          },
          {
            label: "Produk Berlokas",
            value: `${productsWithLocation}`,
            Icon: MapPin,
            bg: "bg-purple-50",
            color: "text-purple-600",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div
              className={`w-12 h-12 ${metric.bg} ${metric.color} rounded-xl flex items-center justify-center mb-4`}
            >
              <metric.Icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {metric.label}
            </p>
            <p className="text-2xl font-black text-gray-900 mt-1">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Pesanan Terbaru</h3>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Belum ada pesanan masuk</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-bold text-gray-900 text-sm">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-700 text-sm">
                    Rp {order.total.toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs font-semibold text-gray-400">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
