# Pixel Nations — Core Engine v0.3 Strategy Brief

Status: STRATEGY / IMPLEMENTATION BRIEF
Date: 2026-06-19
Cursor: BLOCKED until this brief is reviewed
MAX: OFF by default
Cost risk: zero for this brief

## Executive Decision

Pixel Nations has passed the internal Virtual QA gate for the current public demo foundation.

The next best product move is not another visual polish sprint and not human testing.

The next best move is to define the first real gameplay engine layer:

# Core Engine v0.3

This means the game must begin moving from a guided demo spine toward a repeatable system where choices create measurable, persistent consequences.

## Current Demo Foundation

Current accepted spine:

land → settlement/city → trade route → alliance → nation → empire

Current strengths:

- strong first fantasy
- clear premium visual identity
- mobile map framing stabilized
- QA governance improved
- Virtual QA protocol locked
- public evidence system improved
- no human testers needed yet

Current limitation:

The demo is still mostly a guided narrative progression. It is not yet a durable game engine.

## Product Goal

Make the player feel:

> My land is no longer just claimed. It is starting to produce, grow, depend on choices, and become strategically different from other lands.

## Design Principle

Do not build a complex grand-strategy simulator yet.

Build one small systemic engine that can later support:

- city growth
- trade routes
- alliances
- nations
- empires
- conflict
- economy
- population
- diplomacy
- future multiplayer

## Core Engine v0.3 Scope

Core Engine v0.3 should introduce a small deterministic local simulation.

It should not require backend, accounts, multiplayer, AI opponents, or payments.

### Required Concepts

Each claimed land / settlement should have a small state model:

- population
- food
- materials
- influence
- security
- prosperity
- unrest or stability
- growth per turn / cycle

The exact naming can be adjusted, but the model should remain simple.

### Required Player Actions

Give the player one recurring decision type:

- Develop Settlement
- Expand Trade
- Fortify Land
- Invest in Governance

Each action should have:

- cost
- benefit
- visible consequence
- one tradeoff

### Required Loop

The first loop should be:

1. View settlement state.
2. Choose one development action.
3. Apply result.
4. See numbers/story change.
5. Unlock or strengthen next path.

This can remain localStorage-based for now.

## What Not To Build Yet

Do not build:

- backend persistence
- real-time timers
- multiplayer
- map-wide economy
- AI nations
- combat
- token/crypto/wallet systems
- paid land sales
- complex resources
- dozens of buildings
- tech tree

## Suggested First System

Use a simple “development cycle” model.

Example:

Settlement starts:

- Population: 24
- Food: 18
- Materials: 12
- Influence: 4
- Security: 5
- Prosperity: 3
- Stability: 7

Actions:

### Build Farms

Cost: Materials -2  
Effect: Food +6, Population growth +1  
Tradeoff: Security -1 if frontier is unprotected

### Raise Watch

Cost: Food -2, Influence -1  
Effect: Security +3, Stability +1  
Tradeoff: Prosperity growth slower

### Open Market

Cost: Materials -3  
Effect: Prosperity +3, Influence +1  
Tradeoff: Stability -1 if trade grows too fast

### Civic Assembly

Cost: Influence -2  
Effect: Stability +3, Population loyalty +1  
Tradeoff: Materials production slower this cycle

## Acceptance Criteria

A successful Core Engine v0.3 implementation must:

- add visible changing numbers
- preserve the existing guided path
- not break current smoke path
- create a reason to revisit dashboard/settlement
- make at least one player choice feel meaningfully different
- remain understandable on mobile
- avoid overwhelming the player

## Virtual QA Gate

Before accepting Core Engine v0.3, the Virtual QA Team must check:

- First-Time Player Proxy: understands what changed and what to do
- Confused User Proxy: does not think numbers are random
- Game Flow Tester: land → settlement → nation → empire still works
- Mobile QA: no clipping or unusable controls
- Product QA: loop strengthens “one land can become an empire”
- Cost-Control Lead: implementation did not become a giant simulator

## Implementation Strategy

Do not ask Cursor to invent the system.

Before Cursor implementation:

1. Lock this strategy brief.
2. Inspect current state files/components.
3. Create a scoped implementation prompt.
4. Limit files.
5. Require build/smoke/handoff.
6. Require one review bundle if UI changes are visible.

## Recommended Next Sprint

After this brief is committed, prepare:

# Core Engine v0.3 Implementation Prompt

Expected implementation scope:

- local simulation state helpers
- settlement dashboard action panel
- visible development cycle result
- no backend
- no major redesign
- preserve all existing demo path

## Stop Condition

This brief is complete when it is committed to main and the next Cursor implementation prompt can be created from it without additional strategic invention.

