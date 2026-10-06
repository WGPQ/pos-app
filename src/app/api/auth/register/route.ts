import { createHash, randomBytes } from "crypto";
import * as argon2 from "argon2";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { parseOnboarding } from "@/lib/onboarding-input";
import { isLoginRateLimited, loginRateLimitKey, recordFailedLogin } from "@/lib/login-rate-limit";
import { sendWelcomeEmail } from "@/lib/welcome-email";
import { RecoveryEmailError } from "@/lib/password-recovery";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const key = `register:${loginRateLimitKey(request, "registration")}`;
  const retryAfter = isLoginRateLimited(key);
  if (retryAfter) return NextResponse.json({ error: "Demasiados intentos. Intenta nuevamente más tarde." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  recordFailedLogin(key);
  let input;
  try { input = parseOnboarding(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Datos inválidos." }, { status: 400 }); }
  try {
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    const token = randomBytes(32).toString("base64url");
    const slugBase = input.businessName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "negocio";
    const slug = `${slugBase}-${randomBytes(8).toString("hex")}`;
    await prisma.$transaction(async tx => {
      // Create the user first: a duplicate email aborts the whole transaction.
      const user = await tx.user.create({ data: { name: input.userName, email: input.email, passwordHash } });
      const role = await tx.role.findUniqueOrThrow({ where: { key: "ADMIN" }, select: { id: true } });
      const business = await tx.business.create({ data: { name: input.businessName, email: input.businessEmail, phone: input.phone, businessType: input.businessType, slug, currency: "USD", timezone: "America/Guayaquil", catalogEnabled: false, settings: { create: {} } } });
      const branch = await tx.branch.create({ data: { businessId: business.id, name: "Principal", slug: "principal" } });
      const membership = await tx.businessMembership.create({ data: { userId: user.id, businessId: business.id, roleId: role.id, branches: { create: { branchId: branch.id } } } });
      const session = await tx.session.create({ data: { userId: user.id, tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), activeBusinessId: business.id, activeBranchId: branch.id } });
      await writeAuditLog(tx, { businessId: business.id, branchId: branch.id, actorUserId: user.id, actorMembershipId: membership.id, action: "business.onboarding", entityType: "Business", entityId: business.id });
      await writeAuditLog(tx, { businessId: business.id, branchId: branch.id, actorUserId: user.id, actorMembershipId: membership.id, action: "auth.login", entityType: "Session", entityId: session.id });
    }, { maxWait: 10_000, timeout: 30_000 });
    // Email delivery is outside the transaction; a provider failure must not undo registration.
    try {
      await sendWelcomeEmail({ email: input.email, userName: input.userName, businessName: input.businessName });
    } catch (error) {
      console.error("Welcome email delivery failed", error instanceof RecoveryEmailError ? { status: error.status, providerCode: error.providerCode, invalidField: error.invalidField } : { reason: "delivery_unavailable" });
    }
    const response = NextResponse.json({ redirectTo: "/dashboard" }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    const code = (error as { code?: string }).code;
    const target = (error as { meta?: { target?: unknown } }).meta?.target;
    if (code === "P2002" && (Array.isArray(target) ? target.includes("email") : typeof target === "string" && target.includes("email"))) return NextResponse.json({ error: "Este correo ya tiene una cuenta. Inicia sesión con tu cuenta existente.", code: "EMAIL_EXISTS" }, { status: 409 });
    return NextResponse.json({ error: "No se pudo crear el negocio. Intenta nuevamente más tarde." }, { status: 503 });
  }
}
