-- Phase 5: trusted actor attribution for new financial operations.
-- Historical records keep their textual actor fields and null membership IDs,
-- because their real authenticated actor is unavailable.
ALTER TABLE "Sale" ADD COLUMN "cashierMembershipId" INTEGER;
ALTER TABLE "Sale" ADD COLUMN "cancelledByMembershipId" INTEGER;
ALTER TABLE "CashSession" ADD COLUMN "openedByMembershipId" INTEGER;
ALTER TABLE "CashSession" ADD COLUMN "closedByMembershipId" INTEGER;

CREATE INDEX "Sale_cashierMembershipId_createdAt_idx" ON "Sale"("cashierMembershipId", "createdAt");
CREATE INDEX "CashSession_openedByMembershipId_openedAt_idx" ON "CashSession"("openedByMembershipId", "openedAt");

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cashierMembershipId_fkey"
  FOREIGN KEY ("cashierMembershipId") REFERENCES "BusinessMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_cancelledByMembershipId_fkey"
  FOREIGN KEY ("cancelledByMembershipId") REFERENCES "BusinessMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_openedByMembershipId_fkey"
  FOREIGN KEY ("openedByMembershipId") REFERENCES "BusinessMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashSession" ADD CONSTRAINT "CashSession_closedByMembershipId_fkey"
  FOREIGN KEY ("closedByMembershipId") REFERENCES "BusinessMembership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
