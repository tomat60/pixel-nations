# Pixel Nations — Implementation Roadmap v1.0

Status: ACTIVE STRATEGY RAIL  
Purpose: define the safest implementation order from current demo to first final playable version.

## Operating rule

Do not jump to advanced systems before the current player arc is understandable.

## Phase 0 — Current demo stabilization

Goal: keep public demo deployable and process stable.

Required gates:

- `npm run pn:status` passes
- public QA check passes
- report ZIP workflow works
- no dirty repo before sprint start

## Phase 1 — Core loop clarity

Goal: the player understands what to do after claiming land.

Deliverables:

- objective spine visible after claim
- dashboard explains current land status
- settlement screen explains first foundation goal
- nation/empire are framed as future milestones, not empty labels

Acceptance:

- build passes
- smoke passes
- screenshot QA passes or fails only on classified non-blocking visual debt
- manual review confirms post-claim path is clearer

## Phase 2 — Settlement foundation

Goal: settlement becomes an actual first gameplay decision.

Deliverables:

- choose settlement focus, such as agriculture, trade, defense, culture, industry, or exploration
- show immediate consequence text/state
- show next unlock
- no backend overbuild unless needed

Acceptance:

- one complete settlement choice path is playable
- choice is visible after selection
- player understands why the choice matters

## Phase 3 — City identity

Goal: settlement has a path toward city identity.

Deliverables:

- city core milestone
- simple population/resource/prosperity indicators
- first visible city trait
- route to trade/alliance

Acceptance:

- the city milestone feels like progression, not a label

## Phase 4 — Connection layer

Goal: player sees that lands can interact.

Deliverables:

- trade route or alliance route creation
- simple symbolic connection between lands
- explanation of why connections matter

Acceptance:

- player understands that empire is not only growth, but relationships and territory

## Phase 5 — Nation formation

Goal: city/settlement path can become nation identity.

Deliverables:

- nation founding screen connected to previous decisions
- nation name/identity/trait
- first policy or doctrine

Acceptance:

- nation formation is emotionally and strategically understandable

## Phase 6 — Empire horizon

Goal: empire is visible as the long-term fantasy.

Deliverables:

- empire screen explains requirements
- first expansion target/horizon
- long-term progression promise

Acceptance:

- player can explain how one land could become an empire

## Phase 7 — Visual/world polish

Goal: improve map, visual consistency, and presentation after core loop works.

Deliverables:

- homepage map containment
- map/globe consistency pass
- stronger terrain/land readability
- improved responsive framing

Acceptance:

- first impression no longer has obvious visual bugs
- map supports the loop without dominating production

## Phase 8 — Cloud/agent production

Goal: move execution off the local MacBook under strict gates.

Deliverables:

- cloud dev environment
- CI build/smoke/QA
- agent execution governance
- branch/PR workflow
- cost limits

Acceptance:

- agent cannot push broken or ungated changes to main
