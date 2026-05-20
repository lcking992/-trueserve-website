"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import DriverLoginForm from "./DriverLoginForm";
import { DollarSign, WalletCards } from "lucide-react";

export default function DriverLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    setErrorText("");
    const wantsTour =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("tour") === "1";
    const nextPath = wantsTour ? "/driver/dashboard?tour=1" : "/driver/dashboard";
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            queryParams: {
                prompt: 'select_account',
            }
        }
    });

    if (error) {
        setErrorText(`Failed to connect with ${provider}: ${error.message}`);
        setIsLoading(false);
    }
  };

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div className="food-auth-image" style={{ backgroundImage: "url('/driver_login_bg_car.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Driver access</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[52px] md:!text-[56px]">Driver <span className="accent">Portal Login.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Access your delivery workspace, claim nearby routes, and manage active orders using the same linear design system as signup and customer flows.
                </p>
              </div>
              <ul className="food-auth-list">
                <li><div className="food-auth-icon">1</div><div><div className="font-extrabold">Active route board</div><div className="text-sm text-white/65">See mission-ready orders in real time.</div></div></li>
                <li><div className="food-auth-icon">2</div><div><div className="font-extrabold">Live navigation</div><div className="text-sm text-white/65">Use maps and heat zones for smarter driving.</div></div></li>
                <li><div className="food-auth-icon">3</div><div><div className="font-extrabold">Fast payout tools</div><div className="text-sm text-white/65">Track earnings and manage Stripe setup.</div></div></li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="portal-btn-outline portal-btn-outline-block !w-auto !px-4 !py-2">← Back to Home</Link>
            <div className="driver-pay-ticker">
              <span className="ts-system-pulse" aria-hidden="true" />
              <div>
                <strong>$20.00/Hr Daily Pay Active</strong>
                <span>Shift earnings sync after completion.</span>
              </div>
              <DollarSign size={18} aria-hidden="true" />
            </div>
            <p className="food-kicker mb-3">Driver account</p>
            <h1 className="food-heading !text-[32px] md:!text-[36px]">Sign In</h1>
            <p className="lead mt-2 max-w-[360px]">Secure mobile access to your driver dashboard.</p>

            {errorText && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] text-red-300">
                {errorText}
              </div>
            )}

            <div className="mt-6">
              <DriverLoginForm />
            </div>

            <div className="driver-wallet-preview">
              <WalletCards size={18} aria-hidden="true" />
              <div>
                <strong>Driver wallet sync</strong>
                <span>Sign in to view route pay, shift totals, and payout status. Average payout timeframe: under 15 minutes post-shift.</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="login-or !my-0">or continue with</div>
              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  className="google-auth-btn disabled:opacity-70"
                  onClick={() => signInWithProvider('google')}
                  disabled={isLoading}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <Link
                href="/driver/tutorial-preview"
                className="ts-pill-btn ts-pill-btn-block"
              >
                View Animated Tutorial
              </Link>
            </div>

            <div className="login-foot mt-5">
              Changed numbers? <Link href="/driver/recover">Request a phone update</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
