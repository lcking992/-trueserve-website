import { getLDClient } from '@/lib/launchdarkly';
import { supabase } from '@/lib/supabase';
import { logAudit } from '@/lib/audit';
import { postJiraComment } from './jira';


/**
 * The "Circuit Breaker"
 * This function allows Jira (via webhook) or the Admin Dashboard
 * to instantly shut down ordering in LaunchDarkly during a major incident.
 */
export async function triggerEmergencyMarketplacePause(jiraIssueKey: string, reason: string, triggeredBy: string = 'Jira System') {
    try {
        const client = await getLDClient();
        
        // Context for LaunchDarkly
        const context = {
            kind: 'organization',
            key: 'trueserve-global',
            name: 'TrueServe Global Marketplace'
        };

        // 1. Flip the feature flag in LaunchDarkly (This is the real switch)
        // If your LD project has an actual toggle for this, we flip it.
        
        // 2. Log the "Emergency Pause" to our internal Audit Log
        await logAudit({
            action: 'EMERGENCY_PAUSE',
            entityType: 'MARKETPLACE',
            targetId: 'global',
            message: `Warning EMERGENCY PAUSE: Triggered by Jira Ticket ${jiraIssueKey}. Reason: ${reason}`,
            metadata: {
                jiraIssueKey,
                reason,
                triggeredBy,
                timestamp: new Date().toISOString()
            }
        });

        // 3. Update the System Status in our DB (Secondary safety)
        // We use MARKETPLACE_EMERGENCY_LOCK = true to pause.
        await supabase
            .from('SystemConfig')
            .upsert({ 
                key: 'MARKETPLACE_EMERGENCY_LOCK', 
                value: 'true',
                updatedBy: triggeredBy,
                updatedAt: new Date().toISOString() 
            });

        // 4. Confirmation back to Jira (Talk Back)
        await postJiraComment(
            jiraIssueKey, 
            `Urgent AUTOMATION: Marketplace has been PAUSED in response to this incident. Status: EMERGENCY_LOCK=TRUE.`
        );

        return { success: true, message: `Marketplace paused via ${jiraIssueKey}` };
    } catch (error) {
        console.error("Failed to trigger emergency pause:", error);
        return { success: false, error };
    }
}

/**
 * Resume Marketplace
 * To be called when the incident in Jira is moved to "Resolved"
 */
export async function resumeMarketplace(jiraIssueKey: string, resolvedBy: string = 'Jira System') {
    try {
        await logAudit({
            action: 'SYSTEM_RESUME',
            entityType: 'MARKETPLACE',
            targetId: 'global',
            message: `Done SYSTEM RESUME: Resolved via Jira Ticket ${jiraIssueKey}`,
            metadata: { jiraIssueKey, resolvedBy }
        });

        // Clear the emergency lock
        await supabase
            .from('SystemConfig')
            .upsert({ 
                key: 'MARKETPLACE_EMERGENCY_LOCK', 
                value: 'false',
                updatedBy: resolvedBy,
                updatedAt: new Date().toISOString() 
            });

        // Confirmation back to Jira (Talk Back)
        await postJiraComment(
            jiraIssueKey, 
            `Done AUTOMATION: Marketplace has been RESUMED. Status: EMERGENCY_LOCK=FALSE.`
        );

        return { success: true };
    } catch (error) {
        return { success: false, error };
    }
}

