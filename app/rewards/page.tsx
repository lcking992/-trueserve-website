export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { joinRewardsTier } from "./actions";
import { Crown, Gift, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";

type RewardsSnapshot = {
    plan: string;
    hasPaymentMethod: boolean;
    points: number;
    ordersCount: number;
    lifetimeSpend: number;
    multiplierText: string;
};

const TIER_POINT_TARGET = {
    Plus: 1200,
    Premium: 3000
} as const;

function getMultiplier(plan: string): number {
    if (plan === "Premium") return 2;
    if (plan === "Plus") return 1.5;
    return 1;
}

async function getSnapshot(userId?: string): Promise<RewardsSnapshot | null> {
    if (!userId) return null;

    const { data: user } = await supabaseAdmin
        .from("User")
        .select("plan, stripeCustomerId")
        .eq("id", userId)
        .maybeSingle();

    if (!user) return null;

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select("total, status")
        .eq("userId", userId);

    const completed = (orders || []).filter((o) => o.status !== "CANCELLED");
    const lifetimeSpend = completed.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const multiplier = getMultiplier(user.plan || "Basic");
    const points = Math.floor(lifetimeSpend * multiplier);

    return {
        plan: user.plan || "Basic",
        hasPaymentMethod: Boolean(user.stripeCustomerId),
        points,
        ordersCount: completed.length,
        lifetimeSpend,
        multiplierText: `${multiplier}x`
    };
}

function getJourney(points: number, plan: string) {
    if (plan === "Premium") {
        return {
            title: "Top Tier Unlocked",
            detail: "You already have the highest multiplier and fastest support lane.",
            remaining: 0,
            progress: 100
        };
    }

    if (plan === "Plus") {
        const target = TIER_POINT_TARGET.Premium;
        const remaining = Math.max(target - points, 0);
        return {
            title: "Next Stop: Premium",
            detail: `${remaining.toLocaleString()} more points to unlock 2x rewards and concierge support.`,
            remaining,
            progress: Math.min(100, Math.round((points / target) * 100))
        };
    }

    const target = TIER_POINT_TARGET.Plus;
    const remaining = Math.max(target - points, 0);
    return {
        title: "Next Stop: Plus",
        detail: `${remaining.toLocaleString()} more points to unlock priority dispatch and 1.5x rewards.`,
        remaining,
        progress: Math.min(100, Math.round((points / target) * 100))
    };
}

function MessageBanner({ update, tier }: { update?: string; tier?: string }) {
    if (!update) return null;

    if (update === "success") {
        return (
            <div className="food-panel mb-6 border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
                Rewards plan updated successfully to <strong>{tier || "your selected tier"}</strong>.
            </div>
        );
    }
    if (update === "needs_wallet") {
        return (
            <div className="food-panel mb-6 border border-[#f97316]/35 bg-[#f97316]/10 text-[#f4d7a3]">
                Add a saved card in <Link href="/user/settings#wallet" className="underline font-bold">Account Settings</Link> before joining a paid rewards tier.
            </div>
        );
    }
    return (
        <div className="food-panel mb-6 border border-red-500/30 bg-red-500/10 text-red-200">
            We couldn’t update your rewards tier. Please try again.
        </div>
    );
}

function TierCard({
    tier,
    subtitle,
    price,
    currentPlan,
    canSubmit,
    ctaHref,
    ctaLabel,
    features,
    badge,
    icon
}: {
    tier: "Basic" | "Plus" | "Premium";
    subtitle: string;
    price: string;
    currentPlan: string;
    canSubmit: boolean;
    ctaHref?: string;
    ctaLabel?: string;
    features: string[];
    badge?: string;
    icon: ReactNode;
}) {
    const isCurrent = currentPlan === tier;
    return (
        <article className={`food-card relative overflow-hidden ${isCurrent ? "border border-[#f97316]/50" : ""}`}>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_45%)]" />
            <div className="relative z-10">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="rounded-xl border border-[#f97316]/35 bg-[#f97316]/10 p-2 text-[#f97316]">
                        {icon}
                    </div>
                    {badge && (
                        <span className="rounded-full border border-[#f97316]/40 bg-[#f97316]/16 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#f6d8a1]">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="food-kicker mb-2">{subtitle}</p>
                <h3 className="food-heading !text-[34px]">{tier}</h3>
                <p className="text-xl font-bold text-[#f97316] mt-2">{price}</p>
            </div>

            <div className="mt-4 grid gap-2 relative z-10">
                {features.map((feature) => (
                    <div key={feature} className="text-sm text-white/78 flex items-start gap-2">
                        <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>
            <div className="mt-6 relative z-10">
                {isCurrent ? (
                    <button
                        type="button"
                        disabled
                        className="w-full btn btn-ghost opacity-70 cursor-not-allowed"
                    >
                        Current Plan
                    </button>
                ) : ctaHref ? (
                    <Link href={ctaHref} className="place-btn w-full text-center block">
                        {ctaLabel || `Join ${tier}`}
                    </Link>
                ) : (
                    <form action={joinRewardsTier}>
                        <input type="hidden" name="tier" value={tier} />
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full place-btn"
                        >
                            {ctaLabel || `Join ${tier}`}
                        </button>
                    </form>
                )}
            </div>
        </article>
    );
}

export default async function RewardsPage({
    searchParams
}: {
    searchParams?: Promise<{ update?: string; tier?: string }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const { isAuth, userId } = await getAuthSession();
    const snapshot = await getSnapshot(userId);
    const currentPlan = snapshot?.plan || "Basic";
    const isSignedIn = Boolean(isAuth && userId);
    const canChoosePaid = Boolean(snapshot?.hasPaymentMethod);
    const safePoints = snapshot?.points ?? 0;
    const journey = getJourney(safePoints, currentPlan);

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <div className="mx-auto flex items-center justify-between px-4 sm:px-0" style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}>
                    <Logo size="sm" />
                    <div className="flex gap-2">
                        <Link href="/account" className="btn btn-ghost">Account</Link>
                        <Link href="/restaurants" className="btn btn-gold">Order Food</Link>
                    </div>
                </div>
            </nav>

            <main className="food-app-main">
                <MessageBanner update={resolvedSearchParams?.update} tier={resolvedSearchParams?.tier} />

                <section className="food-panel relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(255,122,45,0.14),transparent_38%)]" />
                    <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="min-w-0">
                            <p className="food-kicker mb-3">Customer Loyalty</p>
                            <h1 className="food-heading">TrueServe Rewards</h1>
                            <p className="food-subtitle mt-3 !max-w-none">
                                Turn every order into perks. Earn points automatically, climb tiers, and unlock faster service plus stronger rewards over time.
                            </p>
                            <div className="food-chip-row rewards-chip-row mt-5">
                                <div className="food-chip"><span className="food-chip-dot" /> Points tracked in real-time</div>
                                <div className="food-chip"><span className="food-chip-dot" /> Tier upgrades in one tap</div>
                                <div className="food-chip"><span className="food-chip-dot" /> Rewards tied to real order activity</div>
                            </div>
                            {!isSignedIn && (
                                <div className="mt-5">
                                    <Link href="/login" className="btn btn-gold rewards-hero-cta">Sign In To Join Rewards</Link>
                                </div>
                            )}
                        </div>

                        <div className="food-card min-w-0 border border-[#f97316]/30">
                            <p className="food-kicker mb-2">Progress</p>
                            <h3 className="food-heading !text-[30px]">{journey.title}</h3>
                            <p className="mt-2 text-sm text-white/75 break-words">{journey.detail}</p>
                            <div className="mt-4 rounded-full bg-white/10 h-2 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#f97316] to-[#ffb64a]"
                                    style={{ width: `${journey.progress}%` }}
                                />
                            </div>
                            <div className="mt-3 flex flex-col gap-1 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
                                <span>{journey.progress}% complete</span>
                                <span>{journey.remaining.toLocaleString()} points to go</span>
                            </div>
                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/65 break-words">
                                Tip: Place larger group orders to accelerate your next tier faster.
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-4 grid grid-cols-1 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="px-5 py-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35 mb-1 flex items-center gap-1.5"><Crown size={11} className="text-[#f97316]" />Tier</p>
                        <p className="text-2xl font-black text-white">{currentPlan}</p>
                    </div>
                    <div className="px-5 py-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35 mb-1 flex items-center gap-1.5"><Sparkles size={11} className="text-[#f97316]" />Points</p>
                        <p className="text-2xl font-black text-white">{snapshot ? snapshot.points.toLocaleString() : "0"}</p>
                    </div>
                    <div className="px-5 py-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35 mb-1 flex items-center gap-1.5"><TrendingUp size={11} className="text-[#f97316]" />Orders</p>
                        <p className="text-2xl font-black text-white">{snapshot ? snapshot.ordersCount : 0}</p>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="food-section-head rewards-section-head">
                        <div>
                            <p className="food-kicker mb-2">Membership</p>
                            <h2 className="food-heading">Choose Your Tier</h2>
                        </div>
                        <Link href="/user/settings#wallet" className="btn btn-ghost">Manage Wallet</Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <TierCard
                            tier="Plus"
                            subtitle="Priority Tier"
                            price="$9.99 / month"
                            currentPlan={currentPlan}
                            canSubmit={isSignedIn && canChoosePaid}
                            ctaHref={!isSignedIn ? "/login" : !canChoosePaid ? "/account#wallet" : undefined}
                            ctaLabel={!isSignedIn ? "Sign In To Join" : !canChoosePaid ? "Add Wallet To Join" : undefined}
                            badge="Best Value"
                            icon={<Star size={17} />}
                            features={[
                                "Priority dispatch during peak times",
                                "Faster support response windows",
                                "1.5x points multiplier on all orders"
                            ]}
                        />
                        <TierCard
                            tier="Basic"
                            subtitle="Starter"
                            price="Free"
                            currentPlan={currentPlan}
                            canSubmit={isSignedIn}
                            ctaHref={!isSignedIn ? "/login" : undefined}
                            ctaLabel={!isSignedIn ? "Sign In To Join" : undefined}
                            icon={<Gift size={17} />}
                            features={[
                                "Standard points earning",
                                "Access to all restaurants",
                                "Core order tracking"
                            ]}
                        />
                        <TierCard
                            tier="Premium"
                            subtitle="Power User"
                            price="$19.99 / month"
                            currentPlan={currentPlan}
                            canSubmit={isSignedIn && canChoosePaid}
                            ctaHref={!isSignedIn ? "/login" : !canChoosePaid ? "/account#wallet" : undefined}
                            ctaLabel={!isSignedIn ? "Sign In To Join" : !canChoosePaid ? "Add Wallet To Join" : undefined}
                            badge="Top Perks"
                            icon={<ShieldCheck size={17} />}
                            features={[
                                "Highest dispatch priority",
                                "Concierge support",
                                "2x points multiplier"
                            ]}
                        />
                    </div>

                    {isSignedIn && !canChoosePaid && (
                        <p className="mt-4 text-sm text-[#f97316]">
                            Add a payment method first to unlock Plus or Premium.
                        </p>
                    )}
                </section>

                {/* HOW IT WORKS */}
                <section className="mt-8 food-panel">
                    <p className="food-kicker mb-1">How It Works</p>
                    <h2 className="food-heading !text-[26px] mb-6">Three steps to better perks</h2>
                    <div className="space-y-6">
                        {[
                            { n: "01", title: "Order Normally", desc: "Browse health-verified restaurants and check out. Rewards are automatic on every completed delivery — no extra steps." },
                            { n: "02", title: "Earn Points", desc: "Points credit instantly after delivery. Your tier multiplier applies automatically.", extra: (
                                <div className="flex gap-2 flex-wrap mt-2">
                                    <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-bold text-white/50">Basic 1×</span>
                                    <span className="px-2.5 py-1 rounded-full bg-[rgba(249,115,22,0.08)] border border-[rgba(249,115,22,0.2)] text-[11px] font-bold text-[#f97316]/80">Plus 1.5×</span>
                                    <span className="px-2.5 py-1 rounded-full bg-[rgba(249,115,22,0.14)] border border-[rgba(249,115,22,0.3)] text-[11px] font-bold text-[#f97316]">Premium 2×</span>
                                </div>
                            )},
                            { n: "03", title: "Unlock Tiers", desc: "Hit 1,200 pts to unlock Plus (1.5×, priority dispatch). Hit 3,000 pts to unlock Premium (2×, concierge support)." },
                        ].map((step, i, arr) => (
                            <div key={step.n} className={`flex gap-4 ${i < arr.length - 1 ? "pb-6 border-b border-white/6" : ""}`}>
                                <span className="text-[11px] font-black text-[#f97316]/50 tracking-[0.18em] shrink-0 pt-0.5 w-6">{step.n}</span>
                                <div>
                                    <p className="font-black text-white text-sm mb-1">{step.title}</p>
                                    <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                                    {step.extra}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="mt-8 food-panel">
                    <p className="food-kicker mb-1">Questions</p>
                    <h2 className="food-heading !text-[26px] mb-6">Rewards FAQ</h2>
                    <div className="divide-y divide-white/6">
                        {[
                            { q: "When do I see my points?", a: "Points are credited automatically within minutes of your order being marked delivered." },
                            { q: "Do points expire?", a: "No. Your points never expire as long as your account is active and in good standing." },
                            { q: "Can I downgrade my tier?", a: "Yes. You can switch tiers anytime from account settings. Changes take effect on your next billing cycle." },
                            { q: "What does priority dispatch mean?", a: "During peak times, Plus and Premium orders are assigned to available drivers first — resulting in faster pickup and delivery." },
                            { q: "Is there a free tier?", a: "Yes — Basic is completely free. You earn 1× points on every order with no monthly fee." },
                            { q: "How does the 2× multiplier work?", a: "Premium members earn double points on every dollar spent. A $30 order earns 60 points instead of 30." },
                        ].map((faq) => (
                            <div key={faq.q} className="py-4 first:pt-0 last:pb-0">
                                <p className="font-black text-white text-sm mb-1">{faq.q}</p>
                                <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
