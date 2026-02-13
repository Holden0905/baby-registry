import { Suspense } from "react";
import { getAllTaskTemplates } from "@/lib/data/task-templates";
import { getAllRequirements } from "@/lib/data/requirements";
import { TaskTemplatesContent } from "./TaskTemplatesContent";

export const dynamic = "force-dynamic";

export default async function TaskTemplatesPage() {
  let templates: Awaited<ReturnType<typeof getAllTaskTemplates>> = [];
  let requirements: Awaited<ReturnType<typeof getAllRequirements>> = [];
  let loadError: string | null = null;

  try {
    [templates, requirements] = await Promise.all([
      getAllTaskTemplates(),
      getAllRequirements(),
    ]);
  } catch (err) {
    const e = err as { message?: string };
    loadError = e?.message ?? String(err);
    console.error("[TaskTemplatesPage] Failed to load:", { err });
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Task Templates</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load task templates</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Task Templates</h1>
      <p className="mb-6 text-slate-600">
        Define what tasks should be auto-created when requirements are assigned to equipment.
      </p>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
        <TaskTemplatesContent templates={templates} requirements={requirements} />
      </Suspense>
    </div>
  );
}
