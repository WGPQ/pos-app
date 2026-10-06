import { createHash } from "crypto";

export const hashResetToken = (token: string) => createHash("sha256").update(token).digest("hex");

export class RecoveryEmailError extends Error {
  constructor(public readonly status: number, public readonly providerCode: string) {
    super("Recovery email delivery failed");
  }
}

export function recoveryMailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const origin = process.env.APP_URL;
  if (!apiKey || !from || !origin) throw new Error("Password recovery mail is not configured");
  const url = new URL(origin);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:")) {
    throw new Error("APP_URL must use HTTPS in production");
  }
  return { apiKey, from, origin: url.origin };
}

export async function sendRecoveryEmail(email: string, token: string) {
  const { origin } = recoveryMailConfig();
  const link = new URL("/reset-password", origin);
  link.searchParams.set("token", token);
  return sendEmail(email, "Restablece tu contraseña — Punto de venta", `Para restablecer tu contraseña abre este enlace:\n\n${link}\n\nEl enlace caduca en 30 minutos y solo se puede usar una vez. Si no solicitaste este cambio, ignora este correo.`);
}

export async function sendInvitationEmail(email: string, token: string, businessName: string) {
  const { origin } = recoveryMailConfig();
  const link = new URL("/reset-password", origin);
  link.searchParams.set("token", token);
  return sendEmail(email, "Invitación a Punto de venta", `Has sido invitado a ${businessName}.\n\nDefine tu contraseña para acceder:\n${link}\n\nEl enlace caduca en 24 horas y solo se puede usar una vez.\n\nDespués puedes iniciar sesión con este correo en:\n${origin}/login\n\nSi no esperabas esta invitación, ignora este mensaje.`);
}

async function sendEmail(email: string, subject: string, text: string) {
  const { apiKey, from } = recoveryMailConfig();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [email], subject, text }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const code = typeof result?.name === "string" && /^[a-z_]{1,80}$/.test(result.name) ? result.name : "unknown";
    throw new RecoveryEmailError(response.status, code);
  }
  if (typeof result?.id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(result.id)) {
    throw new RecoveryEmailError(response.status, "missing_email_id");
  }
  return result.id as string;
}
