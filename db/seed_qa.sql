-- =============================================================================
-- TrueServe QA Seed Data
-- =============================================================================
-- Run AFTER qa_schema_setup.sql.
-- Creates mock users, restaurants, menu items, and orders for QA testing.
-- All records are flagged isMock=true for easy cleanup.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- MOCK USERS
-- ─────────────────────────────────────────────────────────────────────────────

-- QA Merchant
INSERT INTO "User" (id, email, name, role, phone, "emailVerified", "createdAt", "updatedAt")
VALUES ('qa-merchant-001', 'qa.merchant@trueserve.dev', 'QA Merchant', 'MERCHANT', '+17045550001', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- QA Customer
INSERT INTO "User" (id, email, name, role, phone, "emailVerified", "createdAt", "updatedAt")
VALUES ('qa-customer-001', 'qa.customer@trueserve.dev', 'QA Customer', 'CUSTOMER', '+17045550002', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- QA Driver User
INSERT INTO "User" (id, email, name, role, phone, "emailVerified", "createdAt", "updatedAt")
VALUES ('qa-driver-user-001', 'qa.driver@trueserve.dev', 'QA Driver', 'DRIVER', '+17045550003', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- QA Admin
INSERT INTO "User" (id, email, name, role, phone, "emailVerified", "createdAt", "updatedAt")
VALUES ('qa-admin-001', 'qa.admin@trueserve.dev', 'QA Admin', 'ADMIN', '+17045550004', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- QA DRIVER PROFILE
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "Driver" (
    id, "userId", "isAvailable", "isOnline",
    "vehicleType", "vehicleMake", "vehicleModel", "vehicleYear", "vehicleColor", "licensePlate",
    "vehicleVerified", "backgroundCheckStatus", "complianceStatus",
    "foodSafetyTrainingComplete", "agreementAccepted",
    "createdAt", "updatedAt"
) VALUES (
    'qa-driver-001', 'qa-driver-user-001', true, true,
    'Car', 'Toyota', 'Camry', '2022', 'White', 'QA-1234',
    true, 'CLEAR', 'ACTIVE',
    true, true,
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- MOCK RESTAURANTS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "Restaurant" (
    id, "ownerId", name, description, address, city, state, lat, lng,
    "imageUrl", rating, category, "healthGrade", "complianceStatus",
    "openTime", "closeTime", "isActive", "isMock", "createdAt", "updatedAt"
) VALUES
(
    'qa-restaurant-001', 'qa-merchant-001',
    'Carolina BBQ Pit',
    'Best BBQ in Charlotte — slow-smoked ribs and pulled pork since 1985.',
    '123 BBQ Lane', 'Charlotte', 'NC', 35.2271, -80.8431,
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
    '4.8', 'BBQ', 'A', 'PASS',
    '10:00:00', '22:00:00', true, true, NOW(), NOW()
),
(
    'qa-restaurant-002', 'qa-merchant-001',
    'Queen City Burgers',
    'Gourmet burgers made with locally sourced beef.',
    '456 Burger Ave', 'Charlotte', 'NC', 35.2280, -80.8440,
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    '4.7', 'Burgers', 'A', 'APPROVED',
    '11:00:00', '23:00:00', true, true, NOW(), NOW()
),
(
    'qa-restaurant-003', 'qa-merchant-001',
    'Pineville Pizzeria',
    'New York style pizza, calzones and wings.',
    '202 Pizza Cir', 'Charlotte', 'NC', 35.0833, -80.8872,
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
    '4.9', 'Pizza', 'B', 'PASS',
    '11:00:00', '23:59:00', true, true, NOW(), NOW()
),
(
    'qa-restaurant-004', 'qa-merchant-001',
    'Old Town Kitchen',
    'Authentic Southern comfort food — fried chicken, shrimp & grits.',
    '101 Southern Way', 'Charlotte', 'NC', 35.1900, -80.8600,
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    '4.6', 'Southern', 'A', 'COMPLIANT',
    '08:00:00', '21:00:00', true, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    "isActive" = true,
    "isMock" = true;


-- ─────────────────────────────────────────────────────────────────────────────
-- MOCK MENU ITEMS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "MenuItem" (id, "restaurantId", name, description, price, "isAvailable", inventory, "isMock", "createdAt", "updatedAt")
VALUES
-- Carolina BBQ Pit
('qa-item-001', 'qa-restaurant-001', 'Pulled Pork Plate', 'Slow-smoked pork shoulder with two sides', 14.99, true, 100, true, NOW(), NOW()),
('qa-item-002', 'qa-restaurant-001', 'Half-Rack Ribs', 'St. Louis style ribs with house sauce', 18.50, true, 30, true, NOW(), NOW()),
('qa-item-003', 'qa-restaurant-001', 'Cornbread', 'Fresh baked daily', 3.50, true, 200, true, NOW(), NOW()),
('qa-item-004', 'qa-restaurant-001', 'Brisket Sandwich', 'Smoked brisket on a brioche bun', 13.99, true, 50, true, NOW(), NOW()),

-- Queen City Burgers
('qa-item-005', 'qa-restaurant-002', 'The Queen Burger', 'Double patty, sharp cheddar, bacon jam', 16.99, true, 50, true, NOW(), NOW()),
('qa-item-006', 'qa-restaurant-002', 'Truffle Fries', 'Hand-cut fries with truffle oil and parmesan', 6.50, true, 80, true, NOW(), NOW()),
('qa-item-007', 'qa-restaurant-002', 'Chicken Sandwich', 'Crispy fried chicken, pickles, hot honey', 14.99, true, 40, true, NOW(), NOW()),
('qa-item-008', 'qa-restaurant-002', 'Milkshake', 'Vanilla, Chocolate, or Strawberry', 5.99, false, 0, true, NOW(), NOW()), -- OUT OF STOCK for testing

-- Pineville Pizzeria
('qa-item-009', 'qa-restaurant-003', 'Cheese Pizza (Large)', '18-inch classic cheese pizza', 18.99, true, 50, true, NOW(), NOW()),
('qa-item-010', 'qa-restaurant-003', 'Pepperoni Pizza (Large)', '18-inch with premium pepperoni', 21.99, true, 50, true, NOW(), NOW()),
('qa-item-011', 'qa-restaurant-003', 'Wings (10 pc)', 'Choice of Buffalo, BBQ, or Garlic Parmesan', 12.99, true, 60, true, NOW(), NOW()),

-- Old Town Kitchen
('qa-item-012', 'qa-restaurant-004', 'Fried Chicken Plate', 'Crispy golden fried chicken with mashed potatoes and greens', 15.99, true, 40, true, NOW(), NOW()),
('qa-item-013', 'qa-restaurant-004', 'Shrimp & Grits', 'Lowcountry classic with andouille sausage', 17.99, true, 30, true, NOW(), NOW()),
('qa-item-014', 'qa-restaurant-004', 'Sweet Tea', 'Fresh brewed Southern sweet tea', 2.99, true, 999, true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    "isAvailable" = EXCLUDED."isAvailable",
    inventory = EXCLUDED.inventory;


-- ─────────────────────────────────────────────────────────────────────────────
-- MOCK ORDERS (various statuses for QA testing)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO "Order" (
    id, "userId", "restaurantId", "driverId",
    status, "totalAmount", "subtotal", tip, "deliveryFee",
    "deliveryAddress", "deliveryLat", "deliveryLng",
    "isTestOrder", "isMock", "createdAt", "updatedAt"
) VALUES
-- Pending order (just placed)
(
    'qa-order-001', 'qa-customer-001', 'qa-restaurant-001', NULL,
    'PENDING', 21.48, 18.49, 2.00, 0.99,
    '789 Test St, Charlotte, NC 28202', 35.2250, -80.8410,
    true, true, NOW(), NOW()
),
-- In progress (driver assigned)
(
    'qa-order-002', 'qa-customer-001', 'qa-restaurant-002', 'qa-driver-001',
    'PREPARING', 25.48, 23.49, 1.00, 0.99,
    '321 QA Blvd, Charlotte, NC 28205', 35.2260, -80.8420,
    true, true, NOW() - INTERVAL '15 minutes', NOW()
),
-- Out for delivery
(
    'qa-order-003', 'qa-customer-001', 'qa-restaurant-003', 'qa-driver-001',
    'OUT_FOR_DELIVERY', 30.97, 27.98, 2.00, 0.99,
    '555 Mock Ave, Charlotte, NC 28203', 35.2270, -80.8430,
    true, true, NOW() - INTERVAL '35 minutes', NOW()
),
-- Delivered (completed)
(
    'qa-order-004', 'qa-customer-001', 'qa-restaurant-004', 'qa-driver-001',
    'DELIVERED', 19.97, 18.98, 0.00, 0.99,
    '789 Test St, Charlotte, NC 28202', 35.2250, -80.8410,
    true, true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'
),
-- Cancelled
(
    'qa-order-005', 'qa-customer-001', 'qa-restaurant-001', NULL,
    'CANCELLED', 14.99, 13.00, 0.00, 0.99,
    '789 Test St, Charlotte, NC 28202', 35.2250, -80.8410,
    true, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours'
)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;


-- ─────────────────────────────────────────────────────────────────────────────
-- MOCK ORDER ITEMS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "OrderItem" (id, "orderId", "menuItemId", name, quantity, price, "createdAt")
VALUES
('qa-oi-001', 'qa-order-001', 'qa-item-001', 'Pulled Pork Plate', 1, 14.99, NOW()),
('qa-oi-002', 'qa-order-001', 'qa-item-003', 'Cornbread', 1, 3.50, NOW()),
('qa-oi-003', 'qa-order-002', 'qa-item-005', 'The Queen Burger', 1, 16.99, NOW()),
('qa-oi-004', 'qa-order-002', 'qa-item-006', 'Truffle Fries', 1, 6.50, NOW()),
('qa-oi-005', 'qa-order-003', 'qa-item-009', 'Cheese Pizza (Large)', 1, 18.99, NOW()),
('qa-oi-006', 'qa-order-003', 'qa-item-011', 'Wings (10 pc)', 1, 12.99, NOW() - INTERVAL '35 minutes'),
('qa-oi-007', 'qa-order-004', 'qa-item-012', 'Fried Chicken Plate', 1, 15.99, NOW() - INTERVAL '2 hours'),
('qa-oi-008', 'qa-order-004', 'qa-item-014', 'Sweet Tea', 1, 2.99, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- MOCK FAVORITE
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO "Favorite" (id, "userId", "restaurantId", "createdAt")
VALUES ('qa-fav-001', 'qa-customer-001', 'qa-restaurant-001', NOW())
ON CONFLICT DO NOTHING;


-- =============================================================================
-- DONE.
-- Test accounts:
--   Customer : qa.customer@trueserve.dev
--   Driver   : qa.driver@trueserve.dev
--   Merchant : qa.merchant@trueserve.dev
--   Admin    : qa.admin@trueserve.dev
-- (Passwords must be set via Supabase Auth — see QA onboarding)
-- =============================================================================
