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
import DriverCarePanel from "./DriverCarePanel";
import DriverAppControls from "./DriverAppControls";
import DriverPhotoReportCard from "./DriverPhotoReportCard";
import HustleAssistant from "./HustleAssistant";
import DriverIncidentTimeline from "./DriverIncidentTimeline";
import OrderTransparencyLog from "@/components/OrderTransparencyLog";
import DriverShiftPayoutCard from "./DriverShiftPayoutCard";

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
    let activeShift: { id: string; startedAt: string; hourlyRate: number } | null = null;
    let todayShiftMinutes = 0;
    let todayShiftPay = 0;

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
        todayShiftMinutes = 185;
        todayShiftPay = Number(((todayShiftMinutes / 60) * 20).toFixed(2));
    } else {
        const supabase = await createClient();

        if (driverLat !== null && driverLng !== null) {
            weather = await getCurrentWeather(driverLat, driverLng);
        }

        const { data: rawAvailable } = await supabase
            .from("Order")
            .select("*, restaurant:Restaurant(name, address, lat, lng, complianceScore, complianceStatus)")
            .is("driverId", null)
            .or("posReference.is.null,posReference.not.like.TEST-%")
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

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: shifts, error: shiftsError } = await supabase
            .from("DriverShift")
            .select("id, startedAt, endedAt, hourlyRate, minutesWorked, estimatedPay, status")
            .eq("driverId", driver.id)
            .gte("startedAt", startOfDay.toISOString())
            .order("startedAt", { ascending: false });

        if (!shiftsError && shifts) {
            const active = shifts.find((shift: any) => shift.status === "ACTIVE");
            activeShift = active
                ? {
                    id: active.id,
                    startedAt: active.startedAt,
                    hourlyRate: Number(active.hourlyRate || 20),
                }
                : null;
            todayShiftMinutes = shifts
                .filter((shift: any) => shift.status === "COMPLETED")
                .reduce((sum: number, shift: any) => sum + Number(shift.minutesWorked || 0), 0);
            todayShiftPay = shifts
                .filter((shift: any) => shift.status === "COMPLETED")
                .reduce((sum: number, shift: any) => sum + Number(shift.estimatedPay || 0), 0);
        } else if (shiftsError) {
            console.warn("[DriverShift] Shift tracking unavailable:", shiftsError.message);
        }
    }

    stats = {
        totalEarnings: Number(driver?.totalEarnings || 0),
        balance: Number(driver?.balance || 0),
        trips: driver?.orders?.length || 0,
        rating: Number(driver?.rating || 0),
    };

    const hasStripe = Boolean((driver as any)?.stripeAccountId);
    const stripeReady = Boolean((driver as any)?.stripeAccountId && (driver as any)?.stripeOnboardingComplete);
    const primaryOrder = myActiveOrders[0] || null;
    const additionalOrders = myActiveOrders.slice(1);
    const pickupAddress = primaryOrder?.restaurant?.address || "";
    const dropoffAddress = primaryOrder?.deliveryAddress || "";
    const pickupMapUrl = pickupAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickupAddress)}` : "";
    const dropoffMapUrl = dropoffAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dropoffAddress)}` : "";

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

            /* DRIVER APP CONTROLS */
            .driver-app-card {
                background: linear-gradient(135deg, rgba(249,115,22,0.1), rgba(20,26,24,0.95) 42%, #111512);
                border: 1px solid rgba(249,115,22,0.22);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                box-shadow: 0 18px 40px rgba(0,0,0,0.24);
            }
            .driver-app-status {
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 0;
            }
            .driver-live-dot {
                width: 14px;
                height: 14px;
                border-radius: 999px;
                background: #525252;
                border: 3px solid rgba(255,255,255,0.08);
                flex-shrink: 0;
            }
            .driver-live-dot.on {
                background: #3ecf6e;
                box-shadow: 0 0 0 7px rgba(62,207,110,0.1), 0 0 28px rgba(62,207,110,0.34);
            }
            .driver-app-kicker {
                margin: 0 0 4px;
                color: #7f877f;
                font-size: 10px;
                font-weight: 900;
                letter-spacing: 0.14em;
                text-transform: uppercase;
            }
            .driver-app-status h2 {
                margin: 0;
                color: #fff;
                font-size: 20px;
                line-height: 1.1;
                font-weight: 800;
                text-transform: capitalize;
            }
            .driver-app-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                justify-content: flex-end;
            }
            .driver-app-toggle,
            .driver-app-button,
            .driver-install-note {
                height: 40px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border-radius: 10px;
                padding: 0 14px;
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .driver-app-toggle,
            .driver-app-button {
                border: 1px solid rgba(255,255,255,0.1);
                background: #0f1210;
                color: #aab4c8;
                cursor: pointer;
                font-family: inherit;
            }
            .driver-app-toggle.online {
                border-color: rgba(62,207,110,0.28);
                color: #3ecf6e;
                background: rgba(62,207,110,0.08);
            }
            .driver-app-button:hover,
            .driver-app-toggle:hover {
                border-color: rgba(249,115,22,0.38);
                color: #f97316;
            }
            .driver-install-note {
                color: #778173;
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.06);
            }
            .driver-offer-alert {
                flex-basis: 100%;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 12px;
                border-radius: 10px;
                border: 1px solid rgba(249,115,22,0.18);
                background: rgba(249,115,22,0.06);
                color: #f7b37c;
                font-size: 12px;
                font-weight: 700;
            }

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
            .dd-route-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin: 10px 0;
            }
            .driver-photo-card {
                margin-top: 14px;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 12px;
                background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.018));
                padding: 14px;
            }
            .driver-photo-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 12px;
            }
            .driver-photo-head p {
                margin: 0 0 4px;
                color: #f97316;
                font-size: 9px;
                font-weight: 900;
                letter-spacing: 0.16em;
                text-transform: uppercase;
            }
            .driver-photo-head h3 {
                margin: 0;
                color: #fff;
                font-size: 16px;
                font-weight: 800;
            }
            .driver-photo-icon {
                width: 38px;
                height: 38px;
                border-radius: 10px;
                border: 1px solid rgba(249,115,22,0.25);
                background: rgba(249,115,22,0.08);
                color: #f97316;
                display: grid;
                place-items: center;
                flex-shrink: 0;
            }
            .driver-photo-grid {
                display: grid;
                grid-template-columns: minmax(0, 0.82fr) minmax(0, 1fr);
                gap: 12px;
            }
            .driver-photo-capture {
                min-height: 154px;
                border: 1px dashed rgba(249,115,22,0.35);
                border-radius: 12px;
                background: rgba(0,0,0,0.18);
                color: #f97316;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                overflow: hidden;
                position: relative;
                text-align: center;
                font-family: inherit;
            }
            .driver-photo-capture img {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .driver-photo-capture span {
                position: relative;
                z-index: 1;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border-radius: 999px;
                background: rgba(0,0,0,0.68);
                padding: 7px 11px;
                color: #fff;
                font-size: 10px;
                font-weight: 900;
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }
            .driver-photo-capture small {
                max-width: 180px;
                color: #8b958f;
                font-size: 11px;
                line-height: 1.45;
                font-weight: 650;
            }
            .driver-photo-fields {
                display: grid;
                gap: 8px;
            }
            .driver-photo-fields label {
                display: grid;
                gap: 5px;
                color: #727a75;
                font-size: 9px;
                font-weight: 900;
                letter-spacing: 0.14em;
                text-transform: uppercase;
            }
            .driver-photo-fields select,
            .driver-photo-fields textarea {
                width: 100%;
                border: 1px solid #1e2420;
                border-radius: 9px;
                background: #0f1210;
                color: #e7ece7;
                font-family: inherit;
                font-size: 12px;
                font-weight: 700;
                outline: none;
                padding: 10px 11px;
                resize: vertical;
            }
            .driver-photo-message {
                display: flex;
                align-items: center;
                gap: 7px;
                margin-top: 10px;
                border-radius: 9px;
                padding: 9px 10px;
                font-size: 11px;
                font-weight: 800;
            }
            .driver-photo-message.ok {
                border: 1px solid rgba(62,207,110,0.2);
                background: rgba(62,207,110,0.08);
                color: #3ecf6e;
            }
            .driver-photo-message.error {
                border: 1px solid rgba(232,64,64,0.22);
                background: rgba(232,64,64,0.08);
                color: #ff7373;
            }
            .driver-photo-submit {
                width: 100%;
                margin-top: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border: 0;
                border-radius: 9px;
                background: #f97316;
                color: #000;
                min-height: 40px;
                font-family: inherit;
                font-size: 10px;
                font-weight: 950;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                cursor: pointer;
            }
            .driver-photo-submit:disabled {
                background: #222722;
                color: #5d655f;
                cursor: not-allowed;
            }

            /* ESSENTIALS GRID */
            .dd-essentials-grid {
                display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px;
            }

            .driver-shift-card {
                margin-bottom: 16px;
                padding: 18px;
                border: 1px solid rgba(249,115,22,0.24);
                border-radius: 12px;
                background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(20,26,24,0.96) 42%, rgba(9,11,10,0.98));
                box-shadow: 0 18px 45px rgba(0,0,0,0.24);
            }
            .driver-shift-top {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 14px;
            }
            .driver-shift-kicker {
                margin: 0 0 4px;
                color: #f97316;
                font-size: 10px;
                font-weight: 900;
                letter-spacing: 0.16em;
                text-transform: uppercase;
            }
            .driver-shift-top h2 {
                margin: 0;
                color: #fff;
                font-size: 22px;
                font-weight: 900;
                letter-spacing: -0.02em;
            }
            .driver-shift-pill {
                display: inline-flex;
                align-items: center;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 999px;
                color: #aaa;
                background: rgba(255,255,255,0.04);
                padding: 7px 11px;
                font-size: 10px;
                font-weight: 900;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                white-space: nowrap;
            }
            .driver-shift-pill.active {
                color: #3ecf6e;
                border-color: rgba(62,207,110,0.28);
                background: rgba(62,207,110,0.1);
            }
            .driver-shift-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }
            .driver-shift-metric {
                background: rgba(8,10,9,0.72);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 8px;
                padding: 12px;
                min-height: 92px;
            }
            .driver-shift-metric svg { color: #f97316; margin-bottom: 10px; }
            .driver-shift-metric span {
                display: block;
                color: #777;
                font-size: 9px;
                font-weight: 900;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                margin-bottom: 6px;
            }
            .driver-shift-metric strong {
                display: block;
                color: #fff;
                font-size: 20px;
                line-height: 1.05;
                font-weight: 900;
            }
            .driver-shift-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
                flex-wrap: wrap;
            }
            .driver-shift-actions form { margin: 0; }
            .driver-shift-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 42px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.04);
                color: #fff;
                padding: 0 16px;
                font-size: 11px;
                font-weight: 900;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                text-decoration: none;
            }
            .driver-shift-btn.primary {
                background: #f97316;
                border-color: #f97316;
                color: #050505;
            }
            .driver-shift-note {
                margin: 12px 0 0;
                color: #777;
                font-size: 12px;
                line-height: 1.5;
            }

            @media (max-width: 1024px) {
                .dd-two-col, .dd-bottom-grid { grid-template-columns: 1fr; }
                .dd-stat-grid { grid-template-columns: repeat(3, 1fr); }
                .driver-shift-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 640px) {
                .driver-app-card { align-items: stretch; flex-direction: column; padding: 14px; }
                .driver-app-status h2 { font-size: 18px; }
                .driver-app-actions { display: grid; grid-template-columns: 1fr 1fr; justify-content: stretch; }
                .driver-app-toggle, .driver-app-button, .driver-install-note { width: 100%; padding: 0 10px; }
                .driver-install-note { grid-column: 1 / -1; }
                .dd-stat-grid { grid-template-columns: repeat(3, 1fr); }
                .dd-stat-card { padding: 12px 10px; }
                .dd-stat-value { font-size: 20px; }
                .dd-addr-grid { grid-template-columns: 1fr; }
                .dd-route-actions { grid-template-columns: 1fr; }
                .driver-photo-grid { grid-template-columns: 1fr; }
                .driver-photo-capture { min-height: 130px; }
                .dd-stripe-banner { flex-direction: column; align-items: stretch; gap: 10px; padding: 14px 16px; }
                .dd-stripe-left { align-items: flex-start; }
                .dd-stripe-btn { text-align: center; justify-content: center; white-space: normal; }
                .dd-stripe-connected { text-align: center; }
                .dd-weather-card { padding: 14px 16px; }
                .dd-weather-temp { font-size: 22px; }
                .driver-shift-card { padding: 14px; }
                .driver-shift-top { flex-direction: column; gap: 10px; }
                .driver-shift-grid { grid-template-columns: 1fr; }
                .driver-shift-btn, .driver-shift-actions form { width: 100%; }
            }
        `}</style>

        <DriverAppControls availableCount={availableOrders.length} activeOrderStatus={primaryOrder?.status ?? null} />

        <HustleAssistant
            activeOrderId={primaryOrder?.id ?? null}
            activeOrderStatus={primaryOrder?.status ?? null}
            activeOrderPay={primaryOrder?.totalPay ?? primaryOrder?.driverPay ?? null}
            activeOrderDistance={primaryOrder?.distance ?? null}
        />

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

        <DriverShiftPayoutCard
            activeShift={activeShift}
            todayMinutes={todayShiftMinutes}
            todayShiftPay={todayShiftPay}
            stripeConnected={hasStripe}
            stripeReady={stripeReady}
            balance={Number(driver.balance || 0)}
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
                        <span className="dd-stripe-title">
                            {stripeReady ? "Stripe payouts active." : "Stripe setup started."}
                        </span>
                        <span className="dd-stripe-sub">
                            {stripeReady
                                ? "Your payouts are active and rolling to your bank."
                                : "Finish onboarding so payouts can move to your bank."}
                        </span>
                    </div>
                </div>
                {stripeReady ? (
                    <span className="dd-stripe-connected">Payouts Active</span>
                ) : (
                    <Link href="/driver/dashboard/account" className="dd-stripe-btn">Finish Setup</Link>
                )}
            </div>
        )}

        <DriverCarePanel
            balance={Number(driver.balance || 0)}
            totalEarnings={stats.totalEarnings}
            trips={stats.trips}
            rating={stats.rating}
            activeOrder={primaryOrder}
            availableCount={availableOrders.length}
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
                            {(pickupMapUrl || dropoffMapUrl) && (
                                <div className="dd-route-actions">
                                    {pickupMapUrl && (
                                        <a className="dd-btn-ghost" style={{ marginBottom: 0 }} href={pickupMapUrl} target="_blank" rel="noreferrer">
                                            Navigate to Pickup
                                        </a>
                                    )}
                                    {dropoffMapUrl && (
                                        <a className="dd-btn-gold" style={{ marginBottom: 0 }} href={dropoffMapUrl} target="_blank" rel="noreferrer">
                                            Navigate to Drop-off
                                        </a>
                                    )}
                                </div>
                            )}
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
                {primaryOrder ? (
                    <OrderTransparencyLog order={primaryOrder} compact perspective="driver" />
                ) : null}
                <DriverIncidentTimeline order={primaryOrder} />
                <DriverPhotoReportCard orderId={primaryOrder?.id ?? null} />
            </div>
        </div>
        </>
    );
}
