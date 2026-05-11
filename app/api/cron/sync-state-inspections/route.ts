/**
 * State API Inspection Sync Cron Job
 * Runs daily at 4 AM UTC to fetch inspection data from state health departments
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isComplianceLayerEnabled } from '@/lib/system';
import { inspectionCache } from '@/lib/inspectionCache';
import { calculateAndSaveDueDate } from '@/lib/inspectionAlertQueries';
import { NorthCarolinaAPI } from '@/lib/stateAPIs/ncAPI';
import { NewYorkAPI } from '@/lib/stateAPIs/nyAPI';
import { FloridaAPI } from '@/lib/stateAPIs/flAPI';
import { PennsylvaniaAPI } from '@/lib/stateAPIs/paAPI';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SyncResult {
  state: string;
  success: boolean;
  recordsSynced: number;
  recordsFailed: number;
  errors: Array<{ restaurantId: string; error: string }>;
  duration: number;
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

let _stateAPIs: Record<string, any> | null = null;
function getStateAPIs() {
  if (!_stateAPIs) {
    _stateAPIs = {
      NC: new NorthCarolinaAPI(process.env.NC_HEALTH_DEPT_API_KEY),
      NY: new NewYorkAPI(process.env.NY_HEALTH_DEPT_API_KEY),
      FL: new FloridaAPI(process.env.FL_HEALTH_DEPT_API_KEY),
      PA: new PennsylvaniaAPI(process.env.PA_HEALTH_DEPT_API_KEY),
    };
  }
  return _stateAPIs;
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

    // Check if compliance layer is enabled
    if (!(await isComplianceLayerEnabled())) {
      return NextResponse.json(
        { error: 'Compliance layer is disabled' },
        { status: 404 }
      );
    }

    console.log('[sync-state-inspections] Starting state API sync');

    // Run sync for each state
    const results: SyncResult[] = [];
    const states = Object.keys(getStateAPIs());

    for (const state of states) {
      const stateStartTime = Date.now();
      const result = await syncState(state);
      const stateDuration = Date.now() - stateStartTime;

      results.push({
        ...result,
        duration: stateDuration,
      });

      console.log(
        `[sync-state-inspections] ${state} sync completed in ${stateDuration}ms`,
        {
          synced: result.recordsSynced,
          failed: result.recordsFailed,
          success: result.success,
        }
      );
    }

    // Log overall sync results
    const totalDuration = Date.now() - startTime;
    const totalSynced = results.reduce((sum, r) => sum + r.recordsSynced, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.recordsFailed, 0);
    const allErrors = results.flatMap((r) => r.errors);

    // Save sync log to database
    await logSyncResults(results);

    // Check for critical failures
    const failedStates = results.filter((r) => !r.success);
    if (failedStates.length > 0) {
      console.error('[sync-state-inspections] Some states failed:', failedStates);
      // TODO: Send alert to Slack/ops team
    }

    return NextResponse.json({
      success: allErrors.length === 0,
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      summary: {
        totalRestaurantsSynced: totalSynced,
        totalRecordsFailed: totalFailed,
        stateResults: results.map((r) => ({
          state: r.state,
          synced: r.recordsSynced,
          failed: r.recordsFailed,
          success: r.success,
          duration: r.duration,
        })),
        errorCount: allErrors.length,
        errors:
          allErrors.length > 0
            ? allErrors.slice(0, 10) // Return first 10 errors
            : [],
      },
    });
  } catch (error: any) {
    console.error('[sync-state-inspections] Cron job failed:', error);
    return NextResponse.json(
      {
        error: error.message || 'Sync job failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Sync inspections for a single state
 */
