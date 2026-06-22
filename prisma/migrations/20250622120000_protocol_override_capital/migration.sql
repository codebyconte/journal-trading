-- AlterTable
ALTER TABLE "Trade" ADD COLUMN "protocolOverride" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Trade" ADD COLUMN "overrideReason" TEXT;

-- CreateTable
CREATE TABLE "CapitalAdjustment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "balanceAfter" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CapitalAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CapitalAdjustment_createdAt_idx" ON "CapitalAdjustment"("createdAt");
