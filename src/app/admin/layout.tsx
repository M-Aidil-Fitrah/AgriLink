import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { logout } from "@/app/actions/authActions";
import { LogOut } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
          <p className="text-sm font-semibold text-gray-500">
            Panel Administrasi Agrilink
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-extrabold text-emerald-700">
                  {(session?.user?.name ?? session?.user?.email ?? "A")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{session?.user?.name ?? "Admin"}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Administrator</p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </form>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
