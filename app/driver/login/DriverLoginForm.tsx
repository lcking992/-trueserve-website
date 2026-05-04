"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const IS_DEV = process.env.NODE_ENV === "development";
const DEV_BYPASS_EMAIL = "driver@demo.test";
const DEV_BYPASS_PASSWORD = "password123";

export default function DriverLoginForm() {
    const supabase = createClient();
    const router = useRouter();

    const [phone, setPhone] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

    const handleDevBypass = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: DEV_BYPASS_EMAIL,
                password: DEV_BYPASS_PASSWORD,
            });
            if (error) throw error;
            router.push("/driver/dashboard");
            router.refresh();
        } catch (err: any) {
            setMessage({ text: `Dev bypass failed: ${err.message}`, error: true });
        } finally {
            setIsLoading(false);
        }
    };

    const formatPhone = (val: string) => {
        let digits = val.replace(/\D/g, "");
        if (digits.length > 0 && !digits.startsWith("1")) {
            digits = "1" + digits;
        }
        return `+${digits}`;
    };

    const requestOtpForPhone = async (formattedPhone: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: { shouldCreateUser: false }
        });

        if (error) {
            if (error.message.includes("Signups not allowed")) {
                throw new Error("This phone number is not registered to a driver application yet.");
            }
            throw error;
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        const formattedPhone = formatPhone(phone);
        if (formattedPhone.length < 11) {
            setMessage({ text: "Please enter a valid US phone number.", error: true });
            setIsLoading(false);
            return;
        }

        try {
            await requestOtpForPhone(formattedPhone);

            setPhone(formattedPhone);
            setStep("otp");
            setMessage({ text: "Code sent successfully via text!", error: false });
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to send code.", error: true });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (token.length < 6) {
            setMessage({ text: "Code must be 6 digits.", error: true });
            return;
        }
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                phone: phone,
                token: token,
                type: 'sms'
            });

            if (error) throw error;

            if (data?.session) {
                const forceTour =
                    typeof window !== "undefined" &&
                    new URLSearchParams(window.location.search).get("tour") === "1";
                router.push(forceTour ? "/driver/dashboard?tour=1" : "/driver/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setMessage({ text: "Invalid or expired code. Please request a new one.", error: true });
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            await requestOtpForPhone(phone);
            setMessage({ text: "We sent a fresh code to your phone.", error: false });
        } catch (err: any) {
            setMessage({ text: err.message || "Failed to resend code.", error: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative z-10 w-full overflow-hidden">
            {message && (
                <div className={`p-4 rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-3 border ${
                    message.error ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#3dd68c]/10 border-[#3dd68c]/20 text-[#3dd68c]'
                }`}>
                    {message.text}
                </div>
            )}

            {step === "phone" ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <div>
                        <label className="fl">Mobile Identifier (US Only)</label>
                        <div className="flex gap-[1px] bg-[#1c1f28] border border-[#2a2f3a] rounded-[12px] overflow-hidden">
                            <div className="px-4 flex items-center text-[#555] text-[13px] font-bold bg-[#131720] border-r border-[#1c1f28]">🇺🇸 +1</div>
                            <input 
                                type="tel"
                                required
                                placeholder="555 000 0000"
                                className="fi flex-1 !border-none !rounded-none !bg-[#0f1219]"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="btn-green h-15 !rounded-[100px] disabled:opacity-40"
                    >
                        {isLoading ? "UPLINKING..." : "Request Access Code →"}
                    </button>
                    
                    <div className="space-y-3">
                        <div className="text-center font-dm-sans text-[12px] text-[#555]">
                            New to the fleet? <Link href="/driver/signup" className="text-[#3dd68c] font-bold">Apply to partner</Link>
                        </div>
                        {IS_DEV && (
                            <div className="border-t border-dashed border-[#2a2f3a] pt-3">
                                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">Dev / QA Only</p>
                                <button
                                    type="button"
                                    onClick={handleDevBypass}
                                    disabled={isLoading}
                                    className="w-full text-[11px] font-bold text-[#3dd68c] border border-[#3dd68c]/20 bg-[#3dd68c]/5 rounded-xl py-2.5 hover:bg-[#3dd68c]/10 transition-colors disabled:opacity-40"
                                >
                                    {isLoading ? "Signing in..." : "Sign in as Demo Driver →"}
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="text-center">
                        <p className="text-[11px] text-[#555] font-bold uppercase tracking-widest mb-3">Verification code sent to <span className="text-[#3dd68c]">{phone}</span></p>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="••••••"
                            className="fi text-2xl font-bold tracking-[0.5em] text-center !text-[#3dd68c] h-15"
                            value={token}
                            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                            disabled={isLoading}
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || token.length < 6}
                        className="btn-green h-15 !rounded-[100px] disabled:opacity-40"
                    >
                        {isLoading ? "AUTHORIZING..." : "Authorize Terminal ✓"}
                    </button>

                    <button 
                        type="button"
                        onClick={() => { setStep("phone"); setMessage(null); }}
                        className="w-full text-[10px] font-bold text-[#555] uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Cancel and try again
                    </button>

                    <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="w-full text-[10px] font-bold uppercase tracking-widest text-[#3dd68c] hover:text-white transition-colors disabled:opacity-40"
                    >
                        Resend code
                    </button>

                    <div className="text-center text-[11px] text-[#6a7280]">
                        Changed your phone number? <Link href="/driver/recover" className="font-bold text-[#3dd68c]">Request a login update</Link>.
                    </div>
                </form>
            )}
        </div>
    );
}
