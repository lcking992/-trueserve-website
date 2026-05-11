'use client';

import Link from 'next/link';
import AdminPortalWrapper from '../AdminPortalWrapper';
import { connectStripe } from '../actions';
import { canAccessAdminSection } from '@/lib/rbac';

interface DashboardProps {
  role?: string;
  stats: {
    activeMerchants: number;
    activeDrivers: number;
    ordersToday: number;
    revenueToday: number;
  };
  recentActivity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'merchant' | 'driver' | 'order' | 'system';
  }>;
}

export default function AdminDashboard({ role, stats, recentActivity }: DashboardProps) {
  const canView = (section: Parameters<typeof canAccessAdminSection>[1]) =>
    !role || canAccessAdminSection(role, section);

  const quickCards = [
    { icon: '💰', title: 'Cost Management', desc: 'Track spending across all services (Stripe, Supabase, Google Cloud, Resend, Vonage)', href: '/admin/cost-management', section: 'cost-management' as const },
    { icon: '📈', title: 'Analytics', desc: 'Real-time metrics on orders, drivers, merchants, and platform health', href: '/admin/analytics', section: 'analytics' as const },
    { icon: '👤', title: 'User Management', desc: 'View and manage drivers, merchants, and customer accounts', href: '/admin/users', section: 'users' as const },
    { icon: '🍽️', title: 'Restaurant Photos', desc: 'Upload and manage cover photos for all restaurants', href: '/admin/restaurants', section: 'users' as const },
  ].filter((card) => canView(card.section));

  const quickActions = [
    canView('cost-management') && (
      <form key="stripe" action={connectStripe}>
        <button type="submit" className="adm-stripe-btn">
          💳 Open Stripe Dashboard
        </button>
      </form>
    ),
    canView('team') && (
      <Link key="team" href="/admin/team" className="adm-stripe-btn">
        👥 Manage Team
      </Link>
    ),
    canView('dashboard') && (
      <Link key="orders" href="/admin/orders" className="adm-stripe-btn" style={{ background: '#1e3a2a', color: '#4dca80', border: '1px solid #1e4a2e' }}>
        📦 Live Order Board
      </Link>
    ),
    canView('feature-switches') && (
      <Link key="flags" href="/admin/feature-switches" className="adm-stripe-btn">
        🔧 Feature Switches
      </Link>
    ),
  ].filter(Boolean);

    return (
    <AdminPortalWrapper role={role}>
      <style>{`
        .adm-stats {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 12px !important;
          margin-bottom: 16px !important;
        }
        .adm-stat {
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 14px 16px !important;
        }
        .adm-stat-label {
          font-size: 12px !important;
          color: #777 !important;
          margin-bottom: 6px !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .adm-stat-value {
          font-size: 26px !important;
          font-weight: 500 !important;
          color: #fff !important;
        }
        .adm-dash-cards {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 12px !important;
          margin-bottom: 16px !important;
        }
        .adm-dash-card {
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 18px !important;
          text-decoration: none !important;
          display: block !important;
          transition: border-color 150ms !important;
        }
        .adm-dash-card:hover {
          border-color: rgba(249,115,22,0.4) !important;
        }
        .adm-dash-card-title {
          font-size: 15px !important;
          font-weight: 500 !important;
          color: #fff !important;
          margin-bottom: 6px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .adm-dash-card-desc {
          font-size: 12px !important;
          color: #777 !important;
          line-height: 1.5 !important;
          margin-bottom: 12px !important;
        }
        .adm-dash-card-link {
          font-size: 12px !important;
          color: #f97316 !important;
        }
        .adm-activity {
          background: #141a18 !important;
          border: 1px solid #1e2420 !important;
          border-radius: 8px !important;
          padding: 18px !important;
          margin-bottom: 16px !important;
        }
        .adm-activity h2 {
          font-size: 15px !important;
          font-weight: 500 !important;
          color: #fff !important;
          margin: 0 0 10px 0 !important;
        }
        .adm-activity p {
          font-size: 13px !important;
          color: #555 !important;
          margin: 0 !important;
        }
        .adm-activity-item {
          display: flex !important;
          justify-content: space-between !important;
          padding: 10px 0 !important;
          border-bottom: 1px solid #1e2420 !important;
        }
        .adm-activity-item:last-child { border-bottom: none !important; }
        .adm-activity-msg { font-size: 13px !important; color: #ccc !important; margin: 0 !important; }
        .adm-activity-time { font-size: 12px !important; color: #555 !important; white-space: nowrap !important; margin: 0 0 0 16px !important; }
        .adm-stripe-btn {
          background: #f97316 !important;
          color: #000 !important;
          border: none !important;
          border-radius: 6px !important;
          padding: 8px 16px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          text-decoration: none !important;
          transition: background 150ms !important;
        }
        .adm-stripe-btn:hover { background: #fb923c !important; }
        @media (max-width: 1024px) {
          .adm-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .adm-dash-cards { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .adm-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .adm-dash-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Page Header */}
      <div className="adm-page-header">
        <h1>Welcome to Admin Portal</h1>
        <p>Manage TrueServe operations and analytics</p>
      </div>

      <div className="adm-page-body">
        {/* Stats */}
        <div className="adm-stats">
          {[
            { icon: '👨‍💼', label: 'Active Merchants', value: stats.activeMerchants },
            { icon: '🚗',   label: 'Active Drivers',   value: stats.activeDrivers },
            { icon: '📦',   label: 'Orders Today',     value: stats.ordersToday },
            { icon: '💵',   label: 'Revenue (Today)',  value: `$${stats.revenueToday.toLocaleString()}` },
          ].map((s, i) => (
            <div key={i} className="adm-stat">
              <div className="adm-stat-label"><span>{s.icon}</span>{s.label}</div>
              <div className="adm-stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Access Cards */}
        <div className="adm-dash-cards">
          {quickCards.map((c, i) => (
            <Link key={i} href={c.href} className="adm-dash-card">
              <div className="adm-dash-card-title"><span>{c.icon}</span>{c.title}</div>
              <div className="adm-dash-card-desc">{c.desc}</div>
              <span className="adm-dash-card-link">View →</span>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="adm-activity" style={{ marginBottom: 16 }}>
          <h2>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {quickActions}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="adm-activity">
          <h2>Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p>No recent activity</p>
          ) : recentActivity.map((a) => (
            <div key={a.id} className="adm-activity-item">
              <p className="adm-activity-msg">{a.message}</p>
              <p className="adm-activity-time">{a.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminPortalWrapper>
  );
}
