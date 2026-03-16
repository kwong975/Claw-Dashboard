import type { Matter, Interaction, Commitment, Signal } from "./attention-types";

/* ── Selectable object types in the Structure View ────── */

export type InspectedObjectType = "interaction" | "commitment" | "signal" | "participant";

export interface InspectedObject {
  type: InspectedObjectType;
  index: number;
  matterId: string;
}

/* ── Workbench Action Types ──────────────────────────── */

export type WorkbenchActionType =
  | "moveInteraction"
  | "moveCommitment"
  | "moveSignal"
  | "detachInteraction"
  | "deleteCommitment"
  | "deleteSignal"
  | "reassignCommitment"
  | "rescheduleCommitment"
  | "escalateCommitment"
  | "convertSignalToCommitment"
  | "createMatterFromInteraction";

export interface WorkbenchAction {
  type: WorkbenchActionType;
  sourceMatterId: string;
  objectIndex: number;
  payload?: {
    targetMatterId?: string;
    newOwner?: string;
    newDate?: string;
  };
}

/* ── Repair Suggestion ───────────────────────────────── */

export interface RepairSuggestion {
  id: string;
  message: string;
  actionLabel: string;
  action: WorkbenchAction;
}

/* ── Navigator warning types ─────────────────────────── */

export type NavigatorWarning = "duplicateParticipants" | "manyOverdue" | "interactionMismatch";

export interface MatterWarning {
  type: NavigatorWarning;
  label: string;
}

/* ── View mode ───────────────────────────────────────── */

export type WorkbenchViewMode = "structure" | "timeline" | "replay";

/* ── Replay event ────────────────────────────────────── */

export type ReplayEventType = "interaction" | "signal" | "commitment";

export interface ReplayEvent {
  timestamp: string;
  sortKey: number;
  eventType: ReplayEventType;
  objectIndex: number;
  title: string;
  description: string;
  origin?: string;
}
