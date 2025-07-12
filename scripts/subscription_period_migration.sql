-- Add period and auto_renewal columns to user_subscriptions table
-- This migration adds support for monthly/annual billing and auto-renewal settings

-- Add period column with default 'monthly'
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS period TEXT DEFAULT 'monthly' CHECK (period IN ('monthly', 'annual'));

-- Add auto_renewal column with default true
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS auto_renewal BOOLEAN DEFAULT TRUE;

-- Add comment to document the new columns
COMMENT ON COLUMN user_subscriptions.period IS 'Billing period: monthly or annual';
COMMENT ON COLUMN user_subscriptions.auto_renewal IS 'Whether the subscription should automatically renew';

-- Update existing subscriptions to have the new default values
-- (This is handled by the DEFAULT values above, but we can be explicit)
UPDATE user_subscriptions 
SET period = 'monthly', auto_renewal = TRUE 
WHERE period IS NULL OR auto_renewal IS NULL; 