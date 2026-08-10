# Pixel Nations — Project Operating Rules

This document is the project operating manual for humans and Cursor agents. **Best path for the project comes before speed.**

---

## Principles

1. **Best path over speed** — prefer one strong, scoped implementation over many weak iterations.
2. **Cost control matters** — API usage, build time, Playwright QA, and broad exploration are real costs.
3. **Cursor is an executor, not the product strategist** — product strategy, visual direction, and scope are defined by the human (+ ChatGPT handoff) before implementation.
4. **Avoid repeated small agent iterations** — if a pass would only change colors by ~5%, either do a meaningful scoped change or stop and clarify.

---

## Before coding

Define these **before** writing code:

| Item | Question to answer |
|------|-------------------|
| **Goal** | What user-visible or system outcome is required? |
| **Files** | Which files will change? Which are explicitly out of scope? |
| **Acceptance criteria** | How do we know it is done? (behavior, visuals, persistence, build) |
| **QA level** | Build only? Build + `qa:screens`? Docs-only (no build)? |

Do **not** start with vague exploration across the whole repo unless the prompt explicitly requests an audit.

---

## Scope discipline

- **Do not redesign unrelated sections** — e.g. a `/world` map pass must not rewrite the landing page, dashboard, or demo progression unless required for routing compatibility.
- **Do not run broad audits** unless requested.
- **Do not install dependencies** unless justified and called out in the task.
- **Prefer minimal diffs** that match existing conventions in the touched files.

---

## Build, QA, and commits

| Change type | Build (`npm run build`) | QA (`npm run qa:screens`) | Commit |
|-------------|-------------------------|---------------------------|--------|
| **Code / config** | Required before commit | Only if UI changed or explicitly requested | Only when prompt asks or build (+ QA if required) passes |
| **Docs / rules only** | Not required | Do not run | When prompt asks |

- **Do not commit** unless build passes (for code changes) or the task is docs-only.
- **Do not run expensive QA screenshots** unless UI changed or the prompt explicitly requests them.
- **Do not modify** `public/qa/latest/` screenshot assets unless QA was intentionally run for a UI change.

---

## Mandatory PR lifecycle and release gate

No pull request may be left for the user to discover as failed, stale, or unsafe. ChatGPT/control-plane owns the complete lifecycle.

### On every PR open or head change

- Re-fetch exact head/base SHA and discard older evidence.
- Verify authority/scope, base drift, mergeability, full diff, changed files, dependencies, workflow permissions, secrets, and unexpected changes.
- Inspect all required checks. A failing check requires exact job/step/log diagnosis; do not blind-rerun unchanged deterministic failures.
- Review required artifacts directly. Green CI or an uploaded screenshot bundle is not product acceptance.
- Record `PENDING / BLOCKED / REJECTED / READY`. Do not begin the next product PR while the active one is failing or unreviewed.

### After every merge

- Confirm accepted head → merge commit → resulting `main` SHA.
- Check `main` status and the deployment tied to that SHA.
- Smoke the actual public `/`, `/play`, and `/world` routes required by the change.
- Localhost RC1 and pre-merge preview are not post-release proof.
- If the public origin cannot be tested, use `PRODUCTION UNVERIFIED` with the exact missing evidence; never guess.
- Block the next product merge until the release is `PASS` or has an explicit verification blocker.

GitHub workflows are the immediate event-driven layer. The active Pixel Nations steward is the owner layer: it reads failures, diagnoses root cause, makes the smallest safe correction, and reports only meaningful milestones or blockers. The user is not the fallback monitor.

## Cursor Automation branch-only output contract

Cursor Automation repeatedly created draft PRs even when instructed to open ready PRs. To prevent recurring human-only cleanup work, Cursor Automation must use branch-only handoff.

Cursor Automation must:

- Push the requested branch after validation passes.
- Comment on the issue with branch name, head commit SHA, validation result, changed files, and any blocker/status.
- Do **not** open pull requests directly.
- Do **not** create draft pull requests.
- Do **not** merge.

ChatGPT/control-plane is responsible for opening the PR as ready for review through the GitHub connector, checking CI, reviewing the diff, and merging only when accepted.

---

## Pull request output contract for non-Cursor agents

When a non-Cursor coding agent is asked to open a PR:

- Open the PR against `main` as **ready for review**, not as a draft.
- Do **not** create draft PRs unless the issue explicitly says `draft: true` or asks for a draft.
- Do **not** merge your own PR.
- Use a clean conventional PR title matching the commit, for example `feat: add minimal game state engine`.
- Include summary, changed files, validation, and known debt in the PR body or sprint report.
- If validation passes but a ready PR cannot be opened, comment on the issue with the blocker instead of opening a draft PR.

---

## Reporting

Keep reports **short and concrete**:

- Changed files
- What changed (behavior / visuals / copy)
- Build status
- QA status (if run)
- Commit hash (if committed)

Avoid long narrative summaries and engagement bait.

---

## Product boundaries (always)

- No backend, auth, or wallet integration unless explicitly scoped.
- No crypto / NFT / token / mint / ETH language in product copy.
- Preserve demo progression routes and `localStorage` persistence semantics unless the task explicitly changes them.
- Preserve premium black/gold strategy-game aesthetic.

---

## World map work

Any `/world` visual or interaction work must follow **`docs/WORLD_MAP_V7_SPEC.md`**. See also `.cursor/rules/30-world-map-workflow.mdc`.

---

## Related files

- `AGENTS.md` — top-level agent entry point
- `docs/WORLD_MAP_V7_SPEC.md` — playable sector product spec
- `.cursor/rules/*.mdc` — Cursor project rules (always-applied and topical)
