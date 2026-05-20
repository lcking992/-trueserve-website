import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/actions";
import { canAccessAdminSection } from "@/lib/rbac";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { approveDriver, approveMerchant, rejectDriver, rejectMerchant } from "../actions";
import AdminPortalWrapper from "../AdminPortalWrapper";
import { resolveDriverDocumentUrl } from "@/lib/driver-documents";
import { filterAdminUsers, isMockAdminRecord, shouldHideMockAdminData } from "@/lib/admin-data";
import DriverApplicationActions from "@/components/admin/DriverApplicationActions";
import MerchantApplicationActions from "@/components/admin/MerchantApplicationActions";
import DriverPipeline from "@/components/admin/DriverPipeline";

export const dynamic = "force-dynamic";

export default async function UsersPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const query = (resolvedSearchParams.q || "").trim().toLowerCase();
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    const isAuthorized = !!adminSession || (isAuth && canAccessAdminSection(role, 'users'));
    if (!isAuthorized) redirect("/admin/login");

    const { data: users } = await supabaseAdmin
        .from('User')
        .select('id, email, name, role, createdAt')
        .order('createdAt', { ascending: false })
        .limit(100);

    const { data: drivers } = await supabaseAdmin
        .from('Driver')
        .select(`
            id,
            userId,
            status,
            complianceStatus,
            vehicleType,
            createdAt,
            updatedAt,
            vehicleVerified,
            backgroundCheckStatus,
            aiMetadata,
            insuranceDocumentUrl,
            registrationDocumentUrl,
            user:User(id, name, email, phone)
        `)
        .order('updatedAt', { ascending: false })
        .limit(250);

    const { data: driverAlerts } = await supabaseAdmin
        .from('Notification')
        .select('id, userId, title, message, type, createdAt')
        .eq('type', 'DRIVER_APPLICATION')
        .order('createdAt', { ascending: false })
        .limit(10);

    const { data: merchantRestaurants } = await supabaseAdmin
        .from('Restaurant')
        .select(`
            id,
            ownerId,
            name,
            address,
            city,
            state,
            phone,
            visibility,
            plan,
            posSystem,
            createdAt,
            updatedAt,
            owner:User(id, name, email, phone, role, createdAt)
        `)
        .order('createdAt', { ascending: false })
        .limit(24);

    const { data: merchantAlerts } = await supabaseAdmin
        .from('Notification')
        .select('id, userId, title, message, type, createdAt')
        .eq('type', 'MERCHANT_APPLICATION')
        .order('createdAt', { ascending: false })
        .limit(10);

    const driverDocs = await Promise.all((drivers || []).map(async (driver: any) => {
        const documentPaths = driver.aiMetadata?.documentPaths || {};
        const [licenseUrl, insuranceUrl, registrationUrl] = await Promise.all([
            resolveDriverDocumentUrl(documentPaths.idDocumentPath || null, 60 * 60),
            resolveDriverDocumentUrl(documentPaths.insuranceDocumentPath || driver.insuranceDocumentUrl || null, 60 * 60),
            resolveDriverDocumentUrl(documentPaths.registrationDocumentPath || driver.registrationDocumentUrl || null, 60 * 60),
        ]);

        return {
            ...driver,
            licenseUrl,
            insuranceUrl,
            registrationUrl,
        };
    }));

    const allUsers = filterAdminUsers(users || []);
    const visibleDriverDocs = shouldHideMockAdminData()
        ? driverDocs.filter((driver: any) => !isMockAdminRecord(driver.user))
        : driverDocs;
    const visibleDriverUsers = shouldHideMockAdminData()
        ? allUsers.filter((user: any) => user.role === 'DRIVER' && !isMockAdminRecord(user))
        : allUsers.filter((user: any) => user.role === 'DRIVER');
    const visibleMerchantUsers = shouldHideMockAdminData()
        ? allUsers.filter((user: any) => user.role === 'MERCHANT' && !isMockAdminRecord(user))
        : allUsers.filter((user: any) => user.role === 'MERCHANT');
    const byRole: Record<string, number> = {};
    allUsers.forEach(u => { byRole[u.role] = (byRole[u.role] || 0) + 1; });

    const roleColor: Record<string, string> = {
        ADMIN: '#f97316', PM: '#f97316', OPS: '#f97316',
        SUPPORT: '#f97316', FINANCE: '#f97316', READONLY: '#94a3b8', QA_TESTER: '#f97316',
        MERCHANT: '#fbbf24', DRIVER: '#34d399', CUSTOMER: '#818cf8',
    };

    const driverDocsWithLinks = visibleDriverDocs
        .filter((driver: any) => driver.licenseUrl || driver.insuranceUrl || driver.registrationUrl)
        .sort((a: any, b: any) => {
            const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
            const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
            return bTime - aTime;
        });
    const recentDriverApplications = visibleDriverDocs
        .filter((driver: any) => driver.status !== 'REJECTED' && !driver.vehicleVerified)
        .sort((a: any, b: any) => {
            const aDocs = [a.licenseUrl, a.insuranceUrl, a.registrationUrl].filter(Boolean).length;
            const bDocs = [b.licenseUrl, b.insuranceUrl, b.registrationUrl].filter(Boolean).length;
            if (aDocs !== bDocs) return bDocs - aDocs;
            return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
        })
        .slice(0, 10);
    const recentDriverSignupHistory = visibleDriverUsers.slice(0, 10).map((user: any) => {
        const linkedDriver = visibleDriverDocs.find((driver: any) => driver.userId === user.id);
        return {
            ...user,
            linkedDriver,
        };
    });

    const visibleMerchantApplications = shouldHideMockAdminData()
        ? (merchantRestaurants || []).filter((restaurant: any) => !isMockAdminRecord(restaurant.owner))
        : (merchantRestaurants || []);
    const recentMerchantSignupHistory = visibleMerchantUsers.slice(0, 10).map((user: any) => {
        const linkedRestaurant = visibleMerchantApplications.find((restaurant: any) => restaurant.ownerId === user.id);
        return {
            ...user,
            linkedRestaurant,
        };
    });
    const recentMerchantApplications = visibleMerchantApplications
        .filter((restaurant: any) => String(restaurant.visibility || "HIDDEN").toUpperCase() !== "VISIBLE")
        .slice(0, 10);

    const docState = (driver: any) => {
        const readyDocs = [driver.licenseUrl, driver.insuranceUrl, driver.registrationUrl].filter(Boolean).length;
        return `${readyDocs}/3 docs`;
    };

    const recentDriverAlerts = (driverAlerts || []).map((alert: any) => ({
        ...alert,
        summary: String(alert.message || alert.title || ''),
    }));
    const recentMerchantAlerts = (merchantAlerts || []).map((alert: any) => ({
        ...alert,
        summary: String(alert.message || alert.title || ''),
    }));

    const matchesQuery = (value: unknown) =>
        !query || String(value || "").toLowerCase().includes(query);

    const filteredDriverSignupHistory = recentDriverSignupHistory.filter((user: any) =>
        matchesQuery(user.name) ||
        matchesQuery(user.email) ||
        matchesQuery(user.role) ||
        matchesQuery(user.linkedDriver?.status)
    );
    const filteredDriverApplications = recentDriverApplications.filter((driver: any) =>
        matchesQuery(driver.user?.name) ||
        matchesQuery(driver.user?.email) ||
        matchesQuery(driver.status) ||
        matchesQuery(driver.backgroundCheckStatus)
    );
    const filteredDriverAlerts = recentDriverAlerts.filter((alert: any) =>
        matchesQuery(alert.title) ||
        matchesQuery(alert.summary)
    );
    const filteredMerchantSignupHistory = recentMerchantSignupHistory.filter((user: any) =>
        matchesQuery(user.name) ||
        matchesQuery(user.email) ||
        matchesQuery(user.role) ||
        matchesQuery(user.linkedRestaurant?.name) ||
        matchesQuery(user.linkedRestaurant?.visibility)
    );
    const filteredMerchantApplications = recentMerchantApplications.filter((restaurant: any) =>
        matchesQuery(restaurant.name) ||
        matchesQuery(restaurant.address) ||
        matchesQuery(restaurant.visibility) ||
        matchesQuery(restaurant.posSystem)
    );
    const filteredMerchantAlerts = recentMerchantAlerts.filter((alert: any) =>
        matchesQuery(alert.title) ||
        matchesQuery(alert.summary)
    );

    return (
        <AdminPortalWrapper role={role}>
            <style>{`
                .um-summary { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
                .um-badge { background: #141a18; border: 1px solid #1e2420; border-radius: 6px; padding: 10px 16px; }
                .um-badge strong { font-size: 20px; font-weight: 600; color: #fff; display: block; }
                .um-badge span { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; }
                .um-docs { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
                .um-docs h2 { font-size: 15px; font-weight: 500; color: #fff; margin: 0 0 6px 0; }
                .um-docs p { font-size: 12px; color: #777; margin: 0 0 14px 0; line-height: 1.5; }
                .um-doc-note { margin-top: 10px; padding: 10px 12px; border-radius: 6px; border: 1px solid rgba(249,115,22,0.18); background: rgba(249,115,22,0.05); color: #c9c0b6; font-size: 11px; line-height: 1.5; }
                .um-apps { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
                .um-apps h2 { font-size: 15px; font-weight: 500; color: #fff; margin: 0 0 6px 0; }
                .um-apps p { font-size: 12px; color: #777; margin: 0 0 14px 0; line-height: 1.5; }
                .um-app-list { display: flex; flex-direction: column; gap: 10px; }
                .um-app-item { display: flex; justify-content: space-between; gap: 16px; padding: 12px 14px; border: 1px solid #1e2420; border-radius: 6px; background: #101512; }
                .um-app-status { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; padding: 2px 8px; border-radius: 999px; border: 1px solid rgba(249,115,22,0.18); background: rgba(249,115,22,0.08); color: #f97316; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
                .um-app-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; align-items: center; }
                .um-app-action-stack { display: flex; flex-direction: column; gap: 7px; align-items: flex-end; }
                .um-app-action-row { display: inline-flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
                .um-app-action-message { max-width: 260px; padding: 7px 9px; border-radius: 6px; font-size: 10px; line-height: 1.35; text-align: right; }
                .um-app-action-message.success { border: 1px solid rgba(52,211,153,0.24); background: rgba(52,211,153,0.08); color: #8df0c7; }
                .um-app-action-message.error { border: 1px solid rgba(248,113,113,0.25); background: rgba(248,113,113,0.08); color: #fca5a5; }
                .um-app-form { display: inline-flex; }
                .um-app-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 10px; border-radius: 6px; border: 1px solid #1e2420; background: #0f1311; color: #c7ccd1; text-decoration: none; font-size: 11px; font-weight: 600; cursor: pointer; }
                .um-app-btn:disabled { opacity: 0.58; cursor: wait; }
                .um-app-btn:hover { border-color: rgba(249,115,22,0.35); color: #fff; }
                .um-app-btn.approve { border-color: rgba(52,211,153,0.25); color: #34d399; }
                .um-app-btn.approve:hover { background: rgba(52,211,153,0.08); }
                .um-app-btn.reject { border-color: rgba(248,113,113,0.22); color: #f87171; }
                .um-app-btn.reject:hover { background: rgba(248,113,113,0.08); }
                .um-doc-list { display: flex; flex-direction: column; gap: 10px; }
                .um-doc-item { display: flex; justify-content: space-between; gap: 16px; padding: 12px 14px; border: 1px solid #1e2420; border-radius: 6px; background: #101512; }
                .um-doc-meta { min-width: 0; }
                .um-doc-name { color: #fff; font-size: 13px; font-weight: 500; margin-bottom: 2px; }
                .um-doc-sub { color: #777; font-size: 11px; line-height: 1.45; }
                .um-doc-links { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; align-items: center; }
                .um-doc-link { display: inline-flex; align-items: center; gap: 6px; background: #0f1311; border: 1px solid #24302a; color: #34d399; border-radius: 6px; padding: 7px 10px; font-size: 11px; font-weight: 500; text-decoration: none; }
                .um-doc-link:hover { border-color: rgba(52,211,153,0.45); }
                .um-doc-link.missing { color: #555; border-color: #1e2420; background: #0c0f0d; cursor: not-allowed; }
                .um-table-wrap { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; overflow-x: auto; }
                .um-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .um-table th { padding: 10px 16px; text-align: left; color: #555; font-weight: 500; border-bottom: 1px solid #1e2420; }
                .um-table td { padding: 10px 16px; color: #aaa; border-bottom: 1px solid #1e2420; }
                .um-table tr:last-child td { border-bottom: none; }
                .um-role-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
            `}</style>

            <div className="adm-page-header">
                <h1>Users</h1>
                <p>Last 100 registered accounts · {allUsers.length} shown</p>
                <form method="get" style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input
                        name="q"
                        defaultValue={resolvedSearchParams.q || ""}
                        placeholder="Search by name or email..."
                        style={{
                            minWidth: 280,
                            padding: '10px 12px',
                            borderRadius: 6,
                            border: '1px solid #1e2420',
                            background: '#101512',
                            color: '#fff',
                            fontSize: 13,
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '10px 14px',
                            borderRadius: 6,
                            border: '1px solid #1e2420',
                            background: '#0f1311',
                            color: '#fff',
                            fontSize: 13,
                            cursor: 'pointer',
                        }}
                    >
                        Search
                    </button>
                    {resolvedSearchParams.q ? (
                        <a
                            href="/admin/users"
                            style={{
                                padding: '10px 14px',
                                borderRadius: 6,
                                border: '1px solid #1e2420',
                                background: '#0f1311',
                                color: '#c7ccd1',
                                fontSize: 13,
                                textDecoration: 'none',
                            }}
                        >
                            Clear
                        </a>
                    ) : null}
                </form>
            </div>
            <div className="adm-page-body">
                <div className="um-summary">
                    {Object.entries(byRole).sort((a, b) => b[1] - a[1]).map(([r, count]) => (
                        <div key={r} className="um-badge">
                            <strong>{count}</strong>
                            <span>{r}</span>
                        </div>
                    ))}
                </div>
                <div className="um-apps">
                    <h2>Merchant Signup History</h2>
                    <p>Historical merchant user records appear here even if restaurant review is still pending, so earlier submissions never disappear.</p>
                    <div className="um-app-list">
                        {filteredMerchantSignupHistory.map((user: any) => (
                            <div key={user.id} className="um-app-item">
                                <div className="um-doc-meta">
                                    <div className="um-doc-name">{user.name || 'Merchant'} · {user.email || 'No email'}</div>
                                    <div className="um-doc-sub">
                                        Role {user.role || 'MERCHANT'} · {user.linkedRestaurant ? `Restaurant ${user.linkedRestaurant.visibility || 'HIDDEN'}` : 'Restaurant row missing'} · Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                    </div>
                                    <div className="um-app-status">{user.linkedRestaurant ? 'Linked' : 'Unlinked'}</div>
                                </div>
                                <div className="um-app-actions">
                                    <span className="um-doc-link missing">Historical record</span>
                                </div>
                            </div>
                        ))}
                        {filteredMerchantSignupHistory.length === 0 && (
                            <div style={{ color: '#555', fontSize: 12 }}>No merchant signup history found for this search.</div>
                        )}
                    </div>
                </div>
                <div className="um-apps">
                    <h2>Pending Merchant Applications</h2>
                    <p>Fresh merchant sign-ups appear here with their restaurant profile and approval visibility so you can review them right away.</p>
                    {shouldHideMockAdminData() && (
                        <div className="um-doc-note">
                            Production hides mock/test merchant accounts, so only real applicants appear here. Preview and development keep the mock rows for QA.
                        </div>
                    )}
                    <div className="um-app-list">
                        {filteredMerchantApplications.map((restaurant: any) => (
                            <div key={restaurant.id} className="um-app-item">
                                <div className="um-doc-meta">
                                    <div className="um-doc-name">{restaurant.name || 'Restaurant'} · {restaurant.owner?.email || 'No email'}</div>
                                    <div className="um-doc-sub">
                                        {restaurant.owner?.name || 'No contact'} · {restaurant.address || 'No address'} · Plan {restaurant.plan || 'Flex'} · POS {restaurant.posSystem || 'None'} · Visibility {restaurant.visibility || 'HIDDEN'}
                                    </div>
                                    <div className="um-app-status">{restaurant.visibility || 'HIDDEN'}</div>
                                </div>
                                <div className="um-app-actions">
                                    <MerchantApplicationActions
                                        restaurantId={restaurant.id}
                                        approveAction={approveMerchant}
                                        rejectAction={rejectMerchant}
                                    />
                                </div>
                            </div>
                        ))}
                        {filteredMerchantApplications.length === 0 && (
                            <div style={{ color: '#555', fontSize: 12 }}>No merchant applications found for this search.</div>
                        )}
                    </div>
                </div>
                <div className="um-docs">
                    <h2>Merchant Application Alerts</h2>
                    <p>Every submitted merchant application also logs a staff notification so you can spot new signups even if a later step needs attention.</p>
                    <div className="um-doc-list">
                        {filteredMerchantAlerts.map((alert: any) => (
                            <div key={alert.id} className="um-doc-item">
                                <div className="um-doc-meta">
                                    <div className="um-doc-name">{alert.title}</div>
                                    <div className="um-doc-sub">{alert.summary}</div>
                                </div>
                                <div className="um-app-status">Alert</div>
                            </div>
                        ))}
                        {filteredMerchantAlerts.length === 0 && (
                            <div style={{ color: '#555', fontSize: 12 }}>No recent merchant alerts found for this search.</div>
                        )}
                    </div>
                </div>
                <div className="um-apps">
                    <h2>Driver Signup History</h2>
                    <p>Historical driver user records appear here even if document review is still pending, so earlier submissions never disappear.</p>
                    <div className="um-app-list">
                        {filteredDriverSignupHistory.map((user: any) => (
                            <div key={user.id} className="um-app-item">
                                <div className="um-doc-meta">
                                    <div className="um-doc-name">{user.name || 'Driver'} · {user.email || 'No email'}</div>
                                    <div className="um-doc-sub">
                                        Role {user.role || 'DRIVER'} · {user.linkedDriver ? `Driver row ${user.linkedDriver.status || 'PENDING'}` : 'Driver row missing'} · Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                    </div>
                                    <div className="um-app-status">{user.linkedDriver ? 'Linked' : 'Unlinked'}</div>
                                </div>
                                <div className="um-app-actions">
                                    <span className="um-doc-link missing">Historical record</span>
                                </div>
                            </div>
                        ))}
                        {filteredDriverSignupHistory.length === 0 && (
                            <div style={{ color: '#555', fontSize: 12 }}>No driver signup history found for this search.</div>
                        )}
                    </div>
                </div>
                <DriverPipeline drivers={visibleDriverDocs.map((d: any) => ({
                    id: d.id,
                    userId: d.userId,
                    complianceStatus: d.complianceStatus || d.status || "NEW_APPLICATION",
                    backgroundCheckStatus: d.backgroundCheckStatus || "PENDING",
                    vehicleType: d.vehicleType,
                    createdAt: d.createdAt || new Date().toISOString(),
                    user: d.user,
                }))} />

                <div className="um-apps">
                    <h2>Pending Driver Applications</h2>
                    <p>Fresh driver sign-ups appear here with their uploaded documents and approval actions so you can review them right away.</p>
                    {shouldHideMockAdminData() && (
                        <div className="um-doc-note">
                            Production hides mock/test driver accounts, so only real applicants appear here. Preview and development keep the mock rows for QA.
                        </div>
                    )}
                    <div className="um-app-list">
                        {filteredDriverApplications.map((driver: any) => (
                            <div key={driver.id} className="um-app-item">
                                <div className="um-doc-meta">
                                    <div className="um-doc-name">{driver.user?.name || 'Driver'} · {driver.user?.email || 'No email'}</div>
                                    <div className="um-doc-sub">
                                        {driver.user?.phone || 'No phone'} · {driver.status || 'Unknown status'} · Vehicle {driver.vehicleVerified ? 'verified' : 'pending'} · Background {driver.backgroundCheckStatus || 'PENDING'}
                                    </div>
                                    <div className="um-app-status">{docState(driver)}</div>
                                </div>
                                <div className="um-app-actions">
                                    <a
                                        href={driver.licenseUrl || '#'}
                                        target={driver.licenseUrl ? '_blank' : undefined}
                                        rel={driver.licenseUrl ? 'noreferrer' : undefined}
                                        className={`um-doc-link${driver.licenseUrl ? '' : ' missing'}`}
                                    >
                                        License
                                    </a>
                                    <a
                                        href={driver.insuranceUrl || '#'}
                                        target={driver.insuranceUrl ? '_blank' : undefined}
                                        rel={driver.insuranceUrl ? 'noreferrer' : undefined}
                                        className={`um-doc-link${driver.insuranceUrl ? '' : ' missing'}`}
                                    >
                                        Insurance
                                    </a>
                                    <a
                                        href={driver.registrationUrl || '#'}
                                        target={driver.registrationUrl ? '_blank' : undefined}
                                        rel={driver.registrationUrl ? 'noreferrer' : undefined}
                                        className={`um-doc-link${driver.registrationUrl ? '' : ' missing'}`}
                                    >
                                        Registration
                                    </a>
                                    <DriverApplicationActions
                                        driverId={driver.id}
                                        approveAction={approveDriver}
                                        rejectAction={rejectDriver}
                                    />
                                </div>
                            </div>
                        ))}
                        {filteredDriverApplications.length === 0 && (
                            <div style={{ color: '#555', fontSize: 12 }}>No driver applications found for this search.</div>
                        )}
                    </div>
                </div>
                <div className="um-docs">
                    <h2>Driver Application Alerts</h2>
                    <p>Every submitted application also logs a staff notification so you can spot new signups even if a later step needs attention.</p>
                    <div className="um-doc-list">
                        {filteredDriverAlerts.map((alert: any) => (
                            <div key={alert.id} className="um-doc-item">
                                <div className="um-doc-meta">
                                    <div className="um-doc-name">{alert.title}</div>
                                    <div className="um-doc-sub">{alert.summary}</div>
                                </div>
                                <div className="um-app-status">Alert</div>
                            </div>
                        ))}
                        {filteredDriverAlerts.length === 0 && (
                            <div style={{ color: '#555', fontSize: 12 }}>No recent driver alerts found for this search.</div>
                        )}
                    </div>
                </div>
                <div className="um-docs">
                    <h2>Driver Document Review</h2>
                    <p>Driver documents stay private in storage. Admins can open time-limited signed links from here for vetting and approval.</p>
                    {shouldHideMockAdminData() && (
                        <div className="um-doc-note">
                            Production hides mock/test driver accounts, so only real applicants appear here. Preview and development keep the mock rows for QA.
                        </div>
                    )}
                    <div className="um-doc-list">
                        {driverDocsWithLinks.map((driver: any) => (
                            <div key={driver.id} className="um-doc-item">
                                <div className="um-doc-meta">
                                    <div className="um-doc-name">{driver.user?.name || 'Driver'} · {driver.user?.email || 'No email'}</div>
                                    <div className="um-doc-sub">
                                        {driver.status || 'Unknown status'} · Vehicle {driver.vehicleVerified ? 'verified' : 'pending'} · Background {driver.backgroundCheckStatus || 'PENDING'}
                                    </div>
                                </div>
                                <div className="um-doc-links">
                                    <a
                                        href={driver.licenseUrl || '#'}
                                        target={driver.licenseUrl ? '_blank' : undefined}
                                        rel={driver.licenseUrl ? 'noreferrer' : undefined}
                                        className={`um-doc-link${driver.licenseUrl ? '' : ' missing'}`}
                                    >
                                        License
                                    </a>
                                    <a
                                        href={driver.insuranceUrl || '#'}
                                        target={driver.insuranceUrl ? '_blank' : undefined}
                                        rel={driver.insuranceUrl ? 'noreferrer' : undefined}
                                        className={`um-doc-link${driver.insuranceUrl ? '' : ' missing'}`}
                                    >
                                        Insurance
                                    </a>
                                    <a
                                        href={driver.registrationUrl || '#'}
                                        target={driver.registrationUrl ? '_blank' : undefined}
                                        rel={driver.registrationUrl ? 'noreferrer' : undefined}
                                        className={`um-doc-link${driver.registrationUrl ? '' : ' missing'}`}
                                    >
                                        Registration
                                    </a>
                                </div>
                            </div>
                        ))}
                        {driverDocsWithLinks.length === 0 && (
                            <div style={{ color: '#555', fontSize: 12 }}>No driver documents found yet.</div>
                        )}
                    </div>
                </div>
                <div className="um-table-wrap">
                    <table className="um-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allUsers.map(u => (
                                <tr key={u.id}>
                                    <td style={{ color: '#fff' }}>{u.name || '—'}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className="um-role-badge" style={{
                                            background: `${roleColor[u.role] || '#555'}18`,
                                            color: roleColor[u.role] || '#888'
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                            {allUsers.length === 0 && (
                                <tr><td colSpan={4} style={{ color: '#555', padding: '24px 16px' }}>No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPortalWrapper>
    );
}
