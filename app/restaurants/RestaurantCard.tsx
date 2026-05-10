"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toggleFavorite } from "@/app/user/favorite-actions";

function computeIsOpen(openTime?: string | null, closeTime?: string | null): boolean | null {
  const o = openTime?.slice(0, 5);
  const c = closeTime?.slice(0, 5);
  if (!o || !c) return null;
  const now = new Date().toTimeString().slice(0, 5);
  return now >= o && now <= c;
}

interface RestaurantCardProps {
  r: any;
  address?: string | null;
  search?: string | null;
  latParam?: string | null;
  lngParam?: string | null;
  userId?: string | null;
  initialIsFavorited?: boolean;
}

function estimateEta(distanceMiles: number | null | undefined): string {
  if (distanceMiles == null) return "~25 min";
  if (distanceMiles <= 1) return "15–20 min";
  if (distanceMiles <= 2) return "20–28 min";
  if (distanceMiles <= 3.5) return "25–35 min";
  if (distanceMiles <= 5) return "35–45 min";
  return "45–55 min";
}

function gradeToColor(grade: string): { bg: string; text: string; border: string } {
  switch (grade?.toUpperCase()) {
    case "A":
      return { bg: "#0d1a10", text: "#2ee5a0", border: "#1a4a2a" };
    case "B":
      return { bg: "#1c1508", text: "#f97316", border: "#57400f" };
    case "C":
      return { bg: "#1a1208", text: "#fb923c", border: "#5c3a0f" };
    case "D":
      return { bg: "#1a0d10", text: "#f87171", border: "#4a1a1a" };
    default:
      return { bg: "transparent", text: "#999", border: "transparent" };
  }
}

export default function RestaurantCard({
  r,
  address,
  search,
  latParam,
  lngParam,
  userId,
  initialIsFavorited = false,
}: RestaurantCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [isFav, setIsFav] = useState(initialIsFavorited);
  const [favPending, setFavPending] = useState(false);

  const isOpen = computeIsOpen(r.openTime, r.closeTime);

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) { window.location.href = "/login"; return; }
    setIsFav(prev => !prev);
    setFavPending(true);
    await toggleFavorite(r.id);
    setFavPending(false);
  };

  const hasGHL = Boolean(r.ghlUrl);
  const googleQuery = encodeURIComponent(`${r.name || ""} ${r.address || ""} ${r.city || ""} ${r.state || ""}`);

  const menuQuery = (() => {
    const params = new URLSearchParams();
    const addressText = (address || search || "").trim();
    if (addressText) params.set("address", addressText);
    if (latParam && lngParam) {
      params.set("lat", String(latParam));
      params.set("lng", String(lngParam));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  })();

  const hasHealthGrade = r.healthGrade && r.healthGrade !== "—";
  const colors = hasHealthGrade ? gradeToColor(r.healthGrade) : null;

  return (
    <Link key={r.id} href={`/restaurants/${r.id}${menuQuery}`} className="block">
      <motion.article
        className="rest-card"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={shouldReduceMotion ? undefined : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        whileHover={shouldReduceMotion ? undefined : { y: -6 }}
      >
      <motion.div
        className="rc-img"
        style={{
          backgroundImage: `url('${
            r.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
          }')`,
          position: "relative",
        }}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
        transition={shouldReduceMotion ? undefined : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {hasGHL && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              background: "rgba(12,14,19,.85)",
              color: "#fff",
              padding: "7px 10px",
              borderRadius: 999,
              fontSize: 9,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: 6,
              zIndex: 1,
              border: "1px solid rgba(255,255,255,.08)",
              letterSpacing: ".12em",
            }}
          >
            <span style={{ color: "var(--gold)" }}>●</span> FAST ASSIST
          </div>
        )}

        {/* OPEN / CLOSED badge */}
        {isOpen !== null && (
          <div style={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex", alignItems: "center", gap: 5,
            background: isOpen ? "rgba(10,22,14,0.88)" : "rgba(22,10,10,0.88)",
            border: `1px solid ${isOpen ? "rgba(77,202,128,0.35)" : "rgba(248,113,113,0.35)"}`,
            color: isOpen ? "#4dca80" : "#f87171",
            borderRadius: 999,
            padding: "4px 9px",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            zIndex: 2,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: isOpen ? "#4dca80" : "#f87171",
              display: "inline-block",
            }} />
            {isOpen ? "OPEN" : "CLOSED"}
          </div>
        )}

        {/* Favorite heart button */}
        <button
          onClick={handleFav}
          disabled={favPending}
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          style={{
            position: "absolute",
            top: 10,
            right: hasHealthGrade ? 70 : 10,
            width: 32, height: 32,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.55)",
            border: `1px solid ${isFav ? "rgba(249,115,22,0.6)" : "rgba(255,255,255,0.15)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            zIndex: 3,
            transition: "all 0.15s",
            fontSize: 15,
            backdropFilter: "blur(4px)",
          }}
        >
          {isFav ? "❤️" : "🤍"}
        </button>

        {/* Health Grade Badge */}
        {hasHealthGrade && colors && (
          <div
            className="health-grade-badge"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: colors.bg,
              border: `2px solid ${colors.border}`,
              color: colors.text,
              width: 48,
              height: 48,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: "bold",
              zIndex: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            {r.healthGrade}
          </div>
        )}
      </motion.div>

      <div className="rc-info">
        <div className="rc-name">{r.name}</div>
        <div className="rc-meta">
          <div className="rc-rating">
            <span>★</span> {r.rating || "4.9"}
          </div>
          <div>•</div>
          <div>{estimateEta(r.distanceMiles)}</div>
          {typeof r.distanceMiles === "number" && (
            <>
              <div>•</div>
              <div>{r.distanceMiles.toFixed(1)} mi</div>
            </>
          )}
          <div>•</div>
          <div>
            {r.city}, {r.state}
          </div>
        </div>

        {/* Compliance / trust badges */}
        {(() => {
          const grade = (r.healthGrade || "").toUpperCase();
          const status = (r.complianceStatus || "").toUpperCase();
          const isVerified =
            (status === "PASS" || status === "APPROVED" || status === "COMPLIANT") &&
            (grade === "A" || grade === "B");
          const isFlagged = status === "FLAGGED";

          if (!isVerified && !isFlagged) return null;

          return (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {isVerified && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "rgba(77,202,128,0.1)",
                  border: "1px solid rgba(77,202,128,0.25)",
                  color: "#4dca80",
                  borderRadius: 20, padding: "3px 9px",
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="#4dca80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Verified Kitchen
                </span>
              )}
              {isFlagged && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "rgba(248,113,113,0.1)",
                  border: "1px solid rgba(248,113,113,0.25)",
                  color: "#f87171",
                  borderRadius: 20, padding: "3px 9px",
                  fontSize: 10, fontWeight: 800,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                }}>
                  ⚠ Health Review
                </span>
              )}
            </div>
          );
        })()}

        <button
          type="button"
          className="mt-2 inline-flex text-[11px] uppercase tracking-[0.14em] font-bold text-[#f97316] hover:text-white transition-colors"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            window.open(
              `https://www.google.com/search?q=${googleQuery}+reviews`,
              "_blank",
              "noopener,noreferrer"
            );
          }}
        >
          View Google Reviews
        </button>
      </div>
      </motion.article>
    </Link>
  );
}
