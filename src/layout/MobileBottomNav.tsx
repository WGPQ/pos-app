"use client";

import Link from "next/link";
import { LayoutDashboard, MoreHorizontal, Package, ReceiptText, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/products", label: "Inventario", icon: Package },
  { href: "/sales", label: "Caja POS", icon: ShoppingCart },
  { href: "/sales", label: "Ventas", icon: ReceiptText },
  { href: "/reports", label: "Más", icon: MoreHorizontal },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-[9999] flex h-[72px] items-center justify-around border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(16,24,40,.08)] backdrop-blur lg:hidden">{items.map((item) => { const Icon = item.icon; const active = item.href === "/sales" ? pathname === "/sales" && item.label === "Caja POS" : pathname === item.href; return <Link key={item.label} href={item.href} className={`relative flex min-w-14 flex-col items-center gap-1 px-2 py-1 text-[10px] font-bold ${active ? "text-purple-700" : "text-slate-500"}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? "-mt-5 bg-purple-700 text-white shadow-lg shadow-purple-300" : ""}`}><Icon className="h-4 w-4" /></span><span>{item.label}</span></Link> })}</nav>;
}
