import RegisterForm from "./RegisterForm";

export function RegisterView() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-950 flex flex-col items-center justify-center">
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2000&auto=format&fit=crop"
          alt="Farmer in field"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-linear-to-b md:bg-linear-to-r from-white via-white/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row shadow-2xl">
        <div className="w-full md:w-[45%] h-full flex items-center justify-center bg-white/40 backdrop-blur-md px-6 md:px-12 lg:px-24">
          <RegisterForm />
        </div>
        
        <div className="hidden md:flex flex-1 flex-col justify-end p-16 pb-24 text-white drop-shadow-lg text-right items-end">
          <span className="w-fit px-4 py-2 bg-emerald-500/20 backdrop-blur-lg rounded-full text-xs font-bold tracking-widest text-emerald-50 uppercase mb-6 border border-emerald-400/30">
            Perubahan Dimulai Dari Anda
          </span>
          <h2 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight max-w-xl">
            Transparansi Pangan<br/><span className="text-emerald-400">Masa Depan.</span>
          </h2>
          <p className="text-emerald-50 text-lg lg:text-xl font-medium max-w-lg leading-relaxed shadow-sm">
            Baik Anda pahlawan hijau merawat bumi maupun yang menanti panen lokal segar; ini tempat Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
