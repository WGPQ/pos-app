-- POS core: additive changes only; existing sales and products are preserved.
ALTER TABLE "Product" ADD COLUMN "minStock" INTEGER NOT NULL DEFAULT 5;

ALTER TABLE "Sale"
  ADD COLUMN "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
  ADD COLUMN "amountReceived" DECIMAL(10,2),
  ADD COLUMN "change" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "cashierName" TEXT NOT NULL DEFAULT 'Elizabeth Oña',
  ADD COLUMN "cashSessionId" INTEGER,
  ADD COLUMN "cancellationReason" TEXT,
  ADD COLUMN "cancelledAt" TIMESTAMP(3),
  ADD COLUMN "cancelledBy" TEXT;

UPDATE "Sale"
SET "subtotal" = "total", "status" = CASE
  WHEN LOWER("status") = 'cancelled' THEN 'CANCELLED'
  WHEN LOWER("status") = 'pending' THEN 'PENDING'
  ELSE 'COMPLETED'
END;

ALTER TABLE "Sale" ALTER COLUMN "status" SET DEFAULT 'COMPLETED';

CREATE TABLE "CashSession" (
  "id" SERIAL NOT NULL,
  "cashierName" TEXT NOT NULL DEFAULT 'Elizabeth Oña',
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "openingAmount" DECIMAL(10,2) NOT NULL,
  "expectedAmount" DECIMAL(10,2),
  "closingAmount" DECIMAL(10,2),
  "difference" DECIMAL(10,2),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  CONSTRAINT "CashSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreSettings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "taxRate" DECIMAL(5,4) NOT NULL DEFAULT 0.12,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "StoreSettings" ("id", "taxRate", "updatedAt") VALUES (1, 0.12, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Client" ("ci", "name", "createdAt", "updatedAt") VALUES ('9999999999', 'Consumidor Final', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("ci") DO NOTHING;

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cashSessionId_fkey"
  FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Product_category_idx" ON "Product"("category");
CREATE INDEX "Product_quantity_idx" ON "Product"("quantity");
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");
CREATE INDEX "Sale_status_idx" ON "Sale"("status");
CREATE INDEX "Sale_clientId_idx" ON "Sale"("clientId");
CREATE INDEX "Sale_paymentMethod_idx" ON "Sale"("paymentMethod");
CREATE INDEX "Sale_cashSessionId_idx" ON "Sale"("cashSessionId");
CREATE INDEX "CashSession_status_idx" ON "CashSession"("status");
CREATE INDEX "CashSession_openedAt_idx" ON "CashSession"("openedAt");
