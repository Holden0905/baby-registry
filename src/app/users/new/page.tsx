import Link from "next/link";
import { getSites } from "@/lib/data/sites";
import { AddUserForm } from "./AddUserForm";

export const dynamic = "force-dynamic";

export default async function AddUserPage() {
  const sites = await getSites();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/users"
          className="text-slate-500 hover:text-slate-700"
        >
          ← Users
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-slate-800">Add User</h1>
      <p className="mt-1 text-slate-600">
        Create a new user in the compliance registry.
      </p>

      <div className="mt-8 max-w-md">
        <AddUserForm sites={sites} />
      </div>
    </div>
  );
}
