import { Mail, MapPin, Phone } from "lucide-react";

export type CompanyContact = { address?: string | null; email?: string | null; phone?: string | null };

export default function CompanyContactBar({ business }: { business: CompanyContact }) {
  if (!business.address && !business.email && !business.phone) return null;
  const linkClass = "inline-flex min-h-7 min-w-0 items-center gap-2 rounded px-1 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
  return <address aria-label="Contacto del negocio" className="bg-purple-700 px-4 py-0.5 text-sm not-italic text-white">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1">
      {business.address && <span className="inline-flex min-h-7 min-w-0 items-center gap-2"><MapPin className="size-4 shrink-0" aria-hidden="true" /><span className="break-words">{business.address}</span></span>}
      {business.email && <a href={`mailto:${encodeURIComponent(business.email)}`} className={linkClass}><Mail className="size-4 shrink-0" aria-hidden="true" /><span className="break-all">{business.email}</span></a>}
      {business.phone && <a href={`tel:${business.phone.replace(/[^+\d]/g, "")}`} className={linkClass}><Phone className="size-4 shrink-0" aria-hidden="true" /><span>{business.phone}</span></a>}
    </div>
  </address>;
}
