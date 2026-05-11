"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ChatWindow from "@/components/ChatWindow";
import MapWithDirections from "@/components/MapWithDirections";
import ReviewModal from "@/components/ReviewModal";
import { customerCancelOrder, submitOrderIssueProof } from "../actions";
import { useRamenStream } from "@/hooks/useRamenStream";
import { driverLocChannel } from "@/lib/ramen/types";
import type { DriverLocationPayload } from "@/lib/ramen/types";
import PostDeliveryTip from "@/components/PostDeliveryTip";

interface OrderTrackingClientProps {
    order: any;
}

export default function OrderTrackingClient({ order }: OrderTrackingClientProps) {
    const [currentOrder, setCurrentOrder] = useState(order);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [showDelivered, setShowDelivered] = useState(currentOrder.status === 'DELIVERED');
    const [showTipPrompt, setShowTipPrompt] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelComment, setCancelComment] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);
    const [eta, setEta] = useState<string>("Calculating...");
    const [issueType, setIssueType] = useState("Wrong items");
    const [issueDescription, setIssueDescription] = useState("");
    const [issuePhoto, setIssuePhoto] = useState<File | null>(null);
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

    const parseCoordinate = (value: unknown): number | null => {
        const num = typeof value === "number" ? value : Number(value);
        return Number.isFinite(num) ? num : null;
    };

    const restaurantLat = parseCoordinate(order.restaurant?.lat);
    const restaurantLng = parseCoordinate(order.restaurant?.lng);
    const driverLat = parseCoordinate(order.driver?.currentLat);
    const driverLng = parseCoordinate(order.driver?.currentLng);
    const deliveryLat = parseCoordinate(order.deliveryLat);
    const deliveryLng = parseCoordinate(order.deliveryLng);

    const [customerPos, setCustomerPos] = useState<[number, number] | null>(
        deliveryLat !== null && deliveryLng !== null ? [deliveryLat, deliveryLng] : null
    );
    const [driverPos, setDriverPos] = useState<[number, number] | null>(
        driverLat !== null && driverLng !== null
            ? [driverLat, driverLng]
            : (restaurantLat !== null && restaurantLng !== null ? [restaurantLat, restaurantLng] : null)
    );
    const [driverBearing, setDriverBearing] = useState(0);
    const routeOrigin =
        restaurantLat !== null && restaurantLng !== null
            ? { lat: restaurantLat, lng: restaurantLng }
            : null;
    const mapDestination =
        customerPos !== null
            ? { lat: customerPos[0], lng: customerPos[1] }
            : null;
    const mapOrigin =
        driverPos !== null
            ? { lat: driverPos[0], lng: driverPos[1] }
            : null;

    function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number) {
        const startLatRad = (startLat * Math.PI) / 180;
        const startLngRad = (startLng * Math.PI) / 180;
        const destLatRad = (destLat * Math.PI) / 180;
        const destLngRad = (destLng * Math.PI) / 180;
        const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
        const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
        const brng = (Math.atan2(y, x) * 180) / Math.PI;
        return (brng + 360) % 360;
    }

    useEffect(() => {
        if (customerPos || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCustomerPos([position.coords.latitude, position.coords.longitude]);
            },
            () => {
                console.log("Unable to access geolocation for customer map centering.");
            }
        );
    }, [customerPos]);

    // Order status via Supabase postgres_changes (reliable for DB-level updates)
    useEffect(() => {
        const orderCh = supabase
            .channel(`order-track-${order.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Order', filter: `id=eq.${order.id}` }, (payload) => {
                const newOrder = payload.new;
                setCurrentOrder((prev: any) => ({ ...prev, ...newOrder }));
                if (newOrder.status === 'DELIVERED') {
                    setShowDelivered(true);
                    // Show tip prompt first, then review modal after tip is dismissed
                    setTimeout(() => setShowTipPrompt(true), 3500);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(orderCh); };
    }, [order.id]);

    // Driver location via RAMEN SSE — low-latency pings from DriverLocationTracker
    const { lastEvent: locEvent } = useRamenStream<DriverLocationPayload>(
        order.driverId ? driverLocChannel(order.driverId) : null,
        { filter: ['driver_location'] },
    );

    useEffect(() => {
        if (!locEvent) return;
        const { lat, lng } = locEvent.payload;
        const nextLat = parseCoordinate(lat);
        const nextLng = parseCoordinate(lng);
        if (nextLat === null || nextLng === null) return;
        setDriverPos(prev => {
            if (!prev) return [nextLat, nextLng];
            const bearing = calculateBearing(prev[0], prev[1], nextLat, nextLng);
            if (bearing !== 0) setDriverBearing(bearing);
            return [nextLat, nextLng];
        });
    }, [locEvent]);

    const getProgressStep = (status: string) => {
        if (status === 'PENDING') return 1;
        if (status === 'PREPARING') return 2;
        if (status === 'READY_FOR_PICKUP') return 3;
        if (status === 'PICKED_UP') return 4;
        if (status === 'DELIVERED') return 5;
        return 1;
    };
    const currentStep = getProgressStep(currentOrder.status);
    const statusContent = {
        PENDING: {
            title: "Order confirmed",
            detail: "Your order is in the restaurant queue and the kitchen should begin prep shortly.",
            next: "Next up: kitchen prep begins",
        },
        PREPARING: {
            title: "Kitchen is cooking",
            detail: "The restaurant is actively preparing your order right now.",
            next: "Next up: packed and marked ready",
        },
        READY_FOR_PICKUP: {
            title: "Packed and waiting",
            detail: "Your order is ready at the restaurant and waiting for driver pickup.",
            next: "Next up: driver picks up your order",
        },
        PICKED_UP: {
            title: "On the road",
            detail: "Your driver has the order and is heading toward your delivery address.",
            next: "Next up: handoff at your door",
        },
        DELIVERED: {
            title: "Delivered",
            detail: "Your order has been completed. You can tip, review, or report an issue from here.",
            next: "Next up: rate your experience",
        },
        CANCELLED: {
            title: "Order cancelled",
            detail: "This order has been cancelled. Support can help if something looks off.",
            next: "Next up: review cancellation details",
        },
    } as const;
    const statusMeta = statusContent[currentOrder.status as keyof typeof statusContent] ?? {
        title: "Order update",
        detail: "We’re refreshing the latest status for your order.",
        next: "Next update coming soon",
    };

    const handleCancelOrder = async () => {
        if (!cancelReason) return;
        setIsCancelling(true);
        const res = await customerCancelOrder(currentOrder.id, cancelReason, cancelComment);
        setIsCancelling(false);
        if (res.success) {
            setIsCancelModalOpen(false);
            window.location.reload();
        } else {
            alert(res.error);
        }
    };

    const handleSubmitIssue = async () => {
        if (!issueDescription.trim() && !issuePhoto) {
            alert("Please provide details or attach a photo.");
            return;
        }

        setIsSubmittingIssue(true);
        const res = await submitOrderIssueProof(
            currentOrder.id,
            issueType,
            issueDescription,
            issuePhoto
        );
        setIsSubmittingIssue(false);

        if (res.success) {
            setIssueDescription("");
            setIssuePhoto(null);
            alert("Issue submitted. Support and the merchant have been notified.");
        } else {
            alert(res.error || "Failed to submit issue.");
        }
    };

    const openSupport = (prefill?: string) => {
        try {
            window.dispatchEvent(new CustomEvent("ts:support:open", { detail: { prefill } }));
        } catch { }
    };

    return (
        <main id="view-tracking" className="active">
        {showDelivered && (
            <div
                onClick={() => setShowDelivered(false)}
                style={{
                    position: "fixed", inset: 0, zIndex: 9000,
                    background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 20, cursor: "pointer",
                }}
            >
                <style>{`
                    @keyframes ts-ring-pulse {
                        0%   { transform: scale(0.6); opacity: 0; }
                        40%  { transform: scale(1.08); opacity: 1; }
                        70%  { transform: scale(0.97); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes ts-check-draw {
                        from { stroke-dashoffset: 60; opacity: 0; }
                        to   { stroke-dashoffset: 0;  opacity: 1; }
                    }
                    @keyframes ts-confetti-drop {
                        0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
                        100% { transform: translateY(80px)  rotate(360deg); opacity: 0; }
                    }
                    @keyframes ts-text-rise {
                        from { opacity: 0; transform: translateY(14px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>

                {/* Confetti dots */}
                {[...Array(14)].map((_, i) => (
                    <div key={i} style={{
                        position: "absolute",
                        top: `${20 + Math.random() * 40}%`,
                        left: `${5 + (i / 14) * 90}%`,
                        width: 8, height: 8, borderRadius: "50%",
                        background: ["#f97316","#fbbf24","#4dca80","#fff","#fb923c"][i % 5],
                        animation: `ts-confetti-drop ${0.9 + Math.random() * 0.8}s ease-out ${i * 0.06}s both`,
                        pointerEvents: "none",
                    }} />
                ))}

                {/* Checkmark circle */}
                <div style={{
                    width: 100, height: 100, borderRadius: "50%",
                    border: "3px solid rgba(77,202,128,0.3)",
                    background: "rgba(77,202,128,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "ts-ring-pulse 0.55s cubic-bezier(.34,1.56,.64,1) both",
                }}>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <polyline
                            points="10,26 20,36 38,14"
                            stroke="#4dca80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                            strokeDasharray="60" strokeDashoffset="60"
                            style={{ animation: "ts-check-draw 0.45s ease-out 0.3s both" }}
                        />
                    </svg>
                </div>

                <div style={{ textAlign: "center", animation: "ts-text-rise 0.4s ease-out 0.5s both", opacity: 0 }}>
                    <p style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
                        Order Delivered! 🎉
                    </p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 6 }}>
                        Enjoy your meal · tap to dismiss
                    </p>
                </div>

                <div style={{
                    marginTop: 4, padding: "10px 24px", borderRadius: 999,
                    border: "1px solid rgba(77,202,128,0.35)", background: "rgba(77,202,128,0.08)",
                    color: "#4dca80", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    animation: "ts-text-rise 0.4s ease-out 0.7s both", opacity: 0,
                }}>
                    Rate your experience →
                </div>
            </div>
        )}
            <div className="track-top">
                <div>
                    <div className="track-label">Order #{currentOrder.id.slice(-6).toUpperCase()} · {currentOrder.restaurant.name}</div>
                    <h2>Track Your Order</h2>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => openSupport(`Hi TrueServe Support — I need help with order ${currentOrder.id}.`)}
                    >
                        Contact Support
                    </button>
                    {['PENDING', 'PREPARING'].includes(currentOrder.status) && (
                        <button className="btn btn-red" onClick={() => setIsCancelModalOpen(true)}>Cancel Order</button>
                    )}
                </div>
            </div>

            <div className="track-grid">
                    {/* LEFT PANEL */}
                    <div className="track-left">
                        <div id="track-map" style={{ height: '300px', backgroundColor: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
                            {routeOrigin && mapOrigin && mapDestination ? (
                                <MapWithDirections
                                    routeOrigin={routeOrigin}
                                    origin={mapOrigin}
                                    destination={mapDestination}
                                    driverRotation={driverBearing}
                                    showDriver={true}
                                    onDurationUpdate={setEta}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs uppercase tracking-[0.16em] text-white/45">
                                    Waiting for live location coordinates...
                                </div>
                            )}
                        </div>

                        <div style={{ height: '340px' }}>
                             <ChatWindow orderId={currentOrder.id} role="CUSTOMER" fitContainer />
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="track-right">
                        <div className="status-box">
                            <h3>Order Status</h3>
                            <div style={{
                                display: "grid",
                                gap: 10,
                                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                                marginBottom: 16,
                            }}>
                                <div style={{
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                                        Current stage
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{statusMeta.title}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.55 }}>{statusMeta.detail}</div>
                                </div>
                                <div style={{
                                    border: "1px solid rgba(255,255,255,0.08)",
                                    background: "rgba(255,255,255,0.03)",
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                                        What happens next
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{statusMeta.next}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.58)", lineHeight: 1.55 }}>
                                        {currentOrder.status === "PICKED_UP" || currentOrder.status === "DELIVERED"
                                            ? `Live ETA: ${eta}`
                                            : "We’ll keep this page updated as the order moves forward."}
                                    </div>
                                </div>
                                <div style={{
                                    border: "1px solid rgba(249,115,22,0.2)",
                                    background: "rgba(249,115,22,0.06)",
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: "#f97316", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 6 }}>
                                        Support lane
                                    </div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Need help with this order?</div>
                                    <button
                                        type="button"
                                        className="btn btn-ghost"
                                        style={{ width: "100%" }}
                                        onClick={() => openSupport(`Hi TrueServe Support — I need help with order ${currentOrder.id} from ${currentOrder.restaurant?.name}.`)}
                                    >
                                        Open Support
                                    </button>
                                </div>
                            </div>

                            {/* Live prep status banner */}
                            {currentOrder.status === "PREPARING" && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.22)",
                                    borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                                }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%", background: "#fbbf24", flexShrink: 0,
                                        animation: "ddPulse 1.4s ease-in-out infinite",
                                    }} />
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: "#fbbf24" }}>Kitchen is preparing your order</div>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Your food is being made fresh right now</div>
                                    </div>
                                </div>
                            )}
                            {currentOrder.status === "READY_FOR_PICKUP" && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 10,
                                    background: "rgba(77,202,128,0.08)", border: "1px solid rgba(77,202,128,0.25)",
                                    borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                                }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%", background: "#4dca80", flexShrink: 0,
                                        animation: "ddPulse 1.4s ease-in-out infinite",
                                    }} />
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: "#4dca80" }}>Order is ready — driver is on the way</div>
                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Your food is packed and waiting for pickup</div>
                                    </div>
                                </div>
                            )}

                            {/* Animated overall progress bar */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: '#444', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                                        Step {currentStep} of 5
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold)' }}>
                                        {Math.round(((currentStep - 1) / 4) * 100)}% complete
                                    </span>
                                </div>
                                <div style={{ height: 5, background: '#1c1f28', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.round(((currentStep - 1) / 4) * 100)}%`,
                                        background: currentStep >= 5
                                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                                            : 'linear-gradient(90deg, #f97316, #fb923c)',
                                        borderRadius: 3,
                                        transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        boxShadow: currentStep >= 5
                                            ? '0 0 10px rgba(16,185,129,0.5)'
                                            : '0 0 10px rgba(249,115,22,0.5)',
                                    }} />
                                </div>
                            </div>

                            <div className="tl">
                                {/* Step 1: Order Confirmed */}
                                <div className={`tl-row ${currentStep >= 1 ? 'done' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 1 ? 'done' : 'wait'}`}>✓</div>
                                    <div className="tl-body">
                                        <div className="tl-lbl">Order Confirmed</div>
                                        <div className="tl-sub">{new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>

                                {/* Step 2: Preparing */}
                                <div className={`tl-row ${currentStep >= 2 ? 'done' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 2 ? 'done' : currentStep === 1 ? 'live' : 'wait'}`}>
                                        {currentStep >= 2 ? '✓' : '2'}
                                    </div>
                                    <div className="tl-body">
                                        <div className={`tl-lbl${currentStep === 1 ? ' active' : ''}`}>Preparing Your Food</div>
                                        <div className="tl-sub">
                                            {currentStep > 2 ? 'Kitchen done' : currentStep === 1 ? 'Waiting for kitchen to start' : 'Food is being made fresh'}
                                        </div>
                                        {currentStep === 1 && <div className="tl-eta">Kitchen starting soon…</div>}
                                    </div>
                                </div>

                                {/* Step 3: Ready for Pickup */}
                                <div className={`tl-row ${currentStep >= 3 ? 'done' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 3 ? 'done' : currentStep === 2 ? 'live' : 'wait'}`}>
                                        {currentStep >= 3 ? '✓' : '3'}
                                    </div>
                                    <div className="tl-body">
                                        <div className={`tl-lbl${currentStep === 2 ? ' active' : ''}`}>Ready for Pickup</div>
                                        <div className="tl-sub">
                                            {currentStep >= 3 ? 'Food packed and ready' : 'Kitchen will mark when ready'}
                                        </div>
                                        {currentStep === 2 && <div className="tl-eta">Almost done cooking…</div>}
                                    </div>
                                </div>

                                {/* Step 4: Driver En Route */}
                                <div className={`tl-row ${currentStep >= 4 ? 'done' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 4 ? 'done' : currentStep === 3 ? 'live' : 'wait'}`}>
                                        {currentStep >= 4 ? '✓' : '4'}
                                    </div>
                                    <div className="tl-body">
                                        <div className={`tl-lbl${currentStep === 3 ? ' active' : ''}`}>Driver En Route</div>
                                        <div className="tl-sub">
                                            {currentStep >= 4 ? `ETA: ${eta}` : 'Driver heading to restaurant'}
                                        </div>
                                        {currentStep === 3 && <div className="tl-eta">Driver is on the way to pick up…</div>}
                                    </div>
                                </div>

                                {/* Step 5: Delivered */}
                                <div className={`tl-row ${currentStep >= 5 ? 'done' : ''}`}>
                                    <div className={`tl-dot ${currentStep >= 5 ? 'done' : currentStep === 4 ? 'live' : 'wait'}`}>
                                        {currentStep >= 5 ? '✓' : '5'}
                                    </div>
                                    <div className="tl-body">
                                        <div className={`tl-lbl${currentStep === 4 ? ' active' : ''}`}>Delivered</div>
                                        <div className="tl-sub">
                                            {currentStep >= 5 ? 'Enjoy your meal! 🎉' : `Arriving in ${eta}`}
                                        </div>
                                        {currentStep === 4 && <div className="tl-eta">ETA: {eta}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {currentOrder.driverId && (
                            <div className="driver-box">
                                <h3>Your Driver</h3>
                                <div className="driver-inner">
                                    <div className="d-avatar" style={{ backgroundColor: 'var(--gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', fontWeight: 900 }}>
                                        {currentOrder.driver?.user?.name?.charAt(0) || "D"}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="d-name" style={{ fontWeight: 800 }}>{currentOrder.driver?.user?.name || "Marcus T."}</div>
                                        <div className="d-stat" style={{ fontSize: '11px', color: 'var(--t2)' }}>⭐ 4.96 · {currentOrder.driver?.vehicleType}</div>
                                    </div>
                                    <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 11px' }}>📞</button>
                                </div>
                            </div>
                        )}

                        {["DELIVERED", "PICKED_UP", "READY_FOR_PICKUP"].includes(currentOrder.status) && (
                            <div className="driver-box" style={{ marginTop: "12px" }}>
                                <h3>Report Order Issue</h3>
                                <p style={{ fontSize: "12px", color: "var(--t2)", marginBottom: "10px" }}>
                                    Received the wrong order? Send details and an optional photo proof.
                                </p>
                                <select
                                    value={issueType}
                                    onChange={(e) => setIssueType(e.target.value)}
                                    className="bg-transparent border border-white/10 w-full p-2 rounded"
                                    style={{ marginBottom: "10px" }}
                                >
                                    <option value="Wrong items">Wrong items</option>
                                    <option value="Missing items">Missing items</option>
                                    <option value="Damaged order">Damaged order</option>
                                    <option value="Other">Other</option>
                                </select>
                                <textarea
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                    className="bg-transparent border border-white/10 w-full p-2 rounded"
                                    placeholder="Tell us what happened..."
                                    rows={3}
                                />
                                <div style={{ marginTop: "10px", marginBottom: "12px" }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setIssuePhoto(e.target.files?.[0] || null)}
                                    />
                                    {issuePhoto && (
                                        <div style={{ fontSize: "11px", color: "var(--t2)", marginTop: "6px" }}>
                                            Attached: {issuePhoto.name}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="place-btn"
                                    style={{ marginTop: 0 }}
                                    onClick={handleSubmitIssue}
                                    disabled={isSubmittingIssue}
                                >
                                    {isSubmittingIssue ? "Submitting..." : "Submit Issue Report"}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    style={{ width: "100%", marginTop: "10px" }}
                                    onClick={() => openSupport(`I just submitted an issue for order ${currentOrder.id}. I’d like to speak to a human agent.`)}
                                >
                                    Talk to a Human
                                </button>
                            </div>
                        )}
                </div>
            </div>

            {showTipPrompt && currentOrder.driverId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
                    <div style={{ width: '100%', maxWidth: 400 }}>
                        <PostDeliveryTip
                            orderId={currentOrder.id}
                            restaurantName={currentOrder.restaurant?.name || "the restaurant"}
                            deliveryPhoto={currentOrder.deliveryPhotoUrl ?? null}
                            onDone={() => {
                                setShowTipPrompt(false);
                                setIsReviewOpen(true);
                            }}
                        />
                    </div>
                </div>
            )}

            {isCancelModalOpen && (
                <div className="overlay" style={{ display: 'flex', position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal" style={{ background: 'var(--card)', padding: '24px', borderRadius: 'var(--radius)', maxWidth: '400px', width: '90%' }}>
                        <h3>Cancel Order?</h3>
                        <p>Please select a reason for cancellation.</p>
                        <select 
                            className="bg-transparent border border-white/10 w-full p-2 rounded mt-4"
                            value={cancelReason} 
                            onChange={(e) => setCancelReason(e.target.value)}
                        >
                            <option value="">Select a reason</option>
                            <option value="Long wait time">Long wait time</option>
                            <option value="Ordered by mistake">Ordered by mistake</option>
                            <option value="Other">Other</option>
                        </select>
                        <div className="flex gap-2 mt-6">
                            <button className="sec-btn flex-1" onClick={() => setIsCancelModalOpen(false)}>Back</button>
                            <button className="place-btn flex-1" onClick={handleCancelOrder} disabled={isCancelling || !cancelReason}>
                                {isCancelling ? "..." : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentOrder.driverId && (
                <ReviewModal
                    isOpen={isReviewOpen}
                    onClose={() => setIsReviewOpen(false)}
                    orderId={currentOrder.id}
                    driverId={currentOrder.driverId}
                    customerId={currentOrder.userId}
                />
            )}
        </main>
    );
}
