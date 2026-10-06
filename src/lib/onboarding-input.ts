export const BUSINESS_TYPES = [
  { value: "retail", label: "Retail y bazar", description: "Ropa, regalos y artículos variados" },
  { value: "stationery", label: "Papelería", description: "Útiles, oficina y materiales escolares" },
  { value: "food", label: "Café y alimentos", description: "Cafeterías y negocios de comida" },
  { value: "beauty", label: "Belleza y bienestar", description: "Estética, cuidado personal y barbería" },
  { value: "market", label: "Minimarket", description: "Productos de consumo diario" },
  { value: "other", label: "Otro rubro", description: "Cuéntanos a qué te dedicas" },
] as const;

function text(value: unknown, label: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new Error(`${label}: ingresa entre 1 y ${max} caracteres.`);
  return value.trim();
}
export function validateBusinessDetails(body: Record<string, unknown>) {
  const businessName = text(body.businessName, "Nombre del negocio", 100);
  const businessEmail = text(body.businessEmail, "Correo del negocio", 254).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(businessEmail)) throw new Error("Ingresa un correo válido para el negocio.");
  const phone = text(body.phone, "Teléfono", 40);
  if (!/^\+[\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15) throw new Error("Ingresa el teléfono con + y código de país, por ejemplo +593 99 123 4567.");
  const type = body.businessType;
  if (type !== undefined && type !== null && type !== "" && !BUSINESS_TYPES.some(option => option.value === type)) throw new Error("Giro comercial inválido.");
  const businessType = type === "other" ? text(body.otherBusinessType, "Tipo de negocio", 100) : BUSINESS_TYPES.find(option => option.value === type)?.label ?? null;
  return { businessName, businessEmail, phone, businessType };
}
export function parseOnboarding(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Datos de registro inválidos.");
  const input = body as Record<string, unknown>;
  const business = validateBusinessDetails(input);
  if (typeof input.useBusinessProfile !== "boolean") throw new Error("Selecciona cómo configurar el administrador.");
  const userName = input.useBusinessProfile ? business.businessName : text(input.userName, "Nombre del administrador", 100);
  const email = input.useBusinessProfile ? business.businessEmail : text(input.userEmail, "Correo del administrador", 254).toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("Ingresa un correo válido para el administrador.");
  const password = input.password;
  if (typeof password !== "string" || password.length < 12 || password.length > 128) throw new Error("La contraseña debe tener entre 12 y 128 caracteres.");
  if (password !== input.confirmation) throw new Error("Las contraseñas no coinciden.");
  return { ...business, userName, email, password };
}
