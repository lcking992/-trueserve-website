"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Filter, Percent, Search, X } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import LandingSearch from "@/components/LandingSearch";
import RestaurantCard from "./RestaurantCard";
import { getFavorites } from "@/app/user/favorite-actions";
import {
  addDistanceMiles,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState<"recommended" | "rating" | "delivery" | "distance">("recommended");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    openNow: false,
    hasPromo: false,
  });
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
      const targetRaw = (address || search || "").trim();
      const targetLat = latParam ? Number(latParam) : null;
      const targetLng = lngParam ? Number(lngParam) : null;
      const targetNormalized = normalizeSearchText(targetRaw);
      const targetTokens = normalizeSearchText(targetRaw)
        .split(" ")
        .filter((token) => token.length > 2);
      const addressParts = targetRaw
        .split(",")
        .map((part) => normalizeSearchText(part))
        .filter(Boolean);
      const targetCityCandidates = new Set<string>();
      if (addressParts.length >= 3) {
        targetCityCandidates.add(addressParts[addressParts.length - 2]);
      } else if (addressParts.length === 2) {
        targetCityCandidates.add(addressParts[0]);
      } else if (addressParts[0]) {
        targetCityCandidates.add(addressParts[0]);
      }
      const targetCityToken = Array.from(targetCityCandidates)[0] || "";
      const hasCoordinates = Number.isFinite(targetLat) && Number.isFinite(targetLng);
      const isSearchOnlyMode = Boolean(search?.trim()) && !address?.trim() && !hasCoordinates;
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

            if (isSearchOnlyMode && matchesRestaurantSearch(restaurant, targetRaw, targetCityToken, targetTokens)) {
              return true;
            }

            if (hasCoordinates && restaurant.distanceMiles !== null) {
              return restaurant.distanceMiles <= 20;
            }

            const restaurantCity = normalizeSearchText(String(restaurant.city || ""));
            const cityAppearsInAddress = Boolean(
              restaurantCity && targetNormalized && ` ${targetNormalized} `.includes(` ${restaurantCity} `)
            );

            if (targetCityCandidates.size > 0 || cityAppearsInAddress) {
              return targetCityCandidates.has(restaurantCity) || cityAppearsInAddress;
            }

            return false;
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

  const isRestaurantOpen = (r: any) => {
    const o = r.openTime?.slice(0, 5);
    const c = r.closeTime?.slice(0, 5);
    if (!o || !c) return true;
    const now = new Date().toTimeString().slice(0, 5);
    return now >= o && now <= c;
  };

  const cuisineFor = (r: any) => String(r.cuisineType || r.cuisine || r.category || "Local").trim() || "Local";
  const etaMinutes = (r: any) => {
    if (typeof r.distanceMiles !== "number") return 30;
    if (r.distanceMiles <= 1) return 18;
    if (r.distanceMiles <= 2) return 24;
    if (r.distanceMiles <= 3.5) return 30;
    if (r.distanceMiles <= 5) return 40;
    return 50;
  };

  const cuisineOptions = useMemo(() => {
    const unique = Array.from(new Set(restaurants.map(cuisineFor).filter(Boolean)));
    return ["All", ...unique.slice(0, 12)];
  }, [restaurants]);

  const marketRestaurants = useMemo(() => {
    let result = [...restaurants];
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter((r) => {
        const text = `${r.name || ""} ${r.description || ""} ${r.city || ""} ${r.state || ""} ${cuisineFor(r)}`.toLowerCase();
        return text.includes(query);
      });
    }

    if (selectedCuisine !== "All") {
      result = result.filter((r) => cuisineFor(r) === selectedCuisine);
    }

    if (filters.openNow) {
      result = result.filter(isRestaurantOpen);
    }

    if (filters.hasPromo) {
      result = result.filter((r) => Boolean(r.promoText || r.hasPromo || r.featuredOffer));
    }

    result.sort((a, b) => {
      if (sortBy === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === "delivery") return etaMinutes(a) - etaMinutes(b);
      if (sortBy === "distance") return Number(a.distanceMiles ?? 999) - Number(b.distanceMiles ?? 999);
      const aOpen = isRestaurantOpen(a) ? 1 : 0;
      const bOpen = isRestaurantOpen(b) ? 1 : 0;
      if (aOpen !== bOpen) return bOpen - aOpen;
      return Number(b.rating || 0) - Number(a.rating || 0);
    });

    return result;
  }, [restaurants, searchQuery, selectedCuisine, filters, sortBy]);

  const displayRestaurants = marketRestaurants;
  const placeLabel = selectedArea.split(",")[0]?.trim() || selectedArea;

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-app-main">
        <div id="view-restaurants" className="active">
          <section className="rest-hero-panel">
            <div className="rest-hero-bg" />
            <Link href="/" className="back" style={{ marginBottom: '16px' }}>← Back</Link>
            <div className="food-eyebrow">Browse restaurants</div>
            <h2>Restaurants Near You</h2>
            <p className="lead">
              Showing restaurants for <span className="text-[#f97316] font-bold">{selectedArea}</span>.
              Ratings and reviews are linked to Google so customers see external feedback, not platform-only scores.
            </p>
            <div className="mt-5 rest-address-search">
              <LandingSearch initialValue={address || search || ""} isCompact />
            </div>
            {!hasLocationInput && (
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/55">
                Enter your delivery address above to see restaurants near you.
              </p>
            )}
          </section>

          {hasLocationInput && (
            <section className="rest-toolbar-panel">
              <div className="rest-search-control">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search restaurants or cuisines..."
                  aria-label="Search restaurants or cuisines"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear restaurant search">
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="rest-toolbar-actions">
                <label className="rest-sort-control">
                  <span>Sort</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                    <option value="recommended">Recommended</option>
                    <option value="rating">Top Rated</option>
                    <option value="delivery">Fastest Delivery</option>
                    <option value="distance">Nearest</option>
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </label>
                <button
                  type="button"
                  className={`rest-filter-toggle ${showFilters || filters.openNow || filters.hasPromo ? "is-active" : ""}`}
                  onClick={() => setShowFilters((value) => !value)}
                >
                  <Filter size={16} aria-hidden="true" />
                  Filters
                  {(filters.openNow || filters.hasPromo) && <span>{Object.values(filters).filter(Boolean).length}</span>}
                </button>
              </div>

              <div className="rest-cuisine-row" aria-label="Cuisine filters">
                {cuisineOptions.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    className={selectedCuisine === cuisine ? "on" : ""}
                    onClick={() => setSelectedCuisine(cuisine)}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>

              {showFilters && (
                <div className="rest-extra-filters">
                  <button
                    type="button"
                    className={filters.openNow ? "on" : ""}
                    onClick={() => setFilters((value) => ({ ...value, openNow: !value.openNow }))}
                  >
                    Open Now
                  </button>
                  <button
                    type="button"
                    className={filters.hasPromo ? "on" : ""}
                    onClick={() => setFilters((value) => ({ ...value, hasPromo: !value.hasPromo }))}
                  >
                    <Percent size={15} aria-hidden="true" />
                    Deals & Promos
                  </button>
                </div>
              )}
            </section>
          )}

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
            <motion.div layout className="rest-marketplace">
              {displayRestaurants.length > 0 && (
                <motion.section
                  layout
                  className="rest-section"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={shouldReduceMotion ? undefined : revealTransition}
                >
                  <div className="rest-results-head">
                    <div>
                      <h3>Available Restaurants</h3>
                      <p>Restaurants matching this delivery area and your filters.</p>
                    </div>
                    <span>{displayRestaurants.length} {displayRestaurants.length === 1 ? "partner" : "partners"}</span>
                  </div>
                  <div className="rest-grid">
                    {displayRestaurants.map((r, index) => (
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
                  </div>
                </motion.section>
              )}
              {displayRestaurants.length === 0 && !loading && (
                <div
                  className="food-panel col-span-full text-center py-16 px-8"
                  style={{ opacity: 1, textAlign: "center" }}
                >
                  {hasLocationInput ? (
                    <>
                      <p className="food-kicker mb-3">Outside our current zone</p>
                      <h3 className="food-heading !text-[30px] mb-3">We haven&apos;t reached <span className="accent">{placeLabel}</span> yet.</h3>
                      <p className="text-sm text-white/55 mb-6 max-w-sm mx-auto leading-relaxed">
                        We&apos;re onboarding nearby restaurant partners now. Leave your email and we&apos;ll alert you when TrueServe opens ordering around this address.
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
                      <div className="mx-auto flex max-w-2xl flex-col items-center text-center" style={{ width: "100%", maxWidth: 760, margin: "0 auto", alignItems: "center", textAlign: "center" }}>
                        <p className="food-kicker mb-3">Pilot launch</p>
                        <h3 className="food-heading !text-[30px] mb-3 text-center" style={{ width: "100%", textAlign: "center" }}>Now live with <span className="accent">{activeRestaurantCount || "local"} restaurant partners</span></h3>
                        <p className="text-sm text-white/55 max-w-xl leading-relaxed text-center" style={{ margin: "0 auto", textAlign: "center" }}>
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
