# Claude Fable 5 Experiment Plan — Pixel Nations

Date: 2026-07-03
Project: Pixel Nations
Mode: cost-capped premium review / controlled generation experiment

## Decision

Fable 5 should be tested more aggressively on Pixel Nations than on the trading bot, because the project benefits from long-context creative/product reasoning and can absorb more exploratory output without creating financial risk.

However, Fable must remain a controlled tool:

- no secrets,
- no automatic repo writes,
- no automatic PRs,
- no deployment actions,
- no external service calls,
- no broad refactors without review.

The first goal is not to let Fable autonomously build everything. The first goal is to discover where Fable materially beats the default workflow: product strategy, MVP compression, game-loop clarity, narrative/world cohesion, prompt generation for Cursor, and potentially direct implementation planning.

## Current repo baseline observed

The repository is a Next.js project. Package scripts include build, smoke QA, screenshot QA, handoff/reporting, visual gate, public check, status/report/outbox/confusion/cloud-ready flows. The homepage already communicates the current fantasy:

- Pixel Nations.
- 10,000 finite lands.
- Claim first land.
- Found settlement.
- Raise nation.
- Declare empire.
- Persistent player-created history.
- Playable MVP demo.

This means Fable should not invent an unrelated game. It must improve, compress, and sharpen the existing direction.

## Experiment philosophy

We intentionally run three increasingly expensive tests:

1. **Weak-prompt miracle test** — can Fable produce a surprisingly good game/vertical-slice plan from a tiny prompt?
2. **Repo-aware product audit** — can Fable use a small repo context to identify the strongest next version of Pixel Nations?
3. **Cursor prompt synthesis** — can Fable produce better, safer, cheaper Cursor implementation prompts than ChatGPT/GPT-5.5?

Only if all three show value do we consider direct Fable-assisted implementation.

## Hard cost policy

Because Fable is expensive and token-hungry:

- Run tests separately, never one giant prompt.
- Prefer markdown artifact output, not code patches.
- First day cap: three runs max.
- First run: no repo files, max output 4k tokens.
- Second run: small context bundle, max input 25k tokens, max output 5k tokens.
- Third run: Cursor prompt synthesis, max input 30k tokens, max output 6k tokens.
- Stop if output is generic, bloated, or expands scope.
- Stop if output cannot be converted into a small implementation issue.

## Test 1 — Weak-prompt miracle test

### Purpose

Check the claim that Fable can create a surprisingly coherent game from a weak prompt.

### Prompt

```text
Create the best possible first playable version of Pixel Nations.

It is a browser game about a persistent world of finite lands where the first explorers claim land, build settlements, form nations and eventually empires. Make it feel ambitious but implementable by a tiny team.

Output:
1. the core fantasy in one sentence,
2. the smallest playable loop,
3. the first 10-minute player experience,
4. what to cut from MVP,
5. the simplest data model,
6. the screen/page list,
7. implementation phases,
8. risks,
9. what Cursor should build first.

Do not propose blockchain, payments, multiplayer servers, accounts, real-time infrastructure, or huge art systems unless absolutely necessary. Prefer a convincing browser MVP that can be built quickly.
```

### Evaluation

Score 0–10:

- Does it preserve the Pixel Nations fantasy?
- Does it cut scope aggressively?
- Does it propose a playable loop, not only a landing page?
- Does it identify the first 10 minutes clearly?
- Does it avoid expensive infrastructure?
- Does it give useful Cursor-ready next steps?

Pass threshold: 8/10 and output must produce at least one concrete implementation issue.

## Test 2 — Repo-aware product audit

### Purpose

Use small repo context to see if Fable can identify the best next version.

### Allowed context

- README.md
- package.json
- app/page.tsx, or a summarized excerpt if too large
- current issue summary / project brief
- any non-secret docs/design files if present

### Prompt

```text
You are a senior game product director and technical scope cutter reviewing Pixel Nations.

Context:
- It is a Next.js browser game.
- Current direction: a persistent world of 10,000 finite lands. The player claims one land, founds a settlement, raises a nation, and declares an empire. The demo should make the player feel like the first founder in a living world.
- Current implementation already has a landing page and demo flow direction.

Task:
Design the strongest next playable vertical slice that can be built by a tiny team without backend complexity.

Required output:
1. Product verdict: what Pixel Nations is really promising.
2. The one MVP loop that must exist.
3. The exact first-session path, screen by screen.
4. What should be removed or deferred.
5. Minimal state model.
6. UX copy improvements.
7. Implementation milestones.
8. Cursor implementation prompts split into safe small tasks.
9. Acceptance criteria and QA commands.
10. Stop conditions where Cursor should ask instead of decide.

Constraints:
- No broad refactor.
- No secrets.
- No payments.
- No blockchain.
- No live multiplayer requirement.
- No external paid tools.
- No huge art generation scope.
- Prefer localStorage/mock persistence unless a backend is truly necessary.
```

### Evaluation

Pass if it produces:

- better MVP clarity than current plan,
- implementable tasks,
- reduced scope,
- clear first-session player experience,
- no expensive infrastructure creep.

## Test 3 — Cursor prompt synthesis

### Purpose

Determine whether Fable is useful as a prompt engineer for Cursor.

### Prompt

```text
Based on the selected Pixel Nations vertical slice, write 3 Cursor prompts.

Each prompt must include:
- model/mode recommendation,
- cost level and justification,
- exact allowed files,
- forbidden files/actions,
- safety constraints,
- implementation scope,
- tests,
- validation commands,
- acceptance criteria,
- when Cursor must stop and ask instead of deciding.

Prompts:
1. improve first-session flow and copy,
2. implement one playable loop improvement,
3. add QA evidence/reporting for the new loop.

Do not ask Cursor to refactor everything.
Do not ask Cursor to decide product direction.
Do not include secrets, deployment, payments, blockchain, or broad architecture changes.
```

### Evaluation

Pass if prompts are cheaper, more precise, and safer than a normal broad prompt.

## Direct implementation test — only after tests 1–3 pass

Fable may be allowed to draft implementation instructions or code plans, but not to write directly to repo. If direct coding is attempted later, it must be through Cursor with:

- limited file allowlist,
- no MAX unless justified,
- small PR,
- QA commands,
- visual evidence,
- rollback plan,
- manual review before merge.

## Recommended first implementation target if Fable passes

A stronger localStorage-based playable founder loop:

1. `/world` — choose one land from a small sector.
2. `/dashboard` — view claimed land and founder record.
3. `/settlement` — choose settlement identity / civic core.
4. `/nation` — choose banner/name/principle.
5. `/empire` — final founder record / demo completion.

The key is not more features. The key is emotional clarity: the player must feel, “I started history here.”

## Stop conditions

Stop Fable testing if:

- output is generic,
- it proposes blockchain/payments/multiplayer servers before the local MVP is strong,
- it expands scope,
- it burns tokens without implementation value,
- it produces code that cannot be safely reviewed,
- it requires secrets or external services,
- it does not clearly beat GPT-5.5/Cursor planning.

## Journal

Pixel Nations is the right project for a larger Fable test. The upside is high because the game needs synthesis across fantasy, loop, UX, and code planning. The risk is scope explosion and token burn. The test sequence is designed to capture the upside while stopping early if Fable becomes expensive noise.