async function syncState(state: string): Promise<SyncResult> {
  const errors: Array<{ restaurantId: string; error: string }> = [];
  let recordsSynced = 0;
  let recordsFailed = 0;

  try {
    const api = getStateAPIs()[state];
    if (!api) {
      throw new Error(`No API implementation for state ${state}`);
    }

    // Get all restaurants in this state with externalEstablishmentId
    const { data: restaurants, error: queryError } = await getSupabaseAdmin()
      .from('Restaurant')
      .select('id, externalEstablishmentId, state')
      .eq('state', state)
      .eq('stateInspectionDataEnabled', true)
      .not('externalEstablishmentId', 'is', null);

    if (queryError) {
      console.error(`[${state}] Query error:`, queryError);
      return {
        state,
        success: false,
        recordsSynced: 0,
        recordsFailed: 0,
        errors: [{ restaurantId: 'ALL', error: queryError.message }],
        duration: 0,
      };
    }

    if (!restaurants || restaurants.length === 0) {
      console.log(`[${state}] No restaurants to sync`);
      return {
        state,
        success: true,
        recordsSynced: 0,
        recordsFailed: 0,
        errors: [],
        duration: 0,
      };
    }

    console.log(`[${state}] Syncing ${restaurants.length} restaurants`);

    // Sync each restaurant
    for (const restaurant of restaurants) {
      try {
        // Fetch inspections from state API
        const inspections = await api.getInspections(
          restaurant.externalEstablishmentId
        );

        if (inspections && inspections.length > 0) {
          // Cache the data
          const cached = await inspectionCache.saveToCache(
            restaurant.id,
            state,
            inspections
          );

          if (cached) {
            recordsSynced += inspections.length;

            // Update restaurant with latest inspection info
            const latest = inspections[0]; // Most recent inspection
            const updateError = await updateRestaurant(
              restaurant.id,
              latest,
              state
            );

            if (updateError) {
              recordsFailed++;
              errors.push({
                restaurantId: restaurant.id,
                error: `Could not update restaurant: ${updateError}`,
              });
            } else {
              // Calculate and save next inspection due date for predictive alerts
              try {
                const inspectionDate = new Date(latest.inspectionDate);
                await calculateAndSaveDueDate(restaurant.id, state, inspectionDate);
              } catch (dueDateError: any) {
                console.error(
                  `[${state}] Failed to calculate due date for ${restaurant.id}:`,
                  dueDateError
                );
                // Don't fail the sync if due date calculation fails
              }
            }
          } else {
            recordsFailed++;
            errors.push({
              restaurantId: restaurant.id,
              error: 'Failed to cache inspection data',
            });
          }
        }
      } catch (error: any) {
        recordsFailed++;
        errors.push({
          restaurantId: restaurant.id,
          error: error?.message || String(error),
        });
      }
    }

    return {
      state,
      success: errors.length === 0,
      recordsSynced,
      recordsFailed,
      errors,
      duration: 0,
    };
  } catch (error: any) {
    console.error(`[${state}] Sync error:`, error);
    return {
      state,
      success: false,
      recordsSynced: 0,
      recordsFailed: 1,
      errors: [{ restaurantId: 'ALL', error: error?.message || String(error) }],
      duration: 0,
    };
  }
}

/**
 * Update restaurant with latest inspection data
 */
async function updateRestaurant(
  restaurantId: string,
  inspection: any,
  state: string
): Promise<string | null> {
  try {
    const { error } = await getSupabaseAdmin()
      .from('Restaurant')
      .update({
        healthGrade: inspection.grade,
        lastInspectionAt: inspection.inspectionDate.toISOString(),
        lastInspectionSource: state,
        publicInspectionUrl: inspection.externalURL,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', restaurantId);

    if (error) {
      return error.message;
    }

    // Recalculate compliance score
    await getSupabaseAdmin().rpc('recalculate_restaurant_compliance_score', {
      target_restaurant_id: restaurantId,
    });

    return null;
  } catch (error: any) {
    return error?.message || String(error);
  }
}

/**
 * Log sync results to database for monitoring
 */
async function logSyncResults(results: SyncResult[]): Promise<void> {
  try {
    const logs = results.map((r) => ({
      state: r.state,
      syncStartedAt: new Date().toISOString(),
      syncCompletedAt: new Date().toISOString(),
      recordsSynced: r.recordsSynced,
      recordsFailed: r.recordsFailed,
      errorCount: r.errors.length,
      status: r.success ? 'success' : r.recordsSynced > 0 ? 'partial' : 'failed',
      errorDetails: r.errors,
    }));

    const { error } = await getSupabaseAdmin()
      .from('StateAPISyncLog')
      .insert(logs);

    if (error) {
      console.error('[sync-state-inspections] Failed to log results:', error);
    }
  } catch (error) {
    console.error('[sync-state-inspections] Log error:', error);
  }
}
