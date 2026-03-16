import { useState } from "react";
import {
  Clock, Users, AlertTriangle, MessageSquare, CalendarDays,
  Mail, ChevronRight, Activity, Eye, CircleDot,
  User, CheckCircle2, Timer, TrendingDown, Zap,
} from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────── */

type Momentum = "active" | "drifting" | "blocked" | "quiet";

interface Commitment {
  owner: string;
  title: string;
  status: "open" | "overdue" | "done";
  due: string;
}

interface Interaction {
  title: string;
  type: "meeting" | "email" | "discussion";
  date: string;
  relative: string;
}

interface Signal {
  description: string;
  source: string;
  timestamp: string;
}

interface Matter {
  id: string;
  title: string;
  participants: string[];
  momentum: Momentum;
  interactions: Interaction[];
  commitments: Commitment[];
  signals: Signal[];
  hasMeetingToday: boolean;
  lastActivityRelative: string;
}

/* ── Mock Data ─────────────────────────────────────────── */

const matters: Matter[] = [
  {
    id: "m-001",
    title: "Compliance Policy Overhaul",
    participants: ["Raymond", "Chris Liu", "Sarah", "Legal Team"],
    momentum: "active",
    hasMeetingToday: true,
    lastActivityRelative: "2h ago",
    interactions: [
      { title: "SMT Breakfast", type: "meeting", date: "Mar 16", relative: "today" },
      { title: "Compliance Standup", type: "meeting", date: "Mar 14", relative: "2 days ago" },
      { title: "Re: Audit timeline update", type: "email", date: "Mar 13", relative: "3 days ago" },
    ],
    commitments: [
      { owner: "Raymond", title: "Submit updated policy draft", status: "overdue", due: "Mar 10" },
      { owner: "Chris Liu", title: "Review audit findings", status: "overdue", due: "Mar 08" },
      { owner: "Sarah", title: "Legal sign-off", status: "open", due: "Mar 18" },
      { owner: "Raymond", title: "Notify compliance board", status: "open", due: "Mar 20" },
    ],
    signals: [
      { description: "Regulatory deadline moved up by 1 week", source: "Email from legal", timestamp: "2h ago" },
      { description: "Chris Liu flagged resource gap", source: "SMT Breakfast", timestamp: "today" },
    ],
  },
  {
    id: "m-002",
    title: "Q2 Budget Allocation",
    participants: ["Raymond", "Finance Team"],
    momentum: "active",
    hasMeetingToday: true,
    lastActivityRelative: "4h ago",
    interactions: [
      { title: "Board Prep Session", type: "meeting", date: "Mar 16", relative: "today" },
      { title: "Q2 Budget — final numbers", type: "email", date: "Mar 14", relative: "2 days ago" },
    ],
    commitments: [
      { owner: "You", title: "Approve budget allocation", status: "open", due: "Mar 16" },
      { owner: "Finance Team", title: "Prepare final numbers", status: "done", due: "Mar 12" },
    ],
    signals: [
      { description: "Board meeting in 5 days — approval needed", source: "System", timestamp: "4h ago" },
    ],
  },
  {
    id: "m-003",
    title: "Tencent Audit Preparation",
    participants: ["Raymond", "Audit Team", "External Auditors"],
    momentum: "active",
    hasMeetingToday: false,
    lastActivityRelative: "6h ago",
    interactions: [
      { title: "Audit Prep Call", type: "meeting", date: "Mar 14", relative: "2 days ago" },
      { title: "Re: Document checklist", type: "email", date: "Mar 13", relative: "3 days ago" },
    ],
    commitments: [
      { owner: "Audit Team", title: "Complete document review", status: "open", due: "Mar 17" },
      { owner: "Raymond", title: "Sign audit readiness form", status: "open", due: "Mar 15" },
    ],
    signals: [
      { description: "Audit date confirmed for Mar 22", source: "External Auditors", timestamp: "3d ago" },
    ],
  },
  {
    id: "m-004",
    title: "Platform Migration",
    participants: ["DevOps", "Infra Team", "Product Lead"],
    momentum: "blocked",
    hasMeetingToday: false,
    lastActivityRelative: "3d ago",
    interactions: [
      { title: "Re: Staging env request — urgent", type: "email", date: "Mar 13", relative: "3 days ago" },
    ],
    commitments: [
      { owner: "Infra Team", title: "Provision staging environment", status: "overdue", due: "Mar 09" },
      { owner: "DevOps", title: "Migration script ready", status: "done", due: "Mar 10" },
    ],
    signals: [
      { description: "No response from Infra Team in 3 days", source: "System", timestamp: "3d ago" },
    ],
  },
  {
    id: "m-005",
    title: "Vendor Contract Renewal",
    participants: ["Procurement", "Vendor Contact"],
    momentum: "drifting",
    hasMeetingToday: false,
    lastActivityRelative: "5d ago",
    interactions: [
      { title: "Contract renewal — Vendor X", type: "email", date: "Mar 11", relative: "5 days ago" },
    ],
    commitments: [
      { owner: "Vendor Contact", title: "Send revised terms", status: "overdue", due: "Mar 14" },
      { owner: "Procurement", title: "Internal review", status: "open", due: "Mar 18" },
    ],
    signals: [
      { description: "Contract expires in 2 weeks", source: "System", timestamp: "2d ago" },
    ],
  },
  {
    id: "m-006",
    title: "Engineering Hiring Pipeline",
    participants: ["HR", "Engineering Lead"],
    momentum: "quiet",
    hasMeetingToday: false,
    lastActivityRelative: "4d ago",
    interactions: [
      { title: "Hiring sync", type: "meeting", date: "Mar 12", relative: "4 days ago" },
    ],
    commitments: [
      { owner: "HR", title: "Schedule remaining interviews", status: "open", due: "Mar 19" },
      { owner: "Engineering Lead", title: "Review candidate shortlist", status: "open", due: "Mar 16" },
    ],
    signals: [],
  },
  {
    id: "m-007",
    title: "Customer Success Playbook",
    participants: ["CS Team", "Product Lead"],
    momentum: "quiet",
    hasMeetingToday: false,
    lastActivityRelative: "6d ago",
    interactions: [
      { title: "Playbook review session", type: "meeting", date: "Mar 10", relative: "6 days ago" },
    ],
    commitments: [
      { owner: "CS Team", title: "Draft playbook v2", status: "open", due: "Mar 20" },
    ],
    signals: [],
  },
];

