"use client";

import { SBButton } from "@/components/ui/Button";

export default function TopBar() {
  return (
    <div className="
      w-full h-14 bg-sb-surfaceAlt border-b border-sb-border
      flex items-center justify-between px-6
      backdrop-blur-md
    ">
      {/* Left */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-wide">
          Sentinel Black
        </h1>

        <span className="text-sb-textSecondary text-sm">
          Forensic Intelligence OS
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <SBButton variant="ghost">Settings</SBButton>
        <SBButton variant="ghost">Profile</SBButton>
      </div>
    </div>
  );
}
