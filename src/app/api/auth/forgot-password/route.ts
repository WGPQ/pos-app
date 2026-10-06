import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashResetToken, RecoveryEmailError, recoveryMailConfig, sendRecoveryEmail } from "@/lib/password-recovery";
import { isLoginRateLimited, loginRateLimitKey, recordFailedLogin } from "@/lib/login-rate-limit";

const message = "Si el correo corresponde a una cuenta activa, recibirás un enlace para restablecer tu contraseña.";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 }); }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Ingresa un correo válido." }, { status: 400 });
  const key = `recovery:${loginRateLimitKey(request, "")}`;
  const retryAfter = isLoginRateLimited(key);
  if (retryAfter) return NextResponse.json({ error: "Demasiados intentos. Intenta más tarde." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  recordFailedLogin(key);
  try {
    recoveryMailConfig();
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, status: true } });
    if (user?.status === "ACTIVE") {
      const token = randomBytes(32).toString("base64url");
      const reset = await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
      try {
        const emailId = await sendRecoveryEmail(email, token);
        console.info("Password recovery email accepted by Resend", { emailId });
      } catch (error) {
        console.error("Password recovery email delivery failed", error instanceof RecoveryEmailError
          ? { status: error.status, providerCode: error.providerCode, invalidField: error.invalidField }
          : { providerCode: "network_or_unexpected_error" });
        await prisma.passwordResetToken.delete({ where: { id: reset.id } });
      }
    }
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "La recuperación no está disponible en este momento." }, { status: 503 });
  }
}
