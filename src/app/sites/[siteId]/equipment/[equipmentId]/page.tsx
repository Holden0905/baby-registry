import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteById } from "@/lib/data/sites";
import { getEquipmentById } from "@/lib/data/equipment";
import { getEquipmentDetail } from "@/lib/data/equipment";
import { getTaskTemplatesForSite } from "@/lib/data/task-templates";
import { AddTaskForm } from "./AddTaskForm";
import { EditEquipmentForm } from "./EditEquipmentForm";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ siteId: string; equipmentId: string }> };

export default async function EquipmentDetailPage({ params }: PageProps) {
  const { siteId, equipmentId } = await params;
  let site: Awaited<ReturnType<typeof getSiteById>> = null;
  let equipment: Awaited<ReturnType<typeof getEquipmentById>> = null;
  let viewRows: Awaited<ReturnType<typeof getEquipmentDetail>> = [];
  let taskTemplates: Awaited<ReturnType<typeof getTaskTemplatesForSite>> = [];
  let loadError: string | null = null;

  try {
    [site, equipment, viewRows, taskTemplates] = await Promise.all([
      getSiteById(siteId),
      getEquipmentById(equipmentId),
      getEquipmentDetail(equipmentId),
      getTaskTemplatesForSite(siteId),
    ]);
  } catch (err) {
    const e = err as { message?: string };
    loadError = e?.message ?? String(err);
    console.error("[EquipmentDetailPage] Failed to load:", { err });
  }

  if (loadError) {
    return (
      <div>
        <Link href={`/sites/${siteId}/equipment`} className="text-slate-500 hover:text-slate-700">← Equipment list</Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load equipment details</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }
  if (!site || !equipment) notFound();

  const reqMap = new Map<
    string,
    {
      requirement_id: string;
      citation: string;
      requirement_summary: string;
      tasks: Array<{
        task_id: string;
        task_name: string | null;
        task_status: string | null;
        due_date: string | null;
      }>;
    }
  >();

  for (const r of viewRows ?? []) {
    const reqId = r.requirement_id;
    if (!reqId) continue;
    let entry = reqMap.get(reqId);
    if (!entry) {
      entry = {
        requirement_id: reqId,
        citation: r.citation ?? "",
        requirement_summary: r.requirement_summary ?? "",
        tasks: [],
      };
      reqMap.set(reqId, entry);
    }
    if (r.task_id && !entry.tasks.some((t) => t.task_id === r.task_id)) {
      entry.tasks.push({
        task_id: r.task_id,
        task_name: r.task_name ?? null,
        task_status: r.task_status ?? null,
        due_date: r.due_date ?? null,
      });
    }
  }

  const requirements = Array.from(reqMap.values());

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/sites/${siteId}/equipment`}
          className="text-slate-500 hover:text-slate-700"
        >
          ← Equipment list
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">
          {equipment.asset_tag}
        </h1>
        <p className="mt-1 text-slate-600">{equipment.description}</p>
      </div>

      <EditEquipmentForm equipment={equipment} />

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-medium text-slate-700">
            Requirements & Tasks
          </h2>
          <AddTaskForm equipmentId={equipmentId} siteId={siteId} taskTemplates={taskTemplates ?? []} />
          <div className="mt-4 space-y-6">
            {requirements.map((req) => (
              <div
                key={req.requirement_id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2">
                  <span className="font-medium text-slate-800">{req.citation}</span>
                  <p className="mt-1 text-sm text-slate-600">
                    {req.requirement_summary}
                  </p>
                </div>
                {req.tasks.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {req.tasks.map((t) => (
                      <li
                        key={`${req.requirement_id}-${t.task_id}`}
                        className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-3 py-2"
                      >
                        <span className="text-sm text-slate-700">
                          {t.task_name ?? "Task"}
                        </span>
                        <div className="flex items-center gap-3">
                          {t.due_date && (
                            <span className="text-xs text-slate-500">
                              Due: {new Date(t.due_date).toLocaleDateString()}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              t.task_status === "open" || t.task_status === "assigned"
                                ? "bg-amber-100 text-amber-800"
                                : t.task_status === "approved" || t.task_status === "closed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {t.task_status ?? "—"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No tasks for this requirement.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {requirements.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No requirements or tasks for this equipment.
        </div>
      )}
    </div>
  );
}
