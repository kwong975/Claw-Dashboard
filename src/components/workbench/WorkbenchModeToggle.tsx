import { cn } from "@/lib/utils";
import type { WorkbenchViewMode } from "@/lib/workbench-types";

const viewModes: { value: WorkbenchViewMode; label: string }[] = [
  { value: "structure", label: "Structure" },
  { value: "timeline", label: "Timeline" },
  { value: "replay", label: "Replay" },
];

interface WorkbenchModeToggleProps {
  value: WorkbenchViewMode;
  onChange: (mode: WorkbenchViewMode) => void;
}

export function WorkbenchModeToggle({ value, onChange }: WorkbenchModeToggleProps) {
  return (
    <div className="flex items-center gap-1">
      {viewModes.map(mode => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          className={cn(
            "rounded-md px-3 py-1 text-[11px] font-medium transition-colors",
            value === mode.value
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
