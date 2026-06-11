# World Map v7 — Execution Runbook

Precise runbook for executing **one strong** World Map v7 implementation sprint — no vague map iterations.

**Specs:** `docs/WORLD_MAP_V7_SPEC.md`  
**Review:** `docs/WORLD_MAP_V7_REVIEW_RUBRIC.md`  
**Sprint context:** `docs/NEXT_SPRINT_PLAN.md` (Sprint 1)  
**Prompt format:** `docs/CURSOR_TASK_TEMPLATE.md`

---

## Goal

Make `/world` the first true **gameplay wow** moment in **one scoped sprint**, then review with the rubric. Not v8/v9 polish loops.

---

## Start condition (pick at least one)

Proceed only when:

- [ ] **Cursor frontier model** is available for the main implementation pass, **or**
- [ ] Conscious **small extra spend** approved for one bounded sprint, **or**
- [ ] **Desktop local AI assessment** passed for coding tasks (`docs/MONDAY_DESKTOP_AI_ASSESSMENT_RUNBOOK.md`) — with human review on all diffs

If none apply → **delay sprint** and fix handoff/spec first.

---

## Model decision

| Setting | Value |
|---------|-------|
| **Preferred model** | **GPT-5.5 Medium** (or current frontier equivalent named in handoff) |
| **MAX Mode** | **OFF** |
| **Main map implementation** | **Do not use Composer** for the primary v7 pass — use frontier model per this runbook |
| **Codex / small model** | **Surgical blocker fixes only** (one pass max) |

Composer is fine for docs, tiny fixes, and QA script tweaks — not the main visual sprint.

---

## Branch setup

```bash
git switch main
git pull
git switch -c sprint/world-map-v7
```

Alternative naming if team prefers: `cursor/world-map-v7-playable-sector` — use one branch per sprint attempt.

---

## Preflight

```bash
git status --short
git branch --show-current
git log --oneline -5
```

Confirm:

- [ ] Working tree clean (or only intentional WIP stashed)
- [ ] On `sprint/world-map-v7` (not `main`)
- [ ] `main` is latest stable; experimental `cursor/world-map-v6-playable-sector` **not** merged without review

---

## Implementation scope

### In scope

| File | When |
|------|------|
| `app/world/page.tsx` | **Primary** — atlas-adjacent sector, layers, copy, tiles, tray |
| `app/globals.css` | Only if necessary — sector canvas, contained animations |
| `app/lib/claimed-land.ts` | Only if claim display/persistence needs adjustment |
| `app/lib/settlement-state.ts` | Only if new persisted fields required |
| `scripts/qa-screenshots.mjs` | Only if new captures required for v7 |
| `public/qa/latest/` | After intentional `qa:screens` run only |

### Forbidden scope

- Landing page (`app/page.tsx`)
- Dashboard, settlement, nation, empire — **unless compatibility breaks** (claim identity)
- `package.json` / new dependencies
- Vague “while you’re here” refactors

---

## Product truth (non-negotiable copy)

| Concept | Value |
|---------|-------|
| Full world grid | **100 × 100** |
| Total lands | **10,000** |
| Playable visible sector | **Sector A-01** |
| Visible clickable lands | **216** (18 × 12) |

**Sector A-01 is not the full world.** UI must not pretend the visible grid is 10,000 lands.

---

## Visual goal

Playable sector should feel like **the Atlas came alive**:

- Premium black/gold strategy world
- **Not** spreadsheet / editor / NFT grid
- Meaningful visual jump — not ~5% color tweak

Follow layer list in `docs/WORLD_MAP_V7_SPEC.md`.

---

## Required layers (playable sector)

Stack under clickable tiles:

1. **Clickable grid** — 18×12, stable layout
2. **Terrain masses** — soft organic shapes
3. **Region overlays** — North Frontier, Iron Coast, Aurelia, Crownlands, Ember Basin
4. **Roads / rivers / frontier lines** — SVG or equivalent; subtle
5. **Ownership grid** — visible but softened
6. **State styling** — selected, claimed, founder, landmark, resource-rich

