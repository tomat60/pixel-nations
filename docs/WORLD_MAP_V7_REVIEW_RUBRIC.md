# World Map v7 — Review Rubric

How to review World Map v7 **after implementation and QA**, before merging to `main`.

Use with: `docs/WORLD_MAP_V7_SPEC.md`, `docs/NEXT_SPRINT_PLAN.md` (Sprint 1), QA report at `public/qa/latest/report.html`.

---

## 1. Purpose

World Map v7 is judged by one question:

**Did `/world` become the first real gameplay “wow” moment?**

- Do **not** judge only whether the map is *slightly* better than before.
- Do **not** accept “a bit more gold” or “marginally softer grid” as success.
- The bar is a **premium strategy world** — atlas / kingdom map / tactical sector — **not** a spreadsheet, editor grid, or crypto dashboard.

Reviewers (human + ChatGPT) score each area **PASS**, **POLISH**, or **BLOCKER**. Merge only when blockers are zero and technical gates pass.

---

## 2. Scoring system

| Score | Meaning | Action |
|-------|---------|--------|
| **PASS** | Meets the bar for this release. Accepted as shippable for v7. | Ship or note as done. |
| **POLISH** | Nice-to-have improvement. Valid feedback **deferred** to a future sprint. | **Do not** trigger immediate paid Cursor iteration for polish alone. |
| **BLOCKER** | Fails a hard requirement. Must fix **before merge** to `main`. | One scoped blocker-fix pass max (see §7). |

**Default stance:** When uncertain between PASS and POLISH, choose **POLISH** and document it. When uncertain between POLISH and BLOCKER, choose **BLOCKER** if claim flow, persistence, mobile usability, or honest world scale is at risk.

---

## 3. Main decision after QA

After reviewing QA screenshots, live `/world`, and build output, choose **one**:

| Decision | When |
|----------|------|
| **Accept and merge** | No blockers; build passes; QA acceptable; claim + dashboard verified |
| **One blocker fix pass** | 1–3 clear blockers; scope frozen in `docs/CURSOR_TASK_TEMPLATE.md`; single Cursor run |
| **Reject sprint and return to blueprint** | Fundamental miss (still spreadsheet-like, wrong scale story, broken claim arc, scope explosion); revise `docs/WORLD_MAP_V7_SPEC.md` / sprint handoff before re-implementing |

Do not choose “accept with polish” if any area is **BLOCKER**.

---

## 4. Review areas

For each area, assign **PASS**, **POLISH**, or **BLOCKER** using the criteria below.

### First Impression

| | Criteria |
|---|----------|
| **PASS** | Opening atlas + scroll to sector feels like one premium strategy product; player wants to tap a land within ~10 seconds. |
| **POLISH** | Strong overall; minor copy or spacing tweaks only. |
| **BLOCKER** | Feels like a dev grid, prototype, or unrelated UI skin; no emotional pull to claim. |

### 10,000 Lands Clarity

| | Criteria |
|---|----------|
| **PASS** | Copy/UI clearly states **100 × 100 = 10,000 lands** (full world) and **Sector A-01 = 216 visible lands** (starting window). Does **not** imply the 18×12 grid is the entire world. |
| **POLISH** | Scale is honest but one label could be clearer. |
| **BLOCKER** | Misleading scale (e.g. “10,000 lands” on the playable grid alone); player confusion about world size. |

### Atlas Quality

| | Criteria |
|---|----------|
| **PASS** | Atlas remains the visual benchmark; largely intact; sector highlight readable on desktop and mobile. |
| **POLISH** | Tiny atlas label or contrast tweak; no structural change needed. |
| **BLOCKER** | Atlas regressed, clipped badly on mobile, or sector highlight lost. |

### Playable Sector Visual Quality

| | Criteria |
|---|----------|
| **PASS** | Sector feels like **atlas came alive**: terrain masses, region overlays, rivers/routes/frontier lines, softened ownership grid — **not** a raw square table. Meaningful jump vs pre-v7. |
| **POLISH** | Clearly map-like; one layer (e.g. route weight, region border) could be stronger later. |
| **BLOCKER** | Still reads as flat spreadsheet/editor; only ~5% visual change; layers missing or grid dominates. |

### Tile Interaction

| | Criteria |
|---|----------|
| **PASS** | All 216 tiles clickable; selection obvious; **no hover scale, no selected scale, no tile escaping grid**; founder lands subtly distinct. |
| **POLISH** | Interaction works; marker size or contrast tweak deferred. |
| **BLOCKER** | Broken clicks, layout shift on select, scale/breakout animation, or unreadable selection. |

### Selected Land Panel

| | Criteria |
|---|----------|
| **PASS** | Desktop side panel: clear hierarchy (name, status, claim CTA); not wordy; updates on tile change. |
| **POLISH** | Copy or spacing polish only. |
| **BLOCKER** | Panel broken, stale, or hides claim path; desktop layout regression. |

