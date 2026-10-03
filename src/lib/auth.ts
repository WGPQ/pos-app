import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-pos_session" : "pos_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export type AuthContext = {
  user: { id: number; email: string; name: string; status: string };
  sessionId: string;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function getAuthContext(): Promise<AuthContext | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, name: true, status: true } } },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") {
    return null;
  }

  return { user: session.user, sessionId: session.id };
}

export async function requirePageAuth(): Promise<AuthContext> {
  const context = await getAuthContext();
  if (!context) redirect("/login");
  return context;
}

export async function requireApiAuth(): Promise<NextResponse | null> {
  const context = await getAuthContext();
  if (!context) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const session = await prisma.session.findUnique({
    where: { id: context.sessionId },
    select: { activeBusinessId: true, activeBranchId: true },
  });
  if (!session?.activeBusinessId || !session.activeBranchId) {
    return NextResponse.json({ error: "No hay un negocio o sucursal activa autorizada." }, { status: 403 });
  }

  const membership = await prisma.businessMembership.findFirst({
    where: {
      userId: context.user.id,
      businessId: session.activeBusinessId,
      status: "ACTIVE",
      business: { status: "ACTIVE" },
      branches: { some: { branchId: session.activeBranchId, branch: { businessId: session.activeBusinessId, status: "ACTIVE" } } },
    },
    select: { id: true },
  });
  return membership ? null : NextResponse.json({ error: "No hay un negocio o sucursal activa autorizada." }, { status: 403 });
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const membership = await prisma.businessMembership.findFirst({
    where: { userId, status: "ACTIVE", business: { status: "ACTIVE" } },
    orderBy: { createdAt: "asc" },
    select: {
      businessId: true,
      branches: {
        where: { branch: { status: "ACTIVE" } },
        orderBy: { createdAt: "asc" },
        select: { branchId: true, branch: { select: { businessId: true } } },
      },
    },
  });
  const branchId = membership?.branches.find((membershipBranch) => membershipBranch.branch.businessId === membership.businessId)?.branchId;
  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      activeBusinessId: branchId ? membership?.businessId : null,
      activeBranchId: branchId ?? null,
    },
  });
  await writeAuditLog(prisma, {
    businessId: session.activeBusinessId,
    branchId: session.activeBranchId,
    actorUserId: userId,
    action: "auth.login",
    entityType: "Session",
    entityId: session.id,
  });
  return { token, session };
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (token) {
    const context = await getAuthContext();
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (context) {
      await writeAuditLog(prisma, { actorUserId: context.user.id, action: "auth.logout", entityType: "Session", entityId: context.sessionId });
    }
  }
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({ name: SESSION_COOKIE, value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
