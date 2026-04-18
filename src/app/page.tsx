import { LandingView } from "@/components/landing/LandingView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  
  return <LandingView isLoggedIn={!!session} />;
}
