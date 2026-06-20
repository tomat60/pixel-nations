# Pixel Nations Current State

Status: ACTIVE  
Updated by: Project OS Cleanup v0.1  
Purpose: one current source of truth for the next assistant session.

## Current product state

Pixel Nations is a public demo for the loop:

land → settlement / city → nation → empire

The full product vision is a 10,000-land world. The current playable/demo area is Sector A-01 / Aurelian Basin.

## Accepted current milestone

Current accepted feature baseline:

- Living Map v0.5 first-world activity layer is merged.
- Continuity v0.6 path memory is merged.
- Public QA check automation exists as `npm run pn:public-check`.
- Public QA evidence was validated after Continuity v0.6.
- ChatGPT Project Instructions were simplified to Project Instructions v2.
- Project OS Cleanup v0.1 is the current system cleanup step.

## Current product risks

- The demo may still confuse first-time players about what to click next and why each action matters.
- Map geography is still prototype-level. Routes/markers can be symbolic and do not yet represent final authoritative geography.
- Some historical sprint docs still sound active. Use `docs/README.md` and this file to determine what is current.
- Manual file/upload/Vercel instructions should be replaced by deterministic commands wherever possible.

## Current process policy

Before any implementation:

1. Run `npm run pn:status`.
2. Read this file.
3. Confirm whether Cursor is allowed.
4. Prefer deterministic terminal packages for audits, docs, QA, and small safe patches.
5. Use Cursor only after a precise prompt passes review.
6. Default Cursor model is GPT-5.5 without MAX.
7. MAX is blocked unless the task clearly justifies higher cost.

## Current QA policy

Use:

```bash
npm run pn:status
npm run pn:public-check
```

`pn:public-check` validates public evidence freshness/equality. It does not approve art direction.

Visual work still requires explicit manual visual verdict:

- ACCEPTED
- REJECTED
- VISUAL DEBT

## Next recommended product step

After Project OS Cleanup v0.1 is committed and public evidence is clean:

Demo Readiness v0.7 — Player Confusion Pass

Goal:
Review the public demo as a new player and fix only the highest-impact confusion points.

Cursor remains blocked until that audit produces a precise scoped patch or approved Cursor prompt.

## Stop condition for current cleanup

Project OS Cleanup v0.1 is complete when:

- `docs/README.md` exists and maps active vs historical docs.
- `docs/PROJECT_CURRENT_STATE.md` exists.
- `npm run pn:status` exists.
- `docs/ASSISTANT_COMMAND_PROTOCOL.md` points future sessions to `pn:status`.
- repo is clean after handoff update.

<!-- PN_REPORT_PACKAGE_WORKFLOW_CURRENT_STATE_V0_1 -->
## Current handoff workflow

Result handoffs should use:

```bash
npm run pn:report
```

The command creates `reports/outbox/pn-result-*.zip` and reveals/selects the ZIP in Finder on macOS. Upload that ZIP to ChatGPT instead of pasting large terminal output.

This workflow is process infrastructure. It does not approve gameplay, visual quality, or product clarity.
<!-- END_PN_REPORT_PACKAGE_WORKFLOW_CURRENT_STATE_V0_1 -->
