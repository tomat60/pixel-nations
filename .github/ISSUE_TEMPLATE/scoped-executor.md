---
name: Scoped executor run
description: Start a guarded implementation run that can open a draft PR
title: "AGENT RUN: scoped_implementation "
labels: ["agent", "implementation"]
assignees: []
---

## Purpose

<!-- Describe the exact implementation sprint. Reference the approved gameplay issue. -->

## Source issue

<!-- Example: #148 -->

## Model / tool choice

- Executor: Pixel Nations Scoped Executor GitHub Action
- Model: `claude-sonnet-5` through Anthropic API
- MAX: off / bounded by workflow caps
- Cost risk: bounded by workflow cap

## Allowed files

- `app/play/**`
- `scripts/qa-*.mjs`
- `package.json` only if a script is needed
- `.github/workflows/play-visual-qa.yml` only if evidence wiring is needed

## Forbidden actions

- no auto-merge
- no secrets
- no `.env`
- no new packages
- no backend/database/auth/accounts
- no new routes
- no legacy route revival
- no multiplayer/payments
- no broad visual redesign
- no unrelated refactor
- no file deletion or rename

## Implementation requirements

<!-- Paste the approved Product Lead handoff. Keep it narrow and testable. -->

## Required selectors / evidence

<!-- List exact selectors and evidence requirements. -->

## Validation

Required before merge:

```bash
npm run lint
npm run build
npm run qa:smoke
```

Add any sprint-specific QA command here.

## Stop condition

Stop and report instead of widening scope if:

- allowed files are insufficient;
- state rewrite becomes broad;
- new packages are required;
- route architecture changes are required;
- implementation cannot be verified through CI/Visual QA evidence.

## Merge rule

The executor may create a draft PR only. Product Lead review, CI, Play Visual QA and artifact inspection are required before merge.
