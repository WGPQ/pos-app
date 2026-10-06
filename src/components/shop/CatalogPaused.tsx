import Link from "next/link";
import { ArrowRight, Pause } from "lucide-react";
import BusinessBrand, { BusinessBrandData } from "@/components/business/BusinessBrand";

import WhatsAppButton from "./WhatsAppButton";
import CompanyContactBar, { CompanyContact } from "./CompanyContactBar";

export default function CatalogPaused({ business }: { business: BusinessBrandData & CompanyContact }) {
  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-white px-4 py-8 sm:py-12">
    <section className="w-full max-w-4xl rounded-3xl border border-white bg-white px-6 py-8 text-center shadow-xl shadow-purple-100/70 sm:px-12 sm:py-10">
      <div className="mb-6 overflow-hidden rounded-xl"><CompanyContactBar business={business} /></div>
      <div className="mb-8 flex justify-center"><BusinessBrand business={business} /></div>
      <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-amber-900"><Pause className="size-4" aria-hidden="true" />Catálogo en pausa</span>
      <div className="mx-auto my-8 max-w-sm rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 p-5 sm:my-10">
        <svg viewBox="0 0 400 260" fill="none" className="w-full" aria-hidden="true">
          <path d="M30 225Q200 214 370 225" stroke="#d8ddff" strokeWidth="5" strokeLinecap="round" />
          <rect x="118" y="116" width="166" height="100" rx="16" fill="white" />
          <path d="M201 116V216" stroke="#ede9fe" strokeWidth="4" />
          {[134, 154, 174, 194].map(y => <circle key={y} cx="201" cy={y} r="3" fill="#8b5cf6" />)}
          {[137, 153, 169].map(y => <path key={y} d={`M133 ${y}H185`} stroke="#d8ddff" strokeWidth="4" strokeLinecap="round" />)}
          <path d="M133 186H164" stroke="#6ee7b7" strokeWidth="4" strokeLinecap="round" />
          <path d="M220 174H268M220 191H253" stroke="#d8ddff" strokeWidth="4" strokeLinecap="round" />
          <path d="M234 141L240 147L251 134" stroke="#a78bfa" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M150 37V59M254 37V59" stroke="#c4b5fd" strokeWidth="3" strokeDasharray="3 4" />
          <rect x="122" y="57" width="160" height="38" rx="12" fill="#7c3aed" />
          <circle cx="150" cy="64" r="3" fill="white" /><circle cx="254" cy="64" r="3" fill="white" />
          <text x="202" y="82" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">PREPARANDO EL CATÁLOGO</text>
          <rect x="45" y="164" width="40" height="49" rx="10" fill="#e9d5ff" /><path d="M85 174C106 174 106 202 85 202" stroke="#8b5cf6" strokeWidth="5" />
          <rect x="323" y="162" width="35" height="52" rx="7" fill="#ede9fe" />
          <path d="M332 161L319 126M341 161L339 111M347 161L364 129" stroke="#7c3aed" strokeWidth="6" strokeLinecap="round" />
          <path d="M341 160L339 113" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" /><path d="M347 161L364 129" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
          <path d="M67 111L72 123L84 128L72 133L67 145L62 133L50 128L62 123Z" fill="#fbbf24" />
          <path d="M303 77L307 86L316 90L307 94L303 103L299 94L290 90L299 86Z" fill="#c4b5fd" />
          <circle cx="99" cy="221" r="15" fill="#6ee7b7" /><circle cx="99" cy="221" r="6" fill="white" />
        </svg>
      </div>
      <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">Estamos preparando <span className="text-purple-700">nuestro catálogo</span></h1>
      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">El catálogo de {business.name} está en pausa por el momento. Puedes volver a visitarnos más adelante para explorar nuestros productos.</p>
      <div className="mt-8 rounded-2xl bg-indigo-50 px-5 py-5"><p className="font-semibold text-purple-700">Gracias por tu visita</p><p className="mt-1 text-sm leading-6 text-slate-600">Cuando el negocio publique su catálogo, encontrarás aquí sus productos, categorías y precios.</p></div>
      <div className="mt-8 border-t border-purple-100 pt-6 text-sm text-slate-500"><p>¿Administras este negocio?</p><Link href="/login" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-semibold text-purple-700 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">Inicia sesión en tu panel de control<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
    </section>
  <WhatsAppButton business={business} /></main>;
}
