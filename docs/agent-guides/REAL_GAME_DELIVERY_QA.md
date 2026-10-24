# Pixel Nations — REAL GAME DELIVERY QA

> Relocated from AGENTS.md verbatim on 2026-10-24. Canonical current-state, accepted ADRs and safety gates retain precedence.

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
- Verify the intended Git ref/HEAD before authority-sensitive work. Never treat a local folder name, old worktree, cache, report, or `latest` path as proof of freshness.
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
| Incumbent runtime ADR | `docs/ADR_001_GODOT_DESKTOP_FIRST.md` — engine-selection status is controlled by current state / #731 while the gate is open |
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

## Cross-agent critical review and evidence contract (2026-10-14)

Applies to ChatGPT, Claude/Claude Code, Cursor and delegated agents. This supplements, never overrides, the project's canonical state, architecture decisions, security/privacy constraints, external-action approval gates, and cost limits.

1. Optimize for accuracy and working user-facing outcomes, not agreement, reassurance or contrarianism. Challenge flawed or risky assumptions with a specific reason, better alternative and tradeoff; do not invent objections when evidence supports an idea.
2. On consequential claims, distinguish **verified** (current source, exact artifact/run/link), **reasoned inference** and **unknown/not checked**. Model confidence labels and repeated agent agreement are not evidence. Research current claims at authoritative sources.
3. State blockers and negative results prominently. If challenged without new evidence, recheck reasoning rather than reflexively reverse or defensively repeat an answer.
4. Keep statuses distinct: **proposed**, **branch change**, **merged**, **tests passed**, **deployed**, **visually reviewed**, **owner-approved**, **user-visible verified**. A commit, generated artifact, green CI or agent statement does not by itself establish product completion.
5. For delivery, inspect relevant runtime/UI, output artifact, representative inputs, failures, visual QA and deployment evidence where tools allow. Report exact evidence, remaining uncertainty and the next safe action; never claim unattended/background work without an actual scheduled or running process.
6. Prefer the smallest falsifiable change that improves the active product bottleneck. Do not generate additional strategies, reports, orchestration or paid experiments instead of shipping and verifying real outcomes.
7. Retain every repository-specific consent, financial, safety, privacy, release, recovery and authority rule. This section does not authorize external actions or weaken existing gates.
