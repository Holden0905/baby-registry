"use client";

import Link from "next/link";
import { SortableDataTable } from "@/components/SortableDataTable";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  site_id: string | null;
};

type Site = { id: string; name: string };

export function UsersTable({ users, sites }: { users: UserRow[]; sites: Site[] }) {
  return (
    <SortableDataTable<UserRow>
      columns={[
        {
          id: "name",
          label: "Name",
          accessor: (r) => r.name,
          sortable: true,
          filterable: true,
          cellClassName: "whitespace-nowrap font-medium text-slate-900",
        },
        {
          id: "email",
          label: "Email",
          accessor: (r) => r.email,
          sortable: true,
          filterable: true,
        },
        {
          id: "role",
          label: "Role",
          accessor: (r) => r.role,
          sortable: true,
          filterable: true,
        },
        {
          id: "site",
          label: "Site",
          accessor: (r) => {
            const site = sites.find((s) => s.id === r.site_id);
            return site?.name ?? null;
          },
          sortable: true,
          filterable: true,
        },
        {
          id: "status",
          label: "Status",
          accessor: () => "Active",
          sortable: false,
          filterable: false,
          cell: () => (
            <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              Active
            </span>
          ),
        },
      ]}
      data={users}
      rowKey={(r) => r.id}
      emptyMessage="No users found. Adjust filters or add users."
      actionColumn={{
        header: <span className="sr-only">Actions</span>,
        render: (r) => (
          <Link
            href={`/tasks?assigned_to=${r.id}`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View tasks
          </Link>
        ),
      }}
    />
  );
}
