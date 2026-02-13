"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUserAction } from "./actions";

type SiteOption = { id: string; name: string };

type Props = { sites: SiteOption[] };

export function AddUserForm({ sites }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const role = (formData.get("role") as string)?.trim();
    const site_id = (formData.get("site_id") as string) || undefined;

    if (!name || !email || !role) {
      setError("Name, email, and role are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createUserAction({ name, email, role, site_id: site_id || null });
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add user");
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
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="John Smith"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="john@example.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">Select role...</option>
            <option value="admin">Admin</option>
            <option value="inspector">Inspector</option>
            <option value="viewer">Viewer</option>
            <option value="user">User</option>
          </select>
        </div>

        <div>
          <label htmlFor="site_id" className="block text-sm font-medium text-slate-700">
            Site (optional)
          </label>
          <select
            id="site_id"
            name="site_id"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">None</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
          {isSubmitting ? "Adding…" : "Add User"}
        </button>
        <Link
          href="/users"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
