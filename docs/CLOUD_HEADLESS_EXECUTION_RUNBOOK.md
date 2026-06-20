# Pixel Nations — Cloud / Headless Execution Runbook

Status: ACTIVE  
Purpose: move production execution away from the local MacBook and into controlled cloud/headless batches.

## Strategic intent

Pixel Nations should be built through controlled autonomous batches, not endless local micro-checkpoints.

The goal is not to let an agent “do anything.” The goal is to give the agent enough rails to make progress without repeatedly asking the user to copy commands, upload logs, or resolve routine mechanical issues.

## Target architecture

- GitHub repo: source of truth.
- GitHub Codespaces or equivalent cloud dev box: primary execution environment.
- GitHub Actions: repeatable build/smoke validation.
- Cursor CLI/headless or another approved coding agent: bounded implementation executor.
- Vercel: public demo deployment.
- ChatGPT: product strategy, batch review, cost/risk decisions, final acceptance.

## Execution modes

### Mode A — Local emergency only

Use local MacBook execution only for:

- recovery from a bad state,
- one-off status/report generation,
- urgent small safe patch when cloud is unavailable.

Local execution is no longer the preferred production path.

### Mode B — Cloud supervised batch

Default target for the next phase.

The user approves a batch objective once, then the agent works in cloud until one of the stop conditions fires or the batch produces a consolidated result.

### Mode C — Full autonomous sequence

Blocked until at least one cloud supervised batch succeeds.

This mode may run multiple sprint tasks in sequence, but only if every dependency gate passes and the cost cap is respected.

## Cloud box sizing policy

Default:

- 4-core for docs, audits, light implementation, build/smoke.
- 8-core for heavier agent batch work, repeated builds, or screenshot QA.
- 16-core only when there is evidence that faster wall-clock time reduces total cost or unlocks progress.

Bigger compute is allowed only when it directly improves speed, quality, or probability of success.

## Secrets policy

Never put secrets in ChatGPT messages, docs, committed files, screenshots, or result ZIPs.

If a tool requires authentication, use GitHub repository secrets or the cloud provider’s secret mechanism. The user should only be asked for secrets when the system has a concrete need and a safe place to store them.

## Batch lifecycle

1. Read active rails:
   - `docs/PROJECT_CURRENT_STATE.md`
   - `docs/FINAL_PRODUCT_TARGET.md`
   - `docs/GAME_STRATEGY_MASTER_PLAN.md`
   - `docs/IMPLEMENTATION_ROADMAP.md`
   - `docs/SPRINT_DEPENDENCY_GRAPH.md`
   - `docs/AGENT_EXECUTION_GOVERNANCE.md`
   - `docs/AUTONOMOUS_PRODUCTION_PROTOCOL.md`
   - this runbook
2. Run readiness:
   ```bash
   npm run pn:cloud-ready
   ```
3. Confirm the batch has:
   - objective,
   - allowed files,
   - forbidden actions,
   - validation commands,
   - cost cap,
   - stop conditions.
4. Execute implementation.
5. Validate:
   ```bash
   npm run build
   npm run qa:smoke
   ```
6. Run screenshot QA only when UI changed or when the batch explicitly requires it.
7. Commit only coherent changes.
8. Produce one consolidated report / PR / result package.

## When the agent must stop

Stop and request review only if:

- the batch would change the strategic product direction,
- the batch needs paid infrastructure, secrets, API keys, or account changes,
- build or smoke fail after two focused repair attempts,
- screenshot QA fails due a real visual/product problem rather than test flake,
- the implementation touches forbidden systems,
- the agent is uncertain between materially different product directions,
- the cost cap is likely to be exceeded,
- a playable milestone is ready for user review.

## When the agent should not stop

The agent should not ask the user for routine mechanical decisions, such as:

- command copy/paste,
- log upload after every small step,
- whether to run build/smoke,
- whether to fix a simple TypeScript/build error inside the batch scope,
- whether to regenerate a report when the batch already requires one.

## Current next target

After this bootstrap, the next intended execution target is:

Core Game Loop v0.8.1 under Production OS rails.

This should be run as a cloud/headless batch, not as another sequence of local micro-patches.
