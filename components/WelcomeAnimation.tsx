"use client";

import { useEffect, useState } from "react";
import { CarFront, UtensilsCrossed } from "lucide-react";

type Role = "driver" | "merchant";

interface WelcomeAnimationProps {
  name: string;
  role: Role;
  stats?: { label: string; value: string }[];
  /** If true, always shows (for demo/preview). Default: session-gated */
  forceShow?: boolean;
}

const GREETINGS = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const ROLE_CONFIG = {
  driver: {
    icon: CarFront,
    color: "#3dd68c",
    tagline: "You're on the clock. Let's make it count.",
    cta: "Start Driving",
  },
  merchant: {
    icon: UtensilsCrossed,
    color: "#f97316",
    tagline: "Your kitchen is live. Let's serve today.",
    cta: "Enter Dashboard",
  },
};

export default function WelcomeAnimation({
  name,
  role,
  stats = [],
  forceShow = false,
}: WelcomeAnimationProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const storageKey = `welcome_shown_${role}`;
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;

  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      return;
    }
    const already = sessionStorage.getItem(storageKey);
    if (!already) {
      setVisible(true);
      sessionStorage.setItem(storageKey, "1");
    }
  }, [forceShow, storageKey]);

  // Auto-dismiss after 3.5 s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => dismiss(), 3500);
    return () => clearTimeout(t);
  }, [visible]);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        cursor: "pointer",
        animation: leaving
          ? "welcome-fade-out 0.4s ease forwards"
          : "welcome-fade-in 0.35s ease forwards",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, #141a18 0%, #0c0f0d 100%)",
          border: `1px solid ${cfg.color}30`,
          borderRadius: 28,
          padding: "40px 36px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          boxShadow: `0 0 60px ${cfg.color}22, 0 24px 48px rgba(0,0,0,0.6)`,
          animation: leaving
            ? "welcome-card-out 0.4s ease forwards"
            : "welcome-card-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* Pulse ring + icon */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: `${cfg.color}14`,
              border: `1.5px solid ${cfg.color}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              color: cfg.color,
              animation: "welcome-pulse 2s ease-in-out infinite",
            }}
          >
            <Icon size={34} strokeWidth={1.8} aria-hidden="true" />
          </div>
          {/* Online dot */}
          <span
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: cfg.color,
              border: "2px solid #0c0f0d",
              boxShadow: `0 0 8px ${cfg.color}`,
              animation: "welcome-dot-blink 1.2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Greeting */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: cfg.color,
            marginBottom: 8,
          }}
        >
          {GREETINGS()}
        </p>
        <h2
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 10,
          }}
        >
          {name}
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
            marginBottom: stats.length ? 24 : 28,
          }}
        >
          {cfg.tagline}
        </p>

        {/* Stats row */}
        {stats.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
              gap: 10,
              marginBottom: 28,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: "12px 8px",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: cfg.color,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={dismiss}
          style={{
            width: "100%",
            padding: "14px 0",
            background: cfg.color,
            color: role === "driver" ? "#0c0f0d" : "#0c0f0d",
            borderRadius: 14,
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
            boxShadow: `0 4px 20px ${cfg.color}40`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          {cfg.cta}
        </button>

        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>
          Tap anywhere to dismiss
        </p>
      </div>

      <style>{`
        @keyframes welcome-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes welcome-fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes welcome-card-in  { from { opacity:0; transform:scale(0.88) translateY(24px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes welcome-card-out { from { opacity:1; transform:scale(1) translateY(0) } to { opacity:0; transform:scale(0.92) translateY(16px) } }
        @keyframes welcome-pulse    { 0%,100% { box-shadow:0 0 0 0 rgba(249,115,22,0.18) } 50% { box-shadow:0 0 0 14px rgba(249,115,22,0) } }
        @keyframes welcome-dot-blink { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>
    </div>
  );
}
