export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import FadeInSection from "@/components/FadeInSection";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { grantAnniversaryRewardIfEligible, type AnniversaryRewardStatus } from "@/lib/rewards";
import { joinRewardsTier } from "./actions";
import { CalendarHeart, Crown, Gift, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";

type RewardsSnapshot = {
    plan: string;
    hasPaymentMethod: boolean;
    points: number;
    ordersCount: number;
    lifetimeSpend: number;
    multiplierText: string;
    anniversaryReward?: AnniversaryRewardStatus;
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

function formatRewardDate(value?: string) {
    if (!value) return "your next anniversary";
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(value));
}

async function getSnapshot(userId?: string, anniversaryReward?: AnniversaryRewardStatus): Promise<RewardsSnapshot | null> {
    if (!userId) return null;

    const { data: user } = await supabaseAdmin
        .from("User")
        .select("plan, stripeCustomerId, truePointsBalance")
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
    const points = Number(user.truePointsBalance || 0);

    return {
        plan: user.plan || "Basic",
        hasPaymentMethod: Boolean(user.stripeCustomerId),
        points,
        ordersCount: completed.length,
        lifetimeSpend,
        multiplierText: `${multiplier}x`,
        anniversaryReward
    };
}

function AnniversaryRewardCard({
    isSignedIn,
    reward
}: {
    isSignedIn: boolean;
    reward?: AnniversaryRewardStatus;
}) {
    const title = reward?.granted
        ? "Anniversary Points Added"
        : reward?.alreadyClaimed
            ? "Anniversary Reward Banked"
            : "Account Anniversary Reward";
    const detail = !isSignedIn
        ? "Create an account to start your anniversary clock. Eligible customers receive a yearly TruePoints bonus."
        : reward?.granted
            ? `${reward.points.toLocaleString()} TruePoints were added for your ${reward.anniversaryYear} TrueServe anniversary.`
            : reward?.alreadyClaimed
                ? `Your ${reward.anniversaryYear} anniversary reward is already in your balance. Next reward unlocks ${formatRewardDate(reward.nextAnniversary)}.`
                : `Your next yearly bonus unlocks ${formatRewardDate(reward?.nextAnniversary)}.`;

    return (
        <FadeInSection className="mt-8" delay={0.05}>
            <section className="food-panel rewards-anniversary-panel relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_42%)]" />
                <div className="relative z-10 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
                    <div className="rounded-3xl border border-[#f97316]/30 bg-[#f97316]/10 p-5">
                        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f97316]/35 bg-black/20 text-[#f97316]">
                            <CalendarHeart size={22} />
                        </div>
                        <p className="food-kicker mb-2">Yearly Perk</p>
                        <h2 className="food-heading !text-[30px]">{title}</h2>
                    </div>
                    <div>
                        <p className="text-white/74 leading-relaxed">{detail}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Bonus</p>
                                <strong className="mt-1 block text-2xl text-[#f97316]">{(reward?.points || 250).toLocaleString()}</strong>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Frequency</p>
                                <strong className="mt-1 block text-lg text-white">Yearly</strong>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Status</p>
                                <strong className="mt-1 block text-lg text-white">
                                    {reward?.granted ? "Added" : reward?.alreadyClaimed ? "Claimed" : "Tracking"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </FadeInSection>
    );
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

const TIER_IMAGES: Record<string, string> = {
    Basic: "/hero-pizza.png",
    Plus: "/littlerichards_bbq_plate.png",
    Premium: "/old_north_state_charcuterie.png",
};

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
        <article className={`food-card rewards-tier-card rewards-tier-${tier.toLowerCase()} relative overflow-hidden ${isCurrent ? "is-current" : ""}`}>
            {/* Tier photo banner */}
            <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden rounded-t-[inherit] pointer-events-none">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
                    style={{ backgroundImage: `url('${TIER_IMAGES[tier]}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111614]" />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_45%)]" />
            <div className="relative z-10">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="rounded-xl border border-[#f97316]/35 bg-[#f97316]/10 p-2 text-[#f97316]">
                        {icon}
                    </div>
                    {badge && (
                        <span className="rewards-tier-badge">
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
    const anniversaryReward = userId ? await grantAnniversaryRewardIfEligible(userId) : undefined;
    const snapshot = await getSnapshot(userId, anniversaryReward);
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
                        <Link href="/signup" className="btn btn-ghost">Sign Up</Link>
                        <Link href="/restaurants" className="btn btn-gold">Order Food</Link>
                    </div>
                </div>
            </nav>

            <main className="food-app-main">
                <MessageBanner update={resolvedSearchParams?.update} tier={resolvedSearchParams?.tier} />

                <section className="food-panel relative overflow-hidden">
                    {/* Hero food imagery strip */}
                    <div className="pointer-events-none absolute inset-0">
                        <div
                            className="rewards-hero-poster absolute inset-0 bg-cover bg-center opacity-[0.12]"
                            style={{ backgroundImage: "url('/community_section.png')" }}
                        />
                        <video
                            className="rewards-hero-video decorative-video absolute inset-0 h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls={false}
                            disablePictureInPicture
                            preload="metadata"
                            aria-hidden="true"
                            tabIndex={-1}
                        >
                            <source src="/videos/rewards-hero-warm-inviting.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(255,122,45,0.14),transparent_38%)]" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d0f0e]/90" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-6 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="min-w-0">
                            <p className="food-kicker mb-3">Customer Loyalty</p>
                            <h1 className="food-heading">TrueServe Rewards</h1>
                            <p className="food-subtitle mt-3 !max-w-none">
                                Turn every order into perks. Earn points automatically, climb tiers, and unlock faster service plus stronger rewards over time.
                            </p>
                            <div className="mt-5 rewards-chip-row">
                                <div className="food-chip"><span className="food-chip-dot" /> Points tracked in real-time</div>
                                <div className="food-chip"><span className="food-chip-dot" /> Tier upgrades in one tap</div>
                                <div className="food-chip"><span className="food-chip-dot" /> Tied to real orders</div>
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
                            <div className="rewards-progress-meta">
                                <span>{journey.progress}% complete</span>
                                <span>{journey.remaining.toLocaleString()} points to go</span>
                            </div>
                            <div className="rewards-progress-track">
                                <div
                                    className="rewards-progress-fill"
                                    style={{ width: `${Math.max(5, journey.progress)}%` }}
                                />
                            </div>
                            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/65 break-words">
                                Tip: Place larger group orders to accelerate your next tier faster.
                            </div>
                        </div>
                    </div>
                </section>

                <FadeInSection className="rewards-wallet-summary">
                    <div className="rewards-wallet-balance">
                        <p><Sparkles size={13} />Active Wallet Summary</p>
                        <strong>{snapshot ? snapshot.points.toLocaleString() : "0"}</strong>
                        <span>TruePoints available</span>
                    </div>
                    <div className="rewards-wallet-progress">
                        <div className="rewards-wallet-topline">
                            <span><Crown size={13} />{currentPlan} tier</span>
                            <span><TrendingUp size={13} />{snapshot ? snapshot.ordersCount : 0} orders</span>
                        </div>
                        <div className="rewards-progress-meta">
                            <span>{journey.title}</span>
                            <span>{journey.remaining.toLocaleString()} points to go</span>
                        </div>
                        <div className="rewards-progress-track">
                            <div
                                className="rewards-progress-fill"
                                style={{ width: `${Math.max(5, journey.progress)}%` }}
                            />
                        </div>
                    </div>
                </FadeInSection>

                <AnniversaryRewardCard isSignedIn={isSignedIn} reward={snapshot?.anniversaryReward} />

                <FadeInSection className="mt-8" delay={0.05}>
                    <div className="food-section-head rewards-section-head">
                        <div>
                            <p className="food-kicker mb-2">Membership</p>
                            <h2 className="food-heading">Choose Your Tier</h2>
                        </div>
                        <Link href="/user/settings#wallet" className="btn btn-ghost">Manage Wallet</Link>
                    </div>

                    <div className="rewards-tier-matrix grid gap-6 md:grid-cols-3">
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
                </FadeInSection>

                {/* HOW IT WORKS */}
                <FadeInSection className="mt-8" delay={0.05}>
                <section className="food-panel rewards-steps-panel">
                    <p className="food-kicker mb-1">How It Works</p>
                    <h2 className="food-heading !text-[26px] mb-6">Three steps to better perks</h2>
                    <div className="rewards-steps-list">
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
                        ].map((step) => (
                            <div key={step.n} className="rewards-step">
                                <span>{step.n}</span>
                                <div>
                                    <p>{step.title}</p>
                                    <small>{step.desc}</small>
                                    {step.extra}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                </FadeInSection>

                {/* FAQ */}
                <FadeInSection className="mt-8" delay={0.05}>
                <section className="food-panel">
                    <p className="food-kicker mb-1">Questions</p>
                    <h2 className="food-heading !text-[26px] mb-6">Rewards FAQ</h2>
                    <div className="divide-y divide-white/6">
                        {[
                            { q: "When do I see my points?", a: "Points are credited automatically within minutes of your order being marked delivered." },
                            { q: "Do I get anything on my account anniversary?", a: "Yes. Eligible accounts receive 250 TruePoints once per year on or after the anniversary of the day the account was created." },
                            { q: "Do points expire?", a: "No. Your points never expire as long as your account is active and in good standing." },
                            { q: "Can I downgrade my tier?", a: "Yes. You can switch tiers anytime from account settings. Changes take effect on your next billing cycle." },
                            { q: "What does priority dispatch mean?", a: "During peak times, Plus and Premium orders are assigned to available drivers first — resulting in faster pickup and delivery." },
                            { q: "Is there a free tier?", a: "Yes — Basic is completely free. You earn 1× points on every order with no monthly fee." },
                            { q: "How does the 2× multiplier work?", a: "Premium members earn double points on every dollar spent. A $30 order earns 60 points instead of 30." },
                        ].map((faq) => (
                            <details key={faq.q} className="rewards-faq-item">
                                <summary>
                                    <span>{faq.q}</span>
                                    <span aria-hidden="true">+</span>
                                </summary>
                                <p>{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </section>
                </FadeInSection>
            </main>
        </div>
    );
}
