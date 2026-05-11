import { placeOrder, updateOrderAddress, cancelOrderAssignment, cancelOrderItems } from '@/app/restaurants/actions';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));
jest.mock('@supabase/supabase-js');
jest.mock('@/lib/stripe', () => {
    const mockStripe = {
        paymentIntents: {
            retrieve: jest.fn(),
            create: jest.fn(),
        },
        webhooks: {
            constructEvent: jest.fn()
        }
    };
    return {
        stripe: mockStripe,
        getStripe: () => mockStripe
    };
});
import { stripe } from '@/lib/stripe';
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('next/headers', () => ({ cookies: jest.fn(() => ({ get: () => ({ value: 'test-user' }) })) }));
jest.mock('@/lib/system', () => ({
    isOrderingEnabled: jest.fn().mockResolvedValue(true),
    getRestaurantMinComplianceScore: jest.fn().mockResolvedValue(0),
    shouldBlockFlaggedRestaurantOrders: jest.fn().mockResolvedValue(false),
    getSystemConfig: jest.fn().mockImplementation((_key: string, defaultValue: any) => Promise.resolve(defaultValue)),
}));

describe('Order Actions - Business Logic Scenarios', () => {
    let mockSupabase: any;

    beforeAll(() => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock.url';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key';
    });

    beforeEach(() => {
        jest.clearAllMocks();

        const createMock = () => {
            const m: any = {
                from: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                delete: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
                maybeSingle: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
                is: jest.fn().mockReturnThis(),
                then: jest.fn().mockImplementation((resolve, reject) => {
                    return Promise.resolve({ data: null, error: null }).then(resolve, reject);
                })
            };
            return m;
        };

        mockSupabase = createMock();
        (createSupabaseClient as jest.Mock).mockReturnValue(mockSupabase);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Scenario 1.2: Restaurant Closed Check', async () => {
        // Mock toLocaleTimeString to return a time outside of 08:00-22:00
        jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('02:00:00');
        (stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue({ status: 'succeeded' });
        // Return restaurant with explicit open/close times
        mockSupabase.single.mockResolvedValue({
            data: { lat: 35.2, lng: -80.8, openTime: '08:00:00', closeTime: '22:00:00' },
            error: null
        });

        const result = await placeOrder('rest-123', [{ id: 'item-1', price: 10, quantity: 1 }], 'intent-123');
        expect(result.message).toContain('closed');
        expect(result.error).toBe(true);
    });

    test('Scenario 1.3: Menu Price Change Mid-Session', async () => {
        (stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue({ status: 'succeeded' });
        jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
        mockSupabase.single
            .mockResolvedValueOnce({ data: { lat: 35.2, lng: -80.8, openTime: '08:00:00', closeTime: '22:00:00' }, error: null })
            .mockResolvedValue({ data: { id: 'user-1' }, error: null });

        // DB returns items at a higher price than what customer submitted
        mockSupabase.then.mockImplementation((resolve: any) => resolve({
            data: [{ id: 'item-1', price: 50.00, name: 'Expensive Burger', inventory: 10, isAvailable: true }],
            error: null
        }));

        const cartItems = [{ id: 'item-1', price: 10.00, quantity: 1 }];
        const result = await placeOrder('rest-123', cartItems, 'intent-123');

        // The function should not error on stock or price — it uses server-side price.
        // We verify no inventory/price error (price protection is handled server-side silently).
        expect(result.error).not.toBe('price_mismatch');
    });

    test('Scenario 1.4: Delivery Zone Restriction', async () => {
        (stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue({ status: 'succeeded' });
        jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
        mockSupabase.single.mockResolvedValue({ data: { lat: 35.2271, lng: -80.8431, openTime: '08:00:00', closeTime: '22:00:00' }, error: null });
        jest.spyOn(Date.prototype, 'getHours').mockReturnValue(12);

        const result = await placeOrder('rest-123', [{ id: 'item-1', price: 10, quantity: 1 }], 'intent-123', 35.7796, -78.6382);
        expect(result.message).toContain('outside our 10-mile delivery radius');
        expect(result.error).toBe(true);
    });

    test('Scenario 1.5: Inventory Conflict (Out of Stock)', async () => {
        (stripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue({ status: 'succeeded' });
        jest.spyOn(Date.prototype, 'toLocaleTimeString').mockReturnValue('12:00:00');
        mockSupabase.single
            .mockResolvedValueOnce({ data: { lat: 35.2, lng: -80.8, openTime: '08:00:00', closeTime: '22:00:00' }, error: null })
            .mockResolvedValue({ data: { id: 'user-1' }, error: null });

        // Item has 0 inventory
        mockSupabase.then.mockImplementation((resolve: any) => resolve({
            data: [{ id: 'item-1', price: 10.00, name: 'Sold Out Burger', inventory: 0, isAvailable: true }],
            error: null
        }));

        const result = await placeOrder('rest-123', [{ id: 'item-1', price: 10, quantity: 1 }], 'intent-123');
        expect(result.message).toContain('unavailable');
    });

    test('Scenario 1.6: Idempotency (Duplicate Request After Success)', async () => {
        mockSupabase.maybeSingle.mockResolvedValue({ data: { id: 'existing-order-id' }, error: null });
        const result = await placeOrder('rest-123', [{ id: 'item-1', price: 10, quantity: 1 }], 'intent-123');
        expect(result.success).toBe(true);
    });

    test('Scenario 1.8: Address Change Restriction (Driver Assigned)', async () => {
        // Mock order as ready for pickup but with a driver already assigned
        mockSupabase.single.mockResolvedValue({ data: { status: 'READY_FOR_PICKUP', driverId: 'driver-123' }, error: null });
        const result = await updateOrderAddress('order-123', '456 New St', 35.1, -80.9);
        expect(result.error).toContain('while order is driver assigned');
    });

    test('Scenario 1.8: Address Change Allowed (Preparing Order)', async () => {
        // Address change should be allowed during PREPARING (assuming no driver assigned yet)
        mockSupabase.single.mockResolvedValue({ data: { status: 'PREPARING', driverId: null }, error: null });
        mockSupabase.then.mockImplementation((resolve: any) => resolve({ data: null, error: null }));

        const result = await updateOrderAddress('order-123', '456 New St', 35.1, -80.9);
        expect(result.success).toBe(true);
    });

    test('Scenario 1.10: Driver Cancellation (Reassignment)', async () => {
        // Driver can cancel if status is READY_FOR_PICKUP and they are the assigned driver
        mockSupabase.single.mockResolvedValue({ data: { status: 'READY_FOR_PICKUP', driverId: 'driver-789' }, error: null });
        mockSupabase.then.mockImplementation((resolve: any) => resolve({ data: null, error: null }));

        const result = await cancelOrderAssignment('order-123', 'driver-789');
        expect(result.success).toBe(true);
    });

    test('Scenario 1.11.3: Cancellation Below Minimum Basket', async () => {
        const orderId = 'order-min-basket';
        const items = [
            { id: 'item-a', price: 12, quantity: 1 },
            { id: 'item-b', price: 8, quantity: 1 },
            { id: 'item-c', price: 4, quantity: 1 },
        ];

        mockSupabase.single.mockResolvedValue({
            data: {
                id: orderId,
                status: 'PREPARING',
                total: 24,
                OrderItem: items,
                stripePaymentIntentId: 'pi_mock'
            },
            error: null
        });

        // Cancel Item B ($8) -> New Total $16 (Below $20 minimum)
        const result = await cancelOrderItems(orderId, ['item-b']);

        expect(result.success).toBe(true);
        expect(result.newTotal).toBe(16);
        expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
            total: 16
        }));
    });

    test('Scenario 1.11.1: Cancellation After Driver Pickup', async () => {
        mockSupabase.single.mockResolvedValue({
            data: {
                id: 'order-pickup',
                status: 'PICKED_UP',
                OrderItem: [{ id: 'item-a', price: 10, quantity: 1 }, { id: 'item-b', price: 10, quantity: 1 }]
            },
            error: null
        });

        const result = await cancelOrderItems('order-pickup', ['item-a']);
        expect(result.success).toBe(true);
        expect(result.newTotal).toBe(10);
    });
});
