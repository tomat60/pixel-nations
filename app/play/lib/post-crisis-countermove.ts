export type PostCrisisCountermoveOrigin = "stabilize-frontier" | "accept-concession";

export type PostCrisisResponseId =
  | "hold-north-ridge"
  | "open-wardens-council"
  | "revoke-passage-right"
  | "bind-passage-tribute";

export type PostCrisisResponse = {
  id: PostCrisisResponseId;
  label: string;
  short: string;
  effect: string;
  worldEffect: string;
  influenceDelta: number;
  pressureDelta: number;
};

export type PostCrisisCountermove = {
  origin: PostCrisisCountermoveOrigin;
  title: string;
  prompt: string;
  worldMarker: string;
  responses: readonly [PostCrisisResponse, PostCrisisResponse];
};

export const postCrisisCountermoves: Record<PostCrisisCountermoveOrigin, PostCrisisCountermove> = {
  "stabilize-frontier": {
    origin: "stabilize-frontier",
    title: "Obsidian Probe at North Ridge",
    prompt:
      "The Obsidian March tests the newly paid wardens before the emergency writs can become permanent law.",
    worldMarker: "Rival probe against the stabilized North Ridge",
    responses: [
      {
        id: "hold-north-ridge",
        label: "Hold North Ridge",
        short: "Keep the wardens in place and publicly absorb the cost of defending the settlement.",
        effect: "-1 Influence, -8 Rival Pressure; the frontier holds and imperial authority remains visible.",
        worldEffect: "North Ridge remains fortified under a permanent imperial watch.",
        influenceDelta: -1,
        pressureDelta: -8,
      },
      {
        id: "open-wardens-council",
        label: "Open a Wardens’ Council",
        short: "Share frontier authority with local wardens so the rival cannot isolate the court from the pass.",
        effect: "+1 Influence, -4 Rival Pressure; legitimacy rises, but the frontier gains a stronger independent voice.",
        worldEffect: "A wardens’ council becomes the political anchor of North Ridge.",
        influenceDelta: 1,
        pressureDelta: -4,
      },
    ],
  },
  "accept-concession": {
    origin: "accept-concession",
    title: "Obsidian Claim on the Passage",
    prompt:
      "The Obsidian March treats the temporary concession as precedent and demands lasting control over the ridge route.",
    worldMarker: "Rival claim exploiting the North Ridge concession",
    responses: [
      {
        id: "revoke-passage-right",
        label: "Revoke the Passage Right",
        short: "End the concession before it hardens into a rival territorial claim.",
        effect: "+2 Influence, +10 Rival Pressure; legitimacy recovers while open confrontation becomes more likely.",
        worldEffect: "The concession marker is replaced by a contested imperial border claim.",
        influenceDelta: 2,
        pressureDelta: 10,
      },
      {
        id: "bind-passage-tribute",
        label: "Bind Passage to Tribute",
        short: "Keep the route open only under a formal tribute compact recorded by the Charter Courts.",
        effect: "+1 Influence, -3 Rival Pressure; compromise becomes enforceable law instead of a quiet surrender.",
        worldEffect: "North Ridge becomes a treaty passage with tribute obligations and visible imperial oversight.",
        influenceDelta: 1,
        pressureDelta: -3,
      },
    ],
  },
};

export function getPostCrisisCountermove(origin: PostCrisisCountermoveOrigin | null) {
  return origin ? postCrisisCountermoves[origin] : null;
}

export function getPostCrisisResponse(
  origin: PostCrisisCountermoveOrigin | null,
  responseId: PostCrisisResponseId | null,
) {
  return getPostCrisisCountermove(origin)?.responses.find((response) => response.id === responseId) ?? null;
}
