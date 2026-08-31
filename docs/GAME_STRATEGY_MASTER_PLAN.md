# Pixel Nations — Game Strategy Master Plan v2.0

Status: ACTIVE STRATEGY RAIL
Updated: 2026-08-31
Purpose: preserve the whole-game product strategy so locally sensible milestones cannot drift away from the best global build order.

## Core truth

**One land can become an empire.**

Everything in Pixel Nations should make that transformation understandable, visible and strategically meaningful.

## Product direction

Pixel Nations is a **Living Atlas Strategy Builder**.

It combines:

- the territorial ambition and long arc of grand strategy;
- the emotional ownership of starting from one place;
- visible settlement/city growth;
- readable strategic decisions and consequences;
- an atlas/world that visibly responds to the player's choices;
- symbolic movement and systems instead of simulating every individual person.

The game must not become a dashboard, spreadsheet, full RTS or heavy city-builder before the core experience earns that depth.

## Permanent product pillars

### 1. Land identity
A land is the seed of future political power, not merely a tile.

### 2. Visible growth
A player should see progression before reading it. Settlement, city, nation and empire must create obvious changes in silhouette, density, territory, hierarchy and scale.

### 3. Strategic clarity before depth
Simple first. Deep later. Complexity is earned only after the player understands the path and consequences.

### 4. Choice with consequence
Important decisions should change what the world looks like or what the player can meaningfully do next.

### 5. One coherent geography
Village, Map and World are different roles over one physical world:

- Village = **HOW**
- Map = **WHERE**
- World = **WHY / SCALE / WHICH DIRECTION**

Do not solve product problems by inventing disconnected copies of the geography.

### 6. Premium restraint
No noisy reward spam, manipulative monetization, crypto/NFT/wallet-first framing or pay-to-win direction unless explicitly reopened.

## Production doctrine

### Build horizontal breadth in blockout before vertical depth

Pixel Nations should not build the entire final-art world before mechanics. That would create expensive rework.

It also should not keep deepening one small region with consecutive micro-mechanics while the rest of the core fantasy remains visually undefined.

The production order is:

1. prove the core fantasy with playable mechanics;
2. block out the **whole progression and world shape** cheaply;
3. make one representative core loop genuinely fun and readable;
4. deepen systems only after the relevant world/progression layer exists;
5. scale content after the systems and visual grammar are stable;
6. polish after the product is understandable and worth returning to.

This follows the useful part of vertical-slice development while avoiding endless state-machine serialization.

### Proof over claims

A feature is not valuable because it has many states or tests. For gameplay/visual work, acceptance requires running-game proof: screenshots, motion, direct review and persistence where relevant.

### Whole-product value over milestone count

The goal is not to maximize merged PRs. Prefer one meaningful reviewable sprint that moves the visible product substantially over a chain of tiny state transitions.

## Proven baseline and reusable prototypes

The accepted Godot work has already proven important foundations:

- land claim;
- settlement founding/development;
- trade route and caravan;
- city, nation and empire transitions;
- Living Capital presentation/gamefeel;
- direction/mandate;
- crisis and rival consequence;
- frontier payoff;
- second-land expansion;
- North Ridge outpost;
- Trade Post / Watch Post specialization and payoff;
- inter-land coordination;
- persistence and exact-head evidence across native/Web flows.

These are **validated prototype material**. They are not a mandate to keep extending each system immediately.

Rejected experiments remain reference only unless a later portfolio review explicitly reopens them.

## Current build sequence

The phases below are the default sequence. They may be reordered only by an explicit whole-product portfolio review supported by current evidence.

### Phase A — Full Progression Blockout — CURRENT

Goal: make the complete core promise visible before adding deeper mechanics.

Build one coherent representative matrix:

`land -> settlement -> city -> nation -> empire`

for each of:

- Village
- Map
- World

Primary proof: 15 exact-head running-game screenshots plus one short input-driven progression video.

The five stages must be understandable without labels or implementation notes.

This is blockout/composition work, not final art. Reuse accepted assets, materials, topology, cameras and existing staged village work wherever useful.

Do not expand Third-Land Prospect, economy, combat, diplomacy or governance in this phase.

### Phase B — Core Playable Loop Consolidation

Goal: make one representative loop satisfying from start to meaningful expansion.

Target loop:

`claim -> develop -> choose -> see consequence -> grow -> expand`

Focus on:

- clarity of actions;
- pacing;
- gamefeel;
- visible consequence;
- low-friction navigation between Village/Map/World;
- persistence of meaningful state.

Do not add depth merely to make the design document larger.

### Phase C — Minimal Economy Foundation

Goal: add the smallest economy that creates interesting decisions and visible growth.

Potential ingredients, subject to phase research:

- a very small resource set;
- population/capacity abstraction;
- one or two production/development tradeoffs;
- construction/development cost or opportunity cost;
- simple trade interaction.

Avoid deep chains, worker micromanagement and spreadsheet play.

