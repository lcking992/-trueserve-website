"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Filter, MapPin, Percent, Search, ShieldCheck, Store, Truck, X } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const params = new URLSearchParams({
        lat: String(position.coords.latitude),
        lng: String(position.coords.longitude),
        address: "Current location",
      });
      window.location.href = `/restaurants?${params.toString()}`;
    });
  };

  const livePreview = hasLocationInput && displayRestaurants.length > 0
    ? displayRestaurants.slice(0, 3).map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name || "Local restaurant",
        rating: restaurant.rating || "4.9",
        etaText: `${etaMinutes(restaurant)} min`,
        distance: typeof restaurant.distanceMiles === "number" ? `${restaurant.distanceMiles.toFixed(1)} mi` : "nearby",
        label: cuisineFor(restaurant),
      }))
    : [
        { id: "address", name: "Enter your address", rating: "Real", etaText: "local matches", distance: "start", label: "Start here" },
        { id: "location", name: "Use current location", rating: "Fast", etaText: "zone check", distance: "one tap", label: "One tap" },
        { id: "secure", name: "See available kitchens", rating: "Verified", etaText: "partners only", distance: "no fake feed", label: "No fake feed" },
      ];

  return (
    <div className="ts-fig ts-fig-rest-page">
      <SiteHeader />

      <main>
        <section className="ts-fig-hero ts-fig-rest-hero">
          <div className="ts-fig-container ts-fig-hero-inner ts-fig-rest-hero-inner">
            <div>
              <span className="ts-fig-chip">
                <span className="ts-fig-chip-dot" />
                Neighborhood kitchens, real food
              </span>
              <h1>
                Find food <span className="o">near your block,</span><span className="t">not a fake feed.</span>
              </h1>
              <p className="ts-fig-hero-sub">
                Enter your address to see active TrueServe restaurant partners that can actually deliver to you.
                We only show kitchens after we know your delivery area.
              </p>
              <div className="ts-fig-hero-search">
                <LandingSearch initialValue={address || search || ""} isCompact />
              </div>
              <button type="button" className="ts-fig-locate" onClick={handleUseCurrentLocation}>
                <MapPin size={16} aria-hidden="true" />
                Or <u>use my current location</u>
              </button>
            </div>

            <aside className="ts-fig-live-card ts-fig-rest-live" aria-label="Restaurant availability preview">
              <div className="ts-fig-live-card-head">
                <span className="ts-fig-live-dot">{hasLocationInput ? "Live near you" : "Ready when you are"}</span>
                <span className="updated">{hasLocationInput ? "Updated just now" : "Address required"}</span>
              </div>
              {livePreview.map((item, index) => (
                <div key={item.id} className={`ts-fig-live-row${index === 0 ? " is-active" : ""}`}>
                  <div className="ts-fig-emoji" aria-hidden="true">
                    {index === 0 ? <Store size={20} /> : index === 1 ? <Truck size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <div>
                    <div className="ts-fig-live-name">
                      {item.name}
                      {index === 0 && hasLocationInput ? <span className="ts-fig-live-pop">Open</span> : null}
                    </div>
                    <div className="ts-fig-live-meta">
                      <span>{item.rating}</span>
                      <span>·</span>
                      <span>{item.etaText}</span>
                      <span>·</span>
                      <span>{item.distance}</span>
                    </div>
                  </div>
                  <span className="ts-fig-live-chev"><ChevronDown size={16} /></span>
                </div>
              ))}
              <div className="ts-fig-live-progress">
                <strong>{hasLocationInput ? "Restaurants filtered for your area" : "Address unlocks nearby kitchens"}</strong>
                <span className="eta">{hasLocationInput ? `${displayRestaurants.length} found` : "Start"}</span>
                <div className="ts-fig-live-progress-bar">
                  <span style={{ width: hasLocationInput ? "72%" : "18%" }} />
                </div>
              </div>
            </aside>
          </div>
          </section>

          {hasLocationInput && (
            <section className="ts-fig-container ts-fig-rest-toolbar-panel">
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

          <section className="ts-fig-section ts-fig-rest-results-section">
            <div className="ts-fig-container">
          {loading && hasLocationInput ? (
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
                      <span className="ts-fig-kicker">Near you</span>
                      <h2>Kitchens worth knowing.</h2>
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
                  className="ts-fig-empty-state"
                >
                  {hasLocationInput ? (
                    <>
                      <p className="ts-fig-kicker">Outside our current zone</p>
                      <h2>We haven&apos;t reached <span>{placeLabel}</span> yet.</h2>
                      <p>
                        We&apos;re onboarding nearby restaurant partners now. Leave your email and we&apos;ll alert you when TrueServe opens ordering around this address.
                      </p>
                      <form
                        onSubmit={(e) => { e.preventDefault(); const el = e.currentTarget.querySelector('input') as HTMLInputElement; if (el?.value) { el.value = ''; alert('You\'re on the list — we\'ll reach out when we launch near you!'); } }}
                        className="ts-fig-empty-form"
                      >
                        <input type="email" placeholder="your@email.com" required />
                        <button type="submit" className="ts-fig-btn">Notify Me</button>
                      </form>
                    </>
                  ) : (
                    <>
                      <p className="ts-fig-kicker teal">Pilot launch</p>
                      <h2>Now live with <span>{activeRestaurantCount || "local"} restaurant partners</span></h2>
                      <p>
                        Enter your address above to see only restaurants that can deliver to your location.
                        No cuisine rows, no restaurant feed, and no saved-account shortcuts until we know where you are.
                      </p>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}
            </div>
          </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function RestaurantFinder() {
  return (
    <Suspense fallback={<div className="ts-fig flex min-h-screen items-center justify-center text-[#ff6b35] font-bold">Loading restaurants...</div>}>
      <RestaurantFinderContent />
    </Suspense>
  );
}
