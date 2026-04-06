import { LenisProvider } from "../components/providers/LenisProvider";
import { HeroSection } from "../components/landing/HeroSection";

export default function Home() {
  return (
    <LenisProvider>
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-between">
        <HeroSection />
        
        {/* Placeholder section to test smooth scrolling */}
        <section className="w-full h-screen bg-white flex items-center justify-center">
          <h2 className="text-3xl font-bold text-gray-500">Misi Kami (Fitur Keberlanjutan)</h2>
        </section>
        
        <section className="w-full h-screen bg-gray-50 flex items-center justify-center">
          <h2 className="text-3xl font-bold text-gray-400">Produk Fitur (Katalog)</h2>
        </section>
      </main>
    </LenisProvider>
  );
}
