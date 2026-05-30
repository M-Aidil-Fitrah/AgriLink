"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileCheck, X } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

const ADMIN_LINKS = [
  { name: "Ringkasan", href: "/admin", icon: LayoutDashboard },
  { name: "Pengguna", href: "/admin/users", icon: Users },
  { name: "Pengajuan Seller", href: "/admin/aplikasi", icon: FileCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebar();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[999] w-64 bg-white border-r border-gray-100 flex flex-col pt-6 pb-6 shadow-sm shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:z-auto
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors md:hidden"
          aria-label="Tutup navigasi"
        >
          <X className="w-5 h-5" />
        </button>

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
          {ADMIN_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-700/5"
                    : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-700" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-4">
          <Link
            href="/dashboard"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </aside>
    </>
  );
}
