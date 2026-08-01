import "./../styles/globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-sb-bg text-sb-text flex">

        {/* Left Rail — FileGrid */}
        <aside className="w-72 bg-sb-bg border-r border-sb-border p-4">
          <div className="text-sb-textSecondary uppercase text-xs mb-4">
            FileGrid
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-sb-surfaceAlt p-6">
          {children}
        </main>

        {/* Right Rail — Nebula */}
        <aside className="w-80 bg-sb-bg border-l border-sb-border p-4">
          <div className="text-sb-textSecondary uppercase text-xs mb-4">
            Nebula Agents
          </div>
        </aside>

      </body>
    </html>
  );
}

