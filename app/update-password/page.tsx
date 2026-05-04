
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";

const MIN_PASSWORD_LENGTH = 8;

function UpdatePasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [supabase] = useState(() => createClient());
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

    useEffect(() => {
        const code = searchParams.get("code");
        if (code) {
            setLoading(true);
            supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
                setLoading(false);
                if (error) {
                    setMessage({ text: "This reset link is invalid or has expired. Please request a new one.", type: "error" });
                }
            });
        }
    }, [searchParams, supabase]);

    const handleUpdate = async () => {
        if (!password) return;

        if (password.length < MIN_PASSWORD_LENGTH) {
            setMessage({ text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, type: "error" });
            return;
        }

        if (password !== confirm) {
            setMessage({ text: "Passwords do not match.", type: "error" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                setMessage({ text: error.message, type: "error" });
            } else {
                setMessage({ text: "Password updated successfully! Redirecting to sign in…", type: "success" });
                setTimeout(() => router.push("/login"), 2000);
            }
        } catch (e: any) {
            setMessage({ text: e.message, type: "error" });
        } finally {
            setLoading(false);
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
                            <div className="food-eyebrow">Account security</div>
                            <div className="mt-5 space-y-4">
                                <h1 className="food-heading !text-[52px] md:!text-[56px]">Set a New <span className="accent">Password.</span></h1>
                                <p className="food-subtitle !max-w-[520px]">
                                    Choose a strong password you haven&apos;t used before. Your account security is updated immediately.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="food-panel food-auth-form">
                        <Link href="/login" className="portal-btn-outline portal-btn-outline-block !w-auto !px-4 !py-2">← Back to Sign In</Link>
                        <p className="food-kicker mb-3">Account security</p>
                        <h2 className="food-heading !text-[32px] md:!text-[36px]">Update Password</h2>
                        <p className="lead mt-2 max-w-[360px]">Enter and confirm your new password below.</p>

                        {message && (
                            <div className={`mt-4 rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.11em] ${
                                message.type === "error"
                                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                                    : "border-[#3dd68c]/30 bg-[#3dd68c]/10 text-[#8ce7b8]"
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="fg mt-6">
                            <label>New Password</label>
                            <input
                                type="password"
                                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                                minLength={MIN_PASSWORD_LENGTH}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setMessage(null); }}
                                disabled={loading}
                            />
                        </div>

                        <div className="fg mt-3">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirm}
                                onChange={(e) => { setConfirm(e.target.value); setMessage(null); }}
                                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                                disabled={loading}
                            />
                        </div>

                        <button
                            className="ts-pill-btn ts-pill-btn-block mt-5"
                            onClick={handleUpdate}
                            disabled={loading || password.length < MIN_PASSWORD_LENGTH || !confirm}
                        >
                            {loading ? "Updating…" : "Update Password"}
                        </button>

                        <div className="login-foot">
                            Remember it now? <Link href="/login">Sign in</Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default function UpdatePasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#080a0f]"><p className="text-white/50">Loading…</p></div>}>
            <UpdatePasswordContent />
        </Suspense>
    );
}
