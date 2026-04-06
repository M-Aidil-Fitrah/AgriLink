import DashboardOverview from "@/components/dashboard/DashboardOverview";
import FarmerDashboard from "@/components/dashboard/FarmerDashboard";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user?.role === "FARMER") {
     return <FarmerDashboard />;
  }
  return <DashboardOverview />;
}
