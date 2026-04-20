import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FarmerDashboardView } from "@/components/dashboard/farmer/FarmerDashboardView";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  // Fetch fresh user role from DB — the JWT may be stale if the role changed
  // after the user logged in (e.g., seller application was approved).
  const freshUser = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })
    : null;

  const role = freshUser?.role ?? session?.user?.role;

  // Admin should be redirected to admin panel
  if (role === "ADMIN") redirect("/admin");

  if (role === "FARMER") {
    return <FarmerDashboardView />;
  }
  return <DashboardOverview />;
}
