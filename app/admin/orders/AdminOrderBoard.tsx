"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    PENDING:          { label: "Pending",    color: "#f97316", bg: "rgba(249,115,22,.1)",   border: "rgba(249,115,22,.25)" },
    PREPARING:        { label: "Preparing",  color: "#fbbf24", bg: "rgba(251,191,36,.1)",   border: "rgba(251,191,36,.25)" },
    READY_FOR_PICKUP: { label: "Ready",      color: "#4dca80", bg: "rgba(77,202,128,.1)",   border: "rgba(77,202,128,.25)" },
    PICKED_UP:        { label: "Picked Up",  color: "#60a5fa", bg: "rgba(96,165,250,.1)",   border: "rgba(96,165,250,.25)" },
    DELIVERED:        { label: "Delivered",  color: "#4dca80", bg: "rgba(77,202,128,.08)",  border: "rgba(77,202,128,.2)"  },
    CANCELLED:        { label: "Cancelled",  color: "#f87171", bg: "rgba(248,113,113,.08)", border: "rgba(248,113,113,.2)" },
};

const STATUS_ORDER = ["PENDING", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "DELIVERED", "CANCELLED"];

export default function AdminOrderBoard({ initialOrders }: { initialOrders: any[] }) {
    const [orders, setOrders] = useState<any[]>(initialOrders);
    const [filterStatus, setFilterStatus] = useState<string>("ACTIVE");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const ch = supabase
            .channel("admin-orders-board")
            .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    setOrders(prev => [payload.new, ...prev]);
                } else if (payload.eventType === "UPDATE") {
                    setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(ch); };
    }, []);

    const filtered = orders.filter(o => {
        if (filterStatus === "ACTIVE") {
            if (!["PENDING", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP"].includes(o.status)) return false;
        } else if (filterStatus !== "ALL") {
            if (o.status !== filterStatus) return false;
        }
        if (search) {
            const q = search.toLowerCase();
            return (
                (o.posReference || "").toLowerCase().includes(q) ||
                (o.restaurant?.name || "").toLowerCase().includes(q) ||
                (o.user?.name || "").toLowerCase().includes(q) ||
                (o.user?.email || "").toLowerCase().includes(q)
            );
        }
        return true;
    });

    const activeCount = orders.filter(o => ["PENDING", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP"].includes(o.status)).length;
    const todayRevenue = orders
        .filter(o => ["DELIVERED", "READY_FOR_PICKUP", "PICKED_UP"].includes(o.status))
        .reduce((s, o) => s + Number(o.total || 0), 0);

    return (
        <>
            <style>{`
                .aob-stat-row { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
                .aob-stat { background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 12px 16px; flex: 1; min-width: 120px; }
                .aob-stat-label { font-size: 10px; color: #555; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; margin-bottom: 4px; }
                .aob-stat-value { font-size: 22px; font-weight: 700; color: #fff; }
                .aob-filters { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; align-items: center; }
                .aob-pill { padding: 7px 13px; border-radius: 7px; font-size: 10px; font-weight: 800; cursor: pointer; border: 1px solid #1e2420; color: #777; background: transparent; letter-spacing: .1em; text-transform: uppercase; transition: all .15s; font-family: inherit; }
                .aob-pill:hover { color: #f97316; border-color: rgba(249,115,22,.35); }
                .aob-pill.active { background: rgba(249,115,22,.08); color: #f97316; border-color: rgba(249,115,22,.35); }
                .aob-search { flex: 1; min-width: 180px; background: #141a18; border: 1px solid #1e2420; border-radius: 8px; padding: 8px 12px; font-size: 12px; color: #fff; outline: none; font-family: inherit; }
                .aob-search::placeholder { color: #444; }
                .aob-table { width: 100%; border-collapse: collapse; }
                .aob-th { font-size: 9px; font-weight: 800; color: #555; text-transform: uppercase; letter-spacing: .14em; padding: 8px 12px; text-align: left; border-bottom: 1px solid #1e2420; }
                .aob-row { border-bottom: 1px solid #111; transition: background .1s; }
                .aob-row:hover { background: rgba(255,255,255,.02); }
                .aob-td { padding: 12px; font-size: 12px; color: #ccc; vertical-align: middle; }
                .aob-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 20px; padding: 3px 9px; font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
                .aob-ref { font-weight: 800; color: #fff; font-size: 11px; }
                .aob-name { font-weight: 700; color: #e0e0e0; }
                .aob-sub { font-size: 10px; color: #555; margin-top: 2px; }
                .aob-total { font-weight: 800; color: #fff; }
                .aob-link { color: #f97316; font-size: 11px; font-weight: 700; text-decoration: none; }
                .aob-link:hover { text-decoration: underline; }
                .aob-empty { text-align: center; padding: 48px; color: #444; font-size: 13px; }
                @media (max-width: 768px) {
                    .aob-hide-mobile { display: none; }
                }
            `}</style>

            {/* Stats row */}
            <div className="aob-stat-row">
                <div className="aob-stat">
                    <div className="aob-stat-label">Active Orders</div>
                    <div className="aob-stat-value" style={{ color: activeCount > 0 ? "#f97316" : "#fff" }}>{activeCount}</div>
                </div>
                <div className="aob-stat">
                    <div className="aob-stat-label">Total Today</div>
                    <div className="aob-stat-value">{orders.length}</div>
                </div>
                <div className="aob-stat">
                    <div className="aob-stat-label">Revenue Today</div>
                    <div className="aob-stat-value">${todayRevenue.toFixed(2)}</div>
                </div>
                <div className="aob-stat">
                    <div className="aob-stat-label">Cancelled</div>
                    <div className="aob-stat-value" style={{ color: "#f87171" }}>
                        {orders.filter(o => o.status === "CANCELLED").length}
                    </div>
                </div>
            </div>

            {/* Filters + search */}
            <div className="aob-filters">
                {["ACTIVE", "ALL", ...STATUS_ORDER].map(s => (
                    <button key={s} className={`aob-pill${filterStatus === s ? " active" : ""}`} onClick={() => setFilterStatus(s)}>
                        {s === "ACTIVE" ? "Red Active" : s === "ALL" ? "All" : STATUS_CONFIG[s]?.label || s}
                    </button>
                ))}
                <input
                    className="aob-search"
                    placeholder="Search by order #, restaurant, customer..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Orders table */}
            <div style={{ background: "#141a18", border: "1px solid #1e2420", borderRadius: 8, overflow: "hidden" }}>
                {filtered.length === 0 ? (
                    <div className="aob-empty">
                        {filterStatus === "ACTIVE" ? "No active orders right now" : "No orders match this filter"}
                    </div>
                ) : (
                    <table className="aob-table">
                        <thead>
                            <tr>
                                <th className="aob-th">Order</th>
                                <th className="aob-th">Status</th>
                                <th className="aob-th">Restaurant</th>
                                <th className="aob-th aob-hide-mobile">Customer</th>
                                <th className="aob-th aob-hide-mobile">Driver</th>
                                <th className="aob-th">Total</th>
                                <th className="aob-th">Time</th>
                                <th className="aob-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(order => {
                                const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG["PENDING"];
                                const age = Math.round((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                                return (
                                    <tr key={order.id} className="aob-row">
                                        <td className="aob-td">
                                            <div className="aob-ref">#{(order.posReference || order.id).slice(-8).toUpperCase()}</div>
                                        </td>
                                        <td className="aob-td">
                                            <span className="aob-badge" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="aob-td">
                                            <div className="aob-name">{order.restaurant?.name || "—"}</div>
                                        </td>
                                        <td className="aob-td aob-hide-mobile">
                                            <div className="aob-name">{order.user?.name || "Guest"}</div>
                                            <div className="aob-sub">{order.user?.email || ""}</div>
                                        </td>
                                        <td className="aob-td aob-hide-mobile">
                                            <div className="aob-name">{order.driver?.user?.name || <span style={{ color: "#444" }}>Unassigned</span>}</div>
                                        </td>
                                        <td className="aob-td">
                                            <span className="aob-total">${Number(order.total || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="aob-td">
                                            <span style={{ color: age > 20 && ["PENDING","PREPARING"].includes(order.status) ? "#f87171" : "#555" }}>
                                                {age < 1 ? "just now" : `${age}m ago`}
                                            </span>
                                        </td>
                                        <td className="aob-td">
                                            <Link href={`/orders/${order.id}`} className="aob-link" target="_blank">
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
