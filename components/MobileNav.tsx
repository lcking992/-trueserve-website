'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BLACKLISTED_ROUTES = ['/login', '/signup', '/onboarding'];

const DRIVER_TABS = [
  { label: 'Board', href: '/driver/dashboard' },
  { label: 'Trips', href: '/driver/dashboard/trips' },
  { label: 'Pay', href: '/driver/dashboard/pay' },
  { label: 'Account', href: '/driver/dashboard/account' },
];

const MERCHANT_TABS = [
  { label: 'Orders', href: '/merchant/dashboard' },
  { label: 'Menu', href: '/merchant/dashboard/menu' },
  { label: 'Account', href: '/merchant/dashboard/account' },
];

const CUSTOMER_TABS = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/restaurants' },
  { label: 'Orders', href: '/orders' },
  { label: 'Profile', href: '/profile' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-white md:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className="flex flex-1 flex-col items-center py-2 text-xs"
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
