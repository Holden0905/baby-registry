"use client";

import { useRouter, useSearchParams } from "next/navigation";

type SiteOption = { id: string; name: string };
type UserOption = { id: string; name: string };

type Props = {
  sites: SiteOption[];
  users: UserOption[];
  currentSiteId: string;
  currentStatus: string;
  currentAssignedTo: string;
};

export function TasksFilters({ sites, users, currentSiteId, currentStatus, currentAssignedTo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.push(`/tasks?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div>
        <label htmlFor="site-filter" className="sr-only">
          Filter by site
        </label>
        <select
          id="site-filter"
          value={currentSiteId}
          onChange={(e) => updateFilter("site_id", e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <label htmlFor="assigned-filter" className="sr-only">
          Filter by assigned user
        </label>
        <select
          id="assigned-filter"
          value={currentAssignedTo}
          onChange={(e) => updateFilter("assigned_to", e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status-filter" className="sr-only">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="submitted">Submitted</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );
}
