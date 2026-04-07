import { auth } from "@/auth";
import { FarmerDashboardView } from "@/components/dashboard/farmer/FarmerDashboardView";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  
  // Admin should be redirected to admin panel
  if (session.user.role === "ADMIN") redirect("/admin");
  
  if (session.user.role === "FARMER") {
    return <FarmerDashboardView />;
  }
  return <DashboardOverview />;
}
