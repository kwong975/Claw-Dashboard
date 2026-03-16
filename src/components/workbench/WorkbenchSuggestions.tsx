import { Lightbulb, Check } from "lucide-react";
import type { RepairSuggestion } from "@/lib/workbench-types";

interface WorkbenchSuggestionsProps {
  suggestions: RepairSuggestion[];
  onAccept: (suggestion: RepairSuggestion) => void;
}

export function WorkbenchSuggestions({ suggestions, onAccept }: WorkbenchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-1.5 mb-4">
      {suggestions.map(s => (
        <div
          key={s.id}
          className="flex items-start gap-2.5 rounded-md border border-[hsl(var(--info)/0.15)] bg-[hsl(var(--info)/0.04)] px-3 py-2"
        >
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--info))]" />
          <p className="flex-1 text-[11px] leading-relaxed text-muted-foreground">{s.message}</p>
          <button
            onClick={() => onAccept(s)}
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-[hsl(var(--info))] hover:bg-[hsl(var(--info)/0.1)] transition-colors"
          >
            <Check className="h-3 w-3" />
            {s.actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}
