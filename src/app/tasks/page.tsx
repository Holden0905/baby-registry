import Link from "next/link";
import { Suspense } from "react";
import { getTasksFromView } from "@/lib/data/tasks";
import { getSites } from "@/lib/data/sites";
import { getUsers } from "@/lib/data/users";
import { TasksFilters } from "./TasksFilters";
import { TasksTable } from "./TasksTable";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ site_id?: string; status?: string; assigned_to?: string }>;
};

export default async function TasksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const siteId = params.site_id ?? "";
  const status = params.status ?? "";
  const assignedTo = params.assigned_to ?? "";

  let viewRows: Awaited<ReturnType<typeof getTasksFromView>> = [];
  let sites: Awaited<ReturnType<typeof getSites>> = [];
  let users: Awaited<ReturnType<typeof getUsers>> = [];
  let loadError: string | null = null;

  try {
    [viewRows, sites, users] = await Promise.all([
      getTasksFromView({
        site_id: siteId || undefined,
        task_status: status || undefined,
        assigned_to_user_id: assignedTo || undefined,
      }),
      getSites(),
      getUsers(),
    ]);
  } catch (err) {
    const e = err as { message?: string; code?: string; details?: unknown };
    loadError = e?.message ?? String(err);
    console.error("[TasksPage] Failed to load data:", {
      message: e?.message,
      code: e?.code,
      details: e?.details,
      err,
    });
  }

  const openStatuses = ["open", "assigned", "pending", "submitted"];
  const taskRows = (viewRows ?? []).filter(
    (r) => r.task_id && r.task_status && openStatuses.includes(r.task_status)
  );

  const uniqueTasks = new Map<string, (typeof viewRows)[0]>();
  for (const r of taskRows) {
    if (r.task_id && !uniqueTasks.has(r.task_id)) {
      uniqueTasks.set(r.task_id, r);
    }
  }
  const tasks = Array.from(uniqueTasks.values());

  if (loadError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Tasks</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load tasks</p>
          <p className="mt-2 text-sm">{loadError}</p>
          <p className="mt-3 text-xs text-red-600">
            Check the server console for full error details. Verify the view{" "}
            <code className="rounded bg-red-100 px-1">site_equipment_requirements_tasks_v</code>{" "}
            exists and RLS allows read access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Tasks</h1>
        <Link
          href="/tasks/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add task
        </Link>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <TasksFilters sites={sites} users={users} currentSiteId={siteId} currentStatus={status} currentAssignedTo={assignedTo} />
      </Suspense>

      <TasksTable tasks={tasks} users={users ?? []} />
    </div>
  );
}
