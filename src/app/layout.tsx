import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import dynamic from 'next/dynamic';
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCartAction, type CartItemData } from "@/app/actions/cartActions";

// Lazy load the CartDrawer as it's not needed for initial page paint
const CartDrawer = dynamic(() => import("@/components/dashboard/buyer/CartDrawer").then(mod => mod.CartDrawer));

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agrilink - Marketplace Pertanian Berkelanjutan",
  description: "Menghubungkan petani langsung dengan konsumen.",
  icons: {
    icon: "/logo_agrilink.png",
  },
};

import { Suspense } from "react";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch fresh role from DB so cart & CartDrawer are only shown for USER role
  const session = await auth();
  const userId = session?.user?.id ?? null;

  let userRole: "USER" | "FARMER" | "ADMIN" | null = null;
  if (userId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      userRole = dbUser?.role ?? null;
    } catch (err) {
      console.error("Layout Role Fetch Error:", err);
      // Fallback to session role if DB fetch fails
      userRole = (session?.user as { role?: "USER" | "FARMER" | "ADMIN" | null })?.role || null;
    }
  }

  // Cart is only for buyers (USER role)
  const showCart = userRole === "USER";

  // Pre-fetch cart on server to prevent client-side infinite loops and hydration hangs
  let initialCartItems: CartItemData[] = [];
  if (showCart) {
    try {
      const cartResult = await getCartAction();
      if (cartResult.success && cartResult.data) {
        initialCartItems = cartResult.data.items;
      }
    } catch (e) {
      console.error("Failed to pre-fetch cart on server:", e);
    }
  }

  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className={`${jakartaSans.variable} ${jakartaSans.className} antialiased selection:bg-emerald-200 selection:text-emerald-900 bg-white`}
      >
        <CartProvider userId={userId} initialItems={initialCartItems}>
          {children}
          {showCart && <CartDrawer />}
          <Suspense fallback={null}>
            <ToastProvider />
          </Suspense>
        </CartProvider>
      </body>
    </html>
  );
}
