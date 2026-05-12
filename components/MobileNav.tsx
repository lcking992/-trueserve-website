'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ClipboardList,
  User,
  LayoutDashboard,
  Navigation,
  Wallet,
  UtensilsCrossed,
} from 'lucide-react';

const BLACKLISTED_ROUTES = ['/login', '/signup', '/onboarding'];

const DRIVER_TABS = [
  { label: 'Board', href: '/driver/dashboard', Icon: LayoutDashboard },
  { label: 'Trips', href: '/driver/dashboard/trips', Icon: Navigation },
  { label: 'Pay', href: '/driver/dashboard/pay', Icon: Wallet },
  { label: 'Account', href: '/driver/dashboard/account', Icon: User },
];

const MERCHANT_TABS = [
  { label: 'Orders', href: '/merchant/dashboard', Icon: ClipboardList },
  { label: 'Menu', href: '/merchant/dashboard/menu', Icon: UtensilsCrossed },
  { label: 'Account', href: '/merchant/dashboard/account', Icon: User },
];

const CUSTOMER_TABS = [
  { label: 'Home', href: '/', Icon: Home },
  { label: 'Search', href: '/restaurants', Icon: Search },
  { label: 'Orders', href: '/orders', Icon: ClipboardList },
  { label: 'Profile', href: '/profile', Icon: User },
];

interface MobileNavProps {
  role?: 'DRIVER' | 'MERCHANT' | 'CUSTOMER';
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  if (BLACKLISTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  const tabs =
    role === 'DRIVER'
      ? DRIVER_TABS
      : role === 'MERCHANT'
      ? MERCHANT_TABS
      : CUSTOMER_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-[#0c0f0d] md:hidden">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              isActive ? 'text-[#f97316]' : 'text-white/40'
            }`}
          >
            <tab.Icon size={20} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
