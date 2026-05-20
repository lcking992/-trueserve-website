"use client";

import Link from "next/link";
import { Gift, Heart, RotateCcw, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

interface CustomerOrderValuePanelProps {
  order: any;
  eta: string;
  onSupport: (message: string) => void;
}

function money(value: number) {
  return `$${Math.max(0, Number(value || 0)).toFixed(2)}`;
}

function getSubtotal(order: any) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const itemTotal = items.reduce((sum: number, item: any) => {
    const price = Number(item?.price ?? item?.menuItem?.price ?? 0);
    const quantity = Number(item?.quantity ?? 1);
    return sum + price * quantity;
  }, 0);
  return itemTotal > 0 ? itemTotal : Number(order?.total || 0);
}

function confidenceFor(status: string) {
  if (status === "DELIVERED") return { label: "Complete", detail: "Delivery finished and receipt is ready.", tone: "#3ecf6e" };
  if (status === "PICKED_UP") return { label: "Stable ETA", detail: "Driver has the order, so the ETA is more reliable.", tone: "#3ecf6e" };
  if (status === "READY_FOR_PICKUP") return { label: "Kitchen ready", detail: "The restaurant has packed the order for pickup.", tone: "#f97316" };
  if (status === "PREPARING") return { label: "Kitchen active", detail: "Prep is underway. ETA may tighten once packed.", tone: "#fbbf24" };
  return { label: "Order received", detail: "The restaurant queue is being monitored.", tone: "#f97316" };
}

export default function CustomerOrderValuePanel({ order, eta, onSupport }: CustomerOrderValuePanelProps) {
  const subtotal = getSubtotal(order);
  const points = Math.max(1, Math.floor(subtotal));
  const impactAmount = Math.max(0.05, subtotal * 0.01);
  const restaurantHref = order?.restaurantId || order?.restaurant?.id ? `/restaurants/${order.restaurantId || order.restaurant.id}` : "/restaurants";
  const confidence = confidenceFor(String(order?.status || ""));
  const supportReasons = [
    "Missing item",
    "Address issue",
    "Order running late",
  ];

  return (
    <section className="customer-value-panel" aria-label="Customer perks and order shortcuts">
      <style>{`
        .customer-value-panel {
          border: 1px solid rgba(249,115,22,.16);
          border-radius: 24px;
          background:
            radial-gradient(circle at 12% 0%, rgba(249,115,22,.12), transparent 30%),
            linear-gradient(180deg, rgba(18,24,21,.96), rgba(10,13,11,.98));
          box-shadow: 0 24px 60px rgba(0,0,0,.2);
          padding: 18px;
          margin-bottom: 12px;
          color: #fff;
        }
        .cvp-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }
        .cvp-kicker {
          margin: 0 0 5px;
          color: #f97316;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .cvp-title {
          margin: 0;
          font-size: 19px;
          font-weight: 950;
          letter-spacing: -.03em;
          line-height: 1.1;
        }
        .cvp-live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(62,207,110,.2);
          background: rgba(62,207,110,.08);
          color: #3ecf6e;
          border-radius: 999px;
          padding: 7px 9px;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .cvp-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #3ecf6e;
          box-shadow: 0 0 0 5px rgba(62,207,110,.1);
        }
        .cvp-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .cvp-card {
          min-width: 0;
          border: 1px solid rgba(255,255,255,.075);
          background: rgba(255,255,255,.035);
          border-radius: 15px;
          padding: 12px;
        }
        .cvp-card svg {
          color: #f97316;
          margin-bottom: 8px;
        }
        .cvp-card span {
          display: block;
          color: #7d8781;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .13em;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .cvp-card strong {
          display: block;
          color: #fff;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -.04em;
          line-height: 1.05;
        }
        .cvp-card p {
          margin: 5px 0 0;
          color: #8d9791;
          font-size: 10px;
          font-weight: 650;
          line-height: 1.38;
        }
        .cvp-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .cvp-link,
        .cvp-button {
          min-height: 40px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
        }
        .cvp-link.primary {
          background: #f97316;
          border: 1px solid #f97316;
          color: #070707;
        }
        .cvp-link.secondary,
        .cvp-button {
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.08);
          color: #fff;
        }
        .cvp-support {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 7px;
          margin-top: 10px;
        }
        .cvp-support button {
          border: 1px solid rgba(249,115,22,.18);
          background: rgba(249,115,22,.065);
          color: #f5c7a6;
          border-radius: 12px;
          padding: 9px 7px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          cursor: pointer;
        }
        @media (max-width: 720px) {
          .customer-value-panel { border-radius: 22px; padding: 16px; }
          .cvp-head { flex-direction: column; }
          .cvp-grid { grid-template-columns: 1fr; }
          .cvp-actions { grid-template-columns: 1fr; }
          .cvp-support { grid-template-columns: 1fr; }
          .cvp-card { padding: 13px; }
        }
      `}</style>

      <div className="cvp-head">
        <div>
          <p className="cvp-kicker">Customer Perks</p>
          <h3 className="cvp-title">Your order is working for you.</h3>
        </div>
        <div className="cvp-live">
          <span className="cvp-live-dot" />
          {confidence.label}
        </div>
      </div>

      <div className="cvp-grid">
        <div className="cvp-card">
          <Sparkles size={16} aria-hidden="true" />
          <span>Rewards</span>
          <strong>{points} pts</strong>
          <p>Estimated TruePoints from this order.</p>
        </div>
        <div className="cvp-card">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>ETA confidence</span>
          <strong style={{ color: confidence.tone }}>{eta || confidence.label}</strong>
          <p>{confidence.detail}</p>
        </div>
        <div className="cvp-card">
          <Gift size={16} aria-hidden="true" />
          <span>Local impact</span>
          <strong>{money(impactAmount)}</strong>
          <p>Potential community impact allocation when TrueServe Gives is enabled.</p>
        </div>
      </div>

      <div className="cvp-actions">
        <Link href={restaurantHref} className="cvp-link primary">
          <RotateCcw size={14} aria-hidden="true" />
          Reorder
        </Link>
        <Link href="/user/favorites" className="cvp-link secondary">
          <Heart size={14} aria-hidden="true" />
          Favorites
        </Link>
      </div>

      <div className="cvp-support" aria-label="Quick support reasons">
        {supportReasons.map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => onSupport(`Hi TrueServe Support — ${reason} on order ${order.id}.`)}
          >
            {reason}
          </button>
        ))}
      </div>
    </section>
  );
}
