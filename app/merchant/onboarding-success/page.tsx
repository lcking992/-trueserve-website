export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { getStripe } from "@/lib/stripe";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, CreditCard, ExternalLink } from "lucide-react";

export default async function OnboardingSuccessPage() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) redirect("/login?role=merchant");

    let detailsSubmitted = false;
    let chargesEnabled = false;
    let payoutsEnabled = false;
    let restaurantName = "Your Restaurant";

    if (isPreview && !activeUserId) {
        // Preview mode: show the fully-active success state
        restaurantName = "Pilot Kitchen";
        detailsSubmitted = true;
        chargesEnabled = true;
        payoutsEnabled = true;
    } else {
        const supabase = await createClient();
        const { data: restaurant } = await supabase
            .from("Restaurant")
            .select("id, name, stripeAccountId, stripeOnboardingComplete")
            .eq("ownerId", activeUserId!)
            .maybeSingle();

        if (!restaurant) redirect("/merchant/signup");
        if (!restaurant.stripeAccountId) redirect("/merchant/dashboard");

        restaurantName = restaurant.name;
        detailsSubmitted = restaurant.stripeOnboardingComplete ?? false;

        try {
            const account = await getStripe().accounts.retrieve(restaurant.stripeAccountId);
            detailsSubmitted = account.details_submitted ?? false;
            chargesEnabled = account.charges_enabled ?? false;
            payoutsEnabled = account.payouts_enabled ?? false;

            // Sync to DB if Stripe says it's done but webhook hasn't fired yet
            if (detailsSubmitted && !restaurant.stripeOnboardingComplete) {
                await supabase
                    .from("Restaurant")
                    .update({ stripeOnboardingComplete: true })
                    .eq("id", restaurant.id);
            }
        } catch (err) {
            console.error("Stripe account retrieval error:", err);
        }
    }

    const isFullyActive = detailsSubmitted && chargesEnabled && payoutsEnabled;
    const isPending = detailsSubmitted && !isFullyActive;
    const statusTone = isFullyActive ? "#3dd68c" : isPending ? "#f97316" : "#f87171";
    const statusBg = isFullyActive ? "rgba(61,214,140,.1)" : isPending ? "rgba(249,115,22,.1)" : "rgba(248,113,113,.1)";
    const statusBorder = isFullyActive ? "rgba(61,214,140,.28)" : isPending ? "rgba(249,115,22,.28)" : "rgba(248,113,113,.28)";

    return (
        <div className="md-body min-h-screen" style={{ padding: "24px" }}>
            <div style={{ width: "100%", maxWidth: "760px", margin: "40px auto" }}>
                <section
                    style={{
                        background: "linear-gradient(180deg, #111713 0%, #0d110f 100%)",
                        border: "1px solid #202a24",
                        borderRadius: 18,
                        padding: "28px",
                        boxShadow: "0 24px 80px rgba(0,0,0,.28)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
                        <div
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: 14,
                                background: statusBg,
                                border: `1px solid ${statusBorder}`,
                                color: statusTone,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            {isFullyActive ? <CheckCircle2 size={25} /> : isPending ? <Clock3 size={25} /> : <AlertCircle size={25} />}
                        </div>

                        <div style={{ minWidth: 0 }}>
                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                border: `1px solid ${statusBorder}`,
                                background: statusBg,
                                color: statusTone,
                                borderRadius: 999,
                                padding: "6px 10px",
                                fontSize: 10,
                                fontWeight: 900,
                                letterSpacing: ".12em",
                                textTransform: "uppercase",
                                marginBottom: 12,
                            }}>
                                <CreditCard size={13} />
                                Stripe Connect
                            </div>
                            <h1 style={{
                                margin: 0,
                                color: "#fff",
                                fontSize: 34,
                                lineHeight: 1.05,
                                fontWeight: 900,
                                letterSpacing: "-0.02em",
                            }}>
                                {isFullyActive ? "Payouts are connected" : isPending ? "Stripe is reviewing the account" : "Stripe setup needs attention"}
                            </h1>
                            <p style={{ color: "#a5aea8", fontSize: 14, lineHeight: 1.65, margin: "12px 0 0", maxWidth: 620 }}>
                        {isFullyActive
                            ? `${restaurantName} is now set up to receive payouts. Orders placed through your storefront will settle to your bank on Stripe's standard schedule.`
                            : isPending
                            ? "Your account details were submitted. Stripe is reviewing your information — this usually takes a few minutes. Your dashboard will update automatically."
                            : "It looks like your Stripe onboarding wasn't completed. Return to the dashboard and try connecting again."}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
                        {[
                            { label: "Details Submitted", active: detailsSubmitted },
                            { label: "Charges Enabled", active: chargesEnabled },
                            { label: "Payouts Enabled", active: payoutsEnabled },
                        ].map(({ label, active }) => (
                            <div
                                key={label}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 14,
                                    padding: "14px 15px",
                                    background: "rgba(255,255,255,.025)",
                                    borderRadius: 12,
                                    border: "1px solid #202a24",
                                }}
                            >
                                <span style={{ fontSize: 13, fontWeight: 800, color: "#eef2ef" }}>{label}</span>
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 7,
                                        fontSize: 10,
                                        fontWeight: 900,
                                        textTransform: "uppercase",
                                        letterSpacing: ".11em",
                                        color: active ? "#3dd68c" : "#f97316",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {active ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                                    {active ? "Complete" : "Needs review"}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        <Link
                            href="/merchant/dashboard"
                            style={{
                                minHeight: 42,
                                borderRadius: 10,
                                border: "1px solid #f97316",
                                background: "#f97316",
                                color: "#071009",
                                padding: "0 16px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                textDecoration: "none",
                                fontSize: 11,
                                fontWeight: 900,
                                letterSpacing: ".11em",
                                textTransform: "uppercase",
                            }}
                        >
                            Go to dashboard
                            <ArrowRight size={15} />
                        </Link>
                        <Link
                            href="/merchant/dashboard/storefront"
                            style={{
                                minHeight: 42,
                                borderRadius: 10,
                                border: "1px solid #28342d",
                                background: "rgba(255,255,255,.04)",
                                color: "#d7dfda",
                                padding: "0 16px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                textDecoration: "none",
                                fontSize: 11,
                                fontWeight: 900,
                                letterSpacing: ".11em",
                                textTransform: "uppercase",
                            }}
                        >
                            View storefront
                            <ExternalLink size={15} />
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
