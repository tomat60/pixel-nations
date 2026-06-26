<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pixel Nations — Agent Guidance

Pixel Nations is a premium black/gold strategy game landing page plus a playable MVP demo. The product sells a grand-strategy fantasy: a finite world where players own land and write history — not a crypto product, not a spreadsheet editor.

## Core fantasy

- **10,000 lands** in a 100 × 100 world — finite, player-owned territory.
- **Player progression**: claim land → found city → create nation → create empire.
- **No NPC kingdoms** — players create history; the world is empty until founders act.
- **Demo state** persists in `localStorage` via `app/lib/settlement-state.ts`; claimed land identity must stay consistent across `/world`, `/dashboard`, and downstream demo pages.

## What agents must preserve

- **Premium strategy-game aesthetic** — black/gold, cinematic but minimal, tactical world-map feel.
- **Honest world scale** — the playable sector (Sector A-01, 216 visible lands) is a window into the full 10,000-land world, not the whole world.
- **Claim flow and persistence** — do not break tile selection, claim modal, mobile claim tray, or dashboard land identity.
- **World Atlas** — treat it as the visual benchmark; playable sector should feel like the atlas came alive.

## Language and tone

**Do not use** crypto, NFT, wallet, token, mint, ETH, or Web3 framing. This is a strategy game about land, cities, nations, and empires.

Copy should be cinematic but short — kingdom map, founder record, strategic world — not marketing fluff or ledger jargon.

## How to work on this repo

1. **Read before coding**: `docs/PROJECT_OPERATING_RULES.md` and, for `/world`, `docs/WORLD_MAP_V7_SPEC.md`.
2. **No vague cosmetic passes** — if the task is a visual improvement, it must be a meaningful scoped change with clear acceptance criteria, not a 5% color tweak loop.
3. **Stay in scope** — do not redesign unrelated pages (landing, dashboard, settlement, nation, empire) unless the prompt explicitly requires it or routing compatibility demands it.
4. **Cost control** — avoid broad repo exploration, repeated weak iterations, unnecessary `npm run qa:screens`, and dependency installs without justification.
5. **Ask for scope only when truly blocked** — if the goal, files, and acceptance criteria are defined in the prompt or docs, execute; do not re-litigate product strategy.
6. **PR output contract** — when a sprint asks for a pull request, open the PR as ready for review, not as a draft. Do not leave human-only finalization work unless the prompt explicitly asks for a draft. Use a clean title matching the commit, include validation results, and do not merge.

## PR output contract

All coding agents, including Cursor Automation, must follow this output contract:

- Open PRs against `main` as **ready for review** by default.
- Do **not** create draft PRs unless the issue explicitly says `draft: true` or asks for a draft.
- Do **not** merge your own PR.
- Keep PR titles short and conventional, for example `feat: add minimal game state engine`.
- Keep PR descriptions concrete: summary, changed files, validation, known debt.
- If validation passes but you cannot open a ready PR, comment on the issue with the blocker instead of opening a draft PR.
- Do not commit `public/qa/latest/*` artifacts unless the issue explicitly requires public QA evidence updates.

## Key files (reference)

| Area | Path |
|------|------|
| World map | `app/world/page.tsx` |
| Claimed land helpers | `app/lib/claimed-land.ts` |
| Demo state | `app/lib/settlement-state.ts` |
| Operating rules | `docs/PROJECT_OPERATING_RULES.md` |
| World map spec | `docs/WORLD_MAP_V7_SPEC.md` |

## Reporting

Keep final reports short and concrete: changed files, what changed, build status, QA status (if run), commit hash (if committed).
