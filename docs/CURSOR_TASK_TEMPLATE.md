# Cursor Task Template

Reusable template for **all** future Pixel Nations Cursor prompts. Copy, fill in every section, then run.

> **Warning:** Do not use vague prompts such as **“improve this”**, **“make it better”**, **“check everything”**, or **“fix what you see”**. They cause scope creep, wasted API usage, and weak iterations. If you cannot fill this template, write the spec first (ChatGPT + `docs/WORLD_MAP_V7_SPEC.md` / sprint plan).

---

## Model

`[Composer / GPT-5.x / Codex / other]`

## MAX Mode

**OFF** by default. Set ON only for one bounded hard task with frozen scope; document why.

## Task Type

`[docs-only / UI / logic / QA / bugfix / refactor]`

## Goal

One sentence describing the user-visible or system outcome.

Example: *Make Sector A-01 playable map feel like the atlas came alive while preserving claim flow.*

## Files In Scope

List **exact** paths:

```text
- app/world/page.tsx
- app/globals.css
```

## Files Out Of Scope

List files that **must not** be touched:

```text
- app/page.tsx (landing)
- app/dashboard/page.tsx
- package.json
- public/qa/latest/ (unless QA policy says run)
```

## Requirements

Concrete, testable bullets:

- Follow `docs/WORLD_MAP_V7_SPEC.md` (if `/world`)
- Sector A-01 = 216 visible lands; full world = 10,000 — honest copy
- No tile scale / breakout animations
- Preserve `openClaimModal` / claim persistence
- No crypto / wallet / token / mint language
- …

## Acceptance Criteria

Pass/fail checklist:

- [ ] …
- [ ] `npm run build` passes (if code changed)
- [ ] …

## Build Policy

State explicitly:

| Run build? | Reason |
|------------|--------|
| **Yes** / **No** | e.g. Code/UI changed → required. Docs-only → skip. |

## QA Policy

State explicitly:

| Run `npm run qa:screens`? | Reason |
|---------------------------|--------|
| **Yes** / **No** | e.g. UI/layout/mobile changed → run after build. Docs-only → skip. |

If QA runs: commit `public/qa/latest/` changes.

## Commit Policy

| Action | Detail |
|--------|--------|
| Branch | e.g. `cursor/world-map-v7-playable-sector` or `main` |
| Commit? | Yes / No |
| Push? | Yes / No |
| Message | Exact message: `"..."` |

Rules:

- Code on `main`: build must pass first (QA if UI).
- Docs-only: build not required.
- Do not commit unrelated files.

## Final Report

Agent must return:

1. **Changed files** (list)
2. **What changed** (brief: behavior / visuals / copy)
3. **Build status** (passed / skipped + why)
4. **QA status** (passed / skipped + why)
5. **Commit hash** (if committed)
6. **Known limitations** (anything deferred or not in scope)

Keep the report **short and concrete** — no engagement bait.

---

## Example (filled — docs-only)

```text
Model: Composer
MAX Mode: OFF
Task Type: docs-only

Goal: Add sprint planning doc for next Pixel Nations work.

Files In Scope:
- docs/NEXT_SPRINT_PLAN.md

Files Out Of Scope:
- app/**/*
- package.json

Requirements:
- Six sprints as defined in product handoff
- Reference existing specs by path

Acceptance Criteria:
- [ ] File created and readable
- [ ] No app code changed

Build Policy: No — docs-only
QA Policy: No — no UI change
Commit Policy: Yes on main, push, message "Add next sprint plan"

Final Report: changed files, build skipped, QA skipped, commit hash
```

---

## Example (filled — UI)

```text
Model: Composer
MAX Mode: OFF
Task Type: UI

Goal: Implement World Map v7 playable sector per spec.

Files In Scope:
- app/world/page.tsx
- app/globals.css

Files Out Of Scope:
- app/page.tsx
- app/dashboard/page.tsx
- package.json

Requirements:
- Follow docs/WORLD_MAP_V7_SPEC.md
- 216 visible lands / Sector A-01 honest copy
- Preserve claim flow and mobile tray
- No tile scale breakout

Acceptance Criteria:
- [ ] Meaningful visual improvement
- [ ] Claim + persistence work
- [ ] Mobile usable
- [ ] Build passes
- [ ] QA screenshots regenerated

Build Policy: Yes — UI changed
QA Policy: Yes — /world layout changed
Commit Policy: Branch cursor/world-map-v7-..., commit when build+QA pass; push only if prompt asks

Final Report: required fields + known limitations
```

---

## Related documents

- `docs/NEXT_SPRINT_PLAN.md` — sprint sequence
- `docs/AI_COST_CONTROL_CODEX.md` — cost control and stop rules
- `docs/PROJECT_OPERATING_RULES.md` — project manual
- `docs/WORLD_MAP_V7_SPEC.md` — `/world` spec
- `AGENTS.md` — agent entry point
