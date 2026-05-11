"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

const NAV_ITEMS = [
  { label: "Dashboard",    icon: "Analytics", color: "#f97316" },
  { label: "Compliance",   icon: "Done", color: "#4dca80" },
  { label: "Integrations", icon: "Link", color: "#6b8ee8" },
  { label: "Storefront",   icon: "Store", color: "#f97316" },
  { label: "Franchise",    icon: "Restaurant", color: "#4dca80" },
];

const SECTIONS = [
  {
    step: 1,
    label: "Dashboard",
    title: "Your Command Center",
    body: "The Dashboard gives you a live snapshot of today's orders, revenue, and active delivery statuses. Approve pending orders, see which drivers are on route, and monitor your storefront uptime — all from one screen.",
    navIndex: 0,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Today's Orders",  val: "24",     cls: "text-white" },
            { label: "Revenue",         val: "$842",   cls: "text-[#f97316]" },
            { label: "Active Drivers",  val: "3",      cls: "text-[#4dca80]" },
            { label: "Avg. Prep Time",  val: "18 min", cls: "text-white" },
          ].map(s => (
            <div key={s.label} className="rounded-[8px] border border-white/8 bg-black/30 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase text-white/35">{s.label}</p>
              <p className={`mt-1.5 text-[17px] font-black leading-none ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase text-white/40">Live Orders</span>
          </div>
          {[
            { id: "#1042", items: "Burger + Fries × 2",  status: "Preparing",  sc: "text-[#f97316]" },
            { id: "#1041", items: "Chicken Wrap × 1",    status: "Ready",      sc: "text-[#4dca80]" },
            { id: "#1040", items: "Salad Bowl × 3",      status: "En Route",   sc: "text-[#6b8ee8]" },
          ].map((o, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 px-4 py-2.5 ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
              <div>
                <p className="text-[12px] font-semibold text-white/85">{o.id}</p>
                <p className="text-[10px] text-white/45">{o.items}</p>
              </div>
              <span className={`text-[10px] font-bold ${o.sc}`}>{o.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 2,
    label: "Compliance",
    title: "Stay Approved",
    body: "Compliance tracks your health inspection grade, business license, and approval status. Keeping documents current ensures your storefront stays live. TrueServe flags anything expiring so you can renew before orders are paused.",
    navIndex: 1,
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Health Grade",     val: "A",        cls: "text-[#4dca80]" },
            { label: "Portal Status",    val: "Approved", cls: "text-[#4dca80]" },
          ].map(s => (
            <div key={s.label} className="rounded-[8px] border border-[#4dca80]/20 bg-[#4dca80]/[0.04] px-4 py-3 text-center">
              <p className="text-[10px] font-black uppercase text-white/35">{s.label}</p>
              <p className={`mt-1 text-[20px] font-black ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase text-white/40">Documents</span>
          </div>
          {[
            { doc: "Health Inspection",  status: "Verified", exp: "Valid through 03/2026", sc: "text-[#4dca80]", bc: "border-[#4dca80]/20 bg-[#4dca80]/[0.05]" },
            { doc: "Business License",   status: "Verified", exp: "Exp: 12/2025",          sc: "text-[#4dca80]", bc: "border-[#4dca80]/20 bg-[#4dca80]/[0.05]" },
            { doc: "Food Handler Cert.", status: "Expiring", exp: "Renew in 30 days",       sc: "text-[#f97316]", bc: "border-[#f97316]/25 bg-[#f97316]/[0.05]" },
          ].map((d, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 px-4 py-3 ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
              <div>
                <p className="text-[12px] font-semibold text-white/85">{d.doc}</p>
                <p className="text-[10px] text-white/40">{d.exp}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${d.bc} ${d.sc}`}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 3,
    label: "Integrations",
    title: "Connect Your POS",
    body: "Integrations is where you link your POS system (Toast, Square, etc.) so orders flow directly into your kitchen. Enter your API credentials, run a connection test, and your menu syncs automatically.",
    navIndex: 2,
    content: (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[8px] border border-[#6b8ee8]/30 bg-[#6b8ee8]/[0.04]">
          <div className="border-b border-white/8 px-4 py-2.5">
            <p className="text-[10px] font-black uppercase text-white/40">POS Integration</p>
          </div>
          {[
            { label: "Provider",       val: "Toast POS" },
            { label: "Client ID",      val: "client_id_••••" },
            { label: "Client Secret",  val: "••••••••••••" },
            { label: "Location",       val: "Main St Location" },
          ].map((f, i) => (
            <div key={i} className={`flex items-center justify-between gap-4 px-4 py-2.5 ${i < 3 ? "border-b border-white/[0.05]" : ""}`}>
              <span className="text-[10px] font-bold uppercase text-white/40">{f.label}</span>
              <span className="text-[12px] font-semibold text-white/75">{f.val}</span>
            </div>
          ))}
          <div className="flex gap-2 border-t border-white/8 px-4 py-3">
            <button className="flex-1 rounded-[8px] border border-[#6b8ee8]/30 bg-[#6b8ee8]/[0.08] py-2 text-[11px] font-bold text-[#6b8ee8]">
              Test Connection
            </button>
            <button className="flex-1 rounded-[8px] border border-white/10 bg-white/[0.03] py-2 text-[11px] font-bold text-white/60">
              Sync Menu
            </button>
          </div>
        </div>
        <div className="rounded-[8px] border border-[#4dca80]/25 bg-[#4dca80]/[0.05] px-4 py-3">
          <p className="text-[10px] font-semibold text-[#4dca80]">● Connected — menu sync and order ingestion active</p>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    label: "Storefront",
    title: "Your Public Page",
    body: "Storefront controls what customers see when they browse TrueServe — your banner image, restaurant description, hours, and menu categories. You can also grab your embeddable order widget to add to your own website.",
    navIndex: 3,
    content: (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="relative h-20 w-full overflow-hidden rounded-t-[8px] bg-gradient-to-r from-[#1a0a00] to-[#2a1200]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Banner Image</span>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-[14px] font-black text-white">Burger Palace</p>
            <p className="text-[11px] text-white/50">American · Fast Casual · 0.4 mi</p>
            <div className="mt-2 flex gap-3 text-[10px] text-white/40">
              <span>★ 4.7 (212)</span>
              <span>15–25 min</span>
              <span>$2.99 delivery</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-[8px] border border-[#f97316]/30 bg-[#f97316]/[0.06] py-2.5 text-[11px] font-bold text-[#f97316]">
            Edit Banner
          </button>
          <button className="rounded-[8px] border border-white/10 bg-white/[0.03] py-2.5 text-[11px] font-bold text-white/60">
            Copy Embed
          </button>
        </div>
      </div>
    ),
  },
  {
    step: 5,
    label: "Franchise",
    title: "Multiple Locations",
    body: "If you operate more than one location, Franchise lets you manage all of them from a single account. Switch between locations, set per-location hours and menus, and see consolidated revenue across the portfolio.",
    navIndex: 4,
    content: (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-[8px] border border-white/8">
          <div className="border-b border-white/8 px-4 py-2.5">
            <span className="text-[10px] font-black uppercase text-white/40">Locations (3)</span>
          </div>
          {[
            { name: "Burger Palace – Main St",    status: "Active",   orders: "24 today" },
            { name: "Burger Palace – Oak Ave",    status: "Active",   orders: "18 today" },
            { name: "Burger Palace – Pine Plaza", status: "Inactive", orders: "Closed"   },
          ].map((l, i) => (
            <div key={i} className={`flex items-center justify-between gap-3 px-4 py-3 ${i < 2 ? "border-b border-white/[0.05]" : ""}`}>
              <div>
                <p className="text-[12px] font-semibold text-white/85">{l.name}</p>
                <p className="text-[10px] text-white/40">{l.orders}</p>
              </div>
              <span className={`text-[10px] font-bold ${l.status === "Active" ? "text-[#4dca80]" : "text-white/30"}`}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
        <button className="w-full rounded-[8px] border border-[#4dca80]/30 bg-[#4dca80]/[0.06] py-2.5 text-[11px] font-bold text-[#4dca80]">
          + Add Location
        </button>
      </div>
    ),
  },
];

export default function MerchantTutorialPreviewPage() {
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
              Merchant Portal Tutorial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-white/40 md:block">Step {step + 1} of {SECTIONS.length}</span>
            <Link href="/merchant/login" className="ts-pill-btn ts-pill-btn-sm">
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
            Merchant Portal <span className="text-[#f97316]">Tour</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[480px] text-[13px] leading-relaxed text-white/50">
            Explore every section of your merchant dashboard before going live.
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
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Merchant Portal</span>
              <div className="ml-auto">
                <span className="text-[10px] font-bold text-white/50">Burger Palace</span>
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
                  <Link href="/merchant/login" className="ts-pill-btn ts-pill-btn-sm flex-1 text-center">
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
