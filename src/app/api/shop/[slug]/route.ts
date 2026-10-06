import { NextResponse } from "next/server";
import { CatalogNotFoundError, getPublicCatalog } from "@/lib/public-catalog";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    return NextResponse.json(await getPublicCatalog((await params).slug, new URL(request.url).searchParams));
  } catch (error) {
    return NextResponse.json({ error: error instanceof CatalogNotFoundError ? "Catálogo no disponible." : "No se pudo cargar el catálogo." }, { status: error instanceof CatalogNotFoundError ? 404 : 503 });
  }
}
