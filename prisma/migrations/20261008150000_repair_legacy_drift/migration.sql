-- The original schema had fields absent from its checked-in migrations.
-- IF NOT EXISTS also supports databases previously synchronized with db push.
ALTER TABLE "Trade" ADD COLUMN IF NOT EXISTS "atrAtEntry" DOUBLE PRECISION;
ALTER TABLE "Trade" ADD COLUMN IF NOT EXISTS "checkBBW" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Trade" ADD COLUMN IF NOT EXISTS "checkCoinglass" BOOLEAN NOT NULL DEFAULT false;
