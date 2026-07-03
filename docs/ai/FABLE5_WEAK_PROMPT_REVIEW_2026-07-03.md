# Fable 5 Weak Prompt Review — Pixel Nations

Date: 2026-07-03
Workflow run: `28651185623`
Artifact: `fable-pixel-audit-weak_prompt`
Model: `claude-fable-5`
Task: `weak_prompt`

## Result

DECISION: PASS_TO_REPO_AUDIT
CONFIDENCE: 88/100
COST: estimated max $0.2030; actual usage 412 input tokens and 2933 output tokens
MODE: product / game-loop audit

## Summary of Fable output

Fable proposed a compact first playable version of Pixel Nations around:

- core loop: Explore → Claim → Build → Earn → Expand,
- finite land as the hook,
- one-screen map-first experience,
- localStorage persistence,
- deterministic seeded terrain,
- simulated AI rival explorers to create scarcity without real multiplayer,
- fast nation-founding payoff at 10 claimed tiles,
- empire as a late badge/aspiration rather than a full MVP system.

## Strong parts

1. The output preserved the existing Pixel Nations fantasy: scarce finite land, claiming, settlement/nation rise, persistent history feeling.
2. It cut expensive scope aggressively: no backend, no accounts, no real multiplayer, no blockchain, no payments, no social features.
3. It found a real playable loop instead of only improving the landing page.
4. Simulated rivals are a strong v1 substitute for multiplayer: they create urgency and map pressure with minimal infrastructure.
5. The first 10-minute experience is concrete and emotionally understandable.
6. The first Cursor task is bounded: canvas map, terrain, scout movement, fog, claiming, localStorage.

## Risks / objections

1. The suggestion to use `index.html` + `game.js` conflicts with the current Next.js repository direction. We should translate the idea into existing Next.js app structure, not replace the stack.
2. A 128×128 canvas map may be fine, but implementation must be scoped carefully to avoid visual/UX debt.
3. AI rivals can feel fake if framed as real multiplayer. Copy must say this is a playable local demo world, not a live shared server.
4. Offline income can create balancing noise; initial v1 may include timestamp-based progression but should keep numbers simple.
5. The empire system must remain a badge/final founder record, not a new mechanics layer.

## Committee decision

Proceed to `repo_audit` using Fable with small allowlisted context.

Do not implement the weak-prompt output directly. First translate it through repo-aware audit so Fable sees:

- current Next.js structure,
- existing homepage/demo direction,
- package scripts and QA flows,
- current docs/ai experiment plan.

## Next run recommendation

Run GitHub Actions workflow `Fable Pixel Audit` with:

```text
task_type: repo_audit
anthropic_model: claude-fable-5
max_input_tokens: 25000
max_output_tokens: 5000
max_estimated_cost_usd: 0.75
temperature: 0.2
```

The `temperature` input is ignored by the current script because the Fable API does not accept it.

## Acceptance criteria for repo_audit

PASS only if Fable:

- adapts the plan to the existing Next.js app instead of proposing a separate static stack,
- reduces scope rather than expands it,
- produces a first-session path using current routes or a small route plan,
- generates small Cursor prompts with exact allowed files,
- keeps localStorage/mock persistence unless a backend is explicitly justified,
- avoids blockchain, payments, accounts, real multiplayer, and broad refactor.

## Journal

The first automated Fable run succeeded. It produced a materially useful vertical-slice direction from a tiny prompt. This justifies one higher-context repo-aware audit, still cost-capped and artifact-only.