import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import {
  LayoutDashboard,
  PackageSearch,
  Map,
  ShoppingBag,
  Heart,
  Activity,
  Bell,
  Search,
  MapPin,
  ShoppingCart,
  LogOut,
  Leaf
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pt-6 pb-6 shadow-sm z-20">
        <div className="px-6 mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-[0_4px_10px_rgba(16,185,129,0.1)]">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">AgriLink</h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Dari Petani, Untuk Anda</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { name: "Dashboard", icon: LayoutDashboard, active: true },
            { name: "Produk", icon: PackageSearch },
            { name: "Peta", icon: Map },
            { name: "Pesanan", icon: ShoppingBag },
            { name: "Favorit", icon: Heart },
            { name: "Jejak Produk", icon: Activity },
            { name: "Notifikasi", icon: Bell },
          ].map((item) => (
            <Link
              key={item.name}
              href="#"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                item.active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-4">
          {/* Ad Banner */}
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <Leaf className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-emerald-800 mb-1">Dukung Pertanian Lokal</p>
            <p className="text-[10px] text-emerald-600 font-medium">Setiap pembelianmu membantu petani tumbuh.</p>
          </div>

          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase() || 'Pembeli'}</p>
            </div>
          </div>

          <form action={async () => {
             "use server";
             await signOut({ redirectTo: "/" });
          }}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div className="w-full max-w-xl relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari produk segar, petani, atau lokasi..."
              className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 text-gray-900 text-sm font-medium rounded-full pl-12 pr-4 py-2.5 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-6 ml-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Jakarta, ID
            </div>
            <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
            </button>
            <button className="relative text-gray-500 hover:text-gray-900 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto w-full flex justify-center">
            <div className="w-full max-w-[1400px]">
               {children}
            </div>
        </div>
      </main>
    </div>
  );
}
