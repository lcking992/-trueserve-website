"use client";

import { useState, useEffect, useCallback } from "react";
import { getPaymentMethods, detachPaymentMethod, createSetupIntent } from "@/app/user/settings/actions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function SetupForm({
    clientSecret,
    onSuccess,
    onCancel
}: {
    clientSecret: string;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsSaving(true);
        setMessage(null);

        const { error } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/user/settings`,
            },
            redirect: 'if_required'
        });

        if (error) {
            setMessage(error.message as string);
            setIsSaving(false);
        } else {
            setIsSaving(false);
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-6">
            <h4 className="mb-4 text-sm font-extrabold uppercase tracking-[0.16em] text-white/85">
                Add Payment Method
            </h4>

            <div className="bg-black/40 p-4 border border-white/5 mb-6 rounded-xl">
                <PaymentElement options={{ layout: "tabs" }} />
            </div>

            {message && (
                <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    Warning {message}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn btn-ghost flex-1 justify-center"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSaving || !stripe || !elements}
                    className="place-btn flex-1 disabled:opacity-30"
                >
                    {isSaving ? "Saving..." : "Save Method"}
                </button>
            </div>
        </form>
    );
}

export default function WalletUI({ userId }: { userId: string }) {
    const [methods, setMethods] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadMethods = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const data = await getPaymentMethods(userId);
            setMethods(data);
        } catch (e) {
            console.error(e);
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadMethods();
    }, [loadMethods]);

    const handleRemove = async (id: string) => {
        if (!confirm("Deactivate this operational payment method?")) return;
        try {
            await detachPaymentMethod(userId, id);
            await loadMethods(false);
        } catch (e) {
            alert("Protocol failure: Could not detach card.");
        }
    };

    const handleAddClick = async () => {
        setIsAddingCard(true);
        setError(null);
        if (!stripePromise) {
            setError("Stripe publishable key is missing. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and refresh.");
            setIsAddingCard(false);
            return;
        }
        try {
            const result = await createSetupIntent(userId);
            if (result && result.error) throw new Error(result.error);
            if (!result || !result.secret) throw new Error("Security tunnel failure. Please retry protocol.");
            setClientSecret(result.secret);
        } catch (e: any) {
            setError(e.message || "Failed to initialize securely.");
            setIsAddingCard(false);
        }
    };

    return (
        <div className="relative min-h-[260px] rounded-2xl border border-white/10 bg-black/25 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="food-kicker mb-2">Digital Wallet</p>
                    <h3 className="food-heading !text-[32px]">Saved Cards</h3>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/70">Secure</div>
            </div>

            {error && (
                <div className="mb-6 text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-t-2 border-[#f97316] rounded-full animate-spin mb-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A5550] animate-pulse">Syncing...</span>
                </div>
            ) : (
                <div className="space-y-4">
                    {methods.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-10 text-center">
                            <span className="mb-3 block text-3xl opacity-30">Payment</span>
                            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">No Saved Payment Methods</p>
                        </div>
                    ) : (
                        methods.map(pm => (
                            <div key={pm.id} className="flex justify-between items-center p-5 bg-[#1C1C1C] border border-white/5 rounded-2xl group transition-all hover:bg-[#1C1C1C]/80">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-9 bg-black/60 border border-white/5 rounded-lg flex items-center justify-center text-[9px] font-black text-[#f97316] uppercase tracking-widest shadow-2xl">
                                        {pm.brand === "PayPal" ? "PAYPAL" : pm.brand || "CARD"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white tracking-widest leading-none mb-1.5">{pm.displayPrimary}</p>
                                        <p className="text-[10px] text-[#5A5550] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-[#f97316] rounded-full shadow-[0_0_8px_#f97316]"></span>
                                            {pm.displaySecondary}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemove(pm.id)}
                                    className="w-10 h-10 border border-transparent hover:border-red-500/20 text-[#5A5550] hover:text-red-500 transition-all flex items-center justify-center rounded-xl"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {!isAddingCard ? (
                <button
                    onClick={handleAddClick}
                    className={`place-btn mt-7 ${isLoading ? 'opacity-30 pointer-events-none' : ''}`}
                >
                    Add Payment Method
                </button>
            ) : clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#f97316', colorBackground: '#0c0e13', colorText: '#f8fafc', fontFamily: 'DM Sans, sans-serif' } } }}>
                    <SetupForm
                        clientSecret={clientSecret}
                        onSuccess={() => {
                            setIsAddingCard(false);
                            setClientSecret(null);
                            loadMethods(true);
                        }}
                        onCancel={() => {
                            setIsAddingCard(false);
                            setClientSecret(null);
                        }}
                    />
                </Elements>
            ) : (
                <div className="mt-8 flex flex-col items-center py-10 bg-black/30 border border-white/5 rounded-2xl">
                    <div className="w-6 h-6 border-t-2 border-[#f97316] rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5A5550]">Encrypting...</span>
                </div>
            )}
        </div>
    );
}
