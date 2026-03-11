import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { Eye, FileText, Activity, Server, Target, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";

interface HealthItem {
  label: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  detail?: string;
}

const selfReported: HealthItem[] = [
  { label: "data-ingest-01", value: "Healthy", status: "healthy", detail: "Self-check passed at 14:30" },
  { label: "summarizer-alpha", value: "Healthy", status: "healthy", detail: "Performance within bounds" },
  { label: "classifier-v2", value: "Degraded", status: "warning", detail: "Reports elevated latency" },
  { label: "monitor-sentinel", value: "Healthy", status: "healthy", detail: "All monitors active" },
  { label: "report-builder", value: "Healthy", status: "healthy", detail: "Queue nominal" },
];

const observed: HealthItem[] = [
  { label: "data-ingest-01", value: "Healthy", status: "healthy", detail: "Output quality 98.2%" },
  { label: "summarizer-alpha", value: "Healthy", status: "healthy", detail: "Accuracy 96.1%" },
  { label: "classifier-v2", value: "Warning", status: "warning", detail: "Accuracy dropped to 91.3%" },
  { label: "monitor-sentinel", value: "Healthy", status: "healthy", detail: "Response time <50ms" },
  { label: "report-builder", value: "Healthy", status: "healthy", detail: "Output verified" },
];

const infrastructure: HealthItem[] = [
  { label: "CPU Usage", value: "34%", status: "healthy", detail: "Avg across all workers" },
  { label: "Memory", value: "68%", status: "warning", detail: "summarizer-alpha at 78%" },
  { label: "Disk I/O", value: "Normal", status: "healthy", detail: "Read/write within limits" },
  { label: "Network", value: "Stable", status: "healthy", detail: "Latency <10ms internal" },
  { label: "Queue Depth", value: "12", status: "healthy", detail: "Processing rate: 8/min" },
];

const outcomes: HealthItem[] = [
  { label: "Task Success Rate", value: "99.1%", status: "healthy", detail: "Last 24 hours" },
  { label: "SLA Compliance", value: "98.5%", status: "healthy", detail: "30-day rolling" },
  { label: "Error Rate", value: "0.3%", status: "healthy", detail: "Below 1% threshold" },
  { label: "Avg Response Time", value: "1.2s", status: "healthy", detail: "Target <2s" },
  { label: "Quality Score", value: "94.8%", status: "warning", detail: "Dipped from 96.2%" },
];

interface Discrepancy {
  agent: string;
  selfReport: string;
  observed: string;
  confidence: "high" | "medium" | "low";
  note: string;
}

const discrepancies: Discrepancy[] = [
  {
    agent: "classifier-v2",
    selfReport: "Degraded (latency)",
    observed: "Warning (accuracy 91.3%)",
    confidence: "medium",
    note: "Agent reports latency as primary issue but observed metrics show accuracy degradation — may indicate root cause mismatch.",
  },
];

const confidenceColor = {
  high: "text-success",
  medium: "text-warning",
  low: "text-critical",
};

function QuadrantCard({ title, icon: Icon, items, iconColor }: { title: string; icon: typeof Eye; items: HealthItem[]; iconColor: string }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <h2 className="font-display text-sm font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-4 py-2.5">
            <div className="min-w-0">
              <p className="text-sm text-foreground">{item.label}</p>
              {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-sm text-foreground">{item.value}</span>
              <StatusBadge status={item.status} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WatchtowerPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Watchtower</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Multi-source health verification and trust assessment</p>
      </div>

      {/* Four Quadrants */}
      <div className="grid grid-cols-2 gap-4">
        <QuadrantCard title="Self-Reported" icon={FileText} items={selfReported} iconColor="text-info" />
        <QuadrantCard title="Observed" icon={Eye} items={observed} iconColor="text-primary" />
        <QuadrantCard title="Infrastructure" icon={Server} items={infrastructure} iconColor="text-muted-foreground" />
        <QuadrantCard title="Outcomes" icon={Target} items={outcomes} iconColor="text-success" />
      </div>

      {/* Trust Discrepancies */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h2 className="font-display text-sm font-semibold">Trust Discrepancies</h2>
          <span className="font-mono text-xs text-warning ml-auto">{discrepancies.length} found</span>
        </div>
        {discrepancies.length > 0 ? (
          <div className="divide-y divide-border">
            {discrepancies.map((d) => (
              <div key={d.agent} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="font-mono text-sm font-medium text-foreground">{d.agent}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <span className={cn("text-xs font-semibold uppercase", confidenceColor[d.confidence])}>{d.confidence}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="rounded-md bg-accent p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Self-Reported</p>
                    <p className="text-sm text-foreground">{d.selfReport}</p>
                  </div>
                  <div className="rounded-md bg-accent p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Observed</p>
                    <p className="text-sm text-foreground">{d.observed}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{d.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="h-8 w-8 text-success mb-2" />
            <p className="text-sm text-muted-foreground">No discrepancies detected. Self-reports align with observations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
