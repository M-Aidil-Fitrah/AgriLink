import { auth } from "@/auth";
import { FarmerDashboardView } from "@/components/dashboard/farmer/FarmerDashboardView";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user?.role === "FARMER") {
    return <FarmerDashboardView />;
  }
  return <DashboardOverview />;
}
