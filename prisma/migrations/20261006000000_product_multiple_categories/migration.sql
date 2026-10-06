BEGIN;
CREATE TABLE "ProductCategory" (
 "productId" INTEGER NOT NULL,
 "categoryId" INTEGER NOT NULL,
 CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId", "categoryId")
);
CREATE INDEX "ProductCategory_categoryId_idx" ON "ProductCategory"("categoryId");
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
INSERT INTO "ProductCategory" ("productId", "categoryId") SELECT "id", "categoryId" FROM "Product" WHERE "categoryId" IS NOT NULL;
COMMIT;
