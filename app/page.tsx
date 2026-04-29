"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Share2, Menu, X } from "lucide-react";

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
import RestaurantCard from "@/app/restaurants/RestaurantCard";
import { supabase } from "@/lib/supabase";
import {
  buildHomeCollections,
  buildMenuMoments,
  getLiveRestaurants,
  summarizeRestaurantNetwork,
  type PublicRestaurantCollection,
  type MenuMomentCollection,
  type PublicRestaurantRecord,
} from "@/lib/public-restaurants";
import { getAccountHomeHref } from "@/lib/account-routing";

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [accountHref, setAccountHref] = useState("/account");
  const [hasAddress, setHasAddress] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<PublicRestaurantRecord[]>([]);
  const [collections, setCollections] = useState<PublicRestaurantCollection[]>([]);
  const [menuMoments, setMenuMoments] = useState<MenuMomentCollection[]>([]);
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

  // Scroll-triggered section reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ts-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".ts-scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )userId=([^;]+)'));
    if (match) setUserId(match[2]);
    try {
      if (localStorage.getItem("ts.delivery.address")) setHasAddress(true);
    } catch {}

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

    Promise.all([
      supabase
        .from('Restaurant')
        .select('*, healthGrade, complianceStatus, complianceScore, createdAt')
        .limit(60),
      supabase
        .from('MenuItem')
        .select('id, restaurantId, name, category, price, status, isAvailable')
        .limit(200),
    ]).then(([restaurantsResult, menuResult]) => {
      if (restaurantsResult.error) {
        console.error('Restaurant fetch error:', JSON.stringify(restaurantsResult.error));
        return;
      }

      const restaurantData = restaurantsResult.data || [];
      const live = getLiveRestaurants(restaurantData);
      const sortedFeatured = [...live].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
      setFeaturedRestaurants(sortedFeatured.slice(0, 4));
      setCollections(buildHomeCollections(live));
      setNetworkStats(summarizeRestaurantNetwork(live));

      if (menuResult.error) {
        console.error('Menu item fetch error:', JSON.stringify(menuResult.error));
        setMenuMoments([]);
        return;
      }

      setMenuMoments(buildMenuMoments(live, menuResult.data || []));
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

      {menuOpen && (
        <div
          style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}
          onClick={() => setMenuOpen(false)}
        >
          <div
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
              {([
                {
                  href:"/driver/signup",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
                  label:"For Drivers", sub:"Earn delivering food"
                },
                {
                  href:"/merchant/signup",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
                  label:"For Merchants", sub:"List your restaurant"
                },
                {
                  href:"/restaurants",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
                  label:"Order Food", sub:"Browse local restaurants"
                },
                {
                  href:"/rewards",
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                  label:"Rewards", sub:"Earn points on every order"
                },
              ] as { href: string; icon: React.ReactNode; label: string; sub: string }[]).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  style={{display:"flex",alignItems:"center",gap:16,padding:"14px 16px",borderRadius:14,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.03)",color:"#fff",textDecoration:"none"}}
                >
                  <span style={{display:"flex",alignItems:"center",justifyContent:"center",width:44,height:44,flexShrink:0,borderRadius:12,background:"rgba(255,255,255,0.06)"}}>
                    {item.icon}
                  </span>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:"#fff"}}>{item.label}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>{item.sub}</div>
                  </div>
                </Link>
              ))}
              <div style={{marginTop:4,borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:12}}>
                <Link
                  href={userId ? accountHref : "/login"}
                  onClick={() => setMenuOpen(false)}
                  style={{display:"block",textAlign:"center",padding:"13px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"#fff",fontWeight:700,fontSize:14}}
                >
                  {userId ? "Account" : "Sign In"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="food-app-main">
        <section className="food-hero-card">
          {/* Ambient background orbs */}
          <div className="ts-orb ts-orb-a" aria-hidden="true" />
          <div className="ts-orb ts-orb-b" aria-hidden="true" />
          <div className="home-bg-img"></div>
          <div className="home-bg-grad"></div>
          <div className="food-hero-content">
            <div className="space-y-6 ts-animate-fade-up">
              <div className="space-y-3">
                <h1 className="food-title">What are you<br /><span className="accent">craving tonight?</span></h1>
                <p className="food-subtitle">
                  Charlotte and Rock Hill's only delivery platform that screens every kitchen before your order goes in. Local restaurants. Real compliance. Live tracking.
                </p>
              </div>

              <LandingSearch onAddressChange={setHasAddress} />

              <div className="food-chip-row">
                {[
                  "Local restaurants",
                  "Live tracking",
                  "Avg. 30 min",
                ].map((feature) => (
                  <div key={feature} className="food-chip">
                    <span className="food-chip-dot" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="food-panel food-hero-right flex-col gap-5 ts-animate-fade-up ts-animate-delay-1 ts-float">
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
            </div>
          </div>
        </section>

        {/* Trust bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:0, padding:"14px 24px 6px" }}>
          {([
            {
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
              label: "Charlotte & Rock Hill"
            },
            {
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              label: "Avg. 30 min delivery"
            },
            {
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              label: "Health-screened kitchens"
            },
            {
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
              label: "Live driver tracking"
            },
          ] as { icon: React.ReactNode; label: string }[]).map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <div style={{ display:"flex", alignItems:"center", gap:7, padding:"4px 18px", whiteSpace:"nowrap", color:"rgba(255,255,255,0.4)" }}>
                {item.icon}
                <span style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.14em", color:"rgba(255,255,255,0.45)" }}>{item.label}</span>
              </div>
              {i < arr.length - 1 && <div style={{ width:1, height:14, background:"rgba(255,255,255,0.1)", flexShrink:0 }} />}
            </React.Fragment>
          ))}
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4 ts-scroll-reveal">
          {[
            {
              kicker: "Restaurant partners",
              value: networkStats.totalRestaurants ? `${networkStats.totalRestaurants}+` : "Pilot",
              detail: "Local restaurants onboarded and live in Charlotte & Rock Hill",
            },
            {
              kicker: "Kitchens screened",
              value: networkStats.verifiedCount ? `${networkStats.verifiedCount}` : "100%",
              detail: "Every partner kitchen reviewed against public health records before going live",
            },
            {
              kicker: "Markets active",
              value: networkStats.markets ? `${networkStats.markets}` : "5",
              detail: "Charlotte, Rock Hill, Concord, Gastonia, and Mooresville — expanding monthly",
            },
            {
              kicker: "Commission model",
              value: "15%",
              detail: "Flat split only — no monthly fees on the base plan, no surprise charges",
            },
          ].map((stat, index) => (
            <div
              key={stat.kicker}
              className="food-card transition-transform hover:-translate-y-1"
            >
              <p className="food-kicker mb-3">{stat.kicker}</p>
              <h2
                className="food-heading !text-[38px] mb-3 ts-stat-pop"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {stat.value}
              </h2>
              <p className="text-sm leading-7">{stat.detail}</p>
            </div>
          ))}
        </section>


        {hasAddress && featuredRestaurants.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Now on TrueServe</p>
                <h2 className="food-heading">Featured <span className="accent">restaurants</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{width:"auto"}}>
                See All
              </Link>
            </div>
            <div className="rest-grid">
              {featuredRestaurants.map(r => (
                <RestaurantCard key={r.id} r={r} />
              ))}
            </div>
          </section>
        )}

        {hasAddress && (
          <section className="mt-10 food-panel">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Explore by Cuisine</p>
                <h2 className="food-heading">What are you <span className="accent">craving?</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{width: "auto"}}>
                See All
              </Link>
            </div>
            <div className="cuisine-grid">
              {[
                { emoji: "🍕", label: "Pizza", cat: "pizza" },
                { emoji: "🍔", label: "Burgers", cat: "burgers" },
                { emoji: "🌮", label: "Tacos", cat: "tacos" },
                { emoji: "🍜", label: "Noodles", cat: "noodles" },
                { emoji: "🍣", label: "Sushi", cat: "sushi" },
                { emoji: "🥗", label: "Salads", cat: "salads" },
                { emoji: "🍗", label: "Chicken", cat: "chicken" },
                { emoji: "🥩", label: "Steaks", cat: "steaks" },
              ].map((c) => (
                <Link key={c.cat} href={`/restaurants?category=${c.cat}`} className="cuisine-card">
                  <span className="cuisine-emoji">{c.emoji}</span>
                  <span className="cuisine-label">{c.label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {collections.length > 0 && networkStats.totalRestaurants >= 5 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Pilot-ready discovery</p>
                <h2 className="food-heading">Shop with <span className="accent">real trust signals</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{ width: "auto" }}>
                Explore All
              </Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {collections.map((collection, index) => {
                const heroRestaurant = collection.restaurants[0];
                const isLastOdd = index === collections.length - 1 && collections.length % 2 !== 0;
                return (
                  <Link
                    key={collection.key}
                    href={collection.href}
                    className={`food-card ts-reveal transition-transform hover:-translate-y-1${isLastOdd ? " lg:col-span-2" : ""}`}
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div
                      style={{
                        height: 220,
                        borderRadius: 18,
                        backgroundImage: `linear-gradient(180deg, rgba(10,12,16,.12), rgba(10,12,16,.84)), url('${heroRestaurant?.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: 18,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="food-eyebrow">{collection.eyebrow}</div>
                      <div>
                        <h3 className="food-heading !text-[36px] mb-2">{collection.title}</h3>
                        <p className="text-sm leading-6 text-white/75 max-w-[32rem]">{collection.description}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {collection.restaurants.map((restaurant) => (
                        <div
                          key={restaurant.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: 12,
                            alignItems: "center",
                            padding: "14px 16px",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <div>
                            <div className="text-sm font-black uppercase tracking-[0.12em] text-white">{restaurant.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">
                              {[restaurant.city, restaurant.state].filter(Boolean).join(", ") || "Local partner"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black text-[#f97316]">
                              {Number(restaurant.rating || 0) > 0 ? `${Number(restaurant.rating).toFixed(1)}★` : "New"}
                            </div>
                            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/45">
                              {restaurant.healthGrade ? `Grade ${restaurant.healthGrade}` : "Live now"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {menuMoments.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="food-kicker mb-2">Menu-aware discovery</p>
                <h2 className="food-heading">Browse by <span className="accent">actual dishes</span></h2>
              </div>
              <Link href="/restaurants" className="portal-btn-outline shrink-0" style={{ width: "auto" }}>
                See Menus
              </Link>
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              {menuMoments.map((moment, index) => {
                const hero = moment.entries[0];
                return (
                  <Link
                    key={moment.key}
                    href={moment.href}
                    className="food-card ts-reveal transition-transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div
                      style={{
                        height: 180,
                        borderRadius: 18,
                        backgroundImage: `linear-gradient(180deg, rgba(10,12,16,.1), rgba(10,12,16,.88)), url('${hero?.imageUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80"}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        padding: 18,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="food-eyebrow">{moment.eyebrow}</div>
                      <div>
                        <h3 className="food-heading !text-[34px] mb-2">{moment.title}</h3>
                        <p className="text-sm leading-6 text-white/75">{moment.description}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3">
                      {moment.entries.map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: 12,
                            alignItems: "center",
                            padding: "14px 16px",
                            borderRadius: 16,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                          }}
                        >
                          <div>
                            <div className="text-sm font-black uppercase tracking-[0.12em] text-white">{entry.itemName}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">
                              {entry.restaurantName} · {entry.cityLabel}
                            </div>
                          </div>
                          <div className="text-sm font-black text-[#f97316]">{entry.priceLabel}</div>
                        </div>
                      ))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── COMPLIANCE / TRUST DIFFERENTIATOR ── */}
        <section className="mt-16 ts-scroll-reveal">
          <div className="food-card" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(10,12,16,0) 60%)", border: "1px solid rgba(249,115,22,0.18)" }}>
            <div style={{ display: "grid", gap: 48, gridTemplateColumns: "1fr", alignItems: "center" }} className="lg:grid-cols-2">
              <div>
                <p className="food-kicker mb-3" style={{ color: "#f97316" }}>Why TrueServe</p>
                <h2 className="food-heading" style={{ fontSize: 38, lineHeight: 1.1, marginBottom: 16 }}>
                  We only work with<br /><span className="accent">kitchens that pass.</span>
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.6)", maxWidth: 460, marginBottom: 28 }}>
                  Before a single order goes through, every restaurant on TrueServe is reviewed against North and South Carolina public health inspection records. Low compliance scores get flagged automatically — and restaurants stay hidden from customers until they're resolved. The other apps don't do this. We do.
                </p>
                <Link href="/restaurants" className="portal-btn-gold" style={{ width: "auto", display: "inline-flex" }}>
                  Browse Verified Restaurants
                </Link>
              </div>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                {([
                  {
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    ),
                    title: "Health Grades",
                    body: "Public inspection records reviewed for every partner kitchen before onboarding."
                  },
                  {
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    ),
                    title: "Compliance Score",
                    body: "Restaurants are scored 0–100. Low scorers are flagged and removed from the feed."
                  },
                  {
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><polyline points="16 11 17.5 13 21 10"/>
                      </svg>
                    ),
                    title: "Verified Drivers",
                    body: "Every driver passes a background check and compliance training before their first delivery."
                  },
                  {
                    icon: (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    ),
                    title: "Zero Tolerance",
                    body: "A flagged restaurant is immediately hidden from customers and drivers until resolved."
                  },
                ] as { icon: React.ReactNode; title: string; body: string }[]).map(item => (
                  <div key={item.title} style={{ padding: "18px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                    <div style={{ marginBottom: 10 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>{item.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="mt-16 ts-scroll-reveal">
          <div className="mb-10 text-center">
            <p className="food-kicker mb-3">Simple by design</p>
            <h2 className="food-heading" style={{ fontSize: 38 }}>How it <span className="accent">works</span></h2>
          </div>
          <div style={{ display: "grid", gap: 0, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", position: "relative" }}>
            {([
              {
                step: "01",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                ),
                title: "Enter your address",
                body: "Drop your location and we'll show you every verified restaurant delivering to your door right now."
              },
              {
                step: "02",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2h1l1.68 3.39a1 1 0 0 0 .9.61h12.84a1 1 0 0 1 .97 1.22l-1.54 6a1 1 0 0 1-.97.78H7.5"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M3 2l2 10"/>
                  </svg>
                ),
                title: "Pick your meal",
                body: "Browse real menus with real prices. Filter by cuisine, health grade, rating, or delivery time."
              },
              {
                step: "03",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                ),
                title: "Place your order",
                body: "Checkout in seconds. Pay securely. Your order goes straight to the kitchen — no middleman delay."
              },
              {
                step: "04",
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                  </svg>
                ),
                title: "Track in real time",
                body: "Watch your driver live on the map from the moment they pick up your food to your front door."
              },
            ] as { step: string; icon: React.ReactNode; title: string; body: string }[]).map((item, i) => (
              <div key={item.step} className="food-card ts-reveal" style={{ animationDelay: `${i * 80}ms`, position: "relative", overflow: "hidden", borderRadius: i === 0 ? "16px 4px 4px 16px" : i === 3 ? "4px 16px 16px 4px" : 4, margin: "0 1px" }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: "rgba(249,115,22,0.06)", position: "absolute", top: 8, right: 12, lineHeight: 1, fontFamily: "Bebas Neue, sans-serif" }}>{item.step}</div>
                <div style={{ marginBottom: 16, width: 44, height: 44, borderRadius: 12, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "#f97316", marginBottom: 6 }}>Step {item.step}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.75, color: "rgba(255,255,255,0.5)" }}>{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRODUCT VIDEO ── */}
        <section className="mt-16">
          <div className="mb-10 text-center">
            <p className="food-kicker mb-3">See it in action</p>
            <h2 className="food-heading" style={{ fontSize: 38 }}>The dashboard built for <span className="accent">real operators.</span></h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 12, maxWidth: 480, margin: "12px auto 0" }}>
              Watch how merchants manage orders, compliance, and payouts — all from one screen.
            </p>
          </div>
          <div
            className="food-card"
            style={{
              padding: 0,
              overflow: "hidden",
              position: "relative",
              aspectRatio: "16/9",
              background: "#0a0c09",
              cursor: "pointer",
            }}
          >
            {/* Swap the src below for your real YouTube embed URL or /videos/demo.mp4 */}
            <iframe
              src="https://www.youtube.com/embed/?controls=1&rel=0&modestbranding=1"
              title="TrueServe platform demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            />
            {/* Placeholder shown until a real video URL is added */}
            <div
              id="video-placeholder"
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, #0f1210 0%, #141a18 100%)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 20,
              }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(249,115,22,0.12)",
                border: "2px solid rgba(249,115,22,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#f97316">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Demo video coming soon</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Replace the iframe src with your YouTube or video URL</div>
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
                {["Live order queue", "Compliance dashboard", "Real-time driver tracking"].map(label => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DRIVER + MERCHANT RECRUITMENT ── */}
        <section className="mt-16 ts-scroll-reveal">
          <div className="mb-10 text-center">
            <p className="food-kicker mb-3">Join the network</p>
            <h2 className="food-heading" style={{ fontSize: 38 }}>Built for the people <span className="accent">behind the food</span></h2>
          </div>
          <div style={{ display: "grid", gap: 16 }} className="lg:grid-cols-2">
            <div className="food-card" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(10,12,16,0) 70%)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <p className="food-kicker mb-2">For Drivers</p>
              <h3 className="food-heading" style={{ fontSize: 30, marginBottom: 12 }}>Earn on your <span className="accent">own schedule</span></h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.55)", marginBottom: 24, maxWidth: 400 }}>
                No subscription fees. No hidden cuts. Keep more of what you earn with transparent per-delivery pay, real-time settlements, and a compliance dashboard that protects your standing.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
                {["Transparent pay", "Flexible hours", "Real-time settlement", "Compliance support"].map(tag => (
                  <span key={tag} style={{ padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(249,115,22,0.3)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.6)" }}>{tag}</span>
                ))}
              </div>
              <Link href="/driver/signup" className="portal-btn-gold" style={{ width: "auto", display: "inline-flex" }}>
                Start Driving
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>

            <div className="food-card" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(10,12,16,0) 70%)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
              </div>
              <p className="food-kicker mb-2">For Merchants</p>
              <h3 className="food-heading" style={{ fontSize: 30, marginBottom: 12 }}>Grow without <span className="accent">the commission tax</span></h3>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.55)", marginBottom: 24, maxWidth: 400 }}>
                List your restaurant for free. Pay a flat split only when orders come in — no monthly fees on the base plan. Get compliance tools, a storefront, and a real operations dashboard built for busy kitchens.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
                {["Zero setup fee", "15% flat split", "Compliance tools", "Live order dashboard"].map(tag => (
                  <span key={tag} style={{ padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.12)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)" }}>{tag}</span>
                ))}
              </div>
              <Link href="/merchant/signup" className="portal-btn-outline" style={{ width: "auto", display: "inline-flex" }}>
                List Your Restaurant
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOUNDER NOTE ── */}
        {/* UPDATE: Replace "Leon King" with your full name, and update the quote/story to match your voice */}
        <section className="mt-16 ts-scroll-reveal">
          <div className="food-card" style={{ display: "grid", gap: 40, alignItems: "center", gridTemplateColumns: "1fr" }} >
            <div style={{ display: "grid", gap: 40, alignItems: "center" }} className="lg:grid-cols-[1fr_2fr]">
              {/* Photo — drop your real headshot at /public/founder.jpg to replace the initials block */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.05) 100%)",
                  border: "2px solid rgba(249,115,22,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 40, fontWeight: 900, color: "#f97316",
                  flexShrink: 0,
                  overflow: "hidden",
                }}>
                  {/* Swap this for <img src="/founder.jpg" ... /> once you have a headshot */}
                  LK
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em" }}>Leon King</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Founder, TrueServe</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>Charlotte, NC</div>
                </div>
              </div>
              <div>
                <p className="food-kicker mb-4">Why I built this</p>
                <blockquote style={{ fontSize: 18, lineHeight: 1.85, color: "rgba(255,255,255,0.8)", fontStyle: "italic", borderLeft: "3px solid #f97316", paddingLeft: 20, margin: "0 0 20px 0" }}>
                  "I kept ordering from apps that had no idea what was actually happening inside the kitchens they were sending me to. No health scores. No compliance data. Nothing. I built TrueServe because people deserve to know where their food is actually coming from — and local restaurants deserve a platform that isn't taking 30% of every order they work hard to fill."
                </blockquote>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.45)", maxWidth: 560 }}>
                  TrueServe started in Charlotte. We're building the infrastructure that local food operators actually need — compliance tools, real-time dashboards, and a delivery network that treats drivers and restaurants like partners, not contractors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── EARLY ACCESS ── */}
        <section className="mt-16 ts-scroll-reveal">
          <div
            className="food-card"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(10,12,16,0) 70%)",
              border: "1px solid rgba(249,115,22,0.2)",
              textAlign: "center",
              padding: "56px 32px",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, border: "1px solid rgba(249,115,22,0.35)", background: "rgba(249,115,22,0.08)", marginBottom: 24 }}>
              <span className="ts-pilot-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#f97316", display: "inline-block" }} />
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", color: "#f97316" }}>Now accepting pilot partners</span>
            </div>
            <h2 className="food-heading" style={{ fontSize: 40, marginBottom: 16 }}>
              Be among the first<br /><span className="accent">restaurants on TrueServe.</span>
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.55)", maxWidth: 520, margin: "0 auto 40px" }}>
              We're onboarding a limited number of restaurant partners in Charlotte and surrounding markets. No setup fee. No commitment. Just a real operations platform built for kitchens like yours.
            </p>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", maxWidth: 680, margin: "0 auto 40px" }}>
              {([
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ),
                  label: "Zero setup cost",
                  sub: "Get listed for free during the pilot",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ),
                  label: "Dedicated onboarding",
                  sub: "We set everything up with you",
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ),
                  label: "Shape the product",
                  sub: "Direct line to the founding team",
                },
              ] as { icon: React.ReactNode; label: string; sub: string }[]).map(item => (
                <div key={item.label} style={{ padding: "18px 16px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", textAlign: "left" }}>
                  <div style={{ marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/merchant/signup" className="portal-btn-gold" style={{ width: "auto", display: "inline-flex" }}>
                Apply as a Restaurant
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <Link href="/driver/signup" className="portal-btn-outline" style={{ width: "auto", display: "inline-flex" }}>
                Apply as a Driver
              </Link>
            </div>
          </div>
        </section>

        {/* ── COVERAGE / MARKETS ── */}
        <section className="mt-16 mb-4 ts-scroll-reveal">
          <div className="food-card" style={{ textAlign: "center" }}>
            <p className="food-kicker mb-3">Where we operate</p>
            <h2 className="food-heading" style={{ fontSize: 38, marginBottom: 12 }}>Live in the <span className="accent">Southeast.</span><br />Expanding fast.</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto 32px" }}>
              TrueServe launched in the Carolinas and is actively onboarding restaurants and drivers across new markets. If you don't see your city yet — it's coming.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 36 }}>
              {[
                { city: "Charlotte, NC", status: "live" },
                { city: "Rock Hill, SC", status: "live" },
                { city: "Concord, NC", status: "live" },
                { city: "Gastonia, NC", status: "live" },
                { city: "Mooresville, NC", status: "live" },
                { city: "Atlanta, GA", status: "coming" },
                { city: "Raleigh, NC", status: "coming" },
                { city: "Columbia, SC", status: "coming" },
              ].map(m => (
                <span key={m.city} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", border: m.status === "live" ? "1px solid rgba(77,202,128,0.35)" : "1px solid rgba(255,255,255,0.1)", background: m.status === "live" ? "rgba(77,202,128,0.08)" : "rgba(255,255,255,0.03)", color: m.status === "live" ? "#4dca80" : "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.status === "live" ? "#4dca80" : "rgba(255,255,255,0.2)", display: "inline-block", flexShrink: 0 }} />
                  {m.city}
                </span>
              ))}
            </div>
            <Link href="/merchant/signup" className="portal-btn-outline" style={{ width: "auto", display: "inline-flex" }}>
              Bring TrueServe to My City
            </Link>
          </div>
        </section>

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
