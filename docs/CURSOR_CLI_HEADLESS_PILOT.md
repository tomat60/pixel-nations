# Cursor CLI Headless Pilot (Pixel Nations)

## Purpose

Cursor CLI headless is an execution lane for small, low-risk work in Pixel Nations. It is used to apply clearly scoped changes quickly, then hand results back to ChatGPT for review and next-step strategy.

## Initial Allowed Task Types

Use headless only for:

- docs-only updates
- QA/reporting helpers
- tiny copy fixes
- small mechanical bugfixes after ChatGPT approval

## Initial Forbidden Task Types

Do not use headless for:

- broad UI redesign
- map redesign
- backend/auth/payments work
- economy/combat/diplomacy systems
- long autonomous agent runs
- force/yolo/continue-without-approval workflows

## Safe Command Pattern

Use this operating pattern for the pilot:

1. Work on one branch.
2. Run one prompt.
3. Start with a low/fast model first.
4. Do not use force/yolo flags.
5. Run `npm run pn:handoff`.
6. Stop for ChatGPT review before any further iteration.

## Cost-Control Warnings

- Cursor CLI usage still consumes Cursor model usage.
- On-Demand usage can spend real money.
- Stop conditions are mandatory to prevent drift and repeated low-value runs.

## Current Decision

Cursor CLI is experimental in Pixel Nations and may be used only for low-risk tasks until it proves reliable.
