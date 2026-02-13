"use client";

import { useMemo, useState } from "react";

export type SortDirection = "asc" | "desc" | null;

export type ColumnDef<T> = {
  id: string;
  label: string;
  /** Returns sortable/filterable value for this column */
  accessor: (row: T) => string | number | null | undefined;
  sortable?: boolean;
  filterable?: boolean;
  /** Custom cell renderer - if not provided, uses String(accessor(row)) */
  cell?: (row: T) => React.ReactNode;
  /** Column header class (e.g. for width) */
  headerClassName?: string;
  /** Cell class */
  cellClassName?: string;
};

export type SortableDataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  /** Optional last column (e.g. Actions) - not sortable/filterable */
  actionColumn?: {
    header: React.ReactNode;
    render: (row: T) => React.ReactNode;
    cellClassName?: string;
  };
  rowKey: (row: T) => string;
  emptyMessage?: string;
  /** Optional global search bar - searches across all columns */
  searchPlaceholder?: string;
};

function SortIcon({ direction }: { direction: SortDirection }) {
  if (!direction) return <span className="ml-1 text-slate-400">↕</span>;
  return (
    <span className="ml-1 font-medium text-slate-600">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

export function SortableDataTable<T>({
  columns,
  data,
  actionColumn,
  rowKey,
  emptyMessage = "No data found.",
  searchPlaceholder,
}: SortableDataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const updateFilter = (columnId: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [columnId]: value.trim(),
    }));
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply global search (any column)
    const searchVal = search.trim().toLowerCase();
    if (searchVal) {
      result = result.filter((row) =>
        columns.some((col) => {
          const val = col.accessor(row);
          const str = val != null ? String(val).toLowerCase() : "";
          return str.includes(searchVal);
        })
      );
    }

    // Apply column filters
    for (const col of columns) {
      if (!col.filterable) continue;
      const filterVal = filters[col.id]?.toLowerCase();
      if (!filterVal) continue;
      result = result.filter((row) => {
        const val = col.accessor(row);
        const str = val != null ? String(val).toLowerCase() : "";
        return str.includes(filterVal);
      });
    }

    // Apply sort
    const col = columns.find((c) => c.id === sortColumn);
    if (col && sortDirection) {
      result.sort((a, b) => {
        const aVal = col.accessor(a);
        const bVal = col.accessor(b);
        const aStr = aVal != null ? String(aVal) : "";
        const bStr = bVal != null ? String(bVal) : "";
        const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
        return sortDirection === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, columns, filters, search, sortColumn, sortDirection]);

  if (filteredAndSortedData.length === 0) {
    return (
      <div className="mt-6 space-y-4">
        {searchPlaceholder && (
          <div className="flex max-w-sm">
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
              aria-label="Search"
            />
          </div>
        )}
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {searchPlaceholder && (
        <div className="flex max-w-sm">
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
            aria-label="Search"
          />
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 ${col.headerClassName ?? ""}`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    {(col.sortable ?? true) ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className="flex items-center hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 rounded"
                      >
                        {col.label}
                        <SortIcon
                          direction={sortColumn === col.id ? sortDirection : null}
                        />
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </div>
                  {col.filterable && (
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={filters[col.id] ?? ""}
                      onChange={(e) => updateFilter(col.id, e.target.value)}
                      className="mt-0.5 w-full max-w-[140px] rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      aria-label={`Filter by ${col.label}`}
                    />
                  )}
                </div>
              </th>
            ))}
            {actionColumn && (
              <th className="relative px-4 py-3">
                <span className="sr-only">Actions</span>
                {actionColumn.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {filteredAndSortedData.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50">
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={`px-4 py-3 text-slate-600 ${col.cellClassName ?? ""}`}
                >
                  {col.cell ? col.cell(row) : String(col.accessor(row) ?? "—")}
                </td>
              ))}
              {actionColumn && (
                <td
                  className={`whitespace-nowrap px-4 py-3 ${
                    actionColumn.cellClassName ?? ""
                  }`}
                >
                  {actionColumn.render(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
