import * as argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const [businessSlug, branchSlug, roleKey = "CASHIER"] = process.argv.slice(2);
const email = process.env.NEW_USER_EMAIL?.trim().toLowerCase();
const name = process.env.NEW_USER_NAME?.trim();
const password = process.env.NEW_USER_PASSWORD;

if (!businessSlug || !branchSlug || !email || !name || !password) {
  console.error("Define NEW_USER_EMAIL, NEW_USER_NAME y NEW_USER_PASSWORD. Uso: node --env-file=.env scripts/register-user.mjs <negocio-slug> <sucursal-slug> [ADMIN|MANAGER|CASHIER]");
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || name.length > 100 || password.length < 12 || password.length > 128) {
  console.error("Revisa el correo, nombre (hasta 100 caracteres) y contraseña (12 a 128 caracteres).");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business || business.status !== "ACTIVE") throw new Error("No existe un negocio activo con ese slug.");
  const branch = await prisma.branch.findUnique({ where: { businessId_slug: { businessId: business.id, slug: branchSlug } } });
  if (!branch || branch.status !== "ACTIVE") throw new Error("No existe una sucursal activa con ese slug en el negocio.");
  const role = await prisma.role.findUnique({ where: { key: roleKey } });
  if (!role) throw new Error("Rol no encontrado.");
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) throw new Error("El usuario ya existe. Este comando solo registra usuarios nuevos.");
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.$transaction(async tx => {
    const user = await tx.user.create({ data: { email, name, passwordHash } });
    const membership = await tx.businessMembership.create({ data: { userId: user.id, businessId: business.id, roleId: role.id, branches: { create: { branchId: branch.id } } } });
    await tx.auditLog.create({ data: { businessId: business.id, branchId: branch.id, action: "user.register_cli", entityType: "BusinessMembership", entityId: String(membership.id), metadata: { source: "scripts/register-user.mjs", roleId: role.id } } });
  }, { maxWait: 10_000, timeout: 30_000 });
  console.log(`Usuario creado en ${business.name}, sucursal ${branch.name}, rol ${role.name}. Ya puede iniciar sesión. Este comando no envía una invitación por correo.`);
} catch (error) {
  console.error(error?.code === "P2002" ? "El correo ya está registrado." : error instanceof Error && !error.name.startsWith("Prisma") ? error.message : "No se pudo registrar el usuario. Revisa la conexión y las migraciones.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
