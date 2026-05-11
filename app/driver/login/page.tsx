"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import DriverLoginForm from "./DriverLoginForm";

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

            <div className="mt-8 space-y-4">
              <div className="login-or !my-0">or continue with</div>
              <div className="grid grid-cols-1 gap-4">
                <button
                  type="button"
                  className="portal-btn-outline portal-btn-outline-block gap-2 disabled:opacity-70"
                  onClick={() => signInWithProvider('google')}
                  disabled={isLoading}
                >
                  <span style={{ fontSize: '16px' }}>G</span> Continue with Google
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
