"use client";

import { useRouter, useSearchParams } from "next/navigation";

type SiteOption = { id: string; name: string };

type Props = {
  sites: SiteOption[];
  currentSiteId: string;
};

export function EquipmentFilters({ sites, currentSiteId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.push(`/equipment?${next.toString()}`);
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
    </div>
  );
}
