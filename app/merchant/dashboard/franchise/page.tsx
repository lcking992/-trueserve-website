import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateFranchiseMetrics, generateFranchiseInsights } from "@/lib/franchiseAnalytics";
import type { RestaurantComplianceMetrics } from "@/lib/complianceAnalytics";
import { AlertTriangle, BarChart3, Building2, CheckCircle2, Flag, MapPin, Minus, TrendingDown, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function gradeToColor(grade: string): { bg: string; text: string; border: string } {
    switch (grade?.toUpperCase()) {
        case "A":
            return { bg: "#0d1a10", border: "#1a4a2a", text: "#2ee5a0" };
        case "B":
            return { bg: "#1c1508", border: "#57400f", text: "#f97316" };
        case "C":
            return { bg: "#1a1208", border: "#5c3a0f", text: "#fb923c" };
        case "D":
        default:
            return { bg: "#1a0d10", border: "#4a1a1a", text: "#f87171" };
    }
}

function getTrendLabel(trend?: string): string {
    switch (trend) {
        case "improving":
            return "Improving";
        case "declining":
            return "Declining";
        default:
            return "Stable";
    }
}

function getStatusLabel(status?: string): string {
    switch (status) {
        case "PASS":
            return "Passing";
        case "IN_REVIEW":
            return "In review";
        case "FLAGGED":
            return "Flagged";
        default:
            return "—";
    }
}

export default async function FranchiseDashboard() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant&next=/merchant/dashboard/franchise");
    }

    let restaurants: RestaurantComplianceMetrics[] = [];

    if (isPreview) {
        // Mock data for preview - multiple restaurants
        restaurants = [
            {
                restaurantId: "1",
                name: "Dhan's Kitchen - Downtown",
                city: "Fayetteville",
                state: "NC",
                complianceScore: 94,
                healthGrade: "A",
                complianceStatus: "PASS",
                lastInspectionAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "improving",
                violationCount: 0,
                criticalViolations: 0,
            },
            {
                restaurantId: "2",
                name: "Dhan's Kitchen - Midtown",
                city: "Fayetteville",
                state: "NC",
                complianceScore: 87,
                healthGrade: "B",
                complianceStatus: "PASS",
                lastInspectionAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "stable",
                violationCount: 2,
                criticalViolations: 0,
            },
            {
                restaurantId: "3",
                name: "Dhan's Kitchen - West",
                city: "Springdale",
                state: "AR",
                complianceScore: 78,
                healthGrade: "C",
                complianceStatus: "IN_REVIEW",
                lastInspectionAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                trend: "declining",
                violationCount: 5,
                criticalViolations: 1,
            },
        ];
    } else {
        const { data } = await supabaseAdmin
            .from("Restaurant")
            .select(
                "id, name, city, state, complianceScore, healthGrade, complianceStatus, lastInspectionAt"
            )
            .eq("ownerId", activeUserId!);

        if (data && data.length > 0) {
            restaurants = data.map((r: any) => ({
                restaurantId: r.id,
                name: r.name,
                city: r.city,
                state: r.state,
                complianceScore: r.complianceScore || 0,
                healthGrade: r.healthGrade || "—",
                complianceStatus: r.complianceStatus || "—",
                lastInspectionAt: r.lastInspectionAt || "",
                trend: "stable" as const,
                violationCount: 0,
                criticalViolations: 0,
            }));
        }
    }

    // Franchise tools are only relevant when a merchant owns multiple locations.
    if (restaurants.length === 1 && !isPreview) {
        redirect("/merchant/dashboard");
    }

    const franchiseMetrics = calculateFranchiseMetrics(restaurants);
    const insights = generateFranchiseInsights(franchiseMetrics);

    return (
        <div className="animate-fade-in-up">
            <style>{`.mc-table-row:hover { background: rgba(249,115,22,0.03); }`}</style>
            <p style={{ fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, marginTop: -4 }}>
                Multi-Location Overview
            </p>

            {/* Franchise-Level Metrics — mch-stat-card style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                {[
                    { label: 'Locations',     Icon: Building2,    value: String(franchiseMetrics.locationCount), color: '#f97316' },
                    { label: 'Avg Score',     Icon: BarChart3,    value: `${franchiseMetrics.averageScore}/100`, color: '#3dd68c' },
                    { label: 'Pass Rate',     Icon: CheckCircle2, value: `${franchiseMetrics.passRate}%`, color: franchiseMetrics.passRate >= 80 ? '#3dd68c' : '#e24b4a' },
                    { label: 'Flagged',       Icon: Flag,         value: String(franchiseMetrics.flaggedCount), color: franchiseMetrics.flaggedCount > 0 ? '#e24b4a' : '#3dd68c' },
                ].map(({ label, Icon, value, color }) => (
                    <div key={label} style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14 }}>
                        <div style={{ fontSize: 11, color: '#777', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 18, height: 18, borderRadius: 4, background: '#0f1210', border: '1px solid #1e2420', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}><Icon size={12} aria-hidden="true" /></span>
                            {label}
                        </div>
                        <div style={{ fontSize: 27, fontWeight: 700, color, letterSpacing: '-0.5px' }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Insights */}
            <div style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Key Insights</div>
                <div style={{ display: 'grid', gap: 8 }}>
                    {insights.map((insight, idx) => (
                        <div key={idx} style={{ padding: "11px 12px", borderRadius: "6px", background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.1)" }}>
                            <div style={{ fontSize: "12px", color: "#888", lineHeight: "1.6" }}>
                                {insight}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Locations Table */}
            <div style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>All Locations</div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #1e2420" }}>
                                <th style={{ textAlign: "left", padding: "10px 12px", color: "#555", fontWeight: "700", textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Location</th>
                                <th style={{ textAlign: "center", padding: "10px 12px", color: "#555", fontWeight: "700", textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Score</th>
                                <th style={{ textAlign: "center", padding: "10px 12px", color: "#555", fontWeight: "700", textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Grade</th>
                                <th style={{ textAlign: "center", padding: "10px 12px", color: "#555", fontWeight: "700", textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Status</th>
                                <th style={{ textAlign: "center", padding: "10px 12px", color: "#555", fontWeight: "700", textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Trend</th>
                                <th style={{ textAlign: "center", padding: "10px 12px", color: "#555", fontWeight: "700", textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Last Inspect</th>
                                <th style={{ textAlign: "center", padding: "10px 12px", color: "#555", fontWeight: "700", textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {restaurants.map((location) => {
                                const colors = gradeToColor(location.healthGrade);
                                const lastInspectionDate = location.lastInspectionAt
                                    ? new Date(location.lastInspectionAt).toLocaleDateString()
                                    : "No data";

                                return (
                                    <tr
                                        key={location.restaurantId}
                                        className="mc-table-row"
                                        style={{ borderBottom: "1px solid #1e2420" }}
                                    >
                                        <td style={{ padding: "10px 12px", fontWeight: "600", color: "#ccc" }}>
                                            <div>{location.name}</div>
                                            <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>
                                                <MapPin size={11} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} />
                                                {location.city}, {location.state}
                                            </div>
                                        </td>
                                        <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: "700", color: "#f97316" }}>
                                            {location.complianceScore}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center" }}>
                                            <div
                                                style={{
                                                    display: "inline-block",
                                                    padding: "6px 12px",
                                                    borderRadius: "6px",
                                                    background: colors.bg,
                                                    border: `1px solid ${colors.border}`,
                                                    color: colors.text,
                                                    fontWeight: "bold",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                {location.healthGrade}
                                            </div>
                                        </td>
                                        <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "11px", color: "#888" }}>
                                            {location.complianceStatus === "PASS" ? <CheckCircle2 size={12} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} /> : location.complianceStatus === "FLAGGED" ? <AlertTriangle size={12} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} /> : <Minus size={12} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} />}
                                            {getStatusLabel(location.complianceStatus)}
                                        </td>
                                        <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "11px", color: "#888" }}>
                                            {location.trend === "improving" ? <TrendingUp size={12} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} /> : location.trend === "declining" ? <TrendingDown size={12} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} /> : <Minus size={12} aria-hidden="true" style={{ display: "inline", marginRight: 4 }} />}
                                            {getTrendLabel(location.trend)}
                                        </td>
                                        <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "11px", color: "#555" }}>
                                            {lastInspectionDate}
                                        </td>
                                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                            <Link
                                                href={`/merchant/dashboard/compliance-score?restaurantId=${location.restaurantId}`}
                                                style={{ textDecoration: 'none', background: 'transparent', border: '1px solid #1e2420', borderRadius: 5, padding: '4px 10px', fontSize: "10px", fontWeight: 700, color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grade Distribution + Performance Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Grade Distribution</div>
                    <div style={{ display: "grid", gap: "8px" }}>
                        {[
                            { label: 'Grade A (90–100)', color: '#3dd68c', count: franchiseMetrics.aggregateGradeDistribution.a },
                            { label: 'Grade B (80–89)', color: '#f97316', count: franchiseMetrics.aggregateGradeDistribution.b },
                            { label: 'Grade C (70–79)', color: '#fb923c', count: franchiseMetrics.aggregateGradeDistribution.c },
                            { label: 'Grade D (<70)',   color: '#e24b4a', count: franchiseMetrics.aggregateGradeDistribution.d },
                        ].map(({ label, color, count }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
                                </div>
                                <span style={{ fontWeight: 700, color: '#ccc', fontSize: 13 }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Performance Summary</div>
                    <div style={{ display: "grid", gap: "10px" }}>
                        {franchiseMetrics.highestScoringLocation && (
                            <div style={{ padding: "10px 12px", borderRadius: "6px", background: "rgba(61,214,140,0.06)", border: "1px solid rgba(61,214,140,0.15)" }}>
                                <div style={{ fontSize: "10px", color: "#444", marginBottom: "4px", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Performer</div>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "#3dd68c" }}>
                                    {franchiseMetrics.highestScoringLocation.name}
                                </div>
                                <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>
                                    Score: {franchiseMetrics.highestScoringLocation.complianceScore}
                                </div>
                            </div>
                        )}
                        {franchiseMetrics.lowestScoringLocation && (
                            <div style={{ padding: "10px 12px", borderRadius: "6px", background: "rgba(226,75,74,0.06)", border: "1px solid rgba(226,75,74,0.15)" }}>
                                <div style={{ fontSize: "10px", color: "#444", marginBottom: "4px", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Needs Attention</div>
                                <div style={{ fontSize: "13px", fontWeight: "700", color: "#e24b4a" }}>
                                    {franchiseMetrics.lowestScoringLocation.name}
                                </div>
                                <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>
                                    Score: {franchiseMetrics.lowestScoringLocation.complianceScore}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div style={{ background: '#141a18', border: '1px solid #1e2420', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Need Help?</div>
                <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
                    Questions about your franchise compliance or how to improve across all locations?
                </p>
                <div style={{ display: 'grid', gap: 8 }}>
                    {[
                        { icon: '', label: 'Email support', value: 'support@trueserve.delivery' },
                        { icon: '', label: 'Phone support', value: '1-800-TRUESERVE' },
                    ].map(({ icon, label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f1210', border: '1px solid #1e2420', borderRadius: 6, padding: '8px 12px' }}>
                            <span style={{ fontSize: 12, color: '#888' }}>{icon} {label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
