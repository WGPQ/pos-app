-- Phase 1: additive shared-schema multitenancy foundation.
-- This migration preserves every existing primary key and relationship.

CREATE TABLE "Business" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "timezone" TEXT NOT NULL DEFAULT 'America/Guayaquil',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");
CREATE UNIQUE INDEX "Branch_businessId_slug_key" ON "Branch"("businessId", "slug");
CREATE INDEX "Branch_businessId_status_idx" ON "Branch"("businessId", "status");

ALTER TABLE "Product" ADD COLUMN "businessId" INTEGER;
ALTER TABLE "Client" ADD COLUMN "businessId" INTEGER;
ALTER TABLE "Sale" ADD COLUMN "businessId" INTEGER;
ALTER TABLE "Sale" ADD COLUMN "branchId" INTEGER;
ALTER TABLE "CashSession" ADD COLUMN "businessId" INTEGER;
ALTER TABLE "CashSession" ADD COLUMN "branchId" INTEGER;
ALTER TABLE "StoreSettings" ADD COLUMN "businessId" INTEGER;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM "StoreSettings") > 1 THEN
    RAISE EXCEPTION 'Multitenancy migration requires exactly zero or one legacy StoreSettings row.';
  END IF;
END $$;

-- StoreSettings used a fixed default id of 1. Convert it to a normal generated
-- primary key before settings become one-per-business.
CREATE SEQUENCE IF NOT EXISTS "StoreSettings_id_seq";
ALTER SEQUENCE "StoreSettings_id_seq" OWNED BY "StoreSettings"."id";
SELECT setval(
  '"StoreSettings_id_seq"',
  COALESCE((SELECT MAX("id") FROM "StoreSettings"), 1),
  EXISTS (SELECT 1 FROM "StoreSettings")
);
ALTER TABLE "StoreSettings" ALTER COLUMN "id" SET DEFAULT nextval('"StoreSettings_id_seq"');

-- The existing POS data becomes the initial tenant and its principal branch.
WITH initial_business AS (
  INSERT INTO "Business" ("name", "slug", "status", "timezone", "currency", "createdAt", "updatedAt")
  VALUES ('Ely Papelería', 'ely-papeleria', 'ACTIVE', 'America/Guayaquil', 'USD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  ON CONFLICT ("slug") DO UPDATE SET "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id"
)
INSERT INTO "Branch" ("businessId", "name", "slug", "status", "createdAt", "updatedAt")
SELECT "id", 'Principal', 'principal', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM initial_business
ON CONFLICT ("businessId", "slug") DO NOTHING;

UPDATE "Product"
SET "businessId" = (SELECT "id" FROM "Business" WHERE "slug" = 'ely-papeleria')
WHERE "businessId" IS NULL;

UPDATE "Client"
SET "businessId" = (SELECT "id" FROM "Business" WHERE "slug" = 'ely-papeleria')
WHERE "businessId" IS NULL;

UPDATE "CashSession"
SET
  "businessId" = (SELECT "id" FROM "Business" WHERE "slug" = 'ely-papeleria'),
  "branchId" = (SELECT "b"."id" FROM "Branch" AS "b" JOIN "Business" AS "bs" ON "bs"."id" = "b"."businessId" WHERE "bs"."slug" = 'ely-papeleria' AND "b"."slug" = 'principal')
WHERE "businessId" IS NULL OR "branchId" IS NULL;

UPDATE "Sale"
SET
  "businessId" = (SELECT "id" FROM "Business" WHERE "slug" = 'ely-papeleria'),
  "branchId" = (SELECT "b"."id" FROM "Branch" AS "b" JOIN "Business" AS "bs" ON "bs"."id" = "b"."businessId" WHERE "bs"."slug" = 'ely-papeleria' AND "b"."slug" = 'principal')
WHERE "businessId" IS NULL OR "branchId" IS NULL;

UPDATE "StoreSettings"
SET "businessId" = (SELECT "id" FROM "Business" WHERE "slug" = 'ely-papeleria')
WHERE "businessId" IS NULL;

INSERT INTO "StoreSettings" ("businessId", "taxRate", "updatedAt")
SELECT "id", 0.12, CURRENT_TIMESTAMP
FROM "Business"
WHERE "slug" = 'ely-papeleria'
  AND NOT EXISTS (
    SELECT 1 FROM "StoreSettings" WHERE "businessId" = "Business"."id"
  );

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Product" WHERE "businessId" IS NULL)
    OR EXISTS (SELECT 1 FROM "Client" WHERE "businessId" IS NULL)
    OR EXISTS (SELECT 1 FROM "Sale" WHERE "businessId" IS NULL OR "branchId" IS NULL)
    OR EXISTS (SELECT 1 FROM "CashSession" WHERE "businessId" IS NULL OR "branchId" IS NULL)
    OR EXISTS (SELECT 1 FROM "StoreSettings" WHERE "businessId" IS NULL) THEN
    RAISE EXCEPTION 'Multitenancy backfill failed: tenant-owned rows remain unassigned.';
  END IF;
END $$;

ALTER TABLE "Product" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Client" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Sale" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "Sale" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "CashSession" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "CashSession" ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "businessId" SET NOT NULL;

DROP INDEX "Product_sku_key";
DROP INDEX "Client_ci_key";
DROP INDEX "Sale_receiptNumber_key";
DROP INDEX "Product_category_idx";
DROP INDEX "Product_quantity_idx";
DROP INDEX "Sale_createdAt_idx";
DROP INDEX "Sale_status_idx";
DROP INDEX "Sale_clientId_idx";
DROP INDEX "Sale_paymentMethod_idx";
DROP INDEX "CashSession_status_idx";
DROP INDEX "CashSession_openedAt_idx";

CREATE UNIQUE INDEX "Product_businessId_sku_key" ON "Product"("businessId", "sku");
CREATE UNIQUE INDEX "Client_businessId_ci_key" ON "Client"("businessId", "ci");
CREATE UNIQUE INDEX "Sale_businessId_receiptNumber_key" ON "Sale"("businessId", "receiptNumber");
CREATE UNIQUE INDEX "StoreSettings_businessId_key" ON "StoreSettings"("businessId");

CREATE INDEX "Product_businessId_createdAt_idx" ON "Product"("businessId", "createdAt");
CREATE INDEX "Product_businessId_category_idx" ON "Product"("businessId", "category");
CREATE INDEX "Product_businessId_quantity_idx" ON "Product"("businessId", "quantity");
CREATE INDEX "Client_businessId_createdAt_idx" ON "Client"("businessId", "createdAt");
CREATE INDEX "Sale_businessId_createdAt_idx" ON "Sale"("businessId", "createdAt");
CREATE INDEX "Sale_businessId_status_createdAt_idx" ON "Sale"("businessId", "status", "createdAt");
CREATE INDEX "Sale_businessId_paymentMethod_createdAt_idx" ON "Sale"("businessId", "paymentMethod", "createdAt");
CREATE INDEX "Sale_businessId_clientId_createdAt_idx" ON "Sale"("businessId", "clientId", "createdAt");
CREATE INDEX "Sale_branchId_createdAt_idx" ON "Sale"("branchId", "createdAt");
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
CREATE INDEX "CashSession_branchId_status_openedAt_idx" ON "CashSession"("branchId", "status", "openedAt");
CREATE INDEX "CashSession_businessId_openedAt_idx" ON "CashSession"("businessId", "openedAt");
CREATE UNIQUE INDEX "CashSession_one_open_per_branch" ON "CashSession"("branchId") WHERE "status" = 'OPEN';

ALTER TABLE "Branch" ADD CONSTRAINT "Branch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
