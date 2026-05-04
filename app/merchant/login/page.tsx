"use client";

import React, { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { loginWithPassword, type AuthState } from "@/app/auth/actions";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [errorText, setErrorText] = useState("");
  const [accountMismatch, setAccountMismatch] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (_prevState: AuthState, formData: FormData) => loginWithPassword(formData),
    { message: "" }
  );

  useEffect(() => {
    if (!state?.message) return;

    if (state.success && state.role === "MERCHANT") {
      const forceTour =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("tour") === "1";
      router.push(forceTour ? "/merchant/dashboard?tour=1" : "/merchant/dashboard");
      router.refresh();
      return;
    }

    if (state.success && state.role && state.role !== "MERCHANT") {
      setAccountMismatch(true);
      setErrorText("This account is not a merchant account.");
      return;
    }

    if (state.error) {
      setAccountMismatch(false);
      setErrorText(state.message);
    }
  }, [state, router]);

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div className="food-auth-image" style={{ backgroundImage: "url('/merchant_login_bg_restaurant.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Merchant access</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[52px] md:!text-[56px]">Merchant <span className="accent">Portal Login.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Sign in to manage POS integrations, orders, restaurant settings, and operations in the same consistent interface used across the platform.
                </p>
              </div>
              <ul className="food-auth-list">
                <li><div className="food-auth-icon">1</div><div><div className="font-extrabold">Operational dashboard</div><div className="text-sm text-white/65">Monitor order flow, prep, and store status.</div></div></li>
                <li><div className="food-auth-icon">2</div><div><div className="font-extrabold">Integration control</div><div className="text-sm text-white/65">Manage Stripe, POS, and embedded ordering tools.</div></div></li>
                <li><div className="food-auth-icon">3</div><div><div className="font-extrabold">Support access</div><div className="text-sm text-white/65">Reach TrueServe AI support from inside the portal.</div></div></li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="portal-btn-outline portal-btn-outline-block !w-auto !px-4 !py-2">← Back to Home</Link>
            <p className="food-kicker mb-3">Restaurant account</p>
            <h1 className="food-heading !text-[32px] md:!text-[36px]">Sign In</h1>
            <p className="lead mt-2 max-w-[360px]">Secure merchant access for your partnership portal.</p>

            {errorText && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] text-red-300">
                {errorText}
                {accountMismatch && (
                  <div className="mt-2 text-[11px] normal-case tracking-normal text-red-200">
                    Use the shared <Link href="/login" className="font-bold underline">sign-in page</Link> for customer or driver access, or <Link href="/merchant/signup" className="font-bold underline">apply for partnership</Link>.
                  </div>
                )}
              </div>
            )}

            <form className="mt-6" action={formAction}>
              <div className="fg">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="partner@yourplace.com"
                  defaultValue=""
                  onChange={() => {
                    setErrorText("");
                    setAccountMismatch(false);
                  }}
                  required
                />
              </div>
              <div className="fg">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  defaultValue=""
                  onChange={() => {
                    setErrorText("");
                    setAccountMismatch(false);
                  }}
                  required
                />
              </div>
              <div style={{ textAlign: 'right', margin: '8px 0 16px' }}>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--gold)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <button className="ts-pill-btn ts-pill-btn-block mt-4" disabled={isPending}>
                {isPending ? "Authorizing..." : "Establish Session"}
              </button>
            </form>

            <Link
              href="/merchant/tutorial-preview"
              className="portal-btn-outline portal-btn-outline-block mt-3"
            >
              View Animated Tutorial
            </Link>

            <div className="login-foot">New to network? <Link href="/merchant/signup">Apply for partnership</Link></div>
          </section>
        </div>
      </main>
    </div>
  );
}
