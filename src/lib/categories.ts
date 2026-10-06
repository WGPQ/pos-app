import { Prisma, PrismaClient } from "@prisma/client";

export class CategoryError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function parseCategory(body: unknown) {
  const input = body as Record<string, unknown> | null;
  const name = typeof input?.name === "string" ? input.name.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 80) throw new CategoryError("El nombre debe tener entre 1 y 80 caracteres.");
  if (typeof input?.active !== "boolean") throw new CategoryError("Estado de categoría inválido.");
  return { name, normalizedName: name.toLocaleLowerCase("es"), active: input.active };
}

export async function resolveProductCategory(client: PrismaClient | Prisma.TransactionClient, businessId: number, value: unknown, currentId?: number | null) {
  if (value === undefined) return currentId === undefined ? { categoryId: null, category: null } : {};
  if (value === null || value === "") return { categoryId: null, category: null };
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) throw new CategoryError("Selecciona una categoría válida.");
  const category = await client.category.findFirst({ where: { id: value, businessId } });
  if (!category || (!category.active && category.id !== currentId)) throw new CategoryError("La categoría debe estar activa y pertenecer al negocio actual.");
  return { categoryId: category.id, category: category.name };
}

export async function resolveProductCategories(client: PrismaClient | Prisma.TransactionClient, businessId: number, value: unknown, currentIds: number[] = []) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 50 || value.some(id => typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0)) throw new CategoryError("Selecciona categorías válidas (máximo 50).");
  const ids = [...new Set(value)] as number[];
  const categories = await client.category.findMany({ where: { id: { in: ids }, businessId } });
  if (categories.length !== ids.length || categories.some(c => !c.active && !currentIds.includes(c.id))) throw new CategoryError("Las categorías deben estar activas y pertenecer al negocio actual.");
  return { ids, categoryId: categories[0]?.id ?? null, category: categories.map(c => c.name).join(", ") || null };
}

export const productCategoryInclude = { categoryLinks: { select: { categoryId: true, category: { select: { id: true, name: true, active: true } } } } };

export function withProductCategories<T extends { categoryLinks: { categoryId: number; category: { id: number; name: string; active: boolean } }[] }>(product: T) {
  const { categoryLinks, ...data } = product;
  return { ...data, categoryIds: categoryLinks.map(c => c.categoryId), categories: categoryLinks.map(c => c.category), category: categoryLinks.map(c => c.category.name).join(", ") || null };
}
