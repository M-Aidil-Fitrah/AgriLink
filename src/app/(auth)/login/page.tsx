import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-950 flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="https://images.unsplash.com/photo-1595841696677-6479ff3f62eb?q=80&w=2000&auto=format&fit=crop"
          alt="Agriculture landscape"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-b md:bg-linear-to-r from-white via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row shadow-2xl">
        <div className="w-full md:w-[45%] h-full flex items-center justify-center bg-white/40 backdrop-blur-md px-6 md:px-12 lg:px-24">
          <LoginForm />
        </div>
        
        <div className="hidden md:flex flex-1 flex-col justify-end p-16 pb-24 text-white drop-shadow-lg">
          <span className="w-fit px-4 py-2 bg-emerald-500/20 backdrop-blur-lg rounded-full text-xs font-bold tracking-widest text-emerald-50 uppercase mb-6 border border-emerald-400/30">
            Jejak Keberlanjutan Pangan
          </span>
          <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Kembali Menyemai <span className="text-emerald-400">Karya.</span>
          </h2>
          <p className="text-emerald-50 text-lg lg:text-xl font-medium max-w-lg leading-relaxed shadow-sm">
            Lanjutkan langkah Anda mendukung petani lokal. Ciptakan ekosistem pangan cerdas hanya dengan satu klik.
          </p>
        </div>
      </div>
    </div>
  );
}
