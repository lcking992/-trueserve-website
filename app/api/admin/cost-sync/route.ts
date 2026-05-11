export const dynamic = 'force-dynamic';

import { syncAllServiceCosts, checkAndCreateAnomalies } from "@/app/admin/cost-management/actions";
import { getAuthSession } from "@/app/auth/actions";

/**
 * Manual cost sync endpoint
 * Can be called via:
 * - Admin dashboard button
 * - Cron jobs
 * - Manual API requests
 *
 * Requires admin authentication
 */
export async function POST(request: Request) {
    try {
        // Verify authentication
        const session = await getAuthSession();
        if (!session?.userId) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get query parameters
        const url = new URL(request.url);
        const month = url.searchParams.get("month");
        const checkAnomalies = url.searchParams.get("checkAnomalies") === "true";

        console.log(`[Cost Sync API] Admin ${session.userId} initiated sync. Month: ${month || "current"}, Check anomalies: ${checkAnomalies}`);

        // Sync costs
        const syncResult = await syncAllServiceCosts(month || undefined);

        // Optionally check for anomalies
        let anomalyResult = null;
        if (checkAnomalies && syncResult.success) {
            anomalyResult = await checkAndCreateAnomalies();
        }

        return Response.json({
            success: true,
            syncResult,
            anomalyResult,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Cost Sync API] Error:", error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

/**
 * Public endpoint for Vercel Cron Jobs
 * Called automatically by Vercel at scheduled times
 * Secured by vercel.json CRON_SECRET
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret (set in Vercel environment)
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("[Cost Sync Cron] Automated cost sync started");

        // Sync last month's costs
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const monthStr = lastMonth.toISOString().slice(0, 7);

        const syncResult = await syncAllServiceCosts(monthStr);

        // Check for anomalies
        const anomalyResult = await checkAndCreateAnomalies();

        return Response.json({
            success: true,
            message: "Automated cost sync completed",
            syncResult,
            anomalyResult,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Cost Sync Cron] Error:", error);
        return Response.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
