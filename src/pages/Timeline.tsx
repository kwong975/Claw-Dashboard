import { useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, Bot, AlertTriangle, CheckCircle2, Clock, Zap, Filter } from "lucide-react";

type EventType = "system" | "agent" | "cron" | "incident" | "deployment";

interface TimelineEvent {
  id: string;
  time: string;
  type: EventType;
  title: string;
  description: string;
  agent?: string;
}

const events: TimelineEvent[] = [
  { id: "1", time: "14:32:01", type: "agent", title: "data-ingest-01 completed batch #4820", description: "Processed 2,847 records in 4m 12s", agent: "data-ingest-01" },
  { id: "2", time: "14:31:45", type: "system", title: "Gateway alert cleared", description: "api-gateway latency returned to normal (<100ms)" },
  { id: "3", time: "14:30:12", type: "agent", title: "summarizer-alpha started Q4 report batch", description: "Processing 14 documents", agent: "summarizer-alpha" },
  { id: "4", time: "14:28:55", type: "cron", title: "report-daily attempt failed", description: "Retry 2 of 3. Error: upstream timeout", agent: "report-daily" },
  { id: "5", time: "14:25:30", type: "agent", title: "classifier-v2 entered idle state", description: "No pending classification requests", agent: "classifier-v2" },
  { id: "6", time: "14:22:18", type: "system", title: "Health check passed", description: "All 23 monitored endpoints responding" },
  { id: "7", time: "14:20:00", type: "agent", title: "notifier-main cleared notification queue", description: "14 notifications delivered successfully", agent: "notifier-main" },
  { id: "8", time: "14:15:00", type: "cron", title: "sync-external completed", description: "Synced 1,204 records from 3 sources" },
  { id: "9", time: "14:10:22", type: "deployment", title: "classifier-v2 model updated", description: "Deployed model v2.4.1 with improved accuracy" },
  { id: "10", time: "14:05:00", type: "cron", title: "health-check completed", description: "All systems nominal" },
  { id: "11", time: "13:58:14", type: "agent", title: "qa-checker reviewed 12 outputs", description: "All outputs passed quality threshold (>95%)", agent: "qa-checker" },
  { id: "12", time: "13:45:00", type: "system", title: "Memory usage alert", description: "summarizer-alpha approaching 80% memory limit" },
];

const typeConfig: Record<EventType, { icon: typeof Activity; color: string; bg: string }> = {
  system:     { icon: Zap,           color: "text-info",    bg: "bg-info/10" },
  agent:      { icon: Bot,           color: "text-primary", bg: "bg-primary/10" },
  cron:       { icon: Clock,         color: "text-muted-foreground", bg: "bg-muted" },
  incident:   { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  deployment: { icon: CheckCircle2,  color: "text-success", bg: "bg-success/10" },
};

const filters: EventType[] = ["system", "agent", "cron", "incident", "deployment"];

export default function TimelinePage() {
  const [active, setActive] = useState<Set<EventType>>(new Set(filters));

  const toggle = (t: EventType) => {
    const next = new Set(active);
    if (next.has(t)) { if (next.size > 1) next.delete(t); }
    else next.add(t);
    setActive(next);
  };

  const filtered = events.filter((e) => active.has(e.type));

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Timeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Chronological event feed across all systems</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {filters.map((f) => {
          const cfg = typeConfig[f];
          return (
            <button
              key={f}
              onClick={() => toggle(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors border",
                active.has(f)
                  ? "border-border bg-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      {filtered.length > 0 ? (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-1">
            {filtered.map((event) => {
              const cfg = typeConfig[event.type];
              const Icon = cfg.icon;
              return (
                <div key={event.id} className="relative flex gap-4 pl-0">
                  <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border", cfg.bg)}>
                    <Icon className={cn("h-4 w-4", cfg.color)} />
                  </div>
                  <div className="flex-1 rounded-lg border border-border bg-card p-3 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground shrink-0">{event.time}</span>
                    </div>
                    {event.agent && (
                      <span className="inline-block mt-2 font-mono text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground">{event.agent}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No events match the current filters</p>
        </div>
      )}
    </div>
  );
}
