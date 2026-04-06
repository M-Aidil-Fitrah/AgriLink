import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar role={session.user.role} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TopHeader session={session} />
        <div className="flex-1 overflow-y-auto w-full flex justify-center">
            <div className="w-full max-w-[1400px]">
               {children}
            </div>
        </div>
      </main>
    </div>
  );
}
