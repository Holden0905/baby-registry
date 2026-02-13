"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEquipmentAction } from "./actions";
import type { TaskTemplateOption } from "@/lib/data/task-templates";

type Props = { siteId: string; taskTemplates: TaskTemplateOption[] };

export function AddEquipmentForm({ siteId, taskTemplates }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const get = (k: string) => (formData.get(k) as string)?.trim() || undefined;

    const asset_tag = get("asset_tag");
    const description = get("description");
    const taskValue = (formData.get("task_template_id") as string) || "";
    const due_date = (formData.get("due_date") as string) || undefined;
    const [task_template_id, requirement_id] = taskValue ? taskValue.split("|") : [];

    if (!asset_tag) {
      setError("Asset tag is required");
      setIsSubmitting(false);
      return;
    }

    if (task_template_id && !due_date) {
      setError("Due date is required when assigning a task");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createEquipmentAction({
        asset_tag,
        description: description || "",
        equipment_site_id: siteId,
        sap_equipment_number: get("sap_equipment_number"),
        sort_field: get("sort_field"),
        functional_loc: get("functional_loc"),
        location_description: get("location_description"),
        equipment_type: get("equipment_type"),
        equipment_subtype: get("equipment_subtype"),
        process_unit: get("process_unit"),
        area_location: get("area_location"),
        task_template_id: task_template_id || undefined,
        requirement_id: requirement_id || undefined,
        due_date,
      });
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      router.push(`/sites/${siteId}/equipment`);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add equipment";
      setError(message);
      setIsSubmitting(false);
    }
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="asset_tag" className="block text-sm font-medium text-slate-700">
              Asset Tag *
            </label>
            <input
              id="asset_tag"
              name="asset_tag"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. EQ-001"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="sap_equipment_number" className="block text-sm font-medium text-slate-700">
              SAP Equipment Number
            </label>
            <input
              id="sap_equipment_number"
              name="sap_equipment_number"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Brief description of the equipment"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="equipment_type" className="block text-sm font-medium text-slate-700">
              Equipment Type
            </label>
            <input
              id="equipment_type"
              name="equipment_type"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="equipment_subtype" className="block text-sm font-medium text-slate-700">
              Equipment Subtype
            </label>
            <input
              id="equipment_subtype"
              name="equipment_subtype"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="process_unit" className="block text-sm font-medium text-slate-700">
              Process Unit
            </label>
            <input
              id="process_unit"
              name="process_unit"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="area_location" className="block text-sm font-medium text-slate-700">
              Area / Location
            </label>
            <input
              id="area_location"
              name="area_location"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="functional_loc" className="block text-sm font-medium text-slate-700">
              Functional Location
            </label>
            <input
              id="functional_loc"
              name="functional_loc"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="sort_field" className="block text-sm font-medium text-slate-700">
              Sort Field
            </label>
            <input
              id="sort_field"
              name="sort_field"
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location_description" className="block text-sm font-medium text-slate-700">
            Location Description
          </label>
          <input
            id="location_description"
            name="location_description"
            type="text"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {taskTemplates.length > 0 && (
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Assign initial task (optional)</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="task_template_id" className="block text-xs text-slate-600">
                  Task
                </label>
                <select
                  id="task_template_id"
                  name="task_template_id"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                  disabled={isSubmitting}
                >
                  <option value="">None</option>
                  {taskTemplates.map((t) => (
                    <option key={t.id} value={`${t.id}|${t.requirement_id}`}>
                      {t.task_name} ({t.citation})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="due_date" className="block text-xs text-slate-600">
                  Due date
                </label>
                <input
                  id="due_date"
                  name="due_date"
                  type="date"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Adding…" : "Add Equipment"}
        </button>
        <Link
          href={`/sites/${siteId}/equipment`}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
