"use client";

import { CircleDollarSign, HandCoins, ReceiptText, ShieldCheck, WalletCards } from "lucide-react";

interface OrderTransparencyLogProps {
  order: any;
  compact?: boolean;
  perspective?: "customer" | "driver" | "merchant";
}

function asMoney(value: number) {
  return `$${Math.max(0, Number(value || 0)).toFixed(2)}`;
}

function getOrderTotal(order: any) {
  return Number(order?.total ?? order?.totalPrice ?? 0);
}

function getItemsSubtotal(order: any) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const itemSum = items.reduce((sum: number, item: any) => {
    const price = Number(item?.price ?? item?.menuItem?.price ?? 0);
    const qty = Number(item?.quantity ?? 1);
    return sum + price * qty;
  }, 0);
  return itemSum > 0 ? itemSum : Math.max(0, getOrderTotal(order) - Number(order?.tip || 0) - 2.99);
}

export default function OrderTransparencyLog({ order, compact = false, perspective = "customer" }: OrderTransparencyLogProps) {
  const customerPaid = getOrderTotal(order);
  const tip = Number(order?.tip || 0);
  const driverBase = Number(order?.totalPay ?? order?.driverPay ?? 0);
  const driverReceived = driverBase + tip;
  const subtotal = getItemsSubtotal(order);
  const trueServeFee = Math.max(0, subtotal * 0.15);
  const merchantReceived = Math.max(0, subtotal - trueServeFee);
  const deliveryAndTax = Math.max(0, customerPaid - subtotal - tip);
  const roundUp = Number(order?.roundUpAmount || order?.charityRoundUp || 0);

  const rows = [
    { label: "Customer paid", value: asMoney(customerPaid), detail: "Total charged for this order.", icon: ReceiptText },
    { label: "Merchant receives", value: asMoney(merchantReceived), detail: "Estimated restaurant share after TrueServe fee.", icon: WalletCards },
    { label: "Driver receives", value: asMoney(driverReceived), detail: tip > 0 ? `${asMoney(tip)} tip included. Tips stay with the driver.` : "Tips stay with the driver when added.", icon: HandCoins },
    { label: "TrueServe fee", value: asMoney(trueServeFee), detail: "Estimated platform fee based on the current 15% model.", icon: CircleDollarSign },
    { label: "Delivery, tax, adjustments", value: asMoney(deliveryAndTax), detail: "Delivery, tax, discounts, or payment adjustments.", icon: ShieldCheck },
  ];

  return (
    <section className={`transparency-log${compact ? " compact" : ""}`} aria-label="Order transparency log">
      <style>{`
        .transparency-log {
          border: 1px solid rgba(249,115,22,.16);
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(18,24,21,.96), rgba(10,13,11,.98));
          box-shadow: 0 18px 46px rgba(0,0,0,.22);
          padding: 15px;
          margin: 12px 0;
          color: #fff;
        }
        .transparency-log.compact {
          border-radius: 10px;
          padding: 13px;
          margin: 14px 0;
        }
        .transparency-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .transparency-kicker {
          margin: 0 0 5px;
          color: #f97316;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .transparency-title {
          margin: 0;
          color: #fff;
          font-size: 17px;
          line-height: 1.15;
          font-weight: 950;
        }
        .transparency-note {
          margin: 6px 0 0;
          color: #929c96;
          font-size: 11px;
          line-height: 1.45;
          font-weight: 650;
        }
        .transparency-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          border: 1px solid rgba(62,207,110,.2);
          background: rgba(62,207,110,.08);
          color: #3ecf6e;
          padding: 7px 9px;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .transparency-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
        }
        .transparency-row {
          min-width: 0;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          background: rgba(255,255,255,.035);
          padding: 11px;
        }
        .transparency-row svg {
          color: #f97316;
          margin-bottom: 8px;
        }
        .transparency-row span {
          display: block;
          color: #778079;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .transparency-row strong {
          display: block;
          color: #fff;
          font-size: 20px;
          font-weight: 950;
          letter-spacing: -.04em;
          margin-bottom: 4px;
        }
        .transparency-row p {
          margin: 0;
          color: #8e9992;
          font-size: 10px;
          line-height: 1.4;
          font-weight: 650;
        }
        .transparency-roundup {
          margin-top: 8px;
          border-radius: 10px;
          border: 1px solid rgba(62,207,110,.18);
          background: rgba(62,207,110,.06);
          color: #b9f3cd;
          padding: 10px 11px;
          font-size: 11px;
          line-height: 1.45;
          font-weight: 750;
        }
        @media (max-width: 980px) {
          .transparency-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .transparency-head { flex-direction: column; }
          .transparency-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="transparency-head">
        <div>
          <p className="transparency-kicker">Transparency Log</p>
          <h3 className="transparency-title">Where the money goes.</h3>
          <p className="transparency-note">
            {perspective === "driver"
              ? "Drivers see route pay, tips, and platform math instead of guessing."
              : "We show the order math so customers, restaurants, and drivers can see the same story."}
          </p>
        </div>
        <div className="transparency-badge">
          <ShieldCheck size={13} aria-hidden="true" />
          Open math
        </div>
      </div>

      <div className="transparency-grid">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="transparency-row">
              <Icon size={16} aria-hidden="true" />
              <span>{row.label}</span>
              <strong>{row.value}</strong>
              <p>{row.detail}</p>
            </div>
          );
        })}
      </div>

      {roundUp > 0 ? (
        <div className="transparency-roundup">
          Local round-up: {asMoney(roundUp)} is marked for community support.
        </div>
      ) : null}
    </section>
  );
}
