import { Bell, Shield, Clock, Bot, Database, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "General",
    icon: Globe,
    settings: [
      { label: "System Name", value: "Command Center v1.2", type: "text" },
      { label: "Timezone", value: "UTC", type: "text" },
      { label: "Data Retention", value: "90 days", type: "text" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    settings: [
      { label: "Critical Alerts", value: "Enabled", type: "toggle", enabled: true },
      { label: "Warning Notifications", value: "Enabled", type: "toggle", enabled: true },
      { label: "Daily Digest", value: "Enabled", type: "toggle", enabled: true },
      { label: "Slack Integration", value: "Connected", type: "status" },
    ],
  },
  {
    title: "Security",
    icon: Shield,
    settings: [
      { label: "API Key Rotation", value: "Every 30 days", type: "text" },
      { label: "Audit Logging", value: "Enabled", type: "toggle", enabled: true },
      { label: "IP Allowlist", value: "3 addresses", type: "text" },
    ],
  },
  {
    title: "Agents",
    icon: Bot,
    settings: [
      { label: "Auto-restart on failure", value: "Enabled", type: "toggle", enabled: true },
      { label: "Max retry attempts", value: "3", type: "text" },
      { label: "Idle timeout", value: "2 hours", type: "text" },
      { label: "Concurrent task limit", value: "5 per agent", type: "text" },
    ],
  },
  {
    title: "Scheduling",
    icon: Clock,
    settings: [
      { label: "Cron failure threshold", value: "3 consecutive", type: "text" },
      { label: "Auto-pause on failure", value: "Disabled", type: "toggle", enabled: false },
      { label: "Schedule overlap protection", value: "Enabled", type: "toggle", enabled: true },
    ],
  },
  {
    title: "Data",
    icon: Database,
    settings: [
      { label: "Event log retention", value: "30 days", type: "text" },
      { label: "Incident archive", value: "1 year", type: "text" },
      { label: "Metric granularity", value: "1 minute", type: "text" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-[800px]">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">System configuration and preferences</p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-display text-sm font-semibold">{section.title}</h2>
              </div>
              <div className="divide-y divide-border">
                {section.settings.map((s) => (
                  <div key={s.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-foreground">{s.label}</span>
                    {s.type === "toggle" ? (
                      <div className={cn(
                        "flex h-6 w-10 items-center rounded-full px-0.5 transition-colors cursor-pointer",
                        s.enabled ? "bg-primary" : "bg-muted"
                      )}>
                        <div className={cn(
                          "h-5 w-5 rounded-full bg-foreground transition-transform",
                          s.enabled ? "translate-x-4" : "translate-x-0"
                        )} />
                      </div>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground">{s.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
