'use client';

import { useState, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { SavedAddress } from './actions';
import { saveAddress, deleteAddress, setDefaultAddress } from './actions';

const LABEL_OPTIONS = ['Home', 'Work', 'Other', 'Custom'] as const;
type LabelOption = (typeof LABEL_OPTIONS)[number];

interface FormState {
    id: string;
    label: LabelOption;
    customLabel: string;
    address: string;
    notes: string;
    isDefault: boolean;
}

const emptyForm = (): FormState => ({
    id: uuidv4(),
    label: 'Home',
    customLabel: '',
    address: '',
    notes: '',
    isDefault: false,
});

interface Props {
    userId: string;
    initialAddresses: SavedAddress[];
}

export default function AddressBookClient({ userId, initialAddresses }: Props) {
    const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm());
    const [errorMsg, setErrorMsg] = useState('');
    const [isPending, startTransition] = useTransition();

    function openAddForm() {
        setEditingId(null);
        setForm(emptyForm());
        setErrorMsg('');
        setShowForm(true);
    }

    function openEditForm(addr: SavedAddress) {
        const isCustom = !(LABEL_OPTIONS.slice(0, 3) as readonly string[]).includes(addr.label);
        setEditingId(addr.id);
        setForm({
            id: addr.id,
            label: isCustom ? 'Custom' : (addr.label as LabelOption),
            customLabel: isCustom ? addr.label : '',
            address: addr.address,
            notes: addr.notes || '',
            isDefault: addr.isDefault,
        });
        setErrorMsg('');
        setShowForm(true);
    }

    function cancelForm() {
        setShowForm(false);
        setEditingId(null);
        setErrorMsg('');
    }

    function handleSave() {
        const resolvedLabel = form.label === 'Custom' ? form.customLabel.trim() : form.label;
        if (!resolvedLabel) {
            setErrorMsg('Please enter a label for this address.');
            return;
        }
        if (!form.address.trim()) {
            setErrorMsg('Please enter a delivery address.');
            return;
        }

        const payload: SavedAddress = {
            id: form.id,
            label: resolvedLabel,
            address: form.address.trim(),
            notes: form.notes.trim() || undefined,
            isDefault: form.isDefault,
        };

        startTransition(async () => {
            const result = await saveAddress(userId, payload);
            if (result.success && result.addresses) {
                setAddresses(result.addresses);
                setShowForm(false);
                setEditingId(null);
                setErrorMsg('');
            } else {
                setErrorMsg(result.error ?? 'Failed to save address. Please try again.');
            }
        });
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            const result = await deleteAddress(userId, id);
            if (result.success && result.addresses) {
                setAddresses(result.addresses);
                if (editingId === id) {
                    setShowForm(false);
                    setEditingId(null);
                }
            } else {
                setErrorMsg(result.error ?? 'Failed to delete address.');
            }
        });
    }

    function handleSetDefault(id: string) {
        startTransition(async () => {
            const result = await setDefaultAddress(userId, id);
            if (result.success && result.addresses) {
                setAddresses(result.addresses);
            } else {
                setErrorMsg(result.error ?? 'Failed to update default address.');
            }
        });
    }

    return (
        <div>
            {/* Address List */}
            {addresses.length === 0 && !showForm ? (
                <div
                    className="food-auth-note"
                    style={{ textAlign: 'center', padding: '32px 24px' }}
                >
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                        No saved addresses yet. Add one to speed up checkout.
                    </p>
                    <button className="btn btn-gold" onClick={openAddForm} disabled={isPending}>
                        + Add First Address
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className="food-card"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '16px',
                                padding: '20px 24px',
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            color: '#E8A230',
                                        }}
                                    >
                                        {addr.label}
                                    </span>
                                    {addr.isDefault && (
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                background: 'rgba(34,197,94,0.15)',
                                                color: '#4ade80',
                                                border: '1px solid rgba(34,197,94,0.3)',
                                                borderRadius: '4px',
                                                padding: '2px 8px',
                                                letterSpacing: '0.04em',
                                            }}
                                        >
                                            Default
                                        </span>
                                    )}
                                </div>
                                <p
                                    style={{
                                        fontSize: '15px',
                                        color: 'rgba(255,255,255,0.85)',
                                        lineHeight: 1.5,
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {addr.address}
                                </p>
                                {addr.notes && (
                                    <p
                                        style={{
                                            marginTop: '8px',
                                            fontSize: '13px',
                                            color: 'rgba(255,255,255,0.55)',
                                            lineHeight: 1.5,
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        Notes: {addr.notes}
                                    </p>
                                )}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    flexShrink: 0,
                                    alignItems: 'flex-end',
                                }}
                            >
                                <button
                                    className="btn btn-ghost"
                                    style={{ padding: '6px 14px', fontSize: '13px' }}
                                    onClick={() => openEditForm(addr)}
                                    disabled={isPending}
                                >
                                    Edit
                                </button>
                                {!addr.isDefault && (
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: '6px 14px', fontSize: '13px' }}
                                        onClick={() => handleSetDefault(addr.id)}
                                        disabled={isPending}
                                    >
                                        Set Default
                                    </button>
                                )}
                                <button
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid rgba(239,68,68,0.4)',
                                        color: 'rgba(239,68,68,0.8)',
                                        borderRadius: '8px',
                                        padding: '6px 14px',
                                        fontSize: '13px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                    }}
                                    onClick={() => handleDelete(addr.id)}
                                    disabled={isPending}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New button (shown when list is not empty) */}
            {addresses.length > 0 && !showForm && (
                <div style={{ marginTop: '20px' }}>
                    <button className="btn btn-gold" onClick={openAddForm} disabled={isPending}>
                        + Add New Address
                    </button>
                </div>
            )}

            {/* Inline Add / Edit Form */}
            {showForm && (
                <div
                    className="food-panel"
                    style={{ marginTop: '24px', padding: '28px 24px' }}
                >
                    <p className="food-kicker" style={{ marginBottom: '12px' }}>
                        {editingId ? 'Edit Address' : 'New Address'}
                    </p>
                    <h3 className="food-heading" style={{ fontSize: '22px', marginBottom: '20px' }}>
                        {editingId ? 'Update Delivery Address' : 'Add Delivery Address'}
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Label dropdown */}
                        <div className="fg">
                            <label>Label</label>
                            <select
                                value={form.label}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, label: e.target.value as LabelOption }))
                                }
                                style={{
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: '10px',
                                    color: 'white',
                                    padding: '12px 14px',
                                    fontSize: '15px',
                                    width: '100%',
                                    appearance: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {LABEL_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt} style={{ background: '#1a1a2e', color: 'white' }}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Custom label (only when Custom is selected) */}
                        {form.label === 'Custom' && (
                            <div className="fg">
                                <label>Custom Label</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Gym, Parents, Office 2"
                                    value={form.customLabel}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, customLabel: e.target.value }))
                                    }
                                    maxLength={30}
                                />
                            </div>
                        )}

                        {/* Address input — full width */}
                        <div className="fg md:col-span-2">
                            <label>Delivery Address</label>
                            <input
                                type="text"
                                placeholder="123 Main St, City, State, ZIP"
                                value={form.address}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, address: e.target.value }))
                                }
                            />
                        </div>

                        <div className="fg md:col-span-2">
                            <label>Delivery Notes (Optional)</label>
                            <textarea
                                placeholder="Gate code, call box instructions, or leave-at-door details"
                                value={form.notes}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, notes: e.target.value }))
                                }
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Set as default checkbox */}
                    <label
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '16px',
                            cursor: 'pointer',
                            userSelect: 'none',
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, isDefault: e.target.checked }))
                            }
                            style={{
                                width: '18px',
                                height: '18px',
                                accentColor: '#E8A230',
                                cursor: 'pointer',
                            }}
                        />
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>
                            Set as default delivery address
                        </span>
                    </label>

                    {/* Error message */}
                    {errorMsg && (
                        <div
                            style={{
                                marginTop: '14px',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: 'rgba(239,68,68,0.9)',
                                fontSize: '14px',
                            }}
                        >
                            {errorMsg}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-gold"
                            onClick={handleSave}
                            disabled={isPending}
                        >
                            {isPending ? 'Saving…' : 'Save Address'}
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={cancelForm}
                            disabled={isPending}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
