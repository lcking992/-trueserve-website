"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Navigation,
  Percent,
  ShieldCheck,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LandingSearch from "@/components/LandingSearch";
import { supabase } from "@/lib/supabase";
import {
  getLiveRestaurants,
  type PublicRestaurantRecord,
} from "@/lib/public-restaurants";

type FeaturedRestaurant = PublicRestaurantRecord & {
  distanceMiles?: number | null;
};

type LiveKitchen = {
  name: string;
  cuisine: string;
  rating?: string;
  eta: string;
  distance: string;
  Icon: ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  popular?: boolean;
};

const LOCATION_PROMPTS: LiveKitchen[] = [
  { name: "Enter your address", cuisine: "Show kitchens that deliver to you", eta: "Start here", distance: "Local", Icon: MapPin },
  { name: "Live order tracking", cuisine: "Prep, pickup, and doorstep updates", eta: "Included", distance: "Clear ETAs", Icon: Navigation },
  { name: "Rewards on every order", cuisine: "Earn TruePoints when you create an account", eta: "Ready", distance: "Member perks", Icon: Award },
];

const INTRO_MARQUEE = [
  { name: "Enter your address", cuisine: "Unlock nearby kitchens" },
  { name: "Real local restaurants", cuisine: "No ghost feeds" },
  { name: "Live delivery updates", cuisine: "Clear handoffs" },
  { name: "TrueServe Rewards", cuisine: "Earn on every bite" },
  { name: "Drive & Earn", cuisine: "$20/hr daily pay" },
  { name: "Restaurant partners", cuisine: "Fairer local fees" },
];

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  };
}