---

## Forbidden interaction

- **No hover scale**
- **No selected scale**
- **No layout shift** on select
- **No huge pulse** covering the map
- Tiles must **not** escape grid cells

Preserve: `openClaimModal()`, mobile claim tray rules, claim persistence.

---

## Cursor handoff (paste into task)

Use `docs/CURSOR_TASK_TEMPLATE.md` with at minimum:

- Model: GPT-5.5 Medium (MAX OFF)
- Goal: World Map v7 per `docs/WORLD_MAP_V7_SPEC.md`
- Files in scope: listed above
- Files out of scope: landing, dashboard, etc.
- Acceptance criteria: spec + rubric blockers
- Build: yes; QA: yes
- Commit message: `Improve world map playable sector experience`

---

## QA gate

After implementation:

```bash
npm run build
```

If Playwright missing:

```bash
npx playwright install chromium
```

Then:

```bash
npm run qa:screens
```

Commit updated `public/qa/latest/` with the implementation commit (or immediately after).

Verify captures include at minimum:

- `desktop-world.png`, `desktop-world-sector.png`
- `mobile-world.png`, `mobile-world-sector.png`, `mobile-world-claim-tray.png`
- `mobile-world-top.png` (tray **not** visible at top)

---

## Commit

On branch `sprint/world-map-v7`:

```bash
git add app/world/page.tsx app/globals.css
# add lib/qa files only if changed
git commit -m "Improve world map playable sector experience"
```

Do **not** push to `main` until review passes.

---

## Review (human + ChatGPT)

Use **`docs/WORLD_MAP_V7_REVIEW_RUBRIC.md`** — score PASS / POLISH / BLOCKER.

### Manual checks

| Check | Action |
|-------|--------|
| Desktop `/world` | Atlas intact; sector feels map-like; select + claim |
| Mobile `/world` | No page horizontal overflow; tray timing; claim works |
| Claim flow | Select → modal → dashboard PN-xxxx + land name |
| Dashboard compatibility | No “Awaiting Claim” after claim |

### QA report

Open `public/qa/latest/report.html` — compare before/after screenshots.

---

## Decisions after review

Choose **one**:

| Decision | Next step |
|----------|-----------|
| **Accept and merge** | No blockers; `git switch main && git merge sprint/world-map-v7` (or PR); push |
| **One blocker fix pass** | Frozen scope in `CURSOR_TASK_TEMPLATE.md`; Codex/surgical fix only |
| **Reject and return to blueprint** | Revise `WORLD_MAP_V7_SPEC.md`; do not start v8 polish loop |

---

## Anti-loop rule

- **Only one blocker-fix pass** before returning to ChatGPT for a new decision
- **No endless v8 / v9 / v10** “make it a bit better” loops
- **POLISH** items → backlog, not same-week Cursor spend

---

## Emergency rollback

If a bad commit lands on `main`:

```bash
git log --oneline -5
git revert <bad_commit_hash>
git push
```

Prefer `revert` over force-push. Warn team if QA assets were committed with the bad change.

---

## Merge checklist (before `main`)

- [ ] Rubric: **zero BLOCKER**
- [ ] `npm run build` passes on branch
- [ ] QA screenshots reviewed
- [ ] Claim + dashboard verified once manually
- [ ] Mobile 390px usable
- [ ] No crypto language introduced
- [ ] Scope control: no landing/dashboard redesign

---

## Related documents

- `docs/WORLD_MAP_V7_SPEC.md`
- `docs/WORLD_MAP_V7_REVIEW_RUBRIC.md`
- `docs/NEXT_SPRINT_PLAN.md`
- `docs/AI_COST_CONTROL_CODEX.md`
- `docs/MONDAY_DESKTOP_AI_ASSESSMENT_RUNBOOK.md`
