# Pixel Nations Current State

Status: ACTIVE
Updated: 2026-08-04
Current state revision: Authority Reset v0.1
Authority baseline SHA: 2d7e3bf180404fffc7725386a97ddbabc446177f
Product baseline SHA: 4c52c7903a8ee8117f4582016ed72e7ced85798c
Current milestone: Aurelian Integration M2
Active execution issue: #338
Next allowed action: Complete the bounded research and binding Aurelian Composition V2 art brief in issue #338. Do not start visual coding before that brief is accepted.

## Purpose

This file is the first and highest-priority source of current project state for every assistant, agent, and new session.

It must stay short, current, and operational. Historical sprint summaries belong in their original issues, PRs, ADRs, and archived strategy documents — not appended here.

## Current product truth

Pixel Nations is a strategy game built around:

`one land → settlement / city → nation → empire`

The full world contains 10,000 lands in a 100 × 100 structure. The current playable/demo area is Sector A-01 / Aurelian Basin.

The real `/play` product path currently proves:

`camp → first shelter → developed settlement`

This sequence is integrated on `main` through PR #335 and product baseline commit `4c52c7903a8ee8117f4582016ed72e7ced85798c`.

## Current acceptance status

- Aurelian M2 gameplay/state integration: `ACCEPTED`.
- Current Aurelian Village composition: `TEMPORARY_ACCEPTED`.
- Production-final Aurelian composition: `NOT YET ACCEPTED`.
- Non-Village product screens: `NOT VISUALLY APPROVED`.
- Current Next.js `/play` route: functioning product bridge, demo shell, and rollback surface.
- Godot: strategic target runtime under accepted ADR-001.
- React/SVG scene rebuilding as the final art direction: `BLOCKED`.
- Backend, accounts, payments, crypto/NFT/wallet/token, multiplayer, combat, and full economy: `OUT OF CURRENT SCOPE`.

## Runtime interpretation

ADR-001 remains binding: Godot is the target game runtime.

The current Next.js `/play` implementation may host accepted Aurelian/Godot-derived stages as a bounded bridge while it preserves working gameplay, persistence, QA, public demonstration, and rollback capability.

This bridge does not reopen broad React/SVG scene-engine development. Product behavior may be preserved in the web shell while art/runtime work moves toward the accepted Godot direction.

## Current active phase

Issue #336 completed the exact-evidence Fable review.

Accepted review evidence:

- Fable run: `30935135352`
- artifact: `8902846660`
- digest: `sha256:6fa8fca3697be9b766abae7ec8bfdba56d1e5e5365cc6be2a17c619c5cb1ebd5`
- evidence ref: `4c52c7903a8ee8117f4582016ed72e7ced85798c`
- result: `VALIDATED_FABLE_OUTPUT`

Binding findings:

- keep M2 merged as the gameplay/integration foundation;
- improve desktop bridge bank landings, crossing angle, abutments/ramps, and approach road;
- reorganize the developed settlement around one focal core, compact home cluster, complete path network, integrated landmark, and stronger silhouette hierarchy;
- do not infer visual approval for World, Nation, Empire, Council, or other non-Village screens.

Execution has moved to issue #338:

`Aurelian Composition V2: research and binding art brief`

No visual implementation branch should begin until #338 produces one accepted, executable brief.

## Source-of-truth precedence

When documents or issues conflict, use this order:

1. `docs/PROJECT_CURRENT_STATE.md`
2. accepted ADRs, especially `docs/ADR_001_GODOT_DESKTOP_FIRST.md`
3. root `AGENTS.md`
4. the active execution issue named in this file
5. exact-head evidence and the merged PR for the current milestone
6. operating and QA protocols
7. older open issues, Command Room comments, sprint briefs, runbooks, and historical documents

Issue #79 is historical coordination context. It is not the current execution authority unless this file explicitly reactivates it.

An open issue, draft PR, generated handoff, or green CI run is not automatically current authority.

## Current evidence rules

Use exact-head evidence attached to the current milestone or active issue.

`public/qa/latest/*` is not authoritative merely because its path contains `latest`. It may be used only when its generated date and referenced commit are current for the milestone being reviewed.

Technical PASS does not equal visual acceptance. Visual work requires direct evidence review and an explicit verdict.

## Allowed work now

- bounded research for #338;
- art-direction decisions and the binding Composition V2 brief;
- read-only audits;
- authority/documentation fixes that do not change product behavior;
- deterministic QA and evidence inspection;
- a later narrow Composition V2 art-target branch only after #338 is accepted.

## Blocked work now

- visual coding before #338 is accepted;
- broad product redesign;
- new asset family, image generation, or paid assets without a new explicit decision;
- React/SVG fallback as final Village direction;
- gameplay, reducer, persistence, routing, backend, account, payment, multiplayer, combat, or economy expansion;
- World/Nation/Empire implementation during the current Aurelian composition phase;
- merging from green CI alone without the required product/visual gate.

## Session start gate

Before meaningful work:

1. Run `npm run pn:status`.
2. Read this file.
3. Read the accepted ADR relevant to the task.
4. Read `AGENTS.md`.
5. Read the active execution issue named above.
6. Confirm allowed files, forbidden actions, validation, cost mode, and stop condition.
7. Treat any older material that conflicts with this chain as historical.

## Update rule

Update this file in the same PR, or in an immediate bounded follow-up, when any of these changes:

- accepted milestone;
- active execution issue;
- product baseline;
- runtime decision;
- visual acceptance classification;
- next allowed action;
- major blocker.

Do not append a new historical chapter. Replace the current fields and current sections.

## Current stop condition

The current planning phase ends when issue #338 contains one accepted and executable Aurelian Composition V2 art brief with:

- concrete bridge and settlement composition constraints;
- desktop/portrait parity rules;
- allowed and forbidden scope;
- model/tool and cost choice;
- exact evidence contract;
- binary acceptance gates;
- at most one correction cycle.
