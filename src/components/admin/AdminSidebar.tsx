import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Users, FileCheck } from "lucide-react";

const ADMIN_LINKS = [
  { name: "Ringkasan", href: "/admin", icon: LayoutDashboard },
  { name: "Pengguna", href: "/admin/users", icon: Users },
  { name: "Pengajuan Seller", href: "/admin/aplikasi", icon: FileCheck },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col pt-6 pb-6 shadow-sm z-20 shrink-0">
      <div className="px-6 mb-8 flex flex-col items-center text-center">
        <Image
          src="/logo_agrilink.png"
          width={80}
          height={80}
          className="w-14 h-14 object-contain mb-3"
          alt="Agrilink Logo"
        />
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">AgriLink</h1>
        <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 mt-1 bg-emerald-50 px-3 py-0.5 rounded-full">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {ADMIN_LINKS.map((item) => (
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

      <div className="px-4 mt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </aside>
  );
}
