"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function DriverLanding() {
  return (
    <div className="food-app-shell" style={{ minHeight: "100vh", background: "#09090c" }}>
      <nav className="food-app-nav">
        <Logo size="sm" />
        <div className="nav-links hidden md:flex">
          <Link href="/restaurants">Order Food</Link>
          <Link href="/merchant">For Merchants</Link>
        </div>
        <div className="nav-r">
          <Link href="/driver/login" className="btn btn-ghost">Sign In</Link>
        </div>
      </nav>

      <main className="food-app-main">
        {/* Hero */}
        <section style={{ padding: "48px 0 56px" }}>
          {/* Image */}
          <div style={{
            position: "relative",
            width: "100%",
            borderRadius: 24,
            overflow: "hidden",
            marginBottom: 48,
            aspectRatio: "16/7",
            minHeight: 280,
          }}>
            <img
              src="/driver_hero_real.png"
              alt="TrueServe driver on the road at dusk with delivery bag"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
            />
            {/* gradient overlay so text below doesn't need extra contrast */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(9,9,12,0.72) 0%, rgba(9,9,12,0.1) 60%, transparent 100%)"
            }} />
            {/* bottom-left badge on the image */}
            <div style={{
              position: "absolute", bottom: 20, left: 24,
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(9,9,12,0.75)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10,
              padding: "8px 14px",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f97316", flexShrink: 0, boxShadow: "0 0 6px #f97316" }} />
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#f97316" }}>Now accepting drivers</span>
            </div>
          </div>

          {/* Text + CTAs */}
          <div style={{ textAlign: "center" }}>
            <p className="food-kicker" style={{ marginBottom: 16, color: "#f97316" }}>For Drivers</p>
            <h1 className="food-title" style={{ marginBottom: 20, maxWidth: 700, margin: "0 auto 20px" }}>
              Earn on<br /><span className="accent">your terms</span>
            </h1>
            <p className="food-subtitle" style={{ maxWidth: 520, margin: "0 auto 36px", textAlign: "center" }}>
              Deliver when you want, keep what you earn, and get paid fast — no shift requirements, no boss, no waiting.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/driver/signup" className="portal-btn-gold portal-btn-gold-block" style={{ width: "auto", padding: "14px 32px", fontSize: 14 }}>
                Apply to Drive →
              </Link>
              <Link href="/driver/login" className="portal-btn-outline portal-btn-outline-block" style={{ width: "auto", padding: "14px 28px", fontSize: 14 }}>
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid gap-6 md:grid-cols-3" style={{ marginBottom: 56 }}>
          {[
            {
              icon: "🕐",
              kicker: "Full Flexibility",
              title: "Set your own hours",
              desc: "Work mornings, evenings, or weekends. Go online when it suits you and offline the moment you're done. Zero obligations.",
            },
            {
              icon: "⚡",
              kicker: "Fast Payouts",
              title: "Get paid quickly",
              desc: "Earnings are tracked in real time and paid out via Stripe. No waiting until Friday — your money moves when you do.",
            },
            {
              icon: "🗺️",
              kicker: "Smart Dispatch",
              title: "Live route assist",
              desc: "Intelligent order matching sends you deliveries that fit your location. Built-in navigation keeps every route efficient.",
            },
          ].map((card) => (
            <div key={card.title} className="food-card" style={{ padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <p className="food-kicker" style={{ marginBottom: 8 }}>{card.kicker}</p>
              <h3 className="food-heading" style={{ fontSize: 26, marginBottom: 10 }}>{card.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{card.desc}</p>
            </div>
          ))}
        </section>

        {/* Requirements */}
        <section className="food-panel" style={{ marginBottom: 56, padding: 40 }}>
          <p className="food-kicker" style={{ marginBottom: 12 }}>Requirements</p>
          <h2 className="food-heading" style={{ marginBottom: 32 }}>What you <span className="accent">need to start</span></h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: "🪪", label: "Valid driver's license", sub: "Must be current and in good standing" },
              { icon: "🚗", label: "Reliable vehicle", sub: "Car, scooter, or bike — all accepted" },
              { icon: "📱", label: "Smartphone", sub: "iOS or Android to run the driver app" },
              { icon: "✅", label: "Background check", sub: "Quick online screening — usually clears in 24–48 hours" },
            ].map((req) => (
              <div key={req.label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{req.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>{req.label}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{req.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Earnings calc teaser */}
        <section style={{ textAlign: "center", padding: "40px 0 64px" }}>
          <h2 className="food-heading" style={{ marginBottom: 12 }}>Ready to hit the road?</h2>
          <p className="food-subtitle" style={{ maxWidth: 420, margin: "0 auto 28px" }}>
            Applications take under 5 minutes. Get approved and start earning this week.
          </p>
          <Link href="/driver/signup" className="portal-btn-gold portal-btn-gold-block" style={{ width: "auto", display: "inline-flex", padding: "16px 40px", fontSize: 15 }}>
            Apply Now — It&apos;s Free
          </Link>
        </section>

        <footer className="mt-4 border-t border-white/5 px-2 pt-8 pb-10 text-center">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
            <Logo size="md" />
            <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/merchant" className="hover:text-[#f97316] transition-colors">For Merchants</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
              © {new Date().getFullYear()} TrueServe · Bringing local flavor to your doorstep.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
