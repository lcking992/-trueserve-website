import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import CostDashboard from "@/components/admin/CostDashboard";
import CostSyncManager from "@/components/admin/CostSyncManager";
import { analyzeCosts } from "@/lib/costAnalytics";
import type { MonthlyCost } from "@/lib/costAnalytics";
import AdminPortalWrapper from "../AdminPortalWrapper";

export const dynamic = "force-dynamic";

async function getServiceCosts() {
    try {
        const { data, error } = await supabaseAdmin
            .from("ServiceCost")
            .select("*")
            .order("month", { ascending: false })
            .limit(24);
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching service costs:", e);
        return [];
    }
}

async function getBudgetAlerts() {
    try {
        const { data, error } = await supabaseAdmin.from("BudgetAlert").select("*");
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Error fetching budget alerts:", e);
        return [];
    }
}

export default async function CostManagementPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'cost-management'));
    if (!isAuthorized) redirect("/admin/login");

    const realCosts = await getServiceCosts();
    const budgets = await getBudgetAlerts();

    // Build monthly costs from real data only — no mock fallback
    let monthlyCosts: MonthlyCost[] = [];
    if (realCosts.length > 0) {
        const costMap = new Map<string, MonthlyCost>();
        realCosts.forEach((cost: any) => {
            const month = cost.month;
            if (!costMap.has(month)) {
                costMap.set(month, {
                    month,
                    totalCost: 0,
                    byService: { stripe: 0, supabase: 0, "google-cloud": 0, mapbox: 0, resend: 0, vonage: 0 },
                });
            }
            const entry = costMap.get(month)!;
            entry.byService[cost.service as keyof typeof entry.byService] = cost.cost;
            entry.totalCost += cost.cost;
        });
        monthlyCosts = Array.from(costMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    }

    const analysis = analyzeCosts(monthlyCosts, budgets as any);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const budgetWarnings = monthlyCosts.length > 0 && budgets.length > 0
        ? Object.entries(monthlyCosts.find((m) => m.month === currentMonth)?.byService || {})
            .map(([service, cost]) => {
                const budget = budgets.find((b: any) => b.service === service);
                if (budget && cost >= (budget.monthlyLimit * budget.alert_threshold) / 100) {
                    return { service, spent: cost, limit: budget.monthlyLimit };
                }
                return null;
            })
            .filter(Boolean) as any[]
        : [];

    return (
        <AdminPortalWrapper role={role}>
            <div className="adm-page-header">
                <h1>Cost Management</h1>
                <p>Track real spending across service APIs and surface budget alerts when costs move outside the expected range.</p>
            </div>
            <div className="adm-page-body">
                <div className="space-y-4">
                    <div className="adm-card">
                        <div className="adm-card-title">What this page does</div>
                        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                            <div className="space-y-3 text-sm leading-6 text-white/60">
                                <p>
                                    This page pulls live service spend into Supabase, compares it against budget thresholds, and
                                    lets the admin team run anomaly checks.
                                </p>
                                <p>
                                    Right now Stripe is the active source. The other providers stay ready in the UI until their
                                    credentials are configured in Vercel.
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {[
                                    { name: "Stripe", link: "https://dashboard.stripe.com", active: true },
                                    { name: "Supabase", link: "https://supabase.com/dashboard", active: false },
                                    { name: "Google Cloud", link: "https://console.cloud.google.com", active: false },
                                    { name: "Resend", link: "https://resend.com/dashboard", active: false },
                                    { name: "Vonage", link: "https://dashboard.nexmo.com", active: false },
                                ].map((s) => (
                                    <a
                                        key={s.name}
                                        href={s.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                                            s.active
                                                ? "border-[#f97316]/30 bg-[#f97316] text-black hover:bg-[#ff8a2a]"
                                                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                                        }`}
                                    >
                                        {s.name}
                                        <span className="ml-1">↗</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <CostSyncManager />

                    {monthlyCosts.length === 0 ? (
                        <div className="adm-card text-center">
                            <div className="mb-3 text-3xl">📊</div>
                            <div className="mb-2 text-sm font-semibold text-white">No cost data yet</div>
                            <div className="mx-auto mb-5 max-w-xl text-sm leading-6 text-white/55">
                                Use the sync manager above to import spending data from your service providers. Once Stripe data
                                exists, the dashboard below will render cost trends, forecasts, and budget warnings.
                            </div>
                        </div>
                    ) : (
                        <CostDashboard
                            analysis={analysis}
                            currentMonth={currentMonth}
                            budgetWarnings={budgetWarnings}
                        />
                    )}
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
