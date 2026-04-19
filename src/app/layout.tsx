import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import dynamic from 'next/dynamic';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className={`${jakartaSans.variable} ${jakartaSans.className} antialiased selection:bg-emerald-200 selection:text-emerald-900 bg-white`}
      >
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
