"use client";

import { useState } from "react";
import Image from "next/image";
import { BarChart3, Check, Globe, Package, Plus, ReceiptText, Search, Store } from "lucide-react";

const products = [
  { name: "Blusa azul", price: 18, stock: 24, image: "/front-crop-top-blue.png" },
  { name: "Bolso clásico", price: 25, stock: 12, image: "/minimalist-flap-chain-bag-black.png" },
  { name: "Top verde", price: 15, stock: 18, image: "/v-neck-rib-knit-top-green.png" },
];
const money = (value: number) => `$${value.toFixed(2)}`;
export default function ProductDemo({ tabs = false }: { tabs?: boolean }) {
  const [view, setView] = useState("pos");
  const [quantities, setQuantities] = useState([1, 1, 0]);
  const [receipt, setReceipt] = useState(false);
  const total = products.reduce((sum, p, i) => sum + p.price * quantities[i], 0);
  return <div>
    {tabs && <div role="tablist" aria-label="Vistas de demostración" className="mb-6 flex flex-wrap justify-center gap-3">{[{ id: "pos", name: "Punto de venta", icon: Store }, { id: "stock", name: "Control de inventario", icon: Package }, { id: "shop", name: "Catálogo público", icon: Globe }].map(tab => <button key={tab.id} id={`tab-${tab.id}`} role="tab" aria-selected={view === tab.id} aria-controls="demo-panel" onClick={() => setView(tab.id)} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 ${view === tab.id ? "bg-purple-600 text-white" : "bg-white text-slate-600"}`}><tab.icon className="size-4" />{tab.name}</button>)}</div>}
    <div id={tabs ? "demo-panel" : undefined} role={tabs ? "tabpanel" : undefined} aria-labelledby={tabs ? `tab-${view}` : undefined} className="rounded-2xl border border-purple-100 bg-white p-3 shadow-xl shadow-purple-950/10 sm:p-6">
      <div className="rounded-xl bg-[#f5f2ff] p-4 sm:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-semibold text-slate-700"><span className="size-2 rounded-full bg-emerald-500" />Tienda de ejemplo · {view === "pos" ? "Caja 01" : view === "stock" ? "Inventario" : "Catálogo"}</span><span className="rounded-full bg-white px-3 py-2 text-xs text-slate-500">Demostración · datos ficticios</span></div>
        <div className={`grid gap-5 ${view === "pos" ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
          <div><div className="mb-4 flex items-center gap-2 rounded-xl bg-white p-3 text-sm text-slate-500"><Search className="size-4" />{view === "stock" ? "Tus productos, siempre organizados" : "Encuentra tus productos en segundos"}</div><div className="grid gap-3 sm:grid-cols-3">{products.map((p, i) => <article key={p.name} className="overflow-hidden rounded-xl bg-white p-2 shadow-sm"><Image src={p.image} alt={p.name} width={220} height={160} className="h-32 w-full rounded-lg bg-slate-50 object-contain" /><h3 className="mt-2 text-sm font-semibold">{p.name}</h3><p className="text-xs text-slate-500">{view === "shop" ? "Disponible" : `Stock: ${p.stock} unidades`}</p><div className="mt-2 flex items-center justify-between"><p className="text-xl font-bold text-purple-600">{money(p.price)}</p>{view === "pos" && <button type="button" aria-label={`Añadir ${p.name} al ticket de demostración`} onClick={() => { setQuantities(q => q.map((n, index) => index === i ? Math.min(n + 1, p.stock) : n)); setReceipt(false); }} className="flex size-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 focus-visible:outline-2 focus-visible:outline-purple-600"><Plus className="size-4" /></button>}</div></article>)}</div>{view !== "pos" && <p className="mt-5 flex items-center gap-2 text-sm text-purple-700"><Check className="size-4" />{view === "stock" ? "Productos, precios y disponibilidad en una sola vista." : "Comparte el catálogo de tu negocio mediante un enlace público."}</p>}</div>
          {view === "pos" && <div className="rounded-xl bg-white p-4 sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-xl font-bold"><ReceiptText className="size-5 text-purple-600" />Ticket de ejemplo</h3><div className="space-y-2">{products.map((p, i) => quantities[i] > 0 && <div key={p.name} className="flex justify-between gap-3 rounded-lg bg-purple-50 p-3 text-sm"><span>{quantities[i]} × {p.name}</span><strong>{money(p.price * quantities[i])}</strong></div>)}</div><div className="my-6 flex items-center justify-between text-lg font-bold"><span>Total a cobrar</span><span className="text-2xl text-purple-600">{money(total)}</span></div><button onClick={() => setReceipt(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-purple-600 px-4 text-sm font-semibold text-white hover:bg-purple-700"><Check className="size-4" />Simular cobro</button>{receipt && <p role="status" className="mt-3 text-sm text-emerald-700">¡Listo! Cobro simulado. No se realizó ninguna transacción.</p>}<button onClick={() => { setQuantities([1, 1, 0]); setReceipt(false); }} className="mt-3 min-h-9 w-full text-xs text-slate-500 underline">Reiniciar ejemplo</button></div>}
        </div>
      </div>
    </div>
  </div>;
}

export function SalesChart() {
  return <div aria-label="Ejemplo ilustrativo de evolución de ventas" className="mt-6 rounded-xl bg-purple-50 p-4"><div className="flex h-28 items-end gap-3">{[45, 60, 72, 85, 100].map((height, i) => <div key={height} className="flex flex-1 flex-col justify-end gap-2"><span className="text-center text-xs text-slate-500">{["Lun", "Mar", "Mié", "Jue", "Vie"][i]}</span><div style={{ height }} className="rounded-t-md bg-purple-500" /></div>)}</div><p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><BarChart3 className="size-3" />Datos ilustrativos</p></div>;
}
