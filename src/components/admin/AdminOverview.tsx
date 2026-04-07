import { getAdminStats } from "@/app/actions/adminActions";
import { Users, Sprout, ShoppingBag, Package, AlertCircle } from "lucide-react";
import Link from "next/link";

export async function AdminOverview() {
  const stats = await getAdminStats();
  if (!stats) return null;

  const metrics = [
    { label: "Total Pengguna", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/users" },
    { label: "Total Seller", value: stats.totalFarmers, icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/users" },
    { label: "Total Pesanan", value: stats.totalOrders, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50", href: "#" },
    { label: "Total Produk", value: stats.totalProducts, icon: Package, color: "text-amber-600", bg: "bg-amber-50", href: "#" },
  ];

  return (
    <div className="p-8 pb-20">
      {/* Hero Banner */}
      <div className="bg-linear-to-r from-emerald-700 to-emerald-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_50%,white,transparent)]" />
        <h2 className="text-3xl font-extrabold mb-2 relative z-10">Panel Admin</h2>
        <p className="text-emerald-100 font-medium relative z-10 max-w-md">
          Kelola pengguna, tinjau pengajuan seller, dan pantau aktivitas platform Agrilink.
        </p>
      </div>

      {/* Pending Applications Alert */}
      {stats.pendingApplications > 0 && (
        <Link href="/admin/aplikasi">
          <div className="mb-6 flex items-center gap-4 px-6 py-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors cursor-pointer">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-800">
                {stats.pendingApplications} pengajuan seller menunggu tinjauan
              </p>
              <p className="text-sm text-amber-600 font-medium">Klik untuk meninjau sekarang</p>
            </div>
          </div>
        </Link>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href}>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center ${m.color} mb-4`}>
                <m.icon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 block">{m.value}</span>
              <p className="text-xs font-semibold text-gray-400 mt-1">{m.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-5">
        <Link href="/admin/users">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">Manajemen Pengguna</h3>
                <p className="text-sm text-gray-500 font-medium">Tambah, hapus, dan kelola role pengguna</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/admin/aplikasi">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">Pengajuan Seller</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Tinjau dan setujui pengajuan akun seller
                  {stats.pendingApplications > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      {stats.pendingApplications} menunggu
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
