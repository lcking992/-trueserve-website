import { supabaseAdmin } from "./supabase-admin";
import { getAuthSession } from "@/app/auth/actions";

// High-risk actions that trigger anomaly alerts
const ANOMALY_ACTIONS = new Set([
    'WEBHOOK_INVALID_SIGNATURE',
    'FORCE_COMPLETE_ORDER',
    'ADMIN_CANCEL_ORDER',
    'APPROVE_CHANGE',
    'REJECT_DRIVER',
    'CONNECT_STRIPE_PORTAL',
]);

export async function logAudit({
    action,
    targetId,
    entityType,
    before = null,
    after = null,
    message = "",
    metadata = null
}: {
    action: string;
    targetId: string;
    entityType: string;
    before?: any;
    after?: any;
    message?: string;
    metadata?: any;
}) {
    try {
        const { isAuth, userId } = await getAuthSession();
        const actorId = isAuth ? userId : null;
        const finalAfter = after || metadata;

        const { error } = await supabaseAdmin.from('AuditLog').insert({
            actorId,
            action,
            targetId,
            entityType,
            before,
            after: finalAfter,
            message,
            createdAt: new Date().toISOString()
        });

        if (error) {
            console.error("Audit Log Insert Error:", error);
        }

        // --- Step 18: Anomaly Alerting ---
        if (ANOMALY_ACTIONS.has(action)) {
            try {
                const { sendEmail } = await import("@/lib/email");
                const alertBody = `
Urgent Admin Action Alert
---------------------
Action: ${action}
Entity: ${entityType}
Target: ${targetId}
Actor: ${actorId || 'SYSTEM'}
Message: ${message}
Time: ${new Date().toISOString()}

Review the Admin Audit Log at:
https://trueservedelivery.com/admin/dashboard
                `.trim();

                await sendEmail(
                    "security@trueservedelivery.com",
                    `[TrueServe Security] High-Risk Action: ${action}`,
                    alertBody
                );
            } catch (alertErr) {
                // Non-blocking — don't fail the primary action if alerting fails
                console.error("Anomaly alert failed:", alertErr);
            }
        }

    } catch (e) {
        console.error("Critical: Failed to log audit action:", e);
    }
}

// Keep logAuditAction for backward compatibility with existing code
export const logAuditAction = logAudit;
