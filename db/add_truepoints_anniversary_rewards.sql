-- Run this in Supabase SQL Editor after db/add_truepoints_ledger.sql.
-- It makes the annual account-anniversary reward idempotent at the database level.

CREATE UNIQUE INDEX IF NOT EXISTS "idx_points_tx_anniversary_once"
ON "PointsTransaction"("userId", "type", "description")
WHERE "type" = 'ANNIVERSARY_BONUS';

COMMENT ON INDEX "idx_points_tx_anniversary_once" IS
'Prevents duplicate yearly TrueServe anniversary reward grants for the same user.';
