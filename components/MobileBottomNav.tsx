"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CarFront, Handshake, Home, ReceiptText, Search, Store, User, X } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/restaurants", label: "Search", icon: Search },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "#partners", label: "Partner", icon: Handshake, isPartner: true },
  { href: "/login", label: "Account", icon: User },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [partnerOpen, setPartnerOpen] = useState(false);

  return (
    <>
      {partnerOpen && (
        <div className="mobile-partner-sheet-wrap" role="dialog" aria-modal="true" aria-label="Partner signup options">
          <button className="mobile-partner-sheet-backdrop" aria-label="Close partner options" onClick={() => setPartnerOpen(false)} />
          <div className="mobile-partner-sheet">
            <div className="mobile-partner-sheet-head">
              <div>
                <p>Partner with TrueServe</p>
                <strong>Choose your path</strong>
              </div>
              <button aria-label="Close partner options" onClick={() => setPartnerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <Link href="/merchant/signup" className="mobile-partner-option" onClick={() => setPartnerOpen(false)}>
              <Store size={21} />
              <span>
                <strong>Merchant signup</strong>
                <small>Toast, Square, Clover, and direct ordering support.</small>
              </span>
            </Link>
            <Link href="/driver/signup" className="mobile-partner-option" onClick={() => setPartnerOpen(false)}>
              <CarFront size={21} />
              <span>
                <strong>Driver signup</strong>
                <small>Apply, upload docs, and start onboarding from your phone.</small>
              </span>
            </Link>
          </div>
        </div>
      )}

      <nav className="mobile-bottom-nav" aria-label="Primary mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.isPartner
                ? pathname.startsWith("/merchant") || pathname.startsWith("/driver")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (item.isPartner) {
            return (
              <button
                key={item.href}
                type="button"
                className={`mobile-bottom-nav-item${isActive || partnerOpen ? " is-active" : ""}`}
                aria-expanded={partnerOpen}
                onClick={() => setPartnerOpen(true)}
              >
                <Icon size={19} strokeWidth={2.2} />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-bottom-nav-item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
