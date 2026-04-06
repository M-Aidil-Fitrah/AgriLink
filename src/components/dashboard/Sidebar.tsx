import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, PackageSearch, Map, ShoppingBag, Heart, Activity } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pt-6 pb-6 shadow-sm z-20">
      <div className="px-6 mb-8 flex flex-col items-center text-center">
        <Image src="/logo_agrilink.png" width={80} height={80} className="w-14 h-14 object-contain mb-3" alt="Agrilink Logo" />
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
          { name: "Jejak", href: "/dashboard/jejak", icon: Activity },
        ].map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
