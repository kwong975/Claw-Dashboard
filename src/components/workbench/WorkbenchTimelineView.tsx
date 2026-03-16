import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { interactionIcon, momentumConfig } from "@/lib/attention";
import type { Matter } from "@/lib/attention-types";
import {
  CalendarDays, Mail, MessageSquare, AlertTriangle, ListChecks,
  CheckCircle2, Clock, ArrowUpRight, User,
} from "lucide-react";

interface TimelineEntry {
  date: string;
  sortKey: number;
  type: "interaction" | "commitment" | "signal";
  label: string;
  sublabel: string;
  meta?: string;
  status?: string;
}

function parseSortKey(dateStr: string): number {
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const parts = dateStr.toLowerCase().split(" ");
  const month = months[parts[0]] ?? 2;
  const day = parseInt(parts[1]) || 1;
  return new Date(2026, month, day).getTime();
}

function deriveTimeline(matter: Matter): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  matter.interactions.forEach((interaction) => {
    entries.push({
      date: interaction.date,
      sortKey: parseSortKey(interaction.date),
      type: "interaction",
      label: interaction.title,
      sublabel: interaction.type,
      meta: interaction.relative,
    });
  });

  matter.commitments.forEach((c) => {
    const originDate = c.origin
      ? matter.interactions.find(
          i => i.title.toLowerCase().includes(c.origin!.label.toLowerCase()) ||
               c.origin!.label.toLowerCase().includes(i.title.toLowerCase())
        )?.date
      : undefined;

    entries.push({
      date: originDate ?? c.due,
      sortKey: parseSortKey(originDate ?? c.due) + 0.5,
      type: "commitment",
      label: c.title,
      sublabel: c.owner,
      meta: `Due ${c.due}`,
      status: c.status,
    });
  });

  matter.signals.forEach((s) => {
    const isRelative = s.timestamp.includes("ago") || s.timestamp === "today";
    entries.push({
      date: isRelative ? "Mar 16" : s.timestamp,
      sortKey: isRelative ? parseSortKey("Mar 16") : parseSortKey(s.timestamp),
      type: "signal",
      label: s.description,
      sublabel: s.source,
      meta: s.timestamp,
    });
  });

  entries.sort((a, b) => a.sortKey - b.sortKey);
  return entries;
}

const typeConfig = {
  interaction: {
    icon: CalendarDays,
    dotColor: "bg-[hsl(var(--info))]",
    label: "Interaction",
  },
  commitment: {
    icon: ListChecks,
    dotColor: "bg-[hsl(var(--primary))]",
    label: "Commitment",
  },
  signal: {
    icon: AlertTriangle,
    dotColor: "bg-[hsl(var(--warning))]",
    label: "Signal",
  },
};

interface WorkbenchTimelineViewProps {
  matter: Matter;
}

export function WorkbenchTimelineView({ matter }: WorkbenchTimelineViewProps) {
  const entries = useMemo(() => deriveTimeline(matter), [matter]);
  const mom = momentumConfig[matter.momentum];

  // Group by date
  const groups = useMemo(() => {
    const map = new Map<string, TimelineEntry[]>();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-base font-semibold text-foreground">{matter.title}</h2>
          <span className={cn("rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", mom.bg, mom.color)}>
            {mom.label}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {entries.length} events across {groups.length} dates
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-5">
        {Object.entries(typeConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("h-2 w-2 rounded-full", config.dotColor)} />
            <span className="text-[10px] text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border" />

        {groups.map(([dateLabel, groupEntries]) => (
          <div key={dateLabel} className="mb-6">
            {/* Date marker */}
            <div className="relative flex items-center gap-3 mb-2.5">
              <div className="relative z-10 h-[15px] w-[15px] rounded-full border-2 border-border bg-card flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              </div>
              <span className="text-[11px] font-semibold text-foreground">{dateLabel}</span>
              <span className="text-[10px] text-muted-foreground">
                {groupEntries.length} {groupEntries.length === 1 ? "event" : "events"}
              </span>
            </div>

            {/* Entries */}
            <div className="ml-[7px] border-l border-transparent pl-6 space-y-1">
              {groupEntries.map((entry, ei) => {
                const config = typeConfig[entry.type];
                const Icon = config.icon;
                const statusIcon = entry.status === "done"
                  ? CheckCircle2
                  : entry.status === "overdue"
                  ? Clock
                  : null;

                return (
                  <div
                    key={`${dateLabel}-${ei}`}
                    className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2.5 transition-colors hover:bg-accent/30"
                  >
                    {/* Type dot */}
                    <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", config.dotColor)} />

                    {/* Icon */}
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground leading-snug">{entry.label}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="capitalize">{entry.sublabel}</span>
                        {entry.meta && (
                          <>
                            <span>·</span>
                            <span className={entry.status === "overdue" ? "text-[hsl(var(--critical))]" : ""}>
                              {entry.meta}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status badge */}
                    {statusIcon && (
                      <div className="mt-0.5">
                        {entry.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" />}
                        {entry.status === "overdue" && <Clock className="h-3.5 w-3.5 text-[hsl(var(--critical))]" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <p className="ml-8 text-[11px] text-muted-foreground italic">No timeline events</p>
        )}
      </div>
    </div>
  );
}
