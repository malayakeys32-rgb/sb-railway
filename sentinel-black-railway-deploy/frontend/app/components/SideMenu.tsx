"use client";

import Link from "next/link";

export default function SideMenu() {
  const items = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Cases", href: "/cases" },
    { label: "Evidence Grid", href: "/evidence" },
    { label: "Signals", href: "/signals" },
    { label: "Nebula Agents", href: "/nebula" }
  ];

  return (
    <aside className="
      w-64 h-full bg-sb-surface border-r border-sb-border
      flex flex-col py-6 px-4
    ">
      <div className="text-sb-textSecondary uppercase text-xs mb-6">
        Navigation
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="
              px-3 py-2 rounded-md text-sm
              text-sb-textSecondary hover:text-sb-text
              hover:bg-sb-surfaceAlt hover:border-sb-blue
              border border-transparent transition-all
            "
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
