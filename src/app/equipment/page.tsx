import { Suspense } from "react";
import { getAllEquipment } from "@/lib/data/equipment";
import { getSites } from "@/lib/data/sites";
import { EquipmentFilters } from "./EquipmentFilters";
import { EquipmentTable } from "./EquipmentTable";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ site_id?: string }>;
};

export default async function EquipmentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const siteId = params.site_id ?? "";

  let equipment: Awaited<ReturnType<typeof getAllEquipment>> = [];
  let sites: Awaited<ReturnType<typeof getSites>> = [];
  let loadError: string | null = null;

  try {
    [equipment, sites] = await Promise.all([
      getAllEquipment(siteId || undefined),
      getSites(),
    ]);
  } catch (err) {
    const e = err as { message?: string };
    loadError = e?.message ?? String(err);
    console.error("[EquipmentPage] Failed to load:", { err });
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Equipment</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load equipment</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Equipment</h1>

      <Suspense fallback={<div className="h-10" />}>
        <EquipmentFilters sites={sites} currentSiteId={siteId} />
      </Suspense>

      <EquipmentTable equipment={equipment ?? []} sites={sites ?? []} />
    </div>
  );
}
