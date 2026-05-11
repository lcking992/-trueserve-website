/**
 * Critical Violation Alert Cron Job
 * Runs daily at 5 AM UTC to check for new critical violations and send alerts
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';
import {
  getUnsentCriticalViolationAlerts,
  updateCriticalViolationAlertStatus,
  getCriticalViolationsForRestaurant,
} from '@/lib/violationAnalytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AlertResult {
  restaurantId: string;
  restaurantName: string;
  violationCount: number;
  emailSent: boolean;
  smsSent: boolean;
  error?: string;
}

import type { SupabaseClient } from '@supabase/supabase-js';
let _supabaseAdmin: SupabaseClient | null = null;
function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return _supabaseAdmin;
}

export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Verify CRON_SECRET for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[check-critical-violations] Starting critical violation check');

    const results: AlertResult[] = [];

    // Get all unsent critical violation alerts
    const unsentAlerts = await getUnsentCriticalViolationAlerts();

    console.log(
      `[check-critical-violations] Found ${unsentAlerts.length} restaurants with unsent critical violation alerts`
    );

    // Process each restaurant
    for (const alert of unsentAlerts) {
      try {
        const criticalViolations = await getCriticalViolationsForRestaurant(
          alert.restaurantId
        );
        const violationCount = criticalViolations.length;

        if (violationCount === 0) {
          // No critical violations found, mark as processed anyway
          await updateCriticalViolationAlertStatus(alert.id);
          continue;
        }

        let emailSent = false;
        let smsSent = false;
        let emailError: string | undefined;
        let smsError: string | undefined;

        // Generate alert message
        const violationList = criticalViolations
          .slice(0, 3)
          .map((v) => `• ${v.description}`)
          .join('\n');

        const moreViolations =
          violationCount > 3 ? `\n... and ${violationCount - 3} more violations` : '';

        const emailBody = `
<h2>Urgent Critical Health Code Violations Detected</h2>
<p>Your restaurant <strong>${alert.restaurantName}</strong> in ${alert.state} has <strong>${violationCount} critical violations</strong> from the recent inspection on <strong>${new Date(alert.inspectionDate).toLocaleDateString()}</strong>.</p>

<h3>Critical Violations Found:</h3>
<pre>${violationList}${moreViolations}</pre>

<h3>Required Actions:</h3>
<ol>
  <li>Review each violation immediately</li>
  <li>Develop a corrective action plan</li>
  <li>Assign responsibility for each item</li>
  <li>Set completion deadlines</li>
  <li>Schedule follow-up inspection if required by your state</li>
</ol>

<p><strong>Note:</strong> Critical violations must be corrected immediately to ensure food safety and maintain compliance. Failure to address these violations may result in operational restrictions or closure.</p>

<p>Log in to your merchant dashboard to view the full inspection report and track remediation progress.</p>
        `;

        const smsMessage = `Urgent CRITICAL: ${alert.restaurantName} has ${violationCount} critical health violations from recent inspection. Log into your dashboard for details and remediation steps.`;

        // Send email
        if (alert.ownerEmail) {
          try {
            await sendEmail(
              alert.ownerEmail,
              `Urgent URGENT: Critical Health Code Violations - ${alert.restaurantName}`,
              emailBody
            );
            emailSent = true;
            console.log(
              `[check-critical-violations] Email sent to ${alert.ownerEmail} for ${alert.restaurantName}`
            );
          } catch (err: any) {
            emailError = err?.message || 'Unknown email error';
            console.error(
              `[check-critical-violations] Email failed for ${alert.restaurantName}:`,
              err
            );
          }
        }

        // Send SMS
        if (alert.ownerPhone) {
          try {
            await sendSMS(alert.ownerPhone, smsMessage);
            smsSent = true;
            console.log(
              `[check-critical-violations] SMS sent to ${alert.ownerPhone} for ${alert.restaurantName}`
            );
          } catch (err: any) {
            smsError = err?.message || 'Unknown SMS error';
            console.error(
              `[check-critical-violations] SMS failed for ${alert.restaurantName}:`,
              err
            );
          }
        }

        // Update alert status
        if (emailSent || smsSent) {
          await updateCriticalViolationAlertStatus(alert.id);
        }

        // Flag restaurant as having critical violations
        if (emailSent || smsSent) {
          const { error: updateError } = await getSupabaseAdmin()
            .from('Restaurant')
            .update({
              hasCriticalViolations: true,
              lastCriticalViolationDate: new Date().toISOString(),
              complianceStatus: 'FLAGGED',
            })
            .eq('id', alert.restaurantId);

          if (updateError) {
            console.error(
              `[check-critical-violations] Error flagging restaurant:`,
              updateError
            );
          }
        }

        results.push({
          restaurantId: alert.restaurantId,
          restaurantName: alert.restaurantName,
          violationCount,
          emailSent,
          smsSent,
          error: emailError || smsError ? `Email: ${emailError || 'OK'}, SMS: ${smsError || 'OK'}` : undefined,
        });
      } catch (error: any) {
        console.error(
          `[check-critical-violations] Error processing alert for ${alert.restaurantName}:`,
          error
        );

        results.push({
          restaurantId: alert.restaurantId,
          restaurantName: alert.restaurantName,
          violationCount: 0,
          emailSent: false,
          smsSent: false,
          error: error?.message || 'Unknown error',
        });
      }
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter((r) => r.emailSent || r.smsSent).length;
    const failureCount = results.filter((r) => !r.emailSent && !r.smsSent && r.error).length;

    console.log(
      `[check-critical-violations] Completed in ${duration}ms. Alerts sent: ${successCount}, Failures: ${failureCount}`
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      alertsSent: successCount,
      alertsFailed: failureCount,
      totalProcessed: results.length,
      results: results.slice(0, 20), // Return first 20 for logging
    });
  } catch (error: any) {
    console.error('[check-critical-violations] Cron job failed:', error);
    return NextResponse.json(
      {
        error: error.message || 'Critical violation check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
