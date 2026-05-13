/**
 * ClickUp API Client — Server-side only
 * Uses Personal API Token from environment variables.
 */

const CLICKUP_BASE = "https://api.clickup.com/api/v2";

function getToken(): string {
    const token = process.env.CLICKUP_API_TOKEN;
    if (!token) throw new Error("CLICKUP_API_TOKEN is not set in environment variables.");
    return token;
}

async function clickupFetch(path: string, options: RequestInit = {}) {
    const res = await fetch(`${CLICKUP_BASE}${path}`, {
        ...options,
        headers: {
            "Authorization": getToken(),
            "Content-Type": "application/json",
            ...options.headers,
        },
        next: { revalidate: 0 },
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`ClickUp API Error [${res.status}]: ${body}`);
        throw new Error(`ClickUp API Error: ${res.status}`);
    }

    return res.json();
}

// ────────────────────────────────────────
// Types
// ────────────────────────────────────────

export interface ClickUpTask {
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
    list: { id: string; name: string };
}

export interface ClickUpList {
    id: string;
    name: string;
    status?: { status: string; color: string };
}

export interface ClickUpMember {
    user: {
        id: number;
        username: string;
        email: string;
        profilePicture: string | null;
    };
}

// ────────────────────────────────────────
// Lists (columns on the board)
// ────────────────────────────────────────

export async function getSpaceLists(spaceId: string): Promise<ClickUpList[]> {
    const { lists } = await clickupFetch(`/space/${spaceId}/list`);
    return lists;
}

export async function getFolderLists(folderId: string): Promise<ClickUpList[]> {
    const { lists } = await clickupFetch(`/folder/${folderId}/list`);
    return lists;
}

// ────────────────────────────────────────
// Tasks
// ────────────────────────────────────────

export async function getListTasks(listId: string): Promise<ClickUpTask[]> {
    const { tasks } = await clickupFetch(
        `/list/${listId}/task?include_closed=true&subtasks=false`
    );
    return tasks;
}

export async function createTask(listId: string, taskData: {
    name: string;
    description?: string;
    due_date?: number; // unix ms
    assignees?: number[];
    priority?: number; // 1=urgent 2=high 3=normal 4=low
    status?: string;
    tags?: string[];
}): Promise<ClickUpTask> {
    const body: any = { name: taskData.name };
    if (taskData.description) body.description = taskData.description;
    if (taskData.due_date)    body.due_date = taskData.due_date;
    if (taskData.assignees)   body.assignees = taskData.assignees;
    if (taskData.priority)    body.priority = taskData.priority;
    if (taskData.status)      body.status = taskData.status;
    if (taskData.tags)        body.tags = taskData.tags;

    const task = await clickupFetch(`/list/${listId}/task`, {
        method: "POST",
        body: JSON.stringify(body),
    });
    return task;
}

export async function updateTask(taskId: string, updates: {
    name?: string;
    description?: string;
    status?: string;
    priority?: number;
    due_date?: number;
}): Promise<ClickUpTask> {
    const task = await clickupFetch(`/task/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
    });
    return task;
}

// ────────────────────────────────────────
// Team members
// ────────────────────────────────────────

export async function getTeamMembers(teamId: string): Promise<ClickUpMember[]> {
    const { members } = await clickupFetch(`/team/${teamId}`);
    return members;
}

// ────────────────────────────────────────
// Board view — all lists + their tasks
// ────────────────────────────────────────

export async function getBoardData(spaceId: string) {
    const lists = await getSpaceLists(spaceId);
    const tasksPerList: Record<string, ClickUpTask[]> = {};
    await Promise.all(
        lists.map(async (list) => {
            tasksPerList[list.id] = await getListTasks(list.id);
        })
    );
    return { lists, tasksPerList };
}
