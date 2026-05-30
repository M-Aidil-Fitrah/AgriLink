"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

export function AdminMenuButton() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
      aria-label="Buka navigasi"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
