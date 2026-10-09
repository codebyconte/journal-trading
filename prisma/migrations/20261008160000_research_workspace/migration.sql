-- CreateTable
CREATE TABLE "ResearchPosition" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "asset" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "plan" JSONB NOT NULL,

    CONSTRAINT "ResearchPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionEvent" (
    "id" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "PositionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchDocument" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchRevision" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" JSONB NOT NULL,

    CONSTRAINT "ResearchRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchPosition_mode_status_idx" ON "ResearchPosition"("mode", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PositionEvent_requestId_key" ON "PositionEvent"("requestId");

-- CreateIndex
CREATE INDEX "PositionEvent_positionId_occurredAt_idx" ON "PositionEvent"("positionId", "occurredAt");

-- CreateIndex
CREATE INDEX "ResearchDocument_kind_idx" ON "ResearchDocument"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchRevision_documentId_version_key" ON "ResearchRevision"("documentId", "version");

-- AddForeignKey
ALTER TABLE "PositionEvent" ADD CONSTRAINT "PositionEvent_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "ResearchPosition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchRevision" ADD CONSTRAINT "ResearchRevision_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "ResearchDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

