-- =============================================================================
-- Taylor's Soul Food — Seed Script
-- Location: Rock Hill, SC
-- Facebook: https://www.facebook.com/taylorssoulfood/
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste this file → click Run
--   Safe to re-run: every INSERT uses ON CONFLICT.
--
-- MERCHANT LOGIN (for portal access):
--   Email    : taylors@trueserve.test
--   Password : TaylorsTest123!
--
-- FIXED IDs:
--   Merchant User : 55555555-5555-5555-5555-555555555555
--   Restaurant    : aa000000-0000-0000-0000-000000000005
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. AUTH USER (so the owner can log into the merchant portal)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    aud, role, created_at, updated_at
)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    'taylors@trueserve.test',
    crypt('TaylorsTest123!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Taylor Soul Food"}',
    'authenticated',
    'authenticated',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email             = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    updated_at        = NOW();

INSERT INTO auth.identities (
    id, user_id, provider_id, provider,
    identity_data, last_sign_in_at, created_at, updated_at
)
VALUES (
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555',
    'taylors@trueserve.test',
    'email',
    '{"sub":"55555555-5555-5555-5555-555555555555","email":"taylors@trueserve.test","email_verified":true}',
    NOW(), NOW(), NOW()
)
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. USER RECORD
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "User" (id, name, email, role, "createdAt", "updatedAt")
VALUES (
    '55555555-5555-5555-5555-555555555555',
    'Taylor Soul Food',
    'taylors@trueserve.test',
    'MERCHANT',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name      = EXCLUDED.name,
    "updatedAt" = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RESTAURANT
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "Restaurant" (
    id, name, slug, address, description,
    lat, lng,
    "imageUrl",
    "openTime", "closeTime",
    "visibility", "isMock",
    city, state,
    "complianceStatus", "complianceScore",
    "merchantId"
)
VALUES (
    'aa000000-0000-0000-0000-000000000005',
    'Taylor''s Soul Food',
    'taylors-soul-food',
    'Rock Hill, SC',
    'Soul food done right — straight from the heart of Rock Hill. Famous for loaded baked potatoes stacked with your choice of meats, veggies, and all the fixings.',
    34.9249,
    -81.0251,
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
    '11:00:00',
    '21:00:00',
    'VISIBLE',
    false,
    'Rock Hill',
    'SC',
    'PASS',
    88,
    '55555555-5555-5555-5555-555555555555'
)
ON CONFLICT (id) DO UPDATE SET
    name              = EXCLUDED.name,
    description       = EXCLUDED.description,
    "complianceStatus" = EXCLUDED."complianceStatus",
    "complianceScore"  = EXCLUDED."complianceScore",
    "updatedAt"        = NOW();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MENU ITEMS
-- Sourced from physical menu photo. Categories:
--   Loaded Baked Potatoes  — signature builds
--   Loaded Potato Add-Ons  — customization toppings
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, category, status, inventory)
VALUES

-- ── Loaded Baked Potatoes ────────────────────────────────────────────────────
('tsf-lbp-01', 'aa000000-0000-0000-0000-000000000005',
 'Plain', 'A freshly baked potato served with butter, sour cream, and cheese. The perfect blank canvas.',
 8.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-02', 'aa000000-0000-0000-0000-000000000005',
 'Veggie', 'Onions, mushrooms, peppers, butter, sour cream, and cheese. Hearty and satisfying without the meat.',
 9.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-03', 'aa000000-0000-0000-0000-000000000005',
 'Bacon', 'Crispy bacon with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 11.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-04', 'aa000000-0000-0000-0000-000000000005',
 'Ham', 'Savory ham loaded with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 11.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-05', 'aa000000-0000-0000-0000-000000000005',
 'Turkey', 'Sliced turkey with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 11.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-06', 'aa000000-0000-0000-0000-000000000005',
 'Grilled Chicken', 'Tender grilled chicken over onions, mushrooms, peppers, butter, sour cream, and cheese.',
 13.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-07', 'aa000000-0000-0000-0000-000000000005',
 'Shrimp', 'Juicy shrimp with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 14.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-08', 'aa000000-0000-0000-0000-000000000005',
 'Steak', 'Seasoned steak strips with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 14.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-09', 'aa000000-0000-0000-0000-000000000005',
 '93 Potato', 'Grilled shrimp and chicken with broccoli, onions, mushrooms, peppers, butter, sour cream, and cheese.',
 14.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-10', 'aa000000-0000-0000-0000-000000000005',
 'Hamburger Steak', 'Hamburger steak with bacon, gravy, onions, mushrooms, peppers, butter, sour cream, and cheese.',
 15.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-11', 'aa000000-0000-0000-0000-000000000005',
 'Triple Threat', 'Three meats of your choice with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 16.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-12', 'aa000000-0000-0000-0000-000000000005',
 'All Star', 'Steak, shrimp, and bacon with broccoli, onions, mushrooms, peppers, butter, sour cream, and cheese.',
 16.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-13', 'aa000000-0000-0000-0000-000000000005',
 'Cajun Po Boy', 'Cajun turkey, sausage, and shrimp over onions, mushrooms, peppers, butter, sour cream, and cheese.',
 17.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-14', 'aa000000-0000-0000-0000-000000000005',
 'The Classic', 'Steak, shrimp, and bacon with broccoli, onions, mushrooms, peppers, butter, sour cream, and cheese.',
 19.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-15', 'aa000000-0000-0000-0000-000000000005',
 'Grand Slam', 'Shrimp, chicken, steak, turkey, ham, and bacon with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 19.50, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-16', 'aa000000-0000-0000-0000-000000000005',
 'Shea Way', 'Shrimp, chicken, steak, and bacon with broccoli, onions, peppers, mushrooms, butter, and sour cream.',
 21.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

('tsf-lbp-17', 'aa000000-0000-0000-0000-000000000005',
 'Belly Buster', 'The works — ham, turkey, chicken, steak, shrimp, bacon, sausage, and hamburger steak with onions, mushrooms, peppers, butter, sour cream, and cheese.',
 21.00, 'Loaded Baked Potatoes', 'APPROVED', 100),

-- ── Add-Ons ──────────────────────────────────────────────────────────────────
('tsf-addon-01', 'aa000000-0000-0000-0000-000000000005',
 'Add-On: Bacon, Ham, or Turkey', 'Add your choice of bacon, ham, or turkey to any potato.',
 3.00, 'Loaded Potato Add-Ons', 'APPROVED', 999),

('tsf-addon-02', 'aa000000-0000-0000-0000-000000000005',
 'Add-On: Broccoli', 'Add broccoli to any potato.',
 2.50, 'Loaded Potato Add-Ons', 'APPROVED', 999),

('tsf-addon-03', 'aa000000-0000-0000-0000-000000000005',
 'Add-On: Chicken, Steak, or Shrimp', 'Add your choice of chicken, steak, or shrimp to any potato.',
 4.00, 'Loaded Potato Add-Ons', 'APPROVED', 999),

('tsf-addon-04', 'aa000000-0000-0000-0000-000000000005',
 'Add-On: Sour Cream, Cheese, Butter, Onions, Mushrooms, or Peppers', 'Add any individual topping to customize your potato.',
 0.75, 'Loaded Potato Add-Ons', 'APPROVED', 999)

ON CONFLICT (id) DO UPDATE SET
    price       = EXCLUDED.price,
    description = EXCLUDED.description,
    inventory   = EXCLUDED.inventory;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 'User' AS tbl, COUNT(*)::text AS cnt FROM "User"    WHERE id = '55555555-5555-5555-5555-555555555555'
UNION ALL
SELECT 'Restaurant', COUNT(*)::text FROM "Restaurant" WHERE id = 'aa000000-0000-0000-0000-000000000005'
UNION ALL
SELECT 'MenuItems',  COUNT(*)::text FROM "MenuItem"   WHERE "restaurantId" = 'aa000000-0000-0000-0000-000000000005';
-- Expected: 1 / 1 / 21
