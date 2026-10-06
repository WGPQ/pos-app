import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizationContext, requireApiPermission } from "@/lib/authorization";
import { CategoryError, parseCategory } from "@/lib/categories";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireApiPermission("business.settings.update"); if (denied) return denied;
  try {
    const context = await getAuthorizationContext();
    const id = Number((await params).id);
    if (!Number.isSafeInteger(id) || id <= 0) throw new CategoryError("Categoría inválida.");
    const input = parseCategory(await request.json());
    const result = await prisma.$transaction(async tx => {
      const existing = await tx.category.findFirst({ where: { id, businessId: context.businessId } });
      if (!existing) throw new CategoryError("Categoría no encontrada.", 404);
      const category = await tx.category.update({ where: { id }, data: input });
      await writeAuditLog(tx, { businessId: context.businessId, actorUserId: context.userId, actorMembershipId: context.membershipId, action: "category.update", entityType: "Category", entityId: id, metadata: { active: input.active } });
      return category;
    }, { maxWait: 10_000, timeout: 30_000 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CategoryError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Ya existe una categoría con ese nombre." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo actualizar la categoría." }, { status: 500 });
  }
}
