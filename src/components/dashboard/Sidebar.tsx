import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  PackageSearch,
  Map,
  ShoppingBag,
  Heart,
  Activity,
  Store,
  User,
} from "lucide-react";

const BUYER_SECONDARY_LINKS = [
  { name: "Ajukan Menjadi Seller", href: "/dashboard/ajukan-seller", icon: Store },
];



export function Sidebar({ user }: { user: { id: string, name: string | null, email: string | null, role: "USER" | "FARMER" | "ADMIN" } | null }) {
  const isFarmer = user?.role === "FARMER";
  
  const getSidebarLinks = () => {
    if (!user) return [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Produk", href: "/dashboard/produk", icon: PackageSearch },
      { name: "Toko", href: "/dashboard/toko", icon: Store },
      { name: "Peta", href: "/dashboard/peta", icon: Map },
      { name: "Jejak", href: "/dashboard/jejak", icon: Activity },
    ];
    if (isFarmer) return [
      { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
      { name: "Produk Saya", href: "/dashboard/farmer-produk", icon: PackageSearch },
      { name: "Pesanan Masuk", href: "/dashboard/pesanan", icon: ShoppingBag },
      { name: "Profil Saya", href: "/dashboard/profil", icon: User },
    ];
    return [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Produk", href: "/dashboard/produk", icon: PackageSearch },
      { name: "Toko", href: "/dashboard/toko", icon: Store },
      { name: "Peta", href: "/dashboard/peta", icon: Map },
      { name: "Pesanan", href: "/dashboard/pesanan", icon: ShoppingBag },
      { name: "Favorit", href: "/dashboard/favorit", icon: Heart },
      { name: "Jejak", href: "/dashboard/jejak", icon: Activity },
      { name: "Profil", href: "/dashboard/profil", icon: User },
    ];
  };

  const finalLinks = getSidebarLinks();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pt-6 pb-6 shadow-sm z-800 shrink-0">
      <div className="px-6 mb-8 flex flex-col items-center text-center">
        <Image
          src="/logo_agrilink.png"
          width={80}
          height={80}
          className="w-14 h-14 object-contain mb-3"
          alt="Agrilink Logo"
        />
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">AgriLink</h1>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">
          {isFarmer ? "Dashboard Seller" : "Dari Petani, Untuk Anda"}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {finalLinks.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Seller application link for buyers/guests only */}
      {!isFarmer && (
        <div className="px-4 mt-4 pt-4 border-t border-gray-100">
          {BUYER_SECONDARY_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-emerald-100 bg-emerald-50/50"
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
