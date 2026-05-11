import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminPortalWrapper from "../AdminPortalWrapper";
import { isMockAdminRecord } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function getPostHogWorkspaceUrl(host?: string) {
    if (!host) return null;
    if (host.includes("eu.i.posthog.com")) return "https://eu.posthog.com";
    if (host.includes("us.i.posthog.com")) return "https://us.posthog.com";
    return null;
}

export default async function AnalyticsPage() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'analytics'));
    if (!isAuthorized) redirect("/admin/login");

    const [restaurantRes, driverRes, orderRes] = await Promise.all([
        supabaseAdmin.from('Restaurant').select('visibility, isMock, owner:User(email, name, isMock)'),
        supabaseAdmin.from('Driver').select('status, vehicleVerified, user:User(email, name, isMock)'),
        supabaseAdmin.from('Order').select('totalAmount, status, createdAt').order('createdAt', { ascending: false }).limit(500),
    ]);

    const totalRestaurants = (restaurantRes.data || []).filter((restaurant: any) =>
        restaurant.visibility === 'VISIBLE' &&
        !restaurant.isMock &&
        !isMockAdminRecord(restaurant.owner)
    ).length;
    const totalDrivers = (driverRes.data || []).filter((driver: any) =>
        driver.vehicleVerified === true &&
        driver.status !== 'REJECTED' &&
        !isMockAdminRecord(driver.user)
    ).length;
    const orders = orderRes.data || [];
    const completed = orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status));
    const totalRevenue = completed.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt?.startsWith(today)).length;
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "";
    const posthogEnabled = Boolean(posthogKey && posthogHost);
    const posthogWorkspaceUrl = getPostHogWorkspaceUrl(posthogHost);
    const maskedPosthogKey = posthogKey
        ? `${posthogKey.slice(0, 7)}••••${posthogKey.slice(-4)}`
        : "Missing";

    const stats = [
        { icon: 'Restaurant', label: 'Visible Restaurants',      value: totalRestaurants },
        { icon: 'Driver', label: 'Verified Drivers',         value: totalDrivers },
        { icon: 'Order', label: 'Orders (Last 500)',        value: orders.length },
        { icon: 'Done', label: 'Completed Orders',         value: completed.length },
        { icon: 'Date', label: 'Orders Today',             value: todayOrders },
        { icon: 'Revenue', label: 'Revenue (Completed)',      value: `$${totalRevenue.toFixed(2)}` },
    ];

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .an-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
                .an-stat { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px; }
                .an-stat-label { font-size: 12px; color: #777; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
                .an-stat-value { font-size: 26px; font-weight: 500; color: #fff; }
                .an-posthog { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 18px; margin-bottom: 20px; }
                .an-posthog-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 12px; }
                .an-posthog-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 4px; }
                .an-posthog-sub { font-size: 12px; color: #555; line-height: 1.6; }
                .an-posthog-badge { font-size: 11px; font-weight: 700; border-radius: 999px; padding: 5px 10px; white-space: nowrap; }
                .an-posthog-badge.on { color: #34d399; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); }
                .an-posthog-badge.off { color: #f87171; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); }
                .an-posthog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
                .an-posthog-cell { background: #0f1210; border: 1px solid #1e2420; border-radius: 8px; padding: 12px; }
                .an-posthog-k { font-size: 11px; color: #666; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.08em; }
                .an-posthog-v { font-size: 13px; color: #ddd; line-height: 1.5; word-break: break-word; font-family: monospace; }
                .an-posthog-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
                .an-posthog-link { display: inline-flex; align-items: center; gap: 6px; background: #f97316; color: #000; border-radius: 6px; padding: 8px 12px; font-size: 12px; font-weight: 700; text-decoration: none; }
                .an-posthog-note { font-size: 12px; color: #777; margin-top: 10px; line-height: 1.6; }
                @media (max-width: 900px) { .an-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 900px) { .an-posthog-grid { grid-template-columns: 1fr; } }
            `}</style>

                <div className="adm-page-header">
                <h1>Analytics</h1>
                <p>Live platform metrics from the database, excluding mock and hidden records</p>
            </div>
            <div className="adm-page-body">
                <div className="an-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="an-stat">
                            <div className="an-stat-label"><span>{s.icon}</span>{s.label}</div>
                            <div className="an-stat-value">{s.value}</div>
                        </div>
                    ))}
                </div>
                <div className="an-posthog">
                    <div className="an-posthog-head">
                        <div>
                            <div className="an-posthog-title">PostHog Product Analytics</div>
                            <div className="an-posthog-sub">
                                Tracks customer activity, pageviews, and signed-in user identification from the live TrueServe app.
                            </div>
                        </div>
                        <span className={`an-posthog-badge ${posthogEnabled ? "on" : "off"}`}>
                            {posthogEnabled ? "Enabled" : "Needs Config"}
                        </span>
                    </div>

                    <div className="an-posthog-grid">
                        <div className="an-posthog-cell">
                            <div className="an-posthog-k">Project Key</div>
                            <div className="an-posthog-v">{maskedPosthogKey}</div>
                        </div>
                        <div className="an-posthog-cell">
                            <div className="an-posthog-k">Ingestion Host</div>
                            <div className="an-posthog-v">{posthogHost || "Missing"}</div>
                        </div>
                        <div className="an-posthog-cell">
                            <div className="an-posthog-k">Tracking Scope</div>
                            <div className="an-posthog-v">Pageviews, auth identify/reset, checkout starts, order placements, and signup funnel events</div>
                        </div>
                    </div>

                    <div className="an-posthog-actions">
                        {posthogWorkspaceUrl ? (
                            <a href={posthogWorkspaceUrl} target="_blank" rel="noreferrer" className="an-posthog-link">
                                Open PostHog Workspace ↗
                            </a>
                        ) : null}
                    </div>

                    <div className="an-posthog-note">
                        If no events appear yet, visit the live site, navigate a few pages, and sign in once to trigger identify events.
                    </div>
                </div>
                <div className="adm-card">
                    <div className="adm-card-title">Coming Soon</div>
                    <p style={{ color: '#555', fontSize: 13 }}>
                        Full analytics dashboards with charts, trend lines, and breakdowns by state/cuisine are coming in a future update.
                    </p>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
