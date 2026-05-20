import Link from "next/link";
import { Banknote, Clock3, ShieldCheck, TimerReset } from "lucide-react";
import { clockInDriverShift, clockOutDriverShift } from "../actions";

type DriverShiftPayoutCardProps = {
    activeShift: {
        id: string;
        startedAt: string;
        hourlyRate: number;
    } | null;
    todayMinutes: number;
    todayShiftPay: number;
    stripeConnected: boolean;
    stripeReady: boolean;
    balance: number;
};

function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours <= 0) return `${mins} min`;
    return `${hours}h ${mins}m`;
}

export default function DriverShiftPayoutCard({
    activeShift,
    todayMinutes,
    todayShiftPay,
    stripeConnected,
    stripeReady,
    balance,
}: DriverShiftPayoutCardProps) {
    const activeStarted = activeShift ? new Date(activeShift.startedAt) : null;
    const activeMinutes = activeStarted
        ? Math.max(0, Math.floor((Date.now() - activeStarted.getTime()) / 60000))
        : 0;
    const activePay = activeShift ? (activeMinutes / 60) * Number(activeShift.hourlyRate || 20) : 0;
    const totalMinutes = todayMinutes + activeMinutes;
    const totalPay = todayShiftPay + activePay;
    const readinessLabel = stripeReady
        ? "Payout ready"
        : stripeConnected
            ? "Finish Stripe"
            : "Stripe needed";

    return (
        <section className="driver-shift-card" aria-label="Driver shift and payout readiness">
            <div className="driver-shift-top">
                <div>
                    <p className="driver-shift-kicker">Driver Pay</p>
                    <h2>$20/hr Shift Tracker</h2>
                </div>
                <span className={`driver-shift-pill ${activeShift ? "active" : ""}`}>
                    {activeShift ? "Clocked in" : "Off shift"}
                </span>
            </div>

            <div className="driver-shift-grid">
                <div className="driver-shift-metric">
                    <Clock3 size={16} aria-hidden="true" />
                    <span>Today</span>
                    <strong>{formatDuration(totalMinutes)}</strong>
                </div>
                <div className="driver-shift-metric">
                    <Banknote size={16} aria-hidden="true" />
                    <span>Hourly Est.</span>
                    <strong>${totalPay.toFixed(2)}</strong>
                </div>
                <div className="driver-shift-metric">
                    <TimerReset size={16} aria-hidden="true" />
                    <span>Balance</span>
                    <strong>${balance.toFixed(2)}</strong>
                </div>
                <div className="driver-shift-metric">
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>Stripe</span>
                    <strong>{readinessLabel}</strong>
                </div>
            </div>

            <div className="driver-shift-actions">
                {activeShift ? (
                    <form action={clockOutDriverShift}>
                        <button className="driver-shift-btn primary" type="submit">Clock Out</button>
                    </form>
                ) : (
                    <form action={clockInDriverShift}>
                        <button className="driver-shift-btn primary" type="submit">Clock In</button>
                    </form>
                )}
                <Link className="driver-shift-btn" href="/driver/dashboard/account">
                    {stripeReady ? "View Payouts" : "Set Up Stripe"}
                </Link>
            </div>

            <p className="driver-shift-note">
                Shift pay is estimated at $20/hr before final admin review. Tips remain separate and stay with the driver.
            </p>
        </section>
    );
}
