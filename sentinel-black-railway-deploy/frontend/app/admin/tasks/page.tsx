"use client";

import { useState } from "react";

export default function AdminTasksPage() {
  const [showCreate, setShowCreate] = useState(false);

  const tasks = [
    {
      id: "TSK‑001",
      title: "Inspect Dryer Unit",
      priority: "High",
      status: "In Progress",
      assignedTo: "Operator A",
      due: "2026‑07‑22",
    },
    {
      id: "TSK‑002",
      title: "Check Water Overflow Sensors",
      priority: "Medium",
      status: "Pending",
      assignedTo: "Operator B",
      due: "2026‑07‑23",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold">Admin Tasks</h2>
        <p className="text-white/70 border-l-2 border-red-600 pl-3 mt-2">
          Manage mission tasks, assignments, and operational priorities.
        </p>
      </header>

      <button
        onClick={() => setShowCreate(!showCreate)}
        className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
      >
        {showCreate ? "Close" : "Create Task"}
      </button>

      {showCreate && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">New Task</h3>

          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Task Title" />
          <select className="w-full p-2 bg-black border border-white/20 rounded-md">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Assigned To" />
          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Due Date" />

          <button className="px-4 py-2 bg-red-600 rounded-md">Save Task</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white/5 border border-white/10 p-6 rounded-lg">
            <div className="flex justify-between">
              <h3 className="font-semibold">{task.title}</h3>
              <span className="text-xs border border-red-600 px-2 py-0.5 rounded-full text-red-500">
                {task.priority}
              </span>
            </div>

            <p className="text-white/60 text-sm">{task.id}</p>
            <p className="text-white/60 text-sm">Assigned: {task.assignedTo}</p>
            <p className="text-white/60 text-sm">Due: {task.due}</p>

            <span className="text-xs mt-2 inline-block border border-white/20 px-2 py-0.5 rounded-full">
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
