import { supabaseAdmin } from '@/lib/supabase-admin';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Revalidate this page every 15 seconds so the status is always fresh
export const revalidate = 15;

export default async function TrueServeStatusPage() {
    // 1. Fetch Current System Status
    const { data: configData } = await supabase
        .from('SystemConfig')
        .select('value')
        .eq('key', 'MARKETPLACE_EMERGENCY_LOCK')
        .maybeSingle();

    const isLocked = configData?.value === 'true' || configData?.value === true;

    // 2. Fetch Recent Incidents from Audit Log (The history Jira creates)
    const { data: incidents } = await supabaseAdmin
        .from('AuditLog')
        .select('action, message, createdAt')
        .eq('entityType', 'MARKETPLACE')
        .in('action', ['EMERGENCY_PAUSE', 'SYSTEM_RESUME'])
        .order('createdAt', { ascending: false })
        .limit(10);

    return (
        <div className="min-h-screen bg-black text-slate-300 font-sans selection:bg-primary/30 py-12 px-4 md:px-0">
            <div className="max-w-3xl mx-auto space-y-12 animate-fade-in">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="TrueServe Logo" className="w-10 h-10 rounded-full border border-white/10" />
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white">True<span className="text-primary">Serve</span> Status</h1>
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Live System Metrics</p>
                        </div>
                    </div>
                    <Link href="/" className="text-xs font-bold text-white/50 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full">
                        Back to App
                    </Link>
                </div>

                {/* Big Status Indicator */}
                <div className={`p-8 rounded-[2rem] border shadow-2xl transition-all ${isLocked ? 'bg-red-900/10 border-red-500/30' : 'bg-emerald-900/10 border-emerald-500/30'}`}>
                    <div className="flex items-center gap-6">
                        <div className="relative flex h-10 w-10">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLocked ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-10 w-10 ${isLocked ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter">
                                {isLocked ? 'Major Service Outage' : 'All Systems Operational'}
                            </h2>
                            <p className={`mt-2 font-medium ${isLocked ? 'text-red-400' : 'text-emerald-400/80'}`}>
                                {isLocked ? 'Ordering is temporarily paused. Our engineers are investigating.' : 'Services are routing and operating at normal latency.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Components Status View */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6 tracking-tight">System Components</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="font-semibold text-slate-400">Merchant API</span>
                            <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Operational</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                            <span className="font-semibold text-slate-400">Driver Dispatch Engine</span>
                            <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Operational</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="font-semibold text-slate-400">Marketplace Ordering</span>
                            {isLocked ? (
                                <span className="text-red-400 font-bold text-sm tracking-widest uppercase animate-pulse">Offline (Triage)</span>
                            ) : (
                                <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Operational</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Incident History driven by Jira events */}
                <div className="pt-8">
                    <h3 className="text-2xl font-black text-white mb-8 tracking-tight italic">Incident History</h3>
                    
                    {!incidents || incidents.length === 0 ? (
                        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-white/10 text-slate-500 font-medium">
                            No recent incidents reported. Everything is running smoothly!
                        </div>
                    ) : (
                        <div className="relative border-l border-white/10 ml-4 space-y-12">
                            {incidents.map((incident, i) => {
                                const isPause = incident.action === 'EMERGENCY_PAUSE';
                                return (
                                    <div key={i} className="pl-8 relative">
                                        <div className={`absolute -left-3 top-1 w-6 h-6 rounded-full border-4 border-black ${isPause ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                                        <div className="mb-1">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                                {new Date(incident.createdAt).toLocaleDateString()} - {new Date(incident.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <h4 className={`text-xl font-bold tracking-tight mb-2 ${isPause ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {isPause ? 'Incident Identified' : 'Service Restored'}
                                        </h4>
                                        <p className="text-slate-400 font-medium leading-relaxed max-w-xl">
                                            {incident.message.replace('Warning EMERGENCY PAUSE:', '').replace('Done SYSTEM RESUME:', '').trim()}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
