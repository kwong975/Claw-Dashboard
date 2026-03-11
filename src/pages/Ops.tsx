import { StatusBadge, type StatusType } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { Clock, User, AlertTriangle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  agent: string;
  priority: "high" | "medium" | "low";
  time: string;
}

const columns: { key: string; label: string; status: StatusType; items: Task[] }[] = [
  {
    key: "queued", label: "Queued", status: "pending",
    items: [
      { id: "q1", title: "Process vendor invoices", agent: "data-ingest-02", priority: "medium", time: "Queued 4m ago" },
      { id: "q2", title: "Generate weekly summary", agent: "report-builder", priority: "low", time: "Queued 12m ago" },
    ],
  },
  {
    key: "running", label: "Running", status: "running",
    items: [
      { id: "r1", title: "Batch #4821 ingestion", agent: "data-ingest-01", priority: "high", time: "Running 2m" },
      { id: "r2", title: "Q4 report summarization", agent: "summarizer-alpha", priority: "high", time: "Running 8m" },
      { id: "r3", title: "Support ticket triage", agent: "summarizer-beta", priority: "medium", time: "Running 3m" },
    ],
  },
  {
    key: "blocked", label: "Blocked", status: "critical",
    items: [
      { id: "b1", title: "External API sync", agent: "data-ingest-01", priority: "high", time: "Blocked 22m" },
    ],
  },
  {
    key: "waiting", label: "Waiting Human", status: "warning",
    items: [
      { id: "w1", title: "Draft email approval", agent: "email-drafter", priority: "medium", time: "Waiting 1h" },
      { id: "w2", title: "Budget report sign-off", agent: "report-builder", priority: "high", time: "Waiting 45m" },
    ],
  },
  {
    key: "done", label: "Done", status: "healthy",
    items: [
      { id: "d1", title: "Batch #4820 ingestion", agent: "data-ingest-01", priority: "high", time: "Completed 5m ago" },
      { id: "d2", title: "Daily health report", agent: "monitor-sentinel", priority: "medium", time: "Completed 32m ago" },
      { id: "d3", title: "Log cleanup", agent: "monitor-sentinel", priority: "low", time: "Completed 1h ago" },
    ],
  },
];

const priorityColors = {
  high: "border-l-critical",
  medium: "border-l-warning",
  low: "border-l-border",
};

export default function OpsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-6 pb-4">
        <h1 className="font-display text-xl font-semibold text-foreground">Ops Board</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Operational work tracking across the agent fleet</p>
      </div>

      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((col) => (
            <div key={col.key} className="w-72 flex flex-col shrink-0">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-sm font-semibold text-foreground">{col.label}</h2>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-mono text-muted-foreground">
                    {col.items.length}
                  </span>
                </div>
                <StatusBadge status={col.status} size="sm" />
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {col.items.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "rounded-lg border border-border bg-card p-3 border-l-2 hover:border-primary/30 transition-colors cursor-pointer",
                      priorityColors[task.priority]
                    )}
                  >
                    <p className="text-sm font-medium text-foreground mb-2">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{task.agent}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{task.time}</span>
                    </div>
                  </div>
                ))}

                {col.items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-border">
                    <p className="text-xs text-muted-foreground">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
