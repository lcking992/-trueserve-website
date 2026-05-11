"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { submitDriverApplication } from "@/app/driver/actions";
import DriverEarningsCalc from "@/components/DriverEarningsCalc";

export default function DriverSignupPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleType, setVehicleType] = useState("CAR");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [geoMessage, setGeoMessage] = useState("");
  const [stateData, formAction, isPending] = useActionState(submitDriverApplication, { message: "" });

  useEffect(() => {
    if (stateData?.success) {
      setStep(3);
    }
  }, [stateData?.success]);

  const useCurrentLocation = () => {
    setGeoMessage("");
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(String(position.coords.latitude));
        setLng(String(position.coords.longitude));
        setGeoMessage("Location captured.");
      },
      () => {
        setGeoMessage("Could not access location. You can still submit without it.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="food-app-shell">
      <nav className="food-app-nav">
        <Logo size="sm" />
      </nav>

      <main className="food-auth-wrap">
        <div className="food-auth-grid">
          <section className="food-hero-card food-auth-hero">
            <div className="food-auth-image" style={{ backgroundImage: "url('/diverse_drivers.png')" }} />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Driver onboarding</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[56px]">Drive With TrueServe. <span className="accent">Earn More Per Hour.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  The driver application is fully wired for production with document upload, phone verification readiness, and onboarding instructions by email and SMS.
                </p>
              </div>
              <ul className="food-auth-list">
                <li>
                  <div className="food-auth-icon">1</div>
                  <div>
                    <div className="font-extrabold">Higher earning potential</div>
                    <div className="text-sm text-white/65">Competitive payouts with fair routing logic.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">2</div>
                  <div>
                    <div className="font-extrabold">Smart dispatch</div>
                    <div className="text-sm text-white/65">Fewer dead miles and better trip density.</div>
                  </div>
                </li>
                <li>
                  <div className="food-auth-icon">3</div>
                  <div>
                    <div className="font-extrabold">Secure onboarding</div>
                    <div className="text-sm text-white/65">ID, insurance, registration, and agreement compliance included.</div>
                  </div>
                </li>
              </ul>
              <DriverEarningsCalc />
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="su-back">← Back to Home</Link>
            <p className="food-kicker mb-3">Driver account</p>
            <h1 className="food-heading !text-[36px]">Join the Fleet</h1>
            <p className="lead mt-2">Submit your profile and documents to unlock OTP login access.</p>

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
              <div className={`prog-s ${step >= 3 ? 'on' : ''}`}></div>
              <span className="prog-label">{step < 3 ? `Step ${step} of 2` : "Application Sent"}</span>
            </div>

            <form action={formAction}>
              <input type="hidden" name="name" value={fullName} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="phone" value={phone} />
              <input type="hidden" name="dob" value={dob} />
              <input type="hidden" name="address" value={address} />
              <input type="hidden" name="vehicleType" value={vehicleType} />
              <input type="hidden" name="vehicleMake" value={vehicleMake} />
              <input type="hidden" name="vehicleModel" value={vehicleModel} />
              <input type="hidden" name="vehicleColor" value={vehicleColor} />
              <input type="hidden" name="licensePlate" value={licensePlate} />
              <input type="hidden" name="lat" value={lat} />
              <input type="hidden" name="lng" value={lng} />

              {step === 1 && (
                <div id="ds-1" className="step active">
                  <div className="sc">
                    <h3><span className="sn">1</span> Profile and Vehicle</h3>
                    <div className="fg"><label>Full Name</label><input type="text" placeholder="Alex Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="fg"><label>Email</label><input type="email" placeholder="alex@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                      <div className="fg"><label>Phone (US)</label><input type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="fg"><label>Date of Birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required /></div>
                      <div className="fg"><label>Home Address</label><input type="text" placeholder="123 Main St, Charlotte, NC" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
                    </div>
                    <div className="fg">
                      <label>Vehicle Type</label>
                      <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full bg-[#0c0e13] border border-[#1c1f28] rounded-lg p-3">
                        <option value="CAR">Car</option>
                        <option value="SCOOTER">Scooter / Moped</option>
                        <option value="MOTORCYCLE">Motorcycle</option>
                        <option value="BICYCLE">Bicycle</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="fg"><label>Vehicle Make</label><input type="text" placeholder="Toyota" value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} required /></div>
                      <div className="fg"><label>Vehicle Model</label><input type="text" placeholder="Corolla" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} required /></div>
                      <div className="fg"><label>Vehicle Color</label><input type="text" placeholder="Black" value={vehicleColor} onChange={(e) => setVehicleColor(e.target.value)} required /></div>
                    </div>
                    <div className="fg"><label>License Plate</label><input type="text" placeholder="ABC-1234" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} required /></div>
                  </div>
                  <button
                    className="place-btn"
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={isPending || !fullName || !email || !phone || !dob || !address || !vehicleMake || !vehicleModel || !vehicleColor || !licensePlate}
                  >
                    Next: Compliance
                  </button>
                </div>
              )}

              {step === 2 && (
                <div id="ds-2" className="step active">
                  <div className="sc">
                    <h3><span className="sn">2</span> Compliance and Documents</h3>
                    <div className="fg">
                      <label>Driver License Image</label>
                      <input name="idDocument" type="file" accept="image/*,.pdf" required />
                    </div>
                    <div className="fg">
                      <label>Insurance Document</label>
                      <input name="insuranceDocument" type="file" accept="image/*,.pdf" required />
                    </div>
                    <div className="fg">
                      <label>Vehicle Registration</label>
                      <input name="registrationDocument" type="file" accept="image/*,.pdf" required />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 mt-3">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-white/60 mb-2">Optional precision location</div>
                      <button type="button" className="btn btn-ghost" onClick={useCurrentLocation}>Use Current Location</button>
                      {geoMessage && <p className="mt-2 text-xs text-white/70">{geoMessage}</p>}
                    </div>
                    <label className="mt-4 flex items-start gap-3 text-sm text-white/80">
                      <input name="hasSignedAgreement" type="checkbox" value="true" required className="mt-1" />
                      I confirm all provided information is accurate and I agree to the TrueServe driver terms.
                    </label>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="place-btn" type="submit" disabled={isPending}>{isPending ? "Submitting..." : "Submit Application"}</button>
                    <button className="btn btn-ghost w-full" type="button" onClick={() => setStep(1)} disabled={isPending}>← Back</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div id="ds-3" className="step active">
                  <div className="done-card">
                    <div className="done-ico">🚚</div>
                    <h3>Application Received</h3>
                    <p>We sent your next-step instructions by email and SMS. Once approved, you can log in with phone OTP at the driver portal.</p>
                    <Link href="/driver/login?tour=1" className="place-btn inline-flex items-center justify-center">Go to Driver Login</Link>
                  </div>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
