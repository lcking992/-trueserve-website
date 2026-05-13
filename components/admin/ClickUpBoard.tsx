"use client";

import { useState, useEffect, useCallback } from "react";

interface ClickUpTask {
    id: string;
    name: string;
    description: string;
    status: { status: string; color: string };
    priority: { id: string; priority: string; color: string } | null;
    due_date: string | null;
    assignees: { id: number; username: string; profilePicture: string | null }[];
    tags: { name: string; tag_fg: string; tag_bg: string }[];
    date_created: string;
    date_updated: string;
    url: string;
}

interface ClickUpList {
    id: string;
    name: string;
}

interface BoardData {
    lists: ClickUpList[];
    tasksPerList: Record<string, ClickUpTask[]>;
}

const STATUS_ICONS: Record<string, string> = {
    "backlog":        "📋",
    "to do":          "📝",
    "in progress":    "🔄",
    "in review":      "🔍",
    "qa":             "🧪",
    "ready for qa":   "🧪",
    "ready for deploy": "🚀",
    "done":           "✅",
    "closed":         "✅",
    "blocked":        "🚫",
};

const PRIORITY_STYLES: Record<string, string> = {
    urgent: "text-red-400 bg-red-500/10 border-red-500/30",
    high:   "text-orange-400 bg-orange-500/10 border-orange-500/30",
    normal: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    low:    "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

function getListIcon(name: string): string {
    return STATUS_ICONS[name.toLowerCase()] ?? "📁";
}

function formatDate(ts: string | null): string {
    if (!ts) return "";
    return new Date(Number(ts)).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isPastDue(ts: string | null): boolean {
    if (!ts) return false;
    return Number(ts) < Date.now();
}

export default function ClickUpBoard() {
    const [board, setBoard] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [newTask, setNewTask] = useState({ name: "", description: "", listId: "" });
    const [submitting, setSubmitting] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const fetchBoard = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/clickup?action=board");
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setBoard(data);
            if (!newTask.listId && data.lists?.length) {
                setNewTask(prev => ({ ...prev, listId: data.lists[0].id }));
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBoard(); }, [fetchBoard]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.name.trim() || !newTask.listId) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/clickup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create", ...newTask }),
            });
            if (!res.ok) throw new Error("Failed to create task");
            setNewTask(prev => ({ ...prev, name: "", description: "" }));
            setShowForm(false);
            await fetchBoard();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const allTasks = board
        ? Object.values(board.tasksPerList).flat()
        : [];

    const totalOpen = allTasks.filter(
        t => !["done", "closed"].includes(t.status.status.toLowerCase())
    ).length;

    const totalDone = allTasks.filter(
        t => ["done", "closed"].includes(t.status.status.toLowerCase())
    ).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-white/40 gap-3">
                <div className="w-4 h-4 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
                Loading ClickUp board…
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                <p className="text-red-400 font-bold mb-1">Failed to load ClickUp board</p>
                <p className="text-white/40 text-sm mb-4">{error}</p>
                <p className="text-white/30 text-xs mb-4">
                    Make sure <code className="text-[#f97316]">CLICKUP_API_TOKEN</code> and{" "}
                    <code className="text-[#f97316]">CLICKUP_SPACE_ID</code> are set in Vercel env vars.
                </p>
                <button
                    onClick={fetchBoard}
                    className="px-4 py-2 rounded-lg bg-[#f97316] text-black text-sm font-bold"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!board) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-white">ClickUp Board</h2>
                    <span className="text-xs text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1">
                        {totalOpen} open · {totalDone} done
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchBoard}
                        className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white hover:border-white/20 transition-colors"
                    >
                        ↻ Refresh
                    </button>
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="px-3 py-1.5 rounded-lg bg-[#f97316] text-black text-xs font-bold hover:bg-[#ea6c0a] transition-colors"
                    >
                        + New Task
                    </button>
                </div>
            </div>

            {/* New Task Form */}
            {showForm && (
                <form
                    onSubmit={handleCreateTask}
                    className="rounded-xl border border-[#f97316]/30 bg-[#f97316]/5 p-4 space-y-3"
                >
                    <div className="flex gap-3 flex-wrap">
                        <input
                            type="text"
                            placeholder="Task name"
                            value={newTask.name}
                            onChange={e => setNewTask(p => ({ ...p, name: e.target.value }))}
                            className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#f97316]/50"
                            required
                        />
                        <select
                            value={newTask.listId}
                            onChange={e => setNewTask(p => ({ ...p, listId: e.target.value }))}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#f97316]/50"
                        >
                            {board.lists.map(l => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={newTask.description}
                        onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#f97316]/50"
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-[#f97316] text-black text-sm font-bold rounded-lg disabled:opacity-50"
                        >
                            {submitting ? "Creating…" : "Create Task"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border border-white/10 text-white/50 text-sm rounded-lg hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Board columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
                {board.lists.map((list) => {
                    const tasks = board.tasksPerList[list.id] ?? [];
                    return (
                        <div
                            key={list.id}
                            className="rounded-xl border border-white/8 bg-white/3 overflow-hidden"
                        >
                            {/* Column header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-white/4">
                                <div className="flex items-center gap-2">
                                    <span>{getListIcon(list.name)}</span>
                                    <span className="text-sm font-bold text-white">{list.name}</span>
                                </div>
                                <span className="text-xs text-white/30 bg-white/5 rounded-full px-2 py-0.5">
                                    {tasks.length}
                                </span>
                            </div>

                            {/* Tasks */}
                            <div className="p-2 space-y-2 max-h-[520px] overflow-y-auto">
                                {tasks.length === 0 && (
                                    <p className="text-center text-white/20 text-xs py-6">No tasks</p>
                                )}
                                {tasks.map((task) => {
                                    const isExpanded = expandedTask === task.id;
                                    const overdue = isPastDue(task.due_date) &&
                                        !["done", "closed"].includes(task.status.status.toLowerCase());
                                    return (
                                        <div
                                            key={task.id}
                                            className="rounded-lg border border-white/8 bg-[#0d1117] p-3 cursor-pointer hover:border-white/15 transition-all"
                                            onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm text-white font-medium leading-snug flex-1">
                                                    {task.name}
                                                </p>
                                                {task.priority && (
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider border rounded-full px-1.5 py-0.5 whitespace-nowrap ${PRIORITY_STYLES[task.priority.priority] ?? PRIORITY_STYLES.normal}`}>
                                                        {task.priority.priority}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center flex-wrap gap-1.5 mt-2">
                                                {/* Status pill */}
                                                <span
                                                    className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5"
                                                    style={{
                                                        background: task.status.color + "22",
                                                        color: task.status.color,
                                                        border: `1px solid ${task.status.color}44`,
                                                    }}
                                                >
                                                    {task.status.status}
                                                </span>

                                                {/* Due date */}
                                                {task.due_date && (
                                                    <span className={`text-[10px] font-medium ${overdue ? "text-red-400" : "text-white/40"}`}>
                                                        {overdue ? "⚠ " : ""}
                                                        {formatDate(task.due_date)}
                                                    </span>
                                                )}

                                                {/* Tags */}
                                                {task.tags.slice(0, 2).map(tag => (
                                                    <span
                                                        key={tag.name}
                                                        className="text-[9px] font-bold uppercase tracking-wider rounded-full px-1.5 py-0.5"
                                                        style={{ background: tag.tag_bg + "33", color: tag.tag_fg, border: `1px solid ${tag.tag_bg}55` }}
                                                    >
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Assignees */}
                                            {task.assignees.length > 0 && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    {task.assignees.slice(0, 3).map(a => (
                                                        a.profilePicture
                                                            ? <img key={a.id} src={a.profilePicture} alt={a.username} className="w-5 h-5 rounded-full border border-white/10" />
                                                            : <span key={a.id} className="w-5 h-5 rounded-full bg-[#f97316]/20 border border-[#f97316]/30 flex items-center justify-center text-[9px] font-bold text-[#f97316]">
                                                                {a.username[0]?.toUpperCase()}
                                                              </span>
                                                    ))}
                                                    {task.assignees.length > 3 && (
                                                        <span className="text-[10px] text-white/30">+{task.assignees.length - 3}</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Expanded: description + link */}
                                            {isExpanded && (
                                                <div className="mt-3 pt-3 border-t border-white/8 space-y-2">
                                                    {task.description && (
                                                        <p className="text-xs text-white/50 leading-relaxed">
                                                            {task.description.slice(0, 300)}
                                                            {task.description.length > 300 ? "…" : ""}
                                                        </p>
                                                    )}
                                                    <a
                                                        href={task.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[10px] text-[#f97316] hover:underline"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        Open in ClickUp ↗
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