/* ── Helpers ───────────────────────────────────────────── */

const momentumConfig: Record<Momentum, { label: string; color: string; bg: string; border: string; cardBg: string }> = {
  active:   { label: "ACTIVE",   color: "text-[hsl(var(--success))]",      bg: "bg-[hsl(var(--success)/0.1)]",   border: "border-[hsl(var(--success)/0.15)]", cardBg: "" },
  drifting: { label: "DRIFTING", color: "text-[hsl(var(--warning))]",      bg: "bg-[hsl(var(--warning)/0.1)]",   border: "border-[hsl(var(--warning)/0.2)]",  cardBg: "bg-[hsl(var(--warning)/0.02)]" },
  blocked:  { label: "BLOCKED",  color: "text-[hsl(var(--critical))]",     bg: "bg-[hsl(var(--critical)/0.1)]",  border: "border-[hsl(var(--critical)/0.25)]", cardBg: "bg-[hsl(var(--critical)/0.03)]" },
  quiet:    { label: "QUIET",    color: "text-muted-foreground",           bg: "bg-muted",                        border: "border-border",                     cardBg: "" },
};

const interactionIcon = (type: Interaction["type"]) => {
  switch (type) {
    case "meeting": return CalendarDays;
    case "email": return Mail;
    case "discussion": return MessageSquare;
  }
};

const overdueCount = (m: Matter) => m.commitments.filter(c => c.status === "overdue").length;
const openCount = (m: Matter) => m.commitments.filter(c => c.status !== "done").length;

function attentionSentence(m: Matter): { text: string; urgency: "critical" | "warning" | "info" | "muted" } {
  const overdue = overdueCount(m);
  if (m.momentum === "blocked") {
    const blocker = m.signals.find(s => s.description.toLowerCase().includes("no response") || s.description.toLowerCase().includes("waiting"));
    return { text: blocker ? `Blocked: ${blocker.description.toLowerCase()}` : "Blocked: awaiting external dependency", urgency: "critical" };
  }
  if (overdue > 0) {
    return { text: `${overdue} overdue commitment${overdue > 1 ? "s" : ""} — requires attention`, urgency: "critical" };
  }
  if (m.hasMeetingToday) {
    const meeting = m.interactions.find(i => i.relative === "today");
    return { text: `Active today: ${meeting?.title || "scheduled meeting"}`, urgency: "info" };
  }
  if (m.momentum === "drifting") {
    return { text: `Drifting: no meaningful interaction in recent days`, urgency: "warning" };
  }
  if (m.signals.length > 0) {
    return { text: m.signals[0].description, urgency: "info" };
  }
  return { text: `${openCount(m)} open commitments on track`, urgency: "muted" };
}

