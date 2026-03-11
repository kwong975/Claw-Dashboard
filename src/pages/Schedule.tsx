import { StatusBadge, type StatusType } from "@/components/StatusBadge";
import { Clock, Play, Pause, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface CronJob {
  name: string;
  schedule: string;
  description: string;
  status: StatusType;
  lastRun: string;
  lastResult: "success" | "failed";
  nextRun: string;
  reliability: number;
  runs30d: number;
  failures30d: number;
}

const jobs: CronJob[] = [
  { name: "report-daily", schedule: "0 6 * * *", description: "Generate daily operational report", status: "warning", lastRun: "Today 06:00", lastResult: "failed", nextRun: "Tomorrow 06:00", reliability: 94, runs30d: 30, failures30d: 2 },
  { name: "sync-external", schedule: "*/15 * * * *", description: "Sync with external data sources", status: "running", lastRun: "14:30", lastResult: "success", nextRun: "14:45", reliability: 99.2, runs30d: 2880, failures30d: 23 },
  { name: "cleanup-logs", schedule: "0 2 * * 0", description: "Archive and compress old logs", status: "healthy", lastRun: "Sun 02:00", lastResult: "success", nextRun: "Sun 02:00", reliability: 100, runs30d: 4, failures30d: 0 },
  { name: "health-check", schedule: "*/5 * * * *", description: "System-wide health verification", status: "running", lastRun: "14:30", lastResult: "success", nextRun: "14:35", reliability: 99.8, runs30d: 8640, failures30d: 17 },
  { name: "digest-weekly", schedule: "0 9 * * 1", description: "Compile weekly executive digest", status: "healthy", lastRun: "Mon 09:00", lastResult: "success", nextRun: "Mon 09:00", reliability: 100, runs30d: 4, failures30d: 0 },
  { name: "backup-db", schedule: "0 3 * * *", description: "Full database backup", status: "healthy", lastRun: "Today 03:00", lastResult: "success", nextRun: "Tomorrow 03:00", reliability: 100, runs30d: 30, failures30d: 0 },
  { name: "model-eval", schedule: "0 0 * * 0", description: "Evaluate model performance metrics", status: "paused", lastRun: "2 weeks ago", lastResult: "success", nextRun: "Paused", reliability: 95, runs30d: 2, failures30d: 0 },
];

const upcoming = jobs
  .filter((j) => j.status !== "paused")
  .sort((a, b) => a.nextRun.localeCompare(b.nextRun))
  .slice(0, 5);

const failed = jobs.filter((j) => j.lastResult === "failed");
const paused = jobs.filter((j) => j.status === "paused");

export default function SchedulePage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Schedule</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Cron operations and scheduled job management</p>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Upcoming Runs</h2>
          </div>
          <div className="divide-y divide-border">
            {upcoming.map((j) => (
              <div key={j.name} className="flex items-center justify-between px-4 py-2.5">
                <div className="min-w-0">
                  <p className="font-mono text-sm text-foreground">{j.name}</p>
                  <p className="text-xs text-muted-foreground">{j.schedule}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{j.nextRun}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Failures */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="font-display text-sm font-semibold">Recent Failures</h2>
          </div>
          {failed.length > 0 ? (
            <div className="divide-y divide-border">
              {failed.map((j) => (
                <div key={j.name} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm text-foreground">{j.name}</span>
                    <StatusBadge status="critical" label="Failed" size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground">{j.lastRun}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <CheckCircle2 className="h-6 w-6 text-success mb-2" />
              <p className="text-xs text-muted-foreground">No recent failures</p>
            </div>
          )}
        </div>

        {/* Paused */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Pause className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold">Paused Jobs</h2>
          </div>
          {paused.length > 0 ? (
            <div className="divide-y divide-border">
              {paused.map((j) => (
                <div key={j.name} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-mono text-sm text-foreground">{j.name}</p>
                    <p className="text-xs text-muted-foreground">{j.description}</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Play className="h-3 w-3" /> Resume
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <p className="text-xs text-muted-foreground">No paused jobs</p>
            </div>
          )}
        </div>
      </div>

      {/* All Jobs Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Clock className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold">All Cron Jobs</h2>
          <span className="font-mono text-xs text-muted-foreground ml-auto">{jobs.length} jobs</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Job</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Schedule</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Run</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Next Run</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">Reliability</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground text-right">30d Runs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((j) => (
              <tr key={j.name} className="hover:bg-accent/50 transition-colors">
                <td className="px-4 py-2.5">
                  <p className="font-mono text-sm text-foreground">{j.name}</p>
                  <p className="text-xs text-muted-foreground">{j.description}</p>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{j.schedule}</td>
                <td className="px-4 py-2.5"><StatusBadge status={j.status} size="sm" /></td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {j.lastResult === "success"
                      ? <CheckCircle2 className="h-3 w-3 text-success" />
                      : <AlertTriangle className="h-3 w-3 text-warning" />
                    }
                    <span className="text-sm text-muted-foreground">{j.lastRun}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-sm text-muted-foreground">{j.nextRun}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={cn("font-mono text-sm", j.reliability >= 99 ? "text-success" : j.reliability >= 95 ? "text-warning" : "text-critical")}>
                    {j.reliability}%
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm text-muted-foreground">{j.runs30d.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
