"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export default function MerchantLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const revealTransition = shouldReduceMotion
    ? undefined
    : { duration: 0.56, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="food-app-shell" style={{ minHeight: "100vh", background: "#09090c" }}>
      <nav className="food-app-nav">
        <Logo size="sm" />
        <div className="nav-links hidden md:flex">
          <Link href="/restaurants">Order Food</Link>
          <Link href="/about">About</Link>
          <Link href="/driver">For Drivers</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="hidden md:flex nav-r">
          <Link href="/merchant/login" className="btn btn-ghost">Sign In</Link>
        </div>
        <button className="md:hidden p-2 text-white/70 hover:text-white transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
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
            {[
              { href: "/restaurants", label: "Order Food" },
              { href: "/about", label: "About" },
              { href: "/driver", label: "For Drivers" },
              { href: "/contact", label: "Contact" },
              { href: "/merchant/login", label: "Sign In" },
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.03 }}
              >
                <Link href={item.href} onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="food-app-main">

        {/* ── FOUNDING PARTNER BADGE ── */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.04 }}
          style={{
          marginBottom: 24, padding: "12px 20px", borderRadius: 10, textAlign: "center",
          background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.25)",
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            🤝 <strong style={{ color: "#f97316" }}>Founding Partner Program —</strong>{" "}
            Join now for <strong style={{ color: "#fff" }}>30 days free</strong> and get your rate{" "}
            <strong style={{ color: "#fff" }}>locked forever.</strong>
          </p>
        </motion.div>

        {/* ── HERO ── */}
        <motion.section
          style={{ padding: "48px 0 40px", textAlign: "center" }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={revealTransition}
        >
          <motion.p className="food-kicker" style={{ marginBottom: 16, color: "#f97316" }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.08 }}
          >For Restaurant Partners</motion.p>
          <motion.h1 className="food-title" style={{ marginBottom: 20, maxWidth: 800, margin: "0 auto 20px" }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.14 }}
          >
            Grow your restaurant<br /><span className="accent">with TrueServe</span>
          </motion.h1>
          <motion.p className="food-subtitle" style={{ maxWidth: 560, margin: "0 auto 36px", textAlign: "center" }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.2 }}
          >
            Reach more local customers, manage orders in real time, and keep 100% of every dollar you earn — flat monthly rate, zero commission.
          </motion.p>
          <motion.div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.26 }}
          >
            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.18 }}>
            <Link href="/merchant/signup" className="portal-btn-gold portal-btn-gold-block" style={{ width: "auto", padding: "14px 32px", fontSize: 14 }}>
              Apply as Founding Partner →
            </Link>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* ── FEATURE CARDS ── */}
        <section className="grid gap-6 md:grid-cols-3" style={{ marginBottom: 56 }}>
          {[
            {
              icon: "💳",
              kicker: "Zero Commission",
              title: "Keep everything you earn",
              desc: "TrueServe charges a flat monthly fee — not a cut of every order. The more you sell, the more you keep.",
            },
            {
              icon: "📊",
              kicker: "Real-Time Control",
              title: "Live order dashboard",
              desc: "See every order the moment it comes in, track prep timing, monitor your driver, and view daily revenue — all in one place.",
            },
            {
              icon: "🔒",
              kicker: "Rate Lock Guarantee",
              title: "Your price, locked forever",
              desc: "Founding partners lock in today's rate permanently. Even as TrueServe grows and pricing increases, your rate never changes.",
            },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              className="food-card"
              style={{ padding: 28 }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.06 }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <p className="food-kicker" style={{ marginBottom: 8 }}>{card.kicker}</p>
              <h3 className="food-heading" style={{ fontSize: 26, marginBottom: 10 }}>{card.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.65)" }}>{card.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* ── HOW IT WORKS ── */}
        <motion.section
          className="food-panel"
          style={{ marginBottom: 56, padding: 40 }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={revealTransition}
        >
          <p className="food-kicker" style={{ marginBottom: 12 }}>How It Works</p>
          <h2 className="food-heading" style={{ marginBottom: 32 }}>Up and running <span className="accent">in minutes</span></h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { step: "01", title: "Apply online",    desc: "Fill out a quick form with your restaurant info. We review and approve within 24 hours." },
              { step: "02", title: "Build your menu", desc: "Sync with Toast, Square, or Clover — or use our AI menu scanner to import your menu in seconds." },
              { step: "03", title: "Start earning",   desc: "Orders flow directly to your dashboard. Drivers are dispatched automatically. You get paid next day." },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                style={{ display: "flex", gap: 16 }}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.06 }}
              >
                <div style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 40, lineHeight: 1, color: "rgba(249,115,22,0.25)", flexShrink: 0, minWidth: 48 }}>{item.step}</div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: 20, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", marginBottom: 6 }}>{item.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.6)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── FOUNDING PARTNER CTA ── */}
        <motion.section
          style={{ textAlign: "center", padding: "40px 0 64px" }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={revealTransition}
        >
          <p className="food-kicker" style={{ marginBottom: 10, color: "#f97316" }}>Founding Partner Program</p>
          <h2 className="food-heading" style={{ marginBottom: 12 }}>Limited spots available.</h2>
          <p className="food-subtitle" style={{ maxWidth: 460, margin: "0 auto 10px" }}>
            First 30 days free. Rate locked for life. Direct line to our team during onboarding.
          </p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 28 }}>Month-to-month · Cancel with 30 days notice</p>
          <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.18 }}>
            <Link href="/merchant/signup" className="portal-btn-gold portal-btn-gold-block" style={{ width: "auto", display: "inline-flex", padding: "16px 40px", fontSize: 15 }}>
              Apply as Founding Partner →
            </Link>
          </motion.div>
        </motion.section>

        <footer className="mt-4 border-t border-white/5 px-2 pt-8 pb-10 text-center">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
            <Logo size="md" />
            <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="hover:text-[#f97316] transition-colors">About</Link>
              <Link href="/driver" className="hover:text-[#f97316] transition-colors">For Drivers</Link>
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
