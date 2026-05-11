"use client";

import { BarChart3, HeartHandshake, LineChart, ReceiptText, Sparkles, TrendingUp } from "lucide-react";

interface GrowthConsultantProps {
  orders: any[];
  menuItems: any[];
  restaurantName: string;
}

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function GrowthConsultant({ orders, menuItems, restaurantName }: GrowthConsultantProps) {
  const delivered = orders.filter((order) => order.status === "DELIVERED");
  const cancelled = orders.filter((order) => order.status === "CANCELLED");
  const active = orders.filter((order) => ["PENDING", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP"].includes(order.status));
  const revenue = delivered.reduce((sum, order) => sum + Number(order.total || order.totalPrice || 0), 0);
  const avgOrder = delivered.length ? revenue / delivered.length : 0;
  const estimatedViews = Math.max(delivered.length * 8 + active.length * 3 + cancelled.length * 5, menuItems.length ? 24 : 0);
  const conversionRate = estimatedViews ? Math.min(100, (delivered.length / estimatedViews) * 100) : 0;
  const topMenuCandidates = [...menuItems]
    .filter((item) => item?.name)
    .slice(0, 3);

  return (
    <section className="growth-card" aria-label="Merchant growth consultant">
      <style>{`
        .growth-card {
          margin: 14px 0;
          border-radius: 14px;
          border: 1px solid rgba(249,115,22,.16);
          background: linear-gradient(180deg, rgba(18,24,21,.96), rgba(10,13,11,.98));
          box-shadow: 0 18px 46px rgba(0,0,0,.24);
          overflow: hidden;
        }
        .growth-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 17px 18px;
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .growth-kicker {
          margin: 0 0 6px;
          color: #f97316;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .growth-head h2 {
          margin: 0;
          color: #fff;
          font-size: 21px;
          line-height: 1.12;
          font-weight: 950;
        }
        .growth-head p {
          margin: 7px 0 0;
          color: #9da8a1;
          font-size: 12px;
          line-height: 1.55;
          font-weight: 650;
          max-width: 660px;
        }
        .growth-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          border-radius: 999px;
          border: 1px solid rgba(62,207,110,.2);
          background: rgba(62,207,110,.08);
          color: #3ecf6e;
          padding: 8px 11px;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .growth-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 0;
        }
        .growth-panel {
          padding: 16px;
          border-right: 1px solid rgba(255,255,255,.06);
        }
        .growth-panel:last-child { border-right: 0; }
        .growth-panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 950;
          margin-bottom: 12px;
        }
        .growth-panel-title svg { color: #f97316; }
        .growth-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }
        .growth-stat {
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          background: rgba(255,255,255,.035);
          padding: 11px;
          min-width: 0;
        }
        .growth-stat span {
          display: block;
          margin-bottom: 7px;
          color: #747d77;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .growth-stat strong {
          display: block;
          color: #fff;
          font-size: 21px;
          font-weight: 950;
          letter-spacing: -.04em;
        }
        .growth-insight {
          border-radius: 10px;
          border: 1px solid rgba(249,115,22,.16);
          background: rgba(249,115,22,.055);
          padding: 12px;
          color: #f4c29f;
          font-size: 12px;
          line-height: 1.55;
          font-weight: 700;
        }
        .growth-list {
          display: grid;
          gap: 8px;
        }
        .growth-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.032);
          padding: 11px 12px;
        }
        .growth-row strong {
          display: block;
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 4px;
        }
        .growth-row span {
          color: #89938d;
          font-size: 11px;
          line-height: 1.45;
          font-weight: 650;
        }
        .growth-row em {
          color: #f97316;
          font-size: 10px;
          font-style: normal;
          font-weight: 950;
          letter-spacing: .1em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .growth-roadmap {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          padding: 0 16px 16px;
        }
        .growth-roadmap-card {
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          background: rgba(255,255,255,.025);
          padding: 12px;
        }
        .growth-roadmap-card svg {
          color: #f97316;
          margin-bottom: 9px;
        }
        .growth-roadmap-card strong {
          display: block;
          color: #fff;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 5px;
        }
        .growth-roadmap-card span {
          color: #858f88;
          font-size: 11px;
          line-height: 1.45;
          font-weight: 650;
        }
        @media (max-width: 980px) {
          .growth-grid { grid-template-columns: 1fr; }
          .growth-panel { border-right: 0; border-bottom: 1px solid rgba(255,255,255,.06); }
          .growth-panel:last-child { border-bottom: 0; }
          .growth-roadmap { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .growth-head { flex-direction: column; }
          .growth-stats { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="growth-head">
        <div>
          <p className="growth-kicker">Growth Consultant</p>
          <h2>Turn ordering data into the next best move.</h2>
          <p>
            A practical first version for {restaurantName}: use orders we already track now, then unlock deeper menu and POS recommendations when Toast/Square/Clover data is connected.
          </p>
        </div>
        <div className="growth-badge">
          <Sparkles size={14} aria-hidden="true" />
          First version live
        </div>
      </div>

      <div className="growth-grid">
        <div className="growth-panel">
          <div className="growth-panel-title"><BarChart3 size={16} aria-hidden="true" /> Missed Opportunity</div>
          <div className="growth-stats">
            <div className="growth-stat">
              <span>Est. views</span>
              <strong>{estimatedViews}</strong>
            </div>
            <div className="growth-stat">
              <span>Orders</span>
              <strong>{delivered.length}</strong>
            </div>
            <div className="growth-stat">
              <span>Conversion</span>
              <strong>{conversionRate.toFixed(1)}%</strong>
            </div>
          </div>
          <div className="growth-insight">
            {delivered.length === 0
              ? "Once orders start flowing, this panel will show where customers hesitate before checkout. For now, make sure the storefront photo, hours, and top menu items are clean."
              : cancelled.length > 0
                ? `${cancelled.length} recent cancelled order${cancelled.length === 1 ? "" : "s"} should be reviewed for item availability, prep timing, or customer confusion.`
                : `Average completed order is ${money(avgOrder)}. Keep the top of the menu focused on fast, easy-to-understand items.`}
          </div>
        </div>

        <div className="growth-panel">
          <div className="growth-panel-title"><TrendingUp size={16} aria-hidden="true" /> Feature Candidates</div>
          <div className="growth-list">
            {(topMenuCandidates.length ? topMenuCandidates : [{ name: "Add signature item", price: null }]).map((item) => (
              <div key={item.id || item.name} className="growth-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.price ? `Listed at ${money(Number(item.price))}. ` : ""}Ready for a special, photo, or featured placement test.</span>
                </div>
                <em>Review</em>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="growth-roadmap" aria-label="Growth features coming later">
        <div className="growth-roadmap-card">
          <ReceiptText size={17} aria-hidden="true" />
          <strong>True-cost menu engineering</strong>
          <span>Needs item cost or POS margin data before we make profit claims.</span>
        </div>
        <div className="growth-roadmap-card">
          <HeartHandshake size={17} aria-hidden="true" />
          <strong>Driver kudos</strong>
          <span>Merchants will be able to recognize professional handoffs without creating unfair dispatch rules.</span>
        </div>
        <div className="growth-roadmap-card">
          <LineChart size={17} aria-hidden="true" />
          <strong>Full funnel analytics</strong>
          <span>Next tracking layer: menu views, checkout starts, abandoned carts, and best sections.</span>
        </div>
      </div>
    </section>
  );
}
