"use client";

import { useState, useEffect, useCallback } from "react";

interface AsanaTask {
    gid: string;
    name: string;
    completed: boolean;
    due_on: string | null;
    assignee: { gid: string; name: string } | null;
    tags: { gid: string; name: string; color: string }[];
    notes: string;
    permalink_url: string;
    created_at: string;
    modified_at: string;
}

interface AsanaSection {
    gid: string;
    name: string;
}

interface BoardData {
    sections: AsanaSection[];
    tasksPerSection: Record<string, AsanaTask[]>;
}

const TAG_COLORS: Record<string, string> = {
    "dark-green": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "dark-blue": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "dark-red": "bg-red-500/20 text-red-400 border-red-500/30",
    "dark-orange": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "dark-purple": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "dark-pink": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "dark-teal": "bg-teal-500/20 text-teal-400 border-teal-500/30",
    "dark-warm-gray": "bg-stone-500/20 text-stone-400 border-stone-500/30",
    "light-green": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "light-blue": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "light-red": "bg-red-500/20 text-red-400 border-red-500/30",
    "light-orange": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "light-purple": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "light-pink": "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "none": "bg-white/10 text-slate-400 border-white/20",
};

const SECTION_ICONS: Record<string, string> = {
    "backlog": "Checklist",
    "to do": "Note",
    "in progress": "Sync",
    "in review": "Search",
    "done": "Done",
    "blocked": "Blocked",
    "qa": "Test",
    "ready for qa": "Test",
    "ready for deploy": "Launch",
    "deployed": "Green",
};

