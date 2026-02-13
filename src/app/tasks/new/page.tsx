import Link from "next/link";
import { Suspense } from "react";
import { getSites } from "@/lib/data/sites";
import { getAllEquipment } from "@/lib/data/equipment";
import { getTaskTemplatesWithSite } from "@/lib/data/task-templates";
import { getUsers } from "@/lib/data/users";
import { AddTaskForm } from "./AddTaskForm";

export const dynamic = "force-dynamic";

export default async function AddTaskPage() {
  const [sites, equipment, taskTemplates, users] = await Promise.all([
    getSites(),
    getAllEquipment(),
    getTaskTemplatesWithSite(),
    getUsers(),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/tasks" className="text-slate-500 hover:text-slate-700">
          ← Tasks
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-slate-800">Add Task</h1>
      <p className="mt-1 text-slate-600">
        Create a new compliance task and assign it to equipment.
      </p>

      <div className="mt-8 max-w-2xl">
        <AddTaskForm
          sites={sites}
          equipment={equipment}
          taskTemplates={taskTemplates}
          users={users}
        />
      </div>
    </div>
  );
}
