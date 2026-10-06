"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type BusinessBrandData = { name: string; logoUrl: string | null };

export default function BusinessBrand({ business, compact = false }: { business: BusinessBrandData; compact?: boolean }) {
  const initials = business.name.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join("").toLocaleUpperCase("es") || "N";
  return <div className="flex min-w-0 items-center gap-3" title={business.name}>
    <Avatar className="size-10" aria-hidden="true"><AvatarImage src={business.logoUrl ?? undefined} alt="" className="object-cover" /><AvatarFallback className="bg-purple-600 font-bold text-white">{initials}</AvatarFallback></Avatar>
    {compact ? <span className="sr-only">{business.name}</span> : <span className="max-w-48 truncate text-lg font-bold text-gray-900 dark:text-white">{business.name}</span>}
  </div>;
}
