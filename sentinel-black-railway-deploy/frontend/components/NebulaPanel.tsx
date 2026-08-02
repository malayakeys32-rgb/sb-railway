import { ReactNode } from "react";
import { SBInput } from "./ui/Input";

interface NebulaPanelProps {
  agent: ReactNode;
  children: ReactNode;
}

export default function NebulaPanel({ agent, children }: NebulaPanelProps) {
  return (
    <div className="
      bg-sb-surfaceAlt border border-sb-border rounded-lg p-4
      flex flex-col h-full
    ">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{agent}</h2>
        <p className="text-sb-textSecondary text-sm">
          AI Intelligence Module
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {children}
      </div>

      <div className="mt-4">
        <SBInput placeholder="Ask Nebula…" />
      </div>
    </div>
  );
}
