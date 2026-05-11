"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from "lucide-react";

type Step = {
  id: string;
  label: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
};

export default function OnboardingChecklist({
  hasMenuItems,
  hasStripe,
  hasImage,
  isVisible,
  restaurantId,
}: {
  hasMenuItems: boolean;
  hasStripe: boolean;
  hasImage: boolean;
  isVisible: boolean;
  restaurantId: string;
}) {
  const steps: Step[] = [
    {
      id: "menu",
      label: "Add your first menu item",
      description: "Customers can't order until your menu is live.",
      href: "/merchant/dashboard/menu",
      cta: "Build Menu",
      done: hasMenuItems,
    },
    {
      id: "stripe",
      label: "Connect your payout account",
      description: "Link Stripe to receive payments directly to your bank.",
      href: "/merchant/dashboard",
      cta: "Connect Stripe",
      done: hasStripe,
    },
    {
      id: "image",
      label: "Add a restaurant photo",
      description: "Restaurants with photos get significantly more clicks.",
      href: "/merchant/dashboard/storefront",
      cta: "Upload Photo",
      done: hasImage,
    },
    {
      id: "live",
      label: "Set your restaurant live",
      description: "Flip your visibility on so customers can find you.",
      href: "/merchant/dashboard/storefront",
      cta: "Go Live",
      done: isVisible,
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = completed === total;
  const progress = Math.round((completed / total) * 100);
  const nextStep = steps.find((step) => !step.done) ?? null;

  const [collapsed, setCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || allDone) return null;

  return (
    <div
      style={{
        background: "#111714",
        border: "1px solid #1e2420",
        borderRadius: 14,
        marginBottom: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#f97316",
              }}
            >
              Getting Started
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {completed} of {total} steps complete
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Progress bar */}
          <div
            style={{
              width: 100,
              height: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #f97316, #ffb64a)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>
            {progress}%
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.3)",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
            title="Dismiss"
          >
            <X size={14} />
          </button>
          {collapsed ? <ChevronDown size={16} color="rgba(255,255,255,0.4)" /> : <ChevronUp size={16} color="rgba(255,255,255,0.4)" />}
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {steps.map((step, i) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 18px",
                borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                opacity: step.done ? 0.45 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Icon */}
              {step.done ? (
                <CheckCircle2 size={20} color="#3dd68c" style={{ flexShrink: 0 }} />
              ) : (
                <Circle size={20} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
              )}

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: step.done ? "rgba(255,255,255,0.5)" : "#fff",
                    textDecoration: step.done ? "line-through" : "none",
                    marginBottom: 2,
                  }}
                >
                  {step.label}
                </p>
                {!step.done && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
                    {step.description}
                  </p>
                )}
              </div>

              {/* CTA */}
              {!step.done && (
                <Link
                  href={step.href}
                  style={{
                    flexShrink: 0,
                    background: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.3)",
                    color: "#f97316",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    textDecoration: "none",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    transition: "background 0.15s",
                  }}
                >
                  {step.cta}
                </Link>
              )}
            </div>
          ))}

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "16px 18px 18px",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "14px 14px 12px",
                  background: "#0f1412",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f97316", marginBottom: 8 }}>
                  Recommended next step
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  {nextStep ? nextStep.label : "Launch checklist complete"}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  {nextStep ? nextStep.description : "Your storefront setup looks ready for customers."}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid rgba(249,115,22,0.18)",
                  borderRadius: 12,
                  padding: "14px 14px 12px",
                  background: "rgba(249,115,22,0.06)",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#f97316", marginBottom: 8 }}>
                  Need launch help?
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, marginBottom: 10 }}>
                  We can help with menu setup, Stripe payouts, storefront branding, and getting your restaurant visible.
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href="/contact" style={{
                    background: "rgba(249,115,22,0.14)",
                    border: "1px solid rgba(249,115,22,0.34)",
                    color: "#f97316",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}>
                    Contact Support
                  </Link>
                  <Link href="/merchant/dashboard/storefront" style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "7px 12px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}>
                    Open Storefront
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
