'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChangeRequest {
    id: string;
    requestedBy: { name: string; role: string };
    entityType: string;
    entityId: string;
    changeData: any;
    previousData: any;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    rollbackPlan?: string;
    createdAt: string;
}

interface ChangeWorkflowProps {
    pendingRequests: ChangeRequest[];
    approveAction: (id: string) => Promise<any>;
    rejectAction: (id: string) => Promise<any>;
}

export default function ChangeWorkflow({ pendingRequests, approveAction, rejectAction }: ChangeWorkflowProps) {
    const router = useRouter();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        const res = await approveAction(id);
        if (res.success) {
            router.refresh();
        }
        setProcessingId(null);
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        const res = await rejectAction(id);
        if (res.success) {
            router.refresh();
        }
        setProcessingId(null);
    };

    if (pendingRequests.length === 0) {
        return (
            <div className="p-12 text-center rounded-[2rem] border border-dashed border-white/10 opacity-50 bg-white/[0.02]">
                <p className="text-4xl mb-4">Shield</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">No pending change requests in queue.</p>
                <p className="text-[9px] text-slate-600 mt-2 font-medium">All sensitive deployments are currently synchronized.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {pendingRequests.map((request) => (
                <div key={request.id} className="card p-6 bg-black/40 border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="text-4xl font-serif italic font-black">STG</span>
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded-full border border-primary/20 uppercase">
                                    {request.entityType}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{request.entityId}</span>
                            </div>
                            <h3 className="font-bold text-lg text-white">Proposed Parameter Update</h3>
                            <p className="text-xs text-slate-500 font-medium font-mono lowercase tracking-tighter">REQ_ID: {request.id.slice(0, 8)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">{request.requestedBy.name}</p>
                            <p className="text-[9px] text-primary font-bold uppercase tracking-[0.2em]">{request.requestedBy.role}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <p className="text-[9px] font-black uppercase text-red-400 mb-2 opacity-60">Current State</p>
                            <pre className="text-[10px] font-mono whitespace-pre-wrap text-slate-400">
                                {JSON.stringify(request.previousData, null, 2)}
                            </pre>
                        </div>
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <p className="text-[9px] font-black uppercase text-emerald-400 mb-2 opacity-60">Proposed State</p>
                            <pre className="text-[10px] font-mono whitespace-pre-wrap text-white font-bold">
                                {JSON.stringify(request.changeData, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {request.rollbackPlan && (
                        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Rollback Plan</p>
                            <p className="text-xs text-slate-300 font-medium italic">"{request.rollbackPlan}"</p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button 
                            disabled={processingId === request.id}
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 btn btn-primary py-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {processingId === request.id ? 'DEPLOYING...' : 'Approve & Deploy'}
                        </button>
                        <button 
                            disabled={processingId === request.id}
                            onClick={() => handleReject(request.id)}
                            className="btn btn-outline border-white/10 text-slate-400 hover:text-white px-6 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
