"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, CarFront, MapPin, Menu, Route, Share2, ShoppingBag, Star, Store, UtensilsCrossed, X } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(() => setIndex(i => (i + 1) % HERO_WORDS.length), 3000);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  const word = HERO_WORDS[index];

  return (
    <motion.span layout className="inline-block" style={{ position: "relative" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          className="accent"
          style={{ display: "inline-block" }}
          initial={shouldReduceMotion ? false : { opacity: 0, filter: "blur(14px)", scale: 0.92 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, filter: "blur(14px)", scale: 0.92 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
      detail: "Start with your delivery location so we can route you into the right market and handoff flow.",
      icon: MapPin,
    },
    {
      step: "02",
      title: "Place the order fast",
      detail: "Move from search to checkout with a cleaner, lower-friction flow designed for repeat local ordering.",
      icon: ShoppingBag,
    },
    {
      step: "03",
      title: "Track every handoff",
      detail: "See prep, driver movement, and support touchpoints in one place instead of guessing what happens next.",
      icon: Route,
    },
  ];
  const platformPaths = [
    {
      title: "For Customers",
      detail: "Save addresses, earn rewards, and track every order from kitchen to doorstep.",
      href: userId ? accountHref : "/signup",
      cta: userId ? "Open Account" : "Create Account",
      icon: UtensilsCrossed,
    },
    {
      title: "For Merchants",
      detail: "Launch a branded storefront, share direct-order links, and give your team better operational tools.",
      href: "/merchant/signup",
      cta: "Grow With TrueServe",
      icon: Store,
    },
    {
      title: "For Drivers",
      detail: "Onboard cleanly, upload docs, complete payout setup, and stay supported while you deliver.",
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
    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    if (match) setUserId(match[2]);
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data.user;
      if (!authUser?.id) return;

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
          <Link href="/restaurants">Order Food</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/merchant/signup">For Merchants</Link>
          <Link href="/driver/signup">For Drivers</Link>
          <Link href="/contact">Contact</Link>
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
                  { href:"/pricing", icon:BadgeDollarSign, label:"Pricing", sub:"Zero commission plans" },
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
                  Browse local favorites, place your order in seconds, and watch your food travel from kitchen to doorstep in real time.
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
                  "Local restaurants",
                  "Live tracking",
                  "Avg. 30 min",
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
                  From breakfast burritos to late-night pizza — find what you're craving from local restaurants near you.
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
            { icon:"📍", label:"Local Restaurants" },
            { icon:"📡", label:"Live Tracking" },
            { icon:"⚡", label:"Avg. 30 min" },
            { icon:"⭐", label:"Google Reviews" },
          ] as const).map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <motion.div
                style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 18px", whiteSpace:"nowrap" }}
                whileHover={shouldReduceMotion ? undefined : { y: -1, color: "rgba(255,255,255,0.78)" }}
              >
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.45)" }}>{item.label}</span>
              </motion.div>
              {i < arr.length - 1 && <div style={{ width:1, height:14, background:"rgba(255,255,255,0.1)", flexShrink:0 }} />}
            </React.Fragment>
          ))}
        </motion.div>

        <motion.section
          className="mt-8 food-panel overflow-hidden"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={revealTransition}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
            {[
              { kicker: "Our commission", value: 15, suffix: "%", detail: "Flat. No monthly fees." },
              { kicker: "Kitchen screening", value: 100, suffix: "%", detail: "Public health verified." },
              { kicker: "Hidden fees", value: 0, prefix: "$", detail: "Price shown = price paid." },
              { kicker: "Avg. delivery", value: 30, prefix: "~", suffix: " min", detail: "Kitchen to doorstep." },
            ].map((stat, index) => (
              <motion.div
                key={stat.kicker}
                className="flex flex-col items-center text-center px-4 py-6 gap-1"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.07 }}
              >
                <p className="food-kicker mb-2">{stat.kicker}</p>
                <h2 className="food-heading !text-[36px] mb-1 tabular-nums">
                  <AnimatedCounter from={0} to={stat.value} prefix={stat.prefix ?? ""} suffix={stat.suffix ?? ""} />
                </h2>
                <p className="text-xs text-white/40 font-medium leading-relaxed">{stat.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>


        <motion.section
          className="mt-8"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="mb-5">
            <p className="food-kicker mb-2">How TrueServe works</p>
            <h2 className="food-heading">A cleaner path from <span className="accent">search to delivery</span></h2>
          </div>
          <div className="home-steps-grid grid gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  className="food-card home-step-card"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.06 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="text-[12px] font-black uppercase tracking-[0.24em] text-white/35">{item.step}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-white/10 bg-white/5 text-white/80">
                      <Icon size={18} strokeWidth={2.1} />
                    </span>
                  </div>
                  <h3 className="mb-3 text-[28px] font-black uppercase tracking-[0.06em] text-white">{item.title}</h3>
                  <p className="text-sm leading-7 text-white/68">{item.detail}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="mt-8"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="mb-5">
            <p className="food-kicker mb-2">Built for every side</p>
            <h2 className="food-heading">One platform for <span className="accent">customers, merchants, and drivers</span></h2>
          </div>
          <div className="home-paths-grid grid gap-4 lg:grid-cols-3">
            {platformPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <motion.div
                  key={path.title}
                  className="food-card home-path-card"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: index * 0.07 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/10 bg-white/5 text-white/80">
                    <Icon size={22} strokeWidth={2.1} />
                  </div>
                  <h3 className="mb-3 text-[30px] font-black uppercase tracking-[0.06em] text-white">{path.title}</h3>
                  <p className="mb-6 text-sm leading-7 text-white/68">{path.detail}</p>
                  <Link href={path.href} className="portal-btn-outline portal-btn-outline-block home-inline-cta">
                    <span>{path.cta}</span>
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* CTA strip replacing redundant utility cards */}
        <motion.section
          className="mt-8 food-panel"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="food-kicker mb-2">Built for every side</p>
              <h2 className="food-heading !text-[28px] md:!text-[34px]">Local. Direct. <span className="accent">Fair to everyone.</span></h2>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/rewards" className="portal-btn-outline flex items-center gap-2 whitespace-nowrap">
                <Star size={14} /> Rewards
              </Link>
              <Link href="/pricing" className="portal-btn-outline flex items-center gap-2 whitespace-nowrap">
                <BadgeDollarSign size={14} /> Pricing
              </Link>
              <Link href="/restaurants" className="portal-btn-gold flex items-center gap-2 whitespace-nowrap">
                Order Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.section>


        <footer className="mt-8 border-t border-white/5 px-2 pt-10 pb-12 text-center">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6">
            <Logo size="md" />
            <div className="flex items-center justify-center gap-6 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/rewards" className="hover:text-[#f97316] transition-colors">Rewards</Link>
              <Link href="/pricing" className="hover:text-[#f97316] transition-colors">Pricing</Link>
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
