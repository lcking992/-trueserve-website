"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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
            <div className="food-panel text-center py-20 opacity-60 font-bold text-[#f97316] animate-pulse">Loading nearby restaurants...</div>
          ) : (
            <div className="rest-grid">
              {restaurants.filter((r) => {
                if (!filterOpenNow) return true;
                const o = r.openTime?.slice(0, 5);
                const c = r.closeTime?.slice(0, 5);
                if (!o || !c) return true;
                const now = new Date().toTimeString().slice(0, 5);
                return now >= o && now <= c;
              }).map((r) => (
                <RestaurantCard
                  key={r.id}
                  r={r}
                  address={address}
                  search={search}
                  latParam={latParam}
                  lngParam={lngParam}
                  userId={userId}
                  initialIsFavorited={favorites.includes(r.id)}
                />
              ))}
              {restaurants.length === 0 && !loading && (
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
                    <div className="col-span-full space-y-4">
                      {/* Prompt card */}
                      <div className="food-panel text-center py-10 px-8" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(10,12,16,0) 70%)", border: "1px solid rgba(249,115,22,0.18)" }}>
                        <p className="food-kicker mb-3">Pilot launch · Charlotte &amp; Rock Hill</p>
                        <h3 className="food-heading !text-[32px] mb-3">
                          {activeRestaurantCount > 0 ? <>{activeRestaurantCount} health-screened restaurants <span className="accent">ready to deliver.</span></> : <>Local restaurants. <span className="accent">Screened before you order.</span></>}
                        </h3>
                        <p className="text-sm text-white/55 max-w-md mx-auto leading-relaxed mb-6">
                          Enter your delivery address above to see what&apos;s available near you. Every restaurant on TrueServe is reviewed against public health records before going live.
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                          {["Charlotte, NC", "Rock Hill, SC", "Concord, NC", "Gastonia, NC", "Mooresville, NC"].map(city => (
                            <span key={city} style={{ padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", border: "1px solid rgba(77,202,128,0.35)", background: "rgba(77,202,128,0.08)", color: "#4dca80", display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4dca80", display: "inline-block" }} />
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Why TrueServe mini-strip */}
                      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                        {([
                          { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: "Health-screened kitchens", sub: "Every restaurant reviewed before going live" },
                          { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>, label: "Live driver tracking", sub: "Watch your order move in real time" },
                          { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: "Avg. 30 min delivery", sub: "Fast local delivery, no national middlemen" },
                        ] as { icon: React.ReactNode; label: string; sub: string }[]).map(item => (
                          <div key={item.label} style={{ padding: "16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#fff", marginBottom: 3 }}>{item.label}</div>
                              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{item.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
