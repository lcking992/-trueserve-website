export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import FadeInSection from "@/components/FadeInSection";
import { getAuthSession } from "@/app/auth/actions";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { joinRewardsTier } from "./actions";
import {
  ArrowRight,
  Crown,
  Gift,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  WalletCards,
} from "lucide-react";

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
  Premium: 3000,
} as const;

const TIER_IMAGES: Record<string, string> = {
  Basic: "/brand/brand_rewards_tier_1.jpg",
  Plus: "/brand/brand_rewards_tier_2.jpg",
  Premium: "/brand/brand_rewards_tier_3.jpg",
};

const rewardsPillars = [
  {
    label: "Dispatch",
    title: "Priority lanes when dinner rush hits",
    detail: "Paid tiers move into a calmer fulfillment lane instead of competing with every order equally.",
  },
  {
    label: "Points",
    title: "Every dollar turns into visible momentum",
    detail: "No promo-code gymnastics. Points accrue automatically and your multiplier follows your plan.",
  },
  {
    label: "Support",
    title: "A cleaner post-order experience",
    detail: "Higher tiers unlock faster help windows and a more direct recovery path when something slips.",
  },
];

const rewardsSteps = [
  {
    n: "01",
    title: "Order like normal",
    detail: "Browse, checkout, and let completed deliveries feed your rewards balance automatically.",
  },
  {
    n: "02",
    title: "Stack points in the background",
    detail: "Basic earns 1x, Plus earns 1.5x, and Premium doubles every completed dollar spent.",
  },
  {
    n: "03",
    title: "Move into better service lanes",
    detail: "Higher tiers sharpen dispatch priority, support speed, and how quickly your next perk unlocks.",
  },
];

const rewardsFaqs = [
  {
    q: "When do I see my points?",
    a: "Points credit automatically within minutes after an order is marked delivered.",
  },
  {
    q: "Do points expire?",
    a: "No. Your points stay with the account while it remains active and in good standing.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can move between tiers from your account and billing changes apply on the next cycle.",
  },
  {
    q: "What does priority dispatch change?",
    a: "During busy periods, higher-tier orders are surfaced sooner to available drivers for a faster handoff.",
  },
  {
    q: "Is there still a free option?",
    a: "Yes. Basic stays free and continues earning standard points on every eligible order.",
  },
  {
    q: "Why is a saved card required for paid tiers?",
    a: "Paid plans bill monthly, so a wallet method needs to be on file before the upgrade can complete.",
  },
];

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
    multiplierText: `${multiplier}x`,
  };
}

function getJourney(points: number, plan: string) {
  if (plan === "Premium") {
    return {
      title: "Top tier already unlocked",
      detail: "You are already in the highest multiplier and fastest support lane.",
      remaining: 0,
      progress: 100,
    };
  }

  if (plan === "Plus") {
    const target = TIER_POINT_TARGET.Premium;
    const remaining = Math.max(target - points, 0);
    return {
      title: "Next stop: Premium",
      detail: `${remaining.toLocaleString()} more points to unlock 2x rewards and concierge support.`,
      remaining,
      progress: Math.min(100, Math.round((points / target) * 100)),
    };
  }

  const target = TIER_POINT_TARGET.Plus;
  const remaining = Math.max(target - points, 0);
  return {
    title: "Next stop: Plus",
    detail: `${remaining.toLocaleString()} more points to unlock priority dispatch and 1.5x rewards.`,
    remaining,
    progress: Math.min(100, Math.round((points / target) * 100)),
  };
}

function MessageBanner({ update, tier }: { update?: string; tier?: string }) {
  if (!update) return null;

  if (update === "success") {
    return (
      <div className="rewards-flash rewards-flash-success">
        Rewards plan updated successfully to <strong>{tier || "your selected tier"}</strong>.
      </div>
    );
  }

  if (update === "needs_wallet") {
    return (
      <div className="rewards-flash rewards-flash-warn">
        Add a saved card in{" "}
        <Link href="/user/settings#wallet" className="underline font-bold">
          Account Settings
        </Link>{" "}
        before joining a paid rewards tier.
      </div>
    );
  }

  return <div className="rewards-flash rewards-flash-error">We couldn’t update your rewards tier. Please try again.</div>;
}

function SnapshotTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="rewards-glass rewards-snapshot-tile">
      <div className="rewards-snapshot-icon">{icon}</div>
      <p className="rewards-snapshot-label">{label}</p>
      <p className="rewards-snapshot-value">{value}</p>
      <p className="rewards-snapshot-detail">{detail}</p>
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
  const isFeatured = tier === "Plus";

  return (
    <article className={`rewards-tier-card rewards-glass ${isFeatured ? "is-featured" : ""} ${isCurrent ? "is-current" : ""}`}>
      <div className="rewards-tier-media" style={{ backgroundImage: `url('${TIER_IMAGES[tier]}')` }}>
        <div className="rewards-tier-media-wash" />
        <div className="rewards-tier-media-top">
          <div className="rewards-tier-icon">{icon}</div>
          {badge ? <span className="rewards-tier-badge">{badge}</span> : null}
        </div>
      </div>

      <div className="rewards-tier-body">
        <p className="rewards-tier-subtitle">{subtitle}</p>
        <div className="rewards-tier-heading-row">
          <h3 className="food-heading !text-[34px]">{tier}</h3>
          {isCurrent ? <span className="rewards-tier-current">Current</span> : null}
        </div>
        <p className="rewards-tier-price">{price}</p>
        <div className="rewards-tier-feature-list">
          {features.map((feature) => (
            <div key={feature} className="rewards-tier-feature">
              <span className="rewards-tier-feature-dot" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="rewards-tier-cta">
          {isCurrent ? (
            <button type="button" disabled className="w-full btn btn-ghost opacity-70 cursor-not-allowed">
              Current Plan
            </button>
          ) : ctaHref ? (
            <Link href={ctaHref} className="place-btn w-full text-center block">
              {ctaLabel || `Join ${tier}`}
            </Link>
          ) : (
            <form action={joinRewardsTier}>
              <input type="hidden" name="tier" value={tier} />
              <button type="submit" disabled={!canSubmit} className="w-full place-btn">
                {ctaLabel || `Join ${tier}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function RewardsPage({
  searchParams,
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
        <div
          className="mx-auto flex items-center justify-between px-4 sm:px-0"
          style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}
        >
          <Logo size="sm" />
          <div className="flex gap-2">
            <Link href="/account" className="btn btn-ghost">
              Account
            </Link>
            <Link href="/restaurants" className="btn btn-gold">
              Order Food
            </Link>
          </div>
        </div>
      </nav>

      <main className="food-app-main rewards-page-shell">
        <MessageBanner update={resolvedSearchParams?.update} tier={resolvedSearchParams?.tier} />

        <section className="rewards-stage">
          <div
            className="rewards-stage-image"
            style={{ backgroundImage: "url('/brand/brand_rewards_hero.jpg')" }}
            aria-hidden="true"
          />
          <div className="rewards-stage-wash" aria-hidden="true" />

          <div className="rewards-stage-grid">
            <div className="rewards-stage-copy">
              <div className="food-eyebrow">TrueServe Rewards</div>
              <h1 className="food-heading rewards-stage-title">
                A cleaner loyalty lane for the people who order often.
              </h1>
              <p className="food-subtitle rewards-stage-subtitle">
                Built to feel more premium than promotional: clearer tiers, calmer perks, and progress that stays visible after every delivery.
              </p>

              <div className="rewards-chip-row flex gap-2 mt-5">
                <div className="food-chip">
                  <span className="food-chip-dot" />
                  Automatic point tracking
                </div>
                <div className="food-chip">
                  <span className="food-chip-dot" />
                  Priority dispatch on higher tiers
                </div>
                <div className="food-chip">
                  <span className="food-chip-dot" />
                  Upgrades tied to real orders
                </div>
              </div>

              <div className="rewards-pillars-grid">
                {rewardsPillars.map((pillar) => (
                  <article key={pillar.title} className="rewards-glass rewards-pillar-card">
                    <p className="rewards-pillar-label">{pillar.label}</p>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.detail}</p>
                  </article>
                ))}
              </div>

              {!isSignedIn ? (
                <div className="mt-6">
                  <Link href="/login" className="btn btn-gold rewards-hero-cta">
                    Sign In To Join Rewards
                  </Link>
                </div>
              ) : null}
            </div>

            <aside className="rewards-glass rewards-stage-panel">
              <div className="rewards-stage-panel-head">
                <div>
                  <p className="rewards-panel-label">Live snapshot</p>
                  <h2>{journey.title}</h2>
                </div>
                <div className="rewards-tier-pill">{currentPlan}</div>
              </div>

              <p className="rewards-stage-panel-copy">{journey.detail}</p>

              <div className="rewards-snapshot-grid">
                <SnapshotTile
                  label="Points"
                  value={(snapshot?.points ?? 0).toLocaleString()}
                  detail="Current loyalty balance"
                  icon={<Sparkles size={16} />}
                />
                <SnapshotTile
                  label="Multiplier"
                  value={snapshot?.multiplierText ?? "1x"}
                  detail="Applied on completed orders"
                  icon={<TrendingUp size={16} />}
                />
                <SnapshotTile
                  label="Orders"
                  value={String(snapshot?.ordersCount ?? 0)}
                  detail="Eligible deliveries so far"
                  icon={<Gift size={16} />}
                />
                <SnapshotTile
                  label="Lifetime spend"
                  value={`$${(snapshot?.lifetimeSpend ?? 0).toFixed(0)}`}
                  detail="Completed order volume"
                  icon={<WalletCards size={16} />}
                />
              </div>

              <div className="rewards-glass rewards-progress-card">
                <div className="rewards-progress-topline">
                  <span>{journey.progress}% complete</span>
                  <span>{journey.remaining.toLocaleString()} pts left</span>
                </div>
                <div className="rewards-progress-track">
                  <div className="rewards-progress-fill" style={{ width: `${journey.progress}%` }} />
                </div>
                <p className="rewards-progress-note">
                  Bigger family or group orders are the fastest way to push into the next service tier.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <FadeInSection className="mt-8" delay={0.04}>
          <div className="food-section-head rewards-section-head">
            <div>
              <p className="food-kicker mb-2">Membership Tiers</p>
              <h2 className="food-heading">Choose the lane that fits your order rhythm</h2>
            </div>
            <Link href="/user/settings#wallet" className="btn btn-ghost">
              Manage Wallet
            </Link>
          </div>

          <div className="rewards-membership-grid">
            <TierCard
              tier="Basic"
              subtitle="Starter Access"
              price="Free"
              currentPlan={currentPlan}
              canSubmit={isSignedIn}
              ctaHref={!isSignedIn ? "/login" : undefined}
              ctaLabel={!isSignedIn ? "Sign In To Join" : undefined}
              icon={<Gift size={17} />}
              features={[
                "Standard points on every eligible order",
                "Core tracking and full restaurant access",
                "A clean entry point with no monthly fee",
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
              badge="Most Balanced"
              icon={<Star size={17} />}
              features={[
                "1.5x points multiplier on every completed order",
                "Priority dispatch during peak windows",
                "Faster support response when you need a fix",
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
                "2x points multiplier across all eligible orders",
                "Highest dispatch priority when capacity gets tight",
                "Concierge-style support lane for premium accounts",
              ]}
            />
          </div>

          {isSignedIn && !canChoosePaid ? (
            <div className="rewards-glass rewards-wallet-note">
              Add a payment method first to unlock Plus or Premium.
            </div>
          ) : null}
        </FadeInSection>

        <FadeInSection className="mt-8" delay={0.08}>
          <div className="rewards-story-grid">
            <section className="rewards-glass rewards-story-panel">
              <p className="food-kicker mb-2">How It Works</p>
              <h2 className="food-heading !text-[28px]">Three simple steps, no loyalty clutter</h2>
              <div className="rewards-step-grid">
                {rewardsSteps.map((step) => (
                  <article key={step.n} className="rewards-glass rewards-step-card">
                    <span className="rewards-step-number">{step.n}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rewards-glass rewards-proof-panel">
              <p className="food-kicker mb-2">Perk Design</p>
              <h2 className="food-heading !text-[28px]">Built around useful moments, not coupon noise</h2>
              <div className="rewards-proof-stack">
                <article className="rewards-glass rewards-proof-card">
                  <span className="rewards-proof-icon">
                    <Crown size={16} />
                  </span>
                  <div>
                    <h3>Dispatch that gets more intentional</h3>
                    <p>Higher tiers improve where your order sits when dinner traffic gets crowded.</p>
                  </div>
                </article>
                <article className="rewards-glass rewards-proof-card">
                  <span className="rewards-proof-icon">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <h3>Visible progress after every order</h3>
                    <p>Your multiplier follows the plan automatically, so progress never feels hidden or abstract.</p>
                  </div>
                </article>
                <article className="rewards-glass rewards-proof-card">
                  <span className="rewards-proof-icon">
                    <ArrowRight size={16} />
                  </span>
                  <div>
                    <h3>Upgrade when it actually makes sense</h3>
                    <p>Join a paid tier when order volume justifies it, not because the UI nags you into it.</p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </FadeInSection>

        <FadeInSection className="mt-8" delay={0.12}>
          <section className="rewards-glass rewards-faq-shell">
            <div className="rewards-faq-head">
              <div>
                <p className="food-kicker mb-2">Questions</p>
                <h2 className="food-heading !text-[28px]">Rewards FAQ</h2>
              </div>
              <p className="rewards-faq-intro">
                The details that matter most before you join or switch tiers.
              </p>
            </div>
            <div className="rewards-faq-grid">
              {rewardsFaqs.map((faq) => (
                <article key={faq.q} className="rewards-glass rewards-faq-card">
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </article>
              ))}
            </div>
          </section>
        </FadeInSection>
      </main>
    </div>
  );
}
