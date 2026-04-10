import { ProfileView } from "@/components/dashboard/ProfileView";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMyLocations } from "@/app/actions/profileActions";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [locations, user] = await Promise.all([
    getMyLocations(),
    prisma.user.findUnique({ where: { id: session.user.id } })
  ]);

  if (!user) redirect("/login");

  return <ProfileView user={user} initialLocations={locations} />;
}
