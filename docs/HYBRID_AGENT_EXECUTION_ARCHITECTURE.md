# Hybrid Agent Execution Architecture v1.2

Status: ACTIVE SOURCE OF TRUTH
Purpose: define how Pixel Nations uses GitHub, Codespaces, CI, GitHub Copilot cloud agent, Cursor CLI/headless, ChatGPT, QA, and the production team model without creating agent chaos.

## Decision

Pixel Nations will use a hybrid execution architecture:

- GitHub is the source of truth.
- GitHub Codespaces / cloud dev box is the default execution environment outside the local MacBook.
- GitHub Actions is the automatic QA and governance layer.
- Cursor CLI/headless is the preferred implementation executor for scoped batches when authenticated and available.
- GitHub Copilot cloud agent is the planning/review/PR agent and fallback implementation executor when it reduces manual work.
- ChatGPT remains the strategic product lead, reviewer, cost-control lead, and gatekeeper.
- Local MacBook execution is fallback only: emergency recovery, one-time bootstrap, or manual visual review.

## Why hybrid

Cursor CLI/headless is strong for controlled implementation batches in a dev container. GitHub Copilot cloud agent is strong for GitHub-native planning, branch/PR creation, and async review workflows. Combining them creates a better system than choosing only one:

- Cursor executes scoped code tasks under strong constraints.
- GitHub agents and Actions supervise, validate, review, and package results.
- Human checkpoints occur only at milestone, blocker, cost, product-direction, or security gates.

## Non-goal

This is not a free-form autonomous game factory. Agents must not receive vague prompts such as "build the whole game". They receive batch specs with clear product target, allowed files, forbidden actions, validation commands, cost/time limits, and stop conditions.

## Core operating loop

1. Strategy rails define the next milestone and batch scope.
2. Batch spec is created from Production OS docs.
3. Executor runs in cloud environment.
4. CI validates build, smoke, screenshots where required, and handoff/report generation.
5. If gates pass, the agent opens or updates a PR/report.
6. If gates fail twice, the agent stops and reports the blocker.
7. Human review happens only for milestone acceptance, product-direction changes, security/secrets, new paid services, or repeated agent failure.

## Tool responsibility split

### ChatGPT

- Product strategy
- Creative direction
- Roadmap and scope control
- Prompt/spec design
- Cost/risk decisions
- Final acceptance or rejection of milestone output

### GitHub Actions

- Deterministic validation
- CI build and smoke checks
- Cloud readiness checks
- PR status checks
- Artifact/report generation where practical

### GitHub Copilot cloud agent

- GitHub-native planning
- Issue-to-branch work
- PR creation
- Lightweight implementation or fallback execution
- PR explanation and review iteration

### Cursor CLI/headless

- Primary scoped implementation executor when available
- Runs only from approved batch spec
- Must obey allowed/forbidden files, tests, and stop conditions
- Must not start broad strategy or redesign work without an explicit batch spec

### Human user

- Approves major product direction
- Reviews milestone demos
- Provides taste/clarity judgement when needed
- Does not manually babysit every command or micro-patch

## Local machine policy

The local MacBook should not be the main production machine. Use it for:

- viewing demo
- downloading/uploading final reports when cloud artifact transfer is not yet automated
- emergency recovery
- strategic review

## Cost policy

Default cloud compute: modest Codespaces or equivalent. Upgrade compute only when wall-clock build/QA time is the actual bottleneck. Do not spend more to let agents wander. Spend more only to execute an already-scoped high-value batch faster.

## Failure policy

Agents must stop when:

- build fails after 2 attempts
- QA fails after 2 focused fixes
- scope requires a new system, backend, dependency, secrets, billing, or product direction change
- map/globe polish starts consuming a core-game-loop batch
- task exceeds time/cost limit
- agent cannot explain the next step

## Current strategic priority

After the cloud/headless bootstrap, the next implementation milestone is:

Core Game Loop v0.8.1 — make the player feel progression after claim:
land → settlement → city core → trade seed → alliance/nation direction → empire promise.

Map/geography polish is visual debt unless it blocks the first impression or QA. Do not rebuild the map before the core loop is playable.
