"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthHeader from "@/components/auth/AuthHeader";
import PasswordField from "@/components/form/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "No fue posible iniciar sesión.");
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-purple-100 bg-white p-6 shadow-xl shadow-purple-950/10 sm:p-8">
      <AuthHeader title="Iniciar sesión" description="Accede de forma segura a tu punto de venta." />
      <label className="block text-sm font-semibold text-gray-700">Correo<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
      <PasswordField label="Contraseña" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
      <Link href="/auth/forgot-password" className="block text-right text-sm text-purple-700 hover:underline">¿Olvidaste tu contraseña?</Link>
      {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button disabled={loading} className="h-11 w-full rounded-xl bg-purple-700 font-semibold text-white hover:bg-purple-800 disabled:opacity-60">{loading ? "Ingresando…" : "Ingresar"}</button>
      <p className="text-center text-sm text-gray-500">¿Aún no tienes una cuenta? <Link href="/auth/onboarding" className="font-semibold text-purple-700 hover:underline">Crea tu negocio</Link></p>
    </form>
  </main>;
}
