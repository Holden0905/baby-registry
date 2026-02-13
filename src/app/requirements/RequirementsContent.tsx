"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
  createRequirementAction,
  updateRequirementAction,
  deleteRequirementAction,
} from "./actions";
import type { RequirementWithSite } from "@/lib/data/requirements";

type SiteOption = { id: string; name: string };

type Props = {
  requirements: RequirementWithSite[];
  sites: SiteOption[];
};

export function RequirementsContent({ requirements, sites }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredRequirements = useMemo(() => {
    if (!search.trim()) return requirements;
    const q = search.trim().toLowerCase();
    return requirements.filter(
      (r) =>
        r.citation?.toLowerCase().includes(q) ||
        (r.regulation_name ?? "").toLowerCase().includes(q) ||
        r.requirement_summary?.toLowerCase().includes(q) ||
        r.site_name?.toLowerCase().includes(q)
    );
  }, [requirements, search]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const citation = (formData.get("citation") as string)?.trim();
    const regulation_name = (formData.get("regulation_name") as string)?.trim();
    const requirement_summary = (formData.get("requirement_summary") as string)?.trim();
    const requirement_text = (formData.get("requirement_text") as string)?.trim();
    const site_id = (formData.get("site_id") as string)?.trim();
    const is_active = formData.get("is_active") === "on";

    if (!citation) {
      setError("Citation is required");
      setIsSubmitting(false);
      return;
    }
    if (!regulation_name) {
      setError("Regulation name is required");
      setIsSubmitting(false);
      return;
    }
    if (!requirement_summary) {
      setError("Requirement summary is required");
      setIsSubmitting(false);
      return;
    }
    if (!site_id) {
      setError("Site is required");
      setIsSubmitting(false);
      return;
    }

    const result = await createRequirementAction({
      citation,
      regulation_name,
      requirement_summary,
      requirement_text: requirement_text ?? "",
      site_id,
      is_active,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Requirement added successfully.");
      form.reset();
      setShowAddForm(false);
      router.refresh();
    }
    setIsSubmitting(false);
  }

  async function handleEdit(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const citation = (formData.get("citation") as string)?.trim();
    const regulation_name = (formData.get("regulation_name") as string)?.trim();
    const requirement_summary = (formData.get("requirement_summary") as string)?.trim();
    const requirement_text = (formData.get("requirement_text") as string)?.trim();
    const site_id = (formData.get("site_id") as string)?.trim();
    const is_active = formData.get("is_active") === "on";

    if (!citation) {
      setError("Citation is required");
      return;
    }
    if (!regulation_name) {
      setError("Regulation name is required");
      return;
    }
    if (!requirement_summary) {
      setError("Requirement summary is required");
      return;
    }
    if (!site_id) {
      setError("Site is required");
      return;
    }

    const result = await updateRequirementAction(id, {
      citation,
      regulation_name,
      requirement_summary,
      requirement_text: requirement_text ?? "",
      site_id,
      is_active,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Requirement updated successfully.");
      setEditingId(null);
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const result = await deleteRequirementAction(id);
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess("Requirement deleted.");
      setDeleteConfirmId(null);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      {/* Search and Add button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-md flex-1">
          <input
            type="search"
            placeholder="Search by citation, regulation name, or site..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
            aria-label="Search requirements"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
            setSuccess(null);
          }}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showAddForm ? "Cancel" : "Add Requirement"}
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{success}</div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      {/* Add form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-medium text-slate-800">Add Requirement</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="citation" className="block text-sm font-medium text-slate-700">
                Citation <span className="text-red-500">*</span>
              </label>
              <input
                id="citation"
                name="citation"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 63.2455(c)(2)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="regulation_name" className="block text-sm font-medium text-slate-700">
                Regulation Name <span className="text-red-500">*</span>
              </label>
              <input
                id="regulation_name"
                name="regulation_name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 40 CFR Part 63"
                disabled={isSubmitting}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="requirement_summary" className="block text-sm font-medium text-slate-700">
                Requirement Summary <span className="text-red-500">*</span>
              </label>
              <input
                id="requirement_summary"
                name="requirement_summary"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief summary of the requirement"
                disabled={isSubmitting}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="requirement_text" className="block text-sm font-medium text-slate-700">
                Requirement Text (optional)
              </label>
              <textarea
                id="requirement_text"
                name="requirement_text"
                rows={3}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Full regulatory text..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="site_id" className="block text-sm font-medium text-slate-700">
                Site <span className="text-red-500">*</span>
              </label>
              <select
                id="site_id"
                name="site_id"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="">Select site...</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 sm:items-end">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Active
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {filteredRequirements.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {requirements.length === 0
              ? "No requirements yet. Add one above."
              : "No requirements match your search."}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Citation
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Regulation Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Requirement Summary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Site
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                  Status
                </th>
                <th className="relative px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRequirements.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  {editingId === r.id ? (
                    <td colSpan={6} className="px-4 py-3">
                      <form
                        onSubmit={(e) => handleEdit(r.id, e)}
                        className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-500">
                              Citation <span className="text-red-500">*</span>
                            </label>
                            <input
                              name="citation"
                              defaultValue={r.citation}
                              required
                              className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500">
                              Regulation Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              name="regulation_name"
                              defaultValue={r.regulation_name ?? ""}
                              required
                              className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-500">
                              Requirement Summary <span className="text-red-500">*</span>
                            </label>
                            <input
                              name="requirement_summary"
                              defaultValue={r.requirement_summary}
                              required
                              className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-500">
                              Requirement Text
                            </label>
                            <textarea
                              name="requirement_text"
                              defaultValue={r.requirement_text ?? ""}
                              rows={2}
                              className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500">
                              Site <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="site_id"
                              defaultValue={r.site_id}
                              required
                              className="mt-0.5 block w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {sites.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              name="is_active"
                              type="checkbox"
                              defaultChecked={r.is_active !== false}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                            />
                            <label className="text-xs text-slate-600">Active</label>
                          </div>
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
                    </td>
                  ) : (
                    <>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                        {r.citation}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.regulation_name ?? "—"}
                      </td>
                      <td className="max-w-[280px] px-4 py-3 text-slate-600">
                        {r.requirement_summary}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{r.site_name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.is_active !== false
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingId(r.id)}
                            className="text-sm font-medium text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          {deleteConfirmId === r.id ? (
                            <span className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleDelete(r.id)}
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
                              onClick={() => setDeleteConfirmId(r.id)}
                              className="text-sm font-medium text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
