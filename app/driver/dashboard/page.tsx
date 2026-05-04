import Link from "next/link";
import { cookies } from "next/headers";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import { getDriverOrRedirect } from "@/lib/driver-auth";
import { createClient } from "@/lib/supabase/server";
import { acceptOrder } from "../actions";
import { getCurrentWeather } from "@/lib/weather";
import PickupPhotoForm from "./PickupPhotoForm";
import CompleteDeliveryForm from "./CompleteDeliveryForm";
import DriverMap from "@/components/DriverMap";
import DriverRouteMap from "./DriverRouteMap";
import DriverLocationTracker from "@/components/DriverLocationTracker";
import WeatherCard from "@/components/WeatherCard";
import { OrderTransparencyCard } from "./page-pilot-widgets";
import InlineSupportEntry from "@/components/InlineSupportEntry";

export const dynamic = "force-dynamic";

export default async function DriverDashboard() {
    const cookieStore = await cookies();
    const isPreview = cookieStore.get("preview_mode")?.value === "true";
    const driver = isPreview
        ? {
            id: "preview",
            name: "Driver",
            currentLat: 28.5383,
            currentLng: -81.3792,
            totalEarnings: 0,
            balance: 0,
            stripeAccountId: null,
            orders: [],
            rating: 0,
        }
        : await getDriverOrRedirect();

    const driverLat = typeof driver?.currentLat === "number" ? driver.currentLat : null;
    const driverLng = typeof driver?.currentLng === "number" ? driver.currentLng : null;

    let availableOrders: any[] = [];
    let myActiveOrders: any[] = [];
    let weather = { temperature: 68, condition: "Clear", multiplier: 1.0 };
    let stats = { totalEarnings: 0, balance: 0, trips: 0, rating: 0 };

    if (isPreview) {
        availableOrders = [
            {
                id: "preview-avail-001",
                status: "PENDING",
                total: 32.00,
                totalPay: 14.25,
                tip: 6.00,
                distance: 2.3,
                deliveryAddress: "500 N College St, Charlotte NC",
                restaurant: { name: "The Noodle House", address: "220 S Tryon St, Charlotte NC", complianceScore: 88, complianceStatus: "ACTIVE" },
            },
            {
                id: "preview-avail-002",
                status: "PENDING",
                total: 27.50,
                totalPay: 11.50,
                tip: null,
                distance: 1.8,
                deliveryAddress: "1234 Central Ave, Charlotte NC",
                restaurant: { name: "Sakura Sushi", address: "401 N Tryon St, Charlotte NC", complianceScore: 92, complianceStatus: "ACTIVE" },
            },
        ];
        myActiveOrders = [{
            id: "preview-order-001",
            status: "PICKED_UP",
            total: 24.50,
            totalPay: 12.75,
            deliveryAddress: "842 Poplar Tent Rd, Concord NC 28027",
            deliveryInstructions: "",
            customerName: "Alex Johnson",
            customer: { name: "Alex Johnson" },
            restaurant: { name: "Emerald Kitchen", address: "120 S Tryon St, Charlotte NC", lat: 35.2271, lng: -80.8431, complianceScore: 95, complianceStatus: "ACTIVE" },
        }];
    } else {
        const supabase = await createClient();

        if (driverLat !== null && driverLng !== null) {
            weather = await getCurrentWeather(driverLat, driverLng);
        }

        const { data: rawAvailable } = await supabase
            .from("Order")
            .select("*, restaurant:Restaurant(name, address, lat, lng, complianceScore, complianceStatus)")
            .is("driverId", null)
            .neq("status", "DELIVERED")
            .neq("status", "CANCELLED")
            .limit(10);

        const { data: rawActive } = await supabase
            .from("Order")
            .select("*, restaurant:Restaurant(name, address, lat, lng, complianceScore, complianceStatus), customer:User(name)")
            .eq("driverId", driver.id)
            .neq("status", "DELIVERED")
            .neq("status", "CANCELLED");

        availableOrders = rawAvailable || [];
        myActiveOrders = rawActive || [];
    }

    stats = {
        totalEarnings: Number(driver?.totalEarnings || 0),
        balance: Number(driver?.balance || 0),
        trips: driver?.orders?.length || 0,
        rating: Number(driver?.rating || 0),
    };

    const hasStripe = Boolean((driver as any)?.stripeAccountId);
    const primaryOrder = myActiveOrders[0] || null;
    const additionalOrders = myActiveOrders.slice(1);

    return (
        <>
        <WelcomeAnimation
            name={driver.name || "Driver"}
            role="driver"
            stats={[
                { label: "Orders Available", value: String(availableOrders.length) },
                { label: "Total Earnings", value: `$${stats.totalEarnings.toFixed(0)}` },
                { label: "Rating", value: stats.rating > 0 ? `${stats.rating.toFixed(1)}★` : "New" },
            ]}
        />
        {/* RAMEN — broadcasts driver GPS to all tracking customers */}
        {driver.id !== "preview" && (
            <DriverLocationTracker
                driverId={driver.id}
                orderId={primaryOrder?.id}
            />
        )}
        <style>{`
            /* STAT BLOCK */
            .dd-stat-grid {
                display: grid; grid-template-columns: repeat(3, 1fr);
                gap: 10px; margin-bottom: 14px;
            }
            .dd-stat-card {
                background: #141a18; border: 1px solid #1e2420;
                padding: 20px 22px;
                border-radius: 8px;
            }
            .dd-stat-label {
                font-size: 10px; font-weight: 800; color: #777;
                letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;
            }
            .dd-stat-value {
                font-size: 30px; font-weight: 700; color: #fff; letter-spacing: -1px;
            }
            .dd-stat-value.gold { color: #f97316; }
            .dd-weather-card {
                background: #141a18; border: 1px solid #1e2420;
                border-radius: 8px;
                padding: 18px 22px; margin-bottom: 16px;
                display: flex; align-items: center; justify-content: space-between;
            }
            .dd-weather-label {
                font-size: 10px; font-weight: 800; color: #777;
                letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px;
            }
            .dd-weather-temp { font-size: 28px; font-weight: 700; color: #3ecf6e; letter-spacing: -0.5px; }

            /* STRIPE BANNER */
            .dd-stripe-banner {
                background: #141a18; border: 1px solid #1e2420;
                border-radius: 8px; padding: 16px 20px;
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 16px; gap: 16px;
            }
            .dd-stripe-banner.connected {
                border-color: #0f2a1a; background: #0d1a0f;
            }
            .dd-stripe-left { display: flex; align-items: center; gap: 14px; }
            .dd-stripe-icon {
                width: 40px; height: 28px; border-radius: 6px;
                background: #0f1210;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0; position: relative; overflow: hidden;
                border: 1px solid rgba(255,255,255,0.08);
            }
            .dd-stripe-icon.connected { background: #0f2a1a; }
            .dd-stripe-icon::after {
                content: ''; position: absolute;
                width: 20px; height: 3px;
                background: rgba(255,255,255,0.7); border-radius: 2px;
                top: 50%; left: 50%; transform: translate(-50%, -60%);
            }
            .dd-stripe-icon::before {
                content: ''; position: absolute;
                width: 13px; height: 3px;
                background: rgba(255,255,255,0.35); border-radius: 2px;
                top: 50%; left: 10px; transform: translateY(40%);
            }
            .dd-stripe-title {
                display: block; color: #fff;
                font-weight: 700; font-size: 13px; margin-bottom: 3px;
            }
            .dd-stripe-sub { font-size: 11px; color: #aab4c8; }
            .dd-stripe-btn {
                background: #f97316; color: #000;
                border: none; border-radius: 9px;
                padding: 10px 20px; font-size: 11px; font-weight: 800;
                cursor: pointer; white-space: nowrap; flex-shrink: 0;
                text-decoration: none; display: inline-flex; align-items: center;
                transition: background 0.15s;
                text-transform: uppercase;
                letter-spacing: 0.12em;
            }
            .dd-stripe-btn:hover { background: #ea6c10; }
            .dd-stripe-connected { font-size: 12px; color: #3ecf6e; font-weight: 700; white-space: nowrap; }

            /* TWO COL */
            .dd-two-col {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 12px; margin-bottom: 16px;
            }
            .dd-panel {
                background: #141a18; border: 1px solid #1e2420;
                border-radius: 8px; padding: 20px;
            }
            .dd-panel-section-label {
                font-size: 10px; font-weight: 800; color: #777;
                letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;
            }
            .dd-panel-title {
                font-size: 20px; font-weight: 700; color: #fff;
                margin-bottom: 12px; letter-spacing: -0.3px;
            }
            .dd-empty-state {
                background: #0f1210; border: 1px solid #1e2420;
                border-radius: 8px; padding: 14px 16px;
                font-size: 12px; color: #aab4c8; text-align: center;
            }
            .dd-map-wrap {
                border-radius: 10px; overflow: hidden;
                height: 260px;
                border: 0.5px solid #2e2e2e;
            }

            /* BOTTOM GRID */
            .dd-bottom-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 12px; margin-bottom: 16px;
            }

            /* ORDER CARDS */
            .dd-order-card {
                background: #0f1210; border: 1px solid #1e2420;
                border-radius: 8px; padding: 16px; margin-bottom: 8px;
            }
            .dd-order-status {
                font-size: 10px; text-transform: uppercase;
                letter-spacing: 0.12em; color: #f97316;
                font-weight: 800; margin-bottom: 4px;
            }
            .dd-order-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; }
            .dd-addr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
            .dd-addr-block {
                background: #141a18; border: 1px solid #1e2420;
                border-radius: 8px; padding: 10px 12px;
            }
            .dd-addr-label {
                font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em;
                color: #777; margin-bottom: 3px;
            }
            .dd-addr-val { font-size: 12px; font-weight: 700; color: #e0e0e0; }
            .dd-progress-bar-wrap {
                height: 4px; background: #1e2420; border-radius: 4px;
                overflow: hidden; margin: 10px 0 6px;
            }
            .dd-progress-bar {
                height: 100%; background: #f97316;
                border-radius: 4px; width: 68%;
            }

            /* AVAIL ORDER CARDS */
            .dd-avail-card {
                background: #0f1210; border: 1px solid #1e2420;
                border-radius: 8px; padding: 16px; margin-bottom: 8px;
            }
            .dd-avail-name { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
            .dd-avail-addr { font-size: 11px; color: #aab4c8; margin-bottom: 10px; }
            .dd-badge-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
            .dd-badge {
                border-radius: 8px; padding: 3px 10px;
                font-size: 10px; font-weight: 800;
            }
            .dd-badge-green { background: rgba(62,207,110,0.1); border: 1px solid rgba(62,207,110,0.25); color: #3ecf6e; }
            .dd-badge-muted { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #777; }
            .dd-badge-red { background: rgba(232,64,64,0.1); border: 1px solid rgba(232,64,64,0.25); color: #e84040; }
            .dd-badge-orange { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.25); color: #f97316; }
            .dd-accept-btn {
                width: 100%; background: #f97316; color: #000;
                border: none; border-radius: 8px; padding: 10px;
                font-size: 11px; font-weight: 800; cursor: pointer;
                transition: background 0.15s; font-family: inherit;
                text-transform: uppercase;
                letter-spacing: 0.12em;
            }
            .dd-accept-btn:hover { background: #ea6c10; }
            .dd-accept-btn:disabled { background: #333; color: #666; cursor: not-allowed; }

            /* SUMMARY ROWS */
            .dd-summary-row {
                display: flex; align-items: center; justify-content: space-between;
                background: rgba(255,255,255,0.03); border: 1px solid #1e2420;
                border-radius: 8px; padding: 10px 14px; margin-bottom: 6px;
            }
            .dd-summary-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #777; }
            .dd-summary-val { font-size: 12px; font-weight: 700; color: #e0e0e0; }

            /* ACTION BTNS */
            .dd-btn-gold {
                display: flex; align-items: center; justify-content: center;
                background: #f97316; color: #000; border: none;
                border-radius: 8px; padding: 10px 16px;
                font-size: 11px; font-weight: 800; cursor: pointer;
                text-decoration: none; transition: background 0.15s;
                margin-bottom: 6px; width: 100%;
                text-transform: uppercase;
                letter-spacing: 0.11em;
            }
            .dd-btn-gold:hover { background: #ea6c10; }
            .dd-btn-ghost {
                display: flex; align-items: center; justify-content: center;
                background: transparent; color: #999;
                border: 1px solid #1e2420;
                border-radius: 8px; padding: 10px 16px;
                font-size: 11px; font-weight: 800; cursor: pointer;
                text-decoration: none; transition: all 0.15s;
                margin-bottom: 6px; width: 100%;
                text-transform: uppercase;
                letter-spacing: 0.11em;
            }
            .dd-btn-ghost:hover { color: #f97316; border-color: rgba(249,115,22,0.35); background: rgba(249,115,22,0.06); }

            /* ESSENTIALS GRID */
            .dd-essentials-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px;
            }

            @media (max-width: 1024px) {
                .dd-two-col, .dd-bottom-grid { grid-template-columns: 1fr; }
                .dd-stat-grid { grid-template-columns: repeat(3, 1fr); }
            }
            @media (max-width: 640px) {
                .dd-stat-grid { grid-template-columns: repeat(3, 1fr); }
                .dd-stat-card { padding: 12px 10px; }
                .dd-stat-value { font-size: 20px; }
                .dd-addr-grid { grid-template-columns: 1fr; }
                .dd-stripe-banner { flex-direction: column; align-items: stretch; gap: 10px; padding: 14px 16px; }
                .dd-stripe-left { align-items: flex-start; }
                .dd-stripe-btn { text-align: center; justify-content: center; white-space: normal; }
                .dd-stripe-connected { text-align: center; }
                .dd-weather-card { padding: 14px 16px; }
                .dd-weather-temp { font-size: 22px; }
            }
        `}</style>

        {/* STAT CARDS */}
        <div className="dd-stat-grid">
            <div className="dd-stat-card">
                <div className="dd-stat-label">Daily Yield</div>
                <div className="dd-stat-value gold">${stats.totalEarnings.toFixed(0)}</div>
            </div>
            <div className="dd-stat-card">
                <div className="dd-stat-label">Trips</div>
                <div className="dd-stat-value">{stats.trips}</div>
            </div>
            <div className="dd-stat-card">
                <div className="dd-stat-label">Rating</div>
                <div className="dd-stat-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {stats.rating.toFixed(1)}
                    <span style={{ color: '#f97316', fontSize: 22 }}>★</span>
                </div>
            </div>
        </div>

        {/* WEATHER — animated condition card */}
        <WeatherCard
            temperature={weather.temperature}
            condition={weather.condition}
            locationLabel={driverLat && driverLng ? `${driverLat.toFixed(2)}°N` : undefined}
        />

        {/* STRIPE BANNER */}
        {!hasStripe ? (
            <div className="dd-stripe-banner">
                <div className="dd-stripe-left">
                    <div className="dd-stripe-icon" />
                    <div>
                        <span className="dd-stripe-title">Connect Stripe to get paid.</span>
                        <span className="dd-stripe-sub">Driver payouts activate once your Stripe account is connected.</span>
                    </div>
                </div>
                <Link href="/driver/dashboard/account" className="dd-stripe-btn">
                    Connect Stripe Account
                </Link>
            </div>
        ) : (
            <div className="dd-stripe-banner connected">
                <div className="dd-stripe-left">
                    <div className="dd-stripe-icon connected" />
                    <div>
                        <span className="dd-stripe-title">Stripe account connected.</span>
                        <span className="dd-stripe-sub">Your payouts are active and rolling to your bank.</span>
                    </div>
                </div>
                <span className="dd-stripe-connected">✓ Payouts Active</span>
            </div>
        )}

        <InlineSupportEntry
            kicker="Driver support"
            title="Need help before or during a route?"
            detail="Open support for payout questions, approval issues, route friction, or anything affecting an active delivery."
            prefill={`Hi TrueServe Support — I need help with my driver account${driver?.name ? ` for ${driver.name}` : ""}.`}
            primaryLabel="Open Support"
            secondaryHref="/driver/dashboard/help"
            secondaryLabel="Open Help Center"
        />

        {/* MISSION + MAP */}
        <div className="dd-two-col">
            {/* CURRENT ROUTE */}
            <div className="dd-panel">
                <div className="dd-panel-section-label">Active Mission</div>
                <div className="dd-panel-title">Current Route</div>
                {primaryOrder ? (
                    <>
                        <div className="dd-order-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                <div>
                                    <div className="dd-order-status">{primaryOrder.status}</div>
                                    <div className="dd-order-name">{primaryOrder.restaurant?.name || "Restaurant"}</div>
                                </div>
                                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#555' }}>
                                    #{primaryOrder.id.slice(-6).toUpperCase()}
                                </div>
                            </div>
                            <div className="dd-addr-grid">
                                <div className="dd-addr-block">
                                    <div className="dd-addr-label">Pickup</div>
                                    <div className="dd-addr-val">{primaryOrder.restaurant?.address}</div>
                                </div>
                                <div className="dd-addr-block">
                                    <div className="dd-addr-label">Drop-off</div>
                                    <div className="dd-addr-val">{primaryOrder.deliveryAddress}</div>
                                    {primaryOrder.customer?.name && (
                                        <div style={{ fontSize: 10, color: '#5bcfd4', marginTop: 3 }}>{primaryOrder.customer.name}</div>
                                    )}
                                </div>
                            </div>
                            <div className="dd-progress-bar-wrap">
                                <div className="dd-progress-bar" style={{ width: primaryOrder.status === 'PICKED_UP' ? '75%' : '45%' }} />
                            </div>
                            <div style={{ fontSize: 10, color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                {primaryOrder.status === 'PICKED_UP' ? 'Picked up — heading to customer' : 'Heading to pickup'}
                            </div>
                            {primaryOrder.status === 'PICKED_UP' ? (
                                <CompleteDeliveryForm
                                    orderId={primaryOrder.id}
                                    customerName={primaryOrder.customerName || primaryOrder.customer?.name}
                                    deliveryInstructions={primaryOrder.deliveryInstructions}
                                />
                            ) : (
                                <PickupPhotoForm orderId={primaryOrder.id} restaurantName={primaryOrder.restaurant?.name} />
                            )}
                        </div>
                        {additionalOrders.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#444', marginBottom: 6 }}>Additional Orders</div>
                                {additionalOrders.slice(0, 2).map((order: any) => (
                                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#111', border: '0.5px solid #242424', borderRadius: 8, padding: '10px 12px', marginBottom: 4 }}>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{order.restaurant?.name}</div>
                                            <div style={{ fontSize: 10, color: '#555' }}>{order.deliveryAddress}</div>
                                        </div>
                                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f97316', fontWeight: 700 }}>{order.status}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="dd-empty-state">
                        No active deliveries right now. Available orders are listed below.
                    </div>
                )}
            </div>

            {/* LIVE MAP */}
            <div className="dd-panel">
                <div className="dd-panel-section-label">Navigation</div>
                <div className="dd-panel-title">
                    {primaryOrder && driverLat !== null && driverLng !== null
                        ? "Route Snapshot"
                        : "Live Map + Heatmap"}
                </div>

                {primaryOrder && driverLat !== null && driverLng !== null ? (
                    <DriverRouteMap
                        driverLat={driverLat}
                        driverLng={driverLng}
                        restaurantLat={primaryOrder.restaurant?.lat ?? null}
                        restaurantLng={primaryOrder.restaurant?.lng ?? null}
                        deliveryAddress={primaryOrder.deliveryAddress ?? null}
                        status={primaryOrder.status}
                    />
                ) : (
                <div className="dd-map-wrap">
                    <DriverMap
                        initialCenter={driverLat !== null && driverLng !== null ? { lat: driverLat, lng: driverLng } : null}
                        className="h-[260px] w-full"
                    />
                </div>
                )}

                {/* ESSENTIALS */}
                <div style={{ marginTop: 16 }}>
                    <div className="dd-panel-section-label">Driver Essentials</div>
                    <div className="dd-essentials-grid">
                        <Link href="/driver/dashboard/account" className="dd-btn-gold" style={{ marginBottom: 0 }}>Stripe Payout</Link>
                        <Link href="/driver/dashboard/compliance" className="dd-btn-gold" style={{ marginBottom: 0 }}>Compliance</Link>
                        <Link href="/driver/dashboard/earnings" className="dd-btn-ghost" style={{ marginBottom: 0 }}>Settlements</Link>
                        <Link href="/driver/dashboard/help" className="dd-btn-ghost" style={{ marginBottom: 0 }}>AI Support</Link>
                    </div>
                </div>
            </div>
        </div>

        {/* AVAILABLE ORDERS + SUMMARY */}
        <div className="dd-bottom-grid">
            {/* AVAILABLE ORDERS */}
            <div className="dd-panel">
                <div className="dd-panel-section-label">Available Orders</div>
                <div className="dd-panel-title">Nearby Opportunities</div>
                {availableOrders.length === 0 ? (
                    <div className="dd-empty-state">No nearby opportunities right now.</div>
                ) : (
                    availableOrders.slice(0, 4).map((order: any) => (
                        <OrderTransparencyCard
                            key={order.id}
                            order={order}
                            trustScore={null}
                            acceptAction={async (formData) => {
                                "use server";
                                await acceptOrder(formData.get("orderId") as string);
                            }}
                        />
                    ))
                )}
            </div>

            {/* ROUTE SUMMARY */}
            <div className="dd-panel">
                <div className="dd-panel-section-label">Route Summary</div>
                <div className="dd-panel-title">Today at a glance</div>
                <div style={{ marginBottom: 12 }}>
                    {[
                        { label: 'Balance', value: `$${Number(driver.balance || 0).toFixed(2)}` },
                        { label: 'Weather', value: `${weather.temperature}°F · ${weather.condition}` },
                        { label: 'Trip Count', value: `${stats.trips} deliveries` },
                        { label: 'Rating', value: `${stats.rating.toFixed(1)} stars` },
                    ].map((row) => (
                        <div key={row.label} className="dd-summary-row">
                            <span className="dd-summary-label">{row.label}</span>
                            <span className="dd-summary-val">{row.value}</span>
                        </div>
                    ))}
                </div>
                <Link href="/driver/dashboard/compliance" className="dd-btn-gold">Open Compliance</Link>
                <Link href="/driver/dashboard/earnings" className="dd-btn-ghost">View Settlements</Link>
                <Link href="/driver/dashboard/help" className="dd-btn-ghost">Get Support</Link>
            </div>
        </div>
        </>
    );
}
