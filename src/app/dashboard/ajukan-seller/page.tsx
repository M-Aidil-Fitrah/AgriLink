import { getMyApplication } from "@/app/actions/sellerApplicationActions";
import { AjukanSellerView } from "@/components/dashboard/buyer/AjukanSellerView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AjukanSellerPage() {
  const session = await auth();
  if (!session) redirect("/login");
  // Only USER role can apply
  if (session.user.role === "FARMER") redirect("/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin");

  const existingApplication = await getMyApplication();
  return <AjukanSellerView existingApplication={existingApplication} />;
}
