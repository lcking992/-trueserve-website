"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'customer' | 'merchant' | 'driver'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }
    
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        alert(error.message);
        setIsLoading(false);
        return;
    }

    // Role-based routing
    if (role === 'merchant') router.push('/merchant/dashboard');
    else if (role === 'driver') router.push('/driver/dashboard');
    else router.push('/');
  };

  const signInWithProvider = async (provider: 'google') => {
    setIsLoading(true);
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
        alert(`Failed to connect with ${provider}: ${error.message}`);
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
              <div className="food-eyebrow">Charlotte &amp; Rock Hill · Local delivery</div>
              <div className="mt-5 space-y-4">
                <h1 className="food-heading !text-[52px] md:!text-[56px]">Good to have you <span className="accent">back.</span></h1>
                <p className="food-subtitle !max-w-[520px]">
                  Your favorite local restaurants, live order tracking, and 48-hour driver settlements — all in one place. Pick up right where you left off.
                </p>
              </div>
              <ul className="food-auth-list">
                {([
                  ["Your orders, live", "Track every order from kitchen to door with a real-time map."],
                  ["Saved addresses", "Skip re-entering your details every time you order."],
                  ["One account, every role", "Switch between customer, merchant, and driver views seamlessly."],
                ] as [string, string][]).map(([title, desc]) => (
                  <li key={title}>
                    <div className="food-auth-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
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

            <div className="role-tabs mt-6 overflow-x-auto">
              <button
                className={`role-tab ${role === 'customer' ? 'on' : ''}`}
                onClick={() => setRole('customer')}
              >
                Customer
              </button>
              <button
                className={`role-tab ${role === 'merchant' ? 'on' : ''}`}
                onClick={() => setRole('merchant')}
              >
                Merchant
              </button>
              <button
                className={`role-tab ${role === 'driver' ? 'on' : ''}`}
                onClick={() => setRole('driver')}
              >
                Driver
              </button>
            </div>

            <div className="fg mt-5">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="fg" style={{ marginTop: '10px' }}>
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div style={{ textAlign: 'right', margin: '8px 0 16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--gold)', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>

            <button
              className="ts-pill-btn ts-pill-btn-block mt-4"
              style={{ marginTop: 0 }}
              onClick={doLogin}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <div className="login-or">or continue with</div>

            <div className="grid grid-cols-1 gap-3">
              <button className="portal-btn-outline portal-btn-outline-block" onClick={() => signInWithProvider('google')} disabled={isLoading}>
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
          </section>
        </div>
      </main>
    </div>
  );
}
