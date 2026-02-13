"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { createTaskAction } from "./actions";

type SiteOption = { id: string; name: string };
type EquipmentOption = {
  equipment_id: string;
  asset_tag: string;
  equipment_site_id: string;
  equipment_type?: string | null;
  process_unit?: string | null;
};
type TemplateOption = {
  id: string;
  task_name: string;
  requirement_id: string;
  citation: string;
  site_id: string;
};
type UserOption = { id: string; name: string };

type Props = {
  sites: SiteOption[];
  equipment: EquipmentOption[];
  taskTemplates: TemplateOption[];
  users: UserOption[];
};

export function AddTaskForm({ sites, equipment, taskTemplates, users }: Props) {
  const router = useRouter();
  const [siteFilter, setSiteFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEquipment = useMemo(() => {
    if (!siteFilter) return equipment;
    return equipment.filter((e) => e.equipment_site_id === siteFilter);
  }, [equipment, siteFilter]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const get = (k: string) => (formData.get(k) as string)?.trim() || undefined;

    const taskTemplateValue = get("task_template_id");
    const [task_template_id, requirement_id] = (taskTemplateValue ?? "").split("|");
    const equipment_id = get("equipment_id");
    const due_date = get("due_date");
    const status = get("status") || "open";
    const assigned_to_user_id = get("assigned_to_user_id") || undefined;

    if (!task_template_id || !requirement_id || !equipment_id || !due_date) {
      setError("Task template, equipment, and due date are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createTaskAction({
        task_template_id,
        requirement_id,
        equipment_id,
        due_date,
        status,
        assigned_to_user_id,
      });
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      router.push("/tasks");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="site_filter" className="block text-sm font-medium text-slate-700">
            Filter equipment by site (optional)
          </label>
          <select
            id="site_filter"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="equipment_id" className="block text-sm font-medium text-slate-700">
            Equipment *
          </label>
          <select
            id="equipment_id"
            name="equipment_id"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">Select equipment...</option>
            {filteredEquipment.map((e) => {
              const site = sites.find((s) => s.id === e.equipment_site_id);
              const label = site
                ? `${e.asset_tag} (${site.name})`
                : e.asset_tag;
              return (
                <option key={e.equipment_id} value={e.equipment_id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label htmlFor="task_template_id" className="block text-sm font-medium text-slate-700">
            Task Template *
          </label>
          <select
            id="task_template_id"
            name="task_template_id"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">Select task...</option>
            {taskTemplates.map((t) => (
              <option key={t.id} value={`${t.id}|${t.requirement_id}`}>
                {t.task_name} ({t.citation})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-slate-700">
              Due Date *
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="assigned_to_user_id" className="block text-sm font-medium text-slate-700">
            Assign to User (optional)
          </label>
          <select
            id="assigned_to_user_id"
            name="assigned_to_user_id"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Adding…" : "Add Task"}
        </button>
        <Link
          href="/tasks"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
