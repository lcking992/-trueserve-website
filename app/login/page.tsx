"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { loginWithPassword } from "@/app/auth/actions";

// Show dev tools in local dev OR on non-production Vercel environments (preview/QA).
// Set NEXT_PUBLIC_APP_ENV=preview in Vercel's Preview environment variables to enable.
// Never set it on Production — those buttons must never appear on the live site.
const IS_DEV =
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_APP_ENV === 'preview';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'merchant' | 'driver'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleDevBypass = async (demoEmail: string, demoPassword: string, label: string) => {
    setIsLoading(true);
    setErrorText('');
    const formData = new FormData();
    formData.set('email', demoEmail);
    formData.set('password', demoPassword);
    const result = await loginWithPassword(formData);
    if (result.error) {
      setErrorText(`Dev bypass failed for ${label}: ${result.message}`);
      setIsLoading(false);
      return;
    }
    const dbRole = result.role || 'CUSTOMER';
    if (dbRole === 'MERCHANT') router.push('/merchant/dashboard');
    else if (dbRole === 'DRIVER') router.push('/driver/dashboard');
    else if (dbRole === 'ADMIN' || dbRole === 'QA_TESTER') router.push('/admin/dashboard');
    else router.push('/');
    router.refresh();
  };

  const doLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorText('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorText('');

    // Use the server action — sets userId cookie + Supabase session properly
    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);
    const result = await loginWithPassword(formData);

    if (result.error) {
      setErrorText(result.message);
      setIsLoading(false);
      return;
    }

    const dbRole = result.role || 'CUSTOMER';
    if (dbRole === 'MERCHANT') router.push('/merchant/dashboard');
    else if (dbRole === 'DRIVER') router.push('/driver/dashboard');
    else if (dbRole === 'ADMIN' || dbRole === 'QA_TESTER') router.push('/admin/dashboard');
    else router.push('/');

    router.refresh();
  };

  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
    setErrorText('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                prompt: 'select_account',
            }
        }
    });

    if (error) {
        setErrorText(`Failed to connect with ${provider}: ${error.message}`);
        setIsLoading(false);
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
              <div className="food-eyebrow">Customer and team access</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[52px] md:!text-[56px]">Welcome Back To <span className="accent">Dinner Mode.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  The sign-in experience now matches the rest of the food app: warm dark surfaces, clear hierarchy, and straightforward next steps.
                </p>
              </div>
              <ul className="food-auth-list">
                {[
                  ["Order faster", "Save addresses, past orders, and checkout details."],
                  ["Track live", "Follow prep and delivery progress in one place."],
                  ["Switch roles", "Customer, merchant, and driver access stays organized here."],
                ].map(([title, desc], index) => (
                  <li key={title}>
                    <div className="food-auth-icon">{index + 1}</div>
                    <div>
                      <div className="font-extrabold">{title}</div>
                      <div className="text-sm text-white/65">{desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="food-panel food-auth-form">
            <Link href="/" className="portal-btn-outline portal-btn-outline-block !w-auto !px-4 !py-2">← Home</Link>
            <p className="food-kicker mb-3">Account access</p>
            <h2 className="food-heading !text-[32px] md:!text-[36px]">Sign In</h2>
            <p className="lead mt-2 max-w-[360px]">Access your TrueServe account and continue your order flow.</p>

            {errorText && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] text-red-300">
                {errorText}
              </div>
            )}

            <div className="role-tabs mt-6 overflow-x-auto">
              <button
                className={`role-tab ${role === 'customer' ? 'on' : ''}`}
                onClick={() => { setRole('customer'); setErrorText(''); }}
              >
                Customer
              </button>
              <button
                className={`role-tab ${role === 'merchant' ? 'on' : ''}`}
                onClick={() => { setRole('merchant'); setErrorText(''); }}
              >
                Merchant
              </button>
              <button
                className={`role-tab ${role === 'driver' ? 'on' : ''}`}
                onClick={() => { setRole('driver'); setErrorText(''); }}
              >
                Driver
              </button>
            </div>

            <form className="mt-5" onSubmit={doLogin}>
              <div className="fg">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrorText(''); }}
                  disabled={isLoading}
                />
              </div>
              <div className="fg" style={{ marginTop: '10px' }}>
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorText(''); }}
                  disabled={isLoading}
                />
              </div>
              <div style={{ textAlign: 'right', margin: '8px 0 16px' }}>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--gold)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="ts-pill-btn ts-pill-btn-block mt-4"
                style={{ marginTop: 0 }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="login-or">or continue with</div>

            <div className="grid grid-cols-1 gap-3">
              <button type="button" className="portal-btn-outline portal-btn-outline-block" onClick={() => signInWithProvider('google')} disabled={isLoading}>
                <span style={{ fontSize: '16px', marginRight: '8px' }}>G</span> Continue with Google
              </button>
            </div>

            <div className="login-foot">
              {role === 'customer' ? (
                <>Don't have an account? <Link href="/signup">Sign up</Link></>
              ) : role === 'merchant' ? (
                <>No account yet? <Link href="/merchant/signup">Sign up as Merchant</Link></>
              ) : (
                <>No account yet? <Link href="/driver/signup">Sign up as Driver</Link></>
              )}
            </div>

            {IS_DEV && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dev / QA Only</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    className="portal-btn-outline portal-btn-outline-block"
                    style={{ fontSize: '13px', padding: '8px 12px' }}
                    onClick={() => handleDevBypass('customer@demo.test', 'password123', 'Demo Customer')}
                    disabled={isLoading}
                  >
                    Sign in as Demo Customer →
                  </button>
                  <button
                    type="button"
                    className="portal-btn-outline portal-btn-outline-block"
                    style={{ fontSize: '13px', padding: '8px 12px' }}
                    onClick={() => handleDevBypass('merchant@demo.test', 'password123', 'Demo Merchant')}
                    disabled={isLoading}
                  >
                    Sign in as Demo Merchant →
                  </button>
                  <button
                    type="button"
                    className="portal-btn-outline portal-btn-outline-block"
                    style={{ fontSize: '13px', padding: '8px 12px' }}
                    onClick={() => handleDevBypass('qa@trueserve.delivery', 'TrueServeQA_2026!', 'QA Tester')}
                    disabled={isLoading}
                  >
                    Sign in as QA Tester →
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
