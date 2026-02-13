"use client";

import Link from "next/link";
import { SortableDataTable } from "@/components/SortableDataTable";

type EquipmentRow = {
  equipment_id: string;
  asset_tag: string;
  equipment_description: string;
  equipment_type: string | null;
  process_unit: string | null;
  requirements: string[];
  equipment_site_id: string;
};

type Site = { id: string; name: string };

export function EquipmentTable({
  equipment,
  sites,
}: {
  equipment: EquipmentRow[];
  sites: Site[];
}) {
  return (
    <SortableDataTable<EquipmentRow>
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
          id: "equipment_description",
          label: "Description",
          accessor: (r) => r.equipment_description,
          sortable: true,
          filterable: true,
        },
        {
          id: "equipment_type",
          label: "Type",
          accessor: (r) => r.equipment_type,
          sortable: true,
          filterable: true,
          cellClassName: "whitespace-nowrap",
        },
        {
          id: "process_unit",
          label: "Process Unit",
          accessor: (r) => r.process_unit,
          sortable: true,
          filterable: true,
          cellClassName: "whitespace-nowrap",
        },
        {
          id: "requirements",
          label: "Requirements",
          accessor: (r) =>
            r.requirements?.length ? r.requirements.join(", ") : null,
          sortable: true,
          filterable: true,
          cell: (r) =>
            r.requirements?.length ? r.requirements.join(", ") : "—",
          cellClassName: "max-w-[200px]",
        },
        {
          id: "site",
          label: "Site",
          accessor: (r) => {
            const site = sites.find((s) => s.id === r.equipment_site_id);
            return site?.name ?? null;
          },
          sortable: true,
          filterable: true,
        },
      ]}
      data={equipment}
      rowKey={(r) => r.equipment_id}
      emptyMessage="No equipment found. Adjust filters or add equipment from a site."
      searchPlaceholder="Search equipment..."
      actionColumn={{
        header: <span className="sr-only">Actions</span>,
        render: (r) =>
          r.equipment_site_id ? (
            <Link
              href={`/sites/${r.equipment_site_id}/equipment/${r.equipment_id}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View details
            </Link>
          ) : null,
      }}
    />
  );
}
