"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, Suspense } from "react";
import Logo from "@/components/Logo";
import { signupWithPassword } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Camera, Home, Mail, MapPin, Moon, Phone, ShieldCheck, UserRound, UtensilsCrossed } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("foodie");
  const [locationPersona, setLocationPersona] = useState("home");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [stateData, formAction, isPending] = useActionState(signupWithPassword, { message: "" });

  const signInWithProvider = async (provider: "google" | "apple") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/restaurants")}`,
        queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
      },
    });
  };

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
              <div className="food-eyebrow">Customer onboarding</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Make Ordering Feel <span className="accent">Easy.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Create your account, save your address, and move from sign-up to checkout in one clear, consistent experience.
                </p>
              </div>
              <ul className="food-auth-list">
                <li>
                  <div className="food-auth-icon">✓</div>
                  <div>
                    <div className="font-extrabold">Delivery profile</div>
                    <div className="text-sm text-white/65">Save drop-off notes, location labels, and preferences.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">★</div>
                  <div>
                    <div className="font-extrabold">Driver clarity</div>
                    <div className="text-sm text-white/65">Add a permanent drop-off photo so drivers know the exact spot.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">→</div>
                  <div>
                    <div className="font-extrabold">Rewards ready</div>
                    <div className="text-sm text-white/65">Start earning TruePoints as soon as you place an order.</div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/login" className="back">← Back to login</Link>
            <p className="food-kicker mb-3">Customer account</p>
            <h2 className="food-heading !text-[36px]">Create Your Profile</h2>
            <p className="lead mt-2">Set up ordering, rewards, and delivery accuracy in two quick steps.</p>

            {refCode && (
              <div className="mt-4 rounded-xl border border-[#f97316]/30 bg-[#f97316]/[0.07] px-4 py-3 text-xs font-bold tracking-[0.08em] text-[#f97316]">
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
              <input type="hidden" name="name" value={(email.split("@")[0] || phone || "TrueServe Customer").trim()} />
              <input type="hidden" name="address" value={[addressLine, city, zip].filter(Boolean).join(", ")} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="password" value={password} />

              {step === 1 && (
                <div className="step active">
                  <div className="sc">
                    <h3><span className="sn">1</span> Core Credentials</h3>
                    <div className="signup-oauth-grid">
                      <button type="button" className="google-auth-btn" onClick={() => signInWithProvider("google")}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
                        </svg>
                        Google
                      </button>
                      <button type="button" className="google-auth-btn" onClick={() => signInWithProvider("apple")}>
                        <UserRound size={18} aria-hidden="true" />
                        Apple
                      </button>
                    </div>
                    <div className="fg input-with-icon">
                      <label>Mobile Number</label>
                      <Phone size={15} aria-hidden="true" />
                      <input type="tel" placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                    <div className="fg input-with-icon">
                      <label>Email Address</label>
                      <Mail size={15} aria-hidden="true" />
                      <input type="email" placeholder="jordan@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="fg">
                      <label>Create Password</label>
                      <input type="password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                  </div>
                  <button type="button" className="place-btn" onClick={() => setStep(2)} disabled={!phone || !email || !password || isPending}>
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="step active">
                  <div className="sc">
                    <h3><span className="sn">2</span> Profile Sandbox</h3>
                    <div className="signup-profile-sandbox">
                      <div className="signup-avatar-slot">
                        <div><UserRound size={28} aria-hidden="true" /></div>
                        <label>
                          <Camera size={14} aria-hidden="true" />
                          Upload Photo
                          <input type="file" accept="image/*" />
                        </label>
                      </div>
                      <div className="signup-avatar-options">
                        {[
                          { id: "foodie", label: "The Foodie", icon: UtensilsCrossed },
                          { id: "night", label: "Night Owl", icon: Moon },
                          { id: "fresh", label: "Fresh Pick", icon: ShieldCheck },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button key={item.id} type="button" className={avatar === item.id ? "is-active" : ""} onClick={() => setAvatar(item.id)}>
                              <Icon size={15} aria-hidden="true" />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="signup-pin-row">
                      {[
                        { id: "home", label: "Home Pin", icon: Home },
                        { id: "work", label: "Work Pin", icon: MapPin },
                        { id: "night", label: "Night Out Pin", icon: Moon },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button key={item.id} type="button" className={locationPersona === item.id ? "is-active" : ""} onClick={() => setLocationPersona(item.id)}>
                            <Icon size={14} aria-hidden="true" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
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
                    <div className="signup-dropoff-upload">
                      <Camera size={18} aria-hidden="true" />
                      <div>
                        <strong>Delivery drop-off photo</strong>
                        <span>Upload a permanent photo of the exact door, gate, porch table, or handoff spot drivers should use.</span>
                      </div>
                      <input type="file" accept="image/*" aria-label="Upload delivery drop-off photo" />
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
