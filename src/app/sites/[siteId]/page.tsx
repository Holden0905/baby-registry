import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteById } from "@/lib/data/sites";
import { getEquipmentForSite } from "@/lib/data/equipment";
import { getViewData } from "@/lib/data/view";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ siteId: string }> };

export default async function SiteDashboardPage({ params }: PageProps) {
  const { siteId } = await params;
  let site: Awaited<ReturnType<typeof getSiteById>> = null;
  let equipmentList: Awaited<ReturnType<typeof getEquipmentForSite>> = [];
  let viewRows: Awaited<ReturnType<typeof getViewData>> = [];
  let loadError: string | null = null;

  try {
    [site, equipmentList, viewRows] = await Promise.all([
      getSiteById(siteId),
      getEquipmentForSite(siteId),
      getViewData({ site_id: siteId }),
    ]);
  } catch (err) {
    const e = err as { message?: string };
    loadError = e?.message ?? String(err);
    console.error("[SiteDashboardPage] Failed to load:", { err });
  }

  if (loadError) {
    return (
      <div>
        <Link href="/" className="text-slate-500 hover:text-slate-700">← Sites</Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load site data</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }
  if (!site) notFound();

  const openTaskCount = (viewRows ?? []).filter(
    (r) => r.task_status && !["closed", "approved", "rejected"].includes(r.task_status)
  ).length;

  const equipmentCount = (equipmentList ?? []).length;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/"
          className="text-slate-500 hover:text-slate-700"
        >
          ← Sites
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-800">{site.name}</h1>
      <p className="mt-1 text-slate-600">{site.client_name}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-700">Equipment</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{equipmentCount}</p>
          <Link
            href={`/sites/${siteId}/equipment`}
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View equipment list →
          </Link>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-700">Open Tasks</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">{openTaskCount}</p>
          <Link
            href={`/tasks?site_id=${siteId}`}
            className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View tasks →
          </Link>
        </div>
      </div>
    </div>
  );
}
