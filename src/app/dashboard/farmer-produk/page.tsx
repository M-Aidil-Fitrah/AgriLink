import { FarmerProdukView } from "@/components/dashboard/farmer/FarmerProdukView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function FarmerProdukPage() {
  const session = await auth();
  if (!session || session.user.role !== "FARMER") redirect("/dashboard");
  return <FarmerProdukView />;
}
