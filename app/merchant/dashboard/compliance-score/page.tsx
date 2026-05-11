import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { RestaurantComplianceMetrics } from "@/lib/complianceAnalytics";
import MerchantPortalRecovery from "../MerchantPortalRecovery";
import { AlertTriangle, CalendarDays, CheckCircle2, MapPin, Minus, TrendingDown, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

function gradeToColor(grade: string): { bg: string; text: string; border: string } {
    switch (grade?.toUpperCase()) {
        case "A":
            return { bg: "#0d1a10", border: "#1a4a2a", text: "#2ee5a0" };
        case "B":
            return { bg: "#1c1508", border: "#57400f", text: "#f97316" };
        case "C":
            return { bg: "#1a1208", border: "#5c3a0f", text: "#fb923c" };
        default:
            return { bg: "#1a0d10", border: "#4a1a1a", text: "#f87171" };
    }
}

export default async function ComplianceScorePage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant&next=/merchant/dashboard/compliance-score");
    }

    // Fetch ONLY this merchant's restaurant
    let restaurant: RestaurantComplianceMetrics | null = null;

    if (isPreview) {
        // Mock data for preview - single restaurant
        restaurant = {
            restaurantId: "1",
            name: "Dhan's Kitchen",
            city: "Fayetteville",
            state: "NC",
            complianceScore: 94,
            healthGrade: "A",
            complianceStatus: "PASS",
            lastInspectionAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            trend: "improving",
            violationCount: 0,
            criticalViolations: 0,
        };
    } else {
        const { data } = await supabaseAdmin
            .from("Restaurant")
            .select("id, name, city, state, complianceScore, healthGrade, complianceStatus, lastInspectionAt")
            .eq("ownerId", activeUserId!)
            .maybeSingle();

        if (data) {
            restaurant = {
                restaurantId: data.id,
                name: data.name,
                city: data.city,
                state: data.state,
                complianceScore: data.complianceScore || 0,
                healthGrade: data.healthGrade || "—",
                complianceStatus: data.complianceStatus || "—",
                lastInspectionAt: data.lastInspectionAt || "",
                trend: "stable" as const,
                violationCount: 0,
                criticalViolations: 0,
            };
        } else {
            return <MerchantPortalRecovery />;
        }
    }

    if (!restaurant) {
        return <MerchantPortalRecovery />;
    }

    const colors = gradeToColor(restaurant.healthGrade);

    return (
        <div className="md-body min-h-screen animate-fade-in-up">
            <div className="md-page-hd">
                <div>
                    <div className="md-page-title">{restaurant.name}</div>
                    <div className="md-page-sub">Health & Compliance Score</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-1">
                    <Link href="/merchant/dashboard/compliance" className="btn btn-ghost justify-center">
                        Detailed Inspections
                    </Link>
                </div>
            </div>

            {/* Main Score Display */}
            <div className="md-stat-block" style={{ borderColor: colors.border, background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(12,18,28,0.8) 100%)` }}>
                <div className="md-stat-name">Compliance Score</div>
                <div style={{ fontSize: "64px", fontWeight: "bold", color: colors.text, marginTop: "16px", marginBottom: "12px" }}>
                    {restaurant.complianceScore}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div
                        style={{
                            display: "inline-block",
                            padding: "6px 16px",
                            borderRadius: "8px",
                            background: colors.bg,
                            border: `2px solid ${colors.border}`,
                            color: colors.text,
                            fontWeight: "bold",
                            fontSize: "18px",
                        }}
                    >
                        {restaurant.healthGrade}
                    </div>
                    <div style={{ color: "var(--t2)", fontSize: "14px" }}>
                        {restaurant.complianceStatus === "PASS"
                            ? <><CheckCircle2 size={14} aria-hidden="true" style={{ display: "inline", marginRight: 5 }} />Compliant</>
                            : restaurant.complianceStatus === "IN_REVIEW"
                            ? <><Minus size={14} aria-hidden="true" style={{ display: "inline", marginRight: 5 }} />In Review</>
                            : <><AlertTriangle size={14} aria-hidden="true" style={{ display: "inline", marginRight: 5 }} />Flagged</>}
                    </div>
                </div>
                <div style={{ color: "var(--t2)", fontSize: "13px" }}>
                    <div><MapPin size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />{restaurant.city}, {restaurant.state}</div>
                    <div><CalendarDays size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />Last inspection: {restaurant.lastInspectionAt ? new Date(restaurant.lastInspectionAt).toLocaleDateString() : "No data"}</div>
                    <div>
                        {restaurant.trend === "improving" ? <TrendingUp size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} /> : restaurant.trend === "declining" ? <TrendingDown size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} /> : <Minus size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />}
                        Trend: {restaurant.trend === "improving" ? "Improving" : restaurant.trend === "declining" ? "Declining" : "Stable"}
                    </div>
                </div>
            </div>

            {/* What This Means */}
            <div className="md-stat-block">
                <div className="md-stat-name mb-4">What Your Score Means</div>
                <div className="grid gap-3">
                    <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--t1)", marginBottom: "4px" }}>Grade: {restaurant.healthGrade}</div>
                        <div style={{ fontSize: "12px", color: "var(--t2)" }}>
                            {restaurant.healthGrade === "A"
                                ? "Excellent compliance — all systems passing. Maintain current standards."
                                : restaurant.healthGrade === "B"
                                ? "Good compliance with minor observations. Address noted items promptly."
                                : restaurant.healthGrade === "C"
                                ? "Compliance concerns present. Immediate corrective action recommended."
                                : "Serious compliance violations. Critical action required immediately."}
                        </div>
                    </div>

                    <div style={{ padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--t1)", marginBottom: "4px" }}>Status: {restaurant.complianceStatus}</div>
                        <div style={{ fontSize: "12px", color: "var(--t2)" }}>
                            {restaurant.complianceStatus === "PASS"
                                ? "Your restaurant is fully compliant with health & safety standards."
                                : restaurant.complianceStatus === "IN_REVIEW"
                                ? "Your restaurant has observations under review. Check detailed inspections for specifics."
                                : "Your restaurant has flagged violations. Immediate remediation required."}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Items */}
            {restaurant.complianceStatus !== "PASS" && (
                <div className="md-stat-block" style={{ borderColor: "#4a1a1a", background: "rgba(248, 113, 113, 0.08)" }}>
                    <div className="md-stat-name mb-4">Action Required</div>
                    <div style={{ fontSize: "13px", color: "var(--t1)", lineHeight: "1.6" }}>
                        <p style={{ marginBottom: "12px" }}>
                            Your restaurant has compliance observations that need to be addressed. Visit the <strong>Detailed Inspections</strong> page to:
                        </p>
                        <ul style={{ marginLeft: "16px", color: "var(--t2)" }}>
                            <li>View specific violations found in recent inspections</li>
                            <li>Track corrective actions and their due dates</li>
                            <li>See inspection history and trends</li>
                        </ul>
                        <p style={{ marginTop: "12px", fontSize: "12px", color: "#fb923c", fontWeight: "bold" }}>
                            Take action promptly to improve your score and maintain customer trust.
                        </p>
                    </div>
                </div>
            )}

            {/* Contact Support */}
            <div className="md-stat-block">
                <div className="md-stat-name mb-4">Need Help?</div>
                <div style={{ fontSize: "13px", color: "var(--t2)", lineHeight: "1.6", marginBottom: "12px" }}>
                    Questions about your compliance score or how to improve? Contact our support team for guidance on:
                </div>
                <div className="grid gap-2">
                    <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                        <span>Email support</span>
                        <span style={{ color: "var(--gold)" }}>support@trueserve.delivery</span>
                    </div>
                    <div className="btn btn-ghost justify-between" style={{ cursor: "default" }}>
                        <span>Phone support</span>
                        <span style={{ color: "var(--gold)" }}>1-800-TRUESERVE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
