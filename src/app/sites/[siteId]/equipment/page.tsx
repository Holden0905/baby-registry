import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteById } from "@/lib/data/sites";
import { getEquipmentForSite } from "@/lib/data/equipment";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ siteId: string }> };

export default async function EquipmentListPage({ params }: PageProps) {
  const { siteId } = await params;
  let site: Awaited<ReturnType<typeof getSiteById>> = null;
  let equipmentList: Awaited<ReturnType<typeof getEquipmentForSite>> = [];
  let loadError: string | null = null;

  try {
    [site, equipmentList] = await Promise.all([
      getSiteById(siteId),
      getEquipmentForSite(siteId),
    ]);
  } catch (err) {
    const e = err as { message?: string };
    loadError = e?.message ?? String(err);
    console.error("[EquipmentListPage] Failed to load:", { err });
  }

  if (loadError) {
    return (
      <div>
        <Link href={`/sites/${siteId}`} className="text-slate-500 hover:text-slate-700">← Back</Link>
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load equipment</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }
  if (!site) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/sites/${siteId}`}
          className="text-slate-500 hover:text-slate-700"
        >
          ← {site.name}
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Equipment</h1>
          <p className="mt-1 text-slate-600">
            {site.name} — {(equipmentList ?? []).length} items
          </p>
        </div>
        <Link
          href={`/sites/${siteId}/equipment/new`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add equipment
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                Asset Tag
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                Process Unit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                Requirements
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                Open Tasks
              </th>
              <th className="relative px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {(equipmentList ?? []).map((eq) => (
              <tr key={eq.equipment_id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                  {eq.asset_tag}
                </td>
                <td className="px-4 py-3 text-slate-600">{eq.equipment_description}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{eq.equipment_type ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{eq.process_unit ?? "—"}</td>
                <td className="max-w-[200px] px-4 py-3 text-slate-600">
                  {eq.requirements?.length ? eq.requirements.join(", ") : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      eq.open_task_count > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {eq.open_task_count}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/sites/${siteId}/equipment/${eq.equipment_id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(equipmentList ?? []).length === 0 && (
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          No equipment found for this site.
        </div>
      )}
    </div>
  );
}
