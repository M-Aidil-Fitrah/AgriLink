import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex bg-gray-50 flex-col md:flex-row">
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm flex justify-center">
          <RegisterForm />
        </div>
      </div>
      <div className="hidden md:block relative flex-1 order-first">
        <div className="absolute inset-0 bg-emerald-900 overflow-hidden">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
            src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2000&auto=format&fit=crop"
            alt="Farmer in field"
          />
          <div className="absolute inset-0 bg-linear-to-t from-emerald-900/90 to-emerald-900/20" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Join the Movement.</h2>
            <p className="text-emerald-100 text-lg">Whether you are growing the food or putting it on your table, Agrilink bridges the gap.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
