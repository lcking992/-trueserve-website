"use client";

import React, { useActionState, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";
import { submitMerchantInquiry } from "@/app/merchant/actions";

export default function MerchantSignupPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zip, setZip] = useState("");
  const [plan, setPlan] = useState("Flex Options");
  const [posSystem, setPosSystem] = useState("Toast");
  const [posClientId, setPosClientId] = useState("");
  const [posClientSecret, setPosClientSecret] = useState("");
  const [stateData, formAction, isPending] = useActionState(submitMerchantInquiry, { message: "" });

  useEffect(() => {
    if (stateData?.success) {
      setStep(3);
    }
  }, [stateData?.success]);

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div className="food-auth-image" style={{ backgroundImage: "url('/merchant_hero.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">🤝 Founding Partner Program</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Lock In Your Rate. <span className="accent">Keep Every Dollar.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Join as a Founding Partner — first 30 days free, your rate locked forever, and zero commission on every order you take.
                </p>
              </div>
              <ul className="food-auth-list">
                <li>
                  <div className="food-auth-icon">1</div>
                  <div>
                    <div className="font-extrabold">30 days free</div>
                    <div className="text-sm text-white/65">No charge for your first month. Start taking orders risk-free.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">2</div>
                  <div>
                    <div className="font-extrabold">Rate locked forever</div>
                    <div className="text-sm text-white/65">Your founding rate never increases — even as TrueServe grows.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">3</div>
                  <div>
                    <div className="font-extrabold">Zero commission</div>
                    <div className="text-sm text-white/65">Keep 100% of every order. Flat monthly fee, nothing more.</div>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="su-back">← Back to Home</Link>
            <p className="food-kicker mb-3">🤝 Founding Partner Application</p>
            <h1 className="food-heading !text-[36px]">Apply as a Founding Partner</h1>
            <p className="lead mt-2">First 30 days free · Rate locked forever · Zero commission.</p>

            {stateData?.message && (
              <div className={`mt-4 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] ${
                stateData.error
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-[#3dd68c]/30 bg-[#3dd68c]/10 text-[#8ce7b8]"
              }`}>
                {stateData.message}
              </div>
            )}
            
            <div className="food-auth-gallery">
              <div className="food-auth-thumb"><img src="/merchant_hero.png" alt="Restaurant kitchen operations" /></div>
              <div className="food-auth-thumb"><img src="/merchant_section.png" alt="Restaurant owner working" /></div>
              <div className="food-auth-thumb"><img src="/merchant_login_bg_restaurant.png" alt="Restaurant storefront and dining area" /></div>
            </div>
            
            <div className="prog mt-6">
              <div className={`prog-s ${step >= 1 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 2 ? 'on' : ''}`}></div>
              <div className={`prog-s ${step >= 3 ? 'on' : ''}`}></div>
              <span className="prog-label">{step < 4 ? `Step ${step} of 3` : 'Complete'}</span>
            </div>

            <form action={formAction}>
              <input type="hidden" name="restaurantName" value={restaurantName} />
              <input type="hidden" name="contactName" value={contactName} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value={password} />
              <input type="hidden" name="address" value={address} />
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="city" value={city} />
              <input type="hidden" name="state" value={stateName} />
              <input type="hidden" name="zip" value={zip} />
              <input type="hidden" name="plan" value={plan} />
              <input type="hidden" name="posSystem" value={posSystem} />
              <input type="hidden" name="posClientId" value={posClientId} />
              <input type="hidden" name="posClientSecret" value={posClientSecret} />

              {step === 1 && (
                <div id="ms-1" className="step active">
                  <div className="sc">
                    <h3><span className="sn">1</span> Restaurant Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="fg"><label>Restaurant Name</label><input type="text" placeholder="Your restaurant name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} required /></div>
                      <div className="fg"><label>Cuisine Type</label><input type="text" placeholder="Cuisine category"/></div>
                    </div>
                    <div className="fg"><label>Street Address</label><input type="text" placeholder="123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="fg"><label>Phone</label><input type="text" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                      <div className="fg"><label>Owner Name</label><input type="text" placeholder="Jane Doe" value={contactName} onChange={(e) => setContactName(e.target.value)} required /></div>
                    </div>
                    <div className="fg"><label>Email Address</label><input type="email" placeholder="jane@restaurant.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div className="fg"><label>Password</label><input type="password" placeholder="At least 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  </div>
                  <button
                    type="button"
                    className="place-btn"
                    onClick={() => setStep(2)}
                    disabled={isPending || !restaurantName || !contactName || !email || !password || !address || !phone}
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div id="ms-2" className="step active">
                  <div className="sc">
                    <h3><span className="sn">2</span> Business Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="fg"><label>City</label><input type="text" placeholder="Charlotte" value={city} onChange={(e) => setCity(e.target.value)} required /></div>
                      <div className="fg"><label>State</label><input type="text" placeholder="NC" value={stateName} onChange={(e) => setStateName(e.target.value)} required /></div>
                      <div className="fg"><label>ZIP</label><input type="text" placeholder="28202" value={zip} onChange={(e) => setZip(e.target.value)} required /></div>
                    </div>
                    <div className="fg">
                      <label>Plan</label>
                      <select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full bg-[#0c0e13] border border-[#1c1f28] rounded-lg p-3">
                        <option value="Flex Options">Flex Options</option>
                        <option value="Pro Subscription">Pro Subscription</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label>POS System</label>
                      <select value={posSystem} onChange={(e) => setPosSystem(e.target.value)} className="w-full bg-[#0c0e13] border border-[#1c1f28] rounded-lg p-3">
                        <option value="Toast">Toast</option>
                        <option value="Square">Square</option>
                        <option value="Clover">Clover</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="fg"><label>POS Client ID (Optional)</label><input type="text" placeholder="Client ID" value={posClientId} onChange={(e) => setPosClientId(e.target.value)} /></div>
                      <div className="fg"><label>POS Client Secret (Optional)</label><input type="password" placeholder="Client secret" value={posClientSecret} onChange={(e) => setPosClientSecret(e.target.value)} /></div>
                    </div>
                    <div className="fg">
                      <label>Go High Level (GHL) Iframe URL (Optional)</label>
                      <input
                        id="m-ghl-url"
                        type="text"
                        placeholder="https://api.leadconnectorhq.com/widget/booking/..."
                      />
                      <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '4px' }}>
                        Pasting your GHL booking/ordering iframe URL here will enable direct widget ordering.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="place-btn" type="submit" disabled={isPending || !city || !stateName || !zip}>
                      {isPending ? "Submitting..." : "Submit Application"}
                    </button>
                    <button type="button" className="btn btn-ghost w-full" onClick={() => setStep(1)} disabled={isPending}>← Back</button>
                  </div>
                </div>
              )}
            </form>

            {step === 3 && (
              <div id="ms-3" className="step active">
                <div className="done-card">
                  <div className="done-ico">🎉</div>
                  <h3>You're in! Application Submitted.</h3>
                  <p>We'll review your application within 24 hours and send setup instructions straight to your inbox.</p>
                  <button className="place-btn" onClick={() => router.push('/merchant/dashboard?tour=1')}>Go to Portal</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
