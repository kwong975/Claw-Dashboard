import { cn } from "@/lib/utils";
import { interactionIcon, momentumConfig } from "@/lib/attention";
import type { Matter } from "@/lib/attention-types";
import type { InspectedObject, WorkbenchAction, WorkbenchViewMode } from "@/lib/workbench-types";
import { useState } from "react";
import {
  CalendarDays, User, Clock, Tag, ArrowRight, Unlink, Plus, Trash2,
  RefreshCw, ArrowUpRight, AlertTriangle, StickyNote, X, ListChecks
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkbenchInspectorProps {
  matter: Matter | null;
  allMatters: Matter[];
  inspected: InspectedObject | null;
  viewMode: WorkbenchViewMode;
  onAction: (action: WorkbenchAction) => void;
  onClose: () => void;
}

const emptyStateMessages: Record<WorkbenchViewMode, string> = {
  structure: "Select an interaction, commitment, or signal to inspect",
  timeline: "Select a timeline event to inspect",
  replay: "Select a replay event to inspect system decisions and repair options",
};

export function WorkbenchInspector({ matter, allMatters, inspected, viewMode, onAction, onClose }: WorkbenchInspectorProps) {
  if (!matter || !inspected) {
    return (
      <div className="flex h-full flex-col border-l border-border">
        <div className="flex h-11 items-center border-b border-border px-4">
          <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspector</h2>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-center text-[11px] text-muted-foreground">
            {emptyStateMessages[viewMode]}
          </p>
        </div>
      </div>
    );
  }

  const otherMatters = allMatters.filter(m => m.id !== matter.id);

  return (
    <div className="flex h-full flex-col border-l border-border">
      <div className="flex h-11 items-center justify-between border-b border-border px-4">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">Inspector</h2>
        <button onClick={onClose} className="rounded p-1 hover:bg-accent transition-colors">
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {inspected.type === "interaction" && (
          <InteractionInspector
            matter={matter}
            index={inspected.index}
            otherMatters={otherMatters}
            onAction={onAction}
          />
        )}
        {inspected.type === "commitment" && (
          <CommitmentInspector
            matter={matter}
            index={inspected.index}
            otherMatters={otherMatters}
            onAction={onAction}
          />
        )}
        {inspected.type === "signal" && (
          <SignalInspector
            matter={matter}
            index={inspected.index}
            otherMatters={otherMatters}
            onAction={onAction}
          />
        )}
        {inspected.type === "participant" && (
          <ParticipantInspector matter={matter} index={inspected.index} />
        )}
      </div>
    </div>
  );
}

/* ── Detail field ────────────────────────────────────── */

function DetailRow({ icon: Icon, label, value, valueClass }: {
  icon: React.ElementType; label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={cn("text-[12px] text-foreground", valueClass)}>{value}</div>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = "default" }: {
  icon: React.ElementType; label: string; onClick: () => void; variant?: "default" | "destructive";
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors w-full",
        variant === "destructive"
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

/* ── Interaction Inspector ───────────────────────────── */

function InteractionInspector({ matter, index, otherMatters, onAction }: {
  matter: Matter; index: number; otherMatters: Matter[]; onAction: (a: WorkbenchAction) => void;
}) {
  const interaction = matter.interactions[index];
  if (!interaction) return null;
  const Icon = interactionIcon(interaction.type);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Interaction</span>
        </div>
        <h3 className="font-display text-sm font-semibold text-foreground">{interaction.title}</h3>
      </div>

      <div className="space-y-0.5">
        <DetailRow icon={Tag} label="Type" value={interaction.type} />
        <DetailRow icon={CalendarDays} label="Date" value={interaction.date} />
        <DetailRow icon={StickyNote} label="Attached to" value={matter.title} />
      </div>

      <div className="border-t border-border pt-3 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Actions</p>
        <MoveToMenu
          label="Move to another matter"
          otherMatters={otherMatters}
          onSelect={(targetId) => onAction({ type: "moveInteraction", sourceMatterId: matter.id, objectIndex: index, payload: { targetMatterId: targetId } })}
        />
        <ActionButton icon={Plus} label="Create new matter from this" onClick={() => onAction({ type: "createMatterFromInteraction", sourceMatterId: matter.id, objectIndex: index })} />
        <ActionButton icon={Unlink} label="Detach" onClick={() => onAction({ type: "detachInteraction", sourceMatterId: matter.id, objectIndex: index })} variant="destructive" />
      </div>
    </div>
  );
}

/* ── Commitment Inspector ────────────────────────────── */

function CommitmentInspector({ matter, index, otherMatters, onAction }: {
  matter: Matter; index: number; otherMatters: Matter[]; onAction: (a: WorkbenchAction) => void;
}) {
  const [newOwner, setNewOwner] = useState("");
  const [newDate, setNewDate] = useState("");

  const c = matter.commitments[index];
  if (!c) return null;

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Commitment</span>
        <h3 className="font-display text-sm font-semibold text-foreground mt-1">{c.title}</h3>
      </div>

      <div className="space-y-0.5">
        <DetailRow icon={User} label="Owner" value={c.owner} />
        <DetailRow icon={CalendarDays} label="Due" value={c.due} valueClass={c.status === "overdue" ? "text-[hsl(var(--critical))]" : ""} />
        <DetailRow icon={Tag} label="Status" value={c.status} />
        {c.origin && <DetailRow icon={StickyNote} label="Origin" value={`from ${c.origin.label}`} />}
        {c.escalated && <DetailRow icon={ArrowUpRight} label="Escalated" value="Yes" valueClass="text-[hsl(var(--warning))]" />}
        {c.note && <DetailRow icon={StickyNote} label="Note" value={c.note} />}
        <DetailRow icon={StickyNote} label="Attached to" value={matter.title} />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Actions</p>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="New owner…"
            value={newOwner}
            onChange={e => setNewOwner(e.target.value)}
            className="flex-1 rounded border border-border bg-secondary/50 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            disabled={!newOwner.trim()}
            onClick={() => { onAction({ type: "reassignCommitment", sourceMatterId: matter.id, objectIndex: index, payload: { newOwner: newOwner.trim() } }); setNewOwner(""); }}
            className="rounded px-2 py-1 text-[10px] font-medium text-foreground hover:bg-accent disabled:opacity-30 transition-colors"
          >
            Reassign
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="New date (e.g. Mar 25)…"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="flex-1 rounded border border-border bg-secondary/50 px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            disabled={!newDate.trim()}
            onClick={() => { onAction({ type: "rescheduleCommitment", sourceMatterId: matter.id, objectIndex: index, payload: { newDate: newDate.trim() } }); setNewDate(""); }}
            className="rounded px-2 py-1 text-[10px] font-medium text-foreground hover:bg-accent disabled:opacity-30 transition-colors"
          >
            Reschedule
          </button>
        </div>

        <ActionButton icon={ArrowUpRight} label={c.escalated ? "De-escalate" : "Escalate"} onClick={() => onAction({ type: "escalateCommitment", sourceMatterId: matter.id, objectIndex: index })} />
        <MoveToMenu
          label="Move to another matter"
          otherMatters={otherMatters}
          onSelect={(targetId) => onAction({ type: "moveCommitment", sourceMatterId: matter.id, objectIndex: index, payload: { targetMatterId: targetId } })}
        />
        <ActionButton icon={Trash2} label="Delete" onClick={() => onAction({ type: "deleteCommitment", sourceMatterId: matter.id, objectIndex: index })} variant="destructive" />
      </div>
    </div>
  );
}

/* ── Signal Inspector ────────────────────────────────── */

function SignalInspector({ matter, index, otherMatters, onAction }: {
  matter: Matter; index: number; otherMatters: Matter[]; onAction: (a: WorkbenchAction) => void;
}) {
  const s = matter.signals[index];
  if (!s) return null;

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Signal</span>
        <h3 className="font-display text-sm font-semibold text-foreground mt-1">{s.description}</h3>
      </div>

      <div className="space-y-0.5">
        <DetailRow icon={Tag} label="Source" value={s.source} />
        <DetailRow icon={Clock} label="Timestamp" value={s.timestamp} />
        <DetailRow icon={StickyNote} label="Attached to" value={matter.title} />
      </div>

      <div className="border-t border-border pt-3 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Actions</p>
        <ActionButton icon={RefreshCw} label="Convert to commitment" onClick={() => onAction({ type: "convertSignalToCommitment", sourceMatterId: matter.id, objectIndex: index })} />
        <MoveToMenu
          label="Move to another matter"
          otherMatters={otherMatters}
          onSelect={(targetId) => onAction({ type: "moveSignal", sourceMatterId: matter.id, objectIndex: index, payload: { targetMatterId: targetId } })}
        />
        <ActionButton icon={Trash2} label="Delete" onClick={() => onAction({ type: "deleteSignal", sourceMatterId: matter.id, objectIndex: index })} variant="destructive" />
      </div>
    </div>
  );
}

