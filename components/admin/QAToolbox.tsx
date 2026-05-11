"use client";

import { createMockOrder, approveAllPendingDrivers, clearAllMockData, getRecentAuditLogs, generateMockDrivers, advanceMockOrder, checkMockSmsProvider } from "@/app/admin/qa-actions";
import { useState } from "react";

export default function QAToolbox({ restaurants }: { restaurants: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) return null;

    const fetchLogs = async () => {
        setLoading("fetch_logs");
        const res = await getRecentAuditLogs();
        setLoading(null);
        if (res.success) setLogs(res.logs || []);
    };

    const handleCreateOrder = async (restaurantId: string) => {
        setLoading("create_order");
        const res = await createMockOrder(restaurantId);
        setLoading(null);
        if (res.success) setMessage({ text: `Mock order ${res.orderId?.slice(-6).toUpperCase()} created!`, type: 'success' });
        else setMessage({ text: res.error || "Failed to create order.", type: 'error' });
    };

    const handleApproveDrivers = async () => {
        setLoading("approve_drivers");
        const res = await approveAllPendingDrivers();
        setLoading(null);
        if (res.success) setMessage({ text: `Approved ${res.count} drivers!`, type: 'success' });
        else setMessage({ text: res.error || "Failed to approve drivers.", type: 'error' });
    };

    const handleGenerateDrivers = async () => {
        setLoading("generate_drivers");
        const res = await generateMockDrivers();
        setLoading(null);
        if (res.success) setMessage({ text: `Generated ${res.count} mock drivers!`, type: 'success' });
        else setMessage({ text: res.error || "Failed to generate drivers.", type: 'error' });
    };

    const handleAdvanceOrder = async () => {
        setLoading("advance_order");
        const res = await advanceMockOrder();
        setLoading(null);
        if (res.success) setMessage({ text: `Order advanced to ${res.nextStatus}!`, type: 'success' });
        else setMessage({ text: res.error || "Failed to advance order.", type: 'error' });
    };

    const handleCheckSms = async () => {
        setLoading("check_sms");
        const res = await checkMockSmsProvider();
        setLoading(null);
        if (res.success) {
            alert(res.message);
            setMessage({ text: `Use Fake Code: ${res.fakeCode}`, type: 'success' });
        } else {
            setMessage({ text: res.error || "Failed to check SMS logic.", type: 'error' });
        }
    };

    const handleClearMock = async () => {
        if (!confirm("Are you sure? This will delete all mock restaurants.")) return;
        setLoading("clear_mock");
        const res = await clearAllMockData();
        setLoading(null);
        if (res.success) setMessage({ text: "Mock data cleared!", type: 'success' });
        else setMessage({ text: res.error || "Failed to clear mock data.", type: 'error' });
    };

    return (
        <>
        <section className="mb-16 animate-fade-in">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-black flex flex-wrap items-center gap-2">
                    Tools QA <span className="text-gradient">Toolbox</span>
                    <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-primary/20 whitespace-nowrap">Pilot Ready</span>
                </h2>
                {message && (
                    <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border w-full lg:w-auto text-center ${
                        message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock Order Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Instant Order Generator</h3>
                    <div className="space-y-4">
                        <select 
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-sm font-bold focus:border-primary outline-none transition-all"
                            onChange={(e) => handleCreateOrder(e.target.value)}
                            disabled={loading === "create_order"}
                            defaultValue=""
                        >
                            <option value="" disabled>Select a Restaurant...</option>
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-500 font-medium">Injects a $25.50 PENDING order into the system for real-time dashboard testing.</p>
                    </div>
                </div>

                {/* Driver Approval Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Batch Driver Approval</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Instantly approves ALL drivers currently in PENDING status. Skip document verification for UAT.</p>
                    </div>
                    <button 
                        onClick={handleApproveDrivers}
                        disabled={!!loading}
                        className="btn btn-primary w-full text-[10px] font-black uppercase tracking-widest py-3 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading === "approve_drivers" ? "Approving..." : "Approve All Pending"}
                    </button>
                </div>

                {/* Data Cleanup Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-400/80 mb-4">Pilot Environment Cleanup</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Removes all mock restaurants and associated test data before the official pilot start.</p>
                    </div>
                    <button 
                        onClick={handleClearMock}
                        disabled={!!loading}
                        className="btn btn-outline w-full text-[10px] font-black uppercase tracking-widest py-3 border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                        {loading === "clear_mock" ? "Purging..." : "Wipe Mock Data"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Mock Driver Generator Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Generate Mock Drivers</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Creates unique mock accounts with attached Insurance & Registration docs. Ready for manual approval testing.</p>
                    </div>
                    <button 
                        onClick={handleGenerateDrivers}
                        disabled={!!loading}
                        className="btn btn-primary w-full text-[10px] font-black uppercase tracking-widest py-3 shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading === "generate_drivers" ? "Generating..." : "Generate Regional Drivers"}
                    </button>
                </div>

                {/* Advance Order Tool */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Force Advance Order Status</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Finds the oldest active order and artificially bumps it to the next status (e.g. Preparing -{'>'} Ready).</p>
                    </div>
                    <button 
                        onClick={handleAdvanceOrder}
                        disabled={!!loading}
                        className="btn bg-white/10 hover:bg-white/20 text-white w-full text-[10px] font-black uppercase tracking-widest py-3 disabled:opacity-50 transition-colors"
                    >
                        {loading === "advance_order" ? "Advancing..." : "Bump Next Order Status"}
                    </button>
                </div>

                {/* Test Mock Signup Flow */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Test Driver Signup UI</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Redirects you to the public Driver application securely unlocked with the ?qa=true flag.</p>
                    </div>
                    <a 
                        href="/driver?qa=true"
                        target="_blank"
                        className="btn bg-white/10 hover:bg-white/20 text-white w-full text-[10px] font-black uppercase tracking-widest py-3 flex items-center justify-center transition-colors"
                    >
                        Open QA Sign Up Form Open
                    </a>
                </div>

                {/* SMS Bypass check */}
                <div className="card p-6 border-white/5 bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">SMS Bypass Info</h3>
                        <p className="text-[10px] text-slate-500 font-medium mb-6">Need an OTP code to login a test driver but don't have their phone? Get test tokens here.</p>
                    </div>
                    <button 
                        onClick={handleCheckSms}
                        disabled={!!loading}
                        className="btn bg-white/10 hover:bg-white/20 text-white w-full text-[10px] font-black uppercase tracking-widest py-3 disabled:opacity-50 transition-colors"
                    >
                        {loading === "check_sms" ? "Checking..." : "View Test OTPs"}
                    </button>
                </div>
            </div>
        </section>

        {/* Story Card Generator Section */}
        <section className="mb-16 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black flex items-center gap-2">
                    Checklist QA Story Card Generator
                </h3>
                <button 
                    onClick={fetchLogs}
                    disabled={loading === 'fetch_logs'}
                    className="btn btn-outline text-[10px] font-black uppercase tracking-widest px-4 py-2 disabled:opacity-50"
                >
                    {loading === 'fetch_logs' ? 'Fetching...' : 'Fetch Recent Logs'}
                </button>
            </div>
            
            {logs.length > 0 && (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8 max-h-[400px] overflow-y-auto">
                    {logs.map((log: any) => (
                        <div key={log.id} className="mb-4 pb-4 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary mr-2">{log.action}</span>
                                    <span className="text-sm font-medium text-slate-300">{log.message}</span>
                                </div>
                                <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <code className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">
                                    Target: {log.targetId} | Entity: {log.entityType}
                                </code>
                                <button
                                    onClick={() => {
                                        const markdown = `### Bug QA Bug Report / Story Card\n**Action Traced:** \`${log.action}\`\n**Timestamp:** ${new Date(log.createdAt).toLocaleString()}\n**Target ID:** \`${log.targetId}\`\n**Entity:** \`${log.entityType}\`\n\n**Log Message:**\n> ${log.message}\n\n**Steps to Reproduce:**\n1. \n2. \n3. \n\n**Expected Result:**\n\n**Actual Result:**\n\n**Environment / Device Info:**\n- Device/Browser: \n- Network status: `;
                                        navigator.clipboard.writeText(markdown);
                                        setMessage({ text: 'Story Card copied to clipboard!', type: 'success' });
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors bg-primary/10 px-3 py-1 rounded border border-primary/20 hover:bg-primary/20"
                                >
                                    Checklist Copy to Story Card
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
        </>
    );
}