### Claim Flow

| | Criteria |
|---|----------|
| **PASS** | Panel + mobile tray → same claim modal → persistence → dashboard; no duplicate logic; no crypto language. |
| **POLISH** | Modal copy or button label tweak. |
| **BLOCKER** | Claim fails, modal broken, tray blocks claim, or new wallet/token framing. |

### Dashboard Compatibility

| | Criteria |
|---|----------|
| **PASS** | After claim: Land ID (PN-xxxx), origin land name, region, terrain match selected tile; not “Awaiting Claim”. |
| **POLISH** | Minor display formatting. |
| **BLOCKER** | Persistence broken; placeholder after successful claim; wrong land identity. |

### Mobile `/world`

| | Criteria |
|---|----------|
| **PASS** | **No page-level horizontal overflow**; map scrolls inside container; claim tray accessible; tray timing correct (not on atlas-only view); full panel still available below. |
| **POLISH** | Tray padding or legend density tweak. |
| **BLOCKER** | Page overflow, tray always visible at top, claim unreachable, or map unusable on 390px width. |

### Visual Identity

| | Criteria |
|---|----------|
| **PASS** | Premium black/gold strategy tone; cinematic minimal copy; **no** crypto/NFT/wallet/mint/token/ETH language. |
| **POLISH** | One phrase or badge could align better with dashboard tone. |
| **BLOCKER** | Wrong genre (crypto, NFT grid, neon fintech); tone break vs rest of demo. |

### Technical Scope Control

| | Criteria |
|---|----------|
| **PASS** | Changes concentrated in agreed scope (`app/world/page.tsx`, map CSS, lib only if needed); no landing/dashboard/settlement redesign; no unjustified dependencies. |
| **POLISH** | Small unrelated diff noted for cleanup later. |
| **BLOCKER** | Scope creep across demo pages; new deps; unrelated refactors. |

### Build and QA

| | Criteria |
|---|----------|
| **PASS** | `npm run build` passes; `npm run qa:screens` run; world mobile/desktop captures updated; no obvious screenshot failures. |
| **POLISH** | QA capture naming or one non-critical frame angle. |
| **BLOCKER** | Build fails; QA not run for UI sprint; broken routes; missing world screenshots. |

---

## 5. Final scorecard

Copy this checklist per review session. Mark each cell **PASS** / **POLISH** / **BLOCKER**.

### Desktop

| Area | Score | Notes |
|------|-------|-------|
| First impression (atlas → sector) | | |
| 10,000 lands clarity | | |
| Atlas quality | | |
| Playable sector visuals | | |
| Tile interaction | | |
| Selected land panel | | |
| Claim flow | | |
| Visual identity | | |

### Mobile

| Area | Score | Notes |
|------|-------|-------|
| No page horizontal overflow | | |
| Map scroll in container | | |
| Claim tray timing & access | | |
| Selected tile visible | | |
| Full panel below map | | |
| Claim flow end-to-end | | |

### Technical

| Area | Score | Notes |
|------|-------|-------|
| Build passes | | |
| QA screenshots regenerated | | |
| Dashboard land persistence | | |
| Scope control (files touched) | | |
| No crypto language | | |

**Blocker count:** _____  
**Polish count:** _____ (document; do not auto-schedule v8)

---

## 6. Merge decision

Merge `cursor/world-map-v7-*` → `main` **only if all** are true:

- [ ] **No BLOCKER** scores in any area
- [ ] `npm run build` passes on the branch
- [ ] QA screenshots pass review (`mobile-world-*`, `desktop-world-*`, claim tray, sector, atlas)
- [ ] Claim flow verified manually once (select → claim → dashboard land ID)
- [ ] Mobile usable at 390×844 (no page overflow)

If any blocker remains after **one** fix pass → **reject sprint**, return to blueprint (§3).

POLISH items go to backlog or a future sprint — **not** a same-week v8 loop.

---

## 7. Anti-loop rule

After World Map v7:

1. **At most one blocker-fix pass** without returning to ChatGPT for a new decision.
2. **No endless v8 / v9 / v10 loops** for polish or “make it a bit better.”
3. If the sprint missed the bar structurally → **reject**, revise spec, re-plan Sprint 1 — do not iterate blindly.
4. POLISH feedback is logged in sprint notes; scheduled only when bundled with a new sprint goal.

ChatGPT + human own the post-v7 decision: merge, one fix pass, or blueprint reset.

---

## Related documents

- `docs/WORLD_MAP_V7_SPEC.md` — implementation spec
- `docs/NEXT_SPRINT_PLAN.md` — Sprint 1 scope
- `docs/CURSOR_TASK_TEMPLATE.md` — blocker-fix handoff format
- `docs/AI_COST_CONTROL_CODEX.md` — cost and stop rules
