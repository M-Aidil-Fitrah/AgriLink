import { ProfileView } from "@/components/dashboard/ProfileView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyLocations } from "@/app/actions/profileActions";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const locations = await getMyLocations();

  return <ProfileView session={session} initialLocations={locations} />;
}
