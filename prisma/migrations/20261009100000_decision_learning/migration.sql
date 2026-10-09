-- CreateTable
CREATE TABLE "DecisionAssessment" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "revisionId" TEXT,
    "supersedesId" TEXT,
    "timing" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "DecisionAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DecisionAssessment_requestId_key" ON "DecisionAssessment"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionAssessment_supersedesId_key" ON "DecisionAssessment"("supersedesId");

-- CreateIndex
CREATE INDEX "DecisionAssessment_subjectType_subjectId_createdAt_idx" ON "DecisionAssessment"("subjectType", "subjectId", "createdAt");

