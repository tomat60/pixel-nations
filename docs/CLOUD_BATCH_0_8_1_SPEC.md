# Cloud Batch 0.8.1 — Core Game Loop Spine

Status: NEXT IMPLEMENTATION BATCH SPEC
Execution mode: cloud/headless preferred
Primary executor: Cursor CLI/headless in Codespaces if authenticated; GitHub Copilot cloud agent fallback
Human touch target: one milestone review after PR/report, not micro-checkpoints

## Objective

Make Pixel Nations feel like a game after land selection/claim, not just a set of static pages.

The player should understand and feel this progression:

land → settlement → city core → trade seed → alliance/nation direction → empire promise

## Product promise to preserve

One land can become an empire.
Simple first. Deep later.
The demo shows Sector A-01 / Aurelian Basin, not the full 10,000-land world.

## Player problem to solve

After choosing or claiming land, the player needs a clear next goal and a sense that the land starts becoming a settlement/nation/empire. The current demo has pieces of the flow, but they must be connected into a clearer objective spine.

## Allowed work

- Improve dashboard as the command center after claim/selection.
- Improve settlement screen as the first meaningful progression step.
- Add a reusable objective/progression component if useful.
- Add simple state-free demo progression copy/cards/actions.
- Improve internal navigation between land, dashboard, settlement, nation, and empire pages.
- Add or update tests/QA selectors only if needed.
- Update docs/current state only as part of final report/handoff.

## Forbidden work

- No map/globe rebuild.
- No new engine.
- No backend/database/auth.
- No crypto, NFT, wallet, mint, token, withdrawal, pay-to-win.
- No large economy simulation.
- No new dependency unless the agent stops and justifies it.
- No broad visual redesign.
- No deleting historical docs.

## Preferred files

The executor should inspect current source and choose minimal affected files, likely including:

- app/dashboard/page.tsx
- app/settlement/page.tsx
- app/page.tsx only if needed for first-impression continuity
- app/components/* only for reusable UI
- app/lib/* only for shared demo constants/copy
- scripts/qa-* only if QA selectors need deterministic updates

## Quality target

A first-time player should answer at least 4/5 for:

- I know what to do after claim/selection.
- I understand settlement is the next step.
- I can see the path toward nation/empire.
- I feel the demo has a game loop, not just labels.

## Validation commands

Run in cloud environment:

npm run pn:cloud-ready
npm run build
npm run qa:smoke
npm run qa:screens
npm run qa:smoke
npm run pn:handoff
npm run pn:report

If smoke modifies temporary QA artifacts before final handoff, restore them unless the batch intentionally updates QA evidence.

## Stop conditions

Stop and report instead of continuing if:

- build fails after 2 focused repair attempts
- screenshot QA fails after 2 focused repair attempts
- the solution requires backend/auth/database/new dependency
- the task starts turning into map/globe work
- product direction becomes unclear
- batch exceeds 59 minutes for GitHub Copilot cloud agent or configured Cursor budget/time limit

## Expected result

- Branch or PR with clear title: Core Game Loop v0.8.1 — Objective Spine
- Summary of changed files
- Explanation of player-facing changes
- Validation results
- Known limitations
- Next recommended batch
- Report ZIP or CI artifact when possible
