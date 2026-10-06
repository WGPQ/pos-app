import { recoveryMailConfig, sendEmail } from "@/lib/password-recovery";

type WelcomeProfile = { email: string; userName: string; businessName: string };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

export function buildWelcomeEmail(profile: WelcomeProfile, origin: string) {
  const link = (path: string) => new URL(path, origin).toString();
  const dashboard = link("/dashboard");
  const settings = link("/settings");
  const products = link("/products");
  const sales = link("/sales");
  const login = link("/auth/login");
  const support = `https://wa.me/593997702533?text=${encodeURIComponent("Hola, necesito ayuda para configurar mi negocio en Simplio POS.")}`;
  const subject = "Bienvenido a Simplio POS — tu negocio está listo";
  const text = `Hola, ${profile.userName}:\n\n¡Bienvenido a Simplio POS! Ya creaste el espacio de ${profile.businessName}.\n\nAbre tu portal: ${dashboard}\n\nPara comenzar:\n1. Personaliza tu negocio: nombre, avatar, giro comercial, dirección, teléfono y correo en ${settings}\n2. Carga tus productos: agrega imágenes, precios, existencias y categorías opcionales en ${products}\n3. Prepara tu catálogo público: cuando tus productos estén listos, activa «Publicar catálogo» y usa «Ver tienda» desde Configuración para compartir el enlace. El catálogo empieza desactivado.\n4. Registra tu primera venta desde ${sales}\n\nPuedes invitar a tu equipo desde Usuarios y asignar sus roles.\n\nTu correo de acceso: ${profile.email}\nSi no tienes una sesión abierta, inicia sesión con tu contraseña en ${login}\n\n¿Necesitas ayuda? Escríbenos por WhatsApp: ${support}\n\nSimplio POS · Tu negocio, más simple.\nEste correo no contiene contraseñas ni enlaces de acceso automático.`;
  const step = (number: number, title: string, description: string, url: string) => `<tr><td style="padding:10px 0;vertical-align:top;width:38px"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:14px;background:#ede9fe;color:#8200db;font-weight:bold">${number}</span></td><td style="padding:10px 0"><a href="${escapeHtml(url)}" style="color:#182033;font-weight:bold;text-decoration:none">${title}</a><p style="margin:6px 0 0;font-size:14px;line-height:22px;color:#64748b">${description}</p></td></tr>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head><body style="margin:0;background:#faf8ff;font-family:Arial,Helvetica,sans-serif;color:#182033">
<div style="display:none;max-height:0;overflow:hidden">Tu negocio ya está creado. Sigue estos pasos para configurar tu tienda y empezar a vender.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8ff"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border:1px solid #ede9fe;border-radius:18px;background:white;overflow:hidden">
<tr><td style="height:6px;background:#8200db"></td></tr>
<tr><td style="padding:30px 28px 20px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td><img src="${escapeHtml(link("/pos.png"))}" width="48" height="48" alt="" style="display:block;border:0;border-radius:12px"></td><td style="padding-left:12px"><strong style="font-size:22px">Simplio <span style="color:#8200db">POS</span></strong><br><span style="font-size:11px;color:#64748b">TU NEGOCIO, MÁS SIMPLE</span></td></tr></table></td></tr>
<tr><td style="padding:8px 28px 24px"><span style="background:#d1fae5;color:#065f46;padding:6px 12px;border-radius:12px;font-size:11px;font-weight:bold">¡TU ESPACIO ESTÁ LISTO!</span><h1 style="margin:20px 0 12px;font-size:28px;line-height:36px">Hola, <span style="color:#8200db">${escapeHtml(profile.userName)}</span></h1><p style="margin:0;font-size:15px;line-height:24px;color:#64748b">Bienvenido a Simplio POS. El espacio de <strong>${escapeHtml(profile.businessName)}</strong> ya está creado. Ahora puedes personalizarlo y preparar tus primeros productos.</p></td></tr>
<tr><td style="padding:0 28px 24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ff;border:1px solid #ede9fe;border-radius:12px"><tr><td align="center" style="padding:20px"><a href="${escapeHtml(dashboard)}" style="display:block;border-radius:12px;background:#8200db;padding:16px;color:white;font-size:16px;font-weight:bold;text-decoration:none">Abrir mi portal →</a><p style="margin:16px 0 0;font-size:13px;line-height:21px;color:#64748b">Correo de acceso: <strong>${escapeHtml(profile.email)}</strong><br>Usa la contraseña que elegiste al registrarte.</p></td></tr></table></td></tr>
<tr><td style="padding:0 28px 24px"><h2 style="margin:0 0 12px;font-size:13px;letter-spacing:1px;color:#8200db">PRIMEROS PASOS CON SIMPLIO POS</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${step(1, "Personaliza tu negocio", "Configura el avatar, nombre, giro comercial y datos de contacto desde Configuración.", settings)}
${step(2, "Carga tus productos", "Añade imágenes, precios y existencias. Puedes organizar los productos con categorías opcionales.", products)}
${step(3, "Publica tu catálogo", "Cuando estés listo, activa «Publicar catálogo» en Configuración. Usa «Ver tienda» para compartir tu enlace. El catálogo comienza desactivado.", settings)}
${step(4, "Registra tu primera venta", "Abre el punto de venta y selecciona tus productos. También puedes invitar a tu equipo desde Usuarios.", sales)}
</table></td></tr>
<tr><td style="padding:0 28px 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ff;border-radius:12px"><tr><td style="padding:18px"><strong style="font-size:14px">¿Necesitas ayuda para comenzar?</strong><p style="margin:8px 0 14px;font-size:13px;color:#64748b">Estamos a un mensaje de distancia.</p><a href="${escapeHtml(support)}" style="display:inline-block;border-radius:8px;background:#047857;padding:11px 16px;color:white;font-size:13px;font-weight:bold;text-decoration:none">Contactar por WhatsApp</a></td></tr></table></td></tr>
<tr><td style="padding:20px 28px;background:#f5f2ff;font-size:12px;line-height:20px;color:#64748b">Enviado a ${escapeHtml(profile.email)} al registrar ${escapeHtml(profile.businessName)} en Simplio POS.<br><a href="${escapeHtml(login)}" style="color:#8200db">Iniciar sesión</a> · <a href="${escapeHtml(settings)}" style="color:#8200db">Configurar mi negocio</a><br>© ${new Date().getFullYear()} Simplio POS.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}

export async function sendWelcomeEmail(profile: WelcomeProfile) {
  const { origin } = recoveryMailConfig();
  const { subject, text, html } = buildWelcomeEmail(profile, origin);
  return sendEmail(profile.email, subject, text, html);
}
