'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/driver/dashboard',            tour: 'driver-nav-dashboard',   label: 'Dashboard'   },
  { href: '/driver/dashboard/earnings',   tour: 'driver-nav-earnings',    label: 'Settlements' },
  { href: '/driver/dashboard/ratings',    tour: 'driver-nav-ratings',     label: 'Reputation'  },
  { href: '/driver/dashboard/compliance', tour: 'driver-nav-compliance',  label: 'Compliance'  },
  { href: '/driver/dashboard/account',    tour: 'driver-nav-account',     label: 'Profile'     },
  { href: '/driver/dashboard/disputes',   tour: 'driver-nav-disputes',    label: 'Disputes' },
];

export default function DriverNavChips() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            data-tour={item.tour}
            href={item.href}
            className={`drv-nav-chip${isActive ? ' drv-active' : ''}`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
