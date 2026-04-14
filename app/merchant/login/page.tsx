"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession, loginAsDemoMerchant, loginWithPassword } from "@/app/auth/actions";

export default function MerchantLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const isPreview = document.cookie.includes("preview_mode=true");
            if (isPreview) {
                router.push("/merchant/dashboard");
                return;
            }

            const session = await getAuthSession();
            if (session.isAuth && session.role === 'MERCHANT') {
                router.push("/merchant/dashboard");
            }
        };
        checkUser();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.set("email", email);
            formData.set("password", password);

            const result = await loginWithPassword(formData);

            if (result.success) {
                router.push("/merchant/dashboard");
                router.refresh();
            } else {
                setError(result.message);
                setIsLoading(false);
            }
        } catch (err: any) {
            setError("Login failed. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="login-grid font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&family=Barlow+Condensed:ital,wght@0,700;0,800;1,700;1,800&display=swap');

                body { margin: 0; background: #0c0e13; overflow-x: hidden; }
                .login-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; background: #0c0e13; }

                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }

                /* LEFT PANEL */
                .left-panel { position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: 60px 80px; overflow: hidden; background: #080a0f; }
                .bg-img { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; grayscale: 1; opacity: 0.35; filter: contrast(1.1); transform: scale(1.05); }
                .bg-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(12,14,19,0.2) 0%, rgba(12,14,19,0.95) 100%); z-index: 1; }

                .left-content { position: relative; z-index: 2; animation: slideRight 1s ease-out; }
                .logo-wrap { position: absolute; top: 40px; left: 80px; display: flex; align-items: center; gap: 12px; z-index: 2; animation: slideRight 0.8s ease-out; cursor: pointer; text-decoration: none; }
                .logo-circle { width: 42px; height: 42px; border: 1.5px solid #2a2f3a; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); overflow: hidden; }
                .logo-text { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 800; color: #fff; font-style: italic; letter-spacing: -0.05em; line-height: 1; }
                .logo-text span { color: #e8a230; }

                .biz-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(232,162,48,0.1); border: 1px solid rgba(232,162,48,0.2); padding: 6px 14px; margin-bottom: 24px; border-radius: 2px; }
                .badge-dot { width: 7px; height: 7px; background: #e8a230; border-radius: 50%; box-shadow: 0 0 10px #e8a230; }
                .badge-text { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #e8a230; }

                .hero-txt { font-family: 'Barlow Condensed', sans-serif; font-size: 72px; font-weight: 800; font-style: italic; text-transform: uppercase; line-height: 0.95; margin-bottom: 20px; color: #fff; }
                .hero-txt span { color: #e8a230; }
                .hero-sub { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; max-width: 400px; margin-bottom: 40px; }

                .feat-list { display: flex; flex-direction: column; gap: 3px; }
                .feat-item { display: flex; align-items: center; gap: 16px; padding: 14px 20px; background: rgba(15,18,25,0.7); border: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(8px); }
                .feat-icon { width: 36px; height: 36px; background: rgba(232,162,48,0.12); border: 1px solid rgba(232,162,48,0.2); display: flex; align-items: center; justify-content: center; }
                .feat-name { font-size: 13px; font-weight: 700; color: #fff; }
                .feat-desc { font-size: 11px; color: rgba(255,255,255,0.35); }

                /* RIGHT PANEL */
                .right-panel { background: #0c0e13; border-left: 1px solid #1c1f28; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; }
                .form-box { width: 100%; max-width: 440px; animation: fadeInUp 0.8s ease-out; }
                .form-hd { font-size: 32px; font-weight: 700; color: #fff; margin-bottom: 4px; font-family: 'DM Sans', sans-serif; font-style: italic; letter-spacing: -0.3px; }
                .form-sub { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #e8a230; margin-bottom: 32px; }

                .field-row { margin-bottom: 24px; }
                .field-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #555; margin-bottom: 8px; }

                .input-box { width: 100%; background: #0f1219; border: 1px solid #2a2f3a; padding: 16px 18px; color: #ccc; font-family: 'DM Mono', monospace; font-size: 14px; outline: none; transition: border-color .15s; border-radius: 0; box-sizing: border-box; }
                .input-box:focus { border-color: #e8a230; }
                .input-box::placeholder { color: #333; }

                .error-msg { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #f87171; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 12px 16px; margin-bottom: 16px; }

                .submit-btn { width: 100%; padding: 17px; background: #e8a230; border: none; color: #000; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; cursor: pointer; transition: opacity .15s; margin-top: 10px; margin-bottom: 24px; }
                .submit-btn:hover { opacity: 0.9; }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
                .divider-line { flex: 1; height: 1px; background: #1c1f28; }
                .divider-txt { font-size: 10px; font-weight: 700; color: #2a2f3a; text-transform: uppercase; letter-spacing: 0.12em; white-space: nowrap; }

                .pilot-btn { width: 100%; padding: 15px; background: transparent; border: 1px solid #2a2f3a; color: #888; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; cursor: pointer; transition: all .15s; margin-bottom: 8px; }
                .pilot-btn:hover { border-color: #e8a230; color: #e8a230; }
                .pilot-btn.gold { border-color: rgba(232,162,48,0.3); color: #e8a230; background: rgba(232,162,48,0.02); }

                @media (max-width: 1024px) {
                    .login-grid { grid-template-columns: 1fr; }
                    .left-panel { display: none; }
                    .right-panel { padding: 40px 24px; }
                }
            ` }} />

            <div className="left-panel">
                <img src="/merchant_login_bg_restaurant.png" alt="" className="bg-img" />
                <div className="bg-overlay" />

                <a href="/" className="logo-wrap">
                    <div className="logo-circle">
                         <img src="/logo.png" alt="TrueServe Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div className="logo-text">True<span>Serve</span></div>
                </a>

                <div className="left-content">
                    <div className="biz-badge">
                        <div className="badge-dot" />
                        <div className="badge-text">Secure Merchant Uplink</div>
                    </div>
                    <div className="hero-txt">Ready to<br/><span>Scale?</span></div>
                    <div className="hero-sub">Enter the operational nerve center for top-performing kitchens. Manage your orders, logistics and growth in real-time.</div>

                    <div className="feat-list">
                        <div className="feat-item">
                            <div className="feat-icon">🍱</div>
                            <div>
                                <div className="feat-name">Real-Time Kitchen Feed</div>
                                <div className="feat-desc">Monitor live order flow and preparation timers.</div>
                            </div>
                        </div>
                        <div className="feat-item">
                            <div className="feat-icon">📈</div>
                            <div>
                                <div className="feat-name">Growth & Density Analysis</div>
                                <div className="feat-desc">Access high-yield sector data for market expansion.</div>
                            </div>
                        </div>
                        <div className="feat-item">
                            <div className="feat-icon">🛡️</div>
                            <div>
                                <div className="feat-name">Priority Partner Support</div>
                                <div className="feat-desc">Continuous 24/7 assistance for your kitchen operations.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="right-panel">
                <div className="form-box">
                    <div className="form-hd">Partner Connection</div>
                    <div className="form-sub">Operations Terminal Access</div>

                    <form onSubmit={handleLogin}>
                        {error && <div className="error-msg">{error}</div>}

                        <div className="field-row">
                            <div className="field-lbl">Email Identifier</div>
                            <input
                                type="email"
                                className="input-box"
                                placeholder="partner@yourstore.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="field-row">
                            <div className="field-lbl">Security Password</div>
                            <input
                                type="password"
                                className="input-box"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? "AUTHORIZING..." : "Authorize Connection →"}
                        </button>
                    </form>

                    <div className="divider">
                        <div className="divider-line" />
                        <div className="divider-txt">Merchant Rollout Access</div>
                        <div className="divider-line" />
                    </div>

                    <button className="pilot-btn gold" onClick={loginAsDemoMerchant}>
                        ⚡ Quick Pilot Access (Merchant)
                    </button>

                    <button className="pilot-btn" onClick={() => router.push("/login")}>
                        ← Fleet Hub Gateway
                    </button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[#2a2f3a] font-black text-[9px] uppercase tracking-[0.2em]">
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="1" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 5V3.5a2 2 0 014 0V5" stroke="currentColor" strokeWidth="1.2"/></svg>
                        Encrypted Connection · Secure Uplink
                    </div>
                </div>
            </div>
        </div>
    );
}
