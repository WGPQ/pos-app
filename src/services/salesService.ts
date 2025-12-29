import { Product } from "./productService";

export interface SaleItem {
  id: number;
  productId: number | null;
  productName: string;
  productSku: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
}

export interface Sale {
  id: number;
  receiptNumber: string;
  total: number | string;
  status: string;
  createdAt: string;
  items: SaleItem[];
  client: {
    id: number;
    ci: string;
    name: string;
  } | null;
}

const API_URL = "/api/sales";

export async function getSales(): Promise<Sale[]> {
  const res = await fetch(API_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener ventas");
  return res.json();
}

export async function createSale(payload: {
  clientId?: number;
  isFinalConsumer?: boolean;
  items: Array<{ productId: number; quantity: number }>;
}): Promise<{
  sale: Sale;
  updatedProducts: Product[];
}> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Error al registrar la venta");
  }
  return res.json();
}

export async function cancelSale(id: number): Promise<{
  sale: Sale;
  updatedProducts: Product[];
}> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "cancel" }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Error al anular la venta");
  }
  return res.json();
}
