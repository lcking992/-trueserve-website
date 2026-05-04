import { createClient } from "@/lib/supabase/server";
import { getAuthSession } from "@/app/auth/actions";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import MerchantRealtime from "@/components/MerchantRealtime";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import OnboardingChecklist from "./OnboardingChecklist";
import { createStripeAccount } from "../actions";
import PrepTimingPanel from "@/app/merchant/dashboard/PrepTimingPanel";
import TerminalStatusPanel from "@/app/merchant/dashboard/TerminalStatusPanel";
import AutoPilotPanel from "@/app/merchant/dashboard/AutoPilotPanel";
import BusyZonesPanel from "@/app/merchant/dashboard/BusyZonesPanel";
import IssuesPanel from "@/app/merchant/dashboard/IssuesPanel";
import GHLSettingsPanel from "@/app/merchant/dashboard/GHLSettingsPanel";
import LiveOrdersPanel from "@/app/merchant/dashboard/LiveOrdersPanel";
import HoursPanel from "@/app/merchant/dashboard/HoursPanel";
import CoverPhotoPanel from "@/app/merchant/dashboard/CoverPhotoPanel";
import RevenueSparkline from "@/app/merchant/dashboard/RevenueSparkline";
import InlineSupportEntry from "@/components/InlineSupportEntry";

export const dynamic = "force-dynamic";

