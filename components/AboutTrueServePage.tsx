"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import FadeInSection from "@/components/FadeInSection";
import { ArrowRight, Car, Menu, MessageCircleHeart, Store, UsersRound, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const navItems = [
  { href: "/restaurants", label: "Order Food" },
  { href: "/about", label: "About" },
  { href: "/merchant/signup", label: "For Merchants" },
  { href: "/driver/signup", label: "For Drivers" },
  { href: "/contact", label: "Contact" },
];

const storyRows = [
  {
    kicker: "Why we exist",
    title: "Delivery should feel closer to the people behind it.",
    body:
      "TrueServe is built to keep ordering more direct, more transparent, and more useful for the restaurants, drivers, and customers who actually make every order happen.",
  },
  {
    kicker: "What we believe",
    title: "Local restaurants deserve tools that strengthen their brand.",
    body:
      "We focus on cleaner ordering, direct-order support, clearer merchant onboarding, and support that feels human instead of distant.",
  },
  {
    kicker: "How we stay different",
    title: "We build for trust, not marketplace noise.",
    body:
      "That means easier repeat ordering for customers, better launch tools for merchants, and a more guided delivery flow for drivers from day one.",
  },
];

const sideRows = [
  {
    icon: UsersRound,
    title: "For customers",
    text: "Saved details, cleaner checkout, and order updates that stay simple to follow.",
  },
  {
    icon: Store,
    title: "For merchants",
    text: "Storefront tools, onboarding guidance, and a platform that helps restaurants keep more control.",
  },
  {
    icon: Car,
    title: "For drivers",
    text: "Clear onboarding, transparent pay expectations, and better visibility into what happens next.",
  },
];

const values = [
  {
    title: "Transparent by default",
    text: "We keep pricing, support, and order flow easier to understand from first click to final delivery.",
  },
  {
    title: "Merchant-first where it matters",
    text: "Our tools help restaurants launch, share, and manage their storefronts instead of just getting listed.",
  },
  {
    title: "Support that feels local",
    text: "When something goes wrong, we want the experience to feel guided and responsive — not anonymous.",
  },
];

export default function AboutTrueServePage() {
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
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/signup" className="btn btn-gold">Get Started</Link>
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
            {[...navItems, { href: "/login", label: "Sign In" }].map((item, index) => (
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
        <section className="food-hero-card overflow-hidden">
          <motion.div
            className="home-bg-img"
            style={{ backgroundImage: "url('/merchant_hero.png')" }}
            initial={shouldReduceMotion ? false : { scale: 1.06, opacity: 0.72 }}
            animate={shouldReduceMotion ? undefined : { scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? undefined : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="home-bg-grad" />
          <div className="food-hero-content">
            <motion.div
              className="space-y-6"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={revealTransition}
            >
              <div className="space-y-3">
                <motion.p
                  className="food-kicker"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.06 }}
                >
                  About TrueServe
                </motion.p>
                <motion.h1
                  className="food-title"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.12 }}
                >
                  Built to keep delivery
                  <br />
                  <span className="accent">closer to local.</span>
                </motion.h1>
                <motion.p
                  className="food-subtitle"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.18 }}
                >
                  We&rsquo;re building a cleaner delivery network that helps customers order with confidence, gives merchants more control, and keeps support closer when it matters most.
                </motion.p>
              </div>

              <div className="food-chip-row">
                {["Local-first", "Merchant-minded", "Built for trust"].map((chip, index) => (
                  <motion.div
                    key={chip}
                    className="food-chip"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.24 + index * 0.05 }}
                    whileHover={shouldReduceMotion ? undefined : { y: -2, borderColor: "rgba(249,115,22,0.36)" }}
                  >
                    <span className="food-chip-dot" />
                    {chip}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="food-panel food-hero-right flex-col gap-5"
              initial={shouldReduceMotion ? false : { opacity: 0, x: 22 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.14 }}
            >
              <div className="space-y-4">
                <p className="food-kicker">What guides us</p>
                <h2 className="food-heading">
                  Practical products.
                  <span className="accent"> Human support.</span>
                </h2>
                <p className="food-subtitle !text-sm !max-w-none">
                  TrueServe is meant to feel direct and dependable, not bloated. We want each page, signup flow, and support touchpoint to feel like part of one clear experience.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} className="food-stat">
                  <strong>Cleaner</strong>
                  <span>Simpler flows from signup to checkout</span>
                </motion.div>
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} className="food-stat">
                  <strong>Closer</strong>
                  <span>Local support for customers and partners</span>
                </motion.div>
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} className="food-stat">
                  <strong>Stronger</strong>
                  <span>Merchant tools that help launch and grow</span>
                </motion.div>
                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} className="food-stat">
                  <strong>Guided</strong>
                  <span>Clear next steps for every role on the platform</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <FadeInSection className="mt-24">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="food-kicker mb-3">The TrueServe way</p>
              <h2 className="food-heading !text-[36px] md:!text-[52px]">
                A better delivery experience
                <br className="hidden md:block" /> starts with <span className="accent">clear priorities.</span>
              </h2>
            </div>
            <p className="text-white/40 text-sm max-w-[280px] leading-relaxed">
              We stay focused on what makes the product easier to trust and easier to use.
            </p>
          </div>

          <div className="border-t border-white/[0.07]">
            {storyRows.map((row, index) => (
              <motion.div
                key={row.title}
                className="grid gap-4 md:grid-cols-[180px_1fr_360px] py-10 border-b border-white/[0.07] items-start"
                initial={shouldReduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.04 }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/28 pt-1">{row.kicker}</p>
                <h3 className="text-[26px] md:text-[32px] leading-tight font-black text-white">{row.title}</h3>
                <p className="text-[14px] leading-relaxed text-white/45">{row.body}</p>
              </motion.div>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection className="mt-24">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="food-kicker mb-3">Built around people</p>
              <h2 className="food-heading !text-[36px] md:!text-[52px]">
                One platform.
                <span className="accent"> Three perspectives.</span>
              </h2>
            </div>
            <p className="text-white/40 text-sm max-w-[280px] leading-relaxed">
              Customers, merchants, and drivers each need a flow that feels intentional instead of stitched together.
            </p>
          </div>

          <div className="border-t border-white/[0.07]">
            {sideRows.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                className="grid gap-5 md:grid-cols-[72px_1fr_360px] py-10 border-b border-white/[0.07] items-center"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.05 }}
              >
                <motion.div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl border border-[#f97316]/20 bg-[#f97316]/8 text-[#f97316]"
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.04, y: -2 }}
                >
                  <Icon size={24} />
                </motion.div>
                <h3 className="text-[24px] md:text-[28px] font-black text-white">{title}</h3>
                <p className="text-[14px] leading-relaxed text-white/45">{text}</p>
              </motion.div>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection className="mt-24">
          <div className="food-panel">
            <div className="mb-10">
              <p className="food-kicker mb-3">What we keep protecting</p>
              <h2 className="food-heading !text-[34px] md:!text-[44px]">
                The product should feel <span className="accent">consistent</span> everywhere.
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="rounded-[26px] border border-white/[0.08] bg-white/[0.02] p-6"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -3, borderColor: "rgba(249,115,22,0.22)" }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.05 }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-[#f97316]">
                    <MessageCircleHeart size={18} />
                  </div>
                  <h3 className="text-[21px] font-black text-white mb-3 leading-tight">{value.title}</h3>
                  <p className="text-[14px] leading-relaxed text-white/45">{value.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInSection>

        <FadeInSection className="mt-24">
          <section
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 50%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(249,115,22,0.2)",
              borderRadius: 30,
              padding: "56px 42px",
            }}
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-[560px]">
                <p className="food-kicker mb-4">Move with us</p>
                <h2 className="food-heading !text-[34px] md:!text-[44px] mb-4">
                  Pick the path that fits
                  <span className="accent"> how you use TrueServe.</span>
                </h2>
                <p className="text-white/55 text-base leading-relaxed">
                  Whether you&rsquo;re ordering tonight, onboarding your restaurant, or getting ready to drive, we&rsquo;ve kept the next step simple.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                <Link href="/signup" className="portal-btn-gold portal-btn-gold-block flex items-center justify-center gap-2 whitespace-nowrap !text-base !py-4 !px-8">
                  Create Account <ArrowRight size={16} />
                </Link>
                <Link href="/merchant/signup" className="portal-btn-outline portal-btn-outline-block flex items-center justify-center gap-2 whitespace-nowrap !text-base !py-4 !px-8">
                  Partner With TrueServe
                </Link>
              </div>
            </div>
          </section>
        </FadeInSection>
      </main>

      <footer className="mt-20 border-t border-white/5 px-2 pt-14 pb-16 text-center">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6">
          <Logo size="md" />
          <div className="flex items-center justify-center gap-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex-wrap">
            <Link href="/about" className="hover:text-[#f97316] transition-colors">About</Link>
            <Link href="/merchant/signup" className="hover:text-[#f97316] transition-colors">Merchants</Link>
            <Link href="/driver/signup" className="hover:text-[#f97316] transition-colors">Drivers</Link>
            <Link href="/contact" className="hover:text-[#f97316] transition-colors">Contact</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
            © {new Date().getFullYear()} TrueServe · Built for local restaurants, drivers, and the customers who back them.
          </p>
        </div>
      </footer>
    </div>
  );
}
