"use client";

import { Camera, CheckCircle2, Clock3, LifeBuoy, MapPinned, ShieldCheck } from "lucide-react";

interface DriverIncidentTimelineProps {
  order: any | null;
}

function statusLabel(status?: string | null) {
  if (!status) return "No active route";
  return status.replaceAll("_", " ").toLowerCase();
}

export default function DriverIncidentTimeline({ order }: DriverIncidentTimelineProps) {
  const status = order?.status || null;
  const hasPickup = ["PICKED_UP", "DELIVERED"].includes(status);
  const hasDelivery = status === "DELIVERED";
  const photoCount = Number(order?.pickupPhotoUrl ? 1 : 0) + Number(order?.deliveryPhotoUrl ? 1 : 0);

  const items = [
    {
      label: "Route opened",
      detail: order ? `${order.restaurant?.name || "Restaurant"} route is active.` : "No active delivery right now.",
      active: Boolean(order),
      icon: MapPinned,
    },
    {
      label: "Wait protection",
      detail: order ? "Use the Patience Pay timer when you arrive at the restaurant." : "Wait timer appears when a route is active.",
      active: Boolean(order),
      icon: Clock3,
    },
    {
      label: "Pickup proof",
      detail: hasPickup ? "Pickup has been confirmed." : "Pickup photo or confirmation protects the handoff.",
      active: hasPickup,
      icon: Camera,
    },
    {
      label: "Support evidence",
      detail: photoCount > 0 ? `${photoCount} proof photo${photoCount === 1 ? "" : "s"} attached.` : "Snap a support photo for delays, damaged bags, missing items, or unsafe dropoffs.",
      active: photoCount > 0,
      icon: LifeBuoy,
    },
    {
      label: "Delivery closed",
      detail: hasDelivery ? "Route completed and ready for settlement review." : `Current status: ${statusLabel(status)}.`,
      active: hasDelivery,
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="driver-incident-card" aria-label="Driver incident timeline">
      <style>{`
        .driver-incident-card {
          margin-top: 14px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.018));
          padding: 14px;
        }
        .driver-incident-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        .driver-incident-head p {
          margin: 0 0 4px;
          color: #f97316;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .driver-incident-head h3 {
          margin: 0;
          color: #fff;
          font-size: 16px;
          font-weight: 900;
        }
        .driver-incident-shield {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(62,207,110,.22);
          background: rgba(62,207,110,.08);
          color: #3ecf6e;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .driver-incident-list {
          display: grid;
          gap: 8px;
        }
        .driver-incident-row {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 10px;
          align-items: start;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(0,0,0,.18);
          padding: 10px;
        }
        .driver-incident-dot {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          color: #7f877f;
          display: grid;
          place-items: center;
        }
        .driver-incident-row.active .driver-incident-dot {
          border-color: rgba(62,207,110,.22);
          background: rgba(62,207,110,.08);
          color: #3ecf6e;
        }
        .driver-incident-row strong {
          display: block;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .driver-incident-row span {
          display: block;
          color: #8d968f;
          font-size: 11px;
          line-height: 1.45;
          font-weight: 650;
        }
      `}</style>

      <div className="driver-incident-head">
        <div>
          <p>Incident Timeline</p>
          <h3>Proof and protection for this route</h3>
        </div>
        <div className="driver-incident-shield">
          <ShieldCheck size={18} aria-hidden="true" />
        </div>
      </div>

      <div className="driver-incident-list">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`driver-incident-row${item.active ? " active" : ""}`}>
              <div className="driver-incident-dot"><Icon size={15} aria-hidden="true" /></div>
              <div>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
