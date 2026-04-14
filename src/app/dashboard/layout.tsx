import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  // Fetch fresh user data from DB to ensure name/profile is always up-to-date
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar user={user} />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <TopHeader user={user} />
        <div className="flex-1 overflow-y-auto w-full flex justify-center">
            <div className="w-full max-w-[1400px]">
               {children}
            </div>
        </div>
      </main>
    </div>
  );
}
