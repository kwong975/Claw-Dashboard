import { cn } from "@/lib/utils";
import { momentumConfig, interactionIcon } from "@/lib/attention";
import type { Matter, Interaction, Commitment, Signal } from "@/lib/attention-types";
import type { InspectedObject, WorkbenchAction } from "@/lib/workbench-types";
import { Users, CalendarDays, Mail, MessageSquare, ArrowRight, Unlink, Plus, Trash2, RefreshCw, Clock, AlertTriangle, ArrowUpRight, MoreHorizontal, StickyNote } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MatterStructureViewProps {
  matter: Matter;
  allMatters: Matter[];
  inspected: InspectedObject | null;
  onInspect: (obj: InspectedObject | null) => void;
  onAction: (action: WorkbenchAction) => void;
}

export function MatterStructureView({ matter, allMatters, inspected, onInspect, onAction }: MatterStructureViewProps) {
  const mom = momentumConfig[matter.momentum];
  const otherMatters = allMatters.filter(m => m.id !== matter.id);

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-semibold text-foreground">{matter.title}</h1>
          <span className={cn("rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest", mom.bg, mom.color)}>
            {mom.label}
          </span>
        </div>
      </div>

      {/* Participants */}
      <StructureSection title="Participants" icon={Users} count={matter.participants.length}>
        <div className="flex flex-wrap gap-1.5">
          {matter.participants.map((p, i) => (
            <button
              key={i}
              onClick={() => onInspect({ type: "participant", index: i, matterId: matter.id })}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                inspected?.type === "participant" && inspected.index === i
                  ? "border-[hsl(var(--ring))] bg-accent text-accent-foreground"
                  : "border-border bg-secondary/50 text-secondary-foreground hover:bg-accent/50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </StructureSection>

      {/* Interactions */}
      <StructureSection title="Interactions" icon={CalendarDays} count={matter.interactions.length}>
        <div className="space-y-0.5">
          {matter.interactions.map((interaction, i) => {
            const Icon = interactionIcon(interaction.type);
            const isSelected = inspected?.type === "interaction" && inspected.index === i;
            return (
              <div
                key={i}
                onClick={() => onInspect({ type: "interaction", index: i, matterId: matter.id })}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors",
                  isSelected ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-foreground">{interaction.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{interaction.date}</span>
                    <span>·</span>
                    <span className="capitalize">{interaction.type}</span>
                  </div>
                </div>
                <InteractionActions
                  matterId={matter.id}
                  index={i}
                  otherMatters={otherMatters}
                  onAction={onAction}
                />
              </div>
            );
          })}
          {matter.interactions.length === 0 && (
            <p className="px-3 py-2 text-[11px] text-muted-foreground italic">No interactions attached</p>
          )}
        </div>
      </StructureSection>

      {/* Commitments */}
      <StructureSection title="Commitments" icon={StickyNote} count={matter.commitments.length}>
        <div className="space-y-0.5">
          {matter.commitments.map((c, i) => {
            const isSelected = inspected?.type === "commitment" && inspected.index === i;
            return (
              <div
                key={i}
                onClick={() => onInspect({ type: "commitment", index: i, matterId: matter.id })}
                className={cn(
                  "group flex items-start gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors",
                  isSelected ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <div className={cn(
                  "mt-1 h-2 w-2 shrink-0 rounded-full",
                  c.status === "done" ? "bg-[hsl(var(--success))]" :
                  c.status === "overdue" ? "bg-[hsl(var(--critical))]" :
                  "bg-[hsl(var(--info))]"
                )} />
                <div className="flex-1 min-w-0">
                  <span className={cn("text-[13px]", c.status === "done" ? "line-through text-muted-foreground" : "text-foreground")}>
                    {c.title}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{c.owner}</span>
                    <span>·</span>
                    <span className={c.status === "overdue" ? "text-[hsl(var(--critical))]" : ""}>{c.due}</span>
                    {c.escalated && (
                      <span className="rounded bg-[hsl(var(--warning)/0.1)] px-1 text-[9px] font-medium text-[hsl(var(--warning))]">ESC</span>
                    )}
                    {c.origin && (
                      <>
                        <span>·</span>
                        <span className="italic">from {c.origin.label}</span>
                      </>
                    )}
                  </div>
                </div>
                <CommitmentActions
                  matterId={matter.id}
                  index={i}
                  otherMatters={otherMatters}
                  onAction={onAction}
                />
              </div>
            );
          })}
          {matter.commitments.length === 0 && (
            <p className="px-3 py-2 text-[11px] text-muted-foreground italic">No commitments attached</p>
          )}
        </div>
      </StructureSection>

      {/* Signals */}
      <StructureSection title="Signals" icon={AlertTriangle} count={matter.signals.length}>
        <div className="space-y-0.5">
          {matter.signals.map((s, i) => {
            const isSelected = inspected?.type === "signal" && inspected.index === i;
            return (
              <div
                key={i}
                onClick={() => onInspect({ type: "signal", index: i, matterId: matter.id })}
                className={cn(
                  "group flex items-start gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors",
                  isSelected ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-foreground">{s.description}</span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{s.source}</span>
                    <span>·</span>
                    <span>{s.timestamp}</span>
                  </div>
                </div>
                <SignalActions
                  matterId={matter.id}
                  index={i}
                  otherMatters={otherMatters}
                  onAction={onAction}
                />
              </div>
            );
          })}
          {matter.signals.length === 0 && (
            <p className="px-3 py-2 text-[11px] text-muted-foreground italic">No signals detected</p>
          )}
        </div>
      </StructureSection>
    </div>
  );
}

/* ── Section wrapper ─────────────────────────────────── */

function StructureSection({ title, icon: Icon, count, children }: {
  title: string;
  icon: React.ElementType;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <span className="text-[10px] text-muted-foreground">{count}</span>
      </div>
      <div className="rounded-lg border border-border bg-card p-1">
        {children}
      </div>
    </div>
  );
}

/* ── Row action menus ────────────────────────────────── */

function InteractionActions({ matterId, index, otherMatters, onAction }: {
  matterId: string; index: number; otherMatters: Matter[]; onAction: (a: WorkbenchAction) => void;
}) {
  return (
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
          <DropdownMenuItem key={om.id} onClick={() => onAction({ type: "moveInteraction", sourceMatterId: matterId, objectIndex: index, payload: { targetMatterId: om.id } })}>
            <ArrowRight className="mr-2 h-3 w-3" /> Move to {om.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => onAction({ type: "createMatterFromInteraction", sourceMatterId: matterId, objectIndex: index })}>
          <Plus className="mr-2 h-3 w-3" /> Create new matter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction({ type: "detachInteraction", sourceMatterId: matterId, objectIndex: index })} className="text-destructive">
          <Unlink className="mr-2 h-3 w-3" /> Detach
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommitmentActions({ matterId, index, otherMatters, onAction }: {
  matterId: string; index: number; otherMatters: Matter[]; onAction: (a: WorkbenchAction) => void;
}) {
  return (
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
          <DropdownMenuItem key={om.id} onClick={() => onAction({ type: "moveCommitment", sourceMatterId: matterId, objectIndex: index, payload: { targetMatterId: om.id } })}>
            <ArrowRight className="mr-2 h-3 w-3" /> Move to {om.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => onAction({ type: "escalateCommitment", sourceMatterId: matterId, objectIndex: index })}>
          <ArrowUpRight className="mr-2 h-3 w-3" /> Toggle escalation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction({ type: "deleteCommitment", sourceMatterId: matterId, objectIndex: index })} className="text-destructive">
          <Trash2 className="mr-2 h-3 w-3" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignalActions({ matterId, index, otherMatters, onAction }: {
  matterId: string; index: number; otherMatters: Matter[]; onAction: (a: WorkbenchAction) => void;
}) {
  return (
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
        <DropdownMenuItem onClick={() => onAction({ type: "convertSignalToCommitment", sourceMatterId: matterId, objectIndex: index })}>
          <RefreshCw className="mr-2 h-3 w-3" /> Convert to commitment
        </DropdownMenuItem>
        {otherMatters.map(om => (
          <DropdownMenuItem key={om.id} onClick={() => onAction({ type: "moveSignal", sourceMatterId: matterId, objectIndex: index, payload: { targetMatterId: om.id } })}>
            <ArrowRight className="mr-2 h-3 w-3" /> Move to {om.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={() => onAction({ type: "deleteSignal", sourceMatterId: matterId, objectIndex: index })} className="text-destructive">
          <Trash2 className="mr-2 h-3 w-3" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
