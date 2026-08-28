# Godot Aurelian First Frontier Payoff v1 Contract

Status: PROPOSED
Issue: #534
Authority baseline: `main@7a002bbc484e46229963990f9da598106beddec2`
Accepted product baseline: `74a4362789a407853a41a0769ac3741d2e684119`
Accepted predecessor head: `7f207ad74c6c816473d7589eb7074238449bab9c`

## Purpose

Close the accepted Day-90 first-empire arc with one visible, persistent frontier payoff derived from the recorded First Rival Countermove response.

This contract authorizes exactly one bounded Godot implementation candidate after this documentation-only contract and the paired current-state update are merged with healthy exact-head checks.

## Required playable outcome

`recorded rival response -> World reveals the derived frontier payoff -> Map shows the existing payoff locus -> Village explicitly secures the derived payoff -> Map shows the secured existing locus -> World records the first empire frontier legacy complete`

## Deterministic mapping

| Persisted rival response | Derived payoff | Existing locus | Explicit Village action |
|---|---|---|---|
| `stand_firm` | fortified frontier legacy | Gilded Crossing | `Secure Gilded Crossing` |
| `negotiate_passage` | passage legacy | East Bridge | `Ratify East Bridge Passage` |

Only the action derived from the persisted response may be presented. No random selection, third payoff, second decision matrix or direction-specific payoff variant is allowed.

## View-role binding

- Village = HOW: show the one derived action and require deliberate normal input to commit it.
- Map = WHERE: show the existing payoff locus in pending and secured states.
- World = WHY / WHICH DIRECTION: explain the derived opportunity and record the completed frontier legacy while preserving Trade, Expand or Frontier identity.
- Village, Map and World remain one physical Aurelian Basin.

## Required state and behavior

The implementation must:

- preserve `empire_proclaimed=true`;
- preserve `imperial_crisis=river_surge` and its recorded response;
- preserve `first_rival_countermove=obsidian_march` and its recorded response;
- derive exactly one payoff from that response;
- add one minimal persisted payoff value and one secured flag or equivalent validated representation;
- reject invalid response/payoff combinations;
- make secure idempotent and emit the payoff event exactly once;
- preserve selected national direction;
- restore the secured result across native restart, Web reload and profile reopen;
- allow leaving and reopening Village, Map and World without losing the result.

Recommended event contract:

- `AURELIAN_FIRST_FRONTIER_PAYOFF=GILDED_CROSSING`;
- `AURELIAN_FIRST_FRONTIER_PAYOFF=EAST_BRIDGE_PASSAGE`;
- exactly one event per accepted path.

## Shared-geography invariants

The candidate must not change:

- Greenvale origin;
- river spline or banks;
- East Bridge transform, landing or roads;
- Gilded Crossing transform;
- North Ridge, forest/work edge, fields, coast or route topology;
- Village, Map or World camera topology;
- accepted GLB digest.

Procedural cues must attach to existing geometry. They may not imply a second land, ownership expansion or a new settlement.

## Allowed files and categories

- `game/scenes/aurelian/playable_aurelian_entry_v1.gd`;
- `game/scenes/aurelian/aurelian_session_persistence_v2.gd`;
- one new exact manifest under `game/scenes/aurelian/**`;
- one focused test under `game/tests/**`;
- narrowly required updates to existing Playable Entry, Web Playability and Session Persistence workflows;
- contract-linked documentation.

## Forbidden scope

- another land, ownership change, border expansion or new settlement;
- combat, units, damage, victory or defeat simulation;
- rival AI, randomness, turns or a faction system;
- rewards, penalties, Influence, Rival Pressure, resources, costs, timers, economy or meters;
- diplomacy, governance or treaty simulation;
- a third payoff or direction-specific payoff matrix;
- new GLB, terrain, geography, asset family or dependency;
- backend, accounts, cloud save, multiplayer, Next.js final-surface work or public-shell changes;
- broad visual polish, broad CI changes, P12, MAX, paid tools or paid assets.

## Exact-head evidence

The implementation head must produce:

### Playable Entry

- World derived payoff for each rival response;
- Map pending Gilded Crossing payoff;
- Map pending East Bridge payoff;
- Village derived action for each path;
- Map secured result for each path;
- World completed frontier legacy for each path;
- one continuous normal-input video through the final payoff;
- focused test and manifest logs.

### Web Playability

- normal-input path from recorded rival response through one secure action;
- pending and secured stills across World, Map and Village;
- exact-head export and browser logs;
- no storage seeding as acceptance authority.

### Session Persistence v2

- native path using one payoff;
- Web reload and profile reopen using the other payoff;
- exact preserved crisis response, rival response, national direction and payoff;
- restored secured Map and Village states;
- invalid-combination and idempotence checks.

## Direct review

Green CI is necessary but not sufficient.

Direct review must inspect:

- both response-derived paths;
- pending versus secured readability;
- correct Village, Map and World roles;
- unchanged shared geography;
- normal-input motion;
- native restart, Web reload and profile reopen evidence.

One bounded visual correction maximum is allowed.

## Validation

At minimum:

- authority gate and project status pass;
- focused First Frontier Payoff contract test passes;
- all existing Godot regression tests pass;
- manifest JSON validates;
- Playable Entry, Web Playability and Session Persistence workflows succeed at the same exact head;
- changed files remain inside this contract;
- no new dependency, GLB, terrain or asset family appears.

## Failure recovery

- Any head movement invalidates older evidence.
- A deterministic failure must be fixed at root cause on the same PR.
- An isolated infrastructure failure may rerun only the smallest failed job.
- No blind retry.
- A rejected candidate must restore the First Rival Countermove baseline and record the exact reason.

## Acceptance classification

Terminal classification must be exactly:

- `GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_PASS`; or
- `GODOT_AURELIAN_FIRST_FRONTIER_PAYOFF_REJECT`.

## Stop condition

Stop after one accepted or rejected candidate. A PASS must be recorded in `docs/PROJECT_CURRENT_STATE.md` before any later strategy review. A REJECT must preserve the accepted First Rival Countermove baseline.
