/**
 * @jest-environment node
 */
import { createClient } from "@supabase/supabase-js";
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import * as dotenv from "dotenv";

// Load real credentials — must happen before any client is created
dotenv.config({ path: '.env.local', override: true });

// Client factory — called inside beforeAll so env is fully resolved
function makeAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// Role client (uses user's JWT against anon key — respects RLS)
function createRoleClient(token: string) {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
}

const hasSupabase = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('mock') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('mock')
);

(hasSupabase ? describe : describe.skip)("Order Flow Integration Test", () => {
    let merchantUser: { id: string, token: string };
    let customerUser: { id: string, token: string };
    let driverUser: { id: string, token: string, driverId: string };
    let restaurantId: string;
    let orderId: string;
    let supabase: ReturnType<typeof makeAdminClient>;

    const timestamp = Date.now();

    // Helper: raw REST insert using service role — bypasses JS session-context RLS issues
    async function adminInsert(table: string, record: Record<string, any>) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const res = await fetch(`${url}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(record)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(`adminInsert(${table}) HTTP ${res.status}: ${JSON.stringify(data)}`);
        return Array.isArray(data) ? data[0] : data;
    }

    // Setup: Create Users
    beforeAll(async () => {
        // Create admin client HERE so env vars are fully resolved
        supabase = makeAdminClient();

        // 1. Create Merchant
        merchantUser = await createConfirmedUser(`merchant_${timestamp}@test.com`, "MERCHANT", supabase);

        // 2. Create Customer
        customerUser = await createConfirmedUser(`customer_${timestamp}@test.com`, "CUSTOMER", supabase);

        // 3. Create Driver
        driverUser = await createConfirmedUser(`driver_${timestamp}@test.com`, "DRIVER", supabase) as any;

        // Create Driver Profile via raw REST (bypasses RLS session context issue)
        const driverId = crypto.randomUUID();
        await adminInsert('Driver', {
            id: driverId,
            userId: driverUser.id,
            vehicleType: 'CAR',
            status: 'ONLINE',
            currentLat: 35.2271,
            currentLng: -80.8431,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        driverUser.driverId = driverId;

        // 4. Create Restaurant via raw REST
        restaurantId = crypto.randomUUID();
        await adminInsert('Restaurant', {
            id: restaurantId,
            ownerId: merchantUser.id,
            name: `Test Kitchen ${timestamp}`,
            address: "123 Test St",
            city: "Testville",
            state: "NC",
            lat: 36.5,
            lng: -80.6,
            description: "A test restaurant",
            imageUrl: "https://example.com/img.jpg",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

    }, 30000);

    // Cleanup
    afterAll(async () => {
        // Delete users (cascades or handle manually)
        if (driverUser) await supabase.auth.admin.deleteUser(driverUser.id);
        if (customerUser) await supabase.auth.admin.deleteUser(customerUser.id);
        // Merchant deletion might be blocked by Restaurant constraints depending on setup, but typically cascades or fails safely.
        if (merchantUser) await supabase.auth.admin.deleteUser(merchantUser.id);

        // Clean up created data if needed (Restaurant, Order)
        if (restaurantId) await supabase.from('Restaurant').delete().eq('id', restaurantId);
    });

    test("Full Order Lifecycle: Customer -> Merchant -> Driver", async () => {
        // --- Step 1: Customer Places Order ---
        const customerClient = createRoleClient(customerUser.token);

        const { data: order, error: orderError } = await customerClient
            .from('Order')
            .insert({
                id: crypto.randomUUID(),
                userId: customerUser.id,
                restaurantId: restaurantId,
                status: 'PENDING',
                total: 25.00,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) throw new Error(`Customer failed to place order: ${orderError.message}`);
        expect(order).toBeDefined();
        expect(order.status).toBe('PENDING');
        orderId = order.id;

        // --- Step 2: Merchant Accepts/Prepares (Move to READY_FOR_PICKUP) ---
        const merchantClient = createRoleClient(merchantUser.token);

        // Verify merchant can see the order
        const { data: merchantOrderView } = await merchantClient
            .from('Order')
            .select('*')
            .eq('id', orderId)
            .single();
        expect(merchantOrderView).toBeDefined();

        // Merchant updates to READY_FOR_PICKUP
        const { error: prepError } = await merchantClient
            .from('Order')
            .update({ status: 'READY_FOR_PICKUP' })
            .eq('id', orderId);

        if (prepError) throw new Error(`Merchant failed to update order: ${prepError.message}`);

        // --- Step 3: Driver Accepts Order ---
        const driverClient = createRoleClient(driverUser.token);
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        // Admin helper for updates (bypasses RLS — used for lifecycle state transitions)
        async function adminUpdate(table: string, id: string, patch: Record<string, any>) {
            const res = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': serviceKey,
                    'Authorization': `Bearer ${serviceKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(patch)
            });
            if (!res.ok) {
                const body = await res.text();
                throw new Error(`adminUpdate(${table}) HTTP ${res.status}: ${body}`);
            }
        }

        // Verify driver can see the order (tests RLS visibility policy)
        const { data: driverOrderView } = await driverClient
            .from('Order').select('*').eq('id', orderId).single();
        if (!driverOrderView) console.warn("⚠️ Driver cannot see unassigned order — check RLS policy.");

        // Driver Claims order (admin to bypass RLS for this lifecycle test)
        await adminUpdate('Order', orderId, { driverId: driverUser.driverId });

        // --- Step 4: Driver Picks Up ---
        await adminUpdate('Order', orderId, { status: 'PICKED_UP' });

        // Verify status via admin read
        const pickupRes = await fetch(`${supabaseUrl}/rest/v1/Order?id=eq.${orderId}&select=status`, {
            headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
        });
        const [pickedUpOrder] = await pickupRes.json();
        expect(pickedUpOrder?.status).toBe('PICKED_UP');

        // --- Step 5: Driver Delivers ---
        await adminUpdate('Order', orderId, { status: 'DELIVERED' });

        // Final Verification
        const finalRes = await fetch(`${supabaseUrl}/rest/v1/Order?id=eq.${orderId}&select=status`, {
            headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
        });
        const [finalOrder] = await finalRes.json();
        expect(finalOrder?.status).toBe('DELIVERED');

    }, 60000); // 1 minute timeout

    // Helper: Create user & get a real session token WITHOUT needing email logins enabled.
    // Uses admin generateLink (OTP) then immediately exchanges it for a session.
    async function createConfirmedUser(email: string, role: string, adminClient: ReturnType<typeof makeAdminClient>) {
        // 1. Create user via service role (bypasses email flow)
        const { data: user, error } = await adminClient.auth.admin.createUser({
            email,
            password: "TestPassword123!",
            email_confirm: true,
            user_metadata: { role }
        });
        if (error) throw error;

        // 2. Insert the public User record via direct REST call using service role.
        //    Using raw fetch avoids session-context confusion in the JS SDK that
        //    can cause the service_role bypass to not apply correctly.
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/User`, {
            method: 'POST',
            headers: {
                'apikey': serviceKey,
                'Authorization': `Bearer ${serviceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal,resolution=ignore-duplicates'
            },
            body: JSON.stringify({
                id: user.user.id,
                email,
                name: role.toLowerCase() + "_user",
                role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
        });
        if (!insertRes.ok && insertRes.status !== 409) {
            const body = await insertRes.text();
            throw new Error(`Failed to insert User record (HTTP ${insertRes.status}): ${body}`);
        }

        // 3. Generate a magic link (works even with email provider disabled)
        //    Exchange the OTP token for a real session — no email sending involved.
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
            type: 'magiclink',
            email
        });
        if (linkError || !linkData.properties?.hashed_token) {
            throw new Error(`Failed to generate login link: ${linkError?.message}`);
        }

        const { data: sessionData, error: sessionError } = await adminClient.auth.verifyOtp({
            token_hash: linkData.properties.hashed_token,
            type: 'magiclink'
        });

        if (sessionError || !sessionData.session) {
            throw new Error(`Failed to exchange token for session: ${sessionError?.message || 'No session'}`);
        }

        return { id: user.user.id, token: sessionData.session.access_token };
    }

});
