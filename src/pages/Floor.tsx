import { useState } from "react";
import { StatusBadge, type StatusType } from "@/components/StatusBadge";
import { Bot, X, Clock, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  role: string;
  group: string;
  status: StatusType;
  task: string;
  uptime: string;
  tasksCompleted: number;
  lastActive: string;
  model: string;
}

const agents: Agent[] = [
  { id: "1", name: "data-ingest-01", role: "Data Pipeline", group: "Ingestion", status: "running", task: "Processing batch #4821", uptime: "14d 6h", tasksCompleted: 12847, lastActive: "now", model: "custom-v3" },
  { id: "2", name: "data-ingest-02", role: "Data Pipeline", group: "Ingestion", status: "idle", task: "Awaiting input", uptime: "14d 6h", tasksCompleted: 11203, lastActive: "8m ago", model: "custom-v3" },
  { id: "3", name: "summarizer-alpha", role: "Text Analysis", group: "Analysis", status: "running", task: "Summarizing Q4 reports", uptime: "7d 2h", tasksCompleted: 3421, lastActive: "now", model: "gpt-4o" },
  { id: "4", name: "summarizer-beta", role: "Text Analysis", group: "Analysis", status: "running", task: "Processing support tickets", uptime: "7d 2h", tasksCompleted: 2918, lastActive: "now", model: "gpt-4o" },
  { id: "5", name: "classifier-v2", role: "Classification", group: "Analysis", status: "idle", task: "Awaiting input", uptime: "21d 0h", tasksCompleted: 45102, lastActive: "2h ago", model: "claude-3" },
  { id: "6", name: "monitor-sentinel", role: "System Monitor", group: "Infrastructure", status: "running", task: "Watching 23 endpoints", uptime: "30d 0h", tasksCompleted: 86400, lastActive: "now", model: "internal" },
  { id: "7", name: "notifier-main", role: "Notifications", group: "Infrastructure", status: "healthy", task: "Queue clear", uptime: "30d 0h", tasksCompleted: 5621, lastActive: "3m ago", model: "internal" },
  { id: "8", name: "report-builder", role: "Report Gen", group: "Output", status: "running", task: "Compiling weekly digest", uptime: "14d 6h", tasksCompleted: 890, lastActive: "now", model: "gpt-4o" },
  { id: "9", name: "email-drafter", role: "Communication", group: "Output", status: "paused", task: "Paused by operator", uptime: "5d 1h", tasksCompleted: 234, lastActive: "1d ago", model: "claude-3" },
  { id: "10", name: "qa-checker", role: "Quality", group: "Quality", status: "running", task: "Reviewing 8 outputs", uptime: "21d 0h", tasksCompleted: 7845, lastActive: "now", model: "gpt-4o" },
  { id: "11", name: "validator-core", role: "Validation", group: "Quality", status: "healthy", task: "Standby", uptime: "21d 0h", tasksCompleted: 4502, lastActive: "15m ago", model: "internal" },
  { id: "12", name: "planner-main", role: "Orchestration", group: "Control", status: "running", task: "Coordinating 4 workflows", uptime: "30d 0h", tasksCompleted: 1203, lastActive: "now", model: "claude-3" },
];

const groups = [...new Set(agents.map((a) => a.group))];

export default function FloorPage() {
  const [selected, setSelected] = useState<Agent | null>(null);

  return (
    <div className="flex h-full">
      {/* Main area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">Agent Floor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visual overview of all active agents by function</p>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{agents.length} agents</span>
          <span className="text-success">{agents.filter(a => a.status === "running").length} running</span>
          <span className="text-muted-foreground">{agents.filter(a => a.status === "idle").length} idle</span>
          <span className="text-warning">{agents.filter(a => a.status === "paused").length} paused</span>
        </div>

        {groups.map((group) => (
          <div key={group}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{group}</h2>
              <span className="text-xs text-muted-foreground">({agents.filter(a => a.group === group).length})</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {agents.filter(a => a.group === group).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelected(agent)}
                  className={cn(
                    "rounded-lg border bg-card p-4 text-left transition-all hover:border-primary/40",
                    selected?.id === agent.id ? "border-primary ring-1 ring-primary/20" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm font-medium text-foreground">{agent.name}</span>
                    </div>
                    <StatusBadge status={agent.status} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{agent.role}</p>
                  <p className="text-xs text-foreground/70 truncate">{agent.task}</p>
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-border">
                    <span className="font-mono text-xs text-muted-foreground">{agent.tasksCompleted.toLocaleString()} tasks</span>
                    <span className="text-xs text-muted-foreground">↑ {agent.uptime}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-display text-sm font-semibold">Agent Detail</h3>
            <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-foreground">{selected.name}</p>
                <p className="text-xs text-muted-foreground">{selected.role}</p>
              </div>
            </div>

            <StatusBadge status={selected.status} size="md" />

            <div className="space-y-3">
              {[
                { label: "Current Task", value: selected.task },
                { label: "Group", value: selected.group },
                { label: "Model", value: selected.model },
                { label: "Uptime", value: selected.uptime },
                { label: "Tasks Completed", value: selected.tasksCompleted.toLocaleString() },
                { label: "Last Active", value: selected.lastActive },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-foreground">{value}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h4>
              {[
                { time: "14:32", event: "Completed batch #4820" },
                { time: "14:28", event: "Started batch #4821" },
                { time: "14:15", event: "Health check passed" },
              ].map((item, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="font-mono text-muted-foreground w-10 shrink-0">{item.time}</span>
                  <span className="text-foreground/70">{item.event}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border">
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                View full history <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
