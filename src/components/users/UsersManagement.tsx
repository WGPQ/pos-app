"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/context/PermissionContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Option = { id: number; name: string; key?: string };
type Member = { id: number; status: string; user: { id: number; name: string; email: string; status: string }; role: Option; branches: { branch: Option }[] };
type Data = { users: Member[]; roles: Option[]; branches: Option[]; currentUserId: number };
type Draft = { name: string; email: string; roleId: number; branchIds: number[]; status: string };
const inputClass = "mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100";
const buttonClass = "min-h-11 rounded-xl bg-purple-700 px-4 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-60";

export default function UsersManagement() {
  const router = useRouter();
  const { can } = usePermissions();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [inviting, setInviting] = useState<number | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo cargar usuarios.");
      setData(result);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar usuarios."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  function open(member: Member | null) {
    setEditing(member); setFormError(""); setNotice("");
    setDraft(member ? { name: member.user.name, email: member.user.email, roleId: member.role.id, branchIds: member.branches.map(b => b.branch.id), status: member.status } : { name: "", email: "", roleId: data?.roles.find(role => role.key === "CASHIER")?.id ?? 0, branchIds: data?.branches.length === 1 ? [data.branches[0].id] : [], status: "ACTIVE" });
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!draft) return;
    if (!draft.branchIds.length) { setFormError("Selecciona al menos una sucursal."); return; }
    setSaving(true); setFormError("");
    try {
      const response = await fetch(editing ? `/api/users/${editing.id}` : "/api/users", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo guardar el usuario.");
      setDraft(null); setNotice(editing ? "Usuario actualizado." : result.invitationSent ? "Usuario creado. Invitación aceptada por el servicio de correo." : "Usuario creado, pero no se pudo enviar la invitación. Puedes reenviarla desde el listado.");
      await load(); router.refresh();
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : "No se pudo guardar el usuario."); }
    finally { setSaving(false); }
  }
  const filtered = data?.users.filter(m => `${m.user.name} ${m.user.email}`.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es"))) ?? [];
  const own = !!editing && editing.user.id === data?.currentUserId;

  async function resend(member: Member) {
    setInviting(member.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/users/${member.id}/invitation`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "No se pudo enviar la invitación.");
      setNotice(result.message);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo enviar la invitación."); }
    finally { setInviting(null); }
  }

  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm font-semibold text-purple-600">ADMINISTRACIÓN</p><h1 className="text-3xl font-bold text-gray-900">Usuarios</h1><p className="mt-1 text-sm text-gray-600">Gestiona el equipo, sus roles y el acceso a las sucursales del negocio.</p></div>
      {can("user.manage") && <button onClick={() => open(null)} disabled={!data || !!draft} className={buttonClass}>Invitar usuario</button>}
    </div>
    {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{notice}</p>}
    {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}<button onClick={() => void load()} className="ml-3 underline">Reintentar</button></div>}
    {draft && <form onSubmit={save} aria-labelledby="user-form-title" className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 id="user-form-title" className="text-xl font-bold text-gray-900">{editing ? "Editar usuario" : "Invitar usuario"}</h2>
      <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700">Nombre<input required autoFocus maxLength={100} autoComplete="name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputClass} /></label>
        <label className="text-sm font-semibold text-gray-700">Correo<input required type="email" maxLength={254} autoComplete="off" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className={inputClass} /></label>
        <label className="text-sm font-semibold text-gray-700">Rol<select required disabled={own} value={draft.roleId || ""} onChange={e => setDraft({ ...draft, roleId: Number(e.target.value) })} className={inputClass}>
          <option value="" disabled>Selecciona un rol</option>
          {editing && !data?.roles.some(r => r.id === editing.role.id) && <option value={editing.role.id}>{editing.role.name}</option>}
          {data?.roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
        </select></label>
        <label className="text-sm font-semibold text-gray-700">Acceso al negocio<select disabled={own} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })} className={inputClass}><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option></select></label>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-gray-700">Sucursales autorizadas</legend><div className="mt-2 flex flex-wrap gap-4">{data?.branches.map(branch => <label key={branch.id} className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="size-4 accent-purple-700" checked={draft.branchIds.includes(branch.id)} onChange={e => setDraft({ ...draft, branchIds: e.target.checked ? [...draft.branchIds, branch.id] : draft.branchIds.filter(id => id !== branch.id) })} />{branch.name}</label>)}</div></fieldset>
      </fieldset>
      <p className="text-sm text-gray-500">{editing ? "Guardar cierra las sesiones del usuario en este negocio, excepto tu sesión actual si editas tu propia cuenta. Para cambiar la contraseña, usa la recuperación desde el login." : "Recibirá un correo con el nombre del negocio y un enlace para definir su contraseña. El enlace caduca en 24 horas."}</p>
      {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
      <div className="flex gap-3"><button disabled={saving} className={buttonClass}>{saving ? "Guardando…" : "Guardar usuario"}</button><button type="button" disabled={saving} onClick={() => setDraft(null)} className="min-h-11 rounded-xl border border-gray-200 px-5 font-semibold text-gray-700">Cancelar</button></div>
    </form>}
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4"><input aria-label="Buscar usuarios por nombre o correo" placeholder="Buscar por nombre o correo…" value={search} onChange={e => setSearch(e.target.value)} className="h-10 w-full rounded-lg px-2 outline-none focus:ring-2 focus:ring-purple-500" /></div>
      {loading ? <p role="status" className="p-8 text-center text-gray-500">Cargando usuarios…</p> : !filtered.length ? <p className="p-8 text-center text-gray-500">{search ? "No hay usuarios que coincidan con la búsqueda." : "No hay usuarios para mostrar."}</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 text-gray-600"><tr>{["Usuario", "Rol", "Sucursales", "Estado", "Acciones"].map(h => <th scope="col" key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map(member => <tr key={member.id}>
        <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar className="size-10" aria-hidden="true"><AvatarFallback className="bg-purple-100 font-bold text-purple-700">{member.user.name.trim().split(/\s+/).slice(0, 2).map(p => Array.from(p)[0]).join("").toLocaleUpperCase("es") || "U"}</AvatarFallback></Avatar><div><p className="font-semibold text-gray-900">{member.user.name}{member.user.id === data?.currentUserId ? " (tú)" : ""}</p><p className="text-gray-500">{member.user.email}</p></div></div></td>
        <td className="px-5 py-4 text-gray-700">{member.role.name}</td><td className="px-5 py-4 text-gray-700">{member.branches.map(b => b.branch.name).join(", ") || "Sin sucursales"}</td>
        <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.status === "ACTIVE" && member.user.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{member.user.status !== "ACTIVE" ? "Cuenta inactiva" : member.status === "ACTIVE" ? "Activo" : "Inactivo"}</span></td>
        <td className="px-5 py-4">{can("user.manage") && <div className="flex flex-wrap gap-2"><button disabled={!!draft} onClick={() => open(member)} aria-label={`Editar usuario ${member.user.name}`} className="min-h-11 rounded-lg px-3 text-purple-700 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50">Editar</button>{member.status === "ACTIVE" && member.user.status === "ACTIVE" && <button disabled={inviting !== null} onClick={() => void resend(member)} aria-label={`Reenviar invitación a ${member.user.name}`} className="min-h-11 rounded-lg px-3 text-purple-700 hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50">{inviting === member.id ? "Enviando…" : "Reenviar invitación"}</button>}</div>}</td>
      </tr>)}</tbody></table></div>}
    </div>
  </section>;
}
