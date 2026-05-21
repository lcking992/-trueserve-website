"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarHeart, Gift, PartyPopper, Sparkles, Trophy } from "lucide-react";
import Confetti from "@/components/Confetti";
import type { AnniversaryRewardStatus } from "@/lib/rewards";

type Props = {
  isSignedIn: boolean;
  createdAt: string | null;
  reward?: AnniversaryRewardStatus;
};

function daysBetween(a: Date, b: Date): number {
  const aUtc = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUtc = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bUtc - aUtc) / (1000 * 60 * 60 * 24));
}

function formatLongDate(d: Date | null): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

function nextAnniversary(createdAt: Date, now: Date): Date {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), createdAt.getUTCMonth(), createdAt.getUTCDate())
  );
  if (next < now) {
    next.setUTCFullYear(next.getUTCFullYear() + 1);
  }
  return next;
}

function yearsAsMember(createdAt: Date, now: Date): number {
  const years = now.getUTCFullYear() - createdAt.getUTCFullYear();
  const hadAnniversaryThisYear =
    now.getUTCMonth() > createdAt.getUTCMonth() ||
    (now.getUTCMonth() === createdAt.getUTCMonth() && now.getUTCDate() >= createdAt.getUTCDate());
  return hadAnniversaryThisYear ? years : Math.max(0, years - 1);
}

export default function AnniversaryTab({ isSignedIn, createdAt, reward }: Props) {
  const [confettiOn, setConfettiOn] = useState(false);

  const createdDate = useMemo(() => {
    if (!createdAt) return null;
    const d = new Date(createdAt);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [createdAt]);

  const now = useMemo(() => new Date(), []);
  const memberDays = createdDate ? daysBetween(createdDate, now) : 0;
  const memberYears = createdDate ? yearsAsMember(createdDate, now) : 0;
  const nextDate = createdDate ? nextAnniversary(createdDate, now) : null;
  const daysUntilNext = nextDate ? daysBetween(now, nextDate) : null;
  const isAnniversaryToday =
    createdDate !== null &&
    nextDate !== null &&
    daysUntilNext === 0;

  // Decide whether to fire confetti — once per scenario, gated by localStorage.
  useEffect(() => {
    if (!isSignedIn || !createdDate) return;

    try {
      // 1) Anniversary day → confetti once per year
      if (isAnniversaryToday) {
        const key = `ts.rewards.anniversaryCelebrated.${now.getUTCFullYear()}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          setConfettiOn(true);
          return;
        }
      }

      // 2) Server just granted an anniversary reward this visit → celebrate
      if (reward?.granted) {
        const key = `ts.rewards.anniversaryGrantedSeen.${reward.anniversaryYear ?? "x"}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          setConfettiOn(true);
          return;
        }
      }

      // 3) Fresh account (joined within the last 7 days) and hasn't seen welcome
      if (memberDays >= 0 && memberDays <= 7) {
        const key = "ts.rewards.welcomeCelebrated";
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          setConfettiOn(true);
          return;
        }
      }
    } catch {
      // localStorage blocked — silently skip
    }
  }, [isSignedIn, createdDate, isAnniversaryToday, memberDays, reward, now]);

  // Headline + sub copy depend on the user's state
  const headline = !isSignedIn
    ? "Your anniversary clock starts the moment you join."
    : isAnniversaryToday
      ? `Happy ${memberYears + 1}-year anniversary! 🎉`
      : memberYears === 0
        ? `Welcome — your first anniversary unlocks ${formatLongDate(nextDate)}.`
        : `You're ${memberYears} year${memberYears === 1 ? "" : "s"} strong with TrueServe.`;

  const sub = !isSignedIn
    ? "Once you create an account, every year on the day you joined we drop 250 TruePoints in your wallet — automatically. No claim required."
    : isAnniversaryToday
      ? "Today's the day. Your anniversary bonus has been added to your wallet. Use it on your next order or stack it toward the next tier."
      : "Every year on the day you joined, we drop 250 TruePoints in your wallet — automatically. No claim required.";

  return (
    <>
      <Confetti trigger={confettiOn} />

      <section id="anniversary" className="ts-fig-section">
        <div className="ts-fig-container">
          <span className="ts-fig-kicker">Account anniversary</span>
          <h2>{headline}</h2>
          <p className="ts-fig-anniv-sub">{sub}</p>

          <div className="ts-fig-anniv-grid">
            <article className="ts-fig-anniv-card primary">
              <div className="ts-fig-anniv-card-head">
                <div className="ts-fig-trust-icon"><CalendarHeart size={20} /></div>
                <span>Member since</span>
              </div>
              <strong>{formatLongDate(createdDate)}</strong>
              <small>
                {createdDate
                  ? `${memberDays.toLocaleString()} days with TrueServe`
                  : "Sign in to see your join date"}
              </small>
            </article>

            <article className="ts-fig-anniv-card">
              <div className="ts-fig-anniv-card-head">
                <div className="ts-fig-trust-icon"><Sparkles size={20} /></div>
                <span>Next anniversary</span>
              </div>
              <strong>{formatLongDate(nextDate)}</strong>
              <small>
                {daysUntilNext === null
                  ? "Sign in to track your countdown"
                  : daysUntilNext === 0
                    ? "Today — bonus is in your wallet 🎉"
                    : `${daysUntilNext.toLocaleString()} ${daysUntilNext === 1 ? "day" : "days"} to go`}
              </small>
            </article>

            <article className="ts-fig-anniv-card">
              <div className="ts-fig-anniv-card-head">
                <div className="ts-fig-trust-icon"><Gift size={20} /></div>
                <span>Yearly bonus</span>
              </div>
              <strong>250 <span className="ts-fig-anniv-unit">pts</span></strong>
              <small>Credited automatically every anniversary</small>
            </article>
          </div>

          <div className="ts-fig-anniv-timeline">
            <h3>How the anniversary perk works</h3>
            <ol>
              <li>
                <span className="ts-fig-anniv-step-dot">1</span>
                <div>
                  <strong>Day 0 — you join.</strong>
                  <span>Your account is created and the anniversary clock starts ticking.</span>
                </div>
              </li>
              <li>
                <span className="ts-fig-anniv-step-dot">2</span>
                <div>
                  <strong>Order normally throughout the year.</strong>
                  <span>Every completed order earns regular TruePoints — your anniversary bonus stacks on top.</span>
                </div>
              </li>
              <li>
                <span className="ts-fig-anniv-step-dot">3</span>
                <div>
                  <strong>Anniversary day — 250 pts drop in.</strong>
                  <span>The bonus is credited automatically. Open the wallet, see the confetti, keep ordering.</span>
                </div>
              </li>
              <li>
                <span className="ts-fig-anniv-step-dot">4</span>
                <div>
                  <strong>The clock resets — 365 days later, it happens again.</strong>
                  <span>For as long as your account stays active and in good standing.</span>
                </div>
              </li>
            </ol>
          </div>

          {reward?.alreadyClaimed && !reward?.granted ? (
            <p className="ts-fig-anniv-claimed">
              <Trophy size={16} aria-hidden="true" />
              Your {reward.anniversaryYear} anniversary bonus is already in your wallet. Next drop: {formatLongDate(nextDate)}.
            </p>
          ) : null}

          {!isSignedIn ? (
            <div className="ts-fig-anniv-cta">
              <Link href="/signup" className="ts-fig-btn">
                <PartyPopper size={16} aria-hidden="true" /> Create my account
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
