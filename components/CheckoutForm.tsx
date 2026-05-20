"use client";

import { useState } from "react";
import { PaymentElement, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { capturePostHogEvent } from "@/lib/posthog-events";

interface CheckoutFormProps {
    onSuccess: (paymentIntentId: string) => void;
    totalAmount: number;
    disabled?: boolean;
}

export default function CheckoutForm({ onSuccess, totalAmount, disabled }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setMessage(submitError.message || "An error occurred");
            setIsLoading(false);
            return;
        }

        console.log("[Stripe] Confirming payment with elements...");
        capturePostHogEvent("checkout_started", {
            total_amount: Number(totalAmount.toFixed(2)),
            payment_method: "card",
        });
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, 
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        }
    };

    const handleExpressConfirm = async () => {
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setMessage(submitError.message || "An error occurred");
            setIsLoading(false);
            return;
        }

        capturePostHogEvent("checkout_started", {
            total_amount: Number(totalAmount.toFixed(2)),
            payment_method: "express",
        });
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href,
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            onSuccess(paymentIntent.id);
        }
    };

    return (
        <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="space-y-6"
            aria-describedby={message ? "payment-message" : "payment-help"}
        >
            <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Express Checkout</p>
                <p id="payment-help" className="sr-only">
                    Complete payment to place your order. Required address and schedule fields must be completed first.
                </p>
                <div className={`transition-all duration-300 ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                    <ExpressCheckoutElement 
                        onConfirm={handleExpressConfirm}
                        options={{
                            buttonHeight: 50,
                            buttonTheme: {
                                applePay: 'black',
                            }
                        }}
                    />
                </div>
                
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10"></span>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                        <span className="bg-slate-900 px-3 text-slate-500 font-bold tracking-widest">Or pay with card</span>
                    </div>
                </div>
            </div>

            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            <button
                disabled={isLoading || !stripe || !elements || disabled}
                aria-disabled={isLoading || !stripe || !elements || disabled}
                aria-busy={isLoading}
                id="submit"
                className="w-full btn btn-primary py-4 text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
            >
                {isLoading ? "Processing..." : `Pay $${totalAmount.toFixed(2)} & Place Order`}
            </button>

            {message && (
                <div
                    id="payment-message"
                    role="alert"
                    aria-live="assertive"
                    className="text-red-400 text-sm font-bold text-center bg-red-500/10 py-3 rounded-lg border border-red-500/20"
                >
                    {message}
                </div>
            )}
        </form>
    );
}
