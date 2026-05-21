export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnniversaryTab from "./AnniversaryTab";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { grantAnniversaryRewardIfEligible, type AnniversaryRewardStatus } from "@/lib/rewards";
import { joinRewardsTier } from "./actions";
import { Crown, Gift, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";

type RewardsSnapshot = {
    plan: string;
    hasPaymentMethod: boolean;
    points: number;
    ordersCount: number;
    lifetimeSpend: number;
    multiplierText: string;
    createdAt: string | null;
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
        .select("plan, stripeCustomerId, truePointsBalance, createdAt")
        .eq("id", userId)
        .maybeSingle();

    if (!user) return null;

    const { data: orders } = await supabaseAdmin
        .from("Order")
        .select("total, status")
        .eq("userId", userId);

    const completed = (orders || []).filter((o: { status: string }) => o.status === "DELIVERED");
    const lifetimeSpend = completed.reduce((sum: number, o: { total: number | string | null }) => sum + Number(o.total ?? 0), 0);

    const plan = user.plan || "Basic";
    const multiplier = getMultiplier(plan);
    const multiplierText = multiplier === 1 ? "1x" : `${multiplier}x`;

    return {
        plan,
        hasPaymentMethod: Boolean(user.stripeCustomerId),
        points: Number(user.truePointsBalance || 0),
        ordersCount: completed.length,
        lifetimeSpend,
        multiplierText,
        createdAt: user.createdAt ? String(user.createdAt) : null,
        anniversaryReward
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
            <div className="ts-fig-rewards-banner is-success">
                Rewards plan updated successfully to <strong>{tier || "your selected tier"}</strong>.
            </div>
        );
    }
    if (update === "needs_wallet") {
        return (
            <div className="ts-fig-rewards-banner is-warn">
                Add a saved card in <Link href="/user/settings#wallet" className="underline font-bold">Account Settings</Link> before joining a paid rewards tier.
            </div>
        );
    }
    return (
        <div className="ts-fig-rewards-banner is-error">
            We couldn&rsquo;t update your rewards tier. Please try again.
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
    icon,
    variant
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
    variant?: "plain" | "teal" | "dark";
}) {
    const isCurrent = Boolean(currentPlan) && currentPlan === tier;
    const variantClass = variant === "teal" ? "teal" : variant === "dark" ? "dark" : "";
    return (
        <article className={`ts-fig-trust-card ts-fig-tier-card ${variantClass} ${isCurrent ? "is-current" : ""}`}>
            <div className="ts-fig-tier-head">
                <div className="ts-fig-trust-icon">{icon}</div>
                {badge ? <span className="ts-fig-tier-badge">{badge}</span> : null}
            </div>
            <span className="ts-fig-tier-subtitle">{subtitle}</span>
            <h3>{tier}</h3>
            <div className="ts-fig-tier-price">{price}</div>
            <ul className="ts-fig-tier-features">
                {features.map((feature) => (
                    <li key={feature}>
                        <span className="ts-fig-tier-dot" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <div className="ts-fig-tier-cta">
                {isCurrent ? (
                    <button type="button" disabled className="ts-fig-btn ts-fig-tier-current">
                        Current Plan
                    </button>
                ) : ctaHref ? (
                    <Link href={ctaHref} className="ts-fig-btn">
                        {ctaLabel || `Join ${tier}`}
                    </Link>
                ) : (
                    <form action={joinRewardsTier} style={{ width: "100%" }}>
                        <input type="hidden" name="tier" value={tier} />
                        <button type="submit" disabled={!canSubmit} className="ts-fig-btn" style={{ width: "100%", justifyContent: "center" }}>
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
    const isSignedIn = Boolean(isAuth && userId);
    const currentPlan = isSignedIn ? (snapshot?.plan || "Basic") : "";
    const displayPlan = currentPlan || "Basic";
    const canChoosePaid = Boolean(snapshot?.hasPaymentMethod);
    const safePoints = snapshot?.points ?? 0;
    const journey = getJourney(safePoints, displayPlan);

    return (
        <div className="ts-fig ts-fig-rewards-page">
            <SiteHeader />

            <main>
                {/* HERO */}
                <section className="ts-fig-hero">
                    <div className="ts-fig-container ts-fig-hero-inner">
                        <div>
                            <span className="ts-fig-chip">
                                <span className="ts-fig-chip-dot" />
                                Customer loyalty
                            </span>
                            <h1>
                                TrueServe <span className="o">Rewards.</span><span className="t">Eat more, earn more.</span>
                            </h1>
                            <p className="ts-fig-hero-sub">
                                Turn every order into perks. Earn points automatically, climb tiers, and unlock faster service plus stronger rewards over time.
                            </p>
                            <div className="ts-fig-rewards-hero-chips">
                                <span className="ts-fig-rewards-hero-chip"><Sparkles size={13} /> Points tracked in real-time</span>
                                <span className="ts-fig-rewards-hero-chip"><Crown size={13} /> Tier upgrades in one tap</span>
                                <span className="ts-fig-rewards-hero-chip"><TrendingUp size={13} /> Tied to real orders</span>
                            </div>
                            {!isSignedIn ? (
                                <div style={{ marginTop: 28 }}>
                                    <Link href="/login" className="ts-fig-btn">Sign in to join Rewards</Link>
                                </div>
                            ) : null}
                        </div>

                        <aside className="ts-fig-live-card ts-fig-rewards-progress-card" aria-label="Rewards progress">
                            <div className="ts-fig-live-card-head">
                                <span className="ts-fig-live-dot">{journey.title}</span>
                                <span className="updated">{isSignedIn ? `${displayPlan} tier` : "Sign in to track"}</span>
                            </div>
                            <div className="ts-fig-rewards-progress-body">
                                <div className="ts-fig-rewards-progress-points">
                                    <small>TruePoints</small>
                                    <strong>{snapshot ? snapshot.points.toLocaleString() : "0"}</strong>
                                </div>
                                <p>{journey.detail}</p>
                                <div className="ts-fig-rewards-progress-meta">
                                    <span>{journey.progress}% complete</span>
                                    <span>{journey.remaining.toLocaleString()} pts to go</span>
                                </div>
                                <div className="ts-fig-live-progress-bar" style={{ height: 8 }}>
                                    <span style={{ width: `${Math.max(5, journey.progress)}%`, animation: "none" }} />
                                </div>
                                <div className="ts-fig-rewards-tip">
                                    Tip: Place larger group orders to accelerate your next tier faster.
                                </div>
                            </div>
                        </aside>
                    </div>
                </section>

                {/* TAB NAV */}
                <nav className="ts-fig-rewards-tabs" aria-label="Rewards sections">
                    <div className="ts-fig-container">
                        <a href="#wallet">Wallet</a>
                        <a href="#anniversary">Anniversary</a>
                        <a href="#tiers">Tiers</a>
                        <a href="#how-it-works">How it works</a>
                        <a href="#faq">FAQ</a>
                    </div>
                </nav>

                {/* MESSAGE BANNER */}
                {resolvedSearchParams?.update ? (
                    <section className="ts-fig-section" style={{ paddingTop: 36, paddingBottom: 0 }}>
                        <div className="ts-fig-container">
                            <MessageBanner update={resolvedSearchParams?.update} tier={resolvedSearchParams?.tier} />
                        </div>
                    </section>
                ) : null}

                {/* WALLET SUMMARY */}
                <section id="wallet" className="ts-fig-section ts-fig-section-haze">
                    <div className="ts-fig-container">
                        <div className="ts-fig-rewards-wallet">
                            <div className="ts-fig-rewards-wallet-balance">
                                <span className="ts-fig-kicker"><Sparkles size={13} /> Active wallet</span>
                                <strong>{snapshot ? snapshot.points.toLocaleString() : "0"}</strong>
                                <span className="muted">TruePoints available</span>
                            </div>
                            <div className="ts-fig-rewards-wallet-meta">
                                <div className="ts-fig-rewards-wallet-row">
                                    <span><Crown size={14} /> {isSignedIn ? `${displayPlan} tier` : "Sign in to track tier"}</span>
                                    <span><TrendingUp size={14} /> {snapshot ? snapshot.ordersCount : 0} orders</span>
                                </div>
                                <div className="ts-fig-rewards-wallet-progress">
                                    <div className="ts-fig-rewards-wallet-progress-head">
                                        <span>{journey.title}</span>
                                        <span>{journey.remaining.toLocaleString()} pts to go</span>
                                    </div>
                                    <div className="ts-fig-live-progress-bar" style={{ height: 6 }}>
                                        <span style={{ width: `${Math.max(5, journey.progress)}%`, animation: "none" }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ANNIVERSARY (client component — handles confetti + countdown) */}
                <AnniversaryTab
                    isSignedIn={isSignedIn}
                    createdAt={snapshot?.createdAt ?? null}
                    reward={snapshot?.anniversaryReward}
                />

                {/* TIER PICKER */}
                <section id="tiers" className="ts-fig-section ts-fig-section-haze">
                    <div className="ts-fig-container">
                        <div className="ts-fig-rewards-tier-head">
                            <div>
                                <span className="ts-fig-kicker">Membership</span>
                                <h2>Choose your tier.</h2>
                            </div>
                            <Link href="/user/settings#wallet" className="ts-fig-link" style={{ alignSelf: "center" }}>Manage wallet →</Link>
                        </div>
                        <div className="ts-fig-rewards-tier-grid">
                            <TierCard
                                tier="Basic"
                                subtitle="Starter"
                                price="Free"
                                currentPlan={currentPlan}
                                canSubmit={isSignedIn}
                                ctaHref={!isSignedIn ? "/login" : undefined}
                                ctaLabel={!isSignedIn ? "Sign in to join" : undefined}
                                icon={<Gift size={20} />}
                                features={[
                                    "Standard points earning",
                                    "Access to all restaurants",
                                    "Core order tracking"
                                ]}
                                variant="plain"
                            />
                            <TierCard
                                tier="Plus"
                                subtitle="Priority Tier"
                                price="$9.99 / month"
                                currentPlan={currentPlan}
                                canSubmit={isSignedIn && canChoosePaid}
                                ctaHref={!isSignedIn ? "/login" : !canChoosePaid ? "/account#wallet" : undefined}
                                ctaLabel={!isSignedIn ? "Sign in to join" : !canChoosePaid ? "Add wallet to join" : undefined}
                                badge="Best Value"
                                icon={<Star size={20} />}
                                features={[
                                    "Priority dispatch during peak times",
                                    "Faster support response windows",
                                    "1.5x points multiplier on all orders"
                                ]}
                                variant="teal"
                            />
                            <TierCard
                                tier="Premium"
                                subtitle="Power User"
                                price="$19.99 / month"
                                currentPlan={currentPlan}
                                canSubmit={isSignedIn && canChoosePaid}
                                ctaHref={!isSignedIn ? "/login" : !canChoosePaid ? "/account#wallet" : undefined}
                                ctaLabel={!isSignedIn ? "Sign in to join" : !canChoosePaid ? "Add wallet to join" : undefined}
                                badge="Top Perks"
                                icon={<ShieldCheck size={20} />}
                                features={[
                                    "Highest dispatch priority",
                                    "Concierge support",
                                    "2x points multiplier"
                                ]}
                                variant="dark"
                            />
                        </div>
                        {isSignedIn && !canChoosePaid ? (
                            <p className="ts-fig-rewards-paid-hint">Add a payment method first to unlock Plus or Premium.</p>
                        ) : null}
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="ts-fig-section">
                    <div className="ts-fig-container">
                        <span className="ts-fig-kicker">How it works</span>
                        <h2>Three steps to better perks.</h2>
                        <div className="ts-fig-steps">
                            <div className="ts-fig-steps-connector" aria-hidden="true" />
                            <article className="ts-fig-step">
                                <div className="ts-fig-step-icon"><Gift size={28} /></div>
                                <span className="ts-fig-step-num">01</span>
                                <h3>Order normally</h3>
                                <p>Browse health-verified restaurants and check out. Rewards are automatic on every completed delivery — no extra steps.</p>
                            </article>
                            <article className="ts-fig-step">
                                <div className="ts-fig-step-icon"><Sparkles size={28} /></div>
                                <span className="ts-fig-step-num">02</span>
                                <h3>Earn points</h3>
                                <p>Points credit instantly after delivery. Your tier multiplier applies automatically.</p>
                                <div className="ts-fig-rewards-multiplier-row">
                                    <span className="ts-fig-rewards-multiplier">Basic 1×</span>
                                    <span className="ts-fig-rewards-multiplier teal">Plus 1.5×</span>
                                    <span className="ts-fig-rewards-multiplier orange">Premium 2×</span>
                                </div>
                            </article>
                            <article className="ts-fig-step">
                                <div className="ts-fig-step-icon"><Crown size={28} /></div>
                                <span className="ts-fig-step-num">03</span>
                                <h3>Unlock tiers</h3>
                                <p>Hit 1,200 pts to unlock Plus (1.5×, priority dispatch). Hit 3,000 pts to unlock Premium (2×, concierge support).</p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="ts-fig-section ts-fig-section-haze">
                    <div className="ts-fig-container">
                        <span className="ts-fig-kicker teal">Questions</span>
                        <h2>Rewards FAQ.</h2>
                        <div className="ts-fig-rewards-faq">
                            {[
                                { q: "When do I see my points?", a: "Points are credited automatically within minutes of your order being marked delivered." },
                                { q: "Do I get anything on my account anniversary?", a: "Yes. Eligible accounts receive 250 TruePoints once per year on or after the anniversary of the day the account was created." },
                                { q: "Do points expire?", a: "No. Your points never expire as long as your account is active and in good standing." },
                                { q: "Can I downgrade my tier?", a: "Yes. You can switch tiers anytime from account settings. Changes take effect on your next billing cycle." },
                                { q: "What does priority dispatch mean?", a: "During peak times, Plus and Premium orders are assigned to available drivers first — resulting in faster pickup and delivery." },
                                { q: "Is there a free tier?", a: "Yes — Basic is completely free. You earn 1× points on every order with no monthly fee." },
                                { q: "How does the 2× multiplier work?", a: "Premium members earn double points on every dollar spent. A $30 order earns 60 points instead of 30." },
                            ].map((faq) => (
                                <details key={faq.q} className="ts-fig-rewards-faq-item">
                                    <summary>
                                        <span>{faq.q}</span>
                                        <span className="ts-fig-rewards-faq-plus" aria-hidden="true">+</span>
                                    </summary>
                                    <p>{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </div>
    );
}
