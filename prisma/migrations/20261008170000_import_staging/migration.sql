-- CreateTable
CREATE TABLE "ImportedFill" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "account" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "matchedPositionId" TEXT,
    "matchedAt" TIMESTAMP(3),

    CONSTRAINT "ImportedFill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportedFill_sourceKey_key" ON "ImportedFill"("sourceKey");

