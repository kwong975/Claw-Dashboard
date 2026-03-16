import { useState, useMemo, useCallback } from "react";
import {
  Users, AlertTriangle, CalendarDays,
  ChevronRight, Activity, Eye, CircleDot,
  User, Timer, TrendingDown, Zap,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { mockMatters } from "@/data/attentionMock";
import {
  momentumConfig, urgencyColor, interactionIcon,
  overdueCount, openCount, attentionSentence,
  sortByAttention, deriveNowItems,
  deriveRecentInteractions, deriveUrgentCommitments, deriveDriftingMatters,
  totalOverdueCount, findMatterById,
} from "@/lib/attention";
import { DrawerCommitments } from "@/components/DrawerCommitments";
import type { Matter } from "@/lib/attention-types";

/* ── Constants ─────────────────────────────────────────── */

const MAX_VISIBLE_PARTICIPANTS = 3;

/* ── Component ─────────────────────────────────────────── */

export default function ResolutionBoard() {
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mattersState, setMattersState] = useState<Matter[]>(mockMatters);

  // Future: replace mattersState with API data
  const matters = mattersState;

  /* ── Memoized derivations ───────────────────────────── */
  const sorted        = useMemo(() => sortByAttention(matters), [matters]);
  const nowItems      = useMemo(() => deriveNowItems(sorted), [sorted]);
  const interactions  = useMemo(() => deriveRecentInteractions(matters), [matters]);
  const commitments   = useMemo(() => deriveUrgentCommitments(matters), [matters]);
  const drifting      = useMemo(() => deriveDriftingMatters(matters), [matters]);
  const totalOverdue  = useMemo(() => totalOverdueCount(matters), [matters]);
  const totalDrifting = drifting.length;

  /* ── Callbacks ──────────────────────────────────────── */
  const openMatter = useCallback((m: Matter) => {
    setSelectedMatter(m);
    setDrawerOpen(true);
  }, []);

  const openMatterById = useCallback((id: string) => {
    const m = findMatterById(matters, id);
    if (m) openMatter(m);
  }, [matters, openMatter]);

  return (
    <div className="p-6 space-y-5 max-w-[1440px]">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h1 className="font-display text-xl font-semibold text-foreground">Attention</h1>
          <span className="text-sm text-muted-foreground">
            {matters.length} active matters
          </span>
        </div>
        <div className="flex items-center gap-5">
          {totalOverdue > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--critical))]">
              <Timer className="h-3.5 w-3.5" />
              <span>{totalOverdue} overdue</span>
            </div>
          )}
          {totalDrifting > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--warning))]">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>{totalDrifting} drifting</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Now Strip ───────────────────────────────────── */}
      {nowItems.length > 0 && (
        <div className="rounded-lg border border-border bg-[hsl(var(--surface-1))] px-4 py-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Now</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {nowItems.map(({ matter, reason }) => (
              <button
                key={matter.id}
                onClick={() => openMatter(matter)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors",
                  "border hover:bg-[hsl(var(--surface-2))]",
                  matter.momentum === "blocked"
                    ? "border-[hsl(var(--critical)/0.3)] bg-[hsl(var(--critical)/0.05)] text-foreground"
                    : overdueCount(matter) > 0
                      ? "border-[hsl(var(--critical)/0.2)] bg-[hsl(var(--critical)/0.03)] text-foreground"
                      : "border-border bg-card text-foreground"
                )}
              >
                <span className="font-medium truncate max-w-[180px]">{matter.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">— {reason}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content Grid ────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* ── Matter Stream ─────────────────────────────── */}
        <div className="space-y-2.5">
          {sorted.map(matter => {
            const overdue = overdueCount(matter);
            const open = openCount(matter);
            const mom = momentumConfig[matter.momentum];
            const sentence = attentionSentence(matter);
            const visibleParticipants = matter.participants.slice(0, MAX_VISIBLE_PARTICIPANTS);
            const extraCount = matter.participants.length - MAX_VISIBLE_PARTICIPANTS;

            return (
              <button
                key={matter.id}
                onClick={() => openMatter(matter)}
                className={cn(
                  "w-full text-left rounded-lg border p-4 transition-all group",
                  "hover:border-[hsl(var(--primary)/0.3)]",
                  mom.border,
                  mom.cardBg || "bg-card",
                  matter.momentum === "quiet" && "opacity-75 hover:opacity-100",
                )}
              >
                {/* Row 1 — Identity + Momentum */}
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display text-sm font-semibold text-foreground truncate">
                        {matter.title}
                      </h3>
                      {matter.hasMeetingToday && (
                        <span className="flex items-center gap-1 rounded bg-[hsl(var(--primary)/0.1)] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--primary))]">
                          <CalendarDays className="h-2.5 w-2.5" />
                          Today
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                      <Users className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {visibleParticipants.join(", ")}
                        {extraCount > 0 && <span className="text-muted-foreground"> +{extraCount} more</span>}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider",
                    mom.color, mom.bg
                  )}>
                    {mom.label}
                  </span>
                </div>

                {/* Row 2 — Interpreted attention sentence */}
                <p className={cn(
                  "text-xs font-medium mt-2 mb-2.5 leading-relaxed",
                  urgencyColor[sentence.urgency]
                )}>
                  {sentence.text}
                </p>

                {/* Row 3 — Recent interactions (compact, max 2) */}
                {matter.interactions.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-2.5">
                    {matter.interactions.slice(0, 2).map((inter, idx) => {
                      const Icon = interactionIcon(inter.type);
                      return (
                        <span key={idx} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Icon className="h-3 w-3 shrink-0 opacity-60" />
                          <span className="truncate max-w-[180px]">{inter.title}</span>
                          <span className="opacity-50">· {inter.relative}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Row 4 — Compact execution summary */}
                <div className="flex items-center gap-4 text-[11px] pt-1 border-t border-[hsl(var(--border)/0.5)]">
                  <span className="text-muted-foreground">{open} open</span>
                  {overdue > 0 && (
                    <span className="text-[hsl(var(--critical))] font-medium">{overdue} overdue</span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">{matter.lastActivityRelative}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right Rail — Situational Awareness ─────────── */}
        <div className="space-y-3">
          {/* Commitment Radar */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-foreground">Commitment Radar</span>
            </div>
            <div className="divide-y divide-border">
              {commitments.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => openMatterById(c.matterId)}
                  className="w-full text-left flex items-start gap-2.5 px-4 py-2 hover:bg-[hsl(var(--surface-2))] transition-colors"
                >
                  <CircleDot className={cn(
                    "h-3 w-3 mt-0.5 shrink-0",
                    c.status === "overdue" ? "text-[hsl(var(--critical))]" : "text-muted-foreground"
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-foreground truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {c.owner} · {c.due}
                      {c.status === "overdue" && (
                        <span className="ml-1 text-[hsl(var(--critical))] font-medium">overdue</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Drift Watch */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-foreground">Drift Watch</span>
            </div>
            {drifting.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-[11px] text-muted-foreground">All matters showing activity</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {drifting.map(m => (
                  <button
                    key={m.id}
                    onClick={() => openMatter(m)}
                    className="w-full text-left flex items-start gap-2.5 px-4 py-2 hover:bg-[hsl(var(--surface-2))] transition-colors"
                  >
                    <TrendingDown className={cn(
                      "h-3 w-3 mt-0.5 shrink-0",
                      m.momentum === "drifting" ? "text-[hsl(var(--warning))]" : "text-muted-foreground"
                    )} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-foreground truncate">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Last activity {m.lastActivityRelative}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interaction Feed */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-foreground">Interaction Feed</span>
            </div>
            <div className="divide-y divide-border">
              {interactions.map((inter, idx) => {
                const Icon = interactionIcon(inter.type);
                return (
                  <button
                    key={idx}
                    onClick={() => openMatterById(inter.matterId)}
                    className="w-full text-left flex items-start gap-2.5 px-4 py-2 hover:bg-[hsl(var(--surface-2))] transition-colors"
                  >
                    <Icon className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground opacity-60" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-foreground truncate">{inter.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {inter.matterTitle} · {inter.relative}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Drawer ───────────────────────────────── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[480px] overflow-y-auto bg-card border-border p-0">
          {selectedMatter && (() => {
            const mom = momentumConfig[selectedMatter.momentum];
            const sentence = attentionSentence(selectedMatter);
            return (
              <div>
                {/* Drawer Header */}
                <div className="sticky top-0 z-10 border-b border-border bg-card px-6 py-5">
                  <SheetHeader className="space-y-0">
                    <SheetTitle className="font-display text-base font-semibold text-foreground pr-8">
                      {selectedMatter.title}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider", mom.color, mom.bg)}>
                      {mom.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Last activity {selectedMatter.lastActivityRelative}
                    </span>
                  </div>
                  <p className={cn("text-xs font-medium mt-3", urgencyColor[sentence.urgency])}>
                    {sentence.text}
                  </p>
                </div>

                <div className="divide-y divide-border">
                  {/* Participants */}
                  <div className="px-6 py-4">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMatter.participants.map(p => (
                        <span key={p} className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--surface-2))] px-2.5 py-1 text-xs text-foreground">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Interactions */}
                  <div className="px-6 py-4">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Interactions</h4>
                    <div className="space-y-1.5">
                      {selectedMatter.interactions.map((inter, idx) => {
                        const Icon = interactionIcon(inter.type);
                        return (
                          <div key={idx} className="flex items-start gap-3 rounded-md bg-[hsl(var(--surface-1))] px-3 py-2.5">
                            <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-foreground">{inter.title}</p>
                              <p className="text-[10px] text-muted-foreground">{inter.relative}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Commitments */}
                  <div className="px-6 py-4">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Commitments
                      <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
                        {openCount(selectedMatter)} open
                        {overdueCount(selectedMatter) > 0 && (
                          <span className="text-[hsl(var(--critical))]"> · {overdueCount(selectedMatter)} overdue</span>
                        )}
                      </span>
                    </h4>
                    <div className="space-y-1.5">
                      {selectedMatter.commitments.map((c, idx) => (
                        <div key={idx} className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2",
                          c.status === "done" ? "bg-[hsl(var(--surface-1))] opacity-60" : "bg-[hsl(var(--surface-1))]"
                        )}>
                          <CheckCircle2 className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            c.status === "done" ? "text-[hsl(var(--success))]" :
                            c.status === "overdue" ? "text-[hsl(var(--critical))]" :
                            "text-muted-foreground"
                          )} />
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-xs", c.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>
                              {c.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {c.owner} · due {c.due}
                              {c.status === "overdue" && (
                                <span className="ml-1 text-[hsl(var(--critical))] font-medium">overdue</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signals */}
                  {selectedMatter.signals.length > 0 && (
                    <div className="px-6 py-4">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Signals</h4>
                      <div className="space-y-1.5">
                        {selectedMatter.signals.map((s, idx) => (
                          <div key={idx} className="flex items-start gap-3 rounded-md bg-[hsl(var(--surface-1))] px-3 py-2.5">
                            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[hsl(var(--warning))]" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-foreground">{s.description}</p>
                              <p className="text-[10px] text-muted-foreground">{s.source} · {s.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
