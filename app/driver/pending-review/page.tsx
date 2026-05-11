import Link from "next/link";
import Logo from "@/components/Logo";

export default function DriverPendingReviewPage() {
  const reviewSteps = [
    {
      label: "Application received",
      detail: "Your basic profile, phone, and delivery details are already on file.",
      state: "done",
    },
    {
      label: "Document review",
      detail: "We’re checking your license, insurance, and registration right now.",
      state: "active",
    },
    {
      label: "Payout and compliance check",
      detail: "We make sure your payout setup and driver readiness details are complete before activation.",
      state: "upcoming",
    },
    {
      label: "Dashboard unlock",
      detail: "Once approved, you can accept orders and start delivering immediately.",
      state: "upcoming",
    },
  ] as const;

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
              <div className="food-eyebrow">Driver application status</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[52px] md:!text-[56px]">
                  Application <span className="accent">Under Review.</span>
                </h1>
                <p className="food-subtitle !max-w-[520px]">
                  Your driver login is active, but your delivery access will unlock only after our team finishes reviewing your documents and vehicle details.
                </p>
              </div>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <p className="food-kicker mb-3">Pending approval</p>
            <h2 className="food-heading !text-[32px] md:!text-[36px]">We’ve Got Your Application</h2>
            <p className="lead mt-2 max-w-[420px]">
              Thanks for signing in. Your profile is in manual review right now, so the driver dashboard will open as soon as approval is complete.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/75">
              <p>What happens next:</p>
              <ul className="list-disc space-y-2 pl-5 text-white/65">
                <li>We verify your license, insurance, and registration.</li>
                <li>We send an email and text message as soon as you are approved.</li>
                <li>You can return to the driver login any time to check status.</li>
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f97316]">Approval tracker</p>
                  <h3 className="mt-2 text-xl font-black uppercase tracking-[0.05em] text-white">Where your application stands</h3>
                </div>
                <div className="rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#f97316]">
                  2 of 4
                </div>
              </div>

              <div className="space-y-3">
                {reviewSteps.map((step, index) => (
                  <div key={step.label} className="flex items-start gap-3 rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                      step.state === "done"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : step.state === "active"
                          ? "bg-[#f97316]/15 text-[#f97316]"
                          : "bg-white/8 text-white/45"
                    }`}>
                      {step.state === "done" ? "✓" : index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <p className="mt-1 text-xs leading-6 text-white/55">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/driver/login" className="place-btn inline-flex items-center justify-center">
                Back to Driver Login
              </Link>
              <Link href="/driver/recover" className="btn btn-ghost w-full text-center">
                Changed Numbers? Update Login Access
              </Link>
              <Link href="/contact" className="btn btn-ghost w-full text-center">
                Need Help? Contact Support
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
