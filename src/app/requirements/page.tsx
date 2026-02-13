import { Suspense } from "react";
import { getRequirementsWithSites } from "@/lib/data/requirements";
import { getSites } from "@/lib/data/sites";
import { RequirementsContent } from "./RequirementsContent";

export const dynamic = "force-dynamic";

export default async function RequirementsPage() {
  let requirements: Awaited<ReturnType<typeof getRequirementsWithSites>> = [];
  let sites: Awaited<ReturnType<typeof getSites>> = [];
  let loadError: string | null = null;

  try {
    [requirements, sites] = await Promise.all([
      getRequirementsWithSites(),
      getSites(),
    ]);
  } catch (err) {
    const e = err as { message?: string };
    loadError = e?.message ?? String(err);
    console.error("[RequirementsPage] Failed to load:", { err });
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Requirements</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load requirements</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Requirements</h1>
      <p className="mb-6 text-slate-600">
        Manage regulatory requirements that apply to equipment at your sites.
      </p>

      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-slate-100" />}>
        <RequirementsContent requirements={requirements} sites={sites} />
      </Suspense>
    </div>
  );
}
