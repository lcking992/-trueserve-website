'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';
import {
  AlertTriangle,
  CircleHelp,
  ClipboardList,
  IdCard,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  ShieldCheck,
  Star,
  WalletCards,
} from 'lucide-react';

interface DriverPortalWrapperProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DriverPortalWrapper({ children, pageTitle, pageSubtitle }: DriverPortalWrapperProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileNavOpen ? 'hidden' : prev;
    return () => { document.body.style.overflow = prev; };
  }, [mobileNavOpen]);

  const navItems = [
    { href: '/driver/dashboard', label: 'Dashboard', icon: LayoutDashboard, tour: 'driver-nav-dashboard' },
    { href: '/driver/dashboard/earnings', label: 'Settlements', icon: WalletCards, tour: 'driver-nav-earnings' },
    { href: '/driver/dashboard/ratings', label: 'Reputation', icon: Star, tour: 'driver-nav-ratings' },
    { href: '/driver/dashboard/compliance', label: 'Compliance', icon: ShieldCheck, tour: 'driver-nav-compliance' },
    { href: '/driver/dashboard/account',   label: 'Profile',   icon: IdCard, tour: 'driver-nav-account'   },
    { href: '/driver/dashboard/disputes',  label: 'Disputes',  icon: AlertTriangle, tour: 'driver-nav-disputes'  },
    { href: '/driver/dashboard/help',      label: 'Help',      icon: CircleHelp, tour: 'driver-nav-help'      },
  ];

  return (
    <>
      <style>{`
        .drv-layout {
          display: flex !important;
          min-height: 100vh !important;
          background: #0a0c09 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          color: #e0e0e0 !important;
          font-size: 13px !important;
        }
        .drv-sidebar {
          width: 200px !important;
          min-width: 200px !important;
          max-width: 200px !important;
          background: #0f1210 !important;
          border-right: 1px solid #1e2420 !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 16px 0 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          height: 100vh !important;
          overflow-y: auto !important;
          z-index: 100 !important;
        }
        .drv-logo {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 0 16px 16px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          color: #fff !important;
          border-bottom: 1px solid #1e2420 !important;
          margin-bottom: 8px !important;
        }
        .drv-nav-item {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 9px 16px !important;
          font-size: 13px !important;
          color: #999 !important;
          text-decoration: none !important;
          border-left: 2px solid transparent !important;
          transition: background 0.15s, color 0.15s !important;
          white-space: nowrap !important;
          background: transparent !important;
          width: 100% !important;
        }
        .drv-nav-item:hover {
          background: rgba(249,115,22,0.06) !important;
          color: #f97316 !important;
        }
        .drv-nav-item.drv-active {
          color: #f97316 !important;
          background: rgba(249,115,22,0.08) !important;
          border-left-color: #f97316 !important;
        }
        .drv-nav-icon {
          width: 15px !important;
          height: 15px !important;
          flex-shrink: 0 !important;
        }
        .drv-sidebar-footer {
          margin-top: auto !important;
          padding: 12px 16px 0 !important;
          border-top: 1px solid #1e2420 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }
        .drv-tutorial-btn {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          color: #bbb !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          width: 100% !important;
          transition: background 0.15s, color 0.15s, border-color 0.15s !important;
          font-family: inherit !important;
        }
        .drv-tutorial-btn:hover {
          background: rgba(249,115,22,0.06) !important;
          color: #f97316 !important;
          border-color: rgba(249,115,22,0.35) !important;
        }
        .drv-tutorial-icon {
          width: 16px !important;
          height: 16px !important;
          border-radius: 4px !important;
          border: 1.5px solid currentColor !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          flex-shrink: 0 !important;
        }
        .drv-logout-btn {
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
          background: transparent !important;
          border: none !important;
          padding: 7px 0 9px !important;
          color: #666 !important;
          font-size: 11px !important;
          cursor: pointer !important;
          width: 100% !important;
          font-family: inherit !important;
          font-weight: 700 !important;
          transition: color 0.15s !important;
        }
        .drv-logout-btn:hover { color: #f97316 !important; }
        .drv-main {
          flex: 1 !important;
          margin-left: 200px !important;
          padding: 20px 24px 40px !important;
          min-height: 100vh !important;
          overflow: auto !important;
          background: #0a0c09 !important;
        }
        .drv-main [class*="rounded-2xl"],
        .drv-main [class*="rounded-3xl"],
        .drv-main [class*="rounded-[18px]"],
        .drv-main [class*="rounded-[20px]"],
        .drv-main [class*="rounded-[22px]"],
        .drv-main [class*="rounded-[24px]"],
        .drv-main [class*="rounded-[28px]"],
        .drv-main [class*="rounded-[32px]"] {
          border-radius: 8px !important;
        }
        .drv-page-title {
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin-bottom: 4px !important;
          letter-spacing: -0.01em !important;
        }
        .drv-page-sub {
          font-size: 13px !important;
          color: #666 !important;
          margin-bottom: 18px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
          font-weight: 600 !important;
        }
        /* ── Mobile: hamburger drawer (mirrors merchant portal) ── */
        .drv-mobile-topbar { display: none !important; }
        .drv-mobile-overlay { display: none !important; }
        .drv-mobile-nav-btn {
          width: 42px !important; height: 42px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(249,115,22,0.28) !important;
          background: rgba(255,255,255,0.04) !important;
          color: #f97316 !important;
          display: inline-flex !important;
          align-items: center !important; justify-content: center !important;
          font-size: 18px !important; cursor: pointer !important;
          flex-shrink: 0 !important;
        }
        .drv-mobile-eyebrow {
          color: #6e7782 !important; font-size: 10px !important;
          font-weight: 800 !important; letter-spacing: .14em !important;
          text-transform: uppercase !important; margin-bottom: 4px !important;
        }
        .drv-mobile-title {
          color: #fff !important; font-size: 16px !important;
          font-weight: 900 !important; line-height: 1.1 !important;
          white-space: nowrap !important; overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
          .drv-mobile-status {
          display: inline-flex !important; align-items: center !important;
          gap: 6px !important; padding: 6px 10px !important;
          border-radius: 999px !important;
          border: 1px solid rgba(249,115,22,0.22) !important;
          background: rgba(249,115,22,0.08) !important;
          color: #f97316 !important; font-size: 10px !important;
          font-weight: 800 !important; letter-spacing: .1em !important;
          text-transform: uppercase !important; flex-shrink: 0 !important;
        }
        .drv-bottom-nav {
          display: none !important;
        }

        @media (max-width: 767px) {
          .drv-layout { display: block !important; }
          .drv-mobile-topbar {
            display: flex !important;
            align-items: center !important; gap: 12px !important;
            justify-content: space-between !important;
            position: sticky !important; top: 0 !important; z-index: 120 !important;
            padding: 14px 16px !important;
            margin: -14px -14px 16px !important;
            background: rgba(10,12,9,0.94) !important;
            backdrop-filter: blur(14px) !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          }
          .drv-mobile-overlay {
            display: block !important;
            position: fixed !important; inset: 0 !important;
            background: rgba(0,0,0,0.62) !important;
            backdrop-filter: blur(3px) !important;
            z-index: 109 !important;
          }
          .drv-sidebar {
            width: min(82vw, 260px) !important;
            min-width: min(82vw, 260px) !important;
            max-width: min(82vw, 260px) !important;
            transform: translateX(-105%) !important;
            transition: transform .22s ease !important;
            box-shadow: 20px 0 40px rgba(0,0,0,.35) !important;
            z-index: 130 !important;
          }
          .drv-sidebar.drv-sidebar-open { transform: translateX(0) !important; }
          .drv-main { margin-left: 0 !important; padding: 14px 14px 96px !important; min-height: 100dvh !important; }
          .dd-two-col, .dd-bottom-grid { grid-template-columns: 1fr !important; }
          .dd-stat-grid { grid-template-columns: 1fr 1fr !important; }
          .dd-addr-grid { grid-template-columns: 1fr !important; }
          .drv-bottom-nav {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 4px !important;
            position: fixed !important;
            left: 10px !important;
            right: 10px !important;
            bottom: calc(10px + env(safe-area-inset-bottom)) !important;
            z-index: 125 !important;
            padding: 8px !important;
            border-radius: 18px !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            background: rgba(12,15,13,0.94) !important;
            backdrop-filter: blur(18px) !important;
            box-shadow: 0 18px 50px rgba(0,0,0,0.4) !important;
          }
          .drv-bottom-link {
            min-width: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 4px !important;
            min-height: 54px !important;
            border-radius: 13px !important;
            color: #7f877f !important;
            text-decoration: none !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            letter-spacing: 0.02em !important;
          }
          .drv-bottom-link svg {
            width: 18px !important;
            height: 18px !important;
          }
          .drv-bottom-link.drv-active {
            color: #f97316 !important;
            background: rgba(249,115,22,0.1) !important;
          }
        }

        /* ── Tablet: slimmer sidebar ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          .drv-sidebar { width: 160px !important; min-width: 160px !important; max-width: 160px !important; }
          .drv-main { margin-left: 160px !important; padding: 16px 18px !important; }
        }
      `}</style>

      <div className="drv-layout">
        {mobileNavOpen && (
          <button className="drv-mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />
        )}

        <aside className={`drv-sidebar${mobileNavOpen ? ' drv-sidebar-open' : ''}`}>
          <div className="drv-logo">
            <img
              src="/logo.png"
              alt="TrueServe"
              width={26}
              height={26}
              style={{ borderRadius: '50%', boxShadow: '0 0 8px rgba(232,124,43,0.4)', flexShrink: 0 }}
            />
            <span style={{ color: '#fff', fontWeight: 700 }}>
              True<span style={{ color: '#f97316' }}>Serve</span>
            </span>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  data-tour={item.tour}
                  href={item.href}
                  className={`drv-nav-item${isActive ? ' drv-active' : ''}`}
                >
                  <Icon className="drv-nav-icon" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="drv-sidebar-footer">
            <button
              className="drv-tutorial-btn"
              onClick={() => window.dispatchEvent(new CustomEvent('ts:portal-tour:open', { detail: { portal: 'DRIVER' } }))}
            >
              <span className="drv-tutorial-icon">?</span>
              Start tutorial
            </button>
            <form action={logout}>
              <button type="submit" className="drv-logout-btn">
                <LogOut size={14} aria-hidden="true" /> Log Out
              </button>
            </form>
          </div>
        </aside>

        <main className="drv-main">
          {/* Mobile top bar */}
          <div className="drv-mobile-topbar">
            <button className="drv-mobile-nav-btn" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
              <MenuIcon size={20} aria-hidden="true" />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="drv-mobile-eyebrow">Driver Portal</div>
              <div className="drv-mobile-title">
                {navItems.find(i => pathname === i.href || (i.href !== '/driver/dashboard' && pathname.startsWith(i.href)))?.label || 'Dashboard'}
              </div>
            </div>
            <div className="drv-mobile-status">
              {navItems.find(i => pathname === i.href || (i.href !== '/driver/dashboard' && pathname.startsWith(i.href)))?.label || 'Dashboard'}
            </div>
          </div>

          {pageTitle || pageSubtitle ? (
            <>
              {pageTitle ? <div className="drv-page-title">{pageTitle}</div> : null}
              {pageSubtitle ? <div className="drv-page-sub">{pageSubtitle}</div> : null}
            </>
          ) : null}
          {children}
        </main>

        <nav className="drv-bottom-nav" aria-label="Driver quick navigation">
          {[
            { href: '/driver/dashboard', label: 'Offers', icon: ClipboardList },
            { href: '/driver/dashboard/earnings', label: 'Earnings', icon: WalletCards },
            { href: '/driver/dashboard/help', label: 'Support', icon: CircleHelp },
            { href: '/driver/dashboard/account', label: 'Profile', icon: IdCard },
          ].map((item) => {
            const isActive = pathname === item.href || (item.href !== '/driver/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`drv-bottom-link${isActive ? ' drv-active' : ''}`}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
