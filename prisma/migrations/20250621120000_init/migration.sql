-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "asset" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION NOT NULL,
    "takeProfit" DOUBLE PRECISION NOT NULL,
    "units" DOUBLE PRECISION NOT NULL,
    "riskAmount" DOUBLE PRECISION NOT NULL,
    "riskPercent" DOUBLE PRECISION NOT NULL,
    "plannedRR" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "exitPrice" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION,
    "pnlPercent" DOUBLE PRECISION,
    "rMultiple" DOUBLE PRECISION,
    "mae" DOUBLE PRECISION,
    "mfe" DOUBLE PRECISION,
    "checkEMA" BOOLEAN NOT NULL DEFAULT false,
    "checkRSI" BOOLEAN NOT NULL DEFAULT false,
    "checkVolume" BOOLEAN NOT NULL DEFAULT false,
    "checkLiquid" BOOLEAN NOT NULL DEFAULT false,
    "checkUnlocks" BOOLEAN NOT NULL DEFAULT false,
    "checkTVL" BOOLEAN NOT NULL DEFAULT false,
    "setup" TEXT,
    "marketCondition" TEXT,
    "emotionScore" INTEGER,
    "sessionTime" TEXT,
    "notes" TEXT,
    "screenshot" TEXT,
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "mood" INTEGER,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "initialCapital" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "currentCapital" DOUBLE PRECISION NOT NULL DEFAULT 100000,
    "riskPercent" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trade_asset_idx" ON "Trade"("asset");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");

-- CreateIndex
CREATE INDEX "Trade_datetime_idx" ON "Trade"("datetime");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_date_key" ON "JournalEntry"("date");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "JournalEntry"("date");

-- Seed default settings row
INSERT INTO "Settings" ("id", "initialCapital", "currentCapital", "riskPercent", "currency")
VALUES ('singleton', 100000, 100000, 1.0, 'USD')
ON CONFLICT ("id") DO NOTHING;