function getSectionIcon(name: string): string {
    const lower = name.toLowerCase().replace(":", "").trim();
    for (const [key, icon] of Object.entries(SECTION_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return "Pin";
}

function getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function getDueBadge(dueOn: string | null): { text: string; className: string } | null {
    if (!dueOn) return null;
    const now = new Date();
    const due = new Date(dueOn + "T23:59:59");
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, className: "bg-red-500/20 text-red-400 border-red-500/30" };
    if (diffDays === 0) return { text: "Due today", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    if (diffDays <= 2) return { text: `Due in ${diffDays}d`, className: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    return { text: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }), className: "bg-white/5 text-slate-500 border-white/10" };
}

export default function AsanaBoard() {
    const [board, setBoard] = useState<BoardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [newTaskName, setNewTaskName] = useState("");
    const [newTaskSection, setNewTaskSection] = useState("");
    const [newTaskNotes, setNewTaskNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [completingTask, setCompletingTask] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"board" | "list">("board");
    const [filterAssignee, setFilterAssignee] = useState<string>("all");

    const fetchBoard = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/asana?action=board");
            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.error || "Failed to fetch board");
            }
            const data = await res.json();
            setBoard(data);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBoard();
        // Poll every 60s
        const interval = setInterval(fetchBoard, 60000);
        return () => clearInterval(interval);
    }, [fetchBoard]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;
        setSubmitting(true);
        try {
            await fetch("/api/asana", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create",
                    name: newTaskName.trim(),
                    notes: newTaskNotes.trim(),
                    section: newTaskSection || undefined,
                }),
            });
            setNewTaskName("");
            setNewTaskNotes("");
            setNewTaskSection("");
            setCreating(false);
            fetchBoard();
        } catch {
            // silent
        } finally {
            setSubmitting(false);
        }
    };

    const handleComplete = async (taskGid: string, completed: boolean) => {
        setCompletingTask(taskGid);
        try {
            await fetch("/api/asana", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "complete", taskGid, completed }),
            });
            fetchBoard();
        } catch {
            // silent
        } finally {
            setCompletingTask(null);
        }
    };

    // Get all unique assignees for filter
    const allAssignees = board
        ? [...new Map(
            Object.values(board.tasksPerSection)
                .flat()
                .filter((t) => t.assignee)
                .map((t) => [t.assignee!.gid, t.assignee!.name])
        ).entries()].map(([gid, name]) => ({ gid, name }))
        : [];

    // Stats
    const totalTasks = board ? Object.values(board.tasksPerSection).flat().length : 0;
    const completedTasks = board ? Object.values(board.tasksPerSection).flat().filter(t => t.completed).length : 0;
    const overdueTasks = board ? Object.values(board.tasksPerSection).flat().filter(t => {
        if (!t.due_on || t.completed) return false;
        return new Date(t.due_on) < new Date();
    }).length : 0;

    const boardSections = board
        ? board.sections.map((section) => {
            const tasks = (board.tasksPerSection[section.gid] || [])
                .filter((task) => filterAssignee === "all" || task.assignee?.gid === filterAssignee);
            return {
                section,
                tasks,
                incompleteTasks: tasks.filter((task) => !task.completed),
            };
        })
        : [];

    const listTasks = board
        ? boardSections.flatMap(({ section, tasks }) =>
            tasks.map((task) => ({ section, task }))
        )
        : [];

    const totalVisibleTasks = boardSections.reduce((sum, entry) => sum + entry.tasks.length, 0);

    if (loading && !board) {
        return (
            <section className="adm-card mb-16">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-[26px] md:text-[30px] font-black italic tracking-tight text-white flex items-baseline gap-3">
                            Asana <span className="not-italic text-[#f97316]">Board</span>
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.42em] text-[#667084] mt-2">Task management and operational oversight</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((index) => (
                        <div key={index} className="bg-[#101613] border border-[#1e2420] rounded-lg p-4 animate-pulse">
                            <div className="h-3 bg-white/10 rounded-full w-24 mb-5" />
                            <div className="space-y-3">
                                <div className="h-16 bg-white/5 rounded-md" />
                                <div className="h-16 bg-white/5 rounded-md" />
                                <div className="h-16 bg-white/5 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="adm-card mb-16">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-[26px] md:text-[30px] font-black italic tracking-tight text-white flex items-baseline gap-3">
                            Asana <span className="not-italic text-[#f97316]">Board</span>
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.42em] text-[#667084] mt-2">Task management and operational oversight</p>
                    </div>
                </div>
                <div className="bg-[#101613] border border-[#431212] rounded-lg p-6 text-center">
                    <p className="text-[#f97316] text-sm font-bold mb-2">Failed to load Asana board</p>
                    <p className="text-[#6b7280] text-xs mb-4">{error}</p>
                    <button
                        onClick={fetchBoard}
                        className="text-[10px] font-black uppercase tracking-[0.18em] px-4 py-2 bg-[#f97316] hover:bg-[#fb923c] text-[#0a0c09] border border-[#f97316] rounded-md transition-all"
                    >
                        Retry
                    </button>
                </div>
            </section>
        );
    }

    if (!board) return null;

    return (
        <section className="adm-card mb-16 asana-board-shell">
            <style>{`
                .asana-board-shell {
                    background: #141a18 !important;
                    border: 1px solid #1e2420 !important;
                    border-radius: 8px !important;
                    padding: 18px !important;
                }
                .asana-header {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    margin-bottom: 14px;
                }
                .asana-heading {
                    min-width: 280px;
                }
                .asana-title {
                    font-size: 30px;
                    line-height: 1;
                    font-weight: 900;
                    font-style: italic;
                    letter-spacing: -0.02em;
                    color: #fff;
                    margin: 0;
                    display: flex;
                    align-items: baseline;
                    gap: 12px;
                }
                .asana-title span {
                    color: #f97316;
                    font-style: normal;
                }
                .asana-subtitle {
                    margin-top: 8px;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.42em;
                    text-transform: uppercase;
                    color: #667084;
                }
                .asana-controls {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 10px;
                }
                .asana-stat {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    border: 1px solid #1e2420;
                    background: #101613;
                    color: #9ca3af;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    white-space: nowrap;
                }
                .asana-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 999px;
                    flex-shrink: 0;
                }
                .asana-dot--green { background: #10b981; }
                .asana-dot--red { background: #ef4444; }
                .asana-toggle {
                    display: inline-flex;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    overflow: hidden;
                    background: #101613;
                }
                .asana-toggle button,
                .asana-btn,
                .asana-link,
                .asana-mini-btn {
                    border: none;
                    outline: none;
                    font-family: inherit;
                    transition: all 150ms ease;
                }
                .asana-toggle button {
                    padding: 8px 12px;
                    background: transparent;
                    color: #7a8087;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    cursor: pointer;
                }
                .asana-toggle button:hover {
                    color: #fff;
                }
                .asana-toggle button.active {
                    background: #f97316;
                    color: #0a0c09;
                }
                .asana-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 9px 14px;
                    border-radius: 8px;
                    cursor: pointer;
                    white-space: nowrap;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                }
                .asana-btn--accent {
                    background: #f97316;
                    color: #0a0c09;
                    border: 1px solid #f97316;
                }
                .asana-btn--accent:hover {
                    background: #fb923c;
                    border-color: #fb923c;
                }
                .asana-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 9px 14px;
                    border-radius: 8px;
                    border: 1px solid #1e2420;
                    background: #101613;
                    color: #c7ccd1;
                    text-decoration: none;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                }
                .asana-link:hover {
                    color: #fff;
                    border-color: rgba(249, 115, 22, 0.35);
                }
                .asana-filter {
                    min-width: 180px;
                    padding: 9px 12px;
                    border-radius: 8px;
                    border: 1px solid #1e2420;
                    background: #101613;
                    color: #e5e7eb;
                    font-size: 12px;
                    outline: none;
                }
                .asana-filter:focus {
                    border-color: rgba(249, 115, 22, 0.55);
                }
                .asana-create {
                    margin: 18px 0;
                    padding: 14px;
                    border-radius: 8px;
                    border: 1px solid #1e2420;
                    background: #101613;
                }
                .asana-create-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) 240px;
                    gap: 10px;
                }
                .asana-input,
                .asana-select,
                .asana-textarea {
                    width: 100%;
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    background: #0d110f;
                    color: #fff;
                    padding: 11px 12px;
                    font-size: 13px;
                    outline: none;
                }
                .asana-textarea {
                    min-height: 88px;
                    resize: vertical;
                }
                .asana-input::placeholder,
                .asana-textarea::placeholder {
                    color: #667084;
                }
                .asana-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 10px;
                    flex-wrap: wrap;
                }
                .asana-btn--muted {
                    background: #101613;
                    color: #7a8087;
                    border: 1px solid #1e2420;
                }
                .asana-btn--muted:hover {
                    color: #fff;
                    border-color: rgba(249, 115, 22, 0.25);
                }
                .asana-btn--disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .asana-columns,
                .asana-list {
                    border: 1px solid #1e2420;
                    background: #101613;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .asana-columns {
                    display: flex;
                    gap: 1px;
                    overflow-x: auto;
                }
                .asana-column {
                    flex: 0 0 320px;
                    min-height: 420px;
                    background: #0d110f;
                    display: flex;
                    flex-direction: column;
                }
                .asana-column__head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 12px 14px;
                    border-bottom: 1px solid #1e2420;
                }
                .asana-column__name {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #f97316;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    font-style: italic;
                }
                .asana-column__count {
                    color: #667084;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                }
                .asana-task-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px;
                }
                .asana-task {
                    border: 1px solid #1e2420;
                    border-radius: 8px;
                    background: #121816;
                    padding: 12px;
                    transition: border-color 150ms ease, background 150ms ease;
                }
                .asana-task:hover {
                    border-color: rgba(249, 115, 22, 0.35);
                    background: #131b18;
                }
                .asana-task__title {
                    margin: 0;
                    color: #e5e7eb;
                    font-size: 13px;
                    font-weight: 700;
                    line-height: 1.4;
                    letter-spacing: -0.01em;
                }
                .asana-task__meta {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 10px;
                    margin-top: 10px;
                }
                .asana-task__assignee {
                    color: #667084;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }
                .asana-task__badges {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }
                .asana-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 7px;
                    border-radius: 999px;
                    border: 1px solid #1e2420;
                    background: #0d110f;
                    color: #9ca3af;
                    font-size: 8px;
                    font-weight: 900;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                }
                .asana-complete {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    border: 1px solid #1e2420;
                    background: #0d110f;
                    color: #d1d5db;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 150ms ease;
                }
                .asana-complete:hover {
                    border-color: rgba(16, 185, 129, 0.45);
                    background: rgba(16, 185, 129, 0.08);
                    color: #a7f3d0;
                }
                .asana-empty {
                    padding: 72px 16px;
                    text-align: center;
                    color: #667084;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                }
                .asana-list {
                    display: flex;
                    flex-direction: column;
                }
                .asana-list-item {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 12px;
                    padding: 14px 16px;
                    border-bottom: 1px solid #1e2420;
                    background: #0d110f;
                }
                .asana-list-item:last-child {
                    border-bottom: none;
                }
                .asana-list-item__section {
                    color: #f97316;
                    font-size: 9px;
                    font-weight: 900;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                }
                .asana-list-item__title {
                    color: #e5e7eb;
                    font-size: 13px;
                    font-weight: 700;
                    line-height: 1.4;
                }
                .asana-list-item__meta {
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .asana-list-item__actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .asana-list-item__complete {
                    margin-top: 2px;
                }
                @media (max-width: 1024px) {
                    .asana-column {
                        flex-basis: 290px;
                    }
                    .asana-create-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 768px) {
                    .asana-board-shell {
                        padding: 14px !important;
                    }
                    .asana-title {
                        font-size: 24px;
                    }
                    .asana-controls {
                        justify-content: flex-start;
                    }
                    .asana-column {
                        flex-basis: 270px;
                    }
                    .asana-list-item {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="asana-header">
                <div className="asana-heading">
                    <h2 className="asana-title">Asana <span>Board</span></h2>
                    <p className="asana-subtitle">Task management and operational oversight</p>
                </div>

                <div className="asana-controls">
                    <div className="asana-stat">
                        <span className="asana-dot asana-dot--green" />
                        {completedTasks} done
                    </div>
                    <div className="asana-stat">
                        <span className="asana-dot asana-dot--red" />
                        {overdueTasks} overdue
                    </div>

                    {allAssignees.length > 0 && (
                        <select
                            value={filterAssignee}
                            onChange={(event) => setFilterAssignee(event.target.value)}
                            className="asana-filter"
                            aria-label="Filter by assignee"
                        >
                            <option value="all">All assignees</option>
                            {allAssignees.map((assignee) => (
                                <option key={assignee.gid} value={assignee.gid}>
                                    {assignee.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="asana-toggle" role="tablist" aria-label="Asana board view mode">
                        <button
                            type="button"
                            onClick={() => setViewMode("board")}
                            className={viewMode === "board" ? "active" : ""}
                        >
                            Board
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={viewMode === "list" ? "active" : ""}
                        >
                            List
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setCreating(!creating)}
                        className="asana-btn asana-btn--accent"
                    >
                        + New Task
                    </button>

                    <a
                        href="https://app.asana.com/0/1213802368265152/board"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="asana-link"
                    >
                        Open in Asana Open
                    </a>
                </div>
            </div>

            {creating && (
                <div className="asana-create">
                    <form onSubmit={handleCreate}>
                        <div className="asana-create-grid">
                            <input
                                type="text"
                                value={newTaskName}
                                onChange={(event) => setNewTaskName(event.target.value)}
                                placeholder="Task name"
                                className="asana-input"
                                autoFocus
                            />
                            <select
                                value={newTaskSection}
                                onChange={(event) => setNewTaskSection(event.target.value)}
                                className="asana-select"
                                aria-label="Select task section"
                            >
                                <option value="">Select section...</option>
                                {board.sections.map((section) => (
                                    <option key={section.gid} value={section.gid}>
                                        {section.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <textarea
                                value={newTaskNotes}
                                onChange={(event) => setNewTaskNotes(event.target.value)}
                                placeholder="Task notes, context, links, or QA details"
                                className="asana-textarea"
                            />
                        </div>

                        <div className="asana-actions">
                            <button
                                type="submit"
                                disabled={submitting || !newTaskName.trim()}
                                className={`asana-btn asana-btn--accent ${submitting || !newTaskName.trim() ? "asana-btn--disabled" : ""}`}
                            >
                                {submitting ? "Creating..." : "Create Task"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreating(false)}
                                className="asana-btn asana-btn--muted"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {viewMode === "board" ? (
                <div className="asana-columns">
                    {boardSections.map(({ section, incompleteTasks }) => (
                        <div key={section.gid} className="asana-column">
                            <div className="asana-column__head">
                                <div className="asana-column__name">
                                    <span>{getSectionIcon(section.name)}</span>
                                    <span>{section.name.replace(":", "")}</span>
                                </div>
                                <span className="asana-column__count">{incompleteTasks.length}</span>
                            </div>

                            <div className="asana-task-list">
                                {incompleteTasks.map((task) => {
                                    const dueBadge = getDueBadge(task.due_on);
                                    return (
                                        <article key={task.gid} className="asana-task">
                                            <p className="asana-task__title">{task.name}</p>
                                            <div className="asana-task__meta">
                                                <div className="asana-task__badges">
                                                    <span className="asana-task__assignee">
                                                        {task.assignee?.name || "Unassigned"}
                                                    </span>
                                                    {dueBadge && <span className={`asana-badge ${dueBadge.className}`}>{dueBadge.text}</span>}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleComplete(task.gid, true)}
                                                    className="asana-complete"
                                                    aria-label={`Mark ${task.name} complete`}
                                                    disabled={completingTask === task.gid}
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}

                                {incompleteTasks.length === 0 && (
                                    <div className="asana-empty">No tasks</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="asana-list">
                    {listTasks.map(({ section, task }) => {
                        const dueBadge = getDueBadge(task.due_on);
                        return (
                            <div key={task.gid} className="asana-list-item">
                                <div>
                                    <div className="asana-list-item__section">{section.name.replace(":", "")}</div>
                                    <div className="asana-list-item__title">{task.name}</div>
                                    <div className="asana-list-item__meta">
                                        <span className="asana-task__assignee">{task.assignee?.name || "Unassigned"}</span>
                                        {dueBadge && <span className={`asana-badge ${dueBadge.className}`}>{dueBadge.text}</span>}
                                    </div>
                                </div>
                                <div className="asana-list-item__actions">
                                    <button
                                        type="button"
                                        onClick={() => handleComplete(task.gid, true)}
                                        className="asana-complete asana-list-item__complete"
                                        aria-label={`Mark ${task.name} complete`}
                                        disabled={completingTask === task.gid}
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-[#667084]">
                {totalVisibleTasks} visible tasks · {board.sections.length} sections · synced with Asana
            </div>
        </section>
    );
}
