'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

export interface SavedAddress {
    id: string;
    label: string;
    address: string;
    notes?: string;
    isDefault: boolean;
}

export async function getSavedAddresses(userId: string): Promise<SavedAddress[]> {
    const { data, error } = await supabaseAdmin
        .from('User')
        .select('savedAddresses')
        .eq('id', userId)
        .maybeSingle();

    if (error || !data) return [];

    try {
        const raw = data.savedAddresses;
        if (!raw) return [];
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function saveAddress(
    userId: string,
    address: SavedAddress
): Promise<{ success: boolean; error?: string; addresses?: SavedAddress[] }> {
    try {
        const existing = await getSavedAddresses(userId);
        const idx = existing.findIndex((a) => a.id === address.id);

        let updated: SavedAddress[];

        if (address.isDefault) {
            // Clear default on all others first
            const cleared = existing.map((a) => ({ ...a, isDefault: false }));
            if (idx >= 0) {
                cleared[idx] = address;
                updated = cleared;
            } else {
                updated = [...cleared, address];
            }
        } else {
            if (idx >= 0) {
                const copy = [...existing];
                copy[idx] = address;
                updated = copy;
            } else {
                updated = [...existing, address];
            }
        }

        const { error } = await supabaseAdmin
            .from('User')
            .update({
                savedAddresses: JSON.stringify(updated),
                updatedAt: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) return { success: false, error: error.message };
        return { success: true, addresses: updated };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

export async function deleteAddress(
    userId: string,
    addressId: string
): Promise<{ success: boolean; error?: string; addresses?: SavedAddress[] }> {
    try {
        const existing = await getSavedAddresses(userId);
        const updated = existing.filter((a) => a.id !== addressId);

        // If we deleted the default and there are remaining addresses, make the first one default
        const hasDefault = updated.some((a) => a.isDefault);
        if (!hasDefault && updated.length > 0) {
            updated[0] = { ...updated[0], isDefault: true };
        }

        const { error } = await supabaseAdmin
            .from('User')
            .update({
                savedAddresses: JSON.stringify(updated),
                updatedAt: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) return { success: false, error: error.message };
        return { success: true, addresses: updated };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: msg };
    }
}

export async function setDefaultAddress(
    userId: string,
    addressId: string
): Promise<{ success: boolean; error?: string; addresses?: SavedAddress[] }> {
    try {
        const existing = await getSavedAddresses(userId);
        const updated = existing.map((a) => ({
            ...a,
            isDefault: a.id === addressId,
        }));

        const { error } = await supabaseAdmin
            .from('User')
            .update({
                savedAddresses: JSON.stringify(updated),
                updatedAt: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) return { success: false, error: error.message };
        return { success: true, addresses: updated };
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        return { success: false, error: msg };
    }
}
