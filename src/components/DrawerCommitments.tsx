import { useState } from "react";
import {
  UserRoundPen, CalendarClock, StickyNote, AlertTriangle, Send,
  CalendarDays, Mail, MessageSquare,
} from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Commitment, CommitmentAction, InteractionType } from "@/lib/attention-types";

const originIcon = (type: InteractionType) => {
  switch (type) {
    case "meeting": return CalendarDays;
    case "email": return Mail;
    case "discussion": return MessageSquare;
  }
};

/* ── Types ─────────────────────────────────────────────── */

interface DrawerCommitmentsProps {
  commitments: Commitment[];
  onAction: (action: CommitmentAction) => void;
  /** Set of indices that were recently acted on, for flash feedback */
  actedIndices?: Set<number>;
}

/* ── Reassign Menu ────────────────────────────────────── */

const PEOPLE = ["Raymond", "Chris Liu", "Sarah", "Finance Team", "HR", "DevOps", "Infra Team", "You"];

function ReassignPopover({ current, onSelect }: { current: string; onSelect: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const others = PEOPLE.filter(p => p !== current);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-1 rounded hover:bg-[hsl(var(--surface-2))] text-muted-foreground hover:text-foreground transition-colors" title="Reassign">
          <UserRoundPen className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="w-40 p-1 bg-card border-border">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Reassign to</p>
        {others.slice(0, 6).map(p => (
          <button
            key={p}
            onClick={() => { onSelect(p); setOpen(false); }}
            className="w-full text-left px-2 py-1.5 text-xs text-foreground rounded hover:bg-[hsl(var(--surface-2))] transition-colors"
          >
            {p}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/* ── Due Date Editor ──────────────────────────────────── */

function DueDatePopover({ current, onSelect }: { current: string; onSelect: (date: string) => void }) {
  const [open, setOpen] = useState(false);
  const options = ["Mar 17", "Mar 18", "Mar 19", "Mar 20", "Mar 21", "Mar 24"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="p-1 rounded hover:bg-[hsl(var(--surface-2))] text-muted-foreground hover:text-foreground transition-colors" title="Change due date">
          <CalendarClock className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="w-36 p-1 bg-card border-border">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Move to</p>
        {options.filter(d => d !== current).map(d => (
          <button
            key={d}
            onClick={() => { onSelect(d); setOpen(false); }}
            className="w-full text-left px-2 py-1.5 text-xs text-foreground rounded hover:bg-[hsl(var(--surface-2))] transition-colors"
          >
            {d}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/* ── Note Input ───────────────────────────────────────── */

function NotePopover({ current, onSave }: { current?: string; onSave: (note: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(current || "");

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setText(current || ""); }}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-1 rounded hover:bg-[hsl(var(--surface-2))] transition-colors",
            current ? "text-[hsl(var(--primary))]" : "text-muted-foreground hover:text-foreground"
          )}
          title={current ? "Edit note" : "Add note"}
        >
          <StickyNote className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" className="w-56 p-2 bg-card border-border">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Note</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a brief note…"
          rows={2}
          className="w-full rounded-md border border-border bg-[hsl(var(--surface-1))] px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex justify-end mt-1.5">
          <button
            onClick={() => { onSave(text.trim()); setOpen(false); }}
            disabled={!text.trim()}
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] disabled:opacity-40 transition-colors"
          >
            <Send className="h-2.5 w-2.5" />
            Save
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ── Main Commitments Section ─────────────────────────── */

export function DrawerCommitments({ commitments, onAction, actedIndices }: DrawerCommitmentsProps) {
  const overdueN = commitments.filter(c => c.status === "overdue").length;
  const openN = commitments.filter(c => c.status !== "done").length;

  return (
    <div className="px-6 py-4">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Commitments
        <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
          {openN} open
          {overdueN > 0 && (
            <span className="text-[hsl(var(--critical))]"> · {overdueN} overdue</span>
          )}
        </span>
      </h4>
      <div className="space-y-1.5">
        {commitments.map((c, idx) => {
          const acted = actedIndices?.has(idx) ?? false;
          const justDone = acted && c.status === "done";

          return (
            <div
              key={idx}
              className={cn(
                "group/row relative flex items-start gap-3 rounded-md px-3 py-2 transition-all duration-300",
                c.status === "done" ? "bg-[hsl(var(--surface-1))] opacity-60" : "bg-[hsl(var(--surface-1))]",
                c.escalated && c.status !== "done" && "ring-1 ring-[hsl(var(--warning)/0.3)]",
                justDone && "ring-1 ring-[hsl(var(--success)/0.5)]",
                acted && !justDone && c.status !== "done" && "ring-1 ring-[hsl(var(--primary)/0.4)]",
              )}
            >
              {/* Status icon — click to toggle done */}
              <button
                onClick={() => onAction({
                  type: c.status === "done" ? "reopen" : "complete",
                  commitmentIndex: idx,
                })}
                className="mt-0.5 shrink-0"
                title={c.status === "done" ? "Reopen" : "Mark done"}
              >
                <CheckCircle2 className={cn(
                  "h-3.5 w-3.5 transition-colors",
                  c.status === "done" ? "text-[hsl(var(--success))]" :
                  c.status === "overdue" ? "text-[hsl(var(--critical))] hover:text-[hsl(var(--success))]" :
                  "text-muted-foreground hover:text-[hsl(var(--success))]"
                )} />
              </button>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={cn("text-xs", c.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>
                    {c.title}
                  </p>
                  {c.escalated && c.status !== "done" && (
                    <span className="flex items-center gap-0.5 rounded bg-[hsl(var(--warning)/0.15)] px-1 py-px text-[9px] font-bold text-[hsl(var(--warning))]">
                      <AlertTriangle className="h-2 w-2" />
                      ESC
                    </span>
                  )}
                  {c.note && (
                    <StickyNote className="h-2.5 w-2.5 text-[hsl(var(--primary))] shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {c.owner} · due {c.due}
                  {c.status === "overdue" && (
                    <span className="ml-1 text-[hsl(var(--critical))] font-medium">overdue</span>
                  )}
                </p>
                {c.origin && (
                  <p className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground opacity-70">
                    {(() => { const OIcon = originIcon(c.origin.type); return <OIcon className="h-2.5 w-2.5 shrink-0" />; })()}
                    <span>from {c.origin.label}</span>
                  </p>
                )}
                {c.note && (
                  <p className="mt-1 text-[10px] text-muted-foreground italic leading-snug">
                    "{c.note}"
                  </p>
                )}
              </div>
              {/* Hover actions */}
              {c.status !== "done" && (
                <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                  <ReassignPopover
                    current={c.owner}
                    onSelect={(name) => onAction({ type: "reassign", commitmentIndex: idx, payload: name })}
                  />
                  <DueDatePopover
                    current={c.due}
                    onSelect={(date) => onAction({ type: "reschedule", commitmentIndex: idx, payload: date })}
                  />
                  <NotePopover
                    current={c.note}
                    onSave={(note) => onAction({ type: "addNote", commitmentIndex: idx, payload: note })}
                  />
                  <button
                    onClick={() => onAction({
                      type: c.escalated ? "deescalate" : "escalate",
                      commitmentIndex: idx,
                    })}
                    className={cn(
                      "p-1 rounded hover:bg-[hsl(var(--surface-2))] transition-colors",
                      c.escalated ? "text-[hsl(var(--warning))]" : "text-muted-foreground hover:text-foreground"
                    )}
                    title={c.escalated ? "Remove escalation" : "Escalate"}
                  >
                    <AlertTriangle className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