function LiveNearYouCard({ kitchens, hasLocation }: { kitchens: LiveKitchen[]; hasLocation: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % kitchens.length);
    }, 2600);
    return () => clearInterval(id);
  }, [kitchens.length, shouldReduceMotion]);

  return (
    <motion.div
      className="ts-fig-live-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ts-fig-live-card-head">
        <span className="ts-fig-live-dot">{hasLocation ? "Live near you" : "Ready when you are"}</span>
        <span className="updated">{hasLocation ? "Updated just now" : "Location first"}</span>
      </div>
      <div>
        {kitchens.map((k, i) => (
          <div key={k.name} className={`ts-fig-live-row${i === activeIndex ? " is-active" : ""}`}>
            <div className="ts-fig-emoji">
              <k.Icon size={18} aria-hidden="true" />
            </div>
            <div>
              <div className="ts-fig-live-name">
                {k.name}
                {k.popular ? <span className="ts-fig-live-pop">Popular</span> : null}
              </div>
              <div className="ts-fig-live-meta">
                {k.rating ? (
                  <>
                    <span>★ {k.rating}</span>
                    <span>·</span>
                  </>
                ) : null}
                <span><Clock size={12} /> {k.eta}</span>
                <span>·</span>
                <span>{k.distance}</span>
              </div>
            </div>
            <span className="ts-fig-live-chev"><ChevronRight size={16} /></span>
          </div>
        ))}
      </div>
      <div className="ts-fig-live-progress">
        <strong>{hasLocation ? "Delivery updates stay visible" : "Restaurants appear after address"}</strong>
        <span className="eta">{hasLocation ? "ETA 11 min" : "1 tap"}</span>
        <div className="ts-fig-live-progress-bar">
          <motion.span
            initial={{ width: "15%" }}
            animate={{ width: ["15%", "35%", "60%", "85%", "15%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: "block", height: "100%", background: "linear-gradient(90deg, #FF6B35, #14B8A6)", borderRadius: "999px" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function CuisineMarquee({ items }: { items: { name: string; cuisine: string }[] }) {
  const list = [...items, ...items];
  return (
    <section className="ts-fig-marquee" aria-label="Local kitchens">
      <div className="ts-fig-marquee-track">
        {list.map((item, i) => (
          <span key={`${item.name}-${i}`}>
            {item.name}
            <small>{item.cuisine}</small>
            <i>•</i>
          </span>
        ))}
      </div>
    </section>
  );
}

function CommissionBar({ percent, color, label }: { percent: number; color: "bad" | "good"; label: string }) {
  return (
    <div className={`ts-fig-commission-row ${color}`}>
      <div className="row-head">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="row-bar">
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: percent / 30 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "block", height: "100%", borderRadius: "999px" }}
        />
      </div>
    </div>
  );
}

function CountUp({ to, prefix = "", suffix = "", duration = 1.2 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(shouldReduceMotion ? to : 0);
  useEffect(() => {
    if (shouldReduceMotion) {
      setValue(to);
      return;
    }
    let start: number | null = null;
    let raf = 0;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, shouldReduceMotion]);
  return <>{prefix}{value.toLocaleString()}{suffix}</>;
}

export default function Home() {
  const [networkStats, setNetworkStats] = useState({
    totalRestaurants: 0,
    averageRating: null as number | null,
  });
  const [liveRestaurants, setLiveRestaurants] = useState<FeaturedRestaurant[]>([]);
  const [hasLocationContext, setHasLocationContext] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const savedAddress = localStorage.getItem("ts.delivery.address");
      const savedLat = localStorage.getItem("ts.delivery.lat");
      const savedLng = localStorage.getItem("ts.delivery.lng");
      setHasLocationContext(Boolean(savedAddress?.trim() || (savedLat && savedLng)));
    } catch {
      setHasLocationContext(false);
    }

    supabase
      .from("Restaurant")
      .select("*, healthGrade, complianceStatus, complianceScore, createdAt")
      .limit(80)
      .then((result) => {
        if (!mounted || result.error) return;
        const live = getLiveRestaurants(result.data || []);
        const ratings = live.map((r) => Number(r.rating)).filter((n) => Number.isFinite(n) && n > 0);
        const avg = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;
        setNetworkStats({ totalRestaurants: live.length, averageRating: avg });
        setLiveRestaurants(live as FeaturedRestaurant[]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const liveKitchens = useMemo(() => {
    if (!hasLocationContext || liveRestaurants.length < 3) return LOCATION_PROMPTS;
    return liveRestaurants.slice(0, 3).map((r, i) => {
      return {
        name: r.name ?? "Local Kitchen",
        cuisine: String(r.cuisineType || r.category || "Local"),
        rating: r.rating ? String(r.rating) : "4.8",
        eta: ["12 min", "18 min", "25 min"][i] || "25 min",
        distance: ["0.8 mi", "1.3 mi", "2.1 mi"][i] || "2.0 mi",
        Icon: Store,
        popular: i === 2,
      };
    });
  }, [hasLocationContext, liveRestaurants]);

  const marqueeItems = useMemo(() => {
    if (!hasLocationContext || liveRestaurants.length < 4) return INTRO_MARQUEE;
    return liveRestaurants.slice(0, 8).map((r) => ({
      name: r.name ?? "Local Kitchen",
      cuisine: String(r.cuisineType || r.category || "Local"),
    }));
  }, [hasLocationContext, liveRestaurants]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      window.location.href = "/restaurants";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        try {
          localStorage.setItem("ts.delivery.address", "Current location");
          localStorage.setItem("ts.delivery.lat", String(coords.latitude));
          localStorage.setItem("ts.delivery.lng", String(coords.longitude));
        } catch {}
        window.location.href = `/restaurants?lat=${coords.latitude}&lng=${coords.longitude}&address=${encodeURIComponent("Current location")}`;
      },
      () => {
        window.location.href = "/restaurants";
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="ts-fig">
      <SiteHeader />

      {/* HERO */}
      <section className="ts-fig-hero">
        <div className="ts-fig-container ts-fig-hero-inner">
          <div>
            <motion.span
              className="ts-fig-chip"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ts-fig-chip-dot" />
              Neighborhood kitchens, real food
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              Your block&apos;s{" "}
              <span className="o">best food,</span>
              <span className="t">delivered.</span>
            </motion.h1>
            <motion.p
              className="ts-fig-hero-sub"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Real restaurants from your neighborhood — not ghost kitchens, not chains. Enter your address to discover what&apos;s cooking nearby.
            </motion.p>
            <motion.div
              className="ts-fig-hero-search"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <LandingSearch />
            </motion.div>
            <motion.button
              type="button"
              className="ts-fig-locate"
              onClick={handleLocate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Navigation size={16} /> Or <u>use my current location</u>
            </motion.button>
          </div>

          <LiveNearYouCard kitchens={liveKitchens} hasLocation={hasLocationContext} />
        </div>
      </section>

      <CuisineMarquee items={marqueeItems} />

      {/* HOW IT WORKS */}
      <section className="ts-fig-section">
        <div className="ts-fig-container">
          <motion.div {...fadeIn(0)}>
            <span className="ts-fig-kicker">How it works</span>
            <h2>Three steps, then dinner.</h2>
          </motion.div>
          <div className="ts-fig-steps">
            <div className="ts-fig-steps-connector" aria-hidden="true" />
            {[
              {
                icon: <MapPin size={28} />,
                num: "01",
                title: "Drop your pin",
                copy: "Tell us where you are and we'll surface kitchens that can actually reach you — no algorithm-ranked guesses.",
              },
              {
                icon: <Heart size={28} />,
                num: "02",
                title: "Browse real menus",
                copy: "Actual neighborhood restaurants, updated daily. Not algorithm-ranked feeds.",
              },
              {
                icon: <Truck size={28} />,
                num: "03",
                title: "Watch it arrive",
                copy: "Live GPS tracking from the moment your driver picks up. No guessing, no wondering.",
              },
            ].map((step, i) => (
              <motion.article key={step.num} className="ts-fig-step" {...fadeIn(0.1 * (i + 1))}>
                <div className="ts-fig-step-icon">{step.icon}</div>
                <span className="ts-fig-step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAND */}
      <section className="ts-fig-section ts-fig-section-haze">
        <div className="ts-fig-container">
          <div className="ts-fig-trust">
            <motion.div className="ts-fig-trust-card dark" {...fadeIn(0)}>
              <div className="ts-fig-trust-icon"><ShieldCheck size={20} /></div>
              <h3>Safe &amp; secure</h3>
              <p>Bank-level encryption. Your payment info stays yours.</p>
              <div className="ts-fig-trust-badge">256-bit SSL</div>
            </motion.div>

            <motion.div className="ts-fig-trust-card" {...fadeIn(0.1)}>
              <div className="ts-fig-trust-icon"><Navigation size={20} /></div>
              <h3>Real-time tracking</h3>
              <p>Know exactly where your order is, the moment it moves.</p>
              <div className="ts-fig-trust-slider">
                <div className="ts-fig-trust-slider-track">
                  <motion.div
                    className="ts-fig-trust-slider-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: "64%" }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.div
                    className="ts-fig-trust-slider-thumb"
                    initial={{ left: 0 }}
                    whileInView={{ left: "64%" }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="ts-fig-trust-slider-labels">
                  <span>Kitchen</span>
                  <span>Your door</span>
                </div>
              </div>
            </motion.div>

            <motion.div className="ts-fig-trust-card teal" {...fadeIn(0.2)}>
              <div className="ts-fig-trust-icon"><Users size={20} /></div>
              <h3>
                {networkStats.totalRestaurants ? (
                  <><CountUp to={networkStats.totalRestaurants} suffix="+" /> local kitchens</>
                ) : (
                  "Local kitchens"
                )}
              </h3>
              <p>Real neighborhood restaurants. Not chains, not ghost kitchens.</p>
              <div className="ts-fig-trust-emojis" aria-hidden="true">
                <span>ETA</span>
                <span>GPS</span>
                <span>Pay</span>
                <span>Tips</span>
                <span>Care</span>
                <span className="more">+{Math.max(95, (networkStats.totalRestaurants || 100) - 5)}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY TRUESERVE */}
      <section className="ts-fig-section">
        <div className="ts-fig-container">
          <motion.div {...fadeIn(0)}>
            <span className="ts-fig-kicker teal">Why TrueServe</span>
            <h2>Built for your block,<br />not the algorithm.</h2>
          </motion.div>
          <div className="ts-fig-why">
            <motion.div className="ts-fig-why-card orange" {...fadeIn(0)}>
              <div className="ts-fig-why-icon"><Award size={20} /></div>
              <div className="ts-fig-why-glyph" aria-hidden="true">
                <Award size={220} strokeWidth={1.2} />
              </div>
              <h3>Earn with every order</h3>
              <p>Points that actually add up. Redeem for free delivery, discounts, and exclusive kitchen perks.</p>
              <div className="ts-fig-why-foot">{networkStats.averageRating ? networkStats.averageRating.toFixed(1) : "4.8"}★ avg rating</div>
            </motion.div>
            <motion.div className="ts-fig-why-card teal" {...fadeIn(0.1)}>
              <div className="ts-fig-why-icon"><Heart size={20} /></div>
              <div className="ts-fig-why-glyph" aria-hidden="true">
                <Heart size={220} strokeWidth={1.2} />
              </div>
              <h3>Support local</h3>
              <p>Every order keeps a neighborhood kitchen alive. Not a chain, not a ghost kitchen — your neighbor&apos;s livelihood.</p>
              <div className="ts-fig-why-foot">100% of tips to drivers</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOR RESTAURANTS */}
      <section className="ts-fig-section ts-fig-section-haze">
        <div className="ts-fig-container">
          <div className="ts-fig-merchant">
            <motion.div {...fadeIn(0)}>
              <div className="ts-fig-commission">
                <div className="ts-fig-commission-title">Commission comparison</div>
                <CommissionBar percent={30} color="bad" label="Other platforms" />
                <CommissionBar percent={15} color="good" label="TrueServe" />
                <div className="ts-fig-commission-savings">
                  <small>On $10,000/month in sales</small>
                  <strong>You keep <span className="accent">$1,500 more</span> every month.</strong>
                </div>
              </div>
            </motion.div>

            <motion.div className="ts-fig-merchant-copy" {...fadeIn(0.1)}>
              <span className="ts-fig-kicker">For restaurants</span>
              <h2>Grow your restaurant on fair terms.</h2>
              <p>Lower fees, more customers, and direct relationships with your community. You built the food — you should keep the upside.</p>
              <ul className="ts-fig-feature-list">
                <li>
                  <div className="ts-fig-feat-icon"><Percent size={16} /></div>
                  <div>
                    <strong>15% commission (not 30%)</strong>
                    <span>Keep more of what you earn vs 30% on other platforms</span>
                  </div>
                </li>
                <li>
                  <div className="ts-fig-feat-icon"><Users size={16} /></div>
                  <div>
                    <strong>Own your customers</strong>
                    <span>Build direct relationships, not marketplace dependency</span>
                  </div>
                </li>
                <li>
                  <div className="ts-fig-feat-icon"><BarChart3 size={16} /></div>
                  <div>
                    <strong>Simple dashboard</strong>
                    <span>Manage orders and track performance in real-time</span>
                  </div>
                </li>
              </ul>
              <Link href="/merchant" className="ts-fig-btn ts-fig-btn-dark">
                Become a Partner <span className="ts-fig-btn-icon"><ArrowRight size={16} /></span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DRIVE WITH US */}
      <section className="ts-fig-section">
        <div className="ts-fig-container">
          <div className="ts-fig-drive">
            <motion.div {...fadeIn(0)}>
              <span className="ts-fig-kicker teal">Drive with us</span>
              <h2>Earn on your terms.<br />Keep your tips.</h2>
              <p style={{ color: "var(--fig-muted)", fontSize: 16, lineHeight: 1.65, margin: "0 0 28px", maxWidth: 460 }}>
                Flexible hours, real earnings, and you keep every cent of your tips.
              </p>
              <ul className="ts-fig-feature-list">
                <li>
                  <div className="ts-fig-feat-icon" style={{ background: "var(--fig-teal-soft)", color: "var(--fig-teal-deep)" }}><Wallet size={16} /></div>
                  <div>
                    <strong>Earn $20+/hour</strong>
                    <span>Plus 100% of tips straight to you</span>
                  </div>
                </li>
                <li>
                  <div className="ts-fig-feat-icon" style={{ background: "var(--fig-teal-soft)", color: "var(--fig-teal-deep)" }}><Clock size={16} /></div>
                  <div>
                    <strong>Work when you want</strong>
                    <span>No minimums, no schedules, just flexibility</span>
                  </div>
                </li>
                <li>
                  <div className="ts-fig-feat-icon" style={{ background: "var(--fig-teal-soft)", color: "var(--fig-teal-deep)" }}><TrendingUp size={16} /></div>
                  <div>
                    <strong>Weekly bonuses</strong>
                    <span>Peak-hour pay and top-performer rewards</span>
                  </div>
                </li>
              </ul>
              <Link href="/drive" className="ts-fig-btn ts-fig-btn-teal">
                Start Driving Today <span className="ts-fig-btn-icon"><ArrowRight size={16} /></span>
              </Link>
            </motion.div>

            <motion.div className="ts-fig-earnings" {...fadeIn(0.1)}>
              <div className="ts-fig-earnings-title">This week&apos;s earnings</div>
              <div className="ts-fig-earnings-amount">
                $<CountUp to={233} />
              </div>
              <div className="ts-fig-earnings-days">
                {[
                  { lbl: "M", h: 28, active: true },
                  { lbl: "T", h: 52, active: true },
                  { lbl: "W", h: 36, active: true },
                  { lbl: "T", h: 64, active: true },
                  { lbl: "F", h: 78, active: true },
                  { lbl: "S", h: 44, active: false },
                  { lbl: "S", h: 20, active: false },
                ].map((d, i) => (
                  <div key={i} className={`ts-fig-earnings-day${d.active ? " active" : ""}`}>
                    <motion.div
                      className="bar"
                      initial={{ height: 12 }}
                      whileInView={{ height: d.h }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="lbl">{d.lbl}</span>
                  </div>
                ))}
              </div>
              <div className="ts-fig-earnings-tip">
                <div>
                  <small>Tips earned</small>
                  <strong>$48.00</strong>
                </div>
                <div>
                  <small>Yours to keep</small>
                  <strong>100%</strong>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
