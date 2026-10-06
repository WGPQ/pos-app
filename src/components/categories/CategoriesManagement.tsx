"use client";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Category, getCategories } from "@/services/categoryService";
import { usePermissions } from "@/context/PermissionContext";

export default function CategoriesManagement() {
  const client = useQueryClient();
  const { can } = usePermissions();
  const editable = can("business.settings.update");
  const categories = useQuery({ queryKey: ["categories", "all"], queryFn: () => getCategories(true) });
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [notice, setNotice] = useState("");
  const mutation = useMutation({ mutationFn: async ({ id, name, active }: { id?: number; name: string; active: boolean }) => {
    const response = await fetch(`/api/categories${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, active }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo guardar la categoría.");
    return data;
  }, onSuccess: async () => { setEditing(null); setName(""); setActive(true); setNotice("Categoría guardada."); await Promise.all([client.invalidateQueries({ queryKey: ["categories"] }), client.invalidateQueries({ queryKey: ["products"] }), client.invalidateQueries({ queryKey: ["pos-products"] })]); } });
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice(""); mutation.mutate({ id: editing?.id, name, active }); }
  return <section className="max-w-4xl space-y-6">
    <div><p className="text-sm font-semibold text-purple-600">CONFIGURACIÓN</p><h1 className="text-3xl font-bold text-gray-900">Categorías</h1><p className="mt-2 text-sm text-gray-600">Organiza tus productos. Asignar una categoría es opcional.</p></div>
    {notice && <p role="status" className="rounded-xl bg-green-50 p-3 text-green-800">{notice}</p>}
    {editable && <form onSubmit={save} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-gray-900">{editing ? "Editar categoría" : "Crear categoría"}</h2><fieldset disabled={mutation.isPending} className="flex flex-wrap items-end gap-4"><label className="min-w-48 flex-1 text-sm font-semibold text-gray-700">Nombre<input required maxLength={80} value={name} onChange={e => setName(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-purple-500" /></label><label className="flex min-h-11 items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="size-4 accent-purple-700" />Activa</label><button className="min-h-11 rounded-xl bg-purple-700 px-5 font-semibold text-white">{mutation.isPending ? "Guardando…" : "Guardar"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setName(""); setActive(true); mutation.reset(); }} className="min-h-11 rounded-xl border px-4">Cancelar</button>}</fieldset>{mutation.isError && <p role="alert" className="text-sm text-red-600">{mutation.error.message}</p>}</form>}
    <p className="text-sm text-gray-600">Las categorías inactivas no se muestran en el catálogo público. Sus productos siguen disponibles en «Todos los productos».</p>
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      {categories.isLoading ? <p role="status" className="p-6">Cargando categorías…</p> : categories.isError ? <p role="alert" className="p-6 text-red-600">{categories.error.message}<button onClick={() => void categories.refetch()} className="ml-3 underline">Reintentar</button></p> : !categories.data?.length ? <p className="p-8 text-center text-gray-500">Aún no hay categorías. Puedes registrar productos sin categoría.</p> : <table className="w-full text-left text-sm"><thead className="bg-gray-50"><tr>{["Nombre", "Productos", "Estado", "Acciones"].map(title => <th scope="col" key={title} className="px-5 py-3 text-gray-600">{title}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{categories.data.map(category => <tr key={category.id}><td className="px-5 py-4 font-semibold text-gray-900">{category.name}</td><td className="px-5 py-4">{category._count?.products ?? 0}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${category.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{category.active ? "Activa" : "Inactiva"}</span></td><td className="px-5 py-4">{editable && <button disabled={mutation.isPending} onClick={() => { setEditing(category); setName(category.name); setActive(category.active); mutation.reset(); setNotice(""); }} className="min-h-10 rounded-lg px-3 text-purple-700 hover:bg-purple-50" aria-label={`Editar categoría ${category.name}`}>Editar</button>}</td></tr>)}</tbody></table>}
    </div>
  </section>;
}
