'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Policy {
    id: string;
    key: string;
    title: string;
    content: string;
    version: number;
    updatedAt: string;
}

interface PolicyCMSProps {
    policies: Policy[];
    onSave: (key: string, title: string, content: string) => Promise<any>;
}

export default function PolicyCMS({ policies, onSave }: PolicyCMSProps) {
    const router = useRouter();
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [isSaving, setIsSaving] = useState(false);

    const startEdit = (p: Policy) => {
        setEditingKey(p.key);
        setFormData({ title: p.title, content: p.content });
    };

    const handleSave = async () => {
        if (!editingKey) return;
        setIsSaving(true);
        const res = await onSave(editingKey, formData.title, formData.content);
        if (res.success) {
            setEditingKey(null);
            router.refresh();
        }
        setIsSaving(false);
    };

    return (
        <section className="space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    Content Content CMS
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded-full uppercase font-black">Versioning Active</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(policies.length > 0 ? policies : [
                    { id: '1', key: 'terms', title: 'Terms of Service', content: '...', version: 1, updatedAt: new Date().toISOString() },
                    { id: '2', key: 'privacy', title: 'Privacy Policy', content: '...', version: 1, updatedAt: new Date().toISOString() },
                    { id: '3', key: 'faq', title: 'Platform FAQ', content: '...', version: 1, updatedAt: new Date().toISOString() }
                ]).map((policy) => (
                    <div key={policy.key} className="card p-6 bg-black/40 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative min-h-[300px] flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-white">{policy.title}</h3>
                                <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">Key: {policy.key} • v{policy.version}</p>
                            </div>
                            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                                Last Updated: {new Date(policy.updatedAt).toLocaleDateString()}
                            </span>
                        </div>

                        {editingKey === policy.key ? (
                            <div className="flex-1 space-y-4">
                                <input 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:border-primary transition-all"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    aria-label="Policy Title"
                                />
                                <textarea 
                                    className="w-full flex-1 min-h-[200px] bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm font-medium outline-none focus:border-primary transition-all custom-scrollbar"
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    aria-label="Policy Content"
                                />
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        disabled={isSaving}
                                        onClick={handleSave}
                                        className="flex-1 btn btn-primary py-2.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
                                    >
                                        {isSaving ? 'PUBLISHING...' : 'Publish (v' + (policy.version + 1) + ')'}
                                    </button>
                                    <button 
                                        disabled={isSaving}
                                        onClick={() => setEditingKey(null)}
                                        className="btn btn-outline py-2.5 px-4 text-[10px] font-black uppercase tracking-widest border-white/10"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="flex-1 bg-white/[0.02] rounded-xl p-4 overflow-hidden border border-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                                    <p className="text-xs text-slate-400 line-clamp-6 leading-relaxed">
                                        {policy.content}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => startEdit(policy)}
                                    className="mt-6 w-full btn btn-outline border-white/10 text-slate-400 hover:text-white hover:bg-white/5 py-2.5 text-[10px] font-black uppercase tracking-widest"
                                >
                                    Edit Document
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
