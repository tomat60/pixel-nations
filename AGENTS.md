<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pixel Nations — Agent Guidance

Pixel Nations is a strategy game about a finite player-created world, not a crypto product and not a dashboard product.

## Mandatory authority gate

Before planning or coding:

1. Run `npm run pn:status`.
2. Read `docs/PROJECT_CURRENT_STATE.md`.
3. Read the accepted ADR relevant to the task.
4. Read this file.
5. Read the active execution issue named in current state.
6. Read only the operating/QA documents needed for the scoped task.

Authority order:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs
3. this `AGENTS.md`
4. active execution issue named in current state
5. exact-head evidence and merged PR for the current milestone
6. operating/QA protocols
7. older issues, Command Room comments, sprint briefs, runbooks, reports, and generated handoffs

Do not treat issue #79, an arbitrary open issue, a draft PR, or `public/qa/latest` as current authority unless `PROJECT_CURRENT_STATE.md` explicitly points to it.

## Product truths

- Core fantasy: **one land can become an empire**.
- Full world: 100 × 100 lands / 10,000 total.
- Current region: Sector A-01 / Aurelian Basin.
- No NPC kingdoms as the default world premise; players create history.
- Avoid crypto, NFT, wallet, mint, token, ETH, Web3, payment, or pay-to-win framing unless a future explicit decision reopens it.
- Preserve existing player identity, persistence, progression semantics, and rollback capability unless the active issue explicitly scopes a migration.

## Current runtime direction

- Godot is the target game runtime under accepted ADR-001.
- Next.js `/play` is currently a functioning bridge, demo shell, and rollback surface.
- Accepted Aurelian/Godot-derived stages may be hosted in `/play` while behavior and QA remain stable.
- Do not restart broad React/SVG scene-engine development as the final visual direction.
- Do not infer that all `/play` screens are visually accepted. Current state defines the exact acceptance boundary.

## Current product baseline

Read the exact milestone and active issue from `PROJECT_CURRENT_STATE.md`.

At Authority Reset v0.1:

- PR #335 integrated `camp → first shelter → developed settlement` into the real `/play` flow.
- Aurelian M2 integration is accepted.
- Current Village composition is `TEMPORARY_ACCEPTED`, not production-final.
- Non-Village screens remain visually unapproved.
- Active work is research and the binding Aurelian Composition V2 brief in issue #338.
- Visual implementation remains blocked until that brief is accepted.

These bullets are a convenience summary. `PROJECT_CURRENT_STATE.md` remains authoritative when they age.

## Control-plane safety guardrails

- Never write directly to `main` for risky or multi-file work.
- Use a branch and PR unless the active issue explicitly authorizes another safe path.
- Do not merge while a Product Lead Gate, review pending, owner rejection, missing evidence, or `do not merge` instruction remains unresolved.
- Green CI, smoke, Vercel, screenshots, or a clean branch do not override a product or visual gate.
- Do not create placeholder issues, dummy commits, temporary repo files, or harmless-looking write probes.
- Confirm the exact action and target before every GitHub write.
- If an accidental write occurs, repair it immediately and stop broader work until state is clean.
- Do not modify `public/qa/latest/*` unless the active task explicitly requires regenerated public QA evidence.

## Fable protocol

Do not rely on historical title phrases or labels as universal trigger rules.

A Fable run is operationally valid only when:

1. the active issue contains the current workflow contract and required output section;
2. the bot confirms the run started;
3. exact evidence paths and immutable refs pass preflight;
4. the final comment/result reports `VALIDATED_FABLE_OUTPUT` or another explicitly accepted terminal result;
5. ChatGPT/control-plane accepts, rejects, or narrows the result for the next phase.

`PREFLIGHT_FAILURE`, `NO_ARTIFACT`, a silent issue, or a started workflow without a terminal result is not usable advice.

For visual/gamefeel review:

- provide exact evidence identity, filenames, ref/SHA, viewport/state, and whether video/manual interaction exists;
- distinguish screenshot observations from motion/gamefeel conclusions;
- do not let Fable claim access to evidence it did not receive;
- do not let outputs reopen legacy routes or rejected visual techniques without current authorization;
- preserve current-state scope and acceptance boundaries.

## How to work on this repository

- No vague cosmetic passes.
- Preserve behavior and QA semantics, not weak historical composition.
- Stay inside the active issue's allowed scope.
- Prefer deterministic inspection and evidence before paid or broad execution.
- Avoid new dependencies and asset families unless explicitly justified.
- Stop when the same technique fails repeatedly; change strategy instead of micro-polishing forever.
- Do not broaden into backend, accounts, payments, multiplayer, combat, full economy, World/Nation/Empire, or unrelated surfaces unless the active issue explicitly authorizes it.
- Every implementation contract needs allowed files/categories, forbidden actions, validation, cost mode, evidence, failure recovery, and a stop condition.

## Cursor Automation output contract

Cursor Automation must:

- not open or merge pull requests unless the active issue explicitly overrides this rule;
- push the requested branch after validation;
- comment with branch, head SHA, changed files, validation, evidence, and blocker/status;
- stop rather than broaden when the contract cannot be completed safely.

ChatGPT/control-plane owns PR opening, product review, and merge acceptance unless the active issue explicitly assigns those actions elsewhere.

## Non-Cursor agent PR contract

Unless the active issue says otherwise:

- open a reviewable PR against `main`;
- default to draft for risky, visual, architecture, workflow, or multi-step recovery work;
- never merge your own PR;
- keep the PR body concrete: outcome, scope, changed files, validation, evidence, known limitations, and acceptance status;
- do not claim acceptance from implementation completion alone.

## Key paths

| Area | Path |
|---|---|
| Current project authority | `docs/PROJECT_CURRENT_STATE.md` |
| Documentation authority map | `docs/README.md` |
| Accepted runtime ADR | `docs/ADR_001_GODOT_DESKTOP_FIRST.md` |
| Current playable bridge | `app/play/**` |
| Play state | `app/play/lib/**` |
| Play scenes | `app/play/components/**`, `app/play/world/**` |
| Godot project | `game/**` |
| Operating rules | `docs/PROJECT_OPERATING_RULES.md` |
| QA governance | `docs/QA_GOVERNANCE_PROTOCOL.md` |
| Cost controls | `docs/AI_COST_CONTROL_CODEX.md` |
| Status gate | `scripts/pn-status.mjs` |

Do not use legacy route names, old state files, old screenshots, or old issue comments as planning anchors unless a current source explicitly authorizes them.

## Reporting

Final reports must state:

- exact branch and head SHA;
- changed files;
- validation and evidence actually inspected;
- acceptance classification;
- what remains unverified;
- next allowed action from current state.
