"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import Stripe from "stripe";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
    if (!_stripe) {
        _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
            apiVersion: "2026-02-25.clover",
        });
    }
    return _stripe;
}

interface ServiceCostRecord {
    service: string;
    month: string;
    cost: number;
    usageMetric: string;
    apiSource: string;
}

/**
 * Fetch Stripe costs for a specific month
 * Uses Stripe Billing API to get invoice data
 */
async function syncStripeCosts(month: string): Promise<ServiceCostRecord | null> {
    try {
        const [year, monthStr] = month.split("-");
        const startDate = new Date(`${year}-${monthStr}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        // Fetch invoices for the month
        const invoices = await getStripe().invoices.list({
            created: {
                gte: Math.floor(startDate.getTime() / 1000),
                lt: Math.floor(endDate.getTime() / 1000),
            },
            limit: 100,
        });

        // Calculate total from paid/open invoices
        const totalCost = invoices.data
            .filter((inv) => inv.status === "paid" || inv.status === "open")
            .reduce((sum, inv) => sum + (inv.total / 100), 0); // Convert cents to dollars

        const transactionCount = invoices.data.length;

        return {
            service: "stripe",
            month,
            cost: parseFloat(totalCost.toFixed(2)),
            usageMetric: `${transactionCount} invoices processed`,
            apiSource: "stripe_api",
        };
    } catch (error) {
        console.error(`Error fetching Stripe costs for ${month}:`, error);
        return null;
    }
}

/**
 * Fetch Google Cloud costs via Cloud Billing API
 * Requires GCP service account credentials
 */
async function syncGoogleCloudCosts(month: string): Promise<ServiceCostRecord | null> {
    try {
        const gcpProjectId = process.env.GCP_PROJECT_ID;
        const gcpBillingAccountId = process.env.GCP_BILLING_ACCOUNT_ID;

        if (!gcpProjectId || !gcpBillingAccountId) {
            console.warn("GCP credentials not configured, skipping Google Cloud costs");
            return null;
        }

        // Parse month to get date range
        const [year, monthStr] = month.split("-");
        const startDate = new Date(`${year}-${monthStr}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1); // Last day of month

        // Format for BigQuery query
        const startStr = startDate.toISOString().split("T")[0];
        const endStr = endDate.toISOString().split("T")[0];

        // Note: This is a placeholder. Full implementation requires:
        // 1. BigQuery client library
        // 2. Service account authentication
        // 3. Query against billing export dataset
        // For now, return null to indicate manual configuration needed
        console.log(`GCP cost sync for ${month} (${startStr} to ${endStr}) requires BigQuery setup`);
        return null;
    } catch (error) {
        console.error(`Error fetching Google Cloud costs for ${month}:`, error);
        return null;
    }
}

/**
 * Fetch Supabase usage metrics
 * Uses Supabase management API for project metrics
 */
