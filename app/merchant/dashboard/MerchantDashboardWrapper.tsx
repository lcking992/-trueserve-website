'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Network,
  Plug,
  ShieldCheck,
  Store,
  UtensilsCrossed,
} from 'lucide-react';

interface MerchantDashboardWrapperProps {
  restaurantName: string;
  hasMultipleLocations?: boolean;
  children: React.ReactNode;
}

export default function MerchantDashboardWrapper({ restaurantName, hasMultipleLocations = false, children }: MerchantDashboardWrapperProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { href: '/merchant/dashboard',             label: 'Dashboard',    icon: LayoutDashboard, dotColor: '#f97316', tour: 'merchant-nav-dashboard'    },
    { href: '/merchant/dashboard/menu',        label: 'Menu',         icon: UtensilsCrossed, dotColor: '#f97316', tour: 'merchant-nav-menu'         },
    { href: '/merchant/dashboard/compliance',  label: 'Compliance',   icon: ShieldCheck,     dotColor: '#4dca80', tour: 'merchant-nav-compliance'   },
    { href: '/merchant/dashboard/integrations',label: 'Integrations', icon: Plug,            dotColor: '#555',    tour: 'merchant-nav-integrations' },
    { href: '/merchant/dashboard/storefront',  label: 'Storefront',   icon: Store,           dotColor: '#555',    tour: 'merchant-nav-storefront'   },
    ...(hasMultipleLocations
      ? [{ href: '/merchant/dashboard/franchise', label: 'Franchise', icon: Network, dotColor: '#555', tour: 'merchant-nav-franchise' }]
      : []),
    { href: '/merchant/dashboard/billing',     label: 'Billing',      icon: CreditCard,      dotColor: '#a78bfa', tour: 'merchant-nav-billing'      },
  ];

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const previous = document.body.style.overflow;
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = previous;
    }
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen]);

  const activeNav = navItems.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'));

  return (
    <>
      <style>{`
        .mch-layout {
          display: flex !important;
          min-height: 100vh !important;
          background: #0f0f0f !important;
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
          color: #e0e0e0 !important;
          font-size: 13px !important;
        }
        .mch-sidebar {
          width: 176px !important;
          min-width: 176px !important;
          max-width: 176px !important;
          background: #111 !important;
          border-right: 0.5px solid #2a2a2a !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 16px 0 !important;
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          height: 100vh !important;
          overflow-y: auto !important;
          z-index: 100 !important;
        }
        .mch-sidebar-shell {
          display: contents !important;
        }
        .mch-logo {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 0 16px 18px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #fff !important;
          border-bottom: 0.5px solid #2a2a2a !important;
          margin-bottom: 8px !important;
        }
        .mch-nav-item {
          display: flex !important;
          align-items: center !important;
          gap: 9px !important;
          padding: 9px 16px !important;
          font-size: 12px !important;
          color: #999 !important;
          text-decoration: none !important;
          border-left: 2px solid transparent !important;
          transition: background 0.15s, color 0.15s !important;
          white-space: nowrap !important;
        }
        .mch-nav-item:hover {
          background: #161616 !important;
          color: #ccc !important;
        }
        .mch-nav-item.mch-active {
          color: #fff !important;
          background: #1a1a1a !important;
          border-left-color: #f97316 !important;
        }
        .mch-nav-dot {
          width: 6px !important;
          height: 6px !important;
          border-radius: 50% !important;
          flex-shrink: 0 !important;
        }
        .mch-nav-icon {
          width: 15px !important;
          height: 15px !important;
          flex-shrink: 0 !important;
        }
        .mch-sidebar-footer {
          margin-top: auto !important;
          padding: 12px 16px !important;
          border-top: 0.5px solid #2a2a2a !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
        }
        .mch-tutorial-btn {
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
          background: #1e1e1e !important;
          border: 0.5px solid #333 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          color: #888 !important;
          font-size: 11px !important;
          cursor: pointer !important;
          width: 100% !important;
          transition: background 0.15s, color 0.15s, border-color 0.15s !important;
          font-family: inherit !important;
        }
        .mch-tutorial-btn:hover {
          background: #252525 !important;
          color: #f97316 !important;
          border-color: #f97316 !important;
        }
        .mch-tutorial-icon {
          width: 16px !important; height: 16px !important;
          border-radius: 50% !important;
          border: 1.5px solid currentColor !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          flex-shrink: 0 !important;
        }
        .mch-logout-btn {
          display: flex !important;
          align-items: center !important;
          gap: 7px !important;
          background: transparent !important;
          border: none !important;
          padding: 7px 0 !important;
          color: #555 !important;
          font-size: 11px !important;
          cursor: pointer !important;
          width: 100% !important;
          font-family: inherit !important;
          transition: color 0.15s !important;
        }
        .mch-logout-btn:hover { color: #f97316 !important; }
        .mch-mobile-topbar {
          display: none !important;
        }
        .mch-mobile-overlay {
          display: none !important;
        }
        .mch-mobile-nav-btn {
          width: 42px !important;
          height: 42px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(249,115,22,0.28) !important;
          background: rgba(255,255,255,0.04) !important;
          color: #f97316 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 18px !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
        }
        .mch-mobile-topbar-copy {
          min-width: 0 !important;
        }
        .mch-mobile-eyebrow {
          color: #6e7782 !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          letter-spacing: .14em !important;
          text-transform: uppercase !important;
          margin-bottom: 4px !important;
        }
        .mch-mobile-title {
          color: #fff !important;
          font-size: 16px !important;
          font-weight: 900 !important;
          line-height: 1.1 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
        }
        .mch-mobile-status {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 6px 10px !important;
          border-radius: 999px !important;
          border: 1px solid rgba(249,115,22,0.22) !important;
          background: rgba(249,115,22,0.08) !important;
          color: #f97316 !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          letter-spacing: .1em !important;
          text-transform: uppercase !important;
          flex-shrink: 0 !important;
        }
        .mch-main {
          flex: 1 !important;
          margin-left: 176px !important;
          padding: 24px !important;
          min-height: 100vh !important;
          overflow: auto !important;
          background: #0f0f0f !important;
        }
        .mch-page-title {
          font-size: 21px !important;
          font-weight: 600 !important;
          color: #fff !important;
          margin-bottom: 2px !important;
        }
        .mch-page-sub {
          font-size: 12px !important;
          color: #666 !important;
          margin-bottom: 18px !important;
        }
        @media (max-width: 980px) {
          .mch-layout {
            display: block !important;
          }
          .mch-sidebar-shell {
            display: block !important;
          }
          .mch-mobile-topbar {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            justify-content: space-between !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 120 !important;
            padding: 14px 16px !important;
            margin: -16px -16px 16px !important;
            background: rgba(15,15,15,0.94) !important;
            backdrop-filter: blur(14px) !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          }
          .mch-mobile-overlay {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0,0,0,0.62) !important;
            backdrop-filter: blur(3px) !important;
            z-index: 109 !important;
          }
          .mch-sidebar {
            width: min(82vw, 280px) !important;
            min-width: min(82vw, 280px) !important;
            max-width: min(82vw, 280px) !important;
            transform: translateX(-105%) !important;
            transition: transform .22s ease !important;
            box-shadow: 20px 0 40px rgba(0,0,0,.35) !important;
            z-index: 130 !important;
          }
          .mch-sidebar.mch-sidebar-open {
            transform: translateX(0) !important;
          }
          .mch-main {
            margin-left: 0 !important;
            padding: 16px !important;
            min-height: 100dvh !important;
          }
          .mch-page-title {
            font-size: 18px !important;
            margin-bottom: 4px !important;
          }
          .mch-page-sub {
            font-size: 11px !important;
            margin-bottom: 14px !important;
          }
          .mch-logo {
            padding: 0 16px 16px !important;
          }
          .mch-nav-item {
            padding: 11px 16px !important;
          }
        }
      `}</style>

      <div className="mch-layout">
        {mobileNavOpen && <button className="mch-mobile-overlay" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

        <div className="mch-sidebar-shell">
          <aside className={`mch-sidebar${mobileNavOpen ? ' mch-sidebar-open' : ''}`}>
            <div className="mch-logo">
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
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={item.tour}
                    className={`mch-nav-item${isActive ? ' mch-active' : ''}`}
                  >
                    <Icon className="mch-nav-icon" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mch-sidebar-footer">
              <button className="mch-tutorial-btn" onClick={() => window.dispatchEvent(new CustomEvent('ts:portal-tour:open', { detail: { portal: 'MERCHANT' } }))}>
                <span className="mch-tutorial-icon">?</span>
                Start tutorial
              </button>
              <form action={logout}>
                <button type="submit" className="mch-logout-btn">
                  <LogOut size={14} aria-hidden="true" /> Log Out
                </button>
              </form>
            </div>
          </aside>
        </div>

        {/* MAIN */}
        <main className="mch-main">
          <div className="mch-mobile-topbar">
            <button className="mch-mobile-nav-btn" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}>
              <MenuIcon size={20} aria-hidden="true" />
            </button>
            <div className="mch-mobile-topbar-copy">
              <div className="mch-mobile-eyebrow">Merchant Portal</div>
              <div className="mch-mobile-title">{restaurantName || 'Merchant Dashboard'}</div>
            </div>
            <div className="mch-mobile-status">
              {activeNav?.label || 'Dashboard'}
            </div>
          </div>
          <div className="mch-page-title">{activeNav?.label ?? 'Dashboard'}</div>
          <div className="mch-page-sub">{restaurantName}</div>
          {children}
        </main>
      </div>
    </>
  );
}
