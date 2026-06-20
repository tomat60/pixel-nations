# Settlement / Nation / Empire Continuity v0.6 — Strategy Brief

Status: STRATEGY LOCK / NOT IMPLEMENTATION  
Owner: Product Lead / Game Designer / Systems Designer / UX Director / Frontend Lead / QA Lead / Cost-Control Lead  
Created after: Living Map v0.5 public validation.

## Executive Decision

The next strategic layer is **Settlement / Nation / Empire Continuity v0.6**.

Living Map v0.5 made the world start to react visually. v0.6 should make the player's internal progression feel more connected across settlement, trade, alliance, nation, and empire.

The player should feel:

> My earlier choices matter later.

This is not a new feature pile. This is continuity: existing decisions should echo across later screens.

## Product Truths Protected

- One land can become an empire.
- Simple first. Deep later.
- Current demo is Sector A-01 / Aurelian Basin, not final 10,000-land geography.
- Existing maps are prototype direction, not final geography truth.
- No crypto/NFT/wallet/token/pay-to-win language.
- Cursor is blocked until an implementation plan proves it is needed.

## Current Problem

The demo already has a strong path:

1. Claim land.
2. Found settlement.
3. Choose settlement focus.
4. Create trade route.
5. Form alliance.
6. Found nation doctrine.
7. Choose empire direction.
8. See first living-map feedback.

But the continuity between these choices can become stronger.

A player should not feel that each screen is isolated. The settlement focus should inform trade. Trade should inform alliance. Alliance and doctrine should inform nation identity. Nation and prior choices should make empire direction feel earned.

## v0.6 Goal

Create clearer continuity across existing choices without adding heavy simulation.

v0.6 should connect:

- settlement focus,
- trade destination,
- alliance partner,
- nation doctrine,
- empire direction,
- local development metrics,
- living map world activity.

## In Scope

v0.6 may include:

- a continuity summary panel,
- stronger “because of your path...” explanations,
- visible path memory across later screens,
- small derived bonuses/traits based on prior choices,
- improved recommendation logic for nation/empire choices,
- a “Path So Far” compact timeline,
- better state labels in dashboard/nation/empire,
- living map activity copy that reflects prior choices.

## Out of Scope

Do not build yet:

- full economy simulation,
- advanced AI nations,
- multiplayer,
- accounts/persistence,
- final geography engine,
- full diplomacy engine,
- complex war system,
- monetization systems,
- crypto/NFT/pay-to-win mechanics.

## Recommended First Slice

The recommended first implementation slice is:

> Path Memory + Continuity Panel + Derived Identity Trait

This means:

1. Add a compact “Path So Far” / “Your Realm’s Path” panel on dashboard or later strategic screens.
2. Derive 1–3 identity traits from existing choices.
3. Make nation/empire text reference those traits.
4. Keep changes data-light and deterministic.

## Candidate Derived Traits

Examples:

- Growth Charter + Iron Coast = Industrial Frontier
- Growth Charter + Ember Basin = Expanding Hearthland
- Trade Compact + Crownlands = Diplomatic Market Realm
- Sovereign Command + Defense focus = Ordered Frontier State
- Civic Mandate + Growth focus = Popular Civic Nation

These are examples only. Implementation should use a small simple mapping first.

## UX Direction

Good continuity copy should answer:

- What did I choose earlier?
- What does it mean now?
- Why is this recommendation happening?
- How is my land becoming a nation/empire?

Avoid:

- huge lore paragraphs,
- too many traits,
- abstract stat soup,
- unexplained bonuses,
- overwriting player fantasy with too much narration.

## Systems Direction

Use existing local state. Do not add backend.

Likely state inputs:

- settlementFocusId
- settlementFocus
- tradeRouteId
- tradeRouteDestination
- alliance fields
- nationDoctrineId
- empireDirectionId
- population / food / materials / influence / security / prosperity / stability
- tradeRoutes
- nationFounded
- empireFounded

Output:

- continuity trait(s),
- short path summary,
- recommendation explanation,
- possibly a compact timeline.

## QA Requirements

Before merge:

- build PASS,
- smoke PASS,
- screenshot QA PASS,
- handoff evidence FRESH,
- public preview/QA status checked if public visual impact,
- no regression in claim → settlement → trade → alliance → nation → empire flow,
- no broad map/frame UI work,
- no new Cursor unless approved through Prompt QA.

## Cost Strategy

Cursor remains blocked initially.

Preferred next action:

1. Source inspection bundle for continuity state/screens.
2. Assistant decides deterministic patch vs Cursor.
3. Prefer zero-Cursor patch.
4. Only use Cursor if mapping touches too many components for safe patching.

## Proposed Implementation Branch

If implementation begins:

`sprint/continuity-v0-6-path-memory`

## Stop Conditions

Stop immediately if:

- scope expands into full simulation,
- Cursor starts making product decisions,
- copy becomes too verbose,
- UI becomes cluttered,
- existing smoke path breaks,
- visual QA gate is skipped.
