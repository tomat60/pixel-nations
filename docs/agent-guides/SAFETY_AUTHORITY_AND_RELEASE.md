# Pixel Nations — SAFETY AUTHORITY AND RELEASE

> Relocated from AGENTS.md verbatim on 2026-10-24. Canonical current-state, accepted ADRs and safety gates retain precedence.

## Mandatory authority gate

Before planning or coding:

1. Run `npm run pn:status`.
2. Read `docs/PROJECT_CURRENT_STATE.md`.
3. Read the accepted ADR relevant to the task, but check current state first for any explicitly reopened ADR decision.
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

### No-silent-stall SLA

A PR is an owned queue item until it is merged, closed, or has an explicit blocking reason with a concrete next action.

- Recheck the open PR queue at the start of every control-plane session and after every major product step.
- Within 15 minutes of opening or materially updating a PR, assign PENDING, BLOCKED, REJECTED, or READY.
- Once all relevant checks are terminal and green, the PR must be merged/closed or receive an explicit blocker within 45 minutes.
- A non-draft PR with failed checks must receive diagnosis/action within 60 minutes.
- A non-draft PR with non-terminal checks for more than 2 hours is a stall and must be investigated.
- A merge conflict unresolved for more than 30 minutes is a stall.
- Explicit waiting-owner/hold labels may pause the mechanical timer, but must include a concrete dependency or decision being awaited.
- A docs-only reconciliation PR must not block authorized product work for more than 60 minutes once its exact diff and checks are green.
- Never start a new product PR while an older active PR is READY, failing, or unreviewed.
- If an authorized next product action exists but there is no product-progress activity for 12 hours, treat that as an operational stall even when no PR is open.
- The mechanical stall guard is an alarm, not a product approver: it must never convert green CI into visual/product acceptance or auto-merge a gated product change.

The repo-level stall guard and the external steward monitor are deliberately redundant. Either one detecting a stall is sufficient to stop new work and clear the queue first.

