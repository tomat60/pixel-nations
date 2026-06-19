# Living Map Layer v0.5 — Strategy Brief

Status: STRATEGY LOCK / NOT IMPLEMENTATION  
Owner: Product Lead / Game Designer / Cartography Lead / UX Director / Frontend Lead / Visual QA Lead / Prompt QA Lead / Cost-Control Lead / Business-Fundraising Lead  
Created after: Visual Gamefeel v0.4 merge, map geography continuity lock, Visual QA + Prompt Gate lock.

## Executive Decision

The next product direction is **Living Map Layer v0.5**.

The goal is not another decorative map polish sprint. The goal is to make Pixel Nations feel more like a living strategic atlas: decisions should leave visible traces on the world map through routes, influence, land states, and light activity feedback.

This is the correct next step because Pixel Nations must move from:

> a beautiful map plus decision panels

toward:

> a living strategy atlas where one land visibly begins to shape a world.

## Product Truths Protected

- One land can become an empire.
- Simple first. Deep later.
- Current demo shows Sector A-01 / Aurelian Basin, not the full 10,000-land world.
- Cursor is executor, not strategist.
- No crypto/NFT/wallet/mint/token/pay-to-win direction.
- Visual polish cannot burn budget without increasing product truth or demo trust.
- User-reported confusion and real browser issues override screenshot PASS.

## Why v0.5 Exists

Pixel Nations already has the core player path:

1. Land claim.
2. Settlement founding.
3. Trade route choice.
4. Alliance choice.
5. Nation doctrine.
6. Empire direction.
7. Local core engine / settlement actions.
8. First visual gamefeel layer.

The next missing piece is that the **world itself** must start reacting.

Currently, the player can make decisions, but the map still feels partly static. v0.5 should add the first layer of visible world consequences without building the final map engine yet.

## Strategic Objective

Create the first credible feeling that the map is alive.

v0.5 should make the player feel:

- my land is not isolated,
- my settlement has outward pressure,
- trade and influence are visible,
- the world has activity,
- the path from land to empire has a spatial footprint.

## Scope

### In Scope

Living Map Layer v0.5 may include:

- visible trade route lines between claimed land and trade partners,
- subtle influence pulses from owned/settled land,
- clearer owned / unclaimed / strategic / locked land states,
- activity markers such as route movement, soft pings, glow pulses, or small symbolic motion,
- map legend or explanation if needed,
- lightweight world-state representation derived from current demo choices,
- better continuity between claim, settlement, trade, nation, and empire states,
- QA evidence for desktop and mobile map states.

### Out of Scope

Do not build yet:

- final 10,000-land engine,
- procedural world generation,
- exact globe-to-sector geospatial system,
- multiplayer or real user account persistence,
- full economy simulation,
- army pathfinding,
- real-time strategy controls,
- AI NPC nations,
- map asset replacement,
- crypto/NFT/wallet/token systems,
- pay-to-win monetization.

## Design Direction

The living map should feel like a premium command atlas, not arcade clutter.

Correct tone:

- restrained,
- readable,
- strategic,
- atmospheric,
- alive through subtle movement,
- high trust,
- low noise.

Avoid:

- too many neon effects,
- particle spam,
- fake magical shields,
- random icons without system meaning,
- animations that hurt performance,
- labels that collide with map frames,
- visual changes that look richer but make the demo harder to understand.

## Game Design Direction

v0.5 should connect existing decisions to map-visible state.

Examples:

### Claim

When a player claims land:

- land becomes visibly owned,
- surrounding area can show soft influence,
- selected land remains spatially stable within the view.

### Settlement

When settlement is founded:

- owned land shows settlement presence,
- settlement state can pulse lightly or gain a tiny marker,
- population/security/prosperity may be hinted but not over-simulated.

### Trade

When a trade route is chosen:

- route line appears toward chosen partner,
- route can have very subtle motion/pulse,
- route should be readable and not decorative-only.

### Alliance

When alliance is chosen:

- partner direction or relation can be represented as a diplomatic link,
- avoid clutter if trade route already exists.

### Nation / Empire

When nation/empire forms:

- influence radius or visual aura may expand,
- map should imply “this land has become a political center.”

## UX Requirements

The player should understand the map at a glance:

- What is mine?
- What can I interact with?
- What changed after my last decision?
- What is the next strategic opportunity?
- Why does this route/influence matter?

If the map becomes prettier but less understandable, the sprint fails.

