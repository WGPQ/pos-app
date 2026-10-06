import { hasPermission } from "@/lib/authorization";
import UsersManagement from "@/components/users/UsersManagement";

export default async function UsersPage() {
  if (!await hasPermission("user.view")) return <p role="alert">No tienes permiso para ver los usuarios.</p>;
  return <UsersManagement />;
}
