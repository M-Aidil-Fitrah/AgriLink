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
          <div className="absolute inset-0 bg-linear-to-t from-emerald-900/80 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Empowering Sustainable Agriculture.</h2>
            <p className="text-emerald-100 text-lg">Connect directly with local farmers, reduce food miles, and ensure food quality right from the source.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
