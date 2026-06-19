# Pixel Nations — Visual Gamefeel Engine v0.4 Strategy Brief

Status: PRE-IMPLEMENTATION STRATEGY BRIEF
Date: 2026-06-19
Owner: ChatGPT as Product Lead / Creative Director / Game Director

## Executive Decision

The next product move is not more infrastructure and not another gameplay-system expansion.

The next product move is:

# Visual Gamefeel Engine v0.4

Core Engine v0.3 proved that the first local settlement development loop works. Now Pixel Nations needs to make the player feel that the land is alive.

This sprint should improve the visual and emotional presentation of actions, resources, settlement state, and consequences without turning into a full redesign, full city-builder, or expensive art-production sprint.

## Why Now

- Core Engine v0.3 is merged.
- Game Vision Master Plan is locked.
- AI Ops local and remote reporting are working.
- Manual player check confirmed the development loop works and feels like a good direction.
- User and friend feedback both point to the same issue: the game lacks enough graphics, visual encouragement, animation, and living-world feeling.

The product now has a functional spine, but the presentation still feels too card/text/stat based.

## Strategic Goal

Convert settlement development from “numbers in cards” into the first visible living-system layer.

The player should click an action and immediately understand:

- what changed
- why it changed
- what the land is becoming
- what kind of society they are shaping

## Product Position

Pixel Nations is not becoming a pure text game.

Pixel Nations is also not becoming a full RTS or full 3D city-builder.

The target is:

# Living Interactive Strategy Atlas

That means:

- decisions happen in clean strategy panels
- consequences are visible through visual feedback
- map/settlement elements gradually become more alive
- movement and animation are symbolic, not heavy simulation

## v0.4 Scope

Focus on the settlement development / Core Engine area.

Improve:

1. Action cards
2. Resource/stat changes
3. Consequence feedback
4. Settlement identity visualization
5. Mobile readability
6. Visual “life” without heavy assets

## Required Experience

When the player enters settlement development, they should see:

- current settlement state
- resource/stat indicators with small visual icons
- four development actions with stronger visual identity:
  - Build Farms
  - Raise Watch
  - Open Market
  - Civic Assembly
- clear cost/effect preview
- visible result after click
- subtle animation/pulse/change indicator
- latest consequence explained clearly
- enough graphic shape/color/iconography to feel like a game, not a spreadsheet

## Recommended Visual Treatment

Use lightweight production-safe visuals:

- CSS-driven icon badges
- inline SVG or existing icon primitives if already available
- simple illustrated action marks
- stat delta chips
- glowing/pulsing result panel
- settlement status meter cards
- tiny route/resource/city symbols
- no external art dependency required
- no generated image assets required for v0.4

The goal is not final art. The goal is “good enough gamefeel” using a consistent design system.

## Suggested Visual Language

### Build Farms
Fields, food, growth, population, green/gold prosperity.

### Raise Watch
Watchtower, shield, security, discipline, frontier caution.

### Open Market
Trade stalls, coin/resource exchange, route opening, prosperity and instability tradeoff.

### Civic Assembly
Hall/banner/circle, people gathering, order/stability, civic identity.

## Animation Rule

Use subtle motion only.

Allowed:

- value pulse on changed stats
- consequence panel entrance
- action card selected state
- small resource delta float
- highlight ring around affected settlement visual
- 150–400ms transitions

Blocked:

- heavy animation system
- canvas/game engine rewrite
- animated crowds
- map-wide movements
- performance-heavy effects
- distracting decorative motion

## Mobile Rule

Mobile must be first-class.

The settlement development area must be readable on mobile:

- no tiny tables
- action cards must stack cleanly
- consequence text must not disappear below fold without obvious flow
- stat changes must be visible after action
- no horizontal overflow
- no hidden critical controls

## What This Sprint Must Not Do

Do not add:

- backend
- accounts
- multiplayer
- real timers
- full map movement
- combat
- AI nations
- new economy model
- new resources beyond existing Core Engine state
- full asset pipeline
- full redesign of landing/map/world
- large dependency unless absolutely necessary
- generated image assets
- Cursor MAX by default

## Technical Preference

Prefer:

- existing React/Next patterns
- localStorage state already used by Core Engine
- existing CSS/Tailwind/styling approach
- reusable small UI components
- deterministic action feedback
- no new backend
- no complex animation library unless already present

## Recommended Components

Potential components:

- `SettlementDevelopmentPanel`
- `DevelopmentActionCard`
- `SettlementStatGrid`
- `StatDeltaBadge`
- `ConsequenceBanner`
- `SettlementVitalityPreview`

Exact names should follow current codebase conventions. Cursor must inspect existing files before deciding names.

## Acceptance Criteria

Accepted only if:

- build passes
- smoke passes
- QA evidence is FRESH
- settlement development still works
- at least one action visibly changes state
- player can see which stats changed
- consequence feedback is clear
- action cards feel more graphic and game-like
- mobile settlement screenshot shows the development UI clearly
- no regression to land → settlement → nation → empire path
- no major scope expansion

## Screenshot Evidence Required

Review evidence must include:

- desktop settlement before action
- desktop settlement after action
- mobile settlement before or after action
- mobile world path still functional
- QA report/manifest/handoff

Do not accept the sprint if screenshots do not show the actual new UI.

## Cursor Recommendation

Use Cursor only after this brief is committed.

Recommended Cursor settings:

- Model: GPT-5.5 Medium
- MAX: OFF
- Scope: one implementation sprint
- Cost risk: low/medium, controlled
- Stop condition: branch clean, build PASS, smoke PASS, evidence FRESH, review bundle uploaded

## Expected Outcome

After v0.4, Pixel Nations should still be simple, but the player should start to feel:

> My settlement is alive.
> My choice changed something.
> This could become a real game.

## Stop Condition

This strategy brief is complete when:

- committed to main
- handoff clean
- next action is a scoped Cursor prompt for Visual Gamefeel Engine v0.4
- no implementation begins before this brief is accepted

