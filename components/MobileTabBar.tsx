"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, UtensilsCrossed, User } from "lucide-react";

const TABS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/restaurants", icon: UtensilsCrossed, label: "Order" },
  { href: "/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/account", icon: User, label: "Account" },
];

const HIDDEN_PREFIXES = [
  "/merchant/dashboard",
  "/driver/dashboard",
  "/admin",
];

export default function MobileTabBar() {
  const path = usePathname();

  if (HIDDEN_PREFIXES.some((p) => path.startsWith(p))) return null;

  return (
    <nav className="mobile-tab-bar" aria-label="Mobile navigation">
      {TABS.map(({ href, icon: Icon, label }) => {
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
