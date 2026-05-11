/**
 * Daily Inspection Due Alert Cron Job
 * Runs at 6 AM UTC to check for approaching inspections and send alerts
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { sendSMS } from '@/lib/sms';
import {
  getDaysUntilDue,
  shouldSendAlert,
  getAlertMessage,
  getAlertUrgency,
} from '@/lib/stateInspectionRequirements';
import {
  getRestaurantsApproachingDueDate,
  updateAlertStatus,
  logAlertHistory,
} from '@/lib/inspectionAlertQueries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AlertResult {
  restaurantId: string;
  restaurantName: string;
  daysUntilDue: number;
  alertType?: '30_days' | '7_days' | 'overdue';
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

    console.log('[check-inspection-alerts] Starting inspection alert check');

    const results: AlertResult[] = [];

    // Get all restaurants with inspection due dates within next 35 days or overdue
    const restaurantsToAlert = await getRestaurantsApproachingDueDate(35);

    console.log(
      `[check-inspection-alerts] Found ${restaurantsToAlert.length} restaurants with approaching due dates`
    );

    // Process each restaurant
    for (const { alert, restaurant } of restaurantsToAlert) {
      try {
        const dueDate = new Date(alert.calculatedDueDate);
        const daysUntil = getDaysUntilDue(dueDate);

        // Determine which alert(s) to send
        const should30Day =
          shouldSendAlert(
            daysUntil,
            '30_days',
            alert.alert30DaysSentAt ? new Date(alert.alert30DaysSentAt) : null
          ) && daysUntil > 7; // Don't send 30-day if already in 7-day window

        const should7Day =
          shouldSendAlert(
            daysUntil,
            '7_days',
            alert.alert7DaysSentAt ? new Date(alert.alert7DaysSentAt) : null
          );

        const shouldOverdue =
          shouldSendAlert(
            daysUntil,
            'overdue',
            alert.alertOverdueSentAt ? new Date(alert.alertOverdueSentAt) : null
          );

        if (!should30Day && !should7Day && !shouldOverdue) {
          continue; // No alert needed yet
        }

        // Determine alert type and send
        let alertType: '30_days' | '7_days' | 'overdue' = '30_days';
        if (shouldOverdue) alertType = 'overdue';
        else if (should7Day) alertType = '7_days';

        const urgency = getAlertUrgency(daysUntil);
        const alertMessage = getAlertMessage(
          daysUntil,
          restaurant.name,
          dueDate,
          alert.state
        );

        let emailSent = false;
        let smsSent = false;
        let emailError: string | undefined;
        let smsError: string | undefined;

        // Send email
        if (alert.ownerEmail) {
          try {
            const subject = getEmailSubject(alertType, dueDate, restaurant.name);
            await sendEmail(alert.ownerEmail, subject, `<p>${alertMessage}</p>`);
            emailSent = true;
            console.log(
              `[check-inspection-alerts] Email sent to ${alert.ownerEmail} for ${restaurant.name}`
            );
          } catch (err: any) {
            emailError = err?.message || 'Unknown email error';
            console.error(
              `[check-inspection-alerts] Email failed for ${restaurant.name}:`,
              err
            );
          }
        }

        // Send SMS
        if (alert.ownerPhone) {
          try {
            await sendSMS(alert.ownerPhone, alertMessage);
            smsSent = true;
            console.log(
              `[check-inspection-alerts] SMS sent to ${alert.ownerPhone} for ${restaurant.name}`
            );
          } catch (err: any) {
            smsError = err?.message || 'Unknown SMS error';
            console.error(
              `[check-inspection-alerts] SMS failed for ${restaurant.name}:`,
              err
            );
          }
        }

        // Update alert status only if at least one channel succeeded
        if (emailSent || smsSent) {
          await updateAlertStatus(alert.id, alertType);
        }

        // Log alert history for auditing
        await logAlertHistory(
          restaurant.id,
          alert.state,
          alertType,
          daysUntil,
          emailSent,
          smsSent,
          alert.ownerEmail,
          alert.ownerPhone,
          emailError,
          smsError
        );

        results.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          daysUntilDue: daysUntil,
          alertType,
          emailSent,
          smsSent,
          error: emailError || smsError ? `Email: ${emailError || 'OK'}, SMS: ${smsError || 'OK'}` : undefined,
        });
      } catch (error: any) {
        console.error(
          `[check-inspection-alerts] Error processing alert for ${restaurant.name}:`,
          error
        );

        results.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          daysUntilDue: getDaysUntilDue(new Date(alert.calculatedDueDate)),
          emailSent: false,
          smsSent: false,
          error: error?.message || 'Unknown error',
        });
      }
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter((r) => r.emailSent || r.smsSent).length;
    const failureCount = results.filter((r) => !r.emailSent && !r.smsSent && !r.error).length;

    console.log(
      `[check-inspection-alerts] Completed in ${duration}ms. Alerts sent: ${successCount}, Failures: ${failureCount}`
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
    console.error('[check-inspection-alerts] Cron job failed:', error);
    return NextResponse.json(
      {
        error: error.message || 'Alert check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Generate email subject based on alert type and due date
 */
function getEmailSubject(
  alertType: '30_days' | '7_days' | 'overdue',
  dueDate: Date,
  restaurantName: string
): string {
  const dateStr = dueDate.toLocaleDateString();
  switch (alertType) {
    case '30_days':
      return `Checklist Health Inspection Reminder: ${restaurantName} (Due ${dateStr})`;
    case '7_days':
      return `Warning Health Inspection Due Soon: ${restaurantName}`;
    case 'overdue':
      return `Urgent URGENT: Health Inspection Overdue - ${restaurantName}`;
  }
}
