import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, serviceKey);

import { getFeatureFlag } from './posthog';

export type ConfigKey = 
    | 'MAX_DELIVERY_RADIUS_MILES'
    | 'BASE_SERVICE_FEE_PERCENT'
    | 'DRIVER_SHIFT_MAX_HOURS'
    | 'ORDERING_SYSTEM_ENABLED'
    | 'DRIVER_BASE_PAY'
    | 'DRIVER_MILEAGE_RATE'
    | 'DRIVER_TIME_RATE_MIN'
    | 'STRIPE_SERVICE_FEE_PERCENT'
    | 'DELIVERY_COMPLETION_RADIUS_MILES'
    | 'MARKETPLACE_EMERGENCY_LOCK'
    | 'IS_ALPHA_TESTING'
    | 'AI_MENU_SCANNER_ENABLED'
    | 'GOOGLE_RATINGS_SYNC_ENABLED'
    | 'INSTANT_PAYOUTS_ENABLED'
    | 'EXPRESS_CHECKOUT_ACTIVE';

export async function getSystemConfig(key: ConfigKey, defaultValue?: any): Promise<any> {
    try {
        const { data, error } = await supabase
            .from('SystemConfig')
            .select('value')
            .eq('key', key)
            .maybeSingle();

        if (error || !data) return defaultValue;
        return data.value;
    } catch (e) {
        console.error(`Error fetching config ${key}:`, e);
        return defaultValue;
    }
}

/**
 * Bulk fetcher for multiple configurations to reduce DB hits in loops
 */
export async function getManyConfigs(keys: ConfigKey[]): Promise<Record<string, any>> {
    try {
        const { data, error } = await supabase
            .from('SystemConfig')
            .select('key, value')
            .in('key', keys);

        if (error || !data) return {};
        
        const configMap: Record<string, any> = {};
        data.forEach(item => {
            configMap[item.key] = item.value;
        });
        return configMap;
    } catch (e) {
        console.error("Error bulk fetching configs:", e);
        return {};
    }
}

export async function isOrderingEnabled(): Promise<boolean> {
    // 1. PostHog Feature Flag (Highest Priority)
    const ldFlag = await getFeatureFlag('ordering-system-enabled', true);
    if (!ldFlag) return false;

    // 2. Emergency Lock (Trip-wire from Support/Jira)
    const emergencyLock = await getSystemConfig('MARKETPLACE_EMERGENCY_LOCK', false);
    if (emergencyLock === true || emergencyLock === 'true') return false;

    return true;
}

/**
 * Feature-specific Checkers (PostHog + Supabase Fallbacks)
 */
export async function isAiScannerEnabled(): Promise<boolean> {
    const ld = await getFeatureFlag('ai-menu-onboarding', true);
    const db = await getSystemConfig('AI_MENU_SCANNER_ENABLED', true);
    return ld && db;
}

export async function isGoogleRatingSyncEnabled(): Promise<boolean> {
    const ld = await getFeatureFlag('google-business-sync', false);
    const db = await getSystemConfig('GOOGLE_RATINGS_SYNC_ENABLED', false);
    return ld && db;
}

export async function isInstantPayoutEnabled(): Promise<boolean> {
    const ld = await getFeatureFlag('stripe-instant-payouts', true);
    const db = await getSystemConfig('INSTANT_PAYOUTS_ENABLED', true);
    return ld && db;
}

export async function isExpressCheckoutActive(): Promise<boolean> {
    const ld = await getFeatureFlag('express-checkout', true);
    const db = await getSystemConfig('EXPRESS_CHECKOUT_ACTIVE', true);
    return ld && db;
}

export async function updateSystemConfig(key: ConfigKey, value: any, actorId?: string) {
    const { error } = await supabase
        .from('SystemConfig')
        .update({ value, updatedAt: new Date().toISOString() })
        .eq('key', key);

    if (error) throw error;

    // Log the change
    const { logAuditAction } = await import('./audit');
    await logAuditAction({
        action: "UPDATE_SYSTEM_CONFIG",
        targetId: key,
        entityType: "SystemConfig",
        after: { value },
        message: `System config ${key} updated.`
    });
}
