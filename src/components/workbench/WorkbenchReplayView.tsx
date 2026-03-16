import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { deriveReplayEvents } from "@/lib/workbench";
import type { Matter } from "@/lib/attention-types";
import type { ReplayEvent, WorkbenchAction, InspectedObject } from "@/lib/workbench-types";
import {
  CalendarDays, Mail, MessageSquare, AlertTriangle, ListChecks,
  ArrowRight, Unlink, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const eventTypeIcon: Record<string, React.ElementType> = {
  interaction: CalendarDays,
  signal: AlertTriangle,
  commitment: ListChecks,
};

const originIcon: Record<string, React.ElementType> = {
  meeting: CalendarDays,
  email: Mail,
  discussion: MessageSquare,
};

interface WorkbenchReplayViewProps {
  matter: Matter;
  allMatters: Matter[];
  inspected: InspectedObject | null;
  onInspect: (obj: InspectedObject | null) => void;
  onAction: (action: WorkbenchAction) => void;
}

export function WorkbenchReplayView({ matter, allMatters, inspected, onInspect, onAction }: WorkbenchReplayViewProps) {
  const events = useMemo(() => deriveReplayEvents(matter), [matter]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const otherMatters = allMatters.filter(m => m.id !== matter.id);

  const groups = useMemo(() => {
    const map = new Map<string, ReplayEvent[]>();
    for (const e of events) {
      const key = e.timestamp.replace(/\s*ago\s*$/i, "").trim();
      const normalizedKey = key.includes("ago") || key === "today" ? "Today" : key;
      if (!map.has(normalizedKey)) map.set(normalizedKey, []);
      map.get(normalizedKey)!.push(e);
    }
    return Array.from(map.entries());
  }, [events]);

  const handleEventClick = (event: ReplayEvent) => {
    onInspect({
      type: event.eventType as "interaction" | "commitment" | "signal",
      index: event.objectIndex,
      matterId: matter.id,
    });
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <div className="mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Replay Mode</p>
        <h2 className="font-display text-base font-semibold text-foreground mt-0.5">{matter.title}</h2>
      </div>

      {events.length > 0 && (
        <div className="flex items-center gap-2 mb-5 mt-3">
          <button
            disabled={activeStep === null || activeStep <= 0}
            onClick={() => setActiveStep(prev => Math.max(0, (prev ?? 0) - 1))}
            className="rounded p-1 hover:bg-accent transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {activeStep !== null ? `Step ${activeStep + 1} / ${events.length}` : `${events.length} events`}
          </span>
          <button
            disabled={activeStep !== null && activeStep >= events.length - 1}
            onClick={() => setActiveStep(prev => prev === null ? 0 : Math.min(events.length - 1, prev + 1))}
            className="rounded p-1 hover:bg-accent transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {activeStep !== null && (
            <button
              onClick={() => setActiveStep(null)}
              className="ml-1 rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-accent transition-colors"
            >
              Show all
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border" />

        {groups.map(([dateLabel, groupEvents]) => {
          const visibleEvents = activeStep !== null
            ? groupEvents.filter(e => events.indexOf(e) <= activeStep)
            : groupEvents;
          if (visibleEvents.length === 0) return null;

          return (
            <div key={dateLabel} className="mb-5">
              <div className="relative flex items-center gap-3 mb-2">
                <div className="relative z-10 h-[15px] w-[15px] rounded-full border-2 border-border bg-card flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                </div>
                <span className="text-[11px] font-semibold text-foreground">{dateLabel}</span>
              </div>

              <div className="ml-[7px] border-l border-transparent pl-6 space-y-1.5">
                {visibleEvents.map((event, ei) => {
                  const Icon = eventTypeIcon[event.eventType] ?? AlertTriangle;
                  const OriginIcon = event.origin ? originIcon[event.origin] : undefined;
                  const globalIndex = events.indexOf(event);
                  const isHighlighted = activeStep !== null && globalIndex === activeStep;
                  const isSelected =
                    inspected?.type === event.eventType &&
                    inspected.index === event.objectIndex &&
                    inspected.matterId === matter.id;

                  return (
                    <div
                      key={`${dateLabel}-${ei}`}
                      onClick={() => handleEventClick(event)}
                      className={cn(
                        "group rounded-md border px-3 py-2.5 cursor-pointer transition-all",
                        isSelected
                          ? "border-[hsl(var(--ring))] bg-accent shadow-sm"
                          : isHighlighted
                          ? "border-[hsl(var(--ring)/0.5)] bg-accent/60 shadow-sm"
                          : "border-border bg-card hover:bg-accent/40"
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-muted-foreground">{event.title}</p>
                          <p className="text-[13px] text-foreground mt-0.5">{event.description}</p>
                          {event.origin && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground opacity-70">
                              {OriginIcon && <OriginIcon className="h-2.5 w-2.5" />}
                              <span>{event.origin}</span>
                            </div>
                          )}
                        </div>

                        {event.eventType === "interaction" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={e => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-secondary"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              {otherMatters.map(om => (
                                <DropdownMenuItem key={om.id} onClick={() => onAction({ type: "moveInteraction", sourceMatterId: matter.id, objectIndex: event.objectIndex, payload: { targetMatterId: om.id } })}>
                                  <ArrowRight className="mr-2 h-3 w-3" /> Move to {om.title}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem onClick={() => onAction({ type: "createMatterFromInteraction", sourceMatterId: matter.id, objectIndex: event.objectIndex })}>
                                <Plus className="mr-2 h-3 w-3" /> Create new matter
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onAction({ type: "detachInteraction", sourceMatterId: matter.id, objectIndex: event.objectIndex })} className="text-destructive">
                                <Unlink className="mr-2 h-3 w-3" /> Detach
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <p className="ml-8 text-[11px] text-muted-foreground italic">No events to replay</p>
        )}
      </div>
    </div>
  );
}
