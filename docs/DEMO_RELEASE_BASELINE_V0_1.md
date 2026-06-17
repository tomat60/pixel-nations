# Pixel Nations — Demo Release Baseline v0.1

Status: Accepted baseline  
Date: 2026-06-17  
Branch baseline: main

## Product promise

Pixel Nations is not just a map project.

Pixel Nations is the promise that one land can begin a path toward:

land → settlement → nation → empire

The current demo exists to prove that promise quickly, clearly, and emotionally.

## Current accepted public demo baseline

The current public demo baseline includes:

1. World Map v9 visual baseline
   - Asset-backed Aurelian Basin map.
   - Sector A-01 as the first playable frontier.
   - Full world promise remains 10,000 lands.
   - Current demo does not need full geographic perfection yet.

2. Landing map sync
   - Landing page now visually matches the accepted world map direction.
   - Landing should inspire, explain the promise, andsers into /world.
   - The full interactive claim experience remains on /world.

3. First 60 seconds clarity
   - User sees the world promise.
   - User understands Sector A-01 / Aurelian Basin is the first playable slice.
   - User is guided through:
     select land → claim land → enter command center → found settlement.

4. End-of-demo feedback CTA
   - Empire completion now gives users a clear next step.
   - Current feedback collection is intentionally simple through mailto.
   - No backend, accounts, waitlist system, or database is required yet.

## Accepted player path

The demo path is:

Landing
→ World
→ Select land
→ Claim land
→ Dashboard
→ Settlement
→ Nation
→ Empire
→ Feedback CTA

This path is currently more important than adding new systems.

## Locked decisions

### 1. Do not keep reworking the map by default

World Map v9 is accepted as the current baseline.

Do not start another map sprint unless one of these happens:

- reby the map,
- the atlas/playable-sector mismatch blocks understanding,
- we need a higher-quality visual pass for pitch/screenshots/trailer,
- a specific product goal requires map changes.

Known issue:
The atlas/globe-style framing does not perfectly align with the playable Aurelian Basin geography.

Status:
Backlog for future v10. Not a current blocker.

### 2. Do not add backend systems prematurely

Do not build accounts, database, waitlist backend, payment systems, analytics dashboards, or multiplayer infrastructure until there is a clear reason.

Current feedback collection can stay simple.

### 3. Do not drift into crypto/NFT/token language

Avoid crypto, NFT, wallet, minting, token, or pay-to-win framing unless the business/legal strategy is explicitly reopened.

### 4. Cursor is executor, not strategist

Cursor should not decide product direction.

Before using Cursor:
- define exact scope,
- define files likely affected,
- define stop condition,
- keep MAX off unless explicitly justified,
- avoid broad autonomous iterations.

### 5. Manual confusion beats screenshot approval

Screenshots and smoke tests are helpful, but if a real user reports that the core flow is unclear, that overrides screenshot-based approval.

## Current QA status

Latest accepted baseline requires:

- build passes,
- smoke test passes,
- landing → world → claim → dashboard → settlement → nation → empire path remains functional.

As of this baseline:
Smoke: PASS 9/9

## What is intentionally not solved yet

The following are known future items, not blockers:

- full world map generation,
- true 10,000-land interaction,
- account persistence,
- multiplayer ownership,
- economy,
- diplomacy,
- advanced settlement/city systems,
- real analytics,
- formal waitlist,
- production-ready feedback system,
- map v10 geographic polish.

## Recommended next strategic moves

Recommended order:

1. External demo test script
   - Prepare a short test instruction for 3–5 people.
   - Ask them to complete the demo without explanatict confusion points.

2. Founder/pitch narrative
   - Prepare a short explanation of what Pixel Nations is.
   - Use current demo as proof-of-direction.

3. Feedback intake upgrade
   - Replace personal mailto with project email or lightweight form only if feedback volume or professionalism requires it.

4. Demo polish based on real confusion
   - Do not polish randomly.
   - Polish only what testers misunderstand or what weakens the product promise.

## Current release principle

Do not add depth until the first path is clear.

Simple first. Deep later.
