import { LenisProvider } from "../components/providers/LenisProvider";
import { HeroSection } from "../components/landing/HeroSection";
import { Navbar } from "../components/landing/Navbar";

export default function Home() {
  return (
    <LenisProvider>
      <main className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar />
        <HeroSection />
        
        {/* Placeholder sections with improved styling */}
        <section id="misi" className="w-full relative py-32 bg-white flex flex-col items-center justify-center border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
            <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm">Visi Kami</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Masa Depan Berkelanjutan</h2>
            <p className="text-xl text-gray-500 font-medium">Membangun ekosistem yang tidak hanya menguntungkan ekonomi petani, tapi juga menyayangi bumi lewat jejak karbon yang rendah dan adil.</p>
          </div>
        </section>
        
        <section id="katalog" className="w-full py-32 bg-gray-50 flex items-center justify-center border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
             <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Etalase Kejujuran Alam</h2>
             <p className="text-gray-500 font-medium text-lg">Segera hadir: Jelajahi hasil panen lokal hari ini langsung di layar Anda.</p>
          </div>
        </section>
      </main>
    </LenisProvider>
  );
}
