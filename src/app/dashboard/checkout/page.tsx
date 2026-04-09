import { CheckoutView } from "@/components/dashboard/buyer/CheckoutView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <CheckoutView />;
}
