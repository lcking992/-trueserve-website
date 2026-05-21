"use client";

import Link from "next/link";
import {
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Handshake,
  Network,
  ReceiptText,
  Store,
  Truck,
  UsersRound,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const SWITCH_CARDS = [
  { icon: ReceiptText, label: "Lower fees", detail: "Flat plans replace percentage-heavy marketplace math." },
  { icon: UsersRound, label: "Direct customers", detail: "Keep your brand and repeat buyers front and center." },
  { icon: Store, label: "Live visibility", detail: "Kitchen status and order updates live in one place." },
  { icon: Truck, label: "Cleaner handoff", detail: "Drivers see prep timing and pickup notes before arrival." },
];

const FEATURE_CARDS = [
  {
    icon: BadgeDollarSign,
    title: "Keep more of every order",
    desc: "TrueServe uses fair restaurant plans so operators do not lose margin to every ticket.",
  },
  {
    icon: BarChart3,
    title: "Live order control",
    desc: "Track prep timing, order status, driver handoff, and daily revenue from one dashboard.",
  },
  {
    icon: Handshake,
    title: "Founding partner support",
    desc: "Early restaurants get direct onboarding help, menu setup support, and a locked launch rate.",
  },
];

const TIMELINE = [
  { step: "01", title: "Apply online", desc: "Send your restaurant details and operating location. We review founding partners directly." },
  { step: "02", title: "Build your menu", desc: "Import your menu or start with a simple dashboard menu before adding photos." },
  { step: "03", title: "Start taking orders", desc: "Orders flow to your dashboard with driver status and customer updates connected." },
];

export default function MerchantLanding() {
  return (
    <div className="ts-fig ts-fig-merchant-page">
      <SiteHeader />

      <main>
        <section className="ts-fig-hero ts-fig-merchant-hero">
          <div className="ts-fig-container ts-fig-merchant-hero-inner">
            <div className="ts-fig-animate-up">
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Founding Partner Program
              </span>
              <h1>
                Grow your kitchen <span className="o">on fair terms,</span><span className="t">not marketplace drag.</span>
              </h1>
              <p className="ts-fig-hero-sub">
                Reach nearby customers, manage orders in real time, and build a direct local relationship
                without handing over the customer experience.
              </p>
              <div className="ts-fig-merchant-actions">
                <Link href="/merchant/signup" className="ts-fig-btn">Apply as Founding Partner</Link>
                <Link href="/pricing" className="ts-fig-link ts-fig-merchant-link">See Pricing</Link>
              </div>
            </div>

            <aside className="ts-fig-commission ts-fig-animate-up" aria-label="Commission comparison">
              <div className="ts-fig-commission-title">Commission comparison</div>
              <div className="ts-fig-commission-row bad">
                <div className="row-head"><span>Other platforms</span><span>30%</span></div>
                <div className="row-bar"><span style={{ width: "100%", animation: "figScaleIn 1.1s var(--fig-ease) both" }} /></div>
              </div>
              <div className="ts-fig-commission-row good">
                <div className="row-head"><span>TrueServe</span><span>15%</span></div>
                <div className="row-bar"><span style={{ width: "50%", animation: "figScaleIn 1.1s .25s var(--fig-ease) both" }} /></div>
              </div>
              <div className="ts-fig-commission-savings">
                <small>On $10,000/month in sales</small>
                <strong>You keep <span className="accent">$1,500 more</span> every month.</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="ts-fig-section">
          <div className="ts-fig-container">
            <span className="ts-fig-kicker">Choose your route</span>
            <h2>Local restaurants and multi-unit groups need different onboarding.</h2>
            <div className="ts-fig-merchant-routes">
              <article className="ts-fig-trust-card ts-fig-merchant-route">
                <div className="ts-fig-trust-icon"><Store size={22} /></div>
                <h3>Local Merchant Route</h3>
                <p>For single-location restaurants that want quick onboarding, menu setup help, and direct local orders.</p>
                <div className="ts-fig-merchant-field-preview" aria-hidden="true">
                  <span>Restaurant Name</span>
                  <span>Street Address</span>
                  <span>Contact Email</span>
                </div>
                <Link href="/merchant/signup" className="ts-fig-btn">Start Local Application</Link>
              </article>

              <article className="ts-fig-trust-card ts-fig-merchant-route teal">
                <div className="ts-fig-trust-icon"><Building2 size={22} /></div>
                <h3>Enterprise / Multi-Unit Route</h3>
                <p>For franchise groups, regional operators, and brands that need POS alignment and rollout planning.</p>
                <div className="ts-fig-merchant-enterprise-preview" aria-hidden="true">
                  <span><BriefcaseBusiness size={14} /> Corporate Name</span>
                  <span><Network size={14} /> Current POS Provider</span>
                  <span><UsersRound size={14} /> Number of Units</span>
                </div>
                <Link href="/contact?role=restaurant" className="ts-fig-btn ts-fig-btn-dark">Speak with Strategic Accounts</Link>
              </article>
            </div>
          </div>
        </section>

        <section className="ts-fig-section ts-fig-section-haze">
          <div className="ts-fig-container">
            <span className="ts-fig-kicker teal">Why restaurants switch</span>
            <h2>Less marketplace drag. More direct control.</h2>
            <div className="ts-fig-merchant-switch-grid">
              {SWITCH_CARDS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={item.label} className="ts-fig-trust-card ts-fig-merchant-switch-card" style={{ animationDelay: `${index * 90}ms` }}>
                    <div className="ts-fig-trust-icon"><Icon size={20} /></div>
                    <h3>{item.label}</h3>
                    <p>{item.detail}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ts-fig-section">
          <div className="ts-fig-container">
            <div className="ts-fig-trust ts-fig-merchant-feature-grid">
              {FEATURE_CARDS.map((card, index) => {
                const Icon = card.icon;
                return (
                  <article key={card.title} className="ts-fig-trust-card" style={{ animationDelay: `${index * 90}ms` }}>
                    <div className="ts-fig-trust-icon"><Icon size={20} /></div>
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ts-fig-section ts-fig-section-haze">
          <div className="ts-fig-container ts-fig-merchant-timeline-wrap">
            <span className="ts-fig-kicker">How it works</span>
            <h2>Up and running without a heavy rollout.</h2>
            <div className="ts-fig-merchant-timeline">
              {TIMELINE.map((item) => (
                <article key={item.step} className="ts-fig-merchant-timeline-item">
                  <span>{item.step}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="ts-fig-section ts-fig-merchant-final">
          <div className="ts-fig-container">
            <span className="ts-fig-kicker">Founding Partner Program</span>
            <h2>Limited launch spots available.</h2>
            <p>
              First 30 days free. Direct onboarding support. Menu setup guidance.
              A cleaner way to bring delivery demand to the restaurants people already love.
            </p>
            <Link href="/merchant/signup" className="ts-fig-btn">Apply as Founding Partner</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
