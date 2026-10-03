-- Phase 4: global system roles, permission catalog, and membership roles.
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "systemManaged" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RolePermission" (
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

ALTER TABLE "BusinessMembership" ADD COLUMN "roleId" INTEGER;

CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

INSERT INTO "Role" ("key", "name", "systemManaged") VALUES
  ('ADMIN', 'Administrador', true),
  ('MANAGER', 'Gerente', true),
  ('CASHIER', 'Cajero', true)
ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name", "systemManaged" = EXCLUDED."systemManaged";

INSERT INTO "Permission" ("key", "name") VALUES
  ('dashboard.view', 'Ver dashboard'),
  ('product.view', 'Ver productos'),
  ('product.create', 'Crear productos'),
  ('product.update', 'Actualizar productos'),
  ('product.delete', 'Eliminar productos'),
  ('product.cost.view', 'Ver costos de productos'),
  ('product.import', 'Importar productos'),
  ('product.export', 'Exportar productos'),
  ('inventory.adjust', 'Ajustar inventario'),
  ('customer.view', 'Ver clientes'),
  ('customer.create', 'Crear clientes'),
  ('customer.update', 'Actualizar clientes'),
  ('customer.delete', 'Eliminar clientes'),
  ('sale.view', 'Ver ventas'),
  ('sale.create', 'Crear ventas'),
  ('sale.cancel', 'Anular ventas'),
  ('sale.refund', 'Reembolsar ventas'),
  ('cash.view', 'Ver caja'),
  ('cash.open', 'Abrir caja'),
  ('cash.close', 'Cerrar caja'),
  ('cash.adjust', 'Ajustar caja'),
  ('report.view', 'Ver reportes'),
  ('report.profit.view', 'Ver ganancias'),
  ('user.view', 'Ver usuarios'),
  ('user.manage', 'Administrar usuarios'),
  ('role.view', 'Ver roles'),
  ('role.manage', 'Administrar roles'),
  ('business.settings.view', 'Ver configuración del negocio'),
  ('business.settings.update', 'Actualizar configuración del negocio'),
  ('branch.view', 'Ver sucursales'),
  ('branch.manage', 'Administrar sucursales')
ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name";

-- The oldest user for each legacy business becomes its administrator; any
-- additional existing members default to cashier and can be changed later.
UPDATE "BusinessMembership" AS membership
SET "roleId" = (
  SELECT "id" FROM "Role" WHERE "key" = CASE
    WHEN membership."userId" = (
      SELECT nested_membership."userId"
      FROM "BusinessMembership" AS nested_membership
      JOIN "User" ON "User"."id" = nested_membership."userId"
      WHERE nested_membership."businessId" = membership."businessId"
      ORDER BY "User"."createdAt" ASC, "User"."id" ASC
      LIMIT 1
    ) THEN 'ADMIN'
    ELSE 'CASHIER'
  END
)
WHERE "roleId" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "BusinessMembership" WHERE "roleId" IS NULL) THEN
    RAISE EXCEPTION 'Role backfill failed: a membership has no role.';
  END IF;
END $$;

ALTER TABLE "BusinessMembership" ALTER COLUMN "roleId" SET NOT NULL;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "Role"."id", "Permission"."id"
FROM "Role"
CROSS JOIN "Permission"
WHERE "Role"."key" = 'ADMIN'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "Role"."id", "Permission"."id"
FROM (VALUES
  ('dashboard.view'),
  ('product.view'), ('product.create'), ('product.update'), ('product.cost.view'), ('product.import'), ('product.export'),
  ('inventory.adjust'),
  ('customer.view'), ('customer.create'), ('customer.update'),
  ('sale.view'), ('sale.create'), ('sale.cancel'), ('sale.refund'),
  ('cash.view'), ('cash.open'), ('cash.close'), ('cash.adjust'),
  ('report.view'), ('report.profit.view'),
  ('business.settings.view'), ('branch.view')
) AS granted("key")
JOIN "Permission" ON "Permission"."key" = granted."key"
JOIN "Role" ON "Role"."key" = 'MANAGER'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "Role"."id", "Permission"."id"
FROM (VALUES
  ('dashboard.view'),
  ('product.view'),
  ('customer.view'), ('customer.create'), ('customer.update'),
  ('sale.view'), ('sale.create'),
  ('cash.view'), ('cash.open'), ('cash.close')
) AS granted("key")
JOIN "Permission" ON "Permission"."key" = granted."key"
JOIN "Role" ON "Role"."key" = 'CASHIER'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey"
  FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
