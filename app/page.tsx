"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CarFront,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  Menu,
  Navigation,
  PackageCheck,
  Search,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Logo from "@/components/Logo";
import LandingSearch from "@/components/LandingSearch";
import { supabase } from "@/lib/supabase";
import {
  addDistanceMiles,
  getLiveRestaurants,
  normalizeSearchText,
  summarizeRestaurantNetwork,
  type PublicRestaurantRecord,
} from "@/lib/public-restaurants";
import { getRestaurantDisplayImage } from "@/lib/restaurant-images";
import { getAccountHomeHref } from "@/lib/account-routing";

type FeaturedRestaurant = PublicRestaurantRecord & {
  distanceMiles?: number | null;
};

function cityFromAddress(address: string | null) {
  if (!address) return "";
  const parts = address
    .split(",")
    .map((part) => normalizeSearchText(part))
    .filter(Boolean);

  if (parts.length >= 3) return parts[parts.length - 2];
  if (parts.length >= 2) return parts[0];
  return parts[0] || "";
}

function etaFor(distanceMiles?: number | null) {
  if (typeof distanceMiles !== "number") return "25-35 min";
  if (distanceMiles <= 1) return "15-20 min";
  if (distanceMiles <= 2) return "20-28 min";
  if (distanceMiles <= 4) return "25-35 min";
  return "35-45 min";
}

function restaurantImage(restaurant: FeaturedRestaurant) {
  return restaurant.imageUrl ? getRestaurantDisplayImage(restaurant) : "/hero_food_delivery.png";
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="ts-app-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  eyebrow,
  title,
  detail,
  href,
}: {
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" | "false" }>;
  eyebrow: string;
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <Link href={href} className="ts-app-info-card">
      <div className="ts-app-info-icon">
        <Icon size={18} aria-hidden="true" />
      </div>
      <span>{eyebrow}</span>
      <strong>{title}</strong>
      <small>{detail}</small>
    </Link>
  );
}

function TrackingPreview({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <div className="ts-app-phone ts-app-order-preview" aria-label="TrueServe order preview">
      <div className="ts-app-phone-status">
        <span>9:41</span>
        <div className="ts-app-phone-brand">
          <i aria-hidden="true" />
          <Logo size="xs" className="ts-app-phone-logo" href="/" />
        </div>
      </div>
      <div className="ts-app-delivered-badge">
        <CheckCircle2 size={15} aria-hidden="true" />
        Delivered in 28 min
      </div>
      <div className="ts-app-phone-copy">
        <span>{isSignedIn ? "Good evening" : "Local kitchens ready"}</span>
        <h2>What are we craving tonight?</h2>
      </div>
      <div className="ts-app-phone-search">
        <Search size={18} aria-hidden="true" />
        <span>Try "tacos near me"</span>
      </div>
      <div className="ts-app-reorder-card">
        <div>
          <span>{isSignedIn ? "Order again" : "Start here"}</span>
          <small><Clock3 size={15} aria-hidden="true" /> 22 min</small>
        </div>
        <strong>{isSignedIn ? "Dhan's Kitchen favorite" : "Find your local favorite"}</strong>
        <p>{isSignedIn ? "Your recent orders and points stay ready when you sign in." : "Enter an address first. We only show restaurants that can serve your area."}</p>
        <Link href={isSignedIn ? "/orders" : "/restaurants"}> {isSignedIn ? "Reorder in 1 tap" : "Find food near you"} </Link>
      </div>
      <div className="ts-app-mini-categories" aria-hidden="true">
        <span><UtensilsCrossed size={18} /> Tacos</span>
        <span><Store size={18} /> Sushi</span>
        <span><PackageCheck size={18} /> Pizza</span>
      </div>
      <div className="ts-app-tier-pill">
        <Sparkles size={17} aria-hidden="true" />
        <span>Rewards ready</span>
        <strong>+120 pts</strong>
      </div>
    </div>
  );
}

