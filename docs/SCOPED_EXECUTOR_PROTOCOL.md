# Pixel Nations Scoped Executor Protocol

This document defines the safe automation path for implementation runs that should not require the founder to manually operate Cursor.

## Purpose

The scoped executor exists to convert an approved Product Lead handoff into a draft pull request while keeping `main` protected.

It is **not** a strategist. It is **not** allowed to choose product direction. It must only execute a bounded implementation issue that already has:

- product decision;
- allowed files;
- forbidden actions;
- validation commands;
- stop condition;
- evidence requirements.

## Trigger

Use the issue template `Scoped executor run` or create an issue whose title starts exactly with:

```text
AGENT RUN: scoped_implementation
```

The workflow only runs when the issue author is `tomat60`.

## What it can do

The executor may:

1. read the approved issue body;
2. read a bounded set of repo files;
3. ask Anthropic for a minimal unified git diff;
4. validate that patch paths are inside the allowlist;
5. apply the patch in a GitHub Actions workspace;
6. create a new branch;
7. open a draft PR;
8. upload the patch/report artifact;
9. comment back with the PR or safe failure.

## What it must never do

The executor must never:

- merge a PR;
- touch secrets or `.env` files;
- add dependencies/packages;
- create backend/database/auth/accounts;
- create new routes;
- revive legacy routes;
- add multiplayer/payments;
- perform broad visual redesign;
- delete or rename files;
- expand beyond the allowed paths;
- decide product direction.

## Default allowlist

The executor script accepts patch paths only under:

- `app/play/**`
- `scripts/qa-*.mjs`
- `package.json`
- `.github/workflows/play-visual-qa.yml`

## Immediate verification rule

After a scoped executor issue is created, immediately verify:

1. a `Scoped executor started` comment appears;
2. a GitHub Actions run exists;
3. the run either creates a draft PR or fails safely;
4. any draft PR triggers CI/Play Visual QA;
5. evidence artifacts exist before merge.

No passive waiting.

## Merge rule

The executor output is always **rough until reviewed**.

A generated PR can only merge after:

- Product Lead diff inspection;
- CI success;
- Play Visual QA success;
- evidence artifact inspection;
- no legacy route regression;
- no scope creep.

## Current intended first use

The first intended use is #148: `GAMEPLAY SLICE: post-crisis frontier payoff`.

The executor should implement exactly one post-crisis frontier payoff derived from the resolved post-crisis response, not a generic three-choice system.
