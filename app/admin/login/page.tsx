"use client";

import { useState } from "react";
import Link from "next/link";
import { login, loginWithGoogle } from "./actions";
import Logo from "@/components/Logo";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.set("email", email);
            formData.set("password", password);

            const result = await login(formData);

            if (!result) {
                setError("Server error. Please try again.");
                return;
            }

            if (result.error) {
                setError(result.error);
                return;
            }

            if ('success' in result && result.success) {
                window.location.href = "/admin/dashboard";
            }
        } catch (err: any) {
            setError(err?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setIsLoading(true);

        try {
            const result = await loginWithGoogle();

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            if (result.url) {
                window.location.href = result.url;
            }
        } catch (err: any) {
            setError(err?.message || "An error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @keyframes orb-drift-1 {
                    0%   { transform: translate(0px, 0px) scale(1); opacity: 0.35; }
                    33%  { transform: translate(40px, -60px) scale(1.15); opacity: 0.5; }
                    66%  { transform: translate(-30px, 30px) scale(0.9); opacity: 0.3; }
                    100% { transform: translate(0px, 0px) scale(1); opacity: 0.35; }
                }
                @keyframes orb-drift-2 {
                    0%   { transform: translate(0px, 0px) scale(1); opacity: 0.25; }
                    40%  { transform: translate(-50px, 40px) scale(1.2); opacity: 0.4; }
                    75%  { transform: translate(35px, -25px) scale(0.85); opacity: 0.2; }
                    100% { transform: translate(0px, 0px) scale(1); opacity: 0.25; }
                }
                @keyframes orb-drift-3 {
                    0%   { transform: translate(0px, 0px) scale(1); opacity: 0.2; }
                    50%  { transform: translate(25px, 50px) scale(1.1); opacity: 0.35; }
                    100% { transform: translate(0px, 0px) scale(1); opacity: 0.2; }
                }
                @keyframes grid-fade {
                    0%   { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes card-enter {
                    0%   { opacity: 0; transform: translateY(32px) scale(0.97); }
                    100% { opacity: 1; transform: translateY(0px) scale(1); }
                }
                @keyframes welcome-enter {
                    0%   { opacity: 0; transform: translateY(12px); }
                    100% { opacity: 1; transform: translateY(0px); }
                }
                @keyframes logo-enter {
                    0%   { opacity: 0; transform: scale(0.8); }
                    60%  { transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes badge-enter {
                    0%   { opacity: 0; transform: translateY(-8px); }
                    100% { opacity: 1; transform: translateY(0px); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 0 30px rgba(249,115,22,0.08), 0 0 60px rgba(249,115,22,0.04); }
                    50%       { box-shadow: 0 0 50px rgba(249,115,22,0.18), 0 0 100px rgba(249,115,22,0.08); }
                }
                @keyframes border-glow {
                    0%, 100% { border-color: rgba(255,255,255,0.08); }
                    50%       { border-color: rgba(249,115,22,0.25); }
                }
                @keyframes scan-line {
                    0%   { top: 0%; opacity: 0; }
                    5%   { opacity: 1; }
                    95%  { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes dot-blink {
                    0%, 100% { opacity: 0.3; }
                    50%       { opacity: 1; }
                }
                @keyframes shimmer-slide {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }

                .admin-orb-1 {
                    animation: orb-drift-1 18s ease-in-out infinite;
                }
                .admin-orb-2 {
                    animation: orb-drift-2 24s ease-in-out infinite;
                }
                .admin-orb-3 {
                    animation: orb-drift-3 14s ease-in-out infinite;
                }
                .admin-grid-bg {
                    animation: grid-fade 2s ease-out forwards;
                }
                .admin-card {
                    animation: card-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both,
                               glow-pulse 4s ease-in-out 1s infinite,
                               border-glow 4s ease-in-out 1s infinite;
                }
                .admin-badge {
                    animation: badge-enter 0.5s ease-out 0.1s both;
                }
                .admin-logo {
                    animation: logo-enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both;
                }
                .admin-welcome {
                    animation: welcome-enter 0.5s ease-out 0.6s both;
                }
                .admin-form-fade {
                    animation: welcome-enter 0.5s ease-out 0.75s both;
                }
                .admin-scan-line {
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.5) 50%, transparent 100%);
                    animation: scan-line 6s linear 1.5s infinite;
                    pointer-events: none;
                }
                .admin-dot-1 { animation: dot-blink 1.4s ease-in-out 0s infinite; }
                .admin-dot-2 { animation: dot-blink 1.4s ease-in-out 0.2s infinite; }
                .admin-dot-3 { animation: dot-blink 1.4s ease-in-out 0.4s infinite; }

                .admin-input:focus {
                    outline: none;
                    border-color: rgba(249,115,22,0.5);
                    background: rgba(255,255,255,0.07);
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
                }
                .admin-submit:not(:disabled):hover {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(249,115,22,0.35);
                }
                .admin-submit {
                    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease;
                }
                .admin-google:not(:disabled):hover {
                    background: rgba(255,255,255,0.12);
                    transform: translateY(-1px);
                }
                .admin-google {
                    transition: transform 0.15s ease, background 0.2s ease;
                }
                .shimmer-text {
                    background: linear-gradient(90deg, #fff 0%, #f97316 40%, #fff 60%, #fff 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: shimmer-slide 3s linear 1s 1 forwards;
                }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#08090c", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>

                {/* Animated grid background */}
                <div className="admin-grid-bg" style={{
                    position: "absolute", inset: 0, pointerEvents: "none", opacity: 0,
                    backgroundImage: `
                        linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: "48px 48px",
                    maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)"
                }} />

                {/* Floating orbs */}
                <div className="admin-orb-1" style={{
                    position: "absolute", top: "-15%", right: "-8%",
                    width: 480, height: 480,
                    background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)",
                    borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none"
                }} />
                <div className="admin-orb-2" style={{
                    position: "absolute", bottom: "-20%", left: "-10%",
                    width: 520, height: 520,
                    background: "radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)",
                    borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none"
                }} />
                <div className="admin-orb-3" style={{
                    position: "absolute", top: "40%", left: "30%",
                    width: 300, height: 300,
                    background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)",
                    borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none"
                }} />

                <div style={{ position: "relative", width: "100%", maxWidth: 420 }}>

                    {/* Admin badge */}
                    <div className="admin-badge" style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        marginBottom: 20, opacity: 0
                    }}>
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 6,
                            padding: "5px 14px", borderRadius: 999,
                            background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)",
                            fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#f97316"
                        }}>
                            <span className="admin-dot-1" style={{ display: "inline-block", width: 5, height: 5, background: "#f97316", borderRadius: "50%" }} />
                            <span className="admin-dot-2" style={{ display: "inline-block", width: 5, height: 5, background: "#f97316", borderRadius: "50%" }} />
                            <span className="admin-dot-3" style={{ display: "inline-block", width: 5, height: 5, background: "#f97316", borderRadius: "50%" }} />
                            Secure Admin Portal
                        </span>
                    </div>

                    {/* Card */}
                    <div className="admin-card" style={{
                        background: "rgba(13,15,18,0.95)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 20,
                        overflow: "hidden",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                        opacity: 0,
                        position: "relative"
                    }}>
                        {/* Scan line effect */}
                        <div className="admin-scan-line" />

                        {/* Header */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 50%, rgba(0,0,0,0) 100%)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                            padding: "36px 32px 28px",
                            textAlign: "center",
                            position: "relative"
                        }}>
                            {/* Subtle corner accent */}
                            <div style={{
                                position: "absolute", top: 0, right: 0,
                                width: 120, height: 120,
                                background: "radial-gradient(circle at top right, rgba(249,115,22,0.12) 0%, transparent 60%)",
                                pointerEvents: "none"
                            }} />

                            <div className="admin-logo" style={{ display: "flex", justifyContent: "center", marginBottom: 16, opacity: 0 }}>
                                <Logo size="lg" href="/admin" />
                            </div>
                            <div className="admin-welcome" style={{ opacity: 0 }}>
                                <h1 className="shimmer-text" style={{
                                    fontSize: 28, fontWeight: 900, margin: "0 0 6px",
                                    letterSpacing: "-0.02em"
                                }}>
                                    Welcome back
                                </h1>
                                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, letterSpacing: "0.03em" }}>
                                    Staff access only · TrueServe Admin
                                </p>
                            </div>
                        </div>

                        {/* Form area */}
                        <div className="admin-form-fade" style={{ padding: "28px 32px 32px", opacity: 0 }}>
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                {/* Email */}
                                <div>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="operator@trueserve.delivery"
                                        className="admin-input"
                                        style={{
                                            width: "100%", padding: "12px 16px",
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 10, color: "#fff",
                                            fontSize: 14, boxSizing: "border-box",
                                            transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s"
                                        }}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="admin-input"
                                        style={{
                                            width: "100%", padding: "12px 16px",
                                            background: "rgba(255,255,255,0.04)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: 10, color: "#fff",
                                            fontSize: 14, boxSizing: "border-box",
                                            transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s"
                                        }}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Error */}
                                {error && (
                                    <div style={{
                                        padding: "12px 16px",
                                        background: "rgba(239,68,68,0.08)",
                                        border: "1px solid rgba(239,68,68,0.25)",
                                        borderRadius: 10
                                    }}>
                                        <p style={{ margin: 0, color: "#f87171", fontSize: 13, fontWeight: 600 }}>Warning {error}</p>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !email || !password}
                                    className="admin-submit"
                                    style={{
                                        width: "100%",
                                        background: isLoading || !email || !password
                                            ? "rgba(255,255,255,0.07)"
                                            : "linear-gradient(135deg, #f97316 0%, #ea6a0a 100%)",
                                        color: isLoading || !email || !password ? "rgba(255,255,255,0.3)" : "#fff",
                                        border: "none", borderRadius: 10,
                                        padding: "13px 24px",
                                        fontWeight: 800, fontSize: 14,
                                        cursor: isLoading || !email || !password ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                        letterSpacing: "0.03em"
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg style={{ width: 18, height: 18, animation: "spin 0.8s linear infinite" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        <>Sign In to Admin Portal</>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.08em" }}>OR</span>
                                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                            </div>

                            {/* Google */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="admin-google"
                                style={{
                                    width: "100%",
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: 10, color: "#fff",
                                    padding: "12px 24px",
                                    fontWeight: 700, fontSize: 14,
                                    cursor: isLoading ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                    opacity: isLoading ? 0.5 : 1
                                }}
                            >
                                <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>

                            {/* Footer */}
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                                >
                                    ← Admin Home
                                </Link>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
                                    Staff access only
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Version stamp */}
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 20, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
                        TrueServe Admin · v2.0
                    </p>
                </div>
            </div>
        </>
    );
}