## Cartography Continuity Requirements

v0.5 does not solve the final geography engine, but it must not worsen known geography issues.

Follow `docs/MAP_GEOGRAPHY_CONTINUITY_KNOWN_ISSUE.md`.

Required guardrails:

- do not imply exact globe/sector geography if it is not true,
- do not place primary claim markers on obvious water,
- do not let selected land jump randomly between critical views,
- do not create new fake precision,
- do not break Sector A-01 / Aurelian Basin story clarity.

## Visual QA / Prompt QA Requirements

Follow:

- `docs/VISUAL_QA_AND_PROMPT_GATE_PROTOCOL.md`
- `docs/PUBLIC_PREVIEW_QA_PROTOCOL.md`
- `docs/CURSOR_BUDGET_RECOVERY_PLAN.md`
- `docs/QA_GOVERNANCE_PROTOCOL.md`

Before any implementation:

- exact artifact must be defined,
- files/components must be identified,
- do-not-change list must be explicit,
- regression risks must be named,
- public or review-bundle evidence must be required,
- Cursor prompt must pass Prompt QA if Cursor is used.

## Technical Strategy

Default approach:

1. No Cursor initially.
2. Inspect source and current map/state components.
3. Prepare implementation plan.
4. Prefer deterministic patch package for small state/visual additions.
5. Use Cursor only for a focused implementation sprint if component changes are too broad for a safe patch.

Preferred implementation shape:

- derive visual map state from existing demo/local state,
- avoid new dependencies,
- keep animations CSS/lightweight,
- keep state deterministic,
- no backend required,
- preserve smoke path,
- preserve mobile responsiveness.

## Cost Strategy

Cursor is blocked until the v0.5 implementation plan proves it is necessary.

Allowed now:

- ChatGPT strategy,
- docs,
- source inspection bundles,
- deterministic patch packages,
- terminal QA.

Blocked now:

- Cursor creative exploration,
- open-ended visual iteration,
- another map polish loop,
- MAX mode,
- paid model escalation.

Cursor may be allowed later only if:

- Prompt QA passes,
- exact files are known,
- scope is implementation-heavy,
- direct patch is unsafe,
- stop condition is measurable,
- budget reserve remains protected.

## Candidate v0.5 Features

These are candidates, not all mandatory.

### Candidate A — Trade Route Visibility

Add visible route line from owned settlement toward chosen trade partner.

Why high value:
- connects choice to map,
- easy to understand,
- supports “world is alive.”

Risk:
- line clutter,
- misleading geography if route target is fake.

### Candidate B — Influence Pulse

Owned/settled land emits subtle pulse or ring.

Why high value:
- communicates growth,
- supports nation/empire path.

Risk:
- can look magical or cheap if too strong.

### Candidate C — Land State Legend

Small legend or status chips explain map colors/states.

Why high value:
- improves first-time clarity,
- helps demo trust.

Risk:
- UI clutter if overdone.

### Candidate D — Strategic Opportunity Markers

A few nearby “future opportunity” points: trade, frontier, alliance.

Why high value:
- creates forward-looking depth.

Risk:
- can feel fake if geography is not coherent.

## Recommended First Implementation Slice

The best first implementation slice is:

> Trade Route Visibility + Owned Land Influence Pulse + Minimal Legend

Do not start with full route network or many markers.

Reason:
- high player comprehension,
- tied to existing trade choice,
- visible consequence,
- minimal engine risk,
- useful for screenshots/demo.

## Acceptance Criteria For v0.5

The sprint is accepted only if:

- map shows at least one visible consequence of player decisions,
- trade route or influence state is readable,
- UI remains uncluttered,
- no first-impression visual regression,
- mobile map remains usable,
- smoke PASS,
- evidence FRESH,
- visual gate report exists,
- review bundle or public QA evidence includes affected map states,
- known geography issues are not worsened,
- Cursor budget is not wasted.

## Stop Conditions

Stop immediately if:

- the map becomes visually cluttered,
- route/influence visuals imply false precision,
- mobile map regresses,
- screenshot PASS conflicts with real visual judgment,
- Cursor starts changing unrelated systems,
- implementation drifts into full map engine rebuild.

## Final Product Intent

Living Map Layer v0.5 should make Pixel Nations feel less like static screens and more like the beginning of a world system.

The player should see:

> I claimed land. I founded a settlement. I opened a route. My land is becoming a center of power.

That feeling is more important than adding many new mechanics.
