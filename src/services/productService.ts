export interface Product {
  id: number;
  image?: string;
  description?: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  price: number;
  cost: number;
  in_store: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL = "/api/products";

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(API_URL, { cache: "no-store" }); // evita cache en SSR
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Error al actualizar producto");
  return res.json();
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar producto");
  return res.json();
}
