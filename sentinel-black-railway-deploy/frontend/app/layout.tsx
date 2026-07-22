import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex">
        {/* GLOBAL SIDEBAR */}
        <aside className="w-64 border-r border-red-900/40 p-6 bg-black">
          <h1 className="text-xl font-bold mb-6 tracking-wide">Sentinel‑Black</h1>

          <nav className="space-y-2">
            <a href="/dashboard" className="block px-3 py-2 rounded-md border border-white/10 hover:border-red-600 hover:bg-red-600/10">
              Dashboard
            </a>
            <a href="/evidence" className="block px-3 py-2 rounded-md border border-white/10 hover:border-red-600 hover:bg-red-600/10">
              Evidence Vault
            </a>
            <a href="/events" className="block px-3 py-2 rounded-md border border-white/10 hover:border-red-600 hover:bg-red-600/10">
              Events
            </a>
            <a href="/tasks" className="block px-3 py-2 rounded-md border border-white/10 hover:border-red-600 hover:bg-red-600/10">
              Tasks
            </a>
            <a href="/journal" className="block px-3 py-2 rounded-md border border-white/10 hover:border-red-600 hover:bg-red-600/10">
              Journal Vault
            </a>
          </nav>
        </aside>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-8">{children}</main>
      </body>
    </html>
  );
}
