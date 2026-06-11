# Pixel Nations — Next Sprint Plan

Concrete production plan for the next phase of Pixel Nations work. **One strong scoped sprint beats many small iterations.**

---

## Current Stable State

- **`main`** has: landing page, demo flow (claim → dashboard → settlement → nation → empire), QA handoff (`public/qa/latest/`), operating rules (`docs/PROJECT_OPERATING_RULES.md`, `.cursor/rules/`), world map spec (`docs/WORLD_MAP_V7_SPEC.md`), and cost-control docs (`docs/AI_COST_CONTROL_CODEX.md`, `docs/DESKTOP_AI_DECISION_TREE.md`).
- **Branch `cursor/world-map-v6-playable-sector`** exists as an experimental map branch — **do not merge without review** (build, QA, visual comparison to spec).
- **Current priority is not more small iterations.**
- **Current priority is preparing one strong World Map v7 implementation sprint** on a dedicated branch, then merging only when acceptance criteria pass.

---

## Sprint 1 — World Map v7

### Goal

Make `/world` the first true **“wow”** gameplay moment.

### Scope

- `/world` page (`app/world/page.tsx`, map-specific CSS if needed)
- Playable **Sector A-01**
- Selected land panel (desktop + mobile full panel)
- Mobile claim tray behavior
- Claim flow preservation

### Do

- Follow **`docs/WORLD_MAP_V7_SPEC.md`**
- Show full world as **100 × 100 / 10,000 lands** (atlas)
- Show playable map honestly as **Sector A-01 / 216 visible lands**
- Make playable sector feel like **the Atlas came alive** (terrain masses, region overlays, rivers/routes/frontier lines, softened ownership grid)
- Preserve claim persistence and dashboard land identity (`claimedLandId`, `claimedLandPnId`, name, region, terrain, etc.)
- Keep tiles clickable; contained selected/founder highlights; **no tile scale breakout**

### Do not

- Redesign landing page
- Modify unrelated demo pages (dashboard, settlement, nation, empire) unless routing compatibility requires it
- Install dependencies
- Run vague polish loops (“make map better”)
- Use crypto / NFT / wallet / token / mint language

### Acceptance criteria

- [ ] `/world` looks **meaningfully** better (not ~5% color tweak)
- [ ] Playable sector does **not** feel like a spreadsheet
- [ ] Atlas and playable sector feel like the **same world**
- [ ] Tile selection works (desktop + mobile)
- [ ] Claim flow works end-to-end; land persists to dashboard
- [ ] Mobile usable (no page overflow; tray/modal accessible)
- [ ] `npm run build` passes
- [ ] `npm run qa:screens` regenerated; `public/qa/latest/` committed
- [ ] Final report concise (changed files, build, QA, commit hash)

### Suggested branch

`cursor/world-map-v7-playable-sector`

---

## Sprint 2 — Claim to Settlement Polish

### Goal

After claiming land, the transition to settlement creation should feel like **founding history** — not a form on a generic page.

### Scope

- `app/dashboard/page.tsx`
- `app/settlement/create/page.tsx`
- `app/settlement/page.tsx`
- Copy and state continuity via `app/lib/claimed-land.ts` / `app/lib/settlement-state.ts` only if needed

### Do

- Carry **claimed land name, region, terrain, PN ID** through every step
- Premium black/gold copy; cinematic but minimal
- Remove confusing placeholder text after claim (“Awaiting Claim”, generic Aurelia defaults when real claim exists)

### Do not

- Change demo progression routes or unlock logic without explicit scope
- Redesign `/world` or landing in this sprint

### Acceptance criteria

- [ ] Claimed land name and identity carry through dashboard → settlement create → settlement
- [ ] Create settlement feels premium and intentional
- [ ] No confusing placeholder text when land is claimed
- [ ] Mobile usable on touched pages
- [ ] `npm run build` passes
- [ ] QA screenshots for touched pages if UI changed

---

## Sprint 3 — Nation Fantasy Polish

### Goal

Make creating a nation feel like a **major strategic milestone**, not a checkbox.

### Scope

- `app/nation/create/page.tsx`
- `app/nation/page.tsx`
- Alliance/trade pages **only if needed** for narrative continuity

