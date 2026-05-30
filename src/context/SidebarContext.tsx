"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextValue {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

// Safe default — prevents hook count mismatch if consumed outside a Provider
const defaultValue: SidebarContextValue = {
  isOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
};

const SidebarContext = createContext<SidebarContextValue>(defaultValue);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext);
}