A resource should not exist unless it changes a decision or the visible world.

### Phase D — Repeatable Expansion Loop

Goal: replace scripted one-off expansion proofs with a simple reusable land-growth loop.

Only after the first three phases are stable should the game generalize:

- discovering/inspecting possible lands;
- choosing expansion;
- claiming/using additional lands;
- connecting them to the capital/network;
- preserving readable territory and frontier state.

The logical 10,000-land world can be represented structurally before production content exists for every land.

### Phase E — Nation Gameplay Depth

Goal: turn validated prototypes into coherent nation-level systems.

Possible reusable material:

- Trade / Watch identity;
- national direction;
- crisis response;
- rival pressure;
- frontier consequences;
- logistics/vigilance coordination.

Before productionizing these prototypes, research their interaction and remove redundant state-machine branches.

### Phase F — Empire Gameplay and Scaling

Goal: make empire scale meaningfully different from nation scale.

Potential concerns:

- multiple regions/frontiers;
- strategic network management;
- rival powers and influence;
- higher-level economic/political tradeoffs;
- symbolic conflict where justified;
- stronger World-layer strategic decisions.

Do not simulate complexity that cannot be communicated clearly.

### Phase G — Content Scale and Polish

Goal: turn the proven structure into a strong product.

Includes as justified:

- more land/region content;
- settlement/city visual variety;
- landmarks;
- onboarding and UX;
- motion/VFX/audio;
- lighting and final visual hierarchy;
- performance;
- accessibility;
- return-loop tuning;
- human testing when the game has enough value to test meaningfully.

## Visual strategy

### Village progression

The player should read increasing development through:

- footprint and density;
- road/path organization;
- civic hierarchy;
- residential/work/field edges;
- landmark prominence;
- movement/gamefeel;
- capital/imperial identity.

### Map progression

The Map should evolve from a starting land into readable strategic geography:

- land importance;
- settlement/city anchors;
- routes/network;
- homeland/territory;
- borders/frontier;
- regional relationships.

Do not solve scale by covering the map with tiny dashboard labels.

### World progression

The World view should increasingly answer:

- where am I in the larger world?
- what is my sphere of power?
- what directions matter next?
- how much larger has my polity become?

It should feel like a living atlas/command geography, not a menu over an unchanged diorama.

## Research gate

Research is mandatory when the decision has high leverage or significant uncertainty, especially:

- phase transitions;
- a new major gameplay system family;
- architecture/runtime changes;
- visual-direction changes;
- repeated failed visual/gameplay iterations;
- paid tools/assets or meaningful recurring cost;
- major UX/onboarding assumptions;
- economy, AI, combat, multiplayer or other systems whose structure can create large rework.

Research should compare relevant games, production practice and current repo evidence. It should produce a decision, not an endless report.

## Whole-product portfolio gate

Before authorizing a new product milestone, identify the biggest current bottleneck across:

- world/progression completeness;
- core gameplay/fun;
- clarity/onboarding/UX;
- visual quality/gamefeel;
- strategic depth;
- technical/QA reliability;
- demo/business value.

Then answer:

1. What is the biggest bottleneck now?
2. What user-visible change will the candidate create?
3. Why is it better now than the strongest alternatives?
4. What are we deliberately not building?
5. What evidence will stop or accept the sprint?

Mandatory triggers for an explicit portfolio review:

- any terminal product `REJECT`;
- a major phase boundary;
- repeated milestones in the same subsystem while other product dimensions lag;
- user feedback that pace, clarity, gameplay or visual progress is wrong;
- code/state complexity growing faster than visible product value.

The portfolio review is intentionally lightweight. It can live in `PROJECT_CURRENT_STATE.md` or the active issue and must not create a separate bureaucracy-only cycle unless authority actually changes.

## Tool and cost strategy

- ChatGPT/control-plane owns strategy, research synthesis, scope, art direction, review, QA interpretation and merge decision.
- Cursor is executor only when a precise bounded implementation contract exists and an execution path is available.
- Deterministic GitHub/Godot/package tooling is preferred for inspection, validation and safe changes.
- MAX is OFF by default.
- Extra spend target is 0 USD until paid work directly improves quality, learning or probability of success.
- Do not buy assets to hide an unresolved art-direction or product-structure problem.

## Success ladder

Near-term success:

> I can look at the game and immediately understand how one land becomes an empire.

Next success:

> I can make a few clear decisions, see the world change, and want to make the next one.

Later success:

> My lands, cities, nation and empire feel like a coherent history I shaped rather than a sequence of scripted screens.

## Strategic stop rule

If the project is producing more states, documents or PRs than visible player value, stop feature production and run the portfolio gate.

If visual work fails after one complete candidate plus one bounded correction, stop coding and return to art direction/composition before another implementation attempt.

`docs/PROJECT_CURRENT_STATE.md` defines the exact current milestone and may narrow this plan, but a local issue may not silently override this whole-game strategy.