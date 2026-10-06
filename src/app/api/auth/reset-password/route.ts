import * as argon2 from "argon2";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashResetToken } from "@/lib/password-recovery";
import { clearSessionCookie } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { isLoginRateLimited, loginRateLimitKey, recordFailedLogin } from "@/lib/login-rate-limit";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return NextResponse.json({ error: "El enlace no es válido o ha caducado." }, { status: 400 });
  if (password.length < 12 || password.length > 128) return NextResponse.json({ error: "La contraseña debe tener entre 12 y 128 caracteres." }, { status: 400 });
  const key = `reset:${loginRateLimitKey(request, "")}`;
  const retryAfter = isLoginRateLimited(key);
  if (retryAfter) return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  recordFailedLogin(key);
  try {
    const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(token) }, include: { user: { select: { status: true } } } });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date() || reset.user.status !== "ACTIVE") return NextResponse.json({ error: "El enlace no es válido o ha caducado." }, { status: 400 });
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const changed = await prisma.$transaction(async (tx) => {
      // Lock the user first to serialize changes made with different reset links.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${reset.userId} FOR UPDATE`;
      const user = await tx.user.findUnique({ where: { id: reset.userId }, select: { status: true } });
      if (user?.status !== "ACTIVE") return false;
      const now = new Date();
      const claimed = await tx.passwordResetToken.updateMany({ where: { id: reset.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
      if (!claimed.count) return false;
      await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
      await tx.passwordResetToken.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: now } });
      await tx.session.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: now } });
      await writeAuditLog(tx, { actorUserId: reset.userId, action: "auth.password_reset", entityType: "User", entityId: reset.userId });
      return true;
    });
    if (!changed) return NextResponse.json({ error: "El enlace no es válido o ha caducado." }, { status: 400 });
    const response = NextResponse.json({ message: "Contraseña actualizada. Inicia sesión con tu nueva contraseña." });
    clearSessionCookie(response);
    return response;
  } catch {
    return NextResponse.json({ error: "No fue posible restablecer la contraseña." }, { status: 500 });
  }
}
