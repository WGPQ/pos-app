export function parseBusinessProfile(body: unknown, cloudName: string | undefined, businessId: number) {
  const input = body as Record<string, unknown> | null;
  const name = typeof input?.name === "string" ? input.name.trim() : "";
  if (!name || name.length > 100) throw new Error("El nombre debe tener entre 1 y 100 caracteres.");
  const logoUrl = input?.logoUrl;
  if (logoUrl !== null && typeof logoUrl !== "string") throw new Error("Avatar inválido.");
  if (logoUrl !== null) {
    let url: URL;
    try { url = new URL(logoUrl); } catch { throw new Error("Avatar inválido."); }
    const prefix = `/${cloudName}/image/upload/`;
    if (!cloudName || url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || !url.pathname.startsWith(prefix) || !url.pathname.includes(`/business/${businessId}/profile/`) || url.search || url.hash) {
      throw new Error("Selecciona un avatar subido desde este negocio.");
    }
  }
  if (input && Object.hasOwn(input, "catalogEnabled") && typeof input.catalogEnabled !== "boolean") throw new Error("Estado del catálogo inválido.");
  return { name, logoUrl, ...(typeof input?.catalogEnabled === "boolean" ? { catalogEnabled: input.catalogEnabled } : {}) };
}
