# Godot Aurelian First Nation Founding v1 Contract

Status: PROPOSED
Issue: #502
Authority baseline SHA: `0d86b2027c5fe121eea475e9e7a326f459b000c0`
Product baseline SHA: `b747ce5579a29c0b0cb07887c57046549ea3db79`
Cost target: 0 USD
MAX: OFF

## Objective

Advance the accepted playable arc from the first recognized city to the first founded nation through one deliberate player action:

`World first city recognized -> explicit Found Aurelian Nation -> World first nation founded -> Map Aurelian homeland -> Village Greenvale capital`

This is one bounded civic milestone on the accepted single Aurelian land and shared physical geography.

## Player action and event

The implementation must expose an explicit normal-input action named `Found Aurelian Nation`.

Only that deliberate action may emit:

`AURELIAN_FIRST_NATION_FOUNDING=AURELIAN`

Navigation, reopening a view, restoring a session or loading a profile must not emit the event.

## Required states

The explicit action must persist exactly one new progression fact, `nation_founded`, through Session Persistence v2.

After founding:

- World restores `world_first_nation_founded`;
- Map restores `map_aurelian_homeland`;
- Village restores `village_greenvale_capital`.

The existing city, East Route and caravan facts remain accepted prerequisites and must not be rebuilt.

## Visible boundary

Village remains HOW:

- preserve the accepted 19-node Greenvale city;
- identify Greenvale as the capital;
- add at most three bounded civic standards or derived repository-pinned instances;
- do not introduce a new asset family or rebuild the accepted GLB.

Map remains WHERE:

- preserve the accepted single-land Aurelian topology;
- show one subordinate homeland boundary cue around that same land;
- upgrade the existing Greenvale city marker to one capital marker;
- preserve the East Route and caravan geography.

World remains WHY / WHICH DIRECTION:

- preserve the accepted strategic directions;
- show one bounded Aurelian nation emblem or standard;
- communicate that the first nation has been founded without turning World into a duplicate Map.

## Persistence

Native restart, Web reload and persistent-profile reopen must restore the founded nation.

Use the existing Session Persistence v2 namespace and version unless an exact deterministic incompatibility proves a migration is required. The bounded addition is one boolean progression fact, `nation_founded`.

## Required evidence

Exact-head evidence must prove:

1. the accepted first-city state before founding;
2. the explicit `Found Aurelian Nation` HUD or action;
3. the nation state after the deliberate action;
4. one explicit-only event emission;
5. World first nation founded;
6. Map Aurelian homeland with the existing geography, capital marker, East Route and caravan;
7. Village Greenvale capital with the accepted city superset;
8. leaving and reopening every view preserves the result;
9. native restart preserves the result;
10. Web reload preserves the result;
11. persistent-profile reopen preserves the result;
12. normal-input sequence and exact-head manifests;
13. shared-geography regression coverage.

Green CI alone is not acceptance. Direct review of exact-head stills and motion is mandatory.

## Allowed implementation scope

- the bounded Aurelian Godot controller and HUD;
- existing Aurelian Village, Map and World scene logic;
- one `nation_founded` persistence fact;
- focused deterministic contract tests;
- synchronized existing Playable Entry, Web Playability and Session Persistence v2 evidence workflows;
- procedural or repository-pinned derived presentation within the visible boundary.

## Forbidden scope

- economy, prices, resources, costs, rewards, inventory or taxes;
- population simulation, workers, timers, queues or repeated actions;
- governance systems, laws, factions, diplomacy or combat;
- empire progression;
- another land or multiple-land expansion;
- new terrain, geography, GLB or asset family;
- broad Village, Map or World polish;
- `app/play/**` or public shell changes;
- backend, accounts, cloud save or multiplayer;
- crypto, NFT, wallet, token, mint or pay-to-win direction;
- P12, MAX, paid tools or image generation authority.

## Recovery and review

- One active product or recovery PR.
- Deterministic failure requires exact log inspection and a root-cause fix on the same PR.
- Infrastructure failure before product testing permits rerunning only the smallest failed job.
- Blind retry is forbidden.
- One bounded visual correction maximum.
- After that correction, the terminal classification must be either `GODOT_AURELIAN_FIRST_NATION_FOUNDING_PASS` or `GODOT_AURELIAN_FIRST_NATION_FOUNDING_REJECT`.

## Stop condition

Before this documentation-only contract is accepted on `main`, no product implementation is authorized.

After acceptance, exactly one bounded implementation candidate for issue #502 is authorized. It stops at exact-head direct review and one of the two terminal classifications above.
