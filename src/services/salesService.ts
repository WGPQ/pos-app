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
  subtotal?: number | string;
  discount?: number | string;
  tax?: number | string;
  paymentMethod?: "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";
  amountReceived?: number | string | null;
  change?: number | string;
  cashierName?: string;
  cancellationReason?: string | null;
  status: string;
  createdAt: string;
  items: SaleItem[];
  client: {
    id: number;
    ci: string;
    name: string;
  } | null;
}

export interface SalesResponse {
  data: Sale[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

const API_URL = "/api/sales";

export async function getSales(): Promise<SalesResponse> {
  const res = await fetch(`${API_URL}?page=1&pageSize=20`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener ventas");
  return res.json();
}

export async function createSale(payload: {
  clientId?: number;
  isFinalConsumer?: boolean;
  items: Array<{ productId: number; quantity: number }>;
  paymentMethod: "CASH" | "CARD" | "BANK_TRANSFER" | "OTHER";
  amountReceived?: number;
  discount?: number;
}): Promise<{
  sale: Sale;
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

export async function cancelSale({ id, reason }: { id: number; reason: string }): Promise<{
  sale: Sale;
  updatedProducts: Array<{ id: number; quantity: number }>;
}> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "cancel", reason }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Error al anular la venta");
  }
  return res.json();
}