async function syncSupabaseCosts(month: string): Promise<ServiceCostRecord | null> {
    try {
        const supabaseProjectId = process.env.SUPABASE_PROJECT_ID;
        const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;

        if (!supabaseProjectId || !supabaseAccessToken) {
            console.warn("Supabase credentials not configured, skipping Supabase costs");
            return null;
        }

        // Fetch from Supabase management API
        const response = await fetch(
            `https://api.supabase.com/v1/projects/${supabaseProjectId}/billing`,
            {
                headers: {
                    Authorization: `Bearer ${supabaseAccessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Supabase API error: ${response.statusText}`);
        }

        const billingData = await response.json();

        // Supabase billing structure varies by plan
        // This extracts cost from the billing response
        const monthlyCost = billingData.billing?.amount_billed || 0;
        const databaseQueries = billingData.usage?.query_count || 0;

        return {
            service: "supabase",
            month,
            cost: parseFloat((monthlyCost / 100).toFixed(2)), // Convert cents to dollars
            usageMetric: `${databaseQueries.toLocaleString()} database queries`,
            apiSource: "supabase_api",
        };
    } catch (error) {
        console.error(`Error fetching Supabase costs for ${month}:`, error);
        return null;
    }
}

/**
 * Fetch Mapbox usage and estimated costs
 * Mapbox pricing based on API requests
 */
async function syncMapboxCosts(month: string): Promise<ServiceCostRecord | null> {
    try {
        const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN;
        const mapboxUsername = process.env.MAPBOX_USERNAME;

        if (!mapboxAccessToken || !mapboxUsername) {
            console.warn("Mapbox credentials not configured, skipping Mapbox costs");
            return null;
        }

        const response = await fetch(
            `https://api.mapbox.com/accounts/v1/${mapboxUsername}/billing/v1/requests`,
            {
                headers: {
                    Authorization: `Bearer ${mapboxAccessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract request counts and calculate costs
        // Mapbox pricing: https://www.mapbox.com/pricing
        const requestCount = data.requests || 0;
        const staticMapRequests = data.static_requests || 0;
        const routingRequests = data.routing_requests || 0;

        // Rough cost estimation (adjust based on actual Mapbox pricing)
        let estimatedCost = 0;
        estimatedCost += (requestCount / 100000) * 3; // ~$3 per 100k requests
        estimatedCost += (routingRequests / 50000) * 5; // ~$5 per 50k routing requests

        return {
            service: "mapbox",
            month,
            cost: parseFloat(estimatedCost.toFixed(2)),
            usageMetric: `${requestCount.toLocaleString()} API requests`,
            apiSource: "mapbox_api",
        };
    } catch (error) {
        console.error(`Error fetching Mapbox costs for ${month}:`, error);
        return null;
    }
}

/**
 * Fetch Resend email delivery costs
 * Resend API for email metrics
 */
async function syncResendCosts(month: string): Promise<ServiceCostRecord | null> {
    try {
        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            console.warn("Resend credentials not configured, skipping Resend costs");
            return null;
        }

        const response = await fetch("https://api.resend.com/emails", {
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Resend API error: ${response.statusText}`);
        }

        const emails = await response.json();

        // Resend pricing: $0.20 per email after free tier (100/day)
        const emailsSent = emails.data?.length || 0;
        const freeEmails = 100 * 30; // 100/day * 30 days
        const paidEmails = Math.max(0, emailsSent - freeEmails);
        const monthlyCost = (paidEmails * 0.2) / 100; // Convert to dollars

        return {
            service: "resend",
            month,
            cost: parseFloat(monthlyCost.toFixed(2)),
            usageMetric: `${emailsSent.toLocaleString()} emails sent`,
            apiSource: "resend_api",
        };
    } catch (error) {
        console.error(`Error fetching Resend costs for ${month}:`, error);
        return null;
    }
}

/**
 * Fetch Vonage SMS costs
 * Vonage/Nexmo REST API for SMS metrics
 */
async function syncVonageCosts(month: string): Promise<ServiceCostRecord | null> {
    try {
        const vonageApiKey = process.env.VONAGE_API_KEY;
        const vonageApiSecret = process.env.VONAGE_API_SECRET;

        if (!vonageApiKey || !vonageApiSecret) {
            console.warn("Vonage credentials not configured, skipping Vonage costs");
            return null;
        }

        // Vonage requires authentication and account ID
        // This is a placeholder - actual implementation would query Vonage Insights API
        console.log(`Vonage cost sync for ${month} requires Insights API setup`);
        return null;
    } catch (error) {
        console.error(`Error fetching Vonage costs for ${month}:`, error);
        return null;
    }
}

/**
 * Sync costs for all services and store in database
 * Fetches data for the previous month by default
 */
export async function syncAllServiceCosts(targetMonth?: string) {
    try {
        // Default to previous month if not specified
        let month = targetMonth;
        if (!month) {
            const now = new Date();
            now.setMonth(now.getMonth() - 1);
            month = now.toISOString().slice(0, 7);
        }

        console.log(`Starting cost sync for ${month}...`);

        // Fetch costs from all service APIs in parallel
        const [stripeCost, gcpCost, supabaseCost, mapboxCost, resendCost, vonageCost] =
            await Promise.all([
                syncStripeCosts(month),
                syncGoogleCloudCosts(month),
                syncSupabaseCosts(month),
                syncMapboxCosts(month),
                syncResendCosts(month),
                syncVonageCosts(month),
            ]);

        const records: ServiceCostRecord[] = [
            stripeCost,
            gcpCost,
            supabaseCost,
            mapboxCost,
            resendCost,
            vonageCost,
        ].filter((record): record is ServiceCostRecord => record !== null);

        if (records.length === 0) {
            console.warn(`No service costs fetched for ${month}. Check API credentials.`);
            return {
                success: false,
                message: "No service costs fetched. Verify API credentials.",
                synced: 0,
            };
        }

        // Insert or update records in database
        const { error } = await supabaseAdmin.from("ServiceCost").upsert(
            records.map((record) => ({
                ...record,
                lastSyncedAt: new Date().toISOString(),
            })),
            {
                onConflict: "service,month",
            }
        );

        if (error) {
            console.error("Error inserting service costs:", error);
            return {
                success: false,
                message: `Database error: ${error.message}`,
                synced: 0,
            };
        }

        console.log(`Successfully synced ${records.length} service costs for ${month}`);
        return {
            success: true,
            message: `Synced ${records.length} service costs for ${month}`,
            synced: records.length,
        };
    } catch (error) {
        console.error("Error in syncAllServiceCosts:", error);
        return {
            success: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            synced: 0,
        };
    }
}

/**
 * Sync costs for multiple months
 * Useful for backfilling historical data
 */
export async function syncCostsForMonths(months: string[]) {
    const results = [];
    for (const month of months) {
        const result = await syncAllServiceCosts(month);
        results.push({ month, ...result });
    }
    return results;
}

/**
 * Get usage metrics for a specific service
 */
export async function getServiceUsageMetrics(service: string, month: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from("ServiceUsageMetrics")
            .select("*")
            .eq("service", service)
            .eq("month", month)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows returned
            throw error;
        }

        return data || null;
    } catch (error) {
        console.error(`Error fetching usage metrics for ${service}:`, error);
        return null;
    }
}

