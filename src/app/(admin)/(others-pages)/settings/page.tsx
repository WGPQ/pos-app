import { hasPermission } from "@/lib/authorization";
import BusinessSettings from "@/components/business/BusinessSettings";

export default async function SettingsPage() {
  if (!await hasPermission("business.settings.view")) return <p role="alert">No tienes permiso para ver la configuración del negocio.</p>;
  return <BusinessSettings />;
}
