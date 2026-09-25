"use client";

import { useEffect, useState } from "react";
import { Banknote, CheckCircle2, CircleAlert, LockKeyhole, UnlockKeyhole } from "lucide-react";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CashSession = { id: number; openingAmount: number | string; openedAt: string; status: string; cashierName: string; expectedAmount?: number | string; closingAmount?: number | string; difference?: number | string };

export default function CashRegisterPage() {
  const [session, setSession] = useState<CashSession | null>(null);
  const [amount, setAmount] = useState(""); const [notes, setNotes] = useState(""); const [message, setMessage] = useState<string | null>(null); const [loading, setLoading] = useState(true);
  const load = async () => { setLoading(true); const res = await fetch("/api/cash-session"); const data = await res.json(); setSession(data.session); setLoading(false); };
  useEffect(() => { load(); }, []);
  const submit = async (method: "POST" | "PATCH") => {
    setMessage(null); const res = await fetch("/api/cash-session", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(method === "POST" ? { openingAmount: amount, notes } : { closingAmount: amount }) });
    const data = await res.json(); if (!res.ok) { setMessage(data.error); return; } setSession(method === "POST" ? data.session : null); setAmount(""); setNotes(""); setMessage(method === "POST" ? "Caja abierta correctamente." : "Caja cerrada correctamente.");
  };
  const amountLabel = session ? "Efectivo contado al cierre" : "Monto de apertura";
  return <div className="mx-auto max-w-3xl space-y-6">
    <div><p className="text-sm font-semibold text-purple-600">OPERACIÓN DIARIA</p><h1 className="text-3xl font-bold text-gray-900">Caja registradora</h1><p className="mt-1 text-gray-500">Cajera actual: Elizabeth Oña</p></div>
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-theme-lg">
      {loading ? <p className="text-gray-500">Cargando estado de caja…</p> : session ? <div className="space-y-6">
        <div className="flex items-center gap-4"><span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><UnlockKeyhole /></span><div><h2 className="text-xl font-bold">Caja abierta</h2><p className="text-sm text-gray-500">Desde {new Date(session.openedAt).toLocaleString("es-EC")}</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-violet-50 p-4"><p className="text-sm text-violet-700">Monto inicial</p><p className="text-2xl font-bold">${Number(session.openingAmount).toFixed(2)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-600">Estado</p><p className="text-2xl font-bold text-emerald-700">En servicio</p></div></div>
        <div><label className="mb-2 block text-sm font-semibold">{amountLabel}</label><Input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></div>
        <Button className="w-full bg-gray-900 text-white hover:bg-gray-800" disabled={!amount} onClick={() => submit("PATCH")}><LockKeyhole className="mr-2 h-4 w-4" />Cerrar caja</Button>
      </div> : <div className="space-y-6"><div className="flex items-center gap-4"><span className="rounded-2xl bg-purple-100 p-3 text-purple-700"><Banknote /></span><div><h2 className="text-xl font-bold">Abrir una nueva caja</h2><p className="text-sm text-gray-500">Es necesario abrir caja antes de cobrar una venta.</p></div></div><div><label className="mb-2 block text-sm font-semibold">{amountLabel}</label><Input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></div><div><label className="mb-2 block text-sm font-semibold">Notas (opcional)</label><Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observaciones de apertura" /></div><Button className="w-full bg-purple-700 text-white hover:bg-purple-800" disabled={!amount} onClick={() => submit("POST")}><UnlockKeyhole className="mr-2 h-4 w-4" />Abrir caja</Button></div>}
      {message && <p className={`mt-4 flex items-center gap-2 text-sm ${message.includes("correctamente") ? "text-emerald-600" : "text-red-600"}`}>{message.includes("correctamente") ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}{message}</p>}
    </div>
  </div>;
}
