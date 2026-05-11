"use client";

import { useState, useTransition } from "react";

interface Props {
  orderId: string;
  restaurantName: string;
  deliveryPhoto?: string | null;
  onDone: () => void;
}

const PRESET_AMOUNTS = [1, 2, 3, 5];

export default function PostDeliveryTip({ orderId, restaurantName, deliveryPhoto, onDone }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tipAmount = selected !== null ? selected : (parseFloat(custom) || 0);

  const handleSubmit = () => {
    if (tipAmount <= 0) { onDone(); return; }
    startTransition(async () => {
      // Fire-and-forget tip record — backend can wire Stripe capture separately
      await fetch("/api/ramen/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: `order:${orderId}`,
          type: "order_status",
          payload: { orderId, event: "tip_added", tipAmount, ts: Date.now() },
        }),
      }).catch(() => {});
      setSubmitted(true);
      setTimeout(onDone, 2200);
    });
  };

  if (submitted) {
    return (
      <div style={{
        textAlign: "center", padding: "28px 20px",
        background: "rgba(77,202,128,0.06)", border: "1px solid rgba(77,202,128,0.2)",
        borderRadius: 16,
      }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}></div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#4dca80", marginBottom: 6 }}>
          ${tipAmount.toFixed(2)} tip sent!
        </div>
        <div style={{ fontSize: 12, color: "#666" }}>
          100% goes directly to your driver. Thank you!
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#111", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, overflow: "hidden",
    }}>
      {/* Delivery photo if available */}
      {deliveryPhoto && (
        <div style={{ position: "relative" }}>
          <img
            src={deliveryPhoto}
            alt="Your delivery"
            style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85))",
          }} />
          <div style={{
            position: "absolute", bottom: 12, left: 14,
            fontSize: 12, fontWeight: 800, color: "#fff",
          }}>
            Delivered by your driver
          </div>
        </div>
      )}

      <div style={{ padding: "20px 18px" }}>
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.14em", color: "#555", marginBottom: 4 }}>
          Your order from {restaurantName} has arrived
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
          How was your driver?
        </div>
        <div style={{ fontSize: 11, color: "#555", marginBottom: 18 }}>
          100% of tips go directly to your driver — TrueServe takes nothing.
        </div>

        {/* Preset amounts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 10 }}>
          {PRESET_AMOUNTS.map(amt => (
            <button
              key={amt}
              type="button"
              onClick={() => { setSelected(amt); setCustom(""); }}
              style={{
                padding: "10px 4px", borderRadius: 10, cursor: "pointer",
                border: `1px solid ${selected === amt ? "#f97316" : "rgba(255,255,255,0.1)"}`,
                background: selected === amt ? "rgba(249,115,22,0.12)" : "transparent",
                color: selected === amt ? "#f97316" : "#aaa",
                fontWeight: 800, fontSize: 14, transition: "all 0.15s",
              }}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: 13, color: "#666", fontWeight: 700,
          }}>$</span>
          <input
            type="number"
            min="0"
            step="0.50"
            placeholder="Custom amount"
            value={custom}
            onChange={e => { setCustom(e.target.value); setSelected(null); }}
            style={{
              width: "100%", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "10px 12px 10px 26px",
              fontSize: 13, color: "#fff", outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onDone}
            style={{
              flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer",
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "#555", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em",
            }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || tipAmount <= 0}
            style={{
              flex: 3, padding: "11px", borderRadius: 10, cursor: "pointer",
              background: tipAmount > 0 ? "#f97316" : "#1a1a1a",
              border: "none", color: tipAmount > 0 ? "#000" : "#444",
              fontWeight: 800, fontSize: 13, letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            {isPending ? "Sending..." : tipAmount > 0 ? `Send $${tipAmount.toFixed(2)} Tip` : "Select an amount"}
          </button>
        </div>
      </div>
    </div>
  );
}
