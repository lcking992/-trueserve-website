"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CarFront, Clock, MapPin, Menu, Navigation, Route, Share2, ShoppingBag, Star, Store, UtensilsCrossed, X, Zap } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useInView, animate, useMotionValue } from "motion/react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import Logo from "@/components/Logo";
import LandingSearch from "@/components/LandingSearch";
import { createClient } from "@/lib/supabase/client";
import {
  getLiveRestaurants,
  summarizeRestaurantNetwork,
} from "@/lib/public-restaurants";
import { getAccountHomeHref } from "@/lib/account-routing";

const HERO_FALLBACK_VISUALS = [
  {
    title: "Late-night comfort",
    detail: "Curated local kitchens",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
  },
  {
    title: "Fresh and fast",
    detail: "Built for direct ordering",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80",
  },
  {
    title: "Delivered local",
    detail: "Real restaurants, real routes",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  },
];

const HERO_WORDS = ["craving", "ordering", "eating", "feeling"];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setIndex(i => (i + 1) % HERO_WORDS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const word = HERO_WORDS[index];

  // On SSR / before hydration, render static to avoid mismatch
  if (!mounted) {
    return <span className="accent">{HERO_WORDS[0]}</span>;
  }

  return (
    <motion.span layout className="inline-block" style={{ position: "relative" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="accent"
          style={{ display: "inline-block" }}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, filter: "blur(8px)" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function AnimatedCounter({ from = 0, to, prefix = "", suffix = "", duration = 1.4 }: {
  from?: number; to: number; prefix?: string; suffix?: string; duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const motionVal = useMotionValue(from);
  const [display, setDisplay] = useState(prefix + String(from) + suffix);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (shouldReduceMotion) { setDisplay(prefix + String(to) + suffix); return; }
    const controls = animate(motionVal, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(prefix + Math.round(v).toString() + suffix),
    });
    return controls.stop;
  }, [isInView, shouldReduceMotion]);

  return <span ref={ref}>{display}</span>;
}

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const [userId, setUserId] = useState<string | null>(null);
  const [accountHref, setAccountHref] = useState("/account");
  const [networkStats, setNetworkStats] = useState({
    totalRestaurants: 0,
    verifiedCount: 0,
    markets: 0,
    averageRating: null as number | null,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const socialLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/trueserve_delivery/",
      icon: InstagramIcon,
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/share/1EHeS1jdoq/?mibextid=wwXIfr",
      icon: FacebookIcon,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/112360123/admin/dashboard/",
      icon: Share2,
    },
  ];
  const howItWorks = [
    {
      step: "01",
      title: "Drop your address",
      detail: "Start with your delivery location so we can match you to active restaurant partners and the right delivery zone.",
      icon: MapPin,
    },
    {
      step: "02",
      title: "Order direct with confidence",
      detail: "Move from search to checkout with transparent pricing, saved details, and a cleaner repeat-order flow.",
      icon: ShoppingBag,
    },
    {
      step: "03",
      title: "Track every handoff",
      detail: "See prep, driver movement, and support touchpoints in one place instead of guessing what happens next.",
      icon: Route,
    },
  ];
  const trueServeWay = [
    {
      title: "Direct and transparent",
      detail: "Cleaner checkout, fewer surprises, and pricing that stays easier to trust from first tap to final total.",
      icon: ShoppingBag,
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    },
    {
      title: "Built around merchants",
      detail: "Restaurants get branded storefront tools, direct-order support, and a platform that helps them keep more control.",
      icon: Store,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    },
    {
      title: "Human support when it matters",
      detail: "Drivers and merchants get clear status updates plus fast ways to reach real help when timing matters most.",
      icon: Route,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    },
  ];
  const platformPaths = [
    {
      title: "For Customers",
      detail: "Save favorites, reorder quickly, track each handoff, and keep your go-to delivery details in one place.",
      href: userId ? accountHref : "/signup",
      cta: userId ? "Open Account" : "Create Account",
      icon: UtensilsCrossed,
    },
    {
      title: "For Merchants",
      detail: "Launch a branded storefront, share direct-order tools, and guide your team through a clearer day-one checklist.",
      href: "/merchant/signup",
      cta: "Grow With TrueServe",
      icon: Store,
    },
    {
      title: "For Drivers",
      detail: "Onboard cleanly, upload docs, track approval status, complete payouts, and stay supported while you deliver.",
      href: "/driver/signup",
      cta: "Apply To Drive",
      icon: CarFront,
    },
  ];

  const revealTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.62, ease: [0.22, 1, 0.36, 1] as const };

  const heroVisuals = HERO_FALLBACK_VISUALS;

  useEffect(() => {
    const supabase = createClient();

    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    if (match) setUserId(match[2]);
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data.user;
      if (!authUser?.id) return;

      // Fallback: set userId from Supabase session if cookie wasn't set
      if (!document.cookie.match(new RegExp('(^| )userId=([^;]+)'))) {
        setUserId(authUser.id);
      }

      const { data: profile } = await supabase
        .from('User')
        .select('role')
        .eq('id', authUser.id)
        .maybeSingle();

      setAccountHref(getAccountHomeHref(profile?.role));
    }).catch((error) => {
      console.error('Account role fetch error:', error);
    });

    supabase
      .from('Restaurant')
      .select('*, healthGrade, complianceStatus, complianceScore, createdAt')
      .limit(60)
      .then((restaurantsResult) => {
      if (restaurantsResult.error) {
        console.error('Restaurant fetch error:', JSON.stringify(restaurantsResult.error));
        return;
      }

      const restaurantData = restaurantsResult.data || [];
      const live = getLiveRestaurants(restaurantData);
      setNetworkStats(summarizeRestaurantNetwork(live));
    });
  }, []);

  return (
    <div className="food-app-shell home-shell">
      <nav className="food-app-nav">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden hamburger-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Open menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Logo size="sm" />
        </div>
        <div className="nav-links hidden md:flex">
          {[
            { href: "/restaurants", label: "Order Food" },
            { href: "/rewards", label: "Rewards" },
            { href: "/merchant/signup", label: "For Merchants" },
            { href: "/driver/signup", label: "For Drivers" },
            { href: "/contact", label: "Contact" },
          ].map((item) => (
            <motion.div key={item.href} style={{ position: "relative" }}>
              <Link href={item.href} style={{ position: "relative", display: "inline-block" }}>
                {item.label}
                <motion.span
                  style={{
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    height: 2,
                    background: "#f97316",
                    borderRadius: 2,
                    width: "100%",
                    scaleX: 0,
                    transformOrigin: "left",
                  }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="nav-r">
          {userId ? (
            <Link href={accountHref} className="btn btn-ghost">Account</Link>
          ) : (
            <Link href="/login" className="btn btn-ghost">Sign In</Link>
          )}
        </div>

      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={shouldReduceMotion ? false : { y: -22, opacity: 0 }}
              animate={shouldReduceMotion ? undefined : { y: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { y: -18, opacity: 0 }}
              transition={revealTransition}
              style={{position:"absolute",top:0,left:0,right:0,background:"#0d0d10",borderBottom:"1px solid rgba(255,255,255,0.08)",padding:"0 16px 20px"}}
              onClick={e => e.stopPropagation()}
            >
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:62}}>
                <Logo size="sm" />
                <button onClick={() => setMenuOpen(false)} style={{display:"flex",alignItems:"center",justifyContent:"center",width:38,height:38,borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.8)",cursor:"pointer"}}>
                  <X size={20} />
                </button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:8}}>
                {[
                  { href:"/driver/signup", icon:CarFront, label:"For Drivers", sub:"Earn delivering food" },
                  { href:"/merchant/signup", icon:Store, label:"For Merchants", sub:"List your restaurant" },
                  { href:"/restaurants", icon:UtensilsCrossed, label:"Order Food", sub:"Browse local restaurants" },
                  { href:"/rewards", icon:Star, label:"Rewards", sub:"Earn points on every order" },
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                    transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      style={{display:"flex",alignItems:"center",gap:16,padding:"14px 16px",borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.03)",color:"#fff",textDecoration:"none"}}
                    >
                      <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:44,height:44,flexShrink:0,borderRadius:12,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.88)"}}>
                        <item.icon size={20} strokeWidth={2.1} />
                      </span>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"#fff"}}>{item.label}</div>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>{item.sub}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.2 }}
                  style={{marginTop:4,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12}}
                >
                  <Link
                    href={userId ? accountHref : "/login"}
                    onClick={() => setMenuOpen(false)}
                    style={{display:"block",textAlign:"center",padding:"13px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#fff",fontWeight:700,fontSize:14}}
                  >
                    {userId ? "Account" : "Sign In"}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="food-app-main">
        <section className="food-hero-card">
          <div className="home-bg-img"></div>
          <div className="home-bg-grad"></div>
          <div className="food-hero-content">
            <motion.div
              className="space-y-6"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={revealTransition}
            >
              <div className="space-y-3">
                <motion.h1
                  className="food-title"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.05 }}
                >
                  What are you<br /><RotatingWord /> tonight?
                </motion.h1>
                <motion.p
                  className="food-subtitle"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.12 }}
                >
                  Order from local restaurant partners with a cleaner checkout, transparent updates, and support that stays close when you need it.
                </motion.p>
              </div>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.2 }}
              >
                <LandingSearch />
              </motion.div>

              <motion.div
                className="food-chip-row"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.26 }}
              >
                {[
                  "Local partners",
                  "Live tracking",
                  "Direct-order ready",
                ].map((feature) => (
                  <motion.div
                    key={feature}
                    className="food-chip"
                    whileHover={shouldReduceMotion ? undefined : { y: -2, borderColor: "rgba(249,115,22,0.36)" }}
                    transition={{ duration: 0.18 }}
                  >
                    <span className="food-chip-dot" />
                    {feature}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="food-panel food-hero-right flex-col gap-5"
              initial={shouldReduceMotion ? false : { opacity: 0, x: 22 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.16 }}
            >
              <div className="space-y-4">
                <p className="food-kicker">Ready to eat?</p>
                <h2 className="food-heading">Pick a spot. <span className="accent">Dig in.</span></h2>
                <p className="food-subtitle !text-sm !max-w-none">
                  TrueServe is built to feel more direct, more transparent, and more useful for everyone involved in the order.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="food-stat">
                  <strong>Live</strong>
                  <span>Delivery ETAs update in real time</span>
                </div>
                <div className="food-stat">
                  <strong>Verified</strong>
                  <span>Restaurant reviews come from Google</span>
                </div>
              </div>

              <div className="hero-preview-grid">
                {heroVisuals.map((visual, index) => (
                  <motion.div
                    key={`${visual.title}-${index}`}
                    className={`hero-preview-card${index === 0 ? " hero-preview-card-lg" : ""}`}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: 0.22 + index * 0.08 }}
                    whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                  >
                    <motion.div
                      className="hero-preview-image"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,14,.12), rgba(8,10,14,.76)), url('${visual.image}')` }}
                      animate={shouldReduceMotion ? undefined : { scale: [1, 1.03, 1] }}
                      transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                    />
                    <div className="hero-preview-copy">
                      <div className="hero-preview-title">{visual.title}</div>
                      <div className="hero-preview-detail">{visual.detail}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/restaurants" className="portal-btn-gold portal-btn-gold-block">
                  Start Ordering
                </Link>
                {!userId ? (
                  <Link
                    href="/signup"
                    className="portal-btn-outline portal-btn-outline-block"
                  >
                    Create Account
                  </Link>
                ) : (
                  <Link href="/orders" className="portal-btn-outline portal-btn-outline-block">
                    View Orders
                  </Link>
                )}
              </div>
              {!userId ? (
                <p className="text-center text-[11px] text-gray-400">
                  New here? Create an account to save addresses and track orders.
                </p>
              ) : null}
            </motion.div>
          </div>
        </section>

        {/* Trust bar */}
        <motion.div
          style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:0, padding:"14px 24px 6px" }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={revealTransition}
        >
          {([
            { icon: <MapPin size={13} />, label:"Local Restaurants" },
            { icon: <Navigation size={13} />, label:"Live Tracking" },
            { icon: <Zap size={13} />, label:"Avg. 30 min" },
            { icon: <Star size={13} />, label:"Google Reviews" },
          ] as const).map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <motion.div
                style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 18px", whiteSpace:"nowrap" }}
                whileHover={shouldReduceMotion ? undefined : { y: -1, color: "rgba(255,255,255,0.78)" }}
              >
                <span style={{ display:"flex", alignItems:"center", color:"rgba(255,255,255,0.45)" }}>{item.icon}</span>
                <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.45)" }}>{item.label}</span>
              </motion.div>
              {i < arr.length - 1 && <div style={{ width:1, height:14, background:"rgba(255,255,255,0.1)", flexShrink:0 }} />}
            </React.Fragment>
          ))}
        </motion.div>

        <motion.section
          className="mt-8 overflow-hidden rounded-[32px] border border-white/[0.07] bg-white/[0.02] shadow-[0_20px_55px_rgba(0,0,0,0.2)]"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={revealTransition}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 md:divide-x divide-white/5">
            {[
              { label: "Our commission", display: "7%", detail: "Flat. No monthly fees." },
              { label: "Kitchen screening", display: "100%", detail: "Public health verified." },
              { label: "Hidden fees", display: "$0", detail: "Price shown = price paid." },
              { label: "Avg. delivery", display: "~30 min", detail: "Kitchen to doorstep." },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center text-center px-6 py-7 gap-1"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.07 }}
              >
                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2">{stat.label}</p>
                <p className="food-heading !text-[36px] mb-1 tabular-nums">{stat.display}</p>
                <p className="text-xs text-white/40 font-medium leading-relaxed">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── THE TRUESERVE WAY ── open 3-col, no boxes */}
        <motion.section
          className="mt-20 py-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={revealTransition}
        >
          <div className="mb-12 text-center">
            <p className="food-kicker mb-3">The TrueServe way</p>
            <h2 className="food-heading !text-[36px] md:!text-[46px]">Built to feel <span className="accent">clearer, fairer,</span><br className="hidden md:block" /> and more supportive</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {trueServeWay.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  className="flex h-full min-w-0 flex-col overflow-hidden rounded-[30px] border border-white/[0.08] bg-white/[0.02] shadow-[0_18px_45px_rgba(0,0,0,0.22)]"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.08 }}
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-t-[30px]">
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 px-7 py-7 min-w-0">
                    <span className="text-orange-400">
                      <Icon size={22} strokeWidth={2} />
                    </span>
                    <h3 className="text-[17px] font-bold text-white leading-snug break-words">{item.title}</h3>
                    <p className="text-[13px] leading-[1.7] text-white/55 break-words">{item.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── HOW IT WORKS ── open numbered steps, no boxes */}
        <motion.section
          className="mt-20 py-6"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={revealTransition}
        >
          <div className="mb-12 text-center">
            <p className="food-kicker mb-3">How it works</p>
            <h2 className="food-heading !text-[36px] md:!text-[46px]">From hungry to <span className="accent">delivered</span></h2>
          </div>
          <div className="relative grid gap-10 md:grid-cols-3">
            {/* Connecting line — sits at the vertical center of the icon circles */}
            <div className="hidden md:block absolute top-[54px] left-[calc(50%/3+24px)] right-[calc(50%/3+24px)] h-px bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-orange-500/20 pointer-events-none" />
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  className="flex flex-col items-center text-center rounded-[28px] border border-white/[0.06] bg-white/[0.015] px-8 py-8 md:border-0 md:bg-transparent md:px-10 md:pb-10 md:pt-0"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center gap-3 mb-7">
                    <span className="text-[11px] font-black tracking-[0.25em] text-[#f97316]/55 uppercase">{item.step}</span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316]">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="mb-3 text-[18px] font-bold text-white">{item.title}</h3>
                  <p className="text-[13px] leading-[1.75] text-white/50 max-w-[220px]">{item.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── ONE PLATFORM ── */}
        <motion.section
          className="mt-20 py-4"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={revealTransition}
        >
          <div className="mb-12 text-center">
            <p className="food-kicker mb-3">Built for every side</p>
            <h2 className="food-heading !text-[36px] md:!text-[46px]">One app. <span className="accent">Three ways to use it.</span></h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {([
              {
                title: "For Customers",
                tagline: "Order with confidence",
                bullets: ["Save addresses & reorder fast", "Live driver tracking", "No hidden fees at checkout"],
                href: userId ? accountHref : "/signup",
                cta: userId ? "Open Account" : "Create Free Account",
                icon: UtensilsCrossed,
              },
              {
                title: "For Merchants",
                tagline: "Keep more of what you earn",
                bullets: ["Flat monthly rate, zero commission", "Real-time order dashboard", "Locked rate for founding partners"],
                href: "/merchant/signup",
                cta: "Apply as Partner",
                icon: Store,
              },
              {
                title: "For Drivers",
                tagline: "Earn more per mile",
                bullets: ["Smart dispatch, fewer dead miles", "Next-day payouts", "Flexible hours, no minimums"],
                href: "/driver/signup",
                cta: "Apply to Drive",
                icon: CarFront,
              },
            ] as const).map((col, index) => {
              const Icon = col.icon;
              return (
                <motion.div
                  key={col.title}
                  className="flex h-full min-w-0 flex-col rounded-[28px] border border-white/[0.08] bg-white/[0.02] px-7 py-7 shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.08 }}
                >
                  <div className="flex flex-1 flex-col gap-4 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400"><Icon size={20} strokeWidth={2} /></span>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/35 break-words">{col.tagline}</p>
                    </div>
                    <h3 className="text-[22px] font-black text-white leading-tight break-words">{col.title}</h3>
                    <ul className="space-y-2.5">
                      {col.bullets.map(b => (
                        <li key={b} className="flex items-start gap-3 text-[13px] text-white/55 leading-snug break-words">
                          <span className="mt-[3px] shrink-0 text-orange-400/70 text-[10px]">✦</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={col.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#f97316] hover:gap-3 transition-all duration-200"
                  >
                    {col.cta} <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* CTA strip */}
        <motion.section
          className="mt-16"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 50%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(249,115,22,0.2)",
            borderRadius: 30,
            padding: "40px 36px",
          }}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="food-kicker mb-3">Ready to experience the difference?</p>
              <h2 className="food-heading !text-[32px] md:!text-[42px] leading-tight">
                Local. Direct. <span className="accent">Fair to everyone.</span>
              </h2>
              <p className="mt-3 text-sm text-white/50 max-w-[420px]">
                No hidden fees. No inflated prices. Just real restaurants, real drivers, and food that actually arrives.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.18 }}>
                <Link href="/restaurants" className="portal-btn-gold portal-btn-gold-block flex items-center justify-center gap-2 whitespace-nowrap !text-base !py-4 !px-8">
                  Start Ordering <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.18 }}>
                <Link href="/rewards" className="portal-btn-outline portal-btn-outline-block flex items-center justify-center gap-2 whitespace-nowrap">
                  <Star size={14} /> View Rewards
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>


        <footer className="mt-8 border-t border-white/5 px-2 pt-10 pb-12 text-center">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6">
            <Logo size="md" />
            <div className="flex items-center justify-center gap-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/rewards" className="hover:text-[#f97316] transition-colors">Rewards</Link>
              <Link href="/merchant/signup" className="hover:text-[#f97316] transition-colors">Merchants</Link>
              <Link href="/driver/signup" className="hover:text-[#f97316] transition-colors">Drivers</Link>
              <Link href="/contact" className="hover:text-[#f97316] transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <div className="flex items-center gap-5">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-500 transition-colors hover:text-[#f97316]"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
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
