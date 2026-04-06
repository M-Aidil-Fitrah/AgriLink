import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Agrilink - Marketplace Pertanian Berkelanjutan",
  description: "Menghubungkan petani langsung dengan konsumen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${jakartaSans.variable} ${jakartaSans.className} antialiased selection:bg-emerald-200 selection:text-emerald-900`}
      >
        {children}
      </body>
    </html>
  );
}