function RestaurantTile({ restaurant }: { restaurant: FeaturedRestaurant }) {
  const image = restaurantImage(restaurant).replace(/"/g, "%22");
  const cityLabel = [restaurant.city, restaurant.state].filter(Boolean).join(", ");
  const distanceLabel =
    typeof restaurant.distanceMiles === "number"
      ? `${restaurant.distanceMiles.toFixed(1)} mi away`
      : cityLabel;

  return (
    <Link href={`/restaurants/${restaurant.id}`} className="ts-app-restaurant-card">
      <div className="ts-app-restaurant-image" style={{ backgroundImage: `url("${image}")` }}>
        <div className="ts-app-card-badges">
          <span><Clock3 size={13} /> {etaFor(restaurant.distanceMiles)}</span>
          <span><Star size={13} fill="currentColor" /> {restaurant.rating || "4.9"}</span>
        </div>
        <button type="button" aria-label="Save restaurant">
          <Heart size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="ts-app-restaurant-body">
        <h3>{restaurant.name}</h3>
        <p>{distanceLabel}{cityLabel && distanceLabel !== cityLabel ? ` - ${cityLabel}` : ""}</p>
        <span>Partner restaurant - direct ordering</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [accountHref, setAccountHref] = useState("/user/settings");
  const [menuOpen, setMenuOpen] = useState(false);
  const [networkStats, setNetworkStats] = useState({
    totalRestaurants: 0,
    verifiedCount: 0,
    markets: 0,
    averageRating: null as number | null,
  });
  const [featuredRestaurants, setFeaturedRestaurants] = useState<FeaturedRestaurant[]>([]);
  const [featuredLocationLabel, setFeaturedLocationLabel] = useState<string | null>(null);
  const [canShowNearbyRestaurants, setCanShowNearbyRestaurants] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted || !data.user?.id) return;
      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("User")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (mounted) setAccountHref(getAccountHomeHref(profile?.role));
    });

    supabase
      .from("Restaurant")
      .select("*, healthGrade, complianceStatus, complianceScore, createdAt")
      .limit(80)
      .then((result) => {
        if (!mounted) return;
        if (result.error) {
          console.error("Restaurant fetch error:", JSON.stringify(result.error));
          return;
        }

        const live = getLiveRestaurants(result.data || []);
        setNetworkStats(summarizeRestaurantNetwork(live));

        try {
          const savedAddress = localStorage.getItem("ts.delivery.address");
          const savedLatRaw = localStorage.getItem("ts.delivery.lat");
          const savedLngRaw = localStorage.getItem("ts.delivery.lng");
          const savedLat = savedLatRaw ? Number(savedLatRaw) : NaN;
          const savedLng = savedLngRaw ? Number(savedLngRaw) : NaN;
          const hasSavedAddress = Boolean(savedAddress?.trim());
          const hasCoords = Number.isFinite(savedLat) && Number.isFinite(savedLng);
          const savedCity = cityFromAddress(savedAddress);

          let nearby: FeaturedRestaurant[] = [];

          if (hasCoords) {
            nearby = addDistanceMiles(live, savedLat, savedLng)
              .filter((restaurant) => typeof restaurant.distanceMiles === "number" && Number(restaurant.distanceMiles) <= 20)
              .sort((a, b) => Number(a.distanceMiles ?? 9999) - Number(b.distanceMiles ?? 9999));
          } else if (hasSavedAddress && savedCity) {
            nearby = live.filter((restaurant) => normalizeSearchText(String(restaurant.city || "")) === savedCity);
          }

          setCanShowNearbyRestaurants(hasSavedAddress && nearby.length > 0);
          setFeaturedRestaurants(nearby.slice(0, 6));
          setFeaturedLocationLabel(savedAddress?.split(",")[0]?.trim() || null);
        } catch {
          setCanShowNearbyRestaurants(false);
          setFeaturedRestaurants([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const navLinks = [
    { href: "/restaurants", label: "Order" },
    { href: "/rewards", label: "Rewards" },
    { href: "/merchant", label: "For Merchants" },
    { href: "/drive", label: "Drive & Earn" },
    { href: "/contact", label: "Help" },
  ];

  const categoryLabels = Array.from(
    new Set(
      featuredRestaurants
        .map((restaurant) => String(restaurant.cuisineType || restaurant.category || "Local").trim())
        .filter(Boolean)
    )
  ).slice(0, 8);

  return (
    <div className="ts-app-shell">
      <header className="ts-app-header">
        <button className="ts-app-menu-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Open navigation">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Logo size="sm" />
        <nav className="ts-app-desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={link.href === "/restaurants" ? "active" : undefined}>{link.label}</Link>
          ))}
        </nav>
        <Link href={userId ? accountHref : "/login"} className="ts-app-signin">
          {userId ? "Account" : "Sign In"}
        </Link>
        <Link href="/restaurants" className="ts-app-order-now">
          Order now
        </Link>
      </header>

      {menuOpen && (
        <div className="ts-app-mobile-menu">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
          <Link href={userId ? accountHref : "/login"} onClick={() => setMenuOpen(false)}>
            {userId ? "Account" : "Sign In"}
          </Link>
        </div>
      )}

      <main>
        <section className="ts-app-hero">
          <div className="ts-app-hero-copy">
            <span className="ts-app-chip">
              <UtensilsCrossed size={15} />
              {canShowNearbyRestaurants ? "Hot kitchens near you" : "Enter an address first"}
            </span>
            <h1>Hungry? We&apos;ve got <em>your block.</em></h1>
            <p>
              Order from real neighborhood kitchens, watch every handoff, and rack up rewards on every bite. No marketplace fluff.
            </p>
            <div className="ts-app-search-wrap">
              <LandingSearch />
            </div>
            <div className="ts-app-hero-stats">
              <Stat value={networkStats.averageRating?.toFixed(1) || "4.8"} label="avg rating" />
              <Stat value="30 min" label="avg delivery" />
              <Stat value={`${networkStats.totalRestaurants || 7}+`} label="local kitchens" />
            </div>
          </div>
          <div className="ts-app-hero-preview">
            <TrackingPreview isSignedIn={Boolean(userId)} />
          </div>
        </section>

        {canShowNearbyRestaurants && categoryLabels.length > 0 && (
          <section className="ts-app-category-strip" aria-label="Cuisine categories">
            {categoryLabels.map((label) => (
              <Link key={label} href={`/restaurants?search=${encodeURIComponent(label)}`}>
                <Search size={15} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </section>
        )}

        <section className="ts-app-info-grid" aria-label="Quick actions">
          <InfoCard icon={MapPin} eyebrow="Start here" title="Enter your address" detail="See restaurants that can deliver to you." href="/restaurants" />
          <InfoCard icon={Sparkles} eyebrow={userId ? "Your perks" : "Create account"} title={userId ? "Open rewards" : "Save orders and rewards"} detail="Keep addresses, TruePoints, and order history in one place." href={userId ? "/rewards" : "/signup"} />
          <InfoCard icon={Clock3} eyebrow="Delivery modes" title="Now or scheduled" detail="Choose the timing that fits." href="/restaurants" />
        </section>

        <section className="ts-app-section">
          <div className="ts-app-section-head">
            <div>
              <span className="ts-app-kicker">
                {canShowNearbyRestaurants && featuredLocationLabel ? `Near ${featuredLocationLabel}` : "Start here"}
              </span>
              <h2>
                {canShowNearbyRestaurants ? "Kitchens worth knowing." : "Enter an address to see nearby kitchens."}
              </h2>
            </div>
            <Link href="/restaurants">View all <ArrowRight size={16} /></Link>
          </div>

          {canShowNearbyRestaurants && featuredRestaurants.length > 0 ? (
            <div className="ts-app-restaurant-grid">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantTile key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="ts-app-location-gate">
              <div>
                <MapPin size={25} aria-hidden="true" />
              </div>
              <section>
                <span className="ts-app-kicker">No random restaurant feed</span>
                <h3>Enter your address first.</h3>
                <p>
                  TrueServe only shows restaurants that match the customer&apos;s saved address or active delivery location.
                </p>
              </section>
              <Link href="/restaurants" className="ts-app-primary">Find Food</Link>
            </div>
          )}
        </section>

        <section className="ts-app-how">
          <div>
            <span className="ts-app-chip"><PackageCheck size={15} /> How it works</span>
            <h2>From craving to <em>doorstep</em>, without guessing.</h2>
          </div>
          <div className="ts-app-steps">
            {[
              ["01", "Drop your address", "Start with your delivery location so we can show the right local market."],
              ["02", "Pick your kitchen", "Browse real partner restaurants once your address is known."],
              ["03", "Track every handoff", "See kitchen status, driver movement, and delivery timing in one place."],
            ].map(([num, title, detail]) => (
              <article key={num}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="ts-app-cta-grid">
          <Link href="/drive" className="ts-app-cta-card">
            <span><Bike size={19} /> Drivers</span>
            <h2>Drive on your schedule. Earn $20/hr plus tips.</h2>
            <p>Keep 100% of tips and see route details before accepting a delivery.</p>
            <strong>Apply to drive <ArrowRight size={16} /></strong>
          </Link>
          <Link href="/merchant" className="ts-app-cta-card secondary">
            <span><Store size={19} /> Restaurants</span>
            <h2>Grow your kitchen. Keep more control.</h2>
            <p>Lower fees, direct customer relationships, and cleaner order visibility.</p>
            <strong>Partner with us <ArrowRight size={16} /></strong>
          </Link>
        </section>

        <section className="ts-app-rewards">
          <div>
            <span><Sparkles size={16} /> Free to join</span>
            <h2>TrueServe Rewards. <em>Eat more, earn more.</em></h2>
            <p>Earn TruePoints on completed orders and unlock perks after your account is created.</p>
          </div>
          <Link href="/rewards" className="ts-app-primary">See Rewards</Link>
        </section>
      </main>
    </div>
  );
}
