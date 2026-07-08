<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pixel Nations — Agent Guidance

Pixel Nations is a premium black/gold strategy game landing page plus a playable MVP demo. The product sells a grand-strategy fantasy: a finite world where players own land and write history — not a crypto product, not a spreadsheet editor.

## Core fantasy

- **10,000 lands** in a 100 × 100 world — finite, player-owned territory.
- **Player progression**: claim land → found city/settlement → create nation → create empire.
- **No NPC kingdoms** — players create history; the world is empty until founders act.
- Current `/play` demo focus: Sector A-01 / Aurelian Basin, village growth, expansion, and nation founding.
- Legacy demo state may still persist in `localStorage`; do not break existing claim identity or progression compatibility unless the task explicitly scopes it.

## What agents must preserve

- **Premium strategy-game aesthetic** — black/gold, cinematic but minimal, tactical world-map feel.
- **Honest world scale** — the demo is a window into the full 10,000-land world, not the whole world.
- **Claim flow and persistence** — do not break tile selection, claim flow, village/play progression, or claimed land identity.
- **World Atlas / Play scene quality bar** — strategic surfaces should feel like the atlas came alive, not like raw data panels.

## Language and tone

**Do not use** crypto, NFT, wallet, token, mint, ETH, or Web3 framing. This is a strategy game about land, cities, nations, and empires.

Copy should be cinematic but short — kingdom map, founder record, strategic world — not marketing fluff or ledger jargon.

## Active AI Command Room

The active coordination channel is GitHub issue **#79 — AI Command Room: Fable / Claude / Cursor collaboration channel**.

This issue is not an automatic trigger by itself. It becomes active when a human, ChatGPT/control-plane, Cursor Automation, Claude, Fable, or another agent is explicitly pointed to it.

When a prompt says to use the Command Room, issue #79, or AI coordination channel, agents must:

1. Read issue #79 before coding.
2. Read `docs/PROJECT_OPERATING_RULES.md` and this `AGENTS.md`.
3. For strategy requests, respond in issue #79 with recommendation and plan before implementation.
4. For implementation requests, follow the output contract below.
5. Reference issue #79 in branch reports, PR bodies, or strategy responses.

For the current strategic direction, #79 is the source of truth over older broad plans: prioritize a playable vertical slice before polish, and do not start full backend/auth/payment/multiplayer work unless explicitly scoped.

## Control-plane safety guardrails

These rules exist because accidental write actions and premature merges create cleanup work and can hide product risk.

- If ChatGPT/control-plane, a reviewer, or the Command Room leaves a **Product Lead Gate**, **review pending**, **do not merge yet**, or equivalent blocker on a PR, that PR must not be merged until a later explicit **accepted for merge** verdict appears.
- Green CI, Vercel, smoke, or screenshot QA is not enough to override an unresolved product gate. User-reported confusion and product-evidence gaps remain blockers until directly resolved or explicitly waived by the control plane.
- Do not create placeholder issues, temporary files, dummy commits, or test write-actions in the repo. If the wrong GitHub action/tool is loaded, stop and load the correct action instead of probing with harmless-looking writes.
- Before any GitHub write action, confirm the exact action name and target in the prompt or tool call: `create_pull_request` for PRs, `create_issue` only for real issues, `update_file` only for intended file changes, and `merge_pull_request` only after explicit merge acceptance.
- If an accidental issue/file/commit is created, immediately close/remove it, report it, and do not continue with broader work until the branch or issue list is clean.

## How to work on this repo

1. **Read before coding**: `docs/PROJECT_OPERATING_RULES.md` and, for `/world`, `docs/WORLD_MAP_V7_SPEC.md`.
2. **No vague cosmetic passes** — if the task is a visual improvement, it must be a meaningful scoped change with clear acceptance criteria, not a 5% color tweak loop.
3. **Stay in scope** — do not redesign unrelated pages (landing, dashboard, settlement, nation, empire) unless the prompt explicitly requires it or routing compatibility demands it.
4. **Cost control** — avoid broad repo exploration, repeated weak iterations, unnecessary `npm run qa:screens`, and dependency installs without justification.
5. **Ask for scope only when truly blocked** — if the goal, files, and acceptance criteria are defined in the prompt or docs, execute; do not re-litigate product strategy.
6. **PR output contract** — Cursor Automation must not open PRs directly. Push the branch and comment with branch name, head SHA, validation result, and blocker/status. ChatGPT/control-plane opens the PR as ready for review through the GitHub connector.

## Cursor Automation output contract

Cursor Automation repeatedly created draft PRs even when prompted otherwise. To prevent recurring human-only cleanup work, Cursor Automation must follow this branch-only contract:

- Do **not** open pull requests.
- Do **not** create draft pull requests.
- Push the requested branch after validation passes.
- Comment on the issue with branch name, head commit SHA, validation result, changed files, and any blocker.
- Do **not** merge.
- ChatGPT/control-plane is responsible for opening the PR as ready for review, reviewing CI/diff, and merging when accepted.

## PR output contract for non-Cursor agents

All non-Cursor coding agents must follow this output contract:

- Open PRs against `main` as **ready for review** by default.
- Do **not** create draft PRs unless the issue explicitly says `draft: true` or asks for a draft.
- Do **not** merge your own PR.
- Keep PR titles short and conventional, for example `feat: add minimal game state engine`.
- Keep PR descriptions concrete: summary, changed files, validation, known debt.
- If validation passes but a ready PR cannot be opened, do **not** open a draft PR. Push the branch, then comment on the issue with the branch name, head commit SHA, validation result, and the blocker. ChatGPT/control-plane will open or merge the PR from that branch.
- Do not commit `public/qa/latest/*` artifacts unless the issue explicitly requires public QA evidence updates.

## Key files (reference)

| Area | Path |
|------|------|
| Current playable demo | `app/play/**` |
| Play state | `app/play/lib/**` |
| Play scenes | `app/play/components/**`, `app/play/world/**` |
| Legacy world map | `app/world/page.tsx` |
| Claimed land helpers | `app/lib/claimed-land.ts` |
| Legacy demo state | `app/lib/settlement-state.ts` |
| Operating rules | `docs/PROJECT_OPERATING_RULES.md` |
| World map spec | `docs/WORLD_MAP_V7_SPEC.md` |
| AI cost controls | `docs/AI_COST_CONTROL_CODEX.md` |

## Reporting

Keep final reports short and concrete: changed files, what changed, build status, QA status (if run), commit hash (if committed).