/* ── Participant Inspector ───────────────────────────── */

function ParticipantInspector({ matter, index }: { matter: Matter; index: number }) {
  const name = matter.participants[index];
  if (!name) return null;

  const relatedCommitments = matter.commitments.filter(c => c.owner === name);

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Participant</span>
        <h3 className="font-display text-sm font-semibold text-foreground mt-1">{name}</h3>
      </div>

      <div className="space-y-0.5">
        <DetailRow icon={StickyNote} label="In matter" value={matter.title} />
        <DetailRow icon={Tag} label="Commitments owned" value={String(relatedCommitments.length)} />
      </div>

      {relatedCommitments.length > 0 && (
        <div className="border-t border-border pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Owned commitments</p>
          <div className="space-y-1">
            {relatedCommitments.map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/30 text-[11px]">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  c.status === "done" ? "bg-[hsl(var(--success))]" :
                  c.status === "overdue" ? "bg-[hsl(var(--critical))]" :
                  "bg-[hsl(var(--info))]"
                )} />
                <span className="text-foreground truncate">{c.title}</span>
                <span className="ml-auto text-muted-foreground text-[10px]">{c.due}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Move-to dropdown ────────────────────────────────── */

function MoveToMenu({ label, otherMatters, onSelect }: {
  label: string; otherMatters: Matter[]; onSelect: (targetId: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent transition-colors w-full">
          <ArrowRight className="h-3 w-3" />
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {otherMatters.map(m => (
          <DropdownMenuItem key={m.id} onClick={() => onSelect(m.id)}>
            {m.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
