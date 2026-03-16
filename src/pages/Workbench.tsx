import { useState, useCallback, useMemo } from "react";
import { mockMatters } from "@/data/attentionMock";
import type { Matter } from "@/lib/attention-types";
import type { InspectedObject, WorkbenchAction, WorkbenchViewMode } from "@/lib/workbench-types";
import type { RepairSuggestion } from "@/lib/workbench-types";
import {
  applyWorkbenchAction,
  deriveRepairSuggestions,
  describeWorkbenchAction,
} from "@/lib/workbench";
import { MatterNavigator } from "@/components/workbench/MatterNavigator";
import { MatterStructureView } from "@/components/workbench/MatterStructureView";
import { WorkbenchInspector } from "@/components/workbench/WorkbenchInspector";
import { WorkbenchSuggestions } from "@/components/workbench/WorkbenchSuggestions";
import { WorkbenchReplayView } from "@/components/workbench/WorkbenchReplayView";
import { WorkbenchTimelineView } from "@/components/workbench/WorkbenchTimelineView";
import { WorkbenchModeToggle } from "@/components/workbench/WorkbenchModeToggle";
import { toast } from "sonner";

export default function Workbench() {
  const [matters, setMatters] = useState<Matter[]>(() => [...mockMatters]);
  const [selectedMatterId, setSelectedMatterId] = useState<string | null>(mockMatters[0]?.id ?? null);
  const [inspected, setInspected] = useState<InspectedObject | null>(null);
  const [viewMode, setViewMode] = useState<WorkbenchViewMode>("structure");

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

  const handleModeChange = useCallback((mode: WorkbenchViewMode) => {
    setViewMode(mode);
    setInspected(null); // Clear inspector on mode switch
  }, []);

  const handleAction = useCallback((action: WorkbenchAction) => {
    setMatters(prev => {
      const result = applyWorkbenchAction(prev, action);

      // Post-action: select new/target matter if applicable
      if (result.selectMatterId) {
        setSelectedMatterId(result.selectMatterId);
      }

      if (result.clearInspection) {
        setInspected(null);
      }

      return result.matters;
    });

    toast.success(describeWorkbenchAction(action));
  }, []);

  const handleAcceptSuggestion = useCallback((suggestion: RepairSuggestion) => {
    handleAction(suggestion.action);
  }, [handleAction]);

  return (
    <div className="flex flex-1 min-h-0">
      {/* Left: Matter Navigator — 260px */}
      <div className="w-[260px] shrink-0">
        <MatterNavigator
          matters={matters}
          selectedId={selectedMatterId}
          onSelect={handleSelectMatter}
        />
      </div>

      {/* Center: Structure / Timeline / Replay — flex */}
      <div className="flex-1 min-w-0 flex flex-col">
        {selectedMatter ? (
          <>
            {/* View mode toggle */}
            <div className="px-6 pt-4">
              <WorkbenchModeToggle value={viewMode} onChange={handleModeChange} />
            </div>

            {/* Suggestions (structure mode only) */}
            {viewMode === "structure" && suggestions.length > 0 && (
              <div className="px-6 pt-3">
                <WorkbenchSuggestions suggestions={suggestions} onAccept={handleAcceptSuggestion} />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-h-0">
              {viewMode === "structure" && (
                <MatterStructureView
                  matter={selectedMatter}
                  allMatters={matters}
                  inspected={inspected}
                  onInspect={setInspected}
                  onAction={handleAction}
                />
              )}
              {viewMode === "timeline" && (
                <WorkbenchTimelineView
                  matter={selectedMatter}
                  inspected={inspected}
                  onInspect={setInspected}
                />
              )}
              {viewMode === "replay" && (
                <WorkbenchReplayView
                  matter={selectedMatter}
                  allMatters={matters}
                  inspected={inspected}
                  onInspect={setInspected}
                  onAction={handleAction}
                />
              )}
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
          viewMode={viewMode}
          onAction={handleAction}
          onClose={() => setInspected(null)}
        />
      </div>
    </div>
  );
}
