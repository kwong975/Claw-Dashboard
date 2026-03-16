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

/* ── Derive warnings for a matter ────────────────────── */

export function deriveMatterWarnings(m: Matter): MatterWarning[] {
  const warnings: MatterWarning[] = [];

  // Check for many overdue
  const overdueCount = m.commitments.filter(c => c.status === "overdue").length;
  if (overdueCount >= 2) {
    warnings.push({ type: "manyOverdue", label: `${overdueCount} overdue` });
  }

  // Check duplicate participants (same name appearing)
  const seen = new Set<string>();
  for (const p of m.participants) {
    const norm = p.toLowerCase().trim();
    if (seen.has(norm)) {
      warnings.push({ type: "duplicateParticipants", label: "Duplicate participant" });
      break;
    }
    seen.add(norm);
  }

  // Interaction mismatch: commitment origin references interaction not in this matter
  for (const c of m.commitments) {
    if (c.origin) {
      const found = m.interactions.some(
        i => i.title.toLowerCase().includes(c.origin!.label.toLowerCase()) ||
             c.origin!.label.toLowerCase().includes(i.title.toLowerCase())
      );
      if (!found) {
        warnings.push({ type: "interactionMismatch", label: "Origin mismatch" });
        break;
      }
    }
  }

  return warnings;
}

/* ── Derive repair suggestions ───────────────────────── */

export function deriveRepairSuggestions(matters: Matter[], selectedMatterId: string | null): RepairSuggestion[] {
  if (!selectedMatterId) return [];
  const matter = matters.find(m => m.id === selectedMatterId);
  if (!matter) return [];

  const suggestions: RepairSuggestion[] = [];

  // Check if any commitment origin references a different matter's title
  for (let ci = 0; ci < matter.commitments.length; ci++) {
    const c = matter.commitments[ci];
    if (!c.origin) continue;
    for (const other of matters) {
      if (other.id === matter.id) continue;
      if (c.origin.label.toLowerCase().includes(other.title.toLowerCase().split(" ")[0].toLowerCase()) &&
          !matter.title.toLowerCase().includes(other.title.toLowerCase().split(" ")[0].toLowerCase())) {
        // Possible mismatch
      }
    }
  }

  // Check interactions that mention other matter keywords
  for (let ii = 0; ii < matter.interactions.length; ii++) {
    const interaction = matter.interactions[ii];
    for (const other of matters) {
      if (other.id === matter.id) continue;
      const keywords = other.title.toLowerCase().split(" ").filter(w => w.length > 4);
      const matchesKeyword = keywords.some(kw => interaction.title.toLowerCase().includes(kw));
      if (matchesKeyword) {
        suggestions.push({
          id: `sug-${matter.id}-i${ii}-${other.id}`,
          message: `"${interaction.title}" references "${other.title}" but is attached to "${matter.title}". Move to ${other.title}?`,
          actionLabel: `Move to ${other.title}`,
          action: {
            type: "moveInteraction",
            sourceMatterId: matter.id,
            objectIndex: ii,
            payload: { targetMatterId: other.id },
          },
        });
      }
    }
  }

  return suggestions.slice(0, 2);
}

/* ── Apply workbench action (reducer) ────────────────── */

export function applyWorkbenchAction(
  matters: Matter[],
  action: WorkbenchAction
): Matter[] {
  const result = matters.map(m => ({
    ...m,
    interactions: [...m.interactions],
    commitments: [...m.commitments],
    signals: [...m.signals],
    participants: [...m.participants],
  }));

  const source = result.find(m => m.id === action.sourceMatterId);
  if (!source) return result;

  const target = action.payload?.targetMatterId
    ? result.find(m => m.id === action.payload!.targetMatterId)
    : undefined;

  switch (action.type) {
    case "moveInteraction": {
      if (!target) break;
      const [item] = source.interactions.splice(action.objectIndex, 1);
      if (item) target.interactions.push(item);
      break;
    }
    case "moveCommitment": {
      if (!target) break;
      const [item] = source.commitments.splice(action.objectIndex, 1);
      if (item) target.commitments.push(item);
      break;
    }
    case "moveSignal": {
      if (!target) break;
      const [item] = source.signals.splice(action.objectIndex, 1);
      if (item) target.signals.push(item);
      break;
    }
    case "detachInteraction": {
      source.interactions.splice(action.objectIndex, 1);
      break;
    }
    case "deleteCommitment": {
      source.commitments.splice(action.objectIndex, 1);
      break;
    }
    case "deleteSignal": {
      source.signals.splice(action.objectIndex, 1);
      break;
    }
    case "reassignCommitment": {
      if (action.payload?.newOwner) {
        source.commitments[action.objectIndex] = {
          ...source.commitments[action.objectIndex],
          owner: action.payload.newOwner,
        };
      }
      break;
    }
    case "rescheduleCommitment": {
      if (action.payload?.newDate) {
        source.commitments[action.objectIndex] = {
          ...source.commitments[action.objectIndex],
          due: action.payload.newDate,
          status: "open",
        };
      }
      break;
    }
    case "escalateCommitment": {
      source.commitments[action.objectIndex] = {
        ...source.commitments[action.objectIndex],
        escalated: !source.commitments[action.objectIndex].escalated,
      };
      break;
    }
    case "convertSignalToCommitment": {
      const signal = source.signals[action.objectIndex];
      if (signal) {
        source.signals.splice(action.objectIndex, 1);
        source.commitments.push({
          owner: "Unassigned",
          title: signal.description,
          status: "open",
          due: "TBD",
          origin: { label: signal.source, type: "discussion" },
        });
      }
      break;
    }
    case "createMatterFromInteraction": {
      const interaction = source.interactions[action.objectIndex];
      if (interaction) {
        source.interactions.splice(action.objectIndex, 1);
        const newMatter: Matter = {
          id: `m-new-${Date.now()}`,
          title: interaction.title,
          participants: [],
          momentum: "quiet",
          interactions: [interaction],
          commitments: [],
          signals: [],
          hasMeetingToday: false,
          lastActivityRelative: "just now",
        };
        result.push(newMatter);
      }
      break;
    }
  }

  return result;
}
