import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 pb-8 border-t border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
             <div className="flex items-center gap-3 mb-4 opacity-90">
               <Image src="/logo_agrilink.png" alt="Agrilink Logo" width={48} height={48} className="w-12 h-12 object-contain grayscale brightness-200" />
               <span className="text-xl font-extrabold text-white tracking-tight">Agrilink</span>
             </div>
             <p className="text-sm max-w-sm mb-6 leading-relaxed">
               Membangun masa depan pertanian berkelanjutan di Indonesia dengan menghubungkan petani organik secara langsung kepada meja makan keluarga Anda.
             </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-widest uppercase">Perusahaan</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog Petani</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 text-sm tracking-widest uppercase">Bantuan</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Cara Retur</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Kontak</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-semibold">
          <p>&copy; {new Date().getFullYear()} Agrilink Indonesia. Seluruh hak cipta dilindungi.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
