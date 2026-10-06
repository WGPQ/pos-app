import { notFound } from "next/navigation";
import { CatalogNotFoundError, getPublicCatalog } from "@/lib/public-catalog";
import ShopCatalog from "@/components/shop/ShopCatalog";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import CatalogPaused from "@/components/shop/CatalogPaused";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const business = await prisma.business.findFirst({ where: { slug: (await params).slug, status: "ACTIVE" }, select: { name: true, catalogEnabled: true } });
  return { title: business ? `${business.name} | ${business.catalogEnabled ? "Catálogo" : "Catálogo en pausa"}` : "Catálogo no disponible", description: business ? `Catálogo de ${business.name}.` : undefined, ...(!business?.catalogEnabled ? { robots: { index: false, follow: false } } : {}) };
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await getPublicCatalog(slug, new URLSearchParams());
    return <ShopCatalog initial={data} />;
  } catch (error) {
    if (error instanceof CatalogNotFoundError) {
      const business = await prisma.business.findFirst({ where: { slug, status: "ACTIVE", catalogEnabled: false }, select: { name: true, logoUrl: true, address: true, email: true, phone: true } });
      if (business) return <CatalogPaused business={business} />;
      notFound();
    }
    throw error;
  }
}
