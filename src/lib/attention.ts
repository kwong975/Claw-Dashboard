import type {
  Matter, Momentum, AttentionSentence, AttentionUrgency,
  AttentionNowItem, InteractionSummary, CommitmentSummary, MomentumStyle,
  Commitment, CommitmentAction,
} from "./attention-types";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Mail, MessageSquare } from "lucide-react";

/* ── Momentum Visual Config ───────────────────────────── */

export const momentumConfig: Record<Momentum, MomentumStyle> = {
  active:   { label: "ACTIVE",   color: "text-[hsl(var(--success))]",      bg: "bg-[hsl(var(--success)/0.1)]",   border: "border-[hsl(var(--success)/0.15)]", cardBg: "" },
  drifting: { label: "DRIFTING", color: "text-[hsl(var(--warning))]",      bg: "bg-[hsl(var(--warning)/0.1)]",   border: "border-[hsl(var(--warning)/0.2)]",  cardBg: "bg-[hsl(var(--warning)/0.02)]" },
  blocked:  { label: "BLOCKED",  color: "text-[hsl(var(--critical))]",     bg: "bg-[hsl(var(--critical)/0.1)]",  border: "border-[hsl(var(--critical)/0.25)]", cardBg: "bg-[hsl(var(--critical)/0.03)]" },
  quiet:    { label: "QUIET",    color: "text-muted-foreground",           bg: "bg-muted",                        border: "border-border",                     cardBg: "" },
};

export const urgencyColor: Record<AttentionUrgency, string> = {
  critical: "text-[hsl(var(--critical))]",
  warning:  "text-[hsl(var(--warning))]",
  info:     "text-[hsl(var(--primary))]",
  muted:    "text-muted-foreground",
};

/* ── Interaction Icon Mapping ─────────────────────────── */

export function interactionIcon(type: "meeting" | "email" | "discussion"): LucideIcon {
  switch (type) {
    case "meeting":    return CalendarDays;
    case "email":      return Mail;
    case "discussion": return MessageSquare;
  }
}

/* ── Commitment Counters ──────────────────────────────── */

export function overdueCount(m: Matter): number {
  return m.commitments.filter(c => c.status === "overdue").length;
}

export function openCount(m: Matter): number {
  return m.commitments.filter(c => c.status !== "done").length;
}

/* ── Attention Sentence ───────────────────────────────── */

export function attentionSentence(m: Matter): AttentionSentence {
  const overdue = overdueCount(m);

  if (m.momentum === "blocked") {
    const blocker = m.signals.find(
      s => s.description.toLowerCase().includes("no response") || s.description.toLowerCase().includes("waiting")
    );
    return {
      text: blocker ? `Blocked: ${blocker.description.toLowerCase()}` : "Blocked: awaiting external dependency",
      urgency: "critical",
    };
  }

  if (overdue > 0) {
    return {
      text: `${overdue} overdue commitment${overdue > 1 ? "s" : ""} — requires attention`,
      urgency: "critical",
    };
  }

  if (m.hasMeetingToday) {
    const meeting = m.interactions.find(i => i.relative === "today");
    return {
      text: `Active today: ${meeting?.title || "scheduled meeting"}`,
      urgency: "info",
    };
  }

  if (m.momentum === "drifting") {
    return { text: "Drifting: no meaningful interaction in recent days", urgency: "warning" };
  }

  if (m.signals.length > 0) {
    return { text: m.signals[0].description, urgency: "info" };
  }

  return { text: `${openCount(m)} open commitments on track`, urgency: "muted" };
}

/* ── Sorting ──────────────────────────────────────────── */

function attentionScore(m: Matter): number {
  let s = 0;
  if (overdueCount(m) > 0) s += 100 + overdueCount(m);
  if (m.hasMeetingToday) s += 50;
  if (m.momentum === "blocked") s += 80;
  if (m.signals.length > 0) s += 20 + m.signals.length;
  if (m.momentum === "drifting") s += 15;
  if (m.momentum === "quiet") s -= 10;
  return s;
}

export function sortByAttention(matters: Matter[]): Matter[] {
  return [...matters].sort((a, b) => attentionScore(b) - attentionScore(a));
}

/* ── Now Strip Derivation ─────────────────────────────── */

export function deriveNowItems(sortedMatters: Matter[]): AttentionNowItem[] {
  const items: (AttentionNowItem & { score: number })[] = [];

  for (const m of sortedMatters) {
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

/* ── Rail Derivations ─────────────────────────────────── */

export function deriveRecentInteractions(matters: Matter[], limit: number = 6): InteractionSummary[] {
  return matters
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
    .slice(0, limit);
}

export function deriveUrgentCommitments(matters: Matter[], limit: number = 6): CommitmentSummary[] {
  return matters
    .flatMap(m =>
      m.commitments
        .filter(c => c.status === "overdue" || c.status === "open")
        .map(c => ({ ...c, matterTitle: m.title, matterId: m.id }))
    )
    .sort((a, b) => (a.status === "overdue" ? -1 : 1) - (b.status === "overdue" ? -1 : 1))
    .slice(0, limit);
}

export function deriveDriftingMatters(matters: Matter[]): Matter[] {
  return matters.filter(m => m.momentum === "drifting" || m.momentum === "quiet");
}

/* ── Aggregate Stats ──────────────────────────────────── */

export function totalOverdueCount(matters: Matter[]): number {
  return matters.reduce((sum, m) => sum + overdueCount(m), 0);
}

/* ── Matter Lookup ────────────────────────────────────── */

export function findMatterById(matters: Matter[], id: string): Matter | undefined {
  return matters.find(m => m.id === id);
}
