import type { PlayState } from "./play-state";

export type VisualSurfaceId = "world-map" | "village" | "globe" | "founder-record";
export type VisualDebtMarker = {
  surface: VisualSurfaceId;
  status: "prototype" | "target-hook";
  reason: string;
};

export function getVisualDebtMarkers(state: PlayState): VisualDebtMarker[] {
  const markers: VisualDebtMarker[] = [
    {
      surface: "world-map",
      status: "prototype",
      reason: "Current sector grid is functional QA scaffolding, not final map art.",
    },
    {
      surface: "village",
      status: "prototype",
      reason: "Current settlement markers express progression, but final village identity still needs art direction.",
    },
  ];

  if (state.empireDeclarationId) {
    markers.push({
      surface: "globe",
      status: "target-hook",
      reason: "Empire-scale play needs a future globe/world presentation layer before public polish.",
    });
  }

  if (state.empireCrisisReason) {
    markers.push({
      surface: "founder-record",
      status: "target-hook",
      reason: "Crisis outcomes should later receive stronger visual treatment in the end-of-run record.",
    });
  }

  return markers;
}
