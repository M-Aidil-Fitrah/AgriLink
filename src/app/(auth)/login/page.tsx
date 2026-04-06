import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-gray-50 flex-col md:flex-row">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm flex justify-center">
          <LoginForm />
        </div>
      </div>
      <div className="hidden md:block relative flex-1">
        <div className="absolute inset-0 bg-emerald-900 overflow-hidden">
          {/* We use a placeholder image URL for the premium look */}
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1595841696677-6479ff3f62eb?q=80&w=2000&auto=format&fit=crop"
            alt="Agriculture landscape"
          />
          <div className="absolute inset-0 bg-linear-to-t from-emerald-950 via-emerald-900/80 to-transparent" />
          <div className="absolute bottom-16 left-12 right-12 text-white">
            <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-widest text-emerald-100 uppercase mb-6 inline-block">Masuk ke Sistem</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Kembali <br /><span className="text-emerald-300">Menyemai Karya</span>.
            </h2>
            <p className="text-emerald-100/90 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
              Lanjutkan langkah Anda mendukung petani lokal. Ciptakan ekosistem pangan cerdas dengan satu klik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
