import { getAllUsers } from "@/app/actions/adminActions";
import { AdminUsersView } from "@/components/admin/AdminUsersView";

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  return <AdminUsersView users={users} />;
}
