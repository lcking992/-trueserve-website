-- =============================================================================
-- TrueServe QA Seed Data
-- Run once in Supabase SQL Editor before your first QA test session.
-- Safe to re-run — all statements are idempotent (ON CONFLICT DO UPDATE).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Create QA test merchant auth user
-- Email    : testmerchant@trueserve.com
-- Password : TestMerchant123!
-- Auth UUID: aa000000-0000-0000-0000-000000000002
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  aud,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
VALUES (
  'aa000000-0000-0000-0000-000000000002',
  'testmerchant@trueserve.com',
  crypt('TestMerchant123!', gen_salt('bf', 10)),
  now(),
  'authenticated',
  'authenticated',
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test Merchant QA"}',
  false
)
ON CONFLICT (id) DO UPDATE SET
  email             = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  updated_at        = now();

-- Auth identity record (required for email/password login)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at,
  provider_id
)
VALUES (
  'aa000000-0000-0000-0000-000000000002',
  'aa000000-0000-0000-0000-000000000002',
  '{"sub":"aa000000-0000-0000-0000-000000000002","email":"testmerchant@trueserve.com"}',
  'email',
  now(),
  now(),
  'testmerchant@trueserve.com'
)
ON CONFLICT (provider, provider_id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at    = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Create QA User profile row (Prisma User table)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt")
VALUES (
  'aa000000-0000-0000-0000-000000000002',
  'testmerchant@trueserve.com',
  'Test Merchant QA',
  'MERCHANT',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  email     = EXCLUDED.email,
  name      = EXCLUDED.name,
  role      = EXCLUDED.role,
  "updatedAt" = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Create QA restaurant — manualPrepTime starts as NULL (AI mode active)
-- Restaurant ID: aa000000-0000-0000-0000-000000000001
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "Restaurant" (
  id,
  name,
  address,
  description,
  lat,
  lng,
  "openTime",
  "closeTime",
  "visibility",
  "isMock",
  city,
  state,
  "ownerId",
  "manualPrepTime",
  "isBusy",
  "createdAt",
  "updatedAt"
)
VALUES (
  'aa000000-0000-0000-0000-000000000001',
  'Test Kitchen QA',
  '100 QA Test Blvd, Charlotte, NC 28202',
  'QA test restaurant — do not display to customers.',
  35.2271,
  -80.8431,
  '08:00:00',
  '23:00:00',
  'HIDDEN',
  true,
  'Charlotte',
  'NC',
  'aa000000-0000-0000-0000-000000000002',
  NULL,
  false,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name            = EXCLUDED.name,
  "ownerId"       = EXCLUDED."ownerId",
  "manualPrepTime" = NULL,
  "visibility"    = 'HIDDEN',
  "isMock"        = true,
  "updatedAt"     = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 4: Create QA test driver auth user
-- Email    : testdriver@trueserve.com
-- Password : TestDriver123!
-- Auth UUID: aa000000-0000-0000-0000-000000000003
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at,
  role, aud, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin
)
VALUES (
  'aa000000-0000-0000-0000-000000000003',
  'testdriver@trueserve.com',
  crypt('TestDriver123!', gen_salt('bf', 10)),
  now(), 'authenticated', 'authenticated', now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test Driver QA"}',
  false
)
ON CONFLICT (id) DO UPDATE SET
  email              = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at         = now();

INSERT INTO auth.identities (
  id, user_id, identity_data, provider, created_at, updated_at, provider_id
)
VALUES (
  'aa000000-0000-0000-0000-000000000003',
  'aa000000-0000-0000-0000-000000000003',
  '{"sub":"aa000000-0000-0000-0000-000000000003","email":"testdriver@trueserve.com"}',
  'email', now(), now(),
  'testdriver@trueserve.com'
)
ON CONFLICT (provider, provider_id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at    = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 5: Create QA driver User profile + Driver record (pre-approved)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "User" (id, email, name, phone, role, "createdAt", "updatedAt")
VALUES (
  'aa000000-0000-0000-0000-000000000003',
  'testdriver@trueserve.com',
  'Test Driver QA',
  '+15555550103',
  'DRIVER',
  now(), now()
)
ON CONFLICT (id) DO UPDATE SET
  email      = EXCLUDED.email,
  name       = EXCLUDED.name,
  phone      = EXCLUDED.phone,
  role       = EXCLUDED.role,
  "updatedAt" = now();

-- vehicleVerified = true + backgroundCheckStatus = 'CLEAR' bypasses pending-review redirect
INSERT INTO "Driver" (
  id, "userId", status, "vehicleType",
  "vehicleVerified", "backgroundCheckStatus", "complianceStatus",
  "currentLat", "currentLng",
  "createdAt", "updatedAt"
)
VALUES (
  'aa000000-0000-0000-0000-000000000004',
  'aa000000-0000-0000-0000-000000000003',
  'OFFLINE', 'CAR',
  true, 'CLEAR', 'ACTIVE',
  35.2271, -80.8431,
  now(), now()
)
ON CONFLICT (id) DO UPDATE SET
  status                  = 'OFFLINE',
  "vehicleType"           = 'CAR',
  "vehicleVerified"       = true,
  "backgroundCheckStatus" = 'CLEAR',
  "complianceStatus"      = 'ACTIVE',
  "updatedAt"             = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 6: Seed mock orders so the heatmap has data to display
-- Uses the Charlotte mock restaurants from seed_mocks.sql (IDs 001–003)
-- Spread across the last 48 hrs so freshness weighting kicks in properly
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "Order" (id, "restaurantId", "userId", status, total, "createdAt", "updatedAt")
VALUES
  -- Carolina BBQ Pit — recent heavy orders (high heat)
  ('bb000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 42.50, now() - interval '1 hour',  now()),
  ('bb000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 38.00, now() - interval '2 hours', now()),
  ('bb000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 55.75, now() - interval '3 hours', now()),
  ('bb000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 29.00, now() - interval '6 hours', now()),

  -- Queen City Burger — moderate activity (medium heat)
  ('bb000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 22.00, now() - interval '4 hours',  now()),
  ('bb000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 18.50, now() - interval '8 hours',  now()),
  ('bb000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 31.00, now() - interval '12 hours', now()),

  -- North Star Diner — older/lighter orders (low heat, shows gradient edge)
  ('bb000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 15.00, now() - interval '20 hours', now()),
  ('bb000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'DELIVERED', 12.50, now() - interval '36 hours', now())
ON CONFLICT (id) DO UPDATE SET
  status     = EXCLUDED.status,
  total      = EXCLUDED.total,
  "updatedAt" = now();

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION — run this after the seed to confirm state
-- ─────────────────────────────────────────────────────────────────────────────

-- Merchant restaurant
SELECT
  r.id, r.name, r."manualPrepTime", r."ownerId",
  u.email AS owner_email
FROM "Restaurant" r
LEFT JOIN "User" u ON u.id = r."ownerId"
WHERE r.id = 'aa000000-0000-0000-0000-000000000001';

-- Driver account + approval status
SELECT
  d.id, u.name, u.email, u.phone,
  d.status, d."vehicleType", d."vehicleVerified", d."backgroundCheckStatus", d."complianceStatus"
FROM "Driver" d
LEFT JOIN "User" u ON u.id = d."userId"
WHERE d.id = 'aa000000-0000-0000-0000-000000000004';

-- Heatmap seed orders (should return 9 rows)
SELECT
  o.id, r.name AS restaurant, o.total, o."createdAt", o.status
FROM "Order" o
JOIN "Restaurant" r ON r.id = o."restaurantId"
WHERE o.id LIKE 'bb000000%'
ORDER BY o."createdAt" DESC;
