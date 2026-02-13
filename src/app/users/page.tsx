import Link from "next/link";
import { Suspense } from "react";
import { getUsers } from "@/lib/data/users";
import { getSites } from "@/lib/data/sites";
import { UsersFilters } from "./UsersFilters";
import { UsersTable } from "./UsersTable";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ site_id?: string }>;
};

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const siteId = params.site_id ?? "";

  let users: Awaited<ReturnType<typeof getUsers>> = [];
  let sites: Awaited<ReturnType<typeof getSites>> = [];
  let loadError: string | null = null;

  try {
    [users, sites] = await Promise.all([
      getUsers(siteId || undefined),
      getSites(),
    ]);
  } catch (err) {
    const e = err as { message?: string };
    loadError = e?.message ?? String(err);
    console.error("[UsersPage] Failed to load:", { err });
  }

  if (loadError) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-semibold text-slate-800">Users</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">Failed to load users</p>
          <p className="mt-2 text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <Link
          href="/users/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add user
        </Link>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <UsersFilters sites={sites} currentSiteId={siteId} />
      </Suspense>

      <UsersTable users={users ?? []} sites={sites ?? []} />
    </div>
  );
}
