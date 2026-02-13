"use client";

import { useTransition } from "react";
import { assignTaskAction } from "./actions";

type UserOption = { id: string; name: string };

type Props = {
  taskId: string;
  users: UserOption[];
  currentUserId: string | null;
};

export function AssignTaskSelect({ taskId, users, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(userId: string) {
    const value = userId === "" ? null : userId;
    startTransition(async () => {
      await assignTaskAction(taskId, value);
    });
  }

  return (
    <select
      value={currentUserId ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isPending}
      className="min-w-[140px] rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      title="Assign task to user"
    >
      <option value="">Unassigned</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
        </option>
      ))}
    </select>
  );
}
