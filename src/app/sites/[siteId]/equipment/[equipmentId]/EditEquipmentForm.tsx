"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateEquipmentAction } from "./actions";

type EquipmentData = {
  id: string;
  asset_tag: string;
  description: string;
  equipment_site_id: string;
  sap_equipment_number?: string | null;
  sort_field?: string | null;
  functional_loc?: string | null;
  location_description?: string | null;
  equipment_type?: string | null;
  equipment_subtype?: string | null;
  process_unit?: string | null;
  area_location?: string | null;
  is_active?: boolean;
};

type Props = { equipment: EquipmentData };

export function EditEquipmentForm({ equipment }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const get = (k: string) => (formData.get(k) as string)?.trim() || undefined;

    const asset_tag = get("asset_tag");
    const description = get("description");
    if (!asset_tag) {
      setError("Asset tag is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await updateEquipmentAction({
        equipment_id: equipment.id,
        asset_tag,
        description: description || "",
        sap_equipment_number: get("sap_equipment_number") || null,
        sort_field: get("sort_field") || null,
        functional_loc: get("functional_loc") || null,
        location_description: get("location_description") || null,
        equipment_type: get("equipment_type") || null,
        equipment_subtype: get("equipment_subtype") || null,
        process_unit: get("process_unit") || null,
        area_location: get("area_location") || null,
        is_active: formData.get("is_active") === "on",
      });
      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update equipment");
    }
    setIsSubmitting(false);
  }

  if (!isEditing) {
    return (
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit equipment
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-700">Edit Equipment</h2>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-asset_tag" className="block text-sm font-medium text-slate-700">
              Asset Tag *
            </label>
            <input
              id="edit-asset_tag"
              name="asset_tag"
              type="text"
              required
              defaultValue={equipment.asset_tag}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="edit-sap_equipment_number" className="block text-sm font-medium text-slate-700">
              SAP Equipment Number
            </label>
            <input
              id="edit-sap_equipment_number"
              name="sap_equipment_number"
              type="text"
              defaultValue={equipment.sap_equipment_number ?? ""}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium text-slate-700">
            Description *
          </label>
          <textarea
            id="edit-description"
            name="description"
            rows={2}
            defaultValue={equipment.description ?? ""}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-equipment_type" className="block text-sm font-medium text-slate-700">
              Equipment Type
            </label>
            <input
              id="edit-equipment_type"
              name="equipment_type"
              type="text"
              defaultValue={equipment.equipment_type ?? ""}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="edit-equipment_subtype" className="block text-sm font-medium text-slate-700">
              Equipment Subtype
            </label>
            <input
              id="edit-equipment_subtype"
              name="equipment_subtype"
              type="text"
              defaultValue={equipment.equipment_subtype ?? ""}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-process_unit" className="block text-sm font-medium text-slate-700">
              Process Unit
            </label>
            <input
              id="edit-process_unit"
              name="process_unit"
              type="text"
              defaultValue={equipment.process_unit ?? ""}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="edit-area_location" className="block text-sm font-medium text-slate-700">
              Area / Location
            </label>
            <input
              id="edit-area_location"
              name="area_location"
              type="text"
              defaultValue={equipment.area_location ?? ""}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-functional_loc" className="block text-sm font-medium text-slate-700">
              Functional Location
            </label>
            <input
              id="edit-functional_loc"
              name="functional_loc"
              type="text"
              defaultValue={equipment.functional_loc ?? ""}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="edit-sort_field" className="block text-sm font-medium text-slate-700">
              Sort Field
            </label>
            <input
              id="edit-sort_field"
              name="sort_field"
              type="text"
              defaultValue={equipment.sort_field ?? ""}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-location_description" className="block text-sm font-medium text-slate-700">
            Location Description
          </label>
          <input
            id="edit-location_description"
            name="location_description"
            type="text"
            defaultValue={equipment.location_description ?? ""}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="edit-is_active"
            name="is_active"
            type="checkbox"
            defaultChecked={equipment.is_active !== false}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <label htmlFor="edit-is_active" className="text-sm font-medium text-slate-700">
            Active
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
