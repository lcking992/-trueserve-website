"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CarFront, MapPin, Menu, Navigation, Route, Share2, ShoppingBag, Star, Store, UsersRound, UtensilsCrossed, X, Zap } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";

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
    image: "/brand/brand_home_hero.jpg",
    video: "/brand/brand_home_hero.mp4",
  },
  {
    title: "Fresh and fast",
    detail: "Built for direct ordering",
    image: "/brand/brand_home_kitchen.jpg",
  },
  {
    title: "Delivered local",
    detail: "Real restaurants, real routes",
    image: "/brand/brand_home_handoff.jpg",
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

export default function Home() {
  const shouldReduceMotion = useReducedMotion();
  const platformSectionRef = useRef<HTMLElement>(null);
  const journeySectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
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
      detail: "Cleaner checkout and fewer surprises from first tap to final total.",
      icon: ShoppingBag,
    },
    {
      title: "Built around merchants",
      detail: "Branded storefront tools and direct-order support that help restaurants keep more control.",
      icon: Store,
    },
    {
      title: "Human support when it matters",
      detail: "Clear status updates and faster ways to reach real help when timing matters most.",
      icon: Route,
    },
  ];
  const platformPaths = [
    {
      eyebrow: "Settle in faster",
      title: "For Customers",
      detail: "Save favorites, reorder quickly, track each handoff, and keep your go-to delivery details in one place.",
      href: userId ? accountHref : "/signup",
      cta: userId ? "Open Account" : "Create Account",
      icon: UtensilsCrossed,
    },
    {
      eyebrow: "Keep the brand close",
      title: "For Merchants",
      detail: "Launch a branded storefront, share direct-order tools, and guide your team through a clearer day-one checklist.",
      href: "/merchant/signup",
      cta: "Grow With TrueServe",
      icon: Store,
    },
    {
      eyebrow: "Stay in motion",
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
  const sectionItemTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.8, ease: [0.19, 1, 0.22, 1] as const };

  const heroVisuals = HERO_FALLBACK_VISUALS;
  const closingStats = [
    {
      label: "Restaurants live",
      value: networkStats.totalRestaurants > 0 ? `${networkStats.totalRestaurants}+` : "Local",
    },
    {
      label: "Verified kitchens",
      value: networkStats.verifiedCount > 0 ? `${networkStats.verifiedCount}+` : "Screened",
    },
    {
      label: "Markets covered",
      value: networkStats.markets > 0 ? `${networkStats.markets}` : "Growing",
    },
    {
      label: "Average rating",
      value: networkStats.averageRating ? `${networkStats.averageRating.toFixed(1)}★` : "Trusted",
    },
  ];
  const { scrollYProgress: platformProgress } = useScroll({
    target: platformSectionRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: journeyProgress } = useScroll({
    target: journeySectionRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaSectionRef,
    offset: ["start end", "end start"],
  });
  const platformHeaderY = useTransform(platformProgress, [0, 0.45, 1], shouldReduceMotion ? [0, 0, 0] : [38, 0, -20]);
  const platformGridY = useTransform(platformProgress, [0, 0.55, 1], shouldReduceMotion ? [0, 0, 0] : [54, 6, -18]);
  const platformGridOpacity = useTransform(platformProgress, [0, 0.2, 0.85, 1], shouldReduceMotion ? [1, 1, 1, 1] : [0.35, 1, 1, 0.72]);
  const journeyCopyY = useTransform(journeyProgress, [0, 0.5, 1], shouldReduceMotion ? [0, 0, 0] : [42, 0, -18]);
  const journeyStepsY = useTransform(journeyProgress, [0, 0.55, 1], shouldReduceMotion ? [0, 0, 0] : [62, 8, -22]);
  const journeyShellScale = useTransform(journeyProgress, [0, 0.45, 1], shouldReduceMotion ? [1, 1, 1] : [0.975, 1, 0.992]);
  const ctaY = useTransform(ctaProgress, [0, 0.6, 1], shouldReduceMotion ? [0, 0, 0] : [46, 0, -18]);
  const ctaScale = useTransform(ctaProgress, [0, 0.55, 1], shouldReduceMotion ? [1, 1, 1] : [0.985, 1, 0.994]);

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
            { href: "/about", label: "About" },
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
                  { href:"/about", icon:UsersRound, label:"About TrueServe", sub:"Why we built the platform" },
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
                    {visual.video ? (
                      <motion.video
                        className="hero-preview-video"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        animate={shouldReduceMotion ? undefined : { scale: [1, 1.03, 1] }}
                        transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                      >
                        <source src={visual.video} type="video/mp4" />
                      </motion.video>
                    ) : (
                      <motion.div
                        className="hero-preview-image"
                        style={{ backgroundImage: `linear-gradient(180deg, rgba(8,10,14,.12), rgba(8,10,14,.76)), url('${visual.image}')` }}
                        animate={shouldReduceMotion ? undefined : { scale: [1, 1.03, 1] }}
                        transition={shouldReduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                      />
                    )}
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

        <motion.section
          ref={platformSectionRef}
          className="mt-28 py-16"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={revealTransition}
        >
          <motion.div className="home-bottom-head" style={{ y: platformHeaderY }}>
            <p className="food-kicker mb-3">Built for every side</p>
            <h2 className="food-heading !text-[36px] md:!text-[48px]">
              One platform,
              <span className="accent"> more room to breathe.</span>
            </h2>
            <p className="home-bottom-copy">
              Customers, merchants, and drivers each get a clearer path through the same local delivery network, with less friction at every handoff.
            </p>
          </motion.div>
          <motion.div className="home-platform-grid" style={{ y: platformGridY, opacity: platformGridOpacity }}>
            {platformPaths.map((path, index) => {
              const Icon = path.icon;
              return (
                <motion.div
                  key={path.title}
                  className="home-platform-card"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 32, scale: 0.96, filter: "blur(14px)" }}
                  whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.08 + index * 0.1 }}
                  whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.01, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
                >
                  <motion.div
                    className="home-platform-top"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.18 + index * 0.08 }}
                  >
                    <span className="home-platform-icon">
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <p className="home-platform-eyebrow">{path.eyebrow}</p>
                  </motion.div>
                  <motion.div
                    className="space-y-3"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.55 }}
                    transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.24 + index * 0.08 }}
                  >
                    <h3 className="home-platform-title">{path.title}</h3>
                    <p className="home-platform-detail">{path.detail}</p>
                  </motion.div>
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.7 }}
                    transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.3 + index * 0.08 }}
                  >
                    <Link href={path.href} className="home-platform-link">
                    {path.cta} <ArrowRight size={14} strokeWidth={2.4} />
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          ref={journeySectionRef}
          className="mt-12"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={revealTransition}
        >
          <motion.div className="home-journey-shell" style={{ scale: journeyShellScale }}>
            <motion.div className="home-journey-copy" style={{ y: journeyCopyY }}>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20, filter: "blur(12px)" }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={sectionItemTransition}
              >
                <p className="food-kicker mb-3">How it should feel</p>
                <h2 className="food-heading !text-[34px] md:!text-[46px]">
                  Calm enough to trust,
                  <span className="accent"> direct enough to use again.</span>
                </h2>
                <p className="mt-5 max-w-[560px] text-sm leading-7 text-white/55">
                  TrueServe keeps the path simple for customers, merchants, and drivers: clearer pricing, more direct tools, and human support that shows up when timing matters.
                </p>
              </motion.div>

              <div className="home-proof-list">
                {trueServeWay.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      className="home-proof-item"
                      initial={shouldReduceMotion ? false : { opacity: 0, x: -22, filter: "blur(10px)" }}
                      whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0, filter: "blur(0px)" }}
                      viewport={{ once: true, amount: 0.65 }}
                      transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.1 + index * 0.08 }}
                    >
                      <span className="home-proof-icon">
                        <Icon size={16} strokeWidth={2.2} />
                      </span>
                      <div>
                        <p className="home-proof-title">{item.title}</p>
                        <p className="home-proof-detail">{item.detail}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                className="home-stat-ribbon"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.18 }}
              >
                {closingStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="home-stat-ribbon-item"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.22 + index * 0.06 }}
                  >
                    <span>{stat.value}</span>
                    <small>{stat.label}</small>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="home-steps-stack" style={{ y: journeyStepsY }}>
              <motion.div
                className="home-steps-head"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.55 }}
                transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.08 }}
              >
                <p className="home-steps-kicker">From hungry to delivered</p>
                <p className="home-steps-copy">Three handoffs. No noisy detours.</p>
              </motion.div>
              {howItWorks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    className="home-step-card-lite"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 34, scale: 0.97, filter: "blur(12px)" }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.12 + index * 0.11 }}
                    whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } }}
                  >
                    <div className="home-step-card-top">
                      <span className="home-step-number">{item.step}</span>
                      <span className="home-step-icon">
                        <Icon size={18} strokeWidth={2.1} />
                      </span>
                    </div>
                    <h3 className="home-step-title">{item.title}</h3>
                    <p className="home-step-detail">{item.detail}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          ref={ctaSectionRef}
          className="mt-28"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={revealTransition}
        >
          <motion.div className="home-closing-cta" style={{ y: ctaY, scale: ctaScale }}>
            <motion.div
              className="text-center md:text-left"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20, filter: "blur(12px)" }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.55 }}
              transition={sectionItemTransition}
            >
              <p className="food-kicker mb-3">Ready to experience the difference?</p>
              <h2 className="food-heading !text-[32px] md:!text-[42px] leading-tight">
                Choose local tonight.
                <span className="accent"> We&apos;ll keep it simple.</span>
              </h2>
              <p className="mt-3 text-sm text-white/50 max-w-[460px]">
                Browse neighborhood spots, check out without the clutter, and let the updates come to you instead of chasing them down.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto"
              initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={shouldReduceMotion ? undefined : { ...sectionItemTransition, delay: 0.12 }}
            >
              <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.18 }}>
                <Link href="/restaurants" className="portal-btn-gold portal-btn-gold-block flex items-center justify-center gap-2 whitespace-nowrap !text-base !py-4 !px-8">
                  Start Ordering <ArrowRight size={16} />
                </Link>
              </motion.div>
              <Link href="/about" className="text-sm font-bold text-white/50 hover:text-[#f97316] transition-colors">
                Learn more about TrueServe
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>


        <footer className="home-footer">
          <div className="home-footer-brand">
            <Logo size="md" />
            <p className="home-footer-copy">
              Bringing local flavor to your doorstep with cleaner ordering, closer support, and a more direct path from kitchen to customer.
            </p>
          </div>
          <div className="home-footer-links">
            <div className="home-footer-nav">
              <Link href="/restaurants" className="hover:text-[#f97316] transition-colors">Order Food</Link>
              <Link href="/about" className="hover:text-[#f97316] transition-colors">About</Link>
              <Link href="/merchant/signup" className="hover:text-[#f97316] transition-colors">Merchants</Link>
              <Link href="/driver/signup" className="hover:text-[#f97316] transition-colors">Drivers</Link>
              <Link href="/contact" className="hover:text-[#f97316] transition-colors">Contact</Link>
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
          </div>
          <div className="home-footer-meta">
            <p>© {new Date().getFullYear()} TrueServe</p>
            <div className="home-footer-legal">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
