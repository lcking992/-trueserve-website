"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const technicalMessage = (error.message || "A client-side exception occurred during rendering.").trim();

  useEffect(() => {
    Sentry.captureException(error);
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#090b0a] text-white font-sans antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 text-center">
          <div className="mb-8 p-5 bg-red-500/10 rounded-full ring-1 ring-red-500/10">
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tighter text-balance">System Interruption</h1>
          <p className="text-slate-400 mb-8 max-w-2xl text-lg leading-relaxed font-medium text-balance">
            A critical part of the application failed to load. We've logged this for our engineers.
          </p>

          <div className="bg-slate-950/95 border border-white/10 rounded-[28px] p-6 sm:p-8 mb-8 w-full max-w-2xl text-left shadow-2xl overflow-hidden relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Diagnostic Info</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-black/50 px-4 py-4 sm:px-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Technical message</p>
              <pre className="mt-3 max-h-44 overflow-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-7 text-slate-200 font-mono">
                {technicalMessage}
              </pre>
            </div>
            {error.digest && (
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between opacity-60">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Trace ID</span>
                <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-3 py-1 rounded-lg break-all">{error.digest}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
            <button
              onClick={() => reset()}
              className="flex-1 bg-white text-black h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
            >
              Retry App
            </button>
            <a
              href="/"
              className="flex-1 bg-slate-900 border border-white/10 text-white h-16 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95"
            >
              Back Home
            </a>
          </div>

          <p className="mt-14 text-[10px] text-slate-700 font-black uppercase tracking-[0.32em]">
            TrueServe Global Fleet
          </p>
        </div>
      </body>
    </html>
  );
}
