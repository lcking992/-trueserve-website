"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildComplianceTemplateDraft } from "@/lib/complianceTemplates";

export type ComplianceTemplateActionState = {
    status: "idle" | "success" | "error";
    message: string;
};

export type RefreshInspectionActionState = {
    status: "idle" | "loading" | "success" | "error";
    message: string;
};

export async function saveComplianceTemplateAction(
    _prevState: ComplianceTemplateActionState,
    formData: FormData
): Promise<ComplianceTemplateActionState> {
    const previewMode = (await cookies()).get("preview_mode")?.value === "true";
    const suppliedTitle = String(formData.get("title") || "").trim();
    const suppliedDescription = String(formData.get("description") || "").trim();
    const templateType = String(formData.get("templateType") || "").trim() || "daily_hygiene";

    const draft = buildComplianceTemplateDraft(suppliedDescription || suppliedTitle);

    if (previewMode) {
        return {
            status: "success",
            message: `Preview mode updated with “${suppliedTitle || draft.title}”. Connect a merchant account to save drafts live.`,
        };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { status: "error", message: "Please sign in again to save this template." };
    }

    const { data: restaurant, error: restaurantError } = await supabase
        .from("Restaurant")
        .select("id, name")
        .eq("ownerId", user.id)
        .maybeSingle();

    if (restaurantError) {
        return { status: "error", message: restaurantError.message };
    }

    if (!restaurant) {
        return { status: "error", message: "We couldn't find a merchant restaurant attached to your account." };
    }

    const payload = {
        restaurantId: restaurant.id,
        templateType,
        title: suppliedTitle || draft.title,
        description: suppliedDescription || draft.description,
        status: "DRAFT",
        suggestions: draft.sections.map((section) => section.title),
        sections: draft.sections,
        aiNotes: draft.note,
        lastGeneratedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    };

    const { error } = await supabase
        .from("ComplianceTemplate")
        .upsert(payload, { onConflict: "restaurantId,templateType" });

    if (error) {
        return { status: "error", message: error.message };
    }

    revalidatePath("/merchant/dashboard/compliance");
    return {
        status: "success",
        message: `${payload.title} saved for ${restaurant.name}.`,
    };
}

/**
 * Manually trigger state inspection data refresh (admin only)
 * Calls the cron sync endpoint for a specific state
 */
export async function refreshStateInspectionsAction(
    state: string,
    restaurantId: string
): Promise<RefreshInspectionActionState> {
    try {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret) {
            return {
                status: "error",
                message: "Refresh not available - system misconfigured",
            };
        }

        // Trigger the cron job to sync this state
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cron/sync-state-inspections`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${cronSecret}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            return {
                status: "error",
                message: `Refresh failed: ${error.error || 'Unknown error'}`,
            };
        }

        const result = await response.json();

        revalidatePath("/merchant/dashboard/compliance");
        return {
            status: "success",
            message: `Inspection data refreshed for ${state}. Synced ${result.summary?.totalRestaurantsSynced || 0} records.`,
        };
    } catch (error: any) {
        console.error('[refreshStateInspections] Error:', error);
        return {
            status: "error",
            message: `Refresh failed: ${error?.message || 'Unknown error'}`,
        };
    }
}
