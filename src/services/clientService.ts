export interface Client {
  id: number;
  ci: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "/api/clients";

export async function getClients(): Promise<Client[]> {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener clientes");
  return res.json();
}

export async function getClient(id: number): Promise<Client> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Cliente no encontrado");
  return res.json();
}

export async function createClient(client: Omit<Client, "id">): Promise<Client> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error("Error al crear cliente");
  return res.json();
}

export async function updateClient(
  id: number,
  client: Partial<Client>
): Promise<Client> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error("Error al actualizar cliente");
  return res.json();
}

export async function deleteClient(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar cliente");
  return res.json();
}
