import { NextRequest, NextResponse } from 'next/server';
import { triggerEmergencyMarketplacePause, resumeMarketplace } from '@/lib/triage';
import { sendSMS } from '@/lib/sms';

/**
 * Jira Webhook Handler
 * 
 * This endpoint should be registered in Jira (Settings > System > Webhooks).
 * Recommended JQL filter: "priority = Highest AND status changed"
 */
export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        
        // 1. Extract core info from Jira payload
        const issueKey = payload.issue?.key;
        const statusName = payload.issue?.fields?.status?.name?.toLowerCase();
        const summary = payload.issue?.fields?.summary || "No description provided";
        const actor = payload.user?.displayName || "Jira System";

        if (!issueKey) {
            return NextResponse.json({ error: "No issue key found in payload" }, { status: 400 });
        }

        console.log(`[Jira Webhook] Received update for ${issueKey}. Status: ${statusName}`);

        // 2. Decide Action based on status
        // Note: Customize these status names based on your Jira Workflow
        const PAUSE_STATUSES = ['in progress', 'triage', 'incident detected'];
        const RESUME_STATUSES = ['done', 'resolved', 'closed'];

        if (PAUSE_STATUSES.includes(statusName)) {
            console.log(`[Jira Webhook] Triggering Emergency Market Pause for ${issueKey}...`);
            const result = await triggerEmergencyMarketplacePause(issueKey, summary, actor);
            
            // Urgent SENG ON-CALL SMS ALERT Urgent
            const onCallPhone = process.env.ON_CALL_ADMIN_PHONE;
            if (onCallPhone) {
                await sendSMS(
                    onCallPhone, 
                    `Urgent TRUESERVE EMERGENCY Urgent\nMarketplace was just PAUSED via Jira (${issueKey}).\nReason: ${summary}\nTriggered by: ${actor}`
                );
            } else {
                console.warn("[Jira Webhook] ON_CALL_ADMIN_PHONE is missing from .env.local. No SMS sent.");
            }

            return NextResponse.json(result);
        } 
        
        if (RESUME_STATUSES.includes(statusName)) {
            console.log(`[Jira Webhook] Resuming Marketplace for ${issueKey}...`);
            const result = await resumeMarketplace(issueKey, actor);
            return NextResponse.json(result);
        }

        return NextResponse.json({ 

            message: `No action required for status: ${statusName}`, 
            issue: issueKey 
        });

    } catch (error) {
        console.error("[Jira Webhook Error]:", error);
        return NextResponse.json({ error: "Failed to process Jira webhook" }, { status: 500 });
    }
}
