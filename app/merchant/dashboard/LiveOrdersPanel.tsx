"use client";

import { useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { updateOrderStatus, refundOrder } from "@/app/merchant/actions";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  posReference?: string | null;
  deliveryAddress?: string | null;
  deliveryInstructions?: string | null;
  user?: { name?: string };
  items?: { name: string; quantity: number }[];
}

interface LiveOrdersPanelProps {
  restaurantId: string;
  initialOrders: Order[];
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:          { label: "New Order",     color: "#f97316", bg: "rgba(249,115,22,.1)",  border: "rgba(249,115,22,.25)" },
  PREPARING:        { label: "Preparing",     color: "#fbbf24", bg: "rgba(251,191,36,.1)",  border: "rgba(251,191,36,.25)" },
  READY_FOR_PICKUP: { label: "Ready",         color: "#4dca80", bg: "rgba(77,202,128,.1)",  border: "rgba(77,202,128,.25)" },
};

const NEXT_ACTION: Record<string, { label: string; next: string }> = {
  PENDING:   { label: "Start Prep",         next: "PREPARING" },
  PREPARING: { label: "Ready for Pickup",   next: "READY_FOR_PICKUP" },
};

export default function LiveOrdersPanel({ restaurantId, initialOrders }: LiveOrdersPanelProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [pending, startTransition] = useTransition();
  const [actionOrderId, setActionOrderId] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [refundConfirmId, setRefundConfirmId] = useState<string | null>(null);
  const [refundPending, setRefundPending] = useState(false);

  useEffect(() => {
    if (restaurantId === "preview") return;

    const channel = supabase
      .channel(`live-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Order;
            setOrders((prev) =>
              prev
                .map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
                .filter((o) => ["PENDING", "PREPARING", "READY_FOR_PICKUP"].includes(o.status))
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId]);

  const activeOrders = orders.filter((o) =>
    ["PENDING", "PREPARING", "READY_FOR_PICKUP"].includes(o.status)
  );

  const advance = (orderId: string, nextStatus: string) => {
    setActionOrderId(orderId);
    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus);
      setActionOrderId(null);
    });
  };

  return (
    <div style={{
      background: "#111",
      border: "0.5px solid #2a2a2a",
      borderRadius: 12,
      padding: 18,
      marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#666", letterSpacing: "0.07em", textTransform: "uppercase" }}>
          Live Orders
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#4dca80",
            animation: "ddPulse 1.8s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 10, color: "#4dca80", fontWeight: 600 }}>
            {activeOrders.length} active
          </span>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div style={{
          background: "#0d0d0d", border: "0.5px solid #1e1e1e",
          borderRadius: 8, padding: "14px 16px",
          fontSize: 12, color: "#555", textAlign: "center",
        }}>
          No active orders right now — new orders will appear here instantly.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeOrders.map((order) => {
            const statusMeta = STATUS_LABEL[order.status];
            const action = NEXT_ACTION[order.status];
            const isActing = actionOrderId === order.id && pending;
            const age = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
            const isTestOrder = String(order.posReference || "").startsWith("TEST-");

            return (
              <div key={order.id} style={{
                background: "#0d0d0d",
                border: `0.5px solid ${statusMeta?.border || "#242424"}`,
                borderRadius: 10,
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: statusMeta?.bg, border: `1px solid ${statusMeta?.border}`,
                      color: statusMeta?.color, borderRadius: 20,
                      padding: "2px 10px", fontSize: 10, fontWeight: 800,
                      letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6,
                    }}>
                      {statusMeta?.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                      {order.user?.name || "Customer"} · ${Number(order.total).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                      #{order.id.slice(-6).toUpperCase()} · {age < 1 ? "just now" : `${age}m ago`}
                    </div>
                    {isTestOrder && (
                      <div style={{
                        marginTop: 8,
                        display: "inline-flex",
                        border: "1px solid rgba(91,207,212,0.24)",
                        background: "rgba(91,207,212,0.08)",
                        color: "#5bcfd4",
                        borderRadius: 999,
                        padding: "4px 9px",
                        fontSize: 9,
                        fontWeight: 900,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}>
                        Training order - do not prepare
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    {action && (
                      <button
                        onClick={() => advance(order.id, action.next)}
                        disabled={isActing}
                        style={{
                          background: action.next === "PREPARING" ? "rgba(249,115,22,0.15)" : "rgba(77,202,128,0.15)",
                          border: `1px solid ${action.next === "PREPARING" ? "rgba(249,115,22,0.4)" : "rgba(77,202,128,0.4)"}`,
                          color: action.next === "PREPARING" ? "#f97316" : "#4dca80",
                          borderRadius: 9, padding: "9px 14px",
                          fontSize: 11, fontWeight: 800, cursor: "pointer",
                          whiteSpace: "nowrap",
                          opacity: isActing ? 0.5 : 1,
                          transition: "all 0.15s",
                          fontFamily: "inherit",
                        }}
                      >
                        {isActing ? "..." : action.label}
                      </button>
                    )}
                    {["PENDING", "PREPARING"].includes(order.status) && (
                      <button
                        onClick={() => setCancelConfirmId(order.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(248,113,113,0.25)",
                          color: "#f87171",
                          borderRadius: 9, padding: "6px 14px",
                          fontSize: 10, fontWeight: 800, cursor: "pointer",
                          whiteSpace: "nowrap",
                          transition: "all 0.15s",
                          fontFamily: "inherit",
                          letterSpacing: "0.06em",
                        }}
                      >
                        × Cancel
                      </button>
                    )}
                  </div>

                  {order.status === "READY_FOR_PICKUP" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <div style={{
                        background: "rgba(77,202,128,0.1)", border: "1px solid rgba(77,202,128,0.3)",
                        color: "#4dca80", borderRadius: 9, padding: "9px 14px",
                        fontSize: 11, fontWeight: 800, whiteSpace: "nowrap",
                      }}>
                        Awaiting Driver
                      </div>
                      <button
                        onClick={() => setRefundConfirmId(order.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(248,113,113,0.25)", color: "#f87171",
                          borderRadius: 9, padding: "6px 14px",
                          fontSize: 10, fontWeight: 800, cursor: "pointer",
                          whiteSpace: "nowrap", transition: "all 0.15s", fontFamily: "inherit",
                        }}
                      >
                        Refund
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelConfirmId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 16px",
        }}>
          <div style={{
            background: "#111", border: "1px solid #2a2a2a",
            borderRadius: 14, padding: "24px 20px", maxWidth: 360, width: "100%",
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              Cancel this order?
            </div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 20, lineHeight: 1.5 }}>
              Order #{cancelConfirmId.slice(-6).toUpperCase()} will be cancelled and the customer will be notified via SMS.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setCancelConfirmId(null)}
                style={{
                  flex: 1, background: "transparent",
                  border: "1px solid #333", color: "#aaa",
                  borderRadius: 9, padding: "10px 0",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Keep It
              </button>
              <button
                onClick={() => {
                  const id = cancelConfirmId;
                  setCancelConfirmId(null);
                  advance(id, "CANCELLED");
                }}
                style={{
                  flex: 1, background: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.35)", color: "#f87171",
                  borderRadius: 9, padding: "10px 0",
                  fontSize: 12, fontWeight: 800, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Refund confirmation modal */}
      {refundConfirmId && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px",
        }}>
          <div style={{
            background: "#111", border: "1px solid #2a2a2a",
            borderRadius: 14, padding: "24px 20px", maxWidth: 360, width: "100%",
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              Issue Refund?
            </div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 20, lineHeight: 1.5 }}>
              Order #{refundConfirmId.slice(-6).toUpperCase()} will be marked as refunded and cancelled. The customer will be notified.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setRefundConfirmId(null)}
                style={{
                  flex: 1, background: "transparent", border: "1px solid #333", color: "#aaa",
                  borderRadius: 9, padding: "10px 0", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Keep It
              </button>
              <button
                disabled={refundPending}
                onClick={async () => {
                  const id = refundConfirmId;
                  setRefundPending(true);
                  await refundOrder(id);
                  setRefundPending(false);
                  setRefundConfirmId(null);
                }}
                style={{
                  flex: 1, background: "rgba(248,113,113,0.12)",
                  border: "1px solid rgba(248,113,113,0.35)", color: "#f87171",
                  borderRadius: 9, padding: "10px 0", fontSize: 12, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit",
                  opacity: refundPending ? 0.5 : 1,
                }}
              >
                {refundPending ? "..." : "Yes, Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
