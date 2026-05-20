-- =============================================================================
-- Migration: Customer delivery preferences, adjusted pins, and gift orders
-- =============================================================================

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "deliverySpeed" TEXT DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS "scheduledFor" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "deliveryPinAdjusted" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "giftRecipientName" TEXT,
ADD COLUMN IF NOT EXISTS "giftRecipientPhone" TEXT,
ADD COLUMN IF NOT EXISTS "giftMessage" TEXT,
ADD COLUMN IF NOT EXISTS "giftHideReceipt" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "rewardsPerksSnapshot" JSONB;

COMMENT ON COLUMN "Order"."deliverySpeed" IS 'Customer-selected delivery timing: EXPRESS, STANDARD, or SCHEDULED.';
COMMENT ON COLUMN "Order"."scheduledFor" IS 'Requested delivery window start for scheduled orders.';
COMMENT ON COLUMN "Order"."deliveryPinAdjusted" IS 'Whether the customer manually adjusted the drop-off pin before checkout.';
COMMENT ON COLUMN "Order"."giftRecipientName" IS 'Optional recipient name when an order is sent as a gift.';
COMMENT ON COLUMN "Order"."giftRecipientPhone" IS 'Optional recipient phone for gift delivery coordination.';
COMMENT ON COLUMN "Order"."giftMessage" IS 'Optional customer-written gift note.';
COMMENT ON COLUMN "Order"."giftHideReceipt" IS 'Whether receipt/prices should be hidden from the gift recipient experience.';
COMMENT ON COLUMN "Order"."rewardsPerksSnapshot" IS 'Checkout-time rewards perks shown to the customer.';

CREATE INDEX IF NOT EXISTS "idx_order_delivery_speed" ON "Order"("deliverySpeed");
CREATE INDEX IF NOT EXISTS "idx_order_scheduled_for" ON "Order"("scheduledFor");
