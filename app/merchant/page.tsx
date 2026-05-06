"use client";

import Link from "next/link";
import { useState } from "react";
import FadeInSection from "@/components/FadeInSection";
import Logo from "@/components/Logo";
import { ArrowRight, BadgeDollarSign, CheckCircle2, Menu, ShieldCheck, Store, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const navItems = [
  { href: "/restaurants", label: "Order Food" },
  { href: "/about", label: "About" },
  { href: "/driver", label: "For Drivers" },
  { href: "/contact", label: "Contact" },
];

const merchantCards = [
  {
    icon: BadgeDollarSign,
    kicker: "Keep More",
    title: "Zero commission, flat monthly pricing",
    desc: "TrueServe stays out of the way of your margins so growth actually improves your economics.",
  },
  {
    icon: Store,
    kicker: "Stay In Control",
    title: "Storefront and ordering tools built around your brand",
    desc: "Launch a direct-order experience, sync menus, and guide customers back to your own channel.",
  },
  {
    icon: ShieldCheck,
    kicker: "Launch Cleanly",
    title: "Onboarding support without the usual platform friction",
    desc: "Integrations, compliance, menu setup, and rollout all move through one clearer path.",
  },
];

const merchantSteps = [
  {
    step: "01",
    title: "Apply as a founding partner",
    detail: "Share your restaurant details, team contact, and operating basics so we can review the fit quickly.",
  },
  {
    step: "02",
    title: "Set up your menu and storefront",
    detail: "Sync with Toast, Square, or Clover, connect direct-order tools, and get your branded surface ready.",
  },
  {
    step: "03",
    title: "Go live with a calmer ops flow",
    detail: "Orders, prep visibility, support, and delivery handoff all start from one simpler dashboard.",
  },
];

const merchantProof = [
  {
    label: "Partnership model",
    title: "Founding partner terms that feel direct",
    detail: "First 30 days free, a locked rate, and no surprise take-rate growth as volume increases.",
  },
  {
    label: "Operator support",
    title: "Built for the team actually running the store",
    detail: "Less marketplace noise, cleaner workflows, and tools that help staff move faster under pressure.",
  },
  {
    label: "Brand protection",
    title: "A delivery layer that strengthens your identity",
    detail: "Your restaurant stays front and center instead of being flattened into a generic marketplace listing.",
  },
];

const merchantLandingBenefits = [
  {
    icon: "✓",
    title: "Operator-first setup",
    detail: "Apply, connect your tools, and launch through one guided merchant path instead of scattered handoffs.",
  },
  {
    icon: "★",
    title: "Brand-led ordering",
    detail: "Keep your storefront, direct-order flow, and customer relationship closer to your own business.",
  },
  {
    icon: "→",
    title: "Cleaner daily ops",
    detail: "Move from onboarding into a calmer dashboard experience with fewer unnecessary platform layers.",
  },
];

const merchantLandingStats = [
  { value: "0%", label: "Commission on orders" },
  { value: "30", label: "Days free to start" },
  { value: "1", label: "Merchant path from launch to ops" },
  { value: "Locked", label: "Founding rate for life" },
];

export default function MerchantLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const revealTransition = shouldReduceMotion
    ? undefined
    : { duration: 0.56, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
        <div className="nav-links hidden md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex gap-2">
          <Link href="/merchant/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/merchant/signup" className="btn btn-gold">Apply</Link>
        </div>
        <button
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#111] border-b border-white/10 px-4 py-3 flex flex-col gap-1 z-40"
          >
            {[...navItems, { href: "/merchant/login", label: "Sign In" }, { href: "/merchant/signup", label: "Apply" }].map((item, index) => (
              <motion.div
                key={item.href}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.03 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="food-app-main">
        <section className="food-auth-grid merchant-landing-grid">
          <motion.section
            className="food-hero-card food-auth-hero merchant-landing-hero"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={revealTransition}
          >
            <video
              className="food-auth-video"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            >
              <source src="/brand/brand_merchant_hero.mp4" type="video/mp4" />
            </video>
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Founding Partner Program</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">
                  Grow the restaurant.
                  <span className="accent"> Keep the brand close.</span>
                </h1>
                <p className="food-subtitle !max-w-[560px]">
                  TrueServe gives restaurant partners a calmer launch path, direct-order tools, and a delivery model designed to protect margins instead of taxing growth.
                </p>
              </div>

              <ul className="food-auth-list">
                {merchantLandingBenefits.map((benefit) => (
                  <li key={benefit.title}>
                    <div className="food-auth-icon">{benefit.icon}</div>
                    <div>
                      <div className="font-extrabold">{benefit.title}</div>
                      <div className="text-sm text-white/65">{benefit.detail}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="food-auth-gallery merchant-landing-gallery">
                <div className="food-auth-thumb">
                  <img src="/brand/brand_merchant_thumb_kitchen.jpg" alt="Merchant portal preview" />
                </div>
                <div className="food-auth-thumb">
                  <img src="/brand/brand_merchant_thumb_storefront.jpg" alt="Storefront preview" />
                </div>
                <div className="food-auth-thumb">
                  <img src="/brand/brand_merchant_thumb_packaging.jpg" alt="Operations preview" />
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="food-panel food-auth-form merchant-landing-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.08 }}
          >
            <p className="food-kicker mb-3">Merchant onboarding</p>
            <h2 className="food-heading !text-[38px]">Apply with a clearer path.</h2>
            <p className="lead mt-2">
              The merchant side should feel structured from the first application step through launch and daily operations.
            </p>

            <div className="merchant-offer-banner">
              <p className="merchant-offer-label">Founding partner offer</p>
              <p className="merchant-offer-copy">First 30 days free, zero commission orders, and a rate locked for life.</p>
            </div>

            <div className="merchant-stat-grid">
              {merchantLandingStats.map((stat) => (
                <div key={stat.label} className="merchant-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="merchant-next-steps">
              <div className="merchant-next-steps-head">
                <CheckCircle2 size={18} />
                <span>What happens next</span>
              </div>
              <div className="merchant-next-step">
                <span className="merchant-next-step-number">01</span>
                <p>Submit your restaurant details and team contact information.</p>
              </div>
              <div className="merchant-next-step">
                <span className="merchant-next-step-number">02</span>
                <p>We review fit, coordinate setup, and help prepare your storefront and menu flow.</p>
              </div>
              <div className="merchant-next-step">
                <span className="merchant-next-step-number">03</span>
                <p>You launch into one merchant dashboard built to support daily operations, not just sign-up.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-7">
              <Link href="/merchant/signup" className="portal-btn-gold portal-btn-gold-block flex items-center justify-center gap-2">
                Apply As Founding Partner <ArrowRight size={16} />
              </Link>
              <Link href="/merchant/login" className="portal-btn-outline portal-btn-outline-block flex items-center justify-center">
                Merchant Login
              </Link>
            </div>

            <div className="food-auth-note">
              Already onboarded? <Link href="/merchant/login" className="text-[#f97316] font-bold">Sign in</Link>
            </div>
          </motion.section>
        </section>

        <FadeInSection className="mt-24">
          <div className="merchant-box-section">
            <div className="merchant-box-head">
              <div>
                <p className="food-kicker mb-3">Merchant Path</p>
                <h2 className="food-heading">
                  One cleaner set of boxes.
                  <span className="accent"> One clearer story.</span>
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-white/42 max-w-[360px]">
                This section now reads as one system: what merchants get, how launch works, and why the partnership is worth it.
              </p>
            </div>

            <div className="merchant-box-grid">
              <motion.div
                className="merchant-box merchant-box-feature"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={revealTransition}
              >
                <p className="merchant-box-label">Built Around Merchants</p>
                <h3 className="merchant-box-title">The platform should feel like a business partner.</h3>
                <p className="merchant-box-copy">
                  We are trying to reduce friction at the exact points where restaurant operators usually lose time, margin, or control.
                </p>
                <div className="merchant-box-list">
                  {merchantCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.title} className="merchant-box-list-item">
                        <div className="merchant-box-icon">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="merchant-box-item-kicker">{card.kicker}</p>
                          <h4 className="merchant-box-item-title">{card.title}</h4>
                          <p className="merchant-box-item-copy">{card.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                className="merchant-box merchant-box-offer"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.06 }}
              >
                <p className="merchant-box-label">Founding Partner Offer</p>
                <h3 className="merchant-box-title">Simple economics from day one.</h3>
                <div className="merchant-mini-stats">
                  {merchantLandingStats.map((stat) => (
                    <div key={stat.label} className="merchant-mini-stat">
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {merchantSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className="merchant-box merchant-box-step"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.1 + index * 0.05 }}
                >
                  <p className="merchant-box-number">{step.step}</p>
                  <h3 className="merchant-box-title">{step.title}</h3>
                  <p className="merchant-box-copy">{step.detail}</p>
                </motion.div>
              ))}

              {merchantProof.map((row, index) => (
                <motion.div
                  key={row.title}
                  className="merchant-box merchant-box-proof"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.24 + index * 0.05 }}
                >
                  <p className="merchant-box-label">{row.label}</p>
                  <h3 className="merchant-box-title">{row.title}</h3>
                  <p className="merchant-box-copy">{row.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection className="mt-24">
          <div className="home-closing-cta">
            <div className="text-center md:text-left">
              <p className="food-kicker mb-3">Ready To Partner?</p>
              <h2 className="food-heading !text-[34px] md:!text-[42px]">
                Bring your storefront over.
                <span className="accent"> We&apos;ll keep the path clear.</span>
              </h2>
              <p className="mt-3 max-w-[470px] text-sm text-white/52 leading-7">
                Apply today, lock the founding rate, and launch with a delivery layer that keeps more control with your team.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
              <Link href="/merchant/signup" className="portal-btn-gold portal-btn-gold-block flex items-center justify-center gap-2 whitespace-nowrap !text-base !py-4 !px-8">
                Apply Now <ArrowRight size={16} />
              </Link>
              <Link href="/merchant/login" className="text-sm font-bold text-white/50 hover:text-[#f97316] transition-colors">
                Already onboarded? Sign in
              </Link>
            </div>
          </div>
        </FadeInSection>

        <footer className="home-footer">
          <div className="home-footer-brand">
            <Logo size="md" />
            <p className="home-footer-copy">
              Merchant tools, direct-order support, and a calmer launch path for restaurants that want more control over delivery.
            </p>
          </div>
          <div className="home-footer-links">
            <div className="home-footer-nav">
              <Link href="/restaurants" className="hover:text-[#f97316] transition-colors">Order Food</Link>
              <Link href="/about" className="hover:text-[#f97316] transition-colors">About</Link>
              <Link href="/driver" className="hover:text-[#f97316] transition-colors">Drivers</Link>
              <Link href="/contact" className="hover:text-[#f97316] transition-colors">Contact</Link>
              <Link href="/merchant/login" className="hover:text-[#f97316] transition-colors">Sign In</Link>
            </div>
            <div className="home-footer-meta">
              <span>&copy; {new Date().getFullYear()} TrueServe</span>
              <div className="home-footer-legal">
                <Link href="/privacy" className="hover:text-[#f97316] transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-[#f97316] transition-colors">Terms</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
