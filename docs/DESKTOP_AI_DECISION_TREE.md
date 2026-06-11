# Desktop AI Decision Tree — Private AI Server for Pixel Nations

Practical guide for deciding whether a home desktop should become a **private AI server** to reduce Cursor API usage on Pixel Nations work.

This is a **planning document only**. It does not require any repo or infrastructure changes.

---

## Step 0 — Collect hardware data

Before any decision, record:

| Field | Example | Your machine |
|-------|---------|--------------|
| **CPU** | Apple M2 Pro / Ryzen 7 5800X | _____________ |
| **RAM** | 32 GB | _____________ |
| **GPU** | NVIDIA RTX 4080 | _____________ |
| **VRAM** | 16 GB | _____________ |
| **OS** | macOS 15 / Windows 11 / Linux | _____________ |
| **Disk space free** | 50+ GB for models | _____________ |

VRAM is the primary tier driver for local coding models. RAM matters for context and concurrent tools.

---

## Decision flow (overview)

```text
Hardware check
    → Assign tier (0–4)
    → Security policy (always)
    → Minimal pilot (one scoped task)
    → Quality decision
    → Integrate or stay docs-only
```

---

## Tier 0 — No dedicated GPU or weak GPU

**Signals:** Integrated graphics only, &lt;6 GB VRAM, or GPU unsuitable for LLM inference.

**Verdict:** **Not worth serious local coding** for Pixel Nations.

**Use instead:**

- ChatGPT for specs and prompts
- Cursor Composer (MAX OFF) for execution
- Local machine for git, build, QA only

**Allowed local AI:** None required. Optional tiny models for spelling/docs only — low ROI.

---

## Tier 1 — 8–12 GB VRAM

**Signals:** RTX 3060 12GB, RTX 4070, Mac unified memory treated as ~8–12 GB effective for models.

**Verdict:** **Local helper** — not a full coding replacement.

**Good for:**

- Drafting docs (`docs/*.md`, rules, specs)
- Repo Q&A (“where is claim persistence?”)
- Small patches (single file, &lt;30 lines) with human review
- Summarizing diffs and writing commit messages

**Poor for:**

- Multi-file `/world` visual passes
- Large refactors
- Replacing Cursor for UI work

**Pilot task:** Rewrite one doc section or answer “list all `claimedLand*` fields” from the repo.

---

## Tier 2 — 16 GB VRAM

**Signals:** RTX 4080 16GB, RTX 3090, Mac Studio class with sufficient unified memory.

**Verdict:** **Useful local coding assistant** for medium scoped tasks.

**Good for:**

- Docs + rules (full files)
- Bugfixes with explicit file + line context
- Test scaffolding and type fixes
- First draft of scoped functions in `app/lib/*`

**Still use Cursor for:**

- `/world` map visuals (needs browser QA loop)
- Cross-page demo flow changes
- Anything requiring Playwright or build iteration

**Pilot task:** Implement a named helper in `app/lib/claimed-land.ts` from a written spec; compare diff quality to Composer.

---

## Tier 3 — 24 GB VRAM

**Signals:** RTX 4090 24GB, RTX 3090 Ti, workstation GPUs.

**Verdict:** **Serious private coding stack possible.**

**Good for:**

- Most single-feature scoped tasks in `app/`
- Repeated iterations without per-token API cost
- Offline work on specs + implementation drafts

**Still require:**

- Human + ChatGPT for product direction
- Cursor or manual review before `main`
- Build (and QA if UI) before merge

**Pilot task:** Full scoped handoff for a non-map page fix with acceptance criteria; measure time vs Cursor cost.

---

## Tier 4 — 48 GB+ VRAM

**Signals:** RTX A6000, dual GPUs, Mac Ultra with very large unified memory, datacenter cards.

**Verdict:** **Private AI server becomes strategically valuable.**

**Good for:**

- Multiple models (fast + quality)
- Long context over whole repo slices
- Team-style roles (spec model + code model) on LAN

**Still not a substitute for:**

- Product strategy (ChatGPT + human)
- Shippable QA discipline on Pixel Nations UI

---

## Security policy (all tiers)

If you run local inference, **non-negotiable:**

| Rule | Detail |
|------|--------|
| **Network** | Localhost, LAN, or VPN only |
| **No public exposure** | No port forwarding to Ollama/Open WebUI |
| **No public endpoints** | Do not expose agent APIs to the internet |
| **No public agent tools** | Tools that read repo/write files stay on trusted machine |
| **Secrets** | No API keys in prompts logged to shared servers |
| **Updates** | Keep inference stack patched; treat model downloads as supply chain |

Pixel Nations demo uses `localStorage` only — still do not put real user data into untrusted hosted inference.

---

## Rollout plan

### 1. Hardware check

Fill the table in Step 0. Assign tier 0–4. If tier 0–1, skip server setup; optimize prompts instead.

### 2. Minimal pilot

One task from `docs/AI_COST_CONTROL_CODEX.md` allowed format:

- Docs-only **or**
- Single-file lib change with acceptance criteria

Measure: diff quality, time, need for follow-up iterations.

### 3. Quality decision

| Outcome | Action |
|---------|--------|
| Weak diffs, wrong files, vague edits | **Local AI = docs/analysis only** |
| Good diffs, matches spec, minimal rework | **Use local AI to reduce Cursor API** on similar tasks |
| Mixed | Tier-limited use (docs + Q&A only) |

### 4. Integration

If pilot passes:

- Define which task types go local (docs, lib, tests)
- Keep Cursor for UI, `/world`, QA screenshot loops
- Document model name + prompt template in handoff notes (not necessarily in repo)

---

## Final decision rule

```text
IF local AI produces weak diffs
  → use it ONLY for docs, analysis, and repo Q&A
ELSE IF local AI produces good diffs on scoped handoffs
  → use it to REDUCE Cursor API usage on those task types
ALWAYS
  → ChatGPT/human own strategy; Cursor or reviewed merges own shippable code
  → follow docs/AI_COST_CONTROL_CODEX.md stop rules
```

---

## When *not* to build a private AI server

- Tier 0–1 hardware and primary work is UI/visual
- Process is still vague (“improve map” loops) — **fix process first**
- Goal is only to avoid writing specs — local AI will not fix that
- You would expose services publicly for convenience

---

## Related documents

- `docs/AI_COST_CONTROL_CODEX.md` — model usage and stop rules
- `docs/PROJECT_OPERATING_RULES.md` — project operating manual
- `docs/WORLD_MAP_V7_SPEC.md` — world map scope (keep on Cursor + QA when implementing)
