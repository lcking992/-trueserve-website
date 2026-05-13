import { NextRequest, NextResponse } from "next/server";
import {
    getSpaceLists,
    getListTasks,
    getBoardData,
    createTask,
    updateTask,
    getTeamMembers,
} from "@/lib/clickup";
import { getAuthSession } from "@/app/auth/actions";
import { isInternalStaff } from "@/lib/rbac";
import { cookies } from "next/headers";

const SPACE_ID  = process.env.CLICKUP_SPACE_ID  || "";
const LIST_ID   = process.env.CLICKUP_LIST_ID   || "";
const TEAM_ID   = process.env.CLICKUP_TEAM_ID   || "";

async function isAuthorized() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    const { isAuth, role } = await getAuthSession();
    return !!adminSession || (isAuth && isInternalStaff(role));
}

// GET: Fetch tasks, lists, members, or full board
export async function GET(req: NextRequest) {
    if (!(await isAuthorized())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    try {
        switch (action) {
            case "lists": {
                const lists = await getSpaceLists(SPACE_ID);
                return NextResponse.json({ data: lists });
            }
            case "tasks": {
                const listId = searchParams.get("list") || LIST_ID;
                const tasks = await getListTasks(listId);
                return NextResponse.json({ data: tasks });
            }
            case "members": {
                const members = await getTeamMembers(TEAM_ID);
                return NextResponse.json({ data: members });
            }
            case "board": {
                const board = await getBoardData(SPACE_ID);
                return NextResponse.json(board);
            }
            default:
                return NextResponse.json(
                    { error: "Unknown action. Use: lists, tasks, members, board" },
                    { status: 400 }
                );
        }
    } catch (e: any) {
        console.error("[ClickUp API route error]", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Create or update tasks
export async function POST(req: NextRequest) {
    if (!(await isAuthorized())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        switch (action) {
            case "create": {
                const { name, description, due_date, assignees, priority, status, tags, listId } = body;
                const task = await createTask(listId || LIST_ID, {
                    name,
                    description,
                    due_date,
                    assignees,
                    priority,
                    status,
                    tags,
                });
                return NextResponse.json({ data: task });
            }
            case "update": {
                const { taskId, ...updates } = body;
                const task = await updateTask(taskId, updates);
                return NextResponse.json({ data: task });
            }
            default:
                return NextResponse.json(
                    { error: "Unknown action. Use: create, update" },
                    { status: 400 }
                );
        }
    } catch (e: any) {
        console.error("[ClickUp API route error]", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
