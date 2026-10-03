-- Phase 3: memberships, authorized branch access, and server-held active context.
CREATE TABLE "BusinessMembership" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BusinessMembership_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MembershipBranch" (
    "membershipId" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MembershipBranch_pkey" PRIMARY KEY ("membershipId", "branchId")
);

ALTER TABLE "Session" ADD COLUMN "activeBusinessId" INTEGER;
ALTER TABLE "Session" ADD COLUMN "activeBranchId" INTEGER;

CREATE UNIQUE INDEX "BusinessMembership_userId_businessId_key" ON "BusinessMembership"("userId", "businessId");
CREATE INDEX "BusinessMembership_businessId_status_idx" ON "BusinessMembership"("businessId", "status");
CREATE INDEX "MembershipBranch_branchId_idx" ON "MembershipBranch"("branchId");
CREATE INDEX "Session_activeBusinessId_idx" ON "Session"("activeBusinessId");
CREATE INDEX "Session_activeBranchId_idx" ON "Session"("activeBranchId");

-- Existing accounts belong to the legacy single business and its principal branch.
INSERT INTO "BusinessMembership" ("userId", "businessId", "status", "createdAt", "updatedAt")
SELECT "User"."id", "Business"."id", 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User"
CROSS JOIN "Business"
WHERE "Business"."slug" = 'ely-papeleria'
ON CONFLICT ("userId", "businessId") DO NOTHING;

INSERT INTO "MembershipBranch" ("membershipId", "branchId", "createdAt")
SELECT "BusinessMembership"."id", "Branch"."id", CURRENT_TIMESTAMP
FROM "BusinessMembership"
JOIN "Business" ON "Business"."id" = "BusinessMembership"."businessId"
JOIN "Branch" ON "Branch"."businessId" = "Business"."id" AND "Branch"."slug" = 'principal'
WHERE "Business"."slug" = 'ely-papeleria'
ON CONFLICT ("membershipId", "branchId") DO NOTHING;

UPDATE "Session"
SET
  "activeBusinessId" = (SELECT "id" FROM "Business" WHERE "slug" = 'ely-papeleria'),
  "activeBranchId" = (
    SELECT "Branch"."id" FROM "Branch"
    JOIN "Business" ON "Business"."id" = "Branch"."businessId"
    WHERE "Business"."slug" = 'ely-papeleria' AND "Branch"."slug" = 'principal'
  )
WHERE "activeBusinessId" IS NULL OR "activeBranchId" IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "Session"
    WHERE "activeBusinessId" IS NULL OR "activeBranchId" IS NULL
  ) THEN
    RAISE EXCEPTION 'Membership migration failed: a legacy session has no active business or branch.';
  END IF;
END $$;

ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessMembership" ADD CONSTRAINT "BusinessMembership_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MembershipBranch" ADD CONSTRAINT "MembershipBranch_membershipId_fkey"
  FOREIGN KEY ("membershipId") REFERENCES "BusinessMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MembershipBranch" ADD CONSTRAINT "MembershipBranch_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_activeBusinessId_fkey"
  FOREIGN KEY ("activeBusinessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_activeBranchId_fkey"
  FOREIGN KEY ("activeBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
