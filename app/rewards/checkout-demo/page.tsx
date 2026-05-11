import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

const PLAN_COPY = {
  Plus: {
    eyebrow: "Priority Tier",
    icon: Crown,
    price: "$9.99",
    cadence: "/ month",
    headline: "Join TrueServe Plus Rewards",
    description: "Priority dispatch, faster support, and 1.5x TruePoints on every completed order.",
    highlights: ["1.5x TruePoints", "Priority dispatch", "Faster support response"],
  },
  Premium: {
    eyebrow: "Power User",
    icon: ShieldCheck,
    price: "$19.99",
    cadence: "/ month",
    headline: "Join TrueServe Premium Rewards",
    description: "Highest dispatch priority, concierge support, and 2x TruePoints on every completed order.",
    highlights: ["2x TruePoints", "Highest dispatch priority", "Concierge support"],
  },
} as const;

type Tier = keyof typeof PLAN_COPY;

function resolveTier(value?: string): Tier {
  return value === "Premium" ? "Premium" : "Plus";
}

export default async function RewardsCheckoutDemoPage({
  searchParams,
}: {
  searchParams?: Promise<{ tier?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tier = resolveTier(resolvedSearchParams?.tier);
  const plan = PLAN_COPY[tier];
  const PlanIcon = plan.icon;

  return (
    <div className="food-app-shell min-h-screen">
      <nav className="food-app-nav">
        <div
          className="mx-auto flex items-center justify-between px-4 sm:px-0"
          style={{ width: "min(1180px, calc(100% - 32px))", padding: "14px 0" }}
        >
          <Logo size="sm" />
          <div className="flex gap-2">
            <Link href="/rewards" className="btn btn-ghost">
              Rewards
            </Link>
            <Link href="/restaurants" className="btn btn-gold">
              Order Food
            </Link>
          </div>
        </div>
      </nav>

      <main className="food-app-main">
        <section className="food-panel relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <video
              className="absolute inset-0 h-full w-full object-cover opacity-30"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
            >
              <source src="/videos/trueserve-rewards-checkout-3d-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.26),transparent_44%),linear-gradient(120deg,rgba(12,15,13,0.94),rgba(12,15,13,0.72)_48%,rgba(12,15,13,0.96))]" />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
            <div>
              <p className="food-kicker mb-3">Rewards Checkout Demo</p>
              <h1 className="food-heading max-w-[760px]">{plan.headline}</h1>
              <p className="food-subtitle mt-4 max-w-[620px]">{plan.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/rewards/checkout-demo?tier=Plus" className={`btn ${tier === "Plus" ? "btn-gold" : "btn-ghost"}`}>
                  Plus
                </Link>
                <Link href="/rewards/checkout-demo?tier=Premium" className={`btn ${tier === "Premium" ? "btn-gold" : "btn-ghost"}`}>
                  Premium
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {plan.highlights.map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <Check size={16} className="mb-3 text-[#f97316]" />
                    <p className="text-sm font-black text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="rounded-[20px] border border-white/10 bg-[#0f1412]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#f97316] text-black">
                  <PlanIcon size={21} />
                </div>
                <div>
                  <p className="food-kicker">{plan.eyebrow}</p>
                  <h2 className="text-xl font-black text-white">TrueServe {tier}</h2>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">Today</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="pb-1 text-sm font-bold text-white/45">{plan.cadence}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <span className="text-white/55">Plan</span>
                  <span className="font-black text-white">TrueServe {tier}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/8 pb-3">
                  <span className="text-white/55">Billing</span>
                  <span className="font-black text-white">Monthly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/55">Rewards</span>
                  <span className="font-black text-[#f97316]">{tier === "Premium" ? "2x points" : "1.5x points"}</span>
                </div>
              </div>

              <button className="btn btn-gold mt-6 w-full justify-center gap-2" type="button">
                <Sparkles size={16} />
                Continue To Secure Checkout
              </button>
              <p className="mt-3 text-center text-xs text-white/38">Demo view only. No payment is collected here.</p>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
