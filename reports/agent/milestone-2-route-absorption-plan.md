# Milestone 2 Route Absorption Plan

Issue: #61
Branch: `agent/milestone-2-route-absorption-plan`

## Product decision

Milestone 1 is complete: `/play` is merged and deployed as the fullscreen map-game foundation. The next product risk is route confusion: the landing page still routes users through `/world`, `/dashboard`, `/settlement`, `/nation`, and `/empire`, while the accepted game surface is now `/play`.

Milestone 2 should make `/play` the canonical public demo entry without deleting legacy pages yet.

## Smallest implementation PR

1. Route every primary start/continue CTA on `app/page.tsx` to `/play`.
2. Keep legacy pages accessible as fallback/debug routes, but stop presenting them as primary progression.
3. Update landing copy so the demo promise is: claim one land, choose one order, see the same map change.
4. Add or update smoke coverage so `/play` is asserted as the canonical demo surface.
5. Produce fresh Play Visual QA evidence for first viewport and post-claim state.

## Explicit non-goals

- No backend.
- No multiplayer.
- No combat.
- No city-builder grid.
- No crypto, wallet, token, payment, or monetization scope.
- No deletion of legacy routes in this PR.
- No expansion into seasons/economy simulation beyond what already exists in `/play`.

## Acceptance criteria

- Root hero CTA routes to `/play`.
- Root secondary demo CTA routes to `/play` or is clearly labeled as a legacy/world preview if retained.
- Progress-based continue logic no longer sends users to `/dashboard`, `/settlement`, `/nation`, or `/empire` as the main path.
- `/play` remains the only canonical first-minute playable route.
- CI passes.
- Play Visual QA passes or any failure is clearly external/quota-only.

## Current blocker found

`app/page.tsx` still contains primary routing to legacy surfaces:

- `handleStartDemo()` sends existing progress to `/empire`, `/nation`, `/settlement`, `/dashboard`, and fresh users to `/world`.
- Header and hero buttons still call `router.push("/world")`.

This is safe to fix in the next implementation commit/PR. The change is route/copy/test only and does not require gameplay-system expansion.
