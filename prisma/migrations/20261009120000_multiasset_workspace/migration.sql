ALTER TABLE "ResearchPosition" ADD COLUMN "archivedAt" TIMESTAMP(3);
ALTER TABLE "ResearchDocument" ADD COLUMN "archivedAt" TIMESTAMP(3);
CREATE TABLE "AccountMovement" ("id" TEXT NOT NULL, "accountId" TEXT NOT NULL, "requestId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "occurredAt" TIMESTAMP(3) NOT NULL, "amount" DOUBLE PRECISION NOT NULL, "note" TEXT NOT NULL, CONSTRAINT "AccountMovement_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "AccountMovement_requestId_key" ON "AccountMovement"("requestId");
CREATE INDEX "AccountMovement_accountId_occurredAt_idx" ON "AccountMovement"("accountId", "occurredAt");