/**
 * Check for cost anomalies and create alerts
 */
export async function checkAndCreateAnomalies() {
    try {
        // Fetch all costs from the last 12 months
        const { data: costs, error } = await supabaseAdmin
            .from("ServiceCost")
            .select("*")
            .order("month", { ascending: false })
            .limit(12);

        if (error) throw error;
        if (!costs || costs.length < 2) {
            return { success: true, message: "Not enough data for anomaly detection" };
        }

        const anomalies = [];

        // Group by service
        const byService = new Map<string, any[]>();
        for (const cost of costs) {
            const existing = byService.get(cost.service) || [];
            existing.push(cost);
            byService.set(cost.service, existing);
        }

        // Check each service for anomalies
        for (const [service, serviceCosts] of byService) {
            serviceCosts.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

            if (serviceCosts.length < 2) continue;

            // Calculate average and standard deviation
            const costs_array = serviceCosts.map((c) => c.cost);
            const avg = costs_array.reduce((a, b) => a + b) / costs_array.length;
            const variance =
                costs_array.reduce((sum, cost) => sum + Math.pow(cost - avg, 2), 0) /
                costs_array.length;
            const stdDev = Math.sqrt(variance);

            // Check latest cost against historical pattern
            const latest = serviceCosts[serviceCosts.length - 1];
            const deviation = Math.abs(latest.cost - avg) / (stdDev || 1);

            if (deviation > 2) {
                // More than 2 std devs = anomaly
                const severity = deviation > 3 ? "CRITICAL" : "HIGH";
                const percentDeviation = ((latest.cost - avg) / avg) * 100;

                anomalies.push({
                    service,
                    month: latest.month,
                    actualCost: latest.cost,
                    expectedCost: avg,
                    percentDeviation: parseFloat(percentDeviation.toFixed(2)),
                    severity,
                    description: `Cost ${percentDeviation > 0 ? "increased" : "decreased"} by ${Math.abs(percentDeviation).toFixed(1)}% from historical average`,
                });
            }
        }

        if (anomalies.length === 0) {
            return { success: true, message: "No anomalies detected" };
        }

        // Insert anomalies
        const { error: insertError } = await supabaseAdmin.from("CostAnomaly").insert(anomalies);

        if (insertError) throw insertError;

        return {
            success: true,
            message: `Detected ${anomalies.length} cost anomalies`,
            anomalies,
        };
    } catch (error) {
        console.error("Error checking anomalies:", error);
        return {
            success: false,
            message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
