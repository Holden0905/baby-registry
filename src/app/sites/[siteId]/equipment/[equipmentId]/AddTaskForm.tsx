"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTaskAction } from "./actions";
import type { TaskTemplateOption } from "@/lib/data/task-templates";

type Props = {
  equipmentId: string;
  siteId: string;
  taskTemplates: TaskTemplateOption[];
};

export function AddTaskForm({ equipmentId, siteId, taskTemplates }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const taskValue = formData.get("task_template_id") as string;
    const due_date = formData.get("due_date") as string;

    const [task_template_id, requirement_id] = (taskValue ?? "").split("|");

    if (!task_template_id || !requirement_id || !due_date) {
      setError("Task and due date are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createTaskAction({ task_template_id, equipment_id: equipmentId, requirement_id, due_date });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setIsOpen(false);
      setError(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add task");
    }
    setIsSubmitting(false);
  }

  if (taskTemplates.length === 0) return null;

  return (
    <div className="mb-4">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          + Add task
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <p className="mb-3 text-sm font-medium text-slate-700">Add task to this equipment</p>
          {error && (
            <div className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-800">{error}</div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="add-task_template_id" className="block text-xs text-slate-600">
                Task
              </label>
              <select
                id="add-task_template_id"
                name="task_template_id"
                required
                className="mt-1 block w-full min-w-[180px] rounded-md border border-slate-300 px-2 py-1.5 text-sm"
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
            <div>
              <label htmlFor="add-due_date" className="block text-xs text-slate-600">
                Due date
              </label>
              <input
                id="add-due_date"
                name="due_date"
                type="date"
                required
                className="mt-1 block rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
