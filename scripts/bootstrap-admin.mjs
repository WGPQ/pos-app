import * as argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.INITIAL_ADMIN_PASSWORD;
const name = process.env.INITIAL_ADMIN_NAME?.trim() || "Administrador inicial";

if (!email || !password) {
  console.error("Define INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD antes de ejecutar este comando.");
  process.exit(1);
}

if (password.length < 12) {
  console.error("La contraseña inicial debe tener al menos 12 caracteres.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const users = await prisma.user.count();
  if (users > 0) {
    console.error("El bootstrap solo se permite cuando no existen usuarios. Usa el futuro módulo de usuarios para crear cuentas adicionales.");
    process.exitCode = 1;
  } else {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.create({ data: { email, name, passwordHash } });
    console.log(`Administrador inicial creado para ${email}.`);
  }
} finally {
  await prisma.$disconnect();
}
