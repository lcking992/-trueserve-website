"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, Download, Radio, Smartphone, Volume2, WifiOff } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

interface DriverAppControlsProps {
  availableCount: number;
  activeOrderStatus?: string | null;
}

export default function DriverAppControls({ availableCount, activeOrderStatus }: DriverAppControlsProps) {
  const [online, setOnline] = useState(true);
  const [browserOnline, setBrowserOnline] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(false);

  useEffect(() => {
    setOnline(window.localStorage.getItem("trueserve-driver-online") !== "false");
    setAlertEnabled(window.localStorage.getItem("trueserve-driver-alerts") === "true");
    setBrowserOnline(navigator.onLine);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);

    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const statusText = useMemo(() => {
    if (!browserOnline) return "Reconnecting";
    if (!online) return "Offline";
    if (activeOrderStatus) return activeOrderStatus.replaceAll("_", " ").toLowerCase();
    return availableCount > 0 ? `${availableCount} offers nearby` : "Ready for offers";
  }, [activeOrderStatus, availableCount, browserOnline, online]);

  function toggleOnline() {
    const next = !online;
    setOnline(next);
    window.localStorage.setItem("trueserve-driver-online", String(next));
  }

  async function runAlertTest() {
    setAlertEnabled(true);
    window.localStorage.setItem("trueserve-driver-alerts", "true");

    if ("vibrate" in navigator) navigator.vibrate([90, 40, 90]);

    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    const gain = ctx.createGain();
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    osc.frequency.setValueAtTime(940, ctx.currentTime + 0.11);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.34);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  }

  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setIsStandalone(true);
  }

  return (
    <section className="driver-app-card" aria-label="Driver app controls">
      <div className="driver-app-status">
        <div className={`driver-live-dot${online && browserOnline ? " on" : ""}`} />
        <div>
          <p className="driver-app-kicker">Driver mode</p>
          <h2>{statusText}</h2>
        </div>
      </div>

      <div className="driver-app-actions">
        <button
          type="button"
          className={`driver-app-toggle${online ? " online" : ""}`}
          onClick={toggleOnline}
          aria-pressed={online}
        >
          {online ? <Radio size={16} aria-hidden="true" /> : <WifiOff size={16} aria-hidden="true" />}
          {online ? "Online" : "Offline"}
        </button>

        <button type="button" className="driver-app-button" onClick={runAlertTest}>
          {alertEnabled ? <CheckCircle2 size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
          Test Alert
        </button>

        {installPrompt && !isStandalone ? (
          <button type="button" className="driver-app-button" onClick={installApp}>
            <Download size={16} aria-hidden="true" />
            Install
          </button>
        ) : (
          <div className="driver-install-note">
            <Smartphone size={15} aria-hidden="true" />
            {isStandalone ? "Installed" : "Add to home screen"}
          </div>
        )}
      </div>

      {availableCount > 0 && online ? (
        <div className="driver-offer-alert">
          <BellRing size={16} aria-hidden="true" />
          New offers can use sound and vibration while this dashboard is open.
        </div>
      ) : null}
    </section>
  );
}
