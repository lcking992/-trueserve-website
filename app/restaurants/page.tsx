"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import LandingSearch from "@/components/LandingSearch";
import RestaurantCard from "./RestaurantCard";
import { getFavorites } from "@/app/user/favorite-actions";
import {
  addDistanceMiles,
  extractStateCode,
  getLiveRestaurants,
  matchesRestaurantSearch,
  normalizeSearchText,
} from "@/lib/public-restaurants";

function RestaurantFinderContent() {
  const shouldReduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const address = searchParams.get("address");
  const search = searchParams.get("search");
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const selectedArea = address || search || "your area";
  const hasLocationInput = Boolean((address || search || "").trim() || (latParam && lngParam));
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRestaurantCount, setActiveRestaurantCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const revealTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setUserId(data.user.id);
        getFavorites().then(setFavorites);
      }
    });
  }, []);

  useEffect(() => {
    async function fetchRestaurants() {
      const targetRaw = (search || address || "").trim();
      const targetLat = latParam ? Number(latParam) : null;
      const targetLng = lngParam ? Number(lngParam) : null;
      const targetSearch = targetRaw.toLowerCase();
      const targetTokens = normalizeSearchText(targetRaw)
        .split(" ")
        .filter((token) => token.length > 2);
      const targetCityToken = normalizeSearchText(targetRaw.split(",")[0] || "");
      const targetState = extractStateCode(targetRaw);
      const shouldFilterByLocation = Boolean(targetRaw || (targetLat !== null && targetLng !== null));

      const { data, error } = await supabase
        .from('Restaurant')
        .select('*, healthGrade, complianceStatus');
      
      if (!error && data) {
        const liveRestaurants = getLiveRestaurants(data);
        setActiveRestaurantCount(liveRestaurants.length);
        const withDistance = addDistanceMiles(liveRestaurants, targetLat, targetLng);

        const filtered = withDistance
          .filter((restaurant: any) => {
            if (!shouldFilterByLocation) return false;

            if (matchesRestaurantSearch(restaurant, targetRaw, targetCityToken, targetTokens)) {
              return true;
            }

            if (targetLat !== null && targetLng !== null && restaurant.distanceMiles !== null) {
              return restaurant.distanceMiles <= 20;
            }

            if (targetState && (restaurant.state || "").toUpperCase() !== targetState) {
              return false;
            }

            return Boolean(targetSearch);
          })
          .sort((a: any, b: any) => {
            if (a.distanceMiles === null || b.distanceMiles === null) return 0;
            return a.distanceMiles - b.distanceMiles;
          });

        setRestaurants(filtered);
      }
      setLoading(false);
    }
    fetchRestaurants();
  }, [address, latParam, lngParam, search]);

  const filteredRestaurants = restaurants.filter((r) => {
    if (!filterOpenNow) return true;
    const o = r.openTime?.slice(0, 5);
    const c = r.closeTime?.slice(0, 5);
    if (!o || !c) return true;
    const now = new Date().toTimeString().slice(0, 5);
    return now >= o && now <= c;
  });

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-app-main">
        <div id="view-restaurants" className="active">
          <section className="food-panel rest-top">
            <Link href="/" className="back" style={{ marginBottom: '16px' }}>← Back</Link>
            <div className="food-eyebrow">Browse restaurants</div>
            <h2>Available Now</h2>
            <p className="lead">
              Showing restaurants for <span className="text-[#f97316] font-bold">{selectedArea}</span>.
              Ratings and reviews are linked to Google so customers see external feedback, not platform-only scores.
            </p>
            <div className="mt-5">
              <LandingSearch initialValue={address || search || ""} isCompact />
            </div>
            {!hasLocationInput && (
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/55">
                Enter your delivery address above to see restaurants near you.
              </p>
            )}

            <div className="rest-filters">
              <button className={!filterOpenNow ? "on" : ""} onClick={() => setFilterOpenNow(false)}>All Restaurants</button>
              <button className={filterOpenNow ? "on" : ""} onClick={() => setFilterOpenNow(v => !v)}>Open Now</button>
              <button>Top Rated</button>
            </div>
          </section>

          {loading ? (
            <div className="rest-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rest-card rest-card-skeleton">
                  <div className="rc-img rc-img-skeleton" />
                  <div className="rc-info" style={{ gap: 10 }}>
                    <div className="skeleton-line" style={{ width: "70%", height: 22 }} />
                    <div className="skeleton-line" style={{ width: "50%", height: 14 }} />
                    <div className="skeleton-line" style={{ width: "40%", height: 12, marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div layout className="rest-grid">
              <AnimatePresence mode="popLayout">
              {filteredRestaurants.map((r, index) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 22, scale: 0.985 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -18, scale: 0.98 }}
                  transition={shouldReduceMotion ? undefined : { ...revealTransition, delay: Math.min(index * 0.04, 0.18) }}
                >
                  <RestaurantCard
                    r={r}
                    address={address}
                    search={search}
                    latParam={latParam}
                    lngParam={lngParam}
                    userId={userId}
                    initialIsFavorited={favorites.includes(r.id)}
                  />
                </motion.div>
              ))}
              </AnimatePresence>
              {filteredRestaurants.length === 0 && !loading && (
                <div className="food-panel col-span-full text-center py-16 px-8" style={{ opacity: 1 }}>
                  {hasLocationInput ? (
                    <>
                      <p className="food-kicker mb-3">Outside our current zone</p>
                      <h3 className="food-heading !text-[30px] mb-3">Not in your area <span className="accent">yet.</span></h3>
                      <p className="text-sm text-white/55 mb-6 max-w-sm mx-auto leading-relaxed">
                        We&apos;re actively onboarding restaurant partners across our current launch footprint. Drop your email and we&apos;ll notify you when ordering opens in your area.
                      </p>
                      <form
                        onSubmit={(e) => { e.preventDefault(); const el = e.currentTarget.querySelector('input') as HTMLInputElement; if (el?.value) { el.value = ''; alert('You\'re on the list — we\'ll reach out when we launch near you!'); } }}
                        style={{ display: 'flex', gap: 8, maxWidth: 360, margin: '0 auto' }}
                      >
                        <input type="email" placeholder="your@email.com" required style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                        <button type="submit" className="portal-btn-gold" style={{ whiteSpace: 'nowrap' }}>Notify Me</button>
                      </form>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <p className="food-kicker mb-3">Pilot launch</p>
                        <h3 className="food-heading !text-[30px] mb-3 text-center">Now live with <span className="accent">{activeRestaurantCount || "local"} restaurant partners</span></h3>
                        <p className="text-sm text-white/55 max-w-xl leading-relaxed text-center">
                          Enter your address above to see restaurants near you and discover currently active merchant locations in your area.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RestaurantFinder() {
  return (
    <Suspense fallback={<div className="food-app-shell flex min-h-screen items-center justify-center text-[#f97316] font-bold">Loading restaurants...</div>}>
      <RestaurantFinderContent />
    </Suspense>
  );
}
