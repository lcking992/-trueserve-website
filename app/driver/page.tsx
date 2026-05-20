"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { BadgeCheck, CarFront, CheckCircle2, CircleDollarSign, Clock3, FileCheck2, IdCard, Route, ShieldCheck, Smartphone, TimerReset, Zap } from "lucide-react";

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
              src="/driver-route-interior-trueserve.png"
              alt="TrueServe driver route view from inside a car with delivery bag"
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
              Earn $20/hr<br /><span className="accent">paid daily</span>
            </h1>
            <p className="food-subtitle" style={{ maxWidth: 520, margin: "0 auto 36px", textAlign: "center" }}>
              Deliver local orders, keep 100% of your tips, and track daily payout progress from the driver portal.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", margin: "-18px auto 28px" }}>
              {[
                { value: "$20/hr", label: "Driver pay" },
                { value: "Daily", label: "Payout rhythm" },
                { value: "100%", label: "Tips kept" },
              ].map((item) => (
                <div key={item.label} style={{
                  minWidth: 136,
                  padding: "11px 14px",
                  borderRadius: 16,
                  border: "1px solid rgba(249,115,22,0.24)",
                  background: "linear-gradient(180deg, rgba(249,115,22,0.12), rgba(255,255,255,0.025))",
                  textAlign: "left",
                }}>
                  <strong style={{ display: "block", color: "#fff", fontSize: 17, fontWeight: 950 }}>{item.value}</strong>
                  <span style={{ display: "block", marginTop: 2, color: "rgba(255,255,255,0.52)", fontSize: 10, fontWeight: 900, letterSpacing: "0.13em", textTransform: "uppercase" }}>{item.label}</span>
                </div>
              ))}
            </div>
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
              icon: Clock3,
              kicker: "Full Flexibility",
              title: "Set your own hours",
              desc: "Work mornings, evenings, or weekends. Go online when it suits you and offline the moment you're done. Zero obligations.",
            },
            {
              icon: Zap,
              kicker: "Fast Payouts",
              title: "Get paid quickly",
              desc: "Earnings are tracked in real time with daily payout visibility through the driver portal.",
            },
            {
              icon: Route,
              kicker: "Smart Dispatch",
              title: "Live route assist",
              desc: "Intelligent order matching sends you deliveries that fit your location. Built-in navigation keeps every route efficient.",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
            <div key={card.title} className="food-card" style={{ padding: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 14, marginBottom: 14, color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.22)" }}>
                <Icon size={21} strokeWidth={2.1} />
              </div>
              <p className="food-kicker" style={{ marginBottom: 8 }}>{card.kicker}</p>
              <h3 className="food-heading" style={{ fontSize: 26, marginBottom: 10 }}>{card.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{card.desc}</p>
            </div>
          )})}
        </section>

        <section className="driver-proof-grid" style={{ marginBottom: 56 }}>
          <div className="food-panel driver-earnings-panel">
            <p className="food-kicker" style={{ marginBottom: 10 }}>Earnings expectations</p>
            <h2 className="food-heading" style={{ fontSize: 34, marginBottom: 12 }}>Know the work before you apply.</h2>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(255,255,255,0.62)", marginBottom: 20 }}>
              TrueServe is built for local restaurant delivery: dinner rushes, clear pickups, and better handoff visibility.
            </p>
            <div className="driver-metric-row">
              {[
                { value: "$20/hr", label: "driver pay" },
                { value: "100%", label: "tips kept" },
                { value: "Daily", label: "payout rhythm" },
              ].map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="food-panel driver-next-panel">
            <p className="food-kicker" style={{ marginBottom: 10 }}>What happens next</p>
            {[
              { icon: FileCheck2, title: "Apply and choose text updates", desc: "The SMS checkbox is optional and clearly explains message terms." },
              { icon: ShieldCheck, title: "Upload documents", desc: "License, insurance, and registration go through private review." },
              { icon: CheckCircle2, title: "Get cleared to drive", desc: "Once approved, your driver dashboard unlocks for live delivery work." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="driver-next-step">
                  <Icon size={18} aria-hidden="true" />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Requirements */}
        <section className="food-panel" style={{ marginBottom: 56, padding: 40 }}>
          <p className="food-kicker" style={{ marginBottom: 12 }}>Requirements</p>
          <h2 className="food-heading" style={{ marginBottom: 32 }}>What you <span className="accent">need to start</span></h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { icon: IdCard, label: "Valid driver's license", sub: "Must be current and in good standing" },
              { icon: CarFront, label: "Reliable vehicle", sub: "Car, scooter, or bike — all accepted" },
              { icon: Smartphone, label: "Smartphone", sub: "iOS or Android to run the driver app" },
              { icon: ShieldCheck, label: "Background check", sub: "Quick online screening — usually clears in 24–48 hours" },
            ].map((req) => {
              const Icon = req.icon;
              return (
              <div key={req.label} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, flexShrink: 0, marginTop: 2, color: "#f97316", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)" }}>
                  <Icon size={18} strokeWidth={2.1} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 3 }}>{req.label}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{req.sub}</div>
                </div>
              </div>
            )})}
          </div>
        </section>

        <section className="driver-trust-strip" style={{ marginBottom: 56 }}>
          {[
            { icon: BadgeCheck, label: "No application fee", detail: "Start free" },
            { icon: CircleDollarSign, label: "Tips stay yours", detail: "100% tips" },
            { icon: TimerReset, label: "Fast review", detail: "Same-day target" },
            { icon: ShieldCheck, label: "Private docs", detail: "Secure uploads" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <Icon size={18} aria-hidden="true" />
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
            );
          })}
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
