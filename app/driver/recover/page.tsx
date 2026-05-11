"use client";

import Link from "next/link";
import { useActionState } from "react";
import Logo from "@/components/Logo";
import { requestDriverPhoneUpdate, type DriverRecoveryState } from "@/app/driver/actions";

const initialState: DriverRecoveryState = { message: "" };

export default function DriverRecoverPage() {
  const [state, formAction, isPending] = useActionState(requestDriverPhoneUpdate, initialState);

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
              <div className="food-eyebrow">Driver recovery</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[52px] md:!text-[56px]">
                  Update Your <span className="accent">Driver Login Number.</span>
                </h1>
                <p className="food-subtitle !max-w-[520px]">
                  If your phone number changed, send us the old and new number here and we’ll route the request to ops for verification.
                </p>
              </div>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/driver/login" className="portal-btn-outline portal-btn-outline-block !w-auto !px-4 !py-2">← Back to Driver Login</Link>
            <p className="food-kicker mb-3">Account recovery</p>
            <h1 className="food-heading !text-[32px] md:!text-[36px]">Request Phone Update</h1>
            <p className="lead mt-2 max-w-[380px]">We’ll notify the operations team so they can verify your identity and update your driver login.</p>

            {state?.message && (
              <div className={`mt-4 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] ${
                state.error
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-[#3dd68c]/30 bg-[#3dd68c]/10 text-[#8ce7b8]"
              }`}>
                {state.message}
              </div>
            )}

            <form action={formAction} className="mt-6 space-y-4">
              <div className="fg">
                <label>Full Name</label>
                <input name="name" type="text" placeholder="Alex Smith" required />
              </div>
              <div className="fg">
                <label>Email Address</label>
                <input name="email" type="email" placeholder="alex@example.com" required />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="fg">
                  <label>Current Phone Number</label>
                  <input name="currentPhone" type="tel" placeholder="+1 (555) 000-0000" required />
                </div>
                <div className="fg">
                  <label>New Phone Number</label>
                  <input name="newPhone" type="tel" placeholder="+1 (555) 111-2222" required />
                </div>
              </div>
              <div className="fg">
                <label>Notes (Optional)</label>
                <textarea
                  name="details"
                  rows={4}
                  placeholder="Anything helpful for the ops team, like when the number changed or the best way to reach you."
                />
              </div>

              <button className="place-btn" type="submit" disabled={isPending}>
                {isPending ? "Submitting..." : "Send Recovery Request"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
