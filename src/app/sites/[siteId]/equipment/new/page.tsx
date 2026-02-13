import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteById } from "@/lib/data/sites";
import { getTaskTemplatesForSite } from "@/lib/data/task-templates";
import { getUniqueRegulationNames } from "@/lib/data/requirements";
import { AddEquipmentForm } from "./AddEquipmentForm";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ siteId: string }> };

export default async function AddEquipmentPage({ params }: PageProps) {
  const { siteId } = await params;
  const [site, taskTemplates, regulations] = await Promise.all([
    getSiteById(siteId),
    getTaskTemplatesForSite(siteId),
    getUniqueRegulationNames(),
  ]);

  if (!site) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/sites/${siteId}/equipment`}
          className="text-slate-500 hover:text-slate-700"
        >
          ← Equipment list
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-slate-800">Add Equipment</h1>
      <p className="mt-1 text-slate-600">
        Add new equipment to {site.name}
      </p>

      <div className="mt-8 max-w-md">
        <AddEquipmentForm siteId={siteId} taskTemplates={taskTemplates} regulations={regulations} />
      </div>
    </div>
  );
}
