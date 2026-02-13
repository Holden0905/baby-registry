import Link from "next/link";
import { getSites } from "@/lib/data/sites";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sites = await getSites();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">
        Site Dashboard
      </h1>
      <p className="mb-8 text-slate-600">
        Select a site to view equipment and task counts.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <Link
            key={site.id}
            href={`/sites/${site.id}`}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-800">{site.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{site.client_name}</p>
            <span className="mt-3 inline-block text-sm font-medium text-blue-600">
              View details →
            </span>
          </Link>
        ))}
      </div>
      {sites.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
          No active sites found. Configure Supabase and add sites.
        </div>
      )}
    </div>
  );
}
