import { getAllApplications } from "@/app/actions/sellerApplicationActions";
import { AdminApplicationsView } from "@/components/admin/AdminApplicationsView";

export default async function AdminApplicationsPage() {
  const applications = await getAllApplications();
  return <AdminApplicationsView applications={applications} />;
}
