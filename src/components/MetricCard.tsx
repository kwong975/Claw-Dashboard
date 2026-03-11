import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  status?: "healthy" | "warning" | "critical" | "neutral";
  detail?: string;
  className?: string;
}

const statusColors = {
  healthy: "text-success",
  warning: "text-warning",
  critical: "text-critical",
  neutral: "text-muted-foreground",
};

export function MetricCard({ label, value, icon: Icon, status = "neutral", detail, className }: MetricCardProps) {
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-4 flex flex-col gap-2 min-w-0",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={cn("h-4 w-4", statusColors[status])} />
      </div>
      <div className={cn("font-mono text-2xl font-semibold tabular-nums", statusColors[status] === "text-muted-foreground" ? "text-foreground" : statusColors[status])}>
        {value}
      </div>
      {detail && (
        <p className="text-xs text-muted-foreground truncate">{detail}</p>
      )}
    </div>
  );
}
