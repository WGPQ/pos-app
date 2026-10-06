export type Category = { id: number; name: string; active: boolean; _count?: { products: number } };

export async function getCategories(all = false): Promise<Category[]> {
  const response = await fetch(`/api/categories${all ? "?all=1" : ""}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No se pudieron cargar las categorías.");
  return data;
}
