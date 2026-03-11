import { StatusBadge } from "@/components/StatusBadge";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Shield } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "warning";
  status: "active" | "resolved" | "investigating";
  time: string;
  duration: string;
  agents: string[];
  description: string;
}

const activeIncidents: Incident[] = [];

const resolvedIncidents: Incident[] = [
  {
    id: "INC-042",
    title: "Gateway latency spike — external API timeout",
    severity: "critical",
    status: "resolved",
    time: "3 days ago",
    duration: "42 minutes",
    agents: ["monitor-sentinel", "notifier-main"],
    description: "External API partner experienced downtime causing gateway latency to spike above 2000ms threshold. Auto-failover to cached responses activated.",
  },
  {
    id: "INC-041",
    title: "Data ingestion pipeline stall",
    severity: "warning",
    status: "resolved",
    time: "5 days ago",
    duration: "18 minutes",
    agents: ["data-ingest-01", "data-ingest-02"],
    description: "Upstream data source changed schema without notice. Auto-recovery detected the issue and applied schema migration.",
  },
  {
    id: "INC-040",
    title: "Classifier confidence degradation",
    severity: "warning",
    status: "resolved",
    time: "8 days ago",
    duration: "2 hours",
    agents: ["classifier-v2", "qa-checker"],
    description: "Classification accuracy dropped below 92% threshold due to distribution shift in input data. Retraining initiated automatically.",
  },
];

export default function IncidentsPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1000px]">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Incidents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Active and historical incident tracking</p>
      </div>

      {/* Active Incidents */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Active Incidents</h2>
        {activeIncidents.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No active incidents</p>
                <p className="text-xs text-muted-foreground mt-1">All systems operating normally. Last incident resolved 3 days ago.</p>
              </div>
              <StatusBadge status="healthy" label="System Healthy" size="md" />
            </div>
          </div>
        ) : null}
      </div>

      {/* Resolved Incidents */}
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Resolved</h2>
        <div className="space-y-3">
          {resolvedIncidents.map((inc) => (
            <div key={inc.id} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex items-start gap-4 p-4">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{inc.id}</span>
                        <StatusBadge status={inc.severity === "critical" ? "critical" : "warning"} label={inc.severity} size="sm" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{inc.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{inc.time}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {inc.duration}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{inc.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-muted-foreground">Agents:</span>
                    {inc.agents.map((a) => (
                      <span key={a} className="font-mono text-xs px-1.5 py-0.5 rounded bg-accent text-accent-foreground">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