const sentenceColor: Record<string, string> = {
  critical: "text-[hsl(var(--critical))]",
  warning: "text-[hsl(var(--warning))]",
  info: "text-[hsl(var(--primary))]",
  muted: "text-muted-foreground",
};

function sortByAttention(a: Matter, b: Matter): number {
  const score = (m: Matter) => {
    let s = 0;
    if (overdueCount(m) > 0) s += 100 + overdueCount(m);
    if (m.hasMeetingToday) s += 50;
    if (m.momentum === "blocked") s += 80;
    if (m.signals.length > 0) s += 20 + m.signals.length;
    if (m.momentum === "drifting") s += 15;
    if (m.momentum === "quiet") s -= 10;
    return s;
  };
  return score(b) - score(a);
}

const sortedMatters = [...matters].sort(sortByAttention);

/* ── Now Strip Items ──────────────────────────────────── */

function deriveNowItems(sorted: Matter[]): { matter: Matter; reason: string }[] {
  const items: { matter: Matter; reason: string; score: number }[] = [];
  for (const m of sorted) {
    const overdue = overdueCount(m);
    if (m.momentum === "blocked") {
      items.push({ matter: m, reason: "blocked by dependency", score: 200 });
    } else if (overdue > 0) {
      items.push({ matter: m, reason: `${overdue} overdue commitment${overdue > 1 ? "s" : ""}`, score: 150 + overdue });
    } else if (m.hasMeetingToday && m.commitments.some(c => c.status === "open" && c.due === "Mar 16")) {
      items.push({ matter: m, reason: "approval needed today", score: 120 });
    } else if (m.hasMeetingToday) {
      items.push({ matter: m, reason: "meeting today", score: 60 });
    }
  }
  return items.sort((a, b) => b.score - a.score).slice(0, 5);
}

const nowItems = deriveNowItems(sortedMatters);

/* ── Derived rail data ────────────────────────────────── */

const recentInteractions = matters
  .flatMap(m => m.interactions.map(i => ({ ...i, matterTitle: m.title, matterId: m.id })))
  .sort((a, b) => {
    const order = ["today", "yesterday"];
    const ai = order.indexOf(a.relative);
    const bi = order.indexOf(b.relative);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return 0;
  })
  .slice(0, 6);

const urgentCommitments = matters
  .flatMap(m => m.commitments.filter(c => c.status === "overdue" || c.status === "open").map(c => ({ ...c, matterTitle: m.title })))
  .sort((a, b) => (a.status === "overdue" ? -1 : 1) - (b.status === "overdue" ? -1 : 1))
  .slice(0, 6);

const driftingMatters = matters.filter(m => m.momentum === "drifting" || m.momentum === "quiet");

const totalOverdue = matters.reduce((sum, m) => sum + overdueCount(m), 0);
const totalDrifting = driftingMatters.length;

/* ── Component ─────────────────────────────────────────── */

export default function ResolutionBoard() {
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openMatter = (m: Matter) => {
    setSelectedMatter(m);
    setDrawerOpen(true);
  };

  const MAX_VISIBLE_PARTICIPANTS = 3;

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
          {sortedMatters.map(matter => {
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
                  sentenceColor[sentence.urgency]
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
          {/* Commitment Radar (top — closest to intervention) */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Timer className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-foreground">Commitment Radar</span>
            </div>
            <div className="divide-y divide-border">
              {urgentCommitments.map((c, idx) => (
                <div key={idx} className="flex items-start gap-2.5 px-4 py-2">
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
                </div>
              ))}
            </div>
          </div>

          {/* Drift Watch (middle) */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-foreground">Drift Watch</span>
            </div>
            {driftingMatters.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <p className="text-[11px] text-muted-foreground">All matters showing activity</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {driftingMatters.map(m => (
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

          {/* Interaction Feed (bottom — informative) */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-foreground">Interaction Feed</span>
            </div>
            <div className="divide-y divide-border">
              {recentInteractions.map((inter, idx) => {
                const Icon = interactionIcon(inter.type);
                return (
                  <div key={idx} className="flex items-start gap-2.5 px-4 py-2">
                    <Icon className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground opacity-60" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-foreground truncate">{inter.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {inter.matterTitle} · {inter.relative}
                      </p>
                    </div>
                  </div>
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
                  <p className={cn("text-xs font-medium mt-3", sentenceColor[sentence.urgency])}>
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

                  {/* Interaction Timeline */}
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
