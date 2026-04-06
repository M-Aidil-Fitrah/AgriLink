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
  LogOut
} from "lucide-react";
import { LocationDisplay } from "@/components/dashboard/LocationDisplay";
import Image from "next/image";

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
          <Image src="/logo_agrilink.png" width={150} height={100} className="w-16 h-auto object-contain mb-2" alt="Agrilink Logo" />
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">AgriLink</h1>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">Dari Petani, Untuk Anda</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Produk", href: "/dashboard/produk", icon: PackageSearch },
            { name: "Peta", href: "/dashboard/peta", icon: Map },
            { name: "Pesanan", href: "/dashboard/pesanan", icon: ShoppingBag },
            { name: "Favorit", href: "/dashboard/favorit", icon: Heart },
            { name: "Jejak Produk", href: "/dashboard/jejak", icon: Activity },
            { name: "Notifikasi", href: "/dashboard/notifikasi", icon: Bell },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-gray-500 hover:bg-emerald-50 hover:text-emerald-700`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-auto space-y-4">
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
            <LocationDisplay />
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
