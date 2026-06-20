# Public QA Check Command v0.1

Status: ACTIVE  
Purpose: Stop relying on manual Vercel URL inspection when validating public QA evidence.

## Command

```bash
npm run pn:public-check
```

## What it validates

The command compares:

- local `public/qa/latest/handoff.txt`
- public `https://pixel-nations.vercel.app/qa/latest/handoff.txt`

It checks:

- public handoff is reachable,
- public handoff equals local handoff,
- public handoff says `Working tree: clean`,
- smoke is `PASS`,
- evidence is `FRESH`,
- screenshots count is at least 29,
- public handoff JSON is reachable,
- public QA report is reachable,
- public QA index is reachable.

## Why this exists

During Continuity v0.6, Vercel deployments were Ready, but public handoff validation created confusion. This command makes public QA validation a deterministic terminal check instead of a manual browser task.

## Product rule

After every merge that updates QA evidence:

1. Wait for Vercel deploy.
2. Run `npm run pn:public-check`.
3. Product work remains blocked until it prints `PUBLIC_QA_CHECK=PASS`.

## Boundaries

This command does not approve art direction. It validates public evidence freshness and equality only.