export default async function MerchantDashboard({
    searchParams,
}: {
    searchParams?: Promise<{ mode?: string; stripe_connect?: string }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const cookieUserId = cookieStore.get("userId")?.value;
    const { isAuth, userId } = await getAuthSession();
    const activeUserId = userId || cookieUserId;

    if (!activeUserId && !isPreview) {
        redirect("/login?role=merchant");
    }

    let restaurant: any = null;

    if (isPreview) {
        restaurant = {
            id: "preview",
            name: "Pilot Kitchen",
            stripeAccountId: null,
            isBusy: false,
            busyUntil: null,
            manualPrepTime: null,
            autoPilotEnabled: true,
            capacityThreshold: 10,
            menuItems: [{ id: "1" }],
            orders: [{ id: "1", status: "PENDING", total: 0 }],
            schedules: [],
        };
    } else {
        const supabase = await createClient();
        const { data: restaurants, error } = await supabase
            .from("Restaurant")
            .select(`
                *,
                menuItems:MenuItem(*),
                orders:Order(*, user:User(*)),
                schedules:MerchantSchedule(*)
            `)
            .eq("ownerId", activeUserId!);

        if (error || !restaurants || restaurants.length === 0) {
            console.error("Dashboard Fetch Error:", error);
            redirect("/merchant/signup");
        }

        restaurant = restaurants[0];
    }

    const pendingOrders = (restaurant.orders || []).filter(
        (o: any) => o.status === "PENDING" || o.status === "PREPARING"
    );

    const netRevenue = (restaurant.orders || [])
        .filter((o: any) => o.status === "DELIVERED" || o.status === "READY_FOR_PICKUP" || o.status === "PICKED_UP")
        .reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    const hasStripe = Boolean(restaurant.stripeAccountId);

    return (
        <>
            <style>{`
                .mch-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 14px;
                }
                .mch-stat-card {
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    padding: 14px;
                }
                .mch-stat-label {
                    font-size: 11px;
                    color: #777;
                    margin-bottom: 7px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .mch-stat-icon {
                    width: 18px; height: 18px;
                    border-radius: 4px;
                    background: #0f1210;
                    border: 1px solid #1e2420;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 11px;
                }
                .mch-stat-value {
                    font-size: 27px;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.5px;
                }
                .mch-stripe-banner {
                    background: #141a18;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    padding: 13px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                    gap: 12px;
                }
                .mch-stripe-banner.connected {
                    border-color: #1e3a2a;
                    background: #0f1a14;
                }
                .mch-stripe-left { display: flex; align-items: center; gap: 10px; }
                .mch-stripe-icon {
                    width: 22px; height: 15px;
                    border-radius: 3px;
                    background: #635bff;
                    flex-shrink: 0;
                }
                .mch-stripe-icon.connected { background: #1e3a2a; }
                .mch-stripe-title {
                    display: block;
                    color: #fff;
                    font-weight: 700;
                    font-size: 12px;
                    margin-bottom: 2px;
                }
                .mch-stripe-sub { font-size: 11px; color: #aab4c8; }
                .mch-stripe-connect-btn {
                    background: #f97316;
                    color: #000;
                    border: none;
                    border-radius: 8px;
                    padding: 7px 16px;
                    font-size: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: background 0.15s;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .mch-stripe-connect-btn:hover { background: #ea6c10; }
                .mch-stripe-connected-badge {
                    font-size: 11px;
                    color: #4dca80;
                    font-weight: 800;
                    white-space: nowrap;
                }
                .mch-section-head {
                    font-size: 10px;
                    font-weight: 800;
                    color: #777;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .mch-tab-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
                .mch-tab-pill {
                    padding: 8px 14px;
                    border-radius: 8px;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    text-decoration: none;
                    border: 1px solid #1e2420;
                    color: #999;
                    transition: all 0.15s;
                    text-transform: uppercase;
                    letter-spacing: 0.11em;
                    background: transparent;
                }
                .mch-tab-pill:hover { color: #f97316; border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.06); }
                .mch-tab-pill.mch-tab-active {
                    background: rgba(249,115,22,0.08);
                    color: #f97316;
                    border-color: rgba(249,115,22,0.35);
                }
                .mch-two-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 14px;
                }
                .mch-four-col {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 14px;
                }
                @media (max-width: 900px) {
                    .mch-stat-grid { grid-template-columns: 1fr 1fr; }
                    .mch-two-col, .mch-four-col { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .mch-stat-grid {
                        grid-template-columns: 1fr;
                    }
                    .mch-stat-card {
                        padding: 16px;
                    }
                    .mch-stripe-banner {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .mch-stripe-left {
                        align-items: flex-start;
                    }
                    .mch-stripe-connect-btn,
                    .mch-stripe-connected-badge {
                        width: 100%;
                        text-align: center;
                    }
                    .mch-tab-row {
                        display: grid;
                        grid-template-columns: 1fr;
                    }
                    .mch-tab-pill {
                        width: 100%;
                        text-align: center;
                    }
                }
            `}</style>

            <WelcomeAnimation
                name={restaurant.name}
                role="merchant"
                stats={[
                    { label: "Pending Orders", value: String(pendingOrders.length) },
                    { label: "Revenue", value: `$${netRevenue.toFixed(0)}` },
                    { label: "Menu Items", value: String((restaurant.menuItems || []).length) },
                ]}
            />
            {restaurant.id !== "preview" && <MerchantRealtime restaurantId={restaurant.id} />}

            <OnboardingChecklist
                hasMenuItems={(restaurant.menuItems || []).length > 0}
                hasStripe={Boolean(restaurant.stripeAccountId)}
                hasImage={Boolean(restaurant.imageUrl)}
                isVisible={restaurant.visibility === "VISIBLE"}
                restaurantId={restaurant.id}
            />

            {/* KPI CARDS */}
            <div className="mch-stat-grid">
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon">📦</div>
                        Incoming Orders
                    </div>
                    <div className="mch-stat-value">{pendingOrders.length}</div>
                </div>
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon">🍽️</div>
                        Menu Items
                    </div>
                    <div className="mch-stat-value">{(restaurant.menuItems || []).length}</div>
                </div>
                <div className="mch-stat-card">
                    <div className="mch-stat-label">
                        <div className="mch-stat-icon">💵</div>
                        Net Revenue
                    </div>
                    <div className="mch-stat-value">${netRevenue.toFixed(2)}</div>
                </div>
            </div>

            {/* REVENUE SPARKLINE */}
            <RevenueSparkline orders={restaurant.orders || []} />

            {/* STRIPE BANNER */}
            <div className={`mch-stripe-banner${hasStripe ? ' connected' : ''}`}>
                <div className="mch-stripe-left">
                    <div className={`mch-stripe-icon${hasStripe ? ' connected' : ''}`} />
                    <div>
                        <span className="mch-stripe-title">
                            {hasStripe ? '✓ Stripe Connected' : 'Connect Stripe'}
                        </span>
                        <span className="mch-stripe-sub">
                            {hasStripe
                                ? 'Your payouts are active. Funds are deposited on a rolling basis.'
                                : 'To start receiving payouts, connect your Stripe account.'}
                        </span>
                    </div>
                </div>
                {!hasStripe ? (
                    <form action={createStripeAccount}>
                        <button type="submit" className="mch-stripe-connect-btn">Connect →</button>
                    </form>
                ) : (
                    <span className="mch-stripe-connected-badge">✓ Payouts Active</span>
                )}
            </div>

            <InlineSupportEntry
                kicker="Merchant support"
                title="Need help getting your storefront live?"
                detail="Reach TrueServe support for menu setup, Stripe payouts, direct-order tools, visibility updates, or launch-day questions."
                prefill={`Hi TrueServe Support — I need help with the merchant dashboard for ${restaurant.name}.`}
                primaryLabel="Open Support"
                secondaryHref="/contact"
                secondaryLabel="Contact Team"
            />

            {/* LIVE ORDERS */}
            <LiveOrdersPanel
                restaurantId={restaurant.id}
                initialOrders={pendingOrders}
            />

            {/* QUICK SETUP */}
            <div className="mch-section-head">Quick Setup</div>
            <div className="mch-tab-row">
                <Link href="/merchant/dashboard/integrations" className="mch-tab-pill mch-tab-active">POS + API</Link>
                <Link href="/merchant/dashboard/compliance" className="mch-tab-pill">Compliance</Link>
                <Link href="/merchant/dashboard/storefront" className="mch-tab-pill">Storefront</Link>
            </div>

            {/* OPERATIONS PANELS */}
            <div className="mch-two-col">
                <PrepTimingPanel
                    restaurantId={restaurant.id}
                    manualPrepTime={restaurant.manualPrepTime}
                    avgPrepTime={restaurant.avgPrepTime || 15}
                />
                <TerminalStatusPanel
                    restaurantId={restaurant.id}
                    isBusy={restaurant.isBusy}
                    busyUntil={restaurant.busyUntil}
                />
            </div>

            {/* COVER PHOTO */}
            <CoverPhotoPanel
                restaurantId={restaurant.id}
                currentImageUrl={restaurant.imageUrl ?? null}
                restaurantName={restaurant.name}
            />

            {/* HOURS */}
            <HoursPanel
                restaurantId={restaurant.id}
                openTime={restaurant.openTime ?? null}
                closeTime={restaurant.closeTime ?? null}
            />

            {/* GHL */}
            <GHLSettingsPanel
                restaurantId={restaurant.id}
                initialGhlUrl={restaurant.ghlUrl}
            />

            {/* AI AUTOPILOT + BUSY ZONES */}
            <div className="mch-four-col">
                <AutoPilotPanel
                    restaurantId={restaurant.id}
                    autoPilotEnabled={restaurant.autoPilotEnabled ?? true}
                    capacityThreshold={restaurant.capacityThreshold ?? 10}
                />
                <BusyZonesPanel
                    restaurantId={restaurant.id}
                    schedules={restaurant.schedules || []}
                />
            </div>

            {/* ISSUES TOAST */}
            <IssuesPanel pendingCount={pendingOrders.length} />
        </>
    );
}
