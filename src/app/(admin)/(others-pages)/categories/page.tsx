import { hasPermission } from "@/lib/authorization";
import CategoriesManagement from "@/components/categories/CategoriesManagement";
export default async function CategoriesPage() {
  if (!await hasPermission("business.settings.view")) return <p role="alert">No tienes permiso para ver las categorías.</p>;
  return <CategoriesManagement />;
}
