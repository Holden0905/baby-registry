"use client";

import Link from "next/link";
import { SortableDataTable } from "@/components/SortableDataTable";
import { AssignTaskSelect } from "./AssignTaskSelect";

export type TaskRow = {
  task_id: string;
  asset_tag: string | null;
  task_name: string | null;
  citation: string | null;
  requirement_summary: string | null;
  due_date: string | null;
  assigned_to_user_id: string | null;
  task_status: string | null;
  equipment_site_id: string | null;
  site_id: string | null;
  equipment_id: string | null;
};

type UserOption = { id: string; name: string };

export function TasksTable({
  tasks,
  users,
}: {
  tasks: TaskRow[];
  users: UserOption[];
}) {
  return (
    <SortableDataTable<TaskRow>
      columns={[
        {
          id: "asset_tag",
          label: "Asset Tag",
          accessor: (r) => r.asset_tag,
          sortable: true,
          filterable: true,
          cellClassName: "whitespace-nowrap font-medium text-slate-900",
        },
        {
          id: "task_name",
          label: "Task",
          accessor: (r) => r.task_name,
          sortable: true,
          filterable: true,
          cell: (r) => <span className="text-slate-700">{r.task_name}</span>,
        },
        {
          id: "citation",
          label: "Citation",
          accessor: (r) => r.citation,
          sortable: true,
          filterable: true,
          cellClassName: "whitespace-nowrap",
        },
        {
          id: "requirement_summary",
          label: "Requirement",
          accessor: (r) => r.requirement_summary,
          sortable: true,
          filterable: true,
        },
        {
          id: "due_date",
          label: "Due Date",
          accessor: (r) => r.due_date ?? null, // Raw date for correct sort order
          sortable: true,
          filterable: true,
          cell: (r) =>
            r.due_date
              ? new Date(r.due_date).toLocaleDateString()
              : "—",
          cellClassName: "whitespace-nowrap",
        },
        {
          id: "assigned_to",
          label: "Assigned To",
          accessor: (r) => {
            const u = users.find((u) => u.id === r.assigned_to_user_id);
            return u?.name ?? null;
          },
          sortable: true,
          filterable: true,
          cell: (r) => (
            <div className="flex items-center gap-2">
              <AssignTaskSelect
                taskId={r.task_id!}
                users={users}
                currentUserId={r.assigned_to_user_id}
              />
              {r.assigned_to_user_id && (
                <Link
                  href={`/tasks?assigned_to=${r.assigned_to_user_id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  View all
                </Link>
              )}
            </div>
          ),
        },
        {
          id: "task_status",
          label: "Status",
          accessor: (r) => r.task_status,
          sortable: true,
          filterable: true,
          cell: (r) => (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                r.task_status === "open" || r.task_status === "assigned"
                  ? "bg-amber-100 text-amber-800"
                  : r.task_status === "submitted"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {r.task_status}
            </span>
          ),
        },
      ]}
      data={tasks}
      rowKey={(r) => r.task_id!}
      emptyMessage="No open tasks found. Adjust filters or add tasks."
      searchPlaceholder="Search tasks..."
      actionColumn={{
        header: <span className="sr-only">Actions</span>,
        render: (r) =>
          (r.equipment_site_id || r.site_id) && r.equipment_id ? (
            <Link
              href={`/sites/${r.equipment_site_id || r.site_id}/equipment/${r.equipment_id}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View equipment
            </Link>
          ) : null,
      }}
    />
  );
}
