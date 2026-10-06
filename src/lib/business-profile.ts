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
  const contact: { address?: string | null; email?: string | null; phone?: string | null } = {};
  for (const key of ["address", "email", "phone"] as const) {
    if (!input || !Object.hasOwn(input, key)) continue;
    const raw = input[key];
    if (raw !== null && typeof raw !== "string") throw new Error("Datos de contacto inválidos.");
    const value = typeof raw === "string" ? raw.trim() : "";
    const limit = key === "address" ? 300 : key === "email" ? 254 : 40;
    if (value.length > limit) throw new Error(`El campo ${key} supera el límite de ${limit} caracteres.`);
    if (key === "email" && value && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)) throw new Error("Ingresa un correo válido.");
    if (key === "phone" && value && (!/^\+?[\d\s().-]+$/.test(value) || value.replace(/\D/g, "").length < 7 || value.replace(/\D/g, "").length > 15)) throw new Error("Ingresa un teléfono válido con su código de país.");
    contact[key] = value || null;
  }
  const businessType: { businessType?: string | null } = {};
  if (input && Object.hasOwn(input, "businessType")) {
    if (input.businessType !== null && typeof input.businessType !== "string") throw new Error("Giro comercial inválido.");
    const value = typeof input.businessType === "string" ? input.businessType.trim() : "";
    if (value.length > 100) throw new Error("El giro comercial admite hasta 100 caracteres.");
    businessType.businessType = value || null;
  }
  return { name, logoUrl, ...contact, ...businessType, ...(typeof input?.catalogEnabled === "boolean" ? { catalogEnabled: input.catalogEnabled } : {}) };
}
