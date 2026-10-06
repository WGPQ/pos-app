"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { usePermissions } from "@/context/PermissionContext";
import BusinessBrand, { BusinessBrandData } from "./BusinessBrand";

type Business = BusinessBrandData & { address: string | null; email: string | null; phone: string | null; currency: string; timezone: string; slug: string; catalogEnabled: boolean };
export default function BusinessSettings() {
  const router = useRouter();
  const { can } = usePermissions();
  const [business, setBusiness] = useState<Business | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const editable = can("business.settings.update");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/business", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar el negocio.");
      setBusiness(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar el negocio."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function upload(file: File) {
    setError(""); setNotice("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Selecciona una imagen JPEG, PNG o WEBP de hasta 5 MB."); return; }
    setUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const response = await fetch("/api/upload?purpose=business-avatar", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo subir el avatar.");
      setBusiness(current => current ? { ...current, logoUrl: data.data.secure_url } : current);
      setNotice("Avatar cargado. Guarda los cambios para aplicarlo.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo subir el avatar."); }
    finally { setUploading(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!business) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/business", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: business.name, logoUrl: business.logoUrl, catalogEnabled: business.catalogEnabled, address: business.address, email: business.email, phone: business.phone }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo guardar el negocio.");
      setBusiness(data); setNotice("Información del negocio actualizada."); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el negocio."); }
    finally { setSaving(false); }
  }
  return <section className="max-w-3xl space-y-6">
    <div><p className="text-sm font-semibold text-purple-600">CONFIGURACIÓN</p><h1 className="text-3xl font-bold text-gray-900">Información del negocio</h1><p className="mt-2 text-sm text-gray-600">Personaliza la identidad y los datos de contacto de tu empresa.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}{!business && <button onClick={() => void load()} className="ml-3 underline">Reintentar</button>}</p>}
    {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{notice}</p>}
    {loading ? <p role="status">Cargando configuración…</p> : business && <form onSubmit={save} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <BusinessBrand business={business} />
      <fieldset disabled={!editable || uploading || saving} className="space-y-5">
        <div><label htmlFor="company-avatar" className="block text-sm font-semibold text-gray-700">Avatar del negocio</label><input id="company-avatar" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full rounded-lg text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-50 file:px-4 file:py-3 file:font-semibold file:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void upload(file); }} /><p className="mt-2 text-xs text-gray-500">JPEG, PNG o WEBP. Máximo 5 MB.</p>{business.logoUrl && <button type="button" onClick={() => { setBusiness({ ...business, logoUrl: null }); setNotice(""); }} className="mt-2 min-h-10 rounded-lg px-3 text-sm text-purple-700 hover:bg-purple-50">Quitar avatar</button>}</div>
        <label className="block text-sm font-semibold text-gray-700">Nombre del negocio<input required maxLength={100} value={business.name} onChange={e => setBusiness({ ...business, name: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
      </fieldset>
      <fieldset disabled={!editable || saving} className="space-y-4">
        <legend className="text-base font-bold text-gray-800">Contacto público</legend>
        <p className="text-sm text-gray-600">Estos datos son opcionales y aparecerán en la tienda. Deja un campo vacío para ocultarlo. Para habilitar el botón de WhatsApp, usa un teléfono con + y código de país.</p>
        <label className="block text-sm font-semibold text-gray-700">Dirección<textarea maxLength={300} autoComplete="street-address" value={business.address ?? ""} onChange={e => setBusiness({ ...business, address: e.target.value })} rows={2} className="mt-2 w-full rounded-xl border border-gray-200 p-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-gray-700">Correo de contacto<input type="email" maxLength={254} autoComplete="email" value={business.email ?? ""} onChange={e => setBusiness({ ...business, email: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
          <label className="block text-sm font-semibold text-gray-700">Teléfono<input type="tel" maxLength={40} autoComplete="tel" placeholder="+593 99 123 4567" value={business.phone ?? ""} onChange={e => setBusiness({ ...business, phone: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
        </div>
      </fieldset>
      <fieldset disabled={!editable || saving} className="space-y-3 rounded-xl border border-purple-100 bg-purple-50 p-4">
        <legend className="px-2 text-sm font-bold text-gray-800">Catálogo público</legend>
        <label className="flex items-center gap-3 text-sm font-semibold text-gray-700"><input type="checkbox" checked={business.catalogEnabled} onChange={e => setBusiness({ ...business, catalogEnabled: e.target.checked })} className="size-4 accent-purple-700" />Publicar catálogo</label>
        <p className="text-sm text-gray-600">Muestra productos disponibles, imágenes y precios. Guarda los cambios para aplicar esta opción.</p>
        <a href={`/shop/${encodeURIComponent(business.slug)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white hover:bg-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2">
          Ver tienda <ExternalLink className="size-4" aria-hidden="true" /><span className="sr-only"> (abre en una nueva pestaña)</span>
        </a>
        <p className="break-all text-xs text-gray-500">/shop/{business.slug}</p>
      </fieldset>
      <dl className="grid gap-4 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2"><div><dt className="text-gray-500">Moneda</dt><dd className="mt-1 font-semibold text-gray-800">{business.currency}</dd></div><div><dt className="text-gray-500">Zona horaria</dt><dd className="mt-1 font-semibold text-gray-800">{business.timezone}</dd></div></dl>
      {uploading && <p role="status" className="text-sm text-gray-600">Subiendo avatar…</p>}
      {editable ? <button disabled={saving || uploading} className="min-h-11 rounded-xl bg-purple-700 px-5 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-60">{saving ? "Guardando…" : "Guardar cambios"}</button> : <p className="text-sm text-gray-500">Tienes acceso de lectura a esta configuración.</p>}
    </form>}
  </section>;
}
