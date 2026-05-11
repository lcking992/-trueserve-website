"use client";

import React, { useEffect, useState } from "react";
import { syncAllServiceCosts, checkAndCreateAnomalies } from "@/app/admin/cost-management/actions";
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface SyncStatus {
    isLoading: boolean;
    lastSyncTime?: string;
    lastSyncResult?: {
        success: boolean;
        message: string;
        synced?: number;
    };
    anomalyCheckResult?: {
        success: boolean;
        message: string;
        anomalies?: any[];
    };
}

const providers = [
    { name: "Stripe", active: true, note: "Primary sync source" },
    { name: "Supabase", active: false, note: "Needs access token" },
    { name: "Google Cloud", active: false, note: "Needs billing export" },
    { name: "Mapbox", active: false, note: "Needs API + username" },
    { name: "Resend", active: false, note: "Needs API key" },
    { name: "Vonage", active: false, note: "Needs API key + secret" },
];

export default function CostSyncManager() {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isLoading: false,
        lastSyncTime: undefined,
        lastSyncResult: undefined,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const savedTime = localStorage.getItem("lastCostSyncTime");
        const savedResult = localStorage.getItem("lastCostSyncResult");

        setSyncStatus((prev) => ({
            ...prev,
            lastSyncTime: savedTime || undefined,
            lastSyncResult: savedResult ? JSON.parse(savedResult) : undefined,
        }));
    }, []);

    async function handleSync() {
        setSyncStatus((prev) => ({ ...prev, isLoading: true }));

        try {
            const result = await syncAllServiceCosts();
            const timestamp = new Date().toLocaleString();

            if (typeof window !== "undefined") {
                localStorage.setItem("lastCostSyncTime", timestamp);
                localStorage.setItem("lastCostSyncResult", JSON.stringify(result));
            }

            setSyncStatus({
                isLoading: false,
                lastSyncTime: timestamp,
                lastSyncResult: result,
            });
        } catch (error) {
            setSyncStatus({
                isLoading: false,
                lastSyncTime: new Date().toLocaleString(),
                lastSyncResult: {
                    success: false,
                    message: error instanceof Error ? error.message : "Unknown error occurred",
                },
            });
        }
    }

    async function handleAnomalyCheck() {
        setSyncStatus((prev) => ({ ...prev, isLoading: true }));

        try {
            const result = await checkAndCreateAnomalies();
            setSyncStatus((prev) => ({
                ...prev,
                isLoading: false,
                anomalyCheckResult: result,
            }));
        } catch (error) {
            setSyncStatus((prev) => ({
                ...prev,
                isLoading: false,
                anomalyCheckResult: {
                    success: false,
                    message: error instanceof Error ? error.message : "Unknown error occurred",
                },
            }));
        }
    }

    return (
        <div className="adm-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                        <h2 className="text-[15px] font-semibold text-white">Data Synchronization</h2>
                    </div>
                    <p className="max-w-3xl text-sm leading-6 text-white/55">
                        Sync live service spending from connected APIs and keep budget alerts current. This is a real sync
                        console; Stripe is active today and the other providers remain skipped until their credentials are added.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/45">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-medium text-white/65">
                            Real data only
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-medium text-white/65">
                            Budget alerts enabled
                        </span>
                        {syncStatus.lastSyncTime && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-medium text-white/55">
                                <Clock className="h-3.5 w-3.5" />
                                Last synced {syncStatus.lastSyncTime}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncStatus.isLoading}
                        className="inline-flex items-center gap-2 rounded-md border border-[#f97316]/30 bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#ff8a2a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? "animate-spin" : ""}`} />
                        {syncStatus.isLoading ? "Syncing..." : "Sync Costs"}
                    </button>

                    <button
                        onClick={handleAnomalyCheck}
                        disabled={syncStatus.isLoading}
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <AlertCircle className="h-4 w-4" />
                        Check Anomalies
                    </button>
                </div>
            </div>

            {syncStatus.lastSyncResult && (
                <div
                    className={`mt-4 rounded-md border p-4 ${
                        syncStatus.lastSyncResult.success
                            ? "border-green-500/20 bg-green-500/10"
                            : "border-red-500/20 bg-red-500/10"
                    }`}
                >
                    <div className="flex items-start gap-3">
                        {syncStatus.lastSyncResult.success ? (
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                        ) : (
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p
                                className={`text-sm font-medium ${
                                    syncStatus.lastSyncResult.success ? "text-green-300" : "text-red-300"
                                }`}
                            >
                                {syncStatus.lastSyncResult.success ? "Sync Successful" : "Sync Failed"}
                            </p>
                            <p
                                className={`mt-1 text-sm ${
                                    syncStatus.lastSyncResult.success ? "text-green-200/80" : "text-red-200/80"
                                }`}
                            >
                                {syncStatus.lastSyncResult.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {syncStatus.anomalyCheckResult && (
                <div
                    className={`mt-3 rounded-md border p-4 ${
                        syncStatus.anomalyCheckResult.success
                            ? "border-blue-500/20 bg-blue-500/10"
                            : "border-red-500/20 bg-red-500/10"
                    }`}
                >
                    <div className="flex items-start gap-3">
                        {syncStatus.anomalyCheckResult.success ? (
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                        ) : (
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p
                                className={`text-sm font-medium ${
                                    syncStatus.anomalyCheckResult.success ? "text-blue-300" : "text-red-300"
                                }`}
                            >
                                {syncStatus.anomalyCheckResult.success
                                    ? "Anomaly Check Complete"
                                    : "Anomaly Check Failed"}
                            </p>
                            <p
                                className={`mt-1 text-sm ${
                                    syncStatus.anomalyCheckResult.success ? "text-blue-200/80" : "text-red-200/80"
                                }`}
                            >
                                {syncStatus.anomalyCheckResult.message}
                            </p>

                            {syncStatus.anomalyCheckResult.anomalies &&
                                syncStatus.anomalyCheckResult.anomalies.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {syncStatus.anomalyCheckResult.anomalies.map((anomaly, idx) => (
                                            <div key={idx} className="rounded-md border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                                                <div className="font-semibold text-white">
                                                    {anomaly.service.toUpperCase()} — {anomaly.month}
                                                </div>
                                                <div className="mt-1">{anomaly.description}</div>
                                                <div className="mt-1 text-white/50">
                                                    Expected: ${anomaly.expectedCost.toFixed(2)} | Actual: $
                                                    {anomaly.actualCost.toFixed(2)} ({anomaly.percentDeviation > 0 ? "+" : ""}
                                                    {anomaly.percentDeviation.toFixed(1)}%)
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 rounded-md border border-[#1e2420] bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#8dc7ff]">Checklist Setup Required</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">
                        Admin only
                    </span>
                </div>
                <p className="text-xs leading-6 text-white/55">
                    Add the matching environment variables in Vercel to enable additional provider syncs. Each provider stays
                    skipped until its credentials are present.
                </p>

                <div className="mt-3 grid gap-2 font-mono text-[11px] text-white/55 sm:grid-cols-2">
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">STRIPE_SECRET_KEY=sk_...</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">GCP_PROJECT_ID=your-project-id</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">GCP_BILLING_ACCOUNT_ID=000000-000000-000000</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">SUPABASE_PROJECT_ID=your-project-id</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">SUPABASE_ACCESS_TOKEN=sbpa_...</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">MAPBOX_ACCESS_TOKEN=pk_...</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">MAPBOX_USERNAME=your-username</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">RESEND_API_KEY=re_...</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">VONAGE_API_KEY=your-api-key</div>
                    <div className="rounded border border-white/8 bg-white/5 px-3 py-2">VONAGE_API_SECRET=your-api-secret</div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {providers.map((provider) => (
                        <div
                            key={provider.name}
                            className="flex items-center justify-between rounded-md border border-white/8 bg-white/5 px-3 py-2 text-xs"
                        >
                            <div>
                                <div className="font-semibold text-white/80">{provider.name}</div>
                                <div className="text-white/40">{provider.note}</div>
                            </div>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                                    provider.active
                                        ? "border border-green-500/30 bg-green-500/10 text-green-300"
                                        : "border border-white/10 bg-white/5 text-white/45"
                                }`}
                            >
                                {provider.active ? "Active" : "Skipped"}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="mt-3 text-xs text-white/45">
                    Currently configured: Stripe only. Everything else will stay inactive until the matching credentials are added.
                </p>
            </div>
        </div>
    );
}
