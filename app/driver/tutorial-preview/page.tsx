"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Dashboard",   icon: "Analytics", color: "#f97316" },
  { label: "Settlements", icon: "Cost", color: "#4dca80" },
  { label: "Reputation",  icon: "Rating", color: "#f97316" },
  { label: "Compliance",  icon: "Done", color: "#4dca80" },
  { label: "Profile",     icon: "User", color: "#6b8ee8" },
  { label: "Help",        icon: "Support", color: "#e84040" },
];

const SECTIONS = [
  {
    step: 1,
    label: "Dashboard",
    title: "Your Home Base",
    body: "The Dashboard shows available trips nearby, today's estimated earnings, deliveries completed, and your current online/offline status. It also surfaces your active delivery when you're mid-route.",
    navIndex: 0,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Available Trips", val: "8",      sub: "Nearby offers",     cls: "text-white" },
            { label: "Today",           val: "$126",   sub: "Est. earnings",     cls: "text-[#f97316]" },
            { label: "Deliveries",      val: "7",      sub: "Completed today",   cls: "text-white" },
            { label: "Status",          val: "Online", sub: "Accepting orders",  cls: "text-emerald-300" },
          ].map(s => (
            <div key={s.label} className="rounded-[8px] border border-white/8 bg-black/30 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.07em] text-white/40">{s.label}</p>
              <p className={`mt-1.5 text-[18px] font-black leading-none ${s.cls}`}>{s.val}</p>
              <p className="mt-0.5 text-[10px] text-white/45">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="flex items-center gap-2 border-b border-white/8 bg-black/30 px-4 py-2.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f97316]" />
            <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[#f97316]/80">Active Delivery</span>
          </div>
          <div className="grid grid-cols-2">
            <div className="border-r border-white/8 px-4 py-3">
              <p className="text-[10px] font-bold uppercase text-white/40">Pickup</p>
              <p className="mt-1 text-[12px] font-semibold text-white/85">Burger Palace</p>
              <p className="text-[10px] text-white/50">123 Main St · 0.4 mi</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold uppercase text-white/40">Drop-off</p>
              <p className="mt-1 text-[12px] font-semibold text-white/85">400 Oak Ave, Apt 2B</p>
              <p className="text-[10px] text-white/50">Jordan M. · 1.2 mi</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-bold uppercase text-white/35">Progress</span>
            <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <span className="absolute inset-y-0 left-0 w-[68%] rounded-full bg-[#f97316]/75" />
            </div>
            <span className="text-[10px] font-bold text-[#f97316]">En route</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 2,
    label: "Settlements",
    title: "Your Earnings",
    body: "Settlements breaks down your weekly pay — every completed trip, tip received, and deduction in one place. You can view current week and past payout history, and see exactly when your next deposit lands.",
    navIndex: 1,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "This Week",    val: "$312.50", cls: "text-[#4dca80]" },
            { label: "Last Week",   val: "$289.00", cls: "text-white" },
            { label: "Next Payout", val: "Fri",     cls: "text-[#f97316]" },
          ].map(s => (
            <div key={s.label} className="rounded-[8px] border border-white/8 bg-black/30 px-3 py-3 text-center">
              <p className="text-[10px] font-black uppercase text-white/35">{s.label}</p>
              <p className={`mt-1 text-[18px] font-black ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase text-white/40">Recent Trips</span>
          </div>
          {[
            { name: "Burger Palace",   dest: "Oak Ave",   pay: "$18.40", tip: "+$3.00" },
            { name: "Taco World",      dest: "Pine St",   pay: "$14.75", tip: "+$2.50" },
            { name: "Sushi Express",   dest: "Maple Blvd",pay: "$11.20", tip: "+$1.00" },
          ].map((t, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
              <div>
                <p className="text-[12px] font-semibold text-white/85">{t.name}</p>
                <p className="text-[10px] text-white/45">→ {t.dest}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-black text-[#f97316]">{t.pay}</p>
                <p className="text-[10px] text-[#4dca80]">{t.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 3,
    label: "Reputation",
    title: "Your Ratings",
    body: "Reputation tracks your star rating, customer feedback, and acceptance rate. Keeping your rating above 4.5 unlocks priority order access. You can see individual reviews and respond to disputes here.",
    navIndex: 2,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Rating",      val: "4.8 ★", cls: "text-[#f97316]" },
            { label: "Acceptance",  val: "92%",   cls: "text-[#4dca80]" },
            { label: "Completion",  val: "98%",   cls: "text-white" },
          ].map(s => (
            <div key={s.label} className="rounded-[8px] border border-white/8 bg-black/30 px-3 py-3 text-center">
              <p className="text-[10px] font-black uppercase text-white/35">{s.label}</p>
              <p className={`mt-1 text-[18px] font-black ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase text-white/40">Recent Feedback</span>
          </div>
          {[
            { stars: "★★★★★", text: "Super fast delivery, food was still hot!", time: "2h ago" },
            { stars: "★★★★★", text: "Very professional, followed instructions.", time: "Yesterday" },
            { stars: "★★★★☆", text: "Good delivery, slight delay at pickup.",    time: "2 days ago" },
          ].map((r, i) => (
            <div key={i} className={`px-4 py-3 ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#f97316]">{r.stars}</span>
                <span className="text-[10px] text-white/30">{r.time}</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-white/60">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 4,
    label: "Compliance",
    title: "Stay Compliant",
    body: "Compliance is where you manage your required documents — driver's license, vehicle insurance, and background check status. TrueServe flags expiring documents before they block you from accepting orders.",
    navIndex: 3,
    content: (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase text-white/40">Document Status</span>
          </div>
          {[
            { doc: "Driver's License",    status: "Verified",  exp: "Exp: 12/2027",  sc: "text-[#4dca80]", bc: "border-[#4dca80]/25 bg-[#4dca80]/[0.06]" },
            { doc: "Vehicle Insurance",   status: "Verified",  exp: "Exp: 06/2025",  sc: "text-[#f97316]", bc: "border-[#f97316]/25 bg-[#f97316]/[0.06]" },
            { doc: "Background Check",    status: "Cleared",   exp: "Valid",         sc: "text-[#4dca80]", bc: "border-[#4dca80]/25 bg-[#4dca80]/[0.06]" },
            { doc: "Profile Photo",       status: "Pending",   exp: "Upload needed", sc: "text-white/40",  bc: "border-white/8 bg-white/[0.02]" },
          ].map((d, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 px-4 py-3 ${i < 3 ? "border-b border-white/[0.05]" : ""}`}>
              <div>
                <p className="text-[12px] font-semibold text-white/85">{d.doc}</p>
                <p className="text-[10px] text-white/40">{d.exp}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${d.bc} ${d.sc}`}>{d.status}</span>
            </div>
          ))}
        </div>
        <div className="rounded-[8px] border border-[#f97316]/25 bg-[#f97316]/[0.04] px-4 py-3">
          <p className="text-[10px] font-black uppercase text-[#f97316]/70">Action Needed</p>
          <p className="mt-1 text-[12px] text-white/60">Vehicle insurance expires in 47 days. Upload a renewal to avoid interruption.</p>
        </div>
      </div>
    ),
  },
  {
    step: 5,
    label: "Profile",
    title: "Your Account",
    body: "Profile is where you update your personal info, vehicle details, bank account for payouts, and notification preferences. Changes to your vehicle or bank info may require re-verification.",
    navIndex: 4,
    content: (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase text-white/40">Account Details</span>
          </div>
          {[
            { label: "Full Name",    val: "Jordan M." },
            { label: "Phone",        val: "+1 (555) 000-1234" },
            { label: "Email",        val: "jordan@example.com" },
            { label: "Vehicle",      val: "2020 Toyota Camry" },
            { label: "Payout Bank",  val: "•••• 4321 (Chase)" },
          ].map((f, i) => (
            <div key={i} className={`flex items-center justify-between gap-4 px-4 py-2.5 ${i < 4 ? "border-b border-white/[0.05]" : ""}`}>
              <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-white/40">{f.label}</span>
              <span className="text-[12px] font-semibold text-white/75">{f.val}</span>
            </div>
          ))}
        </div>
        <button className="w-full rounded-[8px] border border-[#6b8ee8]/30 bg-[#6b8ee8]/[0.06] py-2.5 text-[12px] font-bold text-[#6b8ee8]">
          Edit Profile
        </button>
      </div>
    ),
  },
  {
    step: 6,
    label: "Help",
    title: "Support Center",
    body: "Help gives you instant access to FAQs, live chat with a support agent, and the ability to report issues with specific orders. Available 24/7 — tap Support anytime during a delivery.",
    navIndex: 5,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "Chat", label: "Live Chat",      sub: "Avg. response < 2 min",  cls: "text-[#4dca80]" },
            { icon: "Phone", label: "Call Support",   sub: "Callback available",     cls: "text-[#f97316]" },
            { icon: "Checklist", label: "Report Issue",   sub: "Wrong order, accident",  cls: "text-white" },
            { icon: "Docs", label: "FAQ",            sub: "Common questions",       cls: "text-[#6b8ee8]" },
          ].map((s, i) => (
            <div key={i} className="rounded-[8px] border border-white/8 bg-black/20 px-4 py-3">
              <p className="text-[20px]">{s.icon}</p>
              <p className={`mt-1 text-[12px] font-bold ${s.cls}`}>{s.label}</p>
              <p className="text-[10px] text-white/40">{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[8px] border border-white/8 px-4 py-3">
          <p className="text-[10px] font-black uppercase text-white/40">Current Ticket</p>
          <p className="mt-1 text-[12px] font-semibold text-white/70">No open tickets</p>
        </div>
      </div>
    ),
  },
];

export default function DriverTutorialPreviewPage() {
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState<number | null>(null);
  const cur = SECTIONS[step];
  const isLast = step === SECTIONS.length - 1;

  return (
    <div className="food-app-shell min-h-screen overflow-x-hidden">
      <header className="food-app-nav sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex w-[min(1240px,calc(100%-24px))] items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316] md:inline-flex">
              Driver Portal Tutorial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-white/40 md:block">Step {step + 1} of {SECTIONS.length}</span>
            <Link href="/driver/login" className="ts-pill-btn ts-pill-btn-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[min(1060px,calc(100%-24px))] py-8 md:py-10">

        {/* Hero */}
        <div className="mb-8 text-center">
          <p className="food-kicker mb-2">Interactive Walkthrough</p>
          <h1 className="food-heading !text-[22px] sm:!text-[28px] md:!text-[36px] leading-none">
            Driver Portal <span className="text-[#f97316]">Tour</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[480px] text-[13px] leading-relaxed text-white/50">
            Step through every section of your driver dashboard before your first delivery.
          </p>

          {/* Step chips */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SECTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  minHeight: 32, padding: "7px 12px", borderRadius: 8,
                  border: i === step ? "1px solid rgba(249,115,22,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: i === step ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.03)",
                  color: i === step ? "#f97316" : i < step ? "#4dca80" : "rgba(255,255,255,0.4)",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                <span>{i < step ? "Done" : s.step}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 border-t border-white/8" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">

          {/* Portal frame */}
          <div className="food-panel overflow-hidden !p-0 !rounded-[12px]" style={{minHeight: 420}}>
            {/* Portal topbar */}
            <div className="flex items-center gap-2.5 border-b border-white/8 bg-black/40 px-4 py-2.5">
              <img src="/logo.png" alt="TrueServe" width={20} height={20} style={{ borderRadius: "999px", flexShrink: 0 }} />
              <span className="text-[11px] font-black text-white">True<span style={{ color: "#68c7cc" }}>Serve</span></span>
              <span className="text-white/20 text-xs">·</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Driver Portal</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4dca80]" />
                <span className="text-[10px] text-[#4dca80] font-semibold">Online</span>
              </div>
            </div>

            <div className="flex" style={{minHeight: 380}}>
              {/* Sidebar nav */}
              <div className="flex flex-col border-r border-white/8 bg-black/20 py-3" style={{width: 140, flexShrink: 0}}>
                {NAV_ITEMS.map((nav, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 14px",
                      borderLeft: i === step ? `2px solid ${nav.color}` : "2px solid transparent",
                      background: i === step ? "rgba(255,255,255,0.04)" : "transparent",
                      color: i === step ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize: 11, fontWeight: i === step ? 700 : 500,
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <span style={{fontSize: 14}}>{nav.icon}</span>
                    {nav.label}
                  </button>
                ))}
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-hidden p-4">
                <div className="mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#f97316]/60">
                    Step {cur.step} of {SECTIONS.length}
                  </p>
                  <h2 style={{fontSize: 17, fontWeight: 800, color: "#fff", marginTop: 2}}>{cur.label}</h2>
                </div>
                {cur.content}
              </div>
            </div>
          </div>

          {/* Sidebar panel */}
          <div className="flex flex-col gap-4">

            {/* Section detail */}
            <div className="food-panel flex flex-col gap-4 !rounded-[12px] !p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#f97316]/60">
                  ● {cur.label} · {cur.step}/{SECTIONS.length}
                </p>
                <h3 className="food-heading mt-1.5 !text-[18px] leading-tight">{cur.title}</h3>
                <p className="mt-3 text-[13px] leading-relaxed text-white/60">{cur.body}</p>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {SECTIONS.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setStep(i)}
                    style={{
                      height: 6, borderRadius: 999, cursor: "pointer",
                      width: i === step ? 24 : 12,
                      background: i === step ? "#f97316" : i < step ? "#4dca80" : "rgba(255,255,255,0.15)",
                      transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="ts-pill-btn ts-pill-btn-sm flex-1 disabled:opacity-30"
                >
                  ← Back
                </button>
                {isLast ? (
                  <Link href="/driver/login" className="ts-pill-btn ts-pill-btn-sm flex-1 text-center">
                    Done Done
                  </Link>
                ) : (
                  <button
                    onClick={() => setStep(s => Math.min(SECTIONS.length - 1, s + 1))}
                    className="ts-pill-btn ts-pill-btn-sm flex-1"
                    style={{ background: "rgba(249,115,22,0.15)", borderColor: "rgba(249,115,22,0.35)", color: "#f97316" }}
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>

            {/* Feedback */}
            <div className="food-panel !rounded-[12px] !p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#f97316]/60">Feedback</p>
              <h3 className="food-heading mt-1 !text-[16px] leading-tight">Was this helpful?</h3>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    style={{
                      flex: 1, height: 36, borderRadius: 8,
                      border: rating === n ? "1px solid rgba(249,115,22,0.6)" : "1px solid rgba(255,255,255,0.1)",
                      background: rating === n ? "#f97316" : "rgba(255,255,255,0.03)",
                      color: rating === n ? "#000" : "rgba(255,255,255,0.45)",
                      fontSize: 12, fontWeight: 800, cursor: "pointer",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {rating && (
                <button className="ts-pill-btn ts-pill-btn-sm mt-3 w-full">
                  Send Feedback
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
