import Link from "next/link";
import Logo from "@/components/Logo";
import { Check, ArrowRight, Zap, TrendingUp, Flame } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    tagline: "Up to 50 orders / month",
    price: "$99",
    priceSub: "/ month",
    sub: "For restaurants just getting started with delivery",
    overage: "Additional orders billed at $1.50 each",
    color: "#3dd68c",
    badge: null,
    icon: Zap,
    cta: "Apply as Founding Partner",
    href: "/merchant/signup",
    features: [
      "0% commission on every order",
      "Public restaurant storefront page",
      "Real-time order management",
      "Basic prep time controls",
      "Customer ratings visible",
      "Stripe payout integration",
      "Standard support",
    ],
  },
  {
    name: "Growth",
    tagline: "51–150 orders / month",
    price: "$199",
    priceSub: "/ month",
    sub: "For established restaurants scaling up delivery",
    overage: "Additional orders billed at $1.25 each",
    color: "#f97316",
    badge: null,
    icon: TrendingUp,
    cta: "Apply as Founding Partner",
    href: "/merchant/signup?plan=growth",
    features: [
      "0% commission on every order",
      "Everything in Starter",
      "POS integration (Toast, Square, Clover)",
      "AutoPilot busy-window management",
      "Advanced prep timing controls",
      "Priority order routing",
      "GHL booking widget embed",
      "Compliance score dashboard",
      "Dedicated account manager",
    ],
  },
  {
    name: "Scale",
    tagline: "150+ orders / month",
    price: "$349",
    priceSub: "/ month",
    sub: "For high-volume and multi-location restaurants",
    overage: null,
    color: "#a78bfa",
    badge: null,
    icon: Flame,
    cta: "Apply as Founding Partner",
    href: "/merchant/signup?plan=scale",
    features: [
      "0% commission on every order",
      "Everything in Growth",
      "Unlimited orders — no overage fees",
      "Multi-location dashboard",
      "Advanced analytics & reporting",
      "Custom delivery zone configuration",
      "White-glove onboarding",
      "Priority phone support",
    ],
  },
];

const COMPARE = [
  { name: "DoorDash",  commission: "15–30%", fee: "$0",        contract: "None" },
  { name: "Uber Eats", commission: "15–30%", fee: "$0",        contract: "None" },
  { name: "GrubHub",   commission: "15–30%", fee: "$0",        contract: "None" },
  { name: "TrueServe", commission: "0%",     fee: "$99–$349",  contract: "Monthly", highlight: true },
];

const FAQS = [
  { q: "Is there really zero commission?",        a: "Yes. TrueServe does not take a percentage of your orders. You keep everything your customers pay for food." },
  { q: "How do I get paid?",                      a: "Payouts go directly to your Stripe account. Setup takes about 5 minutes and funds typically arrive within 2 business days." },
  { q: "What happens if I exceed my order limit?", a: "On Starter, additional orders above 50 are billed at $1.50 each. On Growth, it's $1.25 each. Scale includes unlimited orders with no overage fees." },
  { q: "Can I switch plans later?",               a: "Yes — upgrade or downgrade anytime from your dashboard. Changes take effect at the start of your next billing cycle." },
  { q: "What POS systems are supported?",         a: "Toast, Square, and Clover on the Growth and Scale plans. More integrations are being added." },
  { q: "Is there a contract?",                    a: "All plans are month-to-month agreements. You can cancel at any time with 30 days written notice — no long-term lock-in." },
];

