-- =============================================================================
-- Migration: Driver shift tracking and payout readiness
-- =============================================================================

ALTER TABLE "Driver"
ADD COLUMN IF NOT EXISTS "hourlyRate" DECIMAL(10,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS "lastPayoutTransferId" TEXT,
ADD COLUMN IF NOT EXISTS "lastPayoutAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "lastShiftStartedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "lastShiftEndedAt" TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS "DriverShift" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "driverId" TEXT NOT NULL REFERENCES "Driver"("id") ON DELETE CASCADE,
    "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "endedAt" TIMESTAMP WITH TIME ZONE,
    "hourlyRate" DECIMAL(10,2) NOT NULL DEFAULT 20.00,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "minutesWorked" INTEGER,
    "estimatedPay" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_driver_shift_driver_id" ON "DriverShift"("driverId");
CREATE INDEX IF NOT EXISTS "idx_driver_shift_active" ON "DriverShift"("driverId") WHERE "status" = 'ACTIVE';

ALTER TABLE "DriverShift" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Drivers can view own shifts" ON "DriverShift";
CREATE POLICY "Drivers can view own shifts" ON "DriverShift"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "DriverShift"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Drivers can create own shifts" ON "DriverShift";
CREATE POLICY "Drivers can create own shifts" ON "DriverShift"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "DriverShift"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Drivers can update own shifts" ON "DriverShift";
CREATE POLICY "Drivers can update own shifts" ON "DriverShift"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "Driver"
            WHERE "Driver"."id" = "DriverShift"."driverId"
            AND "Driver"."userId" = auth.uid()::text
        )
    );

CREATE OR REPLACE FUNCTION complete_driver_shift(shift_id TEXT)
RETURNS TABLE("minutesWorked" INTEGER, "estimatedPay" DECIMAL) AS $$
DECLARE
    minutes_count INTEGER;
    pay_amount DECIMAL(10,2);
BEGIN
    SELECT
        GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - "startedAt")) / 60)::INTEGER - COALESCE("breakMinutes", 0)),
        ROUND((GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (NOW() - "startedAt")) / 60)::INTEGER - COALESCE("breakMinutes", 0)) / 60.0 * "hourlyRate")::numeric, 2)
    INTO minutes_count, pay_amount
    FROM "DriverShift"
    WHERE id = shift_id AND status = 'ACTIVE';

    UPDATE "DriverShift"
    SET
        "endedAt" = NOW(),
        "minutesWorked" = minutes_count,
        "estimatedPay" = pay_amount,
        "status" = 'COMPLETED',
        "updatedAt" = NOW()
    WHERE id = shift_id AND status = 'ACTIVE';

    RETURN QUERY SELECT minutes_count, pay_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
