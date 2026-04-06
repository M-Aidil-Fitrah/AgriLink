import { auth } from "@/auth";
import { PesananView } from "@/components/dashboard/buyer/PesananView";
import { FarmerPesananView } from "@/components/dashboard/farmer/FarmerPesananView";

export default async function PesananPage() {
  const session = await auth();
  if (session?.user?.role === "FARMER") {
    return <FarmerPesananView />;
  }
  return <PesananView />;
}
