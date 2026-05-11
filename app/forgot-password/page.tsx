"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from "@/components/Logo";
import { resetPassword } from "@/app/auth/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set('email', email);
    const result = await resetPassword(formData);

    setIsLoading(false);

    if (result.error) {
      setError(result.message);
    } else {
      setSent(true);
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
            <div
              className="food-auth-image"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80')" }}
            />
            <div className="food-auth-hero-inner">
              <div className="food-eyebrow">Account recovery</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[52px] md:!text-[56px]">Reset Your <span className="accent">Password.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Enter the email address on your account and we will send you a secure reset link.
                </p>
              </div>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/login" className="portal-btn-outline portal-btn-outline-block !w-auto !px-4 !py-2">← Back to Sign In</Link>
            <p className="food-kicker mb-3">Account recovery</p>
            <h2 className="food-heading !text-[32px] md:!text-[36px]">Forgot Password</h2>
            <p className="lead mt-2 max-w-[360px]">We will send a secure reset link to your email address.</p>

            {sent ? (
              <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(61,214,140,0.08)', border: '1px solid rgba(61,214,140,0.3)', borderRadius: '12px' }}>
                <p style={{ color: '#3dd68c', fontWeight: 700, marginBottom: '8px' }}>Check your inbox</p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>
                  If an account exists for <strong style={{ color: '#fff' }}>{email}</strong>, you will receive a password reset link shortly.
                </p>
                <Link href="/login" style={{ display: 'inline-block', marginTop: '16px', fontSize: '13px', color: 'var(--gold)' }}>
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="fg mt-5">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <p style={{ color: '#f87171', fontSize: '13px', marginTop: '8px' }}>{error}</p>
                )}

                <button
                  className="ts-pill-btn ts-pill-btn-block mt-4"
                  style={{ marginTop: '16px' }}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="login-foot">
                  Remember your password? <Link href="/login">Sign in</Link>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
