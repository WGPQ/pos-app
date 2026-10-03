"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
      router.replace("/");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl">
      <div><p className="text-sm font-semibold text-purple-600">ELY PAPELERÍA</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Iniciar sesión</h1><p className="mt-2 text-sm text-gray-500">Accede de forma segura a tu punto de venta.</p></div>
      <label className="block text-sm font-semibold text-gray-700">Correo<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
      <label className="block text-sm font-semibold text-gray-700">Contraseña<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button disabled={loading} className="h-11 w-full rounded-xl bg-purple-700 font-semibold text-white hover:bg-purple-800 disabled:opacity-60">{loading ? "Ingresando…" : "Ingresar"}</button>
    </form>
  </main>;
}
