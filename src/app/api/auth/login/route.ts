import * as argon2 from "argon2";
import { NextResponse } from "next/server";
import { createSession, revokeCurrentSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clearLoginAttempts, isLoginRateLimited, loginRateLimitKey, recordFailedLogin } from "@/lib/login-rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password) return NextResponse.json({ error: "Correo y contraseña son obligatorios." }, { status: 400 });
    const rateLimitKey = loginRateLimitKey(request, email);
    const retryAfter = isLoginRateLimited(rateLimitKey);
    if (retryAfter) return NextResponse.json({ error: "Demasiados intentos. Intenta nuevamente más tarde." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });

    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user?.status === "ACTIVE" && await argon2.verify(user.passwordHash, password);
    if (!valid || !user) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    await revokeCurrentSession();
    const { token } = await createSession(user.id);
    clearLoginAttempts(rateLimitKey);
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ error: "No fue posible iniciar sesión." }, { status: 500 });
  }
}
