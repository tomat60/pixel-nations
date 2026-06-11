# Pixel Nations — AI Cost Control Codex

Production operating manual for AI/model usage on this project. **The main rule: no vague agent iterations.**

If a task cannot be stated with goal, files, acceptance criteria, and QA level — stop and write the spec first.

---

## Roles

### ChatGPT (Product Lead / Creative Director / Cost-Control Lead / Prompt Architect)

ChatGPT owns:

- Product strategy and visual direction
- Scope definition before any Cursor run
- Prompt architecture (model, MAX, files, policies)
- Cost-control decisions and stop rules
- Specs such as `docs/WORLD_MAP_V7_SPEC.md`

ChatGPT does **not** replace the human decision-maker. It prepares handoffs the human approves.

### Cursor (Executor, not strategist)

Cursor owns:

- Implementing a scoped handoff in the named files
- Running build/QA only per policy
- Reporting changed files, build status, QA status, commit hash

Cursor does **not** own:

- Redefining product direction mid-task
- Broad repo exploration without a prompt
- Repeated cosmetic loops until something “feels better”

### Human

Final approval on scope, commits to `main`, and when to spend on frontier models or QA.

---

## Forbidden prompt types

Do **not** send these to Cursor (or any executor) without rewriting:

| Bad prompt | Why it fails |
|------------|--------------|
| “Improve map” | No acceptance criteria; invites endless polish |
| “Make it better” | No measurable outcome |
| “Check everything” | Expensive audit; unrelated diffs |
| “Fix what you see” | Agent becomes strategist; scope explodes |

If you catch yourself writing one of these, stop and use the **allowed task format** below.

---

## Allowed task format

Every implementation prompt should include:

```text
Model: [e.g. Composer / GPT-5.x / local]
MAX Mode: [ON | OFF — default OFF]

Goal:
[One sentence outcome]

Files in scope:
- path/to/file

Files out of scope:
- [explicit list]

Requirements:
- [numbered, testable]

Acceptance criteria:
- [numbered, verifiable]

Build policy: [required | skip — docs-only]
QA policy: [qa:screens | skip]
Commit policy: [commit+push main | branch only | no commit]

Final report:
- changed files, what changed, build, QA, commit hash
```

---

## Model selection matrix

| Tier | Tool | Best for | Avoid |
|------|------|----------|-------|
| **ChatGPT / manual** | Human + ChatGPT | Strategy, specs, prompt design, cost decisions | Letting it drive unscoped Cursor runs |
| **Cursor Composer / Auto** | Default executor | Scoped UI, bugfixes, docs in repo, single-feature passes | Vague “make it better” loops |
| **Local AI** | Ollama / LM Studio / private stack | Docs drafts, repo Q&A, tiny patches, analysis | Large multi-file refactors without review |
| **Cursor GPT / Codex / frontier** | Higher-cost models | Hard debugging, complex logic, one-shot critical fixes | Routine polish, broad exploration |

**Default:** Composer with MAX **OFF**. Escalate model tier only when the handoff is clear and the cheaper path already failed once with a concrete blocker.

---

## MAX Mode policy

- **Default: OFF**
- Turn **ON** only for:
  - Genuinely difficult debugging with reproduction steps
  - Complex cross-file logic where scope is already frozen
  - One bounded attempt — not an open-ended “try until good”

If MAX ON still yields weak output, **stop** and fix the spec — do not stack MAX iterations.

---

## Build policy

| Change type | `npm run build` |
|-------------|-----------------|
| Code, config, UI, routing | **Required** before commit to `main` |
| Docs-only (`.md`, `.mdc`, rules) | **Skip** |
| Mixed docs + code | **Required** |

---

## QA screenshot policy

| Change type | `npm run qa:screens` |
|-------------|----------------------|
| UI, layout, mobile, `/world` visuals | **Run** after build passes (or when prompt requires) |
| Docs-only | **Skip** |
| Logic-only with no visual change | **Skip** unless prompt requires |
| Dependency / config only | **Skip** unless UI impact |

Do not modify `public/qa/latest/` unless QA was intentionally run for a UI change.

---

## Commit policy

| Rule | Detail |
|------|--------|
| **Experiments** | Use `cursor/` branch prefix; do not push weak WIP to `main` |
| **`main` stability** | `main` should build and represent shippable demo state |
| **Code commits** | Only after `npm run build` passes (and QA if UI changed) |
| **Docs-only commits** | Allowed without build |
| **Push** | Only when prompt explicitly asks or release is ready |

---

## Stop rules

Stop the agent run immediately if:

1. **Too many files changed** — diff exceeds stated scope without justification
2. **Cosmetic-only result** — ~5% visual tweak when a meaningful pass was requested
3. **Unjustified dependencies** — `npm install` or new packages without approval
4. **Weak output + tiny iterations** — second pass would be “adjust padding again”
5. **Strategist drift** — agent redesigns landing, dashboard, or progression without scope
6. **Crypto language** — wallet, token, mint, NFT, ETH framing introduced

When stopping: capture what failed, tighten the handoff, rerun once — do not loop blindly.

---

## Spending policy

- **Do not upgrade the Cursor plan** because the process is inefficient
- **First improve:** process, scope, specs, and prompt format
- **Then consider:** frontier model for one bounded task, or local AI for docs/analysis
- Track: files touched, build/QA runs, and whether the outcome met acceptance criteria

---

## World map policy

All `/world` work follows **`docs/WORLD_MAP_V7_SPEC.md`**.

- **No tiny cosmetic map loops** — meaningful visual jump or stop
- **Honest scale:** full world = **100 × 100 = 10,000 lands**
- **Playable sector:** **Sector A-01**, **216 visible lands** — not the full world
- Preserve claim flow, persistence, mobile tray, no tile scale breakout

---

## User testing gate

**No external user testing** until the vertical slice feels coherent end-to-end:

1. Landing
2. `/world` (atlas + claim)
3. Dashboard (claimed land identity)
4. Settlement
5. Nation
6. Empire

Until then, use internal QA screenshots and self-review only.

---

## Related documents

- `docs/PROJECT_OPERATING_RULES.md` — general project manual
- `docs/WORLD_MAP_V7_SPEC.md` — world map product spec
- `docs/DESKTOP_AI_DECISION_TREE.md` — local AI hardware decision tree
- `AGENTS.md` — Cursor agent entry point
- `.cursor/rules/*.mdc` — enforced project rules
