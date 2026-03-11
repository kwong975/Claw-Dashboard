import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Shield, Bot, Clock, AlertTriangle, Activity, XCircle, ArrowRight, CheckCircle2, Zap } from "lucide-react";

const metrics = [
  { label: "Gateway", value: "99.8%", icon: Shield, status: "healthy" as const, detail: "Avg latency 42ms" },
  { label: "Active Agents", value: "12", icon: Bot, status: "healthy" as const, detail: "2 idle" },
  { label: "Cron Health", value: "94%", icon: Clock, status: "warning" as const, detail: "1 job degraded" },
  { label: "Incidents", value: "0", icon: AlertTriangle, status: "healthy" as const, detail: "Last: 3d ago" },
  { label: "Events", value: "1,247", icon: Activity, status: "neutral" as const, detail: "Last hour" },
  { label: "Errors", value: "3", icon: XCircle, status: "warning" as const, detail: "Non-critical" },
];

const fleet = [
  { name: "data-ingest-01", role: "Ingestion", status: "running" as const, task: "Processing batch #4821" },
  { name: "summarizer-alpha", role: "Analysis", status: "running" as const, task: "Summarizing Q4 reports" },
  { name: "classifier-v2", role: "Classification", status: "idle" as const, task: "Awaiting input" },
  { name: "monitor-sentinel", role: "Monitoring", status: "running" as const, task: "Watching 23 endpoints" },
  { name: "notifier-main", role: "Notifications", status: "healthy" as const, task: "Queue clear" },
];

const attention = [
  { title: "Cron job report-daily showing elevated failure rate", severity: "warning" as const, time: "12m ago" },
  { title: "Agent classifier-v2 idle for >2h", severity: "warning" as const, time: "2h ago" },
];

const feed = [
  { time: "14:32:01", event: "data-ingest-01 completed batch #4820", type: "success" },
  { time: "14:31:45", event: "monitor-sentinel alert cleared: api-gateway", type: "info" },
  { time: "14:30:12", event: "summarizer-alpha started Q4 report batch", type: "info" },
  { time: "14:28:55", event: "Cron report-daily attempt failed (retry 2/3)", type: "warning" },
  { time: "14:25:30", event: "classifier-v2 entered idle state", type: "neutral" },
  { time: "14:22:18", event: "Gateway health check passed", type: "success" },
  { time: "14:20:00", event: "notifier-main cleared 14 pending notifications", type: "success" },
];

const crons = [
  { name: "report-daily", schedule: "0 6 * * *", lastRun: "Success", nextRun: "Tomorrow 06:00", reliability: "94%" },
  { name: "sync-external", schedule: "*/15 * * * *", lastRun: "Success", nextRun: "14:45", reliability: "99.2%" },
  { name: "cleanup-logs", schedule: "0 2 * * 0", lastRun: "Success", nextRun: "Sun 02:00", reliability: "100%" },
  { name: "health-check", schedule: "*/5 * * * *", lastRun: "Success", nextRun: "14:35", reliability: "99.8%" },
];

const feedColor: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  neutral: "text-muted-foreground",
};

export default function CommandPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-foreground">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Operational overview — all systems</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="healthy" label="All Systems Nominal" size="md" pulse />
          <span className="font-mono text-xs text-muted-foreground">14:32 UTC</span>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-6 gap-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Primary Content */}
      <div className="grid grid-cols-3 gap-4">
        {/* Fleet Status */}
        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-display text-sm font-semibold">Fleet Status</h2>
            <span className="font-mono text-xs text-muted-foreground">{fleet.length} agents</span>
          </div>
          <div className="divide-y divide-border">
            {fleet.map((a) => (
              <div key={a.name} className="flex items-center gap-3 px-4 py-3">
                <StatusBadge status={a.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.task}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{a.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-display text-sm font-semibold">Needs Attention</h2>
            <span className="font-mono text-xs text-warning">{attention.length}</span>
          </div>
          {attention.length > 0 ? (
            <div className="divide-y divide-border">
              {attention.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mb-2" />
              <p className="text-sm text-muted-foreground">Nothing requires attention</p>
            </div>
          )}
          <div className="border-t border-border px-4 py-2.5">
            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all alerts <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Live Feed */}
        <div className="col-span-1 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-semibold">Live Feed</h2>
              <span className="h-2 w-2 rounded-full bg-success animate-status-pulse" />
            </div>
            <span className="font-mono text-xs text-muted-foreground">streaming</span>
          </div>
          <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
            {feed.map((f, i) => (
              <div key={i} className="flex gap-3 px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5 w-16">{f.time}</span>
                <p className={`text-xs ${feedColor[f.type]}`}>{f.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cron Section */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Cron Reliability & Upcoming Runs</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Job</th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Schedule</th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Last Run</th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground">Next Run</th>
                <th className="px-4 py-2.5 font-medium text-xs uppercase tracking-wider text-muted-foreground text-right">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {crons.map((c) => (
                <tr key={c.name} className="hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-sm text-foreground">{c.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{c.schedule}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status="healthy" label={c.lastRun} size="sm" />
                  </td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{c.nextRun}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`font-mono text-sm ${parseFloat(c.reliability) >= 99 ? "text-success" : "text-warning"}`}>
                      {c.reliability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
