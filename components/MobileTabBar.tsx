"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, UtensilsCrossed, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

const HIDDEN_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/update-password",
  "/auth",
  "/drive",
  "/driver",
  "/merchant",
  "/admin",
  "/restaurants",
  "/restaurants/",
  "/rewards",
  "/rewards/",
  "/orders",
  "/orders/",
];

export default function MobileTabBar() {
  const path = usePathname();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIsSignedIn(Boolean(data.user));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsSignedIn(Boolean(session?.user));
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (path === "/" || HIDDEN_PREFIXES.some((p) => path.startsWith(p))) return null;

  const tabs = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/restaurants", icon: UtensilsCrossed, label: "Order" },
    { href: "/orders", icon: ShoppingBag, label: "Orders" },
    { href: isSignedIn ? "/account" : "/login", icon: User, label: isSignedIn ? "Account" : "Sign In" },
  ];

  return (
    <nav
      className="mobile-tab-bar"
      aria-label="Mobile navigation"
      style={{ top: "auto", height: "auto", minHeight: 0 }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`mobile-tab${active ? " mobile-tab-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-tab-icon">
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            </span>
            <span className="mobile-tab-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
