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
5. Read `docs/GAME_STRATEGY_MASTER_PLAN.md` when choosing or changing product direction.
6. Read the active execution issue named in current state.
7. Read only the operating/QA documents needed for the scoped task.

If `npm run pn:status` reports `AUTHORITY_STATUS=FAIL` or `BLOCKED_STALE_PROJECT_STATE`, stop product work and repair the authority chain first. Do not work around the gate by trusting prose that says `ACTIVE`.

Authority order:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs
3. this `AGENTS.md`
4. `docs/GAME_STRATEGY_MASTER_PLAN.md` for durable whole-product direction and sequencing
5. active execution issue named in current state
6. exact-head evidence and merged PR for the current milestone
7. operating/QA protocols
8. older issues, Command Room comments, sprint briefs, runbooks, reports, and generated handoffs

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

## Current milestone rule

Do not duplicate a milestone snapshot in this file. Read the exact milestone, active issue, active PR, acceptance boundary and next allowed action from `docs/PROJECT_CURRENT_STATE.md` on the current checkout.

When the milestone changes, update `PROJECT_CURRENT_STATE.md`; do not add another convenience summary here. Historical PR or issue references in this file are examples only unless current state explicitly reactivates them.

## Mandatory whole-product portfolio gate

The steward/control-plane must not mechanically infer the next feature from the previous state transition.

Before authorizing a new product milestone when a portfolio trigger applies, perform a lightweight whole-product check against the durable strategy and current evidence.

The check must answer:

1. What is the biggest current bottleneck across world/progression, gameplay/fun, UX/clarity, visuals/gamefeel, strategic depth, technical reliability and demo/business value?
2. What player-visible delta will the proposed sprint create?
3. Why is it better now than the strongest alternatives?
4. What are we deliberately not building?
5. What exact evidence accepts, rejects or stops the sprint?

Mandatory triggers:

- any terminal product `REJECT`;
- a major phase boundary;
- repeated milestones in the same subsystem while another product dimension lags;
- direct user feedback that pace, clarity, gameplay or visual progress is wrong;
- logic/state complexity growing materially faster than visible product value.

At high-leverage phase/system decisions, research relevant production practice, comparable games/workflows and current repo evidence before choosing direction.

The portfolio gate must not become bureaucracy. It can be recorded directly in `PROJECT_CURRENT_STATE.md` or the active issue and does not require a separate PR unless authority actually changes.

Prefer one meaningful reviewable sprint that materially advances the whole product over serial micro-state milestones. If the largest bottleneck is world/progression or visual readability, block deeper mechanics until that bottleneck is addressed.

## Control-plane safety guardrails

- Never write directly to `main` for risky or multi-file work.
- Use a branch and PR unless the active issue explicitly authorizes another safe path.
- Do not merge while a Product Lead Gate, review pending, owner rejection, missing evidence, or `do not merge` instruction remains unresolved.
- Green CI, smoke, Vercel, screenshots, or a clean branch do not override a product or visual gate.
- Do not create placeholder issues, dummy commits, temporary repo files, or harmless-looking write probes.
- Confirm the exact action and target before every GitHub write.
- If an accidental write occurs, repair it immediately and stop broader work until state is clean.
- Do not modify `public/qa/latest/*` unless the active task explicitly requires regenerated public QA evidence.

## Mandatory PR and post-release ownership gate

The user is not responsible for finding stuck PRs, failed checks, stale evidence, or broken releases. ChatGPT/control-plane owns this continuously.

For every newly opened, synchronized, reopened, or ready-for-review PR:

1. Re-fetch the live head and base SHA; invalidate all evidence from older heads.
2. Check current-state authorization, base drift, mergeability, the complete diff, changed files, dependencies, workflow permissions, secret exposure, and unexpected scope.
3. Inspect every required check. For any failure, fetch the exact job, failed step, and log; classify product, test, infrastructure, or external-provider failure.
4. Prefer the smallest root-cause fix. Never blind-rerun an unchanged deterministic failure.
5. Directly inspect required JSON, screenshots, video, and other artifacts. Their existence or a green upload step is not acceptance.
6. Assign one explicit status: `PENDING`, `BLOCKED`, `REJECTED`, or `READY`. Do not start another product PR while the active one is failing or unreviewed.

After every merge:

1. Confirm the accepted PR head, merge commit, and resulting `main` SHA.
2. Check `main` workflows/combined status and the deployment tied to that SHA.
3. Smoke the real public `/`, `/play`, and `/world` routes as applicable; a localhost RC1 or pre-merge preview is not production evidence.
4. If the public origin cannot be reached because of proxy, DNS, authentication, or environment limits, report `PRODUCTION UNVERIFIED` and the missing evidence. Never infer either healthy or down.
5. Do not begin another product merge until the previous release has `PASS` or a documented verification blocker.

The active Pixel Nations steward enforces this gate on every run. GitHub event-driven checks provide the immediate mechanical layer; the steward diagnoses and acts on their result without waiting for the user to notice it.

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
| Whole-game strategy | `docs/GAME_STRATEGY_MASTER_PLAN.md` |
| Documentation authority map | `docs/README.md` |
| Accepted runtime ADR | `docs/ADR_001_GODOT_DESKTOP_FIRST.md` |
| Current playable bridge | `app/play/**` |
| Play state | `app/play/lib/**` |
| Play scenes | `app/play/components/**`, `app/play/world/**` |
| Godot project | `game/**` |
| Project operating system | `docs/PROJECT_OPERATING_SYSTEM.md` |
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
