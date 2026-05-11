"use client";

import { useEffect, useMemo, useState } from "react";

type PortalType = "MERCHANT" | "DRIVER";

type PortalTourStep = {
  title: string;
  body: string;
  selector?: string;
};

const TOUR_OPEN_EVENT = "ts:portal-tour:open";

function safeQuerySelector(selector?: string): HTMLElement | null {
  if (!selector) return null;
  try {
    return document.querySelector(selector) as HTMLElement | null;
  } catch {
    return null;
  }
}

function computeSpotlightRect(target: HTMLElement): DOMRect {
  const rect = target.getBoundingClientRect();
  const padding = 10;
  const width = Math.max(0, rect.width + padding * 2);
  const height = Math.max(0, rect.height + padding * 2);
  const left = rect.left - padding;
  const top = rect.top - padding;
  return new DOMRect(left, top, width, height);
}

export default function PortalTour({ portal }: { portal: PortalType }) {
  const storageKey = useMemo(() => `ts.portalTour.${portal}.v1`, [portal]);
  const forceTour = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("tour") === "1";
    } catch {
      return false;
    }
  }, []);

  const steps: PortalTourStep[] = useMemo(() => {
    if (portal === "MERCHANT") {
      return [
        {
          title: "Dashboard",
          body: "Your command center — live orders, today’s revenue, and active driver statuses all in one view.",
          selector: "[data-tour='merchant-nav-dashboard']",
        },
        {
          title: "Compliance",
          body: "Keep your health grade, business license, and documents current so your storefront stays live.",
          selector: "[data-tour='merchant-nav-compliance']",
        },
        {
          title: "Integrations",
          body: "Connect your POS (Toast, Square, etc.) to sync your menu and receive orders directly in your kitchen.",
          selector: "[data-tour='merchant-nav-integrations']",
        },
        {
          title: "Storefront",
          body: "Control your banner, description, hours, and the embeddable widget for your own website.",
          selector: "[data-tour='merchant-nav-storefront']",
        },
        {
          title: "Franchise",
          body: "Manage multiple locations from one account — per-location hours, menus, and consolidated revenue.",
          selector: "[data-tour='merchant-nav-franchise']",
        },
      ];
    }

    return [
      {
        title: "Dashboard",
        body: "Your home base — available trips, today’s earnings, active delivery, and online/offline toggle.",
        selector: "[data-tour='driver-nav-dashboard']",
      },
      {
        title: "Settlements",
        body: "Weekly pay breakdown: every trip, tip, and deduction. See exactly when your next deposit lands.",
        selector: "[data-tour='driver-nav-earnings']",
      },
      {
        title: "Reputation",
        body: "Track your star rating, acceptance rate, and customer feedback. Stay above 4.5 for priority orders.",
        selector: "[data-tour='driver-nav-ratings']",
      },
      {
        title: "Compliance",
        body: "Manage your license, insurance, and background check status. TrueServe flags anything expiring.",
        selector: "[data-tour='driver-nav-compliance']",
      },
      {
        title: "Profile",
        body: "Update your personal info, vehicle details, and bank account for payouts.",
        selector: "[data-tour='driver-nav-account']",
      },
      {
        title: "Help",
        body: "Need help mid-route? Tap Support for live chat, call-back, or to report an order issue — 24/7.",
        selector: "[data-tour='support-fab']",
      },
    ];
  }, [portal]);

  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const currentStep = steps[Math.min(stepIndex, steps.length - 1)];

  const markDoneAndClose = () => {
    try {
      localStorage.setItem(storageKey, "done");
    } catch { }
    setIsOpen(false);
  };

  const openFromEvent = () => {
    setStepIndex(0);
    setIsOpen(true);
  };

  useEffect(() => {
    if (forceTour) {
      const t = window.setTimeout(() => setIsOpen(true), 300);
      return () => window.clearTimeout(t);
    }

    return;
  }, [forceTour, storageKey]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ portal?: PortalType }>).detail;
      if (!detail?.portal || detail.portal === portal) {
        openFromEvent();
      }
    };

    window.addEventListener(TOUR_OPEN_EVENT, handler as EventListener);
    return () => window.removeEventListener(TOUR_OPEN_EVENT, handler as EventListener);
  }, [portal]);

  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const target = safeQuerySelector(currentStep?.selector);
      if (!target) {
        setSpotlightRect(null);
        return;
      }

      try {
        const isMobile = window.innerWidth < 640;
        target.scrollIntoView({
          behavior: isMobile ? "auto" : "smooth",
          block: isMobile ? "nearest" : "center",
          inline: "center",
        });
      } catch { }

      setSpotlightRect(computeSpotlightRect(target));
    };

    update();

    const onResize = () => update();
    const onScroll = () => update();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [currentStep?.selector, isOpen]);

  if (!isOpen) return null;

  const isLast = stepIndex >= steps.length - 1;
  const stepNumber = Math.min(stepIndex + 1, steps.length);
  const viewportWidth = typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight = typeof window === "undefined" ? 768 : window.innerHeight;
  const isMobileViewport = viewportWidth < 640;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[10001]"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes tsTourFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes tsTourPulse { 0%,100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.02); opacity: 1; } }
          `,
        }}
      />

      <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.5px]" onClick={markDoneAndClose} />

      {spotlightRect && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: Math.max(isMobileViewport ? 6 : 8, spotlightRect.left),
            top: Math.max(isMobileViewport ? 6 : 8, spotlightRect.top),
            width: Math.min(viewportWidth - (isMobileViewport ? 12 : 16), spotlightRect.width),
            height: Math.min(viewportHeight - (isMobileViewport ? 12 : 16), spotlightRect.height),
            borderRadius: isMobileViewport ? 12 : 14,
            boxShadow: `0 0 0 9999px rgba(0,0,0,${isMobileViewport ? 0.28 : 0.34})`,
            border: "1px solid rgba(249,115,22,.65)",
            background: "rgba(249,115,22,.06)",
            animation: "tsTourPulse 1.9s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className="fixed left-1/2 -translate-x-1/2 border border-white/10 bg-[#0a0a0b]/95 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        style={{
          animation: "tsTourFadeIn .22s ease-out",
          bottom: isMobileViewport ? 0 : "20px",
          width: isMobileViewport ? "100%" : "min(560px, calc(100% - 24px))",
          borderRadius: isMobileViewport ? "18px 18px 0 0" : "22px",
          padding: isMobileViewport ? "14px 16px max(14px, env(safe-area-inset-bottom))" : "20px",
        }}
      >
        {/* Progress dots — top of sheet on mobile */}
        <div className="flex items-center gap-1.5 mb-3">
          {steps.map((_, index) => (
            <span
              key={`${portal}-dot-${index}`}
              className={`h-1 rounded-full transition-all ${index === stepIndex ? "w-5 bg-[#f97316]" : "w-2 bg-white/20"}`}
            />
          ))}
          <span className="ml-auto text-[10px] font-black uppercase tracking-[0.14em] text-white/40">
            {stepNumber} / {steps.length}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`font-black tracking-tight text-white ${isMobileViewport ? "text-[17px]" : "text-[22px]"}`}>
              {currentStep?.title}
            </div>
            <div className={`mt-1 font-semibold leading-snug text-white/70 ${isMobileViewport ? "text-[12px]" : "text-[14px]"}`}>
              {currentStep?.body}
            </div>
            {!isMobileViewport && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold leading-relaxed text-white/70">
                Direction: follow the gold highlight, then tap <span className="text-[#f97316] font-black">Next</span>.
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={markDoneAndClose}
            className="ts-pill-btn ts-pill-btn-sm shrink-0"
          >
            Skip
          </button>
        </div>

        <div className={`flex items-center gap-2 ${isMobileViewport ? "mt-3" : "mt-4"}`}>
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="ts-pill-btn ts-pill-btn-sm disabled:opacity-30"
            style={{ minWidth: isMobileViewport ? 56 : 64 }}
          >
            Back
          </button>
          <div className="flex flex-1 justify-end gap-2">
            {!isMobileViewport && (
              <button type="button" onClick={markDoneAndClose} className="ts-pill-btn ts-pill-btn-sm">
                Dismiss
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? markDoneAndClose() : setStepIndex((i) => Math.min(steps.length - 1, i + 1)))}
              className="ts-pill-btn ts-pill-btn-sm"
              style={isMobileViewport ? { flex: 1 } : undefined}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
