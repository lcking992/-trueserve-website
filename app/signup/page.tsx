"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, Suspense } from "react";
import Logo from "@/components/Logo";
import { signupWithPassword } from "@/app/auth/actions";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [stateData, formAction, isPending] = useActionState(signupWithPassword, { message: "" });

  useEffect(() => {
    if (stateData?.success) {
      router.push("/restaurants");
      router.refresh();
    }
  }, [stateData?.success, router]);

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div
              className="food-auth-image"
              style={{ backgroundImage: "url('/hero_food_delivery.png')" }}
            />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Now live · Charlotte &amp; Rock Hill</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Order from kitchens <span className="accent">you can trust.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Every restaurant on TrueServe is screened before your first order. Create your account and start ordering from health-verified local restaurants near you.
                </p>
              </div>
              <ul className="food-auth-list">
                <li>
                  <div className="food-auth-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div className="font-extrabold">Health-screened restaurants</div>
                    <div className="text-sm text-white/65">Every partner kitchen is reviewed against NC and SC public health records.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div className="font-extrabold">Live order tracking</div>
                    <div className="text-sm text-white/65">Watch your driver in real time from pickup to your front door.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <div className="font-extrabold">Saved addresses &amp; reorders</div>
                    <div className="text-sm text-white/65">Skip re-entering details every time — your preferences stay ready.</div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/login" className="back">← Back to login</Link>
            <p className="food-kicker mb-3">Customer account</p>
            <h2 className="food-heading !text-[36px]">Sign Up</h2>
            <p className="lead mt-2">Create your account and start ordering from nearby restaurants.</p>

            {refCode && (
              <div className="mt-4 rounded-xl border border-[#f97316]/30 bg-[#f97316]/[0.07] px-4 py-3 text-xs font-bold tracking-[0.08em] text-[#f97316] flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Referral applied — your first delivery fee is on us.
              </div>
            )}

            {stateData?.message && (
              <div className={`mt-4 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] ${
                stateData.error
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-[#3dd68c]/30 bg-[#3dd68c]/10 text-[#8ce7b8]"
              }`}>
                {stateData.message}
              </div>
            )}

            <div className="prog mt-6">
              <div className={`prog-s ${step >= 1 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 2 ? 'on' : ''}`}></div>
              <span className="prog-label">{step === 1 ? "Step 1 of 2" : "Step 2 of 2"}</span>
            </div>

            <form action={formAction}>
              <input type="hidden" name="role" value="CUSTOMER" />
              <input type="hidden" name="plan" value="Basic" />
              {refCode && <input type="hidden" name="referredBy" value={refCode} />}
              <input type="hidden" name="name" value={`${firstName} ${lastName}`.trim()} />
              <input type="hidden" name="address" value={[addressLine, city, zip].filter(Boolean).join(", ")} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="password" value={password} />

              {step === 1 && (
                <div className="step active">
                  <div className="sc">
                    <h3><span className="sn">1</span> Account Basics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="fg">
                        <label>First Name</label>
                        <input type="text" placeholder="Jordan" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                      </div>
                      <div className="fg">
                        <label>Last Name</label>
                        <input type="text" placeholder="Lee" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="fg">
                      <label>Email Address</label>
                      <input type="email" placeholder="jordan@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="fg"><label>Phone Number</label><input type="tel" placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                    <div className="fg">
                      <label>Create Password</label>
                      <input type="password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <button type="button" className="place-btn" onClick={() => setStep(2)} disabled={!firstName || !lastName || !email || !password || isPending}>
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="step active">
                  <div className="sc">
                    <h3><span className="sn">2</span> Delivery Setup</h3>
                    <div className="fg">
                      <label>Home Address</label>
                      <input type="text" placeholder="123 Main St, Apt 4B" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="fg">
                        <label>City</label>
                        <input type="text" placeholder="Charlotte" value={city} onChange={(e) => setCity(e.target.value)} required />
                      </div>
                      <div className="fg">
                        <label>ZIP Code</label>
                        <input type="text" placeholder="28202" value={zip} onChange={(e) => setZip(e.target.value)} required />
                      </div>
                    </div>
                    <div className="fg">
                      <label>Delivery Notes</label>
                      <textarea placeholder="Gate code, building entry, or leave at door." rows={3} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="place-btn" type="submit" disabled={isPending}>
                      {isPending ? "Creating Account..." : "Create Account"}
                    </button>
                    <button type="button" className="btn btn-ghost w-full" onClick={() => setStep(1)} disabled={isPending}>← Back</button>
                  </div>
                </div>
              )}
            </form>

            <div className="food-auth-note">
              Already have an account? <Link href="/login" className="text-[#f97316] font-bold">Sign in</Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
