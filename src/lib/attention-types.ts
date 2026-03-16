/* ── Core Domain Types ──────────────────────────────────── */

export type Momentum = "active" | "drifting" | "blocked" | "quiet";
export type CommitmentStatus = "open" | "overdue" | "done";
export type InteractionType = "meeting" | "email" | "discussion";
export type AttentionUrgency = "critical" | "warning" | "info" | "muted";

/* ── Data Models (API-aligned) ─────────────────────────── */

export interface Commitment {
  owner: string;
  title: string;
  status: CommitmentStatus;
  due: string;
}

export interface Interaction {
  title: string;
  type: InteractionType;
  date: string;
  relative: string;
}

export interface Signal {
  description: string;
  source: string;
  timestamp: string;
}

export interface Matter {
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

/* ── View-oriented Summary Types ───────────────────────── */

export interface AttentionSentence {
  text: string;
  urgency: AttentionUrgency;
}

export interface AttentionNowItem {
  matter: Matter;
  reason: string;
}

export interface InteractionSummary extends Interaction {
  matterTitle: string;
  matterId: string;
}

export interface CommitmentSummary extends Commitment {
  matterTitle: string;
  matterId: string;
}

export interface MomentumStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
  cardBg: string;
}
