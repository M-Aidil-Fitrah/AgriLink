"use client";

import { useState } from "react";
import { Search, ShoppingCart, LogOut } from "lucide-react";
import { LocationDisplay } from "./LocationDisplay";
import { Session } from "next-auth";
import { logout } from "@/app/actions/authActions";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "./buyer/CartDrawer";
import { NotificationDropdown } from "./NotificationDropdown";

export function TopHeader({ session }: { session: Session }) {
  const user = session.user;
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 shrink-0">

      <div className="w-full max-w-xl relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari produk segar, petani, atau lokasi..."
          className="w-full bg-gray-100/50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-50 text-gray-900 text-sm font-medium rounded-full pl-12 pr-4 py-2.5 outline-none transition-all"
        />
      </div>
      <div className="flex items-center gap-5 ml-4">
        <LocationDisplay />
        <NotificationDropdown />
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
              {totalItems}
            </span>
          )}
        </button>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />


        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold shadow-xs border border-emerald-200">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex flex-col min-w-[80px]">
             <span className="text-sm font-bold text-gray-900 leading-tight">{user?.name}</span>
             <span className="text-[10px] uppercase font-semibold text-gray-500">{user?.role}</span>
          </div>
          <form action={logout}>
            <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50" title="Keluar">
               <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
