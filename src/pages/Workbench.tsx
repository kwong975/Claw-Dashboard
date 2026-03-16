import { useState, useCallback, useMemo } from "react";
import { mockMatters } from "@/data/attentionMock";
import type { Matter } from "@/lib/attention-types";
import type { InspectedObject, WorkbenchAction } from "@/lib/workbench-types";
import { applyWorkbenchAction, deriveRepairSuggestions, type RepairSuggestion } from "@/lib/workbench-types";
import { MatterNavigator } from "@/components/workbench/MatterNavigator";
import { MatterStructureView } from "@/components/workbench/MatterStructureView";
import { WorkbenchInspector } from "@/components/workbench/WorkbenchInspector";
import { WorkbenchSuggestions } from "@/components/workbench/WorkbenchSuggestions";
import { toast } from "sonner";

export default function Workbench() {
  const [matters, setMatters] = useState<Matter[]>(() => [...mockMatters]);
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(mockMatters[0]?.id ?? null);
  const [inspected, setInspected] = useState<InspectedObject | null>(null);

  const selectedMatter = useMemo(
    () => matters.find(m => m.id === selectedMatterId) ?? null,
    [matters, selectedMatterId]
  );

  const suggestions = useMemo(
    () => deriveRepairSuggestions(matters, selectedMatterId),
    [matters, selectedMatterId]
  );

  const handleSelectMatter = useCallback((id: string) => {
    setSelectedMatterId(id);
    setInspected(null);
  }, []);

  const handleAction = useCallback((action: WorkbenchAction) => {
    setMatters(prev => applyWorkbenchAction(prev, action));
    // Clear inspected if the object was removed
    if (["detachInteraction", "deleteCommitment", "deleteSignal", "convertSignalToCommitment",
         "moveInteraction", "moveCommitment", "moveSignal", "createMatterFromInteraction"].includes(action.type)) {
      setInspected(null);
    }
    toast.success(`Action applied: ${action.type.replace(/([A-Z])/g, " $1").toLowerCase()}`);
  }, []);

  const handleAcceptSuggestion = useCallback((suggestion: RepairSuggestion) => {
    handleAction(suggestion.action);
  }, [handleAction]);

  return (
    <div className="flex h-full">
      {/* Left: Matter Navigator — 260px */}
      <div className="w-[260px] shrink-0">
        <MatterNavigator
          matters={matters}
          selectedId={selectedMatterId}
          onSelect={handleSelectMatter}
        />
      </div>

      {/* Center: Structure View — flex */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedMatter ? (
          <>
            {/* Suggestions */}
            <div className="px-6 pt-4">
              <WorkbenchSuggestions suggestions={suggestions} onAccept={handleAcceptSuggestion} />
            </div>
            <div className="flex-1 min-h-0">
              <MatterStructureView
                matter={selectedMatter}
                allMatters={matters}
                inspected={inspected}
                onInspect={setInspected}
                onAction={handleAction}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-[12px] text-muted-foreground">Select a matter from the navigator</p>
          </div>
        )}
      </div>

      {/* Right: Inspector — 320px */}
      <div className="w-[320px] shrink-0">
        <WorkbenchInspector
          matter={selectedMatter}
          allMatters={matters}
          inspected={inspected}
          onAction={handleAction}
          onClose={() => setInspected(null)}
        />
      </div>
    </div>
  );
}
