"use client";

import { useState } from "react";

export default function AdminEventsPage() {
  const [showCreate, setShowCreate] = useState(false);

  const events = [
    {
      id: "EVT‑001",
      title: "Maintenance Check",
      date: "2026‑07‑22",
      time: "14:00",
      location: "Bay 4",
    },
    {
      id: "EVT‑002",
      title: "Operator Briefing",
      date: "2026‑07‑23",
      time: "09:00",
      location: "Control Room",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold">Admin Events</h2>
        <p className="text-white/70 border-l-2 border-red-600 pl-3 mt-2">
          Manage appointments, mission events, and operational schedules.
        </p>
      </header>

      <button
        onClick={() => setShowCreate(!showCreate)}
        className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700"
      >
        {showCreate ? "Close" : "Create Event"}
      </button>

      {showCreate && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg space-y-4">
          <h3 className="font-semibold">New Event</h3>

          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Event Title" />
          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Date" />
          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Time" />
          <input className="w-full p-2 bg-black border border-white/20 rounded-md" placeholder="Location" />

          <button className="px-4 py-2 bg-red-600 rounded-md">Save Event</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white/5 border border-white/10 p-6 rounded-lg">
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-white/60 text-sm">{event.id}</p>
            <p className="text-white/60 text-sm">{event.date} • {event.time}</p>
            <p className="text-white/60 text-sm">Location: {event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
