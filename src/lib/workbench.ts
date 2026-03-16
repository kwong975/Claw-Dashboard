import type { Matter } from "./attention-types";
import type {
  WorkbenchAction,
  WorkbenchActionResult,
  RepairSuggestion,
  MatterWarning,
  ReplayEvent,
} from "./workbench-types";

/* ── Action description for toasts ───────────────────── */

const actionDescriptions: Record<string, string> = {
  moveInteraction: "Interaction moved",
  moveCommitment: "Commitment moved",
  moveSignal: "Signal moved",
  detachInteraction: "Interaction detached",
  deleteCommitment: "Commitment deleted",
  deleteSignal: "Signal deleted",
  reassignCommitment: "Commitment reassigned",
  rescheduleCommitment: "Commitment rescheduled",
  escalateCommitment: "Escalation toggled",
  convertSignalToCommitment: "Signal converted to commitment",
  createMatterFromInteraction: "Matter created from interaction",
};

export function describeWorkbenchAction(action: WorkbenchAction): string {
  return actionDescriptions[action.type] ?? action.type;
}

/* ── Should clear inspection after action ────────────── */

const clearInspectionActions = new Set([
  "detachInteraction",
  "deleteCommitment",
  "deleteSignal",
  "convertSignalToCommitment",
  "moveInteraction",
  "moveCommitment",
  "moveSignal",
  "createMatterFromInteraction",
]);

export function shouldClearInspection(action: WorkbenchAction): boolean {
  return clearInspectionActions.has(action.type);
}

/* ── Derive warnings for a matter ────────────────────── */

export function deriveMatterWarnings(m: Matter): MatterWarning[] {
  const warnings: MatterWarning[] = [];

  const overdueCount = m.commitments.filter(c => c.status === "overdue").length;
  if (overdueCount >= 2) {
    warnings.push({ type: "manyOverdue", label: `${overdueCount} overdue` });
  }

  const seen = new Set<string>();
  for (const p of m.participants) {
    const norm = p.toLowerCase().trim();
    if (seen.has(norm)) {
      warnings.push({ type: "duplicateParticipants", label: "Duplicate participant" });
      break;
    }
    seen.add(norm);
  }

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

/* ── Derive replay events ────────────────────────────── */

function parseDateKey(dateStr: string): number {
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const parts = dateStr.toLowerCase().split(" ");
  const month = months[parts[0]] ?? 2;
  const day = parseInt(parts[1]) || 1;
  return new Date(2026, month, day).getTime();
}

export function deriveReplayEvents(matter: Matter): ReplayEvent[] {
  const events: ReplayEvent[] = [];

  matter.interactions.forEach((interaction, i) => {
    const sortKey = parseDateKey(interaction.date);
    events.push({
      timestamp: interaction.date,
      sortKey,
      eventType: "interaction",
      objectIndex: i,
      title: `${interaction.type === "meeting" ? "Meeting" : interaction.type === "email" ? "Email" : "Discussion"} detected`,
      description: interaction.title,
      origin: interaction.type,
    });
  });

  matter.signals.forEach((signal, i) => {
    const sortKey = parseDateKey(signal.timestamp.includes("ago") ? "Mar 16" : signal.timestamp);
    events.push({
      timestamp: signal.timestamp,
      sortKey: sortKey + i,
      eventType: "signal",
      objectIndex: i,
      title: "System created signal",
      description: signal.description,
      origin: signal.source,
    });
  });

  matter.commitments.forEach((c, i) => {
    let sortKey: number;
    if (c.origin) {
      const sourceInteraction = matter.interactions.find(
        int => int.title.toLowerCase().includes(c.origin!.label.toLowerCase()) ||
               c.origin!.label.toLowerCase().includes(int.title.toLowerCase())
      );
      sortKey = sourceInteraction ? parseDateKey(sourceInteraction.date) + 1 : parseDateKey(c.due);
    } else {
      sortKey = parseDateKey(c.due) - 86400000;
    }

    events.push({
      timestamp: c.origin
        ? matter.interactions.find(
            int => int.title.toLowerCase().includes(c.origin!.label.toLowerCase()) ||
                   c.origin!.label.toLowerCase().includes(int.title.toLowerCase())
          )?.date ?? c.due
        : c.due,
      sortKey: sortKey + 0.5,
      eventType: "commitment",
      objectIndex: i,
      title: "System created commitment",
      description: `${c.owner} — ${c.title}`,
      origin: c.origin ? `from ${c.origin.label}` : undefined,
    });
  });

  events.sort((a, b) => a.sortKey - b.sortKey);
  return events;
}

/* ── Apply workbench action (returns rich result) ────── */

export function applyWorkbenchAction(
  matters: Matter[],
  action: WorkbenchAction
): WorkbenchActionResult {
  const result = matters.map(m => ({
    ...m,
    interactions: [...m.interactions],
    commitments: [...m.commitments],
    signals: [...m.signals],
    participants: [...m.participants],
  }));

  const source = result.find(m => m.id === action.sourceMatterId);
  if (!source) return { matters: result, clearInspection: false };

  const target = action.payload?.targetMatterId
    ? result.find(m => m.id === action.payload!.targetMatterId)
    : undefined;

  let selectMatterId: string | undefined;
  let createdMatterId: string | undefined;
  const clear = shouldClearInspection(action);

  switch (action.type) {
    case "moveInteraction": {
      if (!target) break;
      const [item] = source.interactions.splice(action.objectIndex, 1);
      if (item) target.interactions.push(item);
      selectMatterId = target.id;
      break;
    }
    case "moveCommitment": {
      if (!target) break;
      const [item] = source.commitments.splice(action.objectIndex, 1);
      if (item) target.commitments.push(item);
      selectMatterId = target.id;
      break;
    }
    case "moveSignal": {
      if (!target) break;
      const [item] = source.signals.splice(action.objectIndex, 1);
      if (item) target.signals.push(item);
      selectMatterId = target.id;
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
        const newId = `m-new-${Date.now()}`;
        const newMatter: Matter = {
          id: newId,
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
        selectMatterId = newId;
        createdMatterId = newId;
      }
      break;
    }
  }

  return { matters: result, selectMatterId, clearInspection: clear, createdMatterId };
}
