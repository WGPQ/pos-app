BEGIN;
ALTER TABLE "Business" ADD COLUMN "catalogEnabled" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "Category" (
 "id" SERIAL NOT NULL,
 "businessId" INTEGER NOT NULL,
 "name" TEXT NOT NULL,
 "normalizedName" TEXT NOT NULL,
 "active" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_businessId_normalizedName_key" ON "Category"("businessId", "normalizedName");
CREATE INDEX "Category_businessId_active_idx" ON "Category"("businessId", "active");
ALTER TABLE "Category" ADD CONSTRAINT "Category_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ALTER COLUMN "category" DROP NOT NULL;
ALTER TABLE "Product" ADD COLUMN "categoryId" INTEGER;
-- Preserve existing labels without inventing new classifications.
INSERT INTO "Category" ("businessId", "name", "normalizedName")
SELECT "businessId", min(trim("category")), lower(trim("category"))
FROM "Product" WHERE trim(coalesce("category", '')) <> ''
GROUP BY "businessId", lower(trim("category"));
UPDATE "Product" p SET "categoryId" = c."id", "category" = c."name"
FROM "Category" c WHERE p."businessId" = c."businessId" AND lower(trim(p."category")) = c."normalizedName";
UPDATE "Product" SET "category" = NULL WHERE trim(coalesce("category", '')) = '';
CREATE INDEX "Product_businessId_categoryId_idx" ON "Product"("businessId", "categoryId");
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;
