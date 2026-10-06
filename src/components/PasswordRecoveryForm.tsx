"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import PasswordField from "@/components/form/PasswordField";

export default function PasswordRecoveryForm({ token }: { token?: string }) {
  const reset = token !== undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputClass = "mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (reset && password !== confirmation) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reset ? { token, password } : { email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No fue posible completar la solicitud.");
      setMessage(data.message);
      setPassword("");
      setConfirmation("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible completar la solicitud.");
    } finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-xl">
      <div><p className="text-sm font-semibold text-purple-600">PUNTO DE VENTA</p><h1 className="mt-1 text-3xl font-bold text-gray-900">{reset ? "Nueva contraseña" : "Recuperar contraseña"}</h1><p className="mt-2 text-sm text-gray-500">{reset ? "Usa entre 12 y 128 caracteres para tu nueva contraseña." : "Ingresa tu correo y te enviaremos un enlace de recuperación."}</p></div>
      {message ? <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{message}</p> : reset && !token ? <p role="alert" className="text-sm text-red-700">Falta el enlace de recuperación. Solicita uno nuevo.</p> : <>
        {reset ? <>
          <PasswordField label="Nueva contraseña" required autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} />
          <PasswordField label="Confirmar contraseña" required autoComplete="new-password" minLength={12} maxLength={128} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </> : <label className="block text-sm font-semibold text-gray-700">Correo<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label>}
        {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <button disabled={loading} className="h-11 w-full rounded-xl bg-purple-700 font-semibold text-white hover:bg-purple-800 disabled:opacity-60">{loading ? "Procesando…" : reset ? "Guardar contraseña" : "Enviar enlace"}</button>
      </>}
      {reset && !message ? <Link href="/forgot-password" className="block text-center text-sm text-purple-700 hover:underline">Solicitar un nuevo enlace</Link> : null}
      <Link href="/login" className="block text-center text-sm text-purple-700 hover:underline">Volver a iniciar sesión</Link>
    </form>
  </main>;
}
