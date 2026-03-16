import { cn } from "@/lib/utils";
import { momentumConfig } from "@/lib/attention";
import { deriveMatterWarnings } from "@/lib/workbench-types";
import { AlertTriangle, Users, MessageSquare, ListChecks } from "lucide-react";
import type { Matter } from "@/lib/attention-types";

interface MatterNavigatorProps {
  matters: Matter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MatterNavigator({ matters, selectedId, onSelect }: MatterNavigatorProps) {
  return (
    <div className="flex h-full flex-col border-r border-border">
      <div className="flex h-11 items-center border-b border-border px-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Matters
        </h2>
        <span className="ml-auto text-[10px] text-muted-foreground">{matters.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {matters.map(m => {
          const mom = momentumConfig[m.momentum];
          const warnings = deriveMatterWarnings(m);
          const isSelected = m.id === selectedId;

          return (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={cn(
                "w-full rounded-md px-3 py-2.5 text-left transition-colors",
                isSelected
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50 text-foreground"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-medium leading-tight line-clamp-2">{m.title}</span>
                <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest", mom.bg, mom.color)}>
                  {mom.label}
                </span>
              </div>

              {/* Participants preview */}
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {m.participants.slice(0, 2).join(", ")}
                  {m.participants.length > 2 && ` +${m.participants.length - 2}`}
                </span>
              </div>

              {/* Counts */}
              <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-2.5 w-2.5" />
                  {m.interactions.length}
                </span>
                <span className="flex items-center gap-1">
                  <ListChecks className="h-2.5 w-2.5" />
                  {m.commitments.length}
                </span>
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {warnings.map((w, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-medium bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]"
                    >
                      <AlertTriangle className="h-2 w-2" />
                      {w.label}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
