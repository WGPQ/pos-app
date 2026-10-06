import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class CatalogNotFoundError extends Error {}

export function catalogQuery(params: URLSearchParams) {
  const query = (params.get("q") ?? "").trim().slice(0, 100);
  const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const terms = normalize(query).split(/\s+/).filter(Boolean).slice(0, 8);
  const pageValue = Number(params.get("page") ?? 1);
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? Math.min(pageValue, 10000) : 1;
  const categoryValue = Number(params.get("category"));
  const categoryId = Number.isSafeInteger(categoryValue) && categoryValue > 0 ? categoryValue : null;
  return { query, terms, page, categoryId, normalized: normalize(query), pageSize: 24 };
}

const normalizedName = Prisma.sql`lower(translate(p."name", 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))`;
const normalizedText = Prisma.sql`lower(translate(concat_ws(' ', p."name", p."sku", p."description", c."name"), 'ÁÉÍÓÚÜÑáéíóúüñ', 'AEIOUUNaeiouun'))`;

export async function getPublicCatalog(slug: string, params: URLSearchParams) {
  const business = await prisma.business.findFirst({ where: { slug, status: "ACTIVE", catalogEnabled: true }, select: { id: true, name: true, slug: true, logoUrl: true, currency: true } });
  if (!business) throw new CatalogNotFoundError();
  const filters = catalogQuery(params);
  const categories = await prisma.category.findMany({ where: { businessId: business.id, active: true }, select: { id: true, name: true }, orderBy: { name: "asc" } });
  const categoryId = filters.categoryId;
  const conditions = [Prisma.sql`p."businessId" = ${business.id} AND p."in_store" = true AND p."quantity" > 0`];
  if (categoryId) conditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "ProductCategory" pc JOIN "Category" selected ON selected."id" = pc."categoryId" WHERE pc."productId" = p."id" AND selected."id" = ${categoryId} AND selected."active" = true AND selected."businessId" = ${business.id})`);
  // Each search word must occur; strpos treats % and _ as literal text.
  for (const term of filters.terms) conditions.push(Prisma.sql`strpos(${normalizedText}, ${term}) > 0`);
  const where = Prisma.join(conditions, " AND ");
  const [products, count] = await Promise.all([
    prisma.$queryRaw<Array<{ id: number; name: string; description: string | null; image: string | null; price: Prisma.Decimal; category: string | null }>>(Prisma.sql`
      SELECT p."id", p."name", p."description", p."image", p."price",
        c."name" AS "category"
      FROM "Product" p LEFT JOIN LATERAL (SELECT string_agg(cat."name", ', ' ORDER BY cat."name") AS "name" FROM "ProductCategory" links JOIN "Category" cat ON cat."id" = links."categoryId" WHERE links."productId" = p."id" AND cat."businessId" = ${business.id} AND cat."active" = true) c ON true
      WHERE ${where}
      ORDER BY CASE WHEN ${normalizedName} = ${filters.normalized} THEN 0
        WHEN strpos(${normalizedName}, ${filters.normalized}) = 1 THEN 1 ELSE 2 END, p."name", p."id"
      LIMIT ${filters.pageSize} OFFSET ${(filters.page - 1) * filters.pageSize}`),
    prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`SELECT count(*) AS total FROM "Product" p LEFT JOIN LATERAL (SELECT string_agg(cat."name", ', ' ORDER BY cat."name") AS "name" FROM "ProductCategory" links JOIN "Category" cat ON cat."id" = links."categoryId" WHERE links."productId" = p."id" AND cat."businessId" = ${business.id} AND cat."active" = true) c ON true WHERE ${where}`),
  ]);
  const total = Number(count[0]?.total ?? 0);
  return { business: { name: business.name, logoUrl: business.logoUrl, slug: business.slug, currency: business.currency }, categories, products: products.map(p => ({ ...p, price: p.price.toString() })), pagination: { page: filters.page, total, totalPages: Math.ceil(total / filters.pageSize) } };
}

export type PublicCatalog = Awaited<ReturnType<typeof getPublicCatalog>>;
