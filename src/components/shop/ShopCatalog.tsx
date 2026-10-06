"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowLeft, ArrowRight, PackageSearch, Search, X } from "lucide-react";
import BusinessBrand from "@/components/business/BusinessBrand";
import type { PublicCatalog } from "@/lib/public-catalog";

export default function ShopCatalog({ initial }: { initial: PublicCatalog }) {
  const [data, setData] = useState(initial);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { const timer = setTimeout(() => { setTerm(search); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); input.current?.focus(); } };
    document.addEventListener("keydown", handleKey); return () => document.removeEventListener("keydown", handleKey);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    const query = new URLSearchParams({ q: term, page: String(page), ...(category ? { category: String(category) } : {}) });
    void fetch(`/api/shop/${encodeURIComponent(initial.business.slug)}?${query}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "No se pudo cargar el catálogo."); return result;
    }).then((result: PublicCatalog) => { setData(result); if (category && !result.categories.some(c => c.id === category)) { setCategory(null); setPage(1); } }).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudo cargar el catálogo."); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [term, category, page, retry, initial.business.slug]);
  const money = (price: string) => new Intl.NumberFormat("es-EC", { style: "currency", currency: data.business.currency }).format(Number(price));
  return <main className="min-h-screen bg-[#faf8ff] text-slate-900">
    <a href="#catalog-products" className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-4">Saltar a los productos</a>
    <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:gap-8"><BusinessBrand business={data.business} /><div className="relative min-w-0 flex-1"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input ref={input} aria-label="Buscar productos por nombre, descripción o categoría" value={search} onChange={e => setSearch(e.target.value)} placeholder="¿Qué estás buscando?" className="h-12 w-full rounded-2xl bg-slate-100 pl-12 pr-20 text-sm outline-none focus:ring-2 focus:ring-purple-500" />{search ? <button onClick={() => setSearch("")} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-white"><X className="size-4" /></button> : <kbd className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 sm:block">Ctrl+K</kbd>}</div></div>
      {data.categories.length > 0 && <nav aria-label="Categorías de productos" className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 pb-3"><button aria-pressed={category === null} onClick={() => { setCategory(null); setPage(1); }} className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-semibold ${category === null ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-purple-50"}`}>Todos los productos</button>{data.categories.map(item => <button key={item.id} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setPage(1); }} className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-sm font-semibold ${category === item.id ? "bg-purple-100 text-purple-700" : "text-slate-600 hover:bg-purple-50"}`}>{item.name}</button>)}</nav>}
    </header>
    {!term && !category && page === 1 && <section className="border-b border-purple-100 bg-gradient-to-br from-indigo-100 via-purple-100 to-purple-50"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:py-16 lg:grid-cols-2"><div><span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-purple-700">Nuestro catálogo</span><h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Encuentra lo que buscas <span className="text-purple-700">en {data.business.name}.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-600">Explora nuestros productos disponibles y descubre sus detalles y precios en un solo lugar.</p><a href="#catalog-products" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-purple-700 px-6 font-semibold text-white shadow-lg shadow-purple-200 hover:bg-purple-800">Explorar catálogo<ArrowDown className="size-4" aria-hidden="true" /></a></div>{data.products[0] ? <div className="mx-auto w-full max-w-md rounded-3xl border border-white bg-white/80 p-5 shadow-xl shadow-purple-200/60"><div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-purple-50"><Image src={data.products[0].image || "/placeholder.svg"} alt={data.products[0].name} fill sizes="(max-width: 768px) 90vw, 420px" className="object-contain p-4" priority /></div><div className="mt-4 flex items-start justify-between gap-4"><h2 className="font-bold text-slate-900">{data.products[0].name}</h2><p className="whitespace-nowrap text-xl font-bold text-purple-700">{money(data.products[0].price)}</p></div></div> : <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-white/50"><PackageSearch className="size-24 text-purple-300" aria-hidden="true" /></div>}</div></section>}
    <section id="catalog-products" aria-busy={loading} className="mx-auto max-w-7xl scroll-mt-44 px-5 py-10"><div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-purple-700">Explora nuestros productos</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">{category ? data.categories.find(c => c.id === category)?.name ?? "Productos" : term ? "Resultados de búsqueda" : "Todos los productos"}</h2></div><p role="status" className="text-sm text-slate-500">{loading ? "Buscando…" : `${data.pagination.total} productos disponibles`}</p></div>
      {error ? <div role="alert" className="rounded-2xl bg-red-50 p-5 text-red-700">{error}<button onClick={() => setRetry(value => value + 1)} className="ml-4 underline">Reintentar</button></div> : !data.products.length && !loading ? <div className="rounded-3xl border border-purple-100 bg-white p-12 text-center"><PackageSearch className="mx-auto size-12 text-purple-300" aria-hidden="true" /><h3 className="mt-4 text-xl font-semibold">{term || category ? "No encontramos productos" : "Pronto habrá productos disponibles"}</h3><p className="mt-2 text-slate-500">{term || category ? "Prueba otras palabras o explora todos los productos." : "Vuelve a visitar nuestro catálogo más adelante."}</p>{(term || category) && <button onClick={() => { setSearch(""); setCategory(null); setPage(1); }} className="mt-5 min-h-11 rounded-xl bg-purple-700 px-5 font-semibold text-white">Ver todos los productos</button>}</div> : <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ${loading ? "opacity-60" : ""}`}>{data.products.map(product => <article key={product.id} className="overflow-hidden rounded-2xl border border-purple-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50"><Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px" className="object-contain p-3" /><span className="absolute left-2 top-2 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">Disponible</span></div><div className="px-1 pb-2 pt-4">{product.category && <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-purple-700">{product.category}</p>}<h3 className="text-sm font-bold leading-5 sm:text-base">{product.name}</h3>{product.description && <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-500">{product.description}</p>}<p className="mt-4 text-xl font-extrabold text-slate-900">{money(product.price)}</p></div></article>)}</div>}
      {data.pagination.totalPages > 1 && <nav aria-label="Páginas del catálogo" className="mt-8 flex items-center justify-center gap-4"><button disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)} aria-label="Página anterior" className="flex size-11 items-center justify-center rounded-xl border border-purple-100 bg-white disabled:opacity-40"><ArrowLeft className="size-4" /></button><span className="text-sm text-slate-600">Página {page} de {data.pagination.totalPages}</span><button disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage(value => value + 1)} aria-label="Página siguiente" className="flex size-11 items-center justify-center rounded-xl border border-purple-100 bg-white disabled:opacity-40"><ArrowRight className="size-4" /></button></nav>}
    </section>
    <footer className="border-t border-purple-100 bg-indigo-50/70 px-5 py-7 text-sm text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {data.business.name}. Todos los derechos reservados. Pasión por el detalle y el arte.</p>
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          <li>Privacidad</li>
          <li>Términos y Condiciones</li>
          <li>Mapa del Sitio</li>
        </ul>
      </div>
    </footer>
  </main>;
}
