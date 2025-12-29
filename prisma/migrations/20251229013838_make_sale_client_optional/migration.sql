-- DropForeignKey
ALTER TABLE "public"."Sale" DROP CONSTRAINT "Sale_clientId_fkey";

-- AlterTable
ALTER TABLE "public"."Sale" ALTER COLUMN "clientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