### Do

- Tie nation founding to **origin land / settlement / region**
- Strong premium copy; clear “why now” for nation creation
- Consistent land → city → nation identity in headers and stats

### Do not

- Expand scope to empire or landing unless required for copy consistency

### Acceptance criteria

- [ ] Clear reason to create nation (demo progression + copy)
- [ ] Strong premium tone; no crypto language
- [ ] Land / city / nation identity consistent across nation pages
- [ ] Mobile usable
- [ ] Build passes; QA if UI changed

---

## Sprint 4 — Empire End-State Polish

### Goal

Make empire creation feel like the **end of the demo arc** — satisfying climax, clear future fantasy.

### Scope

- `app/empire/create/page.tsx`
- `app/empire/page.tsx`

### Do

- Reference **origin land** and arc (land → city → nation → empire)
- Empire page as demo **climax** — prestige, scope, “what comes next” without fake overpromising
- Premium visuals and copy aligned with dashboard/world tone

### Do not

- Promise features not in demo (multiplayer, live economy, wallet, etc.)

### Acceptance criteria

- [ ] Empire page feels like a satisfying demo climax
- [ ] Clear future fantasy (grand strategy MMO direction) without overpromising
- [ ] Origin land / nation identity visible where appropriate
- [ ] Build passes; QA if UI changed

---

## Sprint 5 — QA Gate

### Goal

Run **full QA** and review the public report before any external testing.

### Scope

- Landing `/`
- `/world`
- `/dashboard`
- `/settlement`, `/settlement/create`
- `/nation`, `/nation/create`
- `/empire`, `/empire/create`
- Mobile and desktop viewports
- `scripts/qa-screenshots.mjs` and `public/qa/latest/`

### Do

- `npm run build`
- `npx playwright install chromium` if needed
- `npm run qa:screens`
- Review `public/qa/latest/report.html` for regressions
- Fix blocking layout/route issues only (scoped bugfixes)

### Acceptance criteria

- [ ] Build passes
- [ ] Screenshots generated and committed
- [ ] No major mobile layout issues on core flow pages
- [ ] No broken routes in demo path
- [ ] No obvious placeholder sections in vertical slice
- [ ] Report published path documented in commit message or PR notes

---

## Sprint 6 — First User Testing Gate

### Goal

**Only after** the vertical slice feels coherent internally, invite a **small number** of testers (3–5).

### Prerequisites

- Sprints 1–5 acceptance criteria met
- `docs/AI_COST_CONTROL_CODEX.md` user-testing gate satisfied

### Test questions

1. Do they understand the fantasy? (10,000 lands, player-owned world, history they write)
2. Do they want to claim land?
3. Does the map feel exciting — atlas + playable sector?
4. Do they understand **land → city → nation → empire**?
5. Does it feel **premium** or placeholder?

### Do not

- Run broad public beta before fixing critical feedback from Sprint 5 QA
- Change product strategy based on one vague comment — log issues, batch into scoped sprints

### Acceptance criteria

- [ ] Test notes captured (spreadsheet or doc)
- [ ] Top 3 issues turned into scoped Cursor tasks via `docs/CURSOR_TASK_TEMPLATE.md`
- [ ] No “improve everything” follow-up prompts

---

## Execution notes

| Topic | Rule |
|-------|------|
| Prompts | Use `docs/CURSOR_TASK_TEMPLATE.md` for every Cursor run |
| Cost | See `docs/AI_COST_CONTROL_CODEX.md` — MAX OFF by default |
| Map work | `docs/WORLD_MAP_V7_SPEC.md` is authoritative for Sprint 1 |
| Commits | Experiments on `cursor/*`; merge to `main` only when build (+ QA if UI) passes |
| Strategy | ChatGPT/human define sprint; Cursor executes scoped handoff |

---

## Related documents

- `docs/WORLD_MAP_V7_SPEC.md`
- `docs/CURSOR_TASK_TEMPLATE.md`
- `docs/AI_COST_CONTROL_CODEX.md`
- `docs/PROJECT_OPERATING_RULES.md`
- `AGENTS.md`
