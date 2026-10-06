"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Coffee, Flower2, MoreHorizontal, Package, ShoppingBag, Store } from "lucide-react";
import PasswordField from "@/components/form/PasswordField";
import { BUSINESS_TYPES, parseOnboarding, validateBusinessDetails } from "@/lib/onboarding-input";

const icons = [ShoppingBag, Store, Coffee, Flower2, Package, MoreHorizontal];
const titles = ["Cuéntanos sobre tu negocio", "Configura tu primer usuario", "Todo listo para comenzar"];
const descriptions = ["Personaliza la información de tu empresa. Podrás editarla después desde Configuración.", "Elige los datos del administrador que tendrá acceso a tu portal.", "Revisa los datos antes de crear tu empresa y abrir tu punto de venta."];
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-purple-200 bg-purple-50/30 px-4 text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";
const buttonClass = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-purple-600 px-7 font-semibold text-white shadow-md shadow-purple-200 hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-60";

export default function OnboardingForm() {
  const router = useRouter();
  const heading = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ businessName: "", businessEmail: "", phone: "", businessType: "", otherBusinessType: "", useBusinessProfile: true, userName: "", userEmail: "", password: "", confirmation: "" });
  const [error, setError] = useState("");
  const [exists, setExists] = useState(false);
  const [saving, setSaving] = useState(false);
  function change(key: keyof typeof form, value: string | boolean) { setForm(current => ({ ...current, [key]: value })); setError(""); setExists(false); }
  function go(next: number) { setStep(next); setError(""); setExists(false); requestAnimationFrame(() => heading.current?.focus()); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try {
      if (step === 0) { validateBusinessDetails(form); go(1); return; }
      parseOnboarding(form);
      if (step === 1) { go(2); return; }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Revisa los datos."); return; }
    setSaving(true);
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) { setExists(data.code === "EMAIL_EXISTS"); throw new Error(data.error || "No se pudo crear el negocio."); }
      setForm(current => ({ ...current, password: "", confirmation: "" }));
      router.replace("/dashboard"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear el negocio."); setSaving(false); }
  }
  const administrator = form.useBusinessProfile ? { name: form.businessName, email: form.businessEmail } : { name: form.userName, email: form.userEmail };
  const businessType = form.businessType === "other" ? form.otherBusinessType : BUSINESS_TYPES.find(type => type.value === form.businessType)?.label || "Sin especificar";
  return <main className="min-h-screen bg-[#faf8ff] px-4 pb-8 text-slate-900 [background-image:radial-gradient(#e9ddff_1px,transparent_1px)] [background-size:24px_24px] sm:px-6">
    <header className="sticky top-0 z-40 -mx-4 border-b border-purple-100 bg-[#faf8ff]/95 px-4 shadow-sm backdrop-blur sm:-mx-6 sm:px-6"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 py-4"><Link href="/" className="flex items-center gap-2"><Image src="/pos.png" alt="" width={48} height={48} priority className="rounded-xl" /><div><p className="text-xl font-bold tracking-tight">Simplio<span className="text-purple-600">POS</span></p><p className="text-xs font-semibold uppercase tracking-wide text-purple-500">Configura tu negocio</p></div></Link><Link href="/auth/login" className="inline-flex min-h-11 items-center rounded-full border border-purple-100 bg-white px-4 text-sm font-semibold text-purple-700 hover:bg-purple-50">Ya tengo una cuenta</Link></div></header>
    <section className="mx-auto mt-5 max-w-3xl sm:mt-9">
      <div className="text-center"><p className="inline-flex rounded-full bg-purple-100 px-4 py-1 text-xs font-semibold text-purple-600">PASO {step + 1} DE 3</p><h1 ref={heading} tabIndex={-1} className="mt-4 scroll-mt-36 text-3xl font-bold tracking-tight outline-none sm:scroll-mt-28 sm:text-4xl">{titles[step]}</h1><p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-500">{descriptions[step]}</p></div>
      <ol aria-label="Progreso del registro" className="mx-auto my-7 grid max-w-lg grid-cols-3 gap-1 rounded-2xl border border-purple-100 bg-white p-1.5">{["Negocio", "Acceso", "Revisión"].map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${step === i ? "bg-purple-600 text-white" : i < step ? "bg-purple-50 text-purple-600" : "text-slate-500"}`}><span className={`flex size-5 items-center justify-center rounded-full text-xs ${step === i ? "bg-white/25" : "bg-purple-50"}`}>{i < step ? <Check className="size-3" /> : i + 1}</span>{label}</li>)}</ol>
      <form onSubmit={submit} className="rounded-3xl border border-purple-100 bg-white p-6 shadow-xl shadow-purple-950/5 sm:p-9">
        <fieldset disabled={saving} className="space-y-6">
          {step === 0 && <>
            <label className="block text-sm font-semibold text-slate-700">Nombre comercial del negocio<input required autoComplete="organization" maxLength={100} value={form.businessName} onChange={e => change("businessName", e.target.value)} placeholder="Ej. Luz Luna" className={inputClass} /></label>
            <fieldset><legend className="text-sm font-semibold text-slate-700">Giro comercial <span className="font-normal text-slate-500">(opcional)</span></legend><div className="mt-3 grid gap-3 sm:grid-cols-3">{BUSINESS_TYPES.map((type, i) => { const Icon = icons[i]; const selected = form.businessType === type.value; return <label key={type.value} className={`relative cursor-pointer rounded-2xl border-2 p-4 transition focus-within:ring-2 focus-within:ring-purple-400 ${selected ? "border-purple-500 bg-purple-50" : "border-slate-100 hover:border-purple-200"}`}><input type="radio" name="businessType" value={type.value} checked={selected} onChange={() => change("businessType", type.value)} className="sr-only" /><Icon className={`mb-3 size-9 rounded-lg p-2 ${selected ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"}`} />{selected && <CheckCircle2 className="absolute right-3 top-3 size-4 text-purple-600" />}<span className="block text-sm font-semibold">{type.label}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{type.description}</span></label>; })}</div>{form.businessType && <button type="button" onClick={() => change("businessType", "")} className="mt-2 min-h-9 text-xs text-purple-700 underline">Dejar sin giro comercial</button>}</fieldset>
            {form.businessType === "other" && <label className="block text-sm font-semibold text-slate-700">¿A qué se dedica tu negocio?<input required maxLength={100} value={form.otherBusinessType} onChange={e => change("otherBusinessType", e.target.value)} placeholder="Ej. Ferretería" className={inputClass} /></label>}
            <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Correo del negocio<input required type="email" autoComplete="email" maxLength={254} value={form.businessEmail} onChange={e => change("businessEmail", e.target.value)} placeholder="contacto@tuempresa.com" className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Teléfono del negocio<input required type="tel" autoComplete="tel" maxLength={40} value={form.phone} onChange={e => change("phone", e.target.value)} placeholder="+593 99 123 4567" className={inputClass} /></label></div><p className="text-xs leading-relaxed text-slate-500">Usa el código de país. Estos datos serán el contacto público cuando publiques tu tienda.</p><div className="rounded-xl bg-purple-50 p-4 text-sm"><span className="text-slate-500">Moneda inicial</span><p className="mt-1 font-semibold">USD · Dólar estadounidense</p></div>
          </>}
          {step === 1 && <>
            <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold text-slate-700">Perfil del primer administrador</legend>{[{ value: true, title: "Usar los datos de la empresa", subtitle: "El administrador tendrá el nombre y correo del negocio." }, { value: false, title: "Personalizar el primer usuario", subtitle: "Usa un nombre y correo diferentes para el administrador." }].map(option => <label key={String(option.value)} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${form.useBusinessProfile === option.value ? "border-purple-500 bg-purple-50" : "border-slate-100"}`}><input type="radio" name="profile" checked={form.useBusinessProfile === option.value} onChange={() => change("useBusinessProfile", option.value)} className="mt-1 accent-purple-600" /><span><span className="block text-sm font-semibold">{option.title}</span><span className="mt-1 block text-xs text-slate-500">{option.subtitle}</span></span></label>)}</fieldset>
            {form.useBusinessProfile ? <div className="rounded-xl bg-purple-50 p-4 text-sm"><p className="font-semibold">{administrator.name}</p><p className="mt-1 break-all text-slate-500">{administrator.email}</p></div> : <><label className="block text-sm font-semibold text-slate-700">Nombre del administrador<input required autoComplete="name" maxLength={100} value={form.userName} onChange={e => change("userName", e.target.value)} className={inputClass} /></label><label className="block text-sm font-semibold text-slate-700">Correo para iniciar sesión<input required type="email" autoComplete="email" maxLength={254} value={form.userEmail} onChange={e => change("userEmail", e.target.value)} className={inputClass} /></label></>}
            <PasswordField label="Contraseña" required autoComplete="new-password" minLength={12} maxLength={128} value={form.password} onChange={e => change("password", e.target.value)} />
            <PasswordField label="Confirmar contraseña" required autoComplete="new-password" minLength={12} maxLength={128} value={form.confirmation} onChange={e => change("confirmation", e.target.value)} />
            <p className="text-xs text-slate-500">Usa entre 12 y 128 caracteres. Este usuario tendrá el rol Administrador.</p>
          </>}
          {step === 2 && <><div className="rounded-2xl bg-purple-50 p-5"><h2 className="text-lg font-bold">Tu negocio</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">{[{ label: "Nombre", value: form.businessName }, { label: "Giro comercial", value: businessType }, { label: "Correo de contacto", value: form.businessEmail }, { label: "Teléfono", value: form.phone }, { label: "Moneda", value: "USD" }, { label: "Sucursal inicial", value: "Principal" }].map(item => <div key={item.label}><dt className="text-slate-500">{item.label}</dt><dd className="mt-1 break-words font-semibold">{item.value}</dd></div>)}</dl></div><div className="rounded-2xl border border-purple-100 p-5"><h2 className="font-bold">Administrador inicial</h2><p className="mt-2 text-sm">{administrator.name}</p><p className="mt-1 break-all text-sm text-slate-500">{administrator.email}</p></div><p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">Comenzarás con el inventario vacío y el catálogo público desactivado. Podrás añadir productos, subir el avatar y publicar tu tienda desde el portal.</p></>}
        </fieldset>
        {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p>{exists && <Link href="/auth/login" className="mt-2 inline-block font-semibold underline">Iniciar sesión con mi cuenta</Link>}</div>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-purple-100 pt-6">{step > 0 ? <button disabled={saving} type="button" onClick={() => go(step - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-500 hover:text-purple-700 disabled:opacity-60"><ArrowLeft className="size-4" />Atrás</button> : <Link href="/" className="min-h-11 py-3 text-sm text-slate-500">Volver al inicio</Link>}<button disabled={saving} className={buttonClass}>{saving ? "Creando tu negocio…" : step === 2 ? "Crear mi negocio" : "Continuar"}<ArrowRight className="size-4" /></button></div>
      </form>
      <p className="mt-7 text-center text-xs text-slate-500">© {new Date().getFullYear()} Simplio POS · Tu negocio, más simple.</p>
    </section>
  </main>;
}
