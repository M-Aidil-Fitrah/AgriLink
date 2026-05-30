"use client";

import { ShoppingCart, LogOut, Menu } from "lucide-react";
import { LocationDisplay } from "./LocationDisplay";
import { logout } from "@/app/actions/authActions";
import { useCart } from "@/context/CartContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { SearchBar } from "./SearchBar";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";

export function TopHeader({ user }: { user: { id: string, name: string | null, email: string | null, role: "USER" | "FARMER" | "ADMIN" } | null }) {
  const { totalItems, openCart } = useCart();
  const { toggleSidebar } = useSidebar();

  // Cart is only visible for USER role (buyers)
  const isUser = user?.role === "USER";

  return (
    <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 z-40 shrink-0 gap-3">

      {/* Hamburger button — mobile & tablet only */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Buka navigasi"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <SearchBar />
      </div>

      <div className="flex items-center gap-2 md:gap-5 shrink-0">
        <div className="hidden lg:block">
          <LocationDisplay />
        </div>
        {user && <NotificationDropdown />}

        {/* Shopping cart — buyers only */}
        {isUser && (
          <button
            onClick={openCart}
            className="relative text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </button>
        )}

        <div className="hidden md:block h-6 w-px bg-gray-200 mx-1" />

        {user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold shadow-xs border border-emerald-200 shrink-0">
              {user.name?.charAt(0) || "U"}
            </div>
            <div className="hidden md:flex flex-col min-w-[80px]">
              <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
              <span className="text-[10px] uppercase font-semibold text-gray-500">{user.role}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50" title="Keluar">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 md:px-4 py-2 text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-3 md:px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
