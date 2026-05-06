"use client";

import Link from "next/link";
import { useState } from "react";
import FadeInSection from "@/components/FadeInSection";
import Logo from "@/components/Logo";
import { ArrowRight, Car, CheckCircle2, CreditCard, MapPinned, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const navItems = [
  { href: "/restaurants", label: "Order Food" },
  { href: "/about", label: "About" },
  { href: "/merchant", label: "For Merchants" },
  { href: "/contact", label: "Contact" },
];

const driverCards = [
  {
    icon: Car,
    kicker: "Flexibility",
    title: "Drive on your own rhythm",
    desc: "Go online when it works for you, keep the workday cleaner, and avoid rigid shift expectations.",
  },
  {
    icon: CreditCard,
    kicker: "Payouts",
    title: "Track earnings and move money faster",
    desc: "See what you are making, connect Stripe, and keep the payout flow easier to understand.",
  },
  {
    icon: MapPinned,
    kicker: "Dispatch",
    title: "Smarter routing with less wasted motion",
    desc: "Route visibility, live order context, and clearer trip density help the day feel more predictable.",
  },
];

const driverSteps = [
  {
    step: "01",
    title: "Create your driver profile",
    detail: "Share your core details, vehicle information, and availability basics to start the application.",
  },
  {
    step: "02",
    title: "Upload compliance documents",
    detail: "Submit license, insurance, and registration so approval can move through one operational checklist.",
  },
  {
    step: "03",
    title: "Unlock dashboard access",
    detail: "Once approved, you move straight into the driver portal for routes, payouts, compliance, and support.",
  },
];

const driverRequirements = [
  {
    label: "Eligibility",
    title: "Basic requirements stay straightforward",
    detail: "Be at least 18, carry a valid license, and have a vehicle type that fits the orders you want to accept.",
  },
  {
    label: "Compliance",
    title: "Documents are part of the real workflow, not an afterthought",
    detail: "TrueServe bakes document collection and verification into the application instead of bolting it on later.",
  },
  {
    label: "Support",
    title: "The driver side should feel guided from day one",
    detail: "Payout setup, route context, disputes, and compliance all live in the same portal once you are inside.",
  },
];

const driverLandingBenefits = [
  {
    icon: "✓",
    title: "Guided application path",
    detail: "Move from profile setup to document review through one clearer driver workflow.",
  },
  {
    icon: "★",
    title: "Connected payouts",
    detail: "Keep earnings, Stripe setup, and payout readiness inside the same onboarding experience.",
  },
  {
    icon: "→",
    title: "Less operational noise",
    detail: "Routes, compliance, and support are meant to feel readable from day one, not stitched together later.",
  },
];

const driverLandingStats = [
  { value: "1", label: "Portal for routes, payouts, and compliance" },
  { value: "3", label: "Core steps from apply to access" },
  { value: "24/7", label: "Route and support visibility" },
  { value: "Live", label: "Status updates across the full driver flow" },
];

export default function DriverLanding() {
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
          <Link href="/driver/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/driver/signup" className="btn btn-gold">Apply</Link>
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
            {[...navItems, { href: "/driver/login", label: "Sign In" }, { href: "/driver/signup", label: "Apply" }].map((item, index) => (
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
            <div
              className="food-auth-image"
              style={{ backgroundImage: "url('/brand/brand_driver_hero.jpg')" }}
            />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Driver onboarding</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">
                  Deliver with more clarity.
                  <span className="accent"> Keep the road simple.</span>
                </h1>
                <p className="food-subtitle !max-w-[560px]">
                  TrueServe is building a driver path that feels more direct from application through payout: cleaner compliance, smarter routing, and better visibility into what happens next.
                </p>
              </div>

              <ul className="food-auth-list">
                {driverLandingBenefits.map((benefit) => (
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
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label="Driver application preview"
                  >
                    <source src="/brand/brand_driver_thumb_car.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="food-auth-thumb">
                  <img src="/brand/brand_driver_thumb_pickup.jpg" alt="Driver workflow preview" />
                </div>
                <div className="food-auth-thumb">
                  <img src="/brand/brand_driver_thumb_team.jpg" alt="Driver fleet preview" />
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            className="food-panel food-auth-form driver-landing-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.08 }}
          >
            <p className="food-kicker mb-3">Driver application</p>
            <h2 className="food-heading !text-[38px]">Start with a clearer route.</h2>
            <p className="lead mt-2">
              The driver side should feel dependable from profile setup through payouts, compliance, and route readiness.
            </p>

            <div className="driver-offer-banner">
              <p className="driver-offer-label">Driver path</p>
              <p className="driver-offer-copy">Flexible scheduling, Stripe-connected payouts, and compliance built directly into the onboarding flow.</p>
            </div>

            <div className="driver-stat-grid">
              {driverLandingStats.map((stat) => (
                <div key={stat.label} className="driver-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="driver-next-steps">
              <div className="driver-next-steps-head">
                <CheckCircle2 size={18} />
                <span>What happens next</span>
              </div>
              <div className="driver-next-step">
                <span className="driver-next-step-number">01</span>
                <p>Create your profile and share vehicle and availability basics.</p>
              </div>
              <div className="driver-next-step">
                <span className="driver-next-step-number">02</span>
                <p>Upload license, insurance, and registration so approval can move through one checklist.</p>
              </div>
              <div className="driver-next-step">
                <span className="driver-next-step-number">03</span>
                <p>Once approved, you move straight into a driver portal built for routes, payouts, and support.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-7">
              <Link href="/driver/signup" className="portal-btn-gold portal-btn-gold-block flex items-center justify-center gap-2">
                Apply To Drive <ArrowRight size={16} />
              </Link>
              <Link href="/driver/login" className="portal-btn-outline portal-btn-outline-block flex items-center justify-center">
                Driver Login
              </Link>
            </div>

            <div className="food-auth-note">
              Already approved? <Link href="/driver/login" className="text-[#f97316] font-bold">Sign in</Link>
            </div>
          </motion.section>
        </section>

        <FadeInSection className="mt-24">
          <div className="food-section-head">
            <div>
              <p className="food-kicker mb-3">Built For Drivers</p>
              <h2 className="food-heading">
                The work should feel guided,
                <span className="accent"> not noisy.</span>
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-white/40 max-w-[300px]">
              The best driver experience is not flashy. It is predictable, readable, and honest about what the next step is.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {driverCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  className="food-card"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.06 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f97316]/20 bg-[#f97316]/10 text-[#f97316]">
                    <Icon size={18} />
                  </div>
                  <p className="food-kicker mb-3">{card.kicker}</p>
                  <h3 className="food-heading !text-[28px] mb-3">{card.title}</h3>
                  <p className="text-sm leading-7 text-white/55">{card.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </FadeInSection>

        <FadeInSection className="mt-24">
          <div className="food-panel">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="food-kicker mb-3">Application Flow</p>
                <h2 className="food-heading">
                  Three steps to get from
                  <span className="accent"> profile to portal.</span>
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-white/42 max-w-[320px]">
                We want onboarding to feel like one real product path, not a chain of disconnected forms.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {driverSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  className="rounded-[24px] border border-white/8 bg-white/[0.03] p-6"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.08 + index * 0.06 }}
                >
                  <p className="mb-4 font-black text-[11px] tracking-[0.18em] uppercase text-white/28">{step.step}</p>
                  <h3 className="text-[22px] font-black leading-tight text-white mb-3">{step.title}</h3>
                  <p className="text-sm leading-7 text-white/52">{step.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection className="mt-24">
          <div className="border-t border-white/[0.07]">
            {driverRequirements.map((row, index) => (
              <motion.div
                key={row.title}
                className="grid gap-4 py-10 border-b border-white/[0.07] md:grid-cols-[180px_1fr_360px] items-start"
                initial={shouldReduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.05 }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/28 pt-1">{row.label}</p>
                <h3 className="text-[26px] md:text-[32px] leading-tight font-black text-white">{row.title}</h3>
                <p className="text-sm leading-7 text-white/45">{row.detail}</p>
              </motion.div>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection className="mt-24">
          <div className="home-closing-cta">
            <div className="text-center md:text-left">
              <p className="food-kicker mb-3">Ready To Drive?</p>
              <h2 className="food-heading !text-[34px] md:!text-[42px]">
                Join the fleet.
                <span className="accent"> We&apos;ll keep the next step clear.</span>
              </h2>
              <p className="mt-3 max-w-[470px] text-sm text-white/52 leading-7">
                Apply in minutes, upload the required documents, and move into a driver dashboard that keeps routes, compliance, and support in one place.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto">
              <Link href="/driver/signup" className="portal-btn-gold portal-btn-gold-block flex items-center justify-center gap-2 whitespace-nowrap !text-base !py-4 !px-8">
                Start Application <ArrowRight size={16} />
              </Link>
              <Link href="/driver/login" className="text-sm font-bold text-white/50 hover:text-[#f97316] transition-colors">
                Already approved? Sign in
              </Link>
            </div>
          </div>
        </FadeInSection>

        <footer className="home-footer">
          <div className="home-footer-brand">
            <Logo size="md" />
            <p className="home-footer-copy">
              Driver onboarding, payout readiness, and route visibility built to feel more direct from day one.
            </p>
          </div>
          <div className="home-footer-links">
            <div className="home-footer-nav">
              <Link href="/restaurants" className="hover:text-[#f97316] transition-colors">Order Food</Link>
              <Link href="/merchant" className="hover:text-[#f97316] transition-colors">Merchants</Link>
              <Link href="/about" className="hover:text-[#f97316] transition-colors">About</Link>
              <Link href="/contact" className="hover:text-[#f97316] transition-colors">Contact</Link>
              <Link href="/driver/login" className="hover:text-[#f97316] transition-colors">Sign In</Link>
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
