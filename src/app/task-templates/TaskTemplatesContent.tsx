"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createTaskTemplateAction,
  updateTaskTemplateAction,
  deleteTaskTemplateAction,
} from "./actions";
import type { TaskTemplateWithRequirement } from "@/lib/data/task-templates";
import type { RequirementOption } from "@/lib/data/requirements";

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

type Props = {
  templates: TaskTemplateWithRequirement[];
  requirements: RequirementOption[];
};

function groupByRequirement(templates: TaskTemplateWithRequirement[]) {
  const groups = new Map<string, TaskTemplateWithRequirement[]>();
  for (const t of templates) {
    const key = t.requirement_id;
    const existing = groups.get(key) ?? [];
    existing.push(t);
    groups.set(key, existing);
  }
  return groups;
}

export function TaskTemplatesContent({ templates, requirements }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const groups = groupByRequirement(templates);
  const requirementMap = new Map(requirements.map((r) => [r.id, r]));

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const requirement_id = (formData.get("requirement_id") as string)?.trim();
    const task_name = (formData.get("task_name") as string)?.trim();
    const task_description = (formData.get("task_description") as string)?.trim();
    const frequency = (formData.get("frequency") as string)?.trim();
    const active = formData.get("active") === "on";

    if (!task_name) {
      setError("Task name is required");
      setIsSubmitting(false);
      return;
    }
    if (!frequency) {
      setError("Frequency is required");
      setIsSubmitting(false);
      return;
    }
    if (!requirement_id) {
      setError("Requirement is required");
      setIsSubmitting(false);
      return;
    }

    const result = await createTaskTemplateAction({
      requirement_id,
      task_name,
      task_description: task_description || "",
      frequency,
      active,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      form.reset();
      router.refresh();
    }
    setIsSubmitting(false);
  }

  async function handleEdit(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const task_name = (formData.get("task_name") as string)?.trim();
    const task_description = (formData.get("task_description") as string)?.trim();
    const frequency = (formData.get("frequency") as string)?.trim();
    const active = formData.get("active") === "on";

    if (!task_name) {
      setError("Task name is required");
      return;
    }
    if (!frequency) {
      setError("Frequency is required");
      return;
    }

    const result = await updateTaskTemplateAction(id, {
      task_name,
      task_description: task_description || "",
      frequency,
      active,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const result = await deleteTaskTemplateAction(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setDeleteConfirmId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      {/* Add form */}
      <form
        onSubmit={handleAdd}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-medium text-slate-800">Add Task Template</h2>
        {error && !editingId && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="requirement_id" className="block text-sm font-medium text-slate-700">
              Requirement <span className="text-red-500">*</span>
            </label>
            <select
              id="requirement_id"
              name="requirement_id"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select requirement...</option>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.citation} – {r.requirement_summary?.slice(0, 50)}
                  {r.requirement_summary && r.requirement_summary.length > 50 ? "…" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task_name" className="block text-sm font-medium text-slate-700">
              Task Name <span className="text-red-500">*</span>
            </label>
            <input
              id="task_name"
              name="task_name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Inspect tank seals"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-slate-700">
              Frequency <span className="text-red-500">*</span>
            </label>
            <select
              id="frequency"
              name="frequency"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select frequency...</option>
              {FREQUENCY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="task_description" className="block text-sm font-medium text-slate-700">
            Task Description (optional)
          </label>
          <textarea
            id="task_description"
            name="task_description"
            rows={2}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Describe what needs to be done..."
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <label htmlFor="active" className="text-sm font-medium text-slate-700">
            Active
          </label>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? "Adding…" : "Add Template"}
          </button>
        </div>
      </form>

      {/* Grouped list */}
      <div>
        <h2 className="mb-4 text-lg font-medium text-slate-800">Existing Templates</h2>

        {templates.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
            No task templates yet. Add one above.
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(groups.entries()).map(([reqId, items]) => {
              const req = requirementMap.get(reqId);
              const citation = req?.citation ?? items[0]?.citation ?? "Unknown";
              const summary = req?.requirement_summary ?? items[0]?.requirement_summary ?? "";

              return (
                <div
                  key={reqId}
                  className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h3 className="font-medium text-slate-800">{citation}</h3>
                    {summary && (
                      <p className="mt-0.5 text-sm text-slate-600">{summary}</p>
                    )}
                  </div>
                  <ul className="divide-y divide-slate-200">
                    {items.map((t) => (
                      <li key={t.id} className="px-4 py-3">
                        {editingId === t.id ? (
                          <form
                            onSubmit={(e) => handleEdit(t.id, e)}
                            className="space-y-3"
                          >
                            {error && (
                              <div className="rounded-md bg-red-50 p-2 text-sm text-red-800">
                                {error}
                              </div>
                            )}
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <label className="block text-xs font-medium text-slate-500">
                                  Task Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  name="task_name"
                                  defaultValue={t.task_name}
                                  required
                                  className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-slate-500">
                                  Frequency <span className="text-red-500">*</span>
                                </label>
                                <select
                                  name="frequency"
                                  defaultValue={t.frequency}
                                  required
                                  className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  {FREQUENCY_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500">
                                Description
                              </label>
                              <textarea
                                name="task_description"
                                defaultValue={t.task_description ?? ""}
                                rows={2}
                                className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                name="active"
                                type="checkbox"
                                defaultChecked={t.active}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                              />
                              <label className="text-xs text-slate-600">Active</label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium text-slate-900">{t.task_name}</p>
                              <p className="text-sm text-slate-500 capitalize">
                                {t.frequency}
                              </p>
                              {t.task_description && (
                                <p className="mt-1 text-sm text-slate-600">
                                  {t.task_description}
                                </p>
                              )}
                              <span
                                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                  t.active ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {t.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingId(t.id)}
                                className="text-sm font-medium text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              {deleteConfirmId === t.id ? (
                                <span className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(t.id)}
                                    className="text-sm font-medium text-red-600 hover:underline"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="text-sm text-slate-500 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(t.id)}
                                  className="text-sm font-medium text-red-600 hover:underline"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
