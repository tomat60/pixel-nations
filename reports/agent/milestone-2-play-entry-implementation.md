# Milestone 2 Play Entry Implementation

Issue: #61
Branch: `agent/milestone-2-play-entry`

## Current verified baseline

- `main` head: `0690443d6805dfd27f0024ddbb08860ca596566b`
- Main Vercel status: success
- No `agent/*` branch was active before this branch was opened.
- Fable #53 is healthy: run finished with success and artifact `fable-pixel-audit-full_play_redesign` is present and not expired.

## Active blocker

`app/page.tsx` still treats legacy routes as the primary public demo path:

- `handleStartDemo()` sends players to `/empire`, `/nation`, `/settlement`, `/dashboard`, or `/world` depending on old local progress.
- Header `World Map`, hero `Preview Sector A-01`, and world-preview `Enter Sector A-01` still route to `/world`.
- Landing copy still promises a route-separated settlement/nation/empire demo instead of the accepted fullscreen `/play` shell.

This keeps the product in a confusing state after Milestone 1: `/play` is the accepted game baseline, but `/` still advertises and routes like the old multi-page prototype.

## Implementation target for this PR

Change only the public entry path and validation surface:

1. Route primary start/continue actions to `/play`.
2. Stop sending progress-based continue logic to `/dashboard`, `/settlement`, `/nation`, `/empire`, or `/world` as the main path.
3. Keep legacy routes accessible as debug/fallback pages for now.
4. Update landing copy to promise the current map-first loop: claim one land, choose one order, see map/HUD consequence in the same shell.
5. Add or update smoke coverage so the landing CTA proves `/play` is canonical.

## Hard non-goals

- No backend.
- No multiplayer.
- No combat.
- No city-builder grid.
- No crypto, wallet, token, payment, or monetization scope.
- No deletion of legacy routes.
- No expansion into season/economy simulation beyond current `/play` behavior.

## Validation gate

Before merge:

- CI passes.
- Play Visual QA passes.
- Vercel preview is Ready, or any failure is confirmed external/quota-only.
- QA evidence includes root entry and `/play` post-claim state.

## Current status

Branch opened as a bounded implementation branch. The next commit should update `app/page.tsx` and the relevant smoke/QA assertion only.
