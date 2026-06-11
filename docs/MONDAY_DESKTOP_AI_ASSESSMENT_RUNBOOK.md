# Monday Desktop AI Assessment Runbook

Practical runbook for deciding whether a **home desktop** can become a private AI/coding server to **reduce Cursor/API costs** — but only if the machine is actually useful.

**Reference:** `docs/DESKTOP_AI_DECISION_TREE.md`, `docs/AI_COST_CONTROL_CODEX.md`

---

## Goal

Answer one question:

> Can this desktop produce **good enough** local output on scoped Pixel Nations tasks to **justify** setup and maintenance — or should we keep ChatGPT + Cursor only?

Do **not** build a local stack because Cursor feels expensive. **First** improve process and specs; **then** assess hardware.

---

## Important context

| Machine | Role |
|---------|------|
| **MacBook Intel i5 / 16 GB RAM** | Daily driver, git, build, QA, browsing — **not** the main AI inference machine |
| **Home desktop** | Candidate for private AI server — assessment depends **mostly on GPU and VRAM** |

CPU and system RAM matter for context and tooling; **VRAM tier drives the decision.**

---

## Step 1 — Collect hardware data

Fill this table before running commands:

| Field | Value |
|-------|-------|
| **CPU** | |
| **RAM** | |
| **GPU** | |
| **VRAM** | (dedicated or effective unified — note which) |
| **OS** | Windows / Linux / macOS + version |
| **Free disk space** | (GB free for models — aim 50+ GB comfortable) |

---

## Step 2 — Run platform commands

### Windows (PowerShell)

```powershell
Get-CimInstance Win32_ComputerSystem | Select-Object Manufacturer,Model,TotalPhysicalMemory
Get-CimInstance Win32_Processor | Select-Object Name
Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM
Get-PSDrive C
```

If NVIDIA GPU exists:

```powershell
nvidia-smi
```

**Note:** `AdapterRAM` from WMI can be misleading; prefer `nvidia-smi` VRAM for NVIDIA cards.

### Linux

```bash
lscpu | grep "Model name"
free -h
lspci | grep -Ei "vga|3d|display"
df -h
nvidia-smi
```

### macOS

```bash
system_profiler SPHardwareDataType SPDisplaysDataType
df -h
```

On Apple Silicon, note **unified memory** — treat effective model VRAM conservatively (not all RAM is available to the GPU).

---

## Step 3 — Assign decision tier

| Tier | Hardware signal | Verdict |
|------|-----------------|---------|
| **Tier 0** | No useful GPU / integrated only / &lt;6 GB effective VRAM | **Do not build** local AI stack |
| **Tier 1** | **8–12 GB VRAM** | **Light local helper** — docs, Q&A, tiny patches |
| **Tier 2** | **16 GB VRAM** | **Useful local coding assistant** — medium scoped tasks |
| **Tier 3** | **24 GB VRAM** | **Serious private AI coding stack** |
| **Tier 4** | **48 GB+ VRAM** | **Strategic private AI infrastructure** |

See `docs/DESKTOP_AI_DECISION_TREE.md` for task-type guidance per tier.

---

## Step 4 — Security policy (mandatory if any local stack)

| Rule | Detail |
|------|--------|
| **Network** | Localhost, LAN, or VPN only |
| **No public port forwarding** | Never expose inference ports to the internet |
| **No exposed Ollama endpoint** | Bind to `127.0.0.1` or trusted LAN only |
| **No public agent tools** | File-write / repo agents stay on trusted machine |
| **Updates** | Patch Ollama/Open WebUI; verify model sources |

Pixel Nations demo uses `localStorage` only — still avoid sending secrets into untrusted hosted inference.

---

## Step 5 — Minimal pilot (Tier 1+ only)

Run **one afternoon**, not a week-long setup.

### 5.1 Install

1. Install a local model runner (e.g. **Ollama** or **LM Studio**)
2. Install **one** coding-oriented model sized to your VRAM (e.g. 7B–14B quant for Tier 1–2; larger only if VRAM allows)

### 5.2 Test tasks (in order)

| # | Task | Pass signal |
|---|------|-------------|
| 1 | **Repo summary** | “List claim-related fields in `settlement-state.ts`” — accurate, no hallucinated files |
| 2 | **Docs edit** | Draft one section of a `docs/*.md` file — matches Pixel Nations tone, no crypto language |
| 3 | **One-file patch** | Scoped change in `app/lib/claimed-land.ts` from written spec — diff is correct, minimal |
| 4 | **QA analysis** | Given a screenshot description or path, list blockers vs polish — matches rubric thinking |

**Do not** pilot with “improve the world map” — too vague.

### 5.3 Score pilot

| Outcome | Meaning |
|---------|---------|
| Weak / wrong files / needs many retries | Local AI = **docs/analysis only** or **NO STACK** |
| Good diffs on scoped tasks | Consider **LOCAL CODING ASSISTANT** or higher |
| Good docs only, bad code | **LIGHT LOCAL HELPER** |

---

## Step 6 — Final decision (pick one)

| Decision | When |
|----------|------|
| **NO LOCAL AI STACK** | Tier 0; or pilot failed code tasks |
| **LIGHT LOCAL HELPER** | Tier 1; good for docs, Q&A, commit messages |
| **LOCAL CODING ASSISTANT** | Tier 2+; pilot one-file patch passed with minimal rework |
| **PRIVATE AI SERVER** | Tier 3–4; repeated good diffs; worth LAN setup |
| **DELAY LOCAL AI** | Process still vague; fix `docs/CURSOR_TASK_TEMPLATE.md` first; reassess in 4–8 weeks |

Document decision + hardware table in personal notes (not required in repo).

---

## Step 7 — Integration with Pixel Nations workflow

If local AI is approved for **some** tasks:

| Use local | Keep on Cursor |
|-----------|----------------|
| Docs drafts, spec Q&A | `/world` map implementation |
| Repo summaries | QA screenshot loops |
| Single-file lib patches (reviewed) | Multi-page demo UI |
| Analysis of QA report | Merge to `main` after human review |

Always: ChatGPT/human own strategy; see `docs/AI_COST_CONTROL_CODEX.md` stop rules.

---

## Checklist (Monday session)

- [ ] Hardware table filled
- [ ] Platform commands run; VRAM confirmed
- [ ] Tier assigned (0–4)
- [ ] Security policy understood
- [ ] Pilot run (if Tier 1+) — 4 tests
- [ ] Final decision recorded
- [ ] No local stack built on Tier 0 “just to try”

---

## Related documents

- `docs/DESKTOP_AI_DECISION_TREE.md`
- `docs/AI_COST_CONTROL_CODEX.md`
- `docs/CURSOR_TASK_TEMPLATE.md`
