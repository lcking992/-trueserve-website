"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { getAccountHomeHref } from "@/lib/account-routing";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/drive", label: "Drive" },
  { href: "/merchant", label: "For Merchants" },
  { href: "/rewards", label: "Rewards" },
  { href: "/contact", label: "Help" },
];

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [userId, setUserId] = useState<string | null>(null);
  const [accountHref, setAccountHref] = useState("/user/settings");
  const [menuOpen, setMenuOpen] = useState(false);

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
    return () => {
      mounted = false;
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="ts-fig-header">
      <div className="ts-fig-container ts-fig-header-inner">
        <Logo size="sm" />
        <div className="ts-fig-nav" role="navigation" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : undefined}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="ts-fig-header-actions">
          <Link href={userId ? accountHref : "/login"} className="ts-fig-link">
            {userId ? "Account" : "Sign In"}
          </Link>
          <Link href={userId ? "/restaurants" : "/signup"} className="ts-fig-btn">
            {userId ? "Order now" : "Sign Up"}
          </Link>
          <button
            type="button"
            className="ts-fig-mobile-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div className={`ts-fig-mobile-menu${menuOpen ? " is-open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href) ? "active" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href={userId ? accountHref : "/login"} onClick={() => setMenuOpen(false)}>
          {userId ? "Account" : "Sign In"}
        </Link>
      </div>
    </header>
  );
}