export default function PricingPage() {
  return (
    <div className="food-app-shell">

      {/* ── NAV ── */}
      <nav className="food-app-nav">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
        </div>
        <div className="hidden md:flex items-center gap-5" style={{ fontSize: 13, fontWeight: 700 }}>
          <Link href="/restaurants" style={{ color: "rgba(255,255,255,0.6)" }} className="hover:text-white transition-colors">Order Food</Link>
          <Link href="/merchant/signup" style={{ color: "rgba(255,255,255,0.6)" }} className="hover:text-white transition-colors">For Merchants</Link>
          <Link href="/contact" style={{ color: "rgba(255,255,255,0.6)" }} className="hover:text-white transition-colors">Contact</Link>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/merchant/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/merchant/signup" className="btn btn-gold">Get Started</Link>
        </div>
      </nav>

      <main className="food-app-main">

        {/* ── HERO ── */}
        <section className="food-panel relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at top, rgba(249,115,22,0.18), transparent 60%)" }} />
          <div className="relative z-10 py-6" style={{ textAlign: "center" }}>
            <p className="food-kicker mb-4">Merchant Pricing</p>
            <h1 className="food-heading" style={{ fontSize: "clamp(36px,6vw,64px)", lineHeight: 0.95, textAlign: "center" }}>
              Keep every dollar<br /><span className="accent">you earn.</span>
            </h1>
            <p className="food-subtitle mt-5" style={{ maxWidth: 500, fontSize: 14, textAlign: "center", margin: "20px auto 0" }}>
              Flat monthly rate. Zero commission. TrueServe makes money when you grow — not by skimming every order.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20 }}>
              {["0% commission", "Month-to-month", "30-day notice", "Live in minutes"].map(label => (
                <span key={label} className="food-chip" style={{ fontSize: 11, padding: "6px 13px", flexShrink: 0 }}>
                  <span className="food-chip-dot" />{label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDING PARTNER BANNER ── */}
        <div style={{
          marginTop: 16, padding: "18px 24px", borderRadius: 12, textAlign: "center",
          background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.25)",
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", color: "#f97316" }}>
            🤝 Founding Partner Program
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Join now and get <strong style={{ color: "#fff" }}>30 days free</strong> + your rate{" "}
            <strong style={{ color: "#fff" }}>locked forever</strong> — even if pricing increases later.
          </p>
        </div>

        {/* ── SAVINGS CALLOUT ── */}
        <div style={{
          marginTop: 10, padding: "14px 20px", borderRadius: 12, textAlign: "center",
          background: "rgba(61,214,140,0.07)", border: "1px solid rgba(61,214,140,0.2)",
        }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            💡 <strong style={{ color: "#3dd68c" }}>At Growth ($199/mo)</strong>, a restaurant doing 100 orders × $20 avg saves{" "}
            <strong style={{ color: "#3dd68c" }}>$201 every month</strong> vs DoorDash's 20% commission.
          </p>
        </div>

        {/* ── PLAN CARDS ── */}
        <section style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.name}
                className="food-panel relative overflow-hidden flex flex-col"
                style={{ border: `1px solid ${plan.color}30`, padding: 28 }}
              >
                <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at top right, ${plan.color}10, transparent 55%)` }} />

                <div className="relative z-10 flex-1">
                  <div style={{
                    marginBottom: 16, display: "inline-flex", borderRadius: 14, padding: 10,
                    background: `${plan.color}12`, border: `1px solid ${plan.color}28`,
                  }}>
                    <Icon size={20} style={{ color: plan.color }} />
                  </div>

                  <p className="food-kicker" style={{ marginBottom: 4 }}>{plan.tagline}</p>
                  <h2 className="food-heading" style={{ fontSize: "clamp(28px,3vw,36px)", marginBottom: 4 }}>{plan.name}</h2>

                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: "clamp(40px,5vw,52px)", fontWeight: 900, lineHeight: 1, fontFamily: "inherit", color: plan.color }}>{plan.price}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>{plan.priceSub}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>{plan.sub}</p>

                  {/* Overage note */}
                  {plan.overage && (
                    <div style={{
                      marginBottom: 20, padding: "8px 12px", borderRadius: 8,
                      background: `${plan.color}08`, border: `1px solid ${plan.color}20`,
                    }}>
                      <p style={{ margin: 0, fontSize: 11, color: `${plan.color}99` }}>⚡ {plan.overage}</p>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                        <div style={{
                          flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: `${plan.color}18`,
                        }}>
                          <Check size={11} style={{ color: plan.color }} />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 20, lineHeight: 1.5 }}>
                    Month-to-month · Cancel with 30 days notice
                  </p>
                </div>

                <Link
                  href={plan.href}
                  style={{
                    position: "relative", zIndex: 10, marginTop: 28,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: plan.color, color: "#0c0f0d",
                    borderRadius: 12, padding: "14px 20px",
                    fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em",
                    textDecoration: "none", transition: "opacity 0.15s",
                  }}
                >
                  {plan.cta} <ArrowRight size={13} />
                </Link>
              </article>
            );
          })}
        </section>

        {/* ── COMPARISON TABLE ── */}
        <section className="food-panel" style={{ marginTop: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p className="food-kicker" style={{ marginBottom: 8 }}>How We Compare</p>
            <h2 className="food-heading" style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>The honest <span className="accent">comparison.</span></h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>Other platforms charge 15–30% of every order. We don't.</p>
          </div>

          {/* Desktop */}
          <div className="pricing-compare-desktop" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "0 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Platform", "Commission", "Monthly Fee", "Contract"].map((h, i) => (
                <p key={h} style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", textAlign: i === 0 ? "left" : "center", margin: 0 }}>{h}</p>
              ))}
            </div>
            {COMPARE.map((row) => (
              <div key={row.name} style={{
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                alignItems: "center", padding: "14px 16px", borderRadius: 10,
                background: row.highlight ? "rgba(249,115,22,0.07)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${row.highlight ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)"}`,
              }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: row.highlight ? "#f97316" : "rgba(255,255,255,0.7)" }}>
                  {row.name}{row.highlight && <span style={{ marginLeft: 6, fontSize: 9, color: "rgba(249,115,22,0.5)", fontWeight: 800, letterSpacing: "0.1em" }}>✦ US</span>}
                </p>
                <p style={{ margin: 0, textAlign: "center", fontSize: 13, fontWeight: 800, color: row.highlight ? "#3dd68c" : "rgba(255,255,255,0.4)" }}>{row.commission}</p>
                <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: row.highlight ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>{row.fee}</p>
                <p style={{ margin: 0, textAlign: "center", fontSize: 13, color: row.highlight ? "#f97316" : "rgba(255,255,255,0.3)" }}>{row.contract}</p>
              </div>
            ))}
          </div>

          {/* Mobile stacked */}
          <div className="pricing-compare-mobile" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMPARE.map((row) => (
              <div key={row.name} style={{
                padding: "14px 16px", borderRadius: 10,
                background: row.highlight ? "rgba(249,115,22,0.07)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${row.highlight ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.04)"}`,
              }}>
                <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 14, color: row.highlight ? "#f97316" : "rgba(255,255,255,0.8)" }}>
                  {row.name}{row.highlight && <span style={{ marginLeft: 6, fontSize: 9, color: "rgba(249,115,22,0.5)", fontWeight: 800, letterSpacing: "0.1em" }}>✦ US</span>}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Commission", value: row.commission, color: row.highlight ? "#3dd68c" : undefined },
                    { label: "Monthly Fee", value: row.fee,       color: row.highlight ? "rgba(255,255,255,0.7)" : undefined },
                    { label: "Contract",    value: row.contract,  color: row.highlight ? "#f97316" : undefined },
                  ].map(col => (
                    <div key={col.label}>
                      <p style={{ margin: "0 0 3px", fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,0.25)" }}>{col.label}</p>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: col.color || "rgba(255,255,255,0.35)" }}>{col.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <style>{`
            .pricing-compare-mobile { display: none; }
            @media (max-width: 600px) {
              .pricing-compare-desktop { display: none !important; }
              .pricing-compare-mobile  { display: flex !important; }
            }
          `}</style>

          <p style={{ marginTop: 14, fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center", letterSpacing: "0.06em" }}>
            Commission rates based on publicly available data. Actual rates may vary by market.
          </p>
        </section>

        {/* ── FAQ ── */}
        <section className="food-panel" style={{ marginTop: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p className="food-kicker" style={{ marginBottom: 8 }}>FAQ</p>
            <h2 className="food-heading" style={{ fontSize: "clamp(26px,3.5vw,38px)" }}>Common <span className="accent">questions.</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {FAQS.map((faq) => (
              <div key={faq.q} className="food-card" style={{ padding: 20 }}>
                <p style={{ fontWeight: 800, color: "#fff", marginBottom: 8, fontSize: 13, lineHeight: 1.4 }}>{faq.q}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="food-panel relative overflow-hidden" style={{ marginTop: 24, textAlign: "center" }}>
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.14), transparent 60%)" }} />
          <div className="relative" style={{ maxWidth: 480, margin: "0 auto", padding: "16px 0 8px" }}>
            <p className="food-kicker" style={{ marginBottom: 12 }}>Ready to partner with us?</p>
            <h2 className="food-heading" style={{ fontSize: "clamp(30px,4.5vw,48px)", marginBottom: 14 }}>
              Your restaurant,<br /><span className="accent">your revenue.</span>
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 28, lineHeight: 1.65 }}>
              Join TrueServe and start taking orders with zero commission.<br />Setup takes less than 10 minutes.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/merchant/signup" className="portal-btn-gold" style={{ minWidth: 200 }}>
                Apply as Founding Partner
              </Link>
              <Link href="/restaurants" className="portal-btn-outline" style={{ minWidth: 160 }}>
                See the Platform
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", padding: "36px 16px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <Logo size="md" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Privacy",     href: "/privacy" },
              { label: "Terms",       href: "/terms" },
              { label: "Contact",     href: "/contact" },
              { label: "Get Started", href: "/merchant/signup" },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", color: "#555", textDecoration: "none" }}
                className="hover:text-white transition-colors">{l.label}</Link>
            ))}
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#444", margin: 0 }}>
            © {new Date().getFullYear()} TrueServe · Built for local restaurants.
          </p>
        </div>
      </footer>

    </div>
  );
}
