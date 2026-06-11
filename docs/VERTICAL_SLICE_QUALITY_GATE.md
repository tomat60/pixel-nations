# Pixel Nations — Vertical Slice Quality Gate

Defines when Pixel Nations is **ready for first user testing**.

Do **not** invite external users until this gate is evaluated honestly — not when the demo merely “works.”

---

## Prerequisite: World Map v7 wow

**Do not test with external users** before World Map v7 creates a real **“wow”** moment on `/world`.

If the playable sector still feels like a spreadsheet or the atlas and sector feel like different products → **RED** for World Map; stop external testing planning.

---

## Minimum vertical slice

First user tests require this path to exist and feel coherent:

| # | Step |
|---|------|
| 1 | Landing page |
| 2 | World Map (`/world`) |
| 3 | Claim land |
| 4 | Dashboard after claim |
| 5 | Create settlement |
| 6 | Settlement page |
| 7 | Create nation |
| 8 | Nation page |
| 9 | Create empire |
| 10 | Empire page |
| 11 | Mobile usability (core flow) |
| 12 | QA report (`public/qa/latest/`) |

The user must understand without coaching:

```text
land → city → nation → empire
```

---

## Readiness scale

| Level | Meaning |
|-------|---------|
| **RED** | Do not test (internal or external) |
| **YELLOW** | Internal / trusted testers only (team, friends who accept rough edges) |
| **GREEN** | First small **external** test (3–5 neutral users) |

A area can be YELLOW while another is RED — **overall gate = worst color** for external tests.

---

## Gate criteria by area

### Landing page

| | Criteria |
|---|----------|
| **RED** | Unclear what the product is; crypto/NFT vibes; broken CTA to demo |
| **YELLOW** | Fantasy understandable; demo entry works; copy still rough |
| **GREEN** | Premium tone; “choose where history begins” clear in &lt;10s; strong path to `/world` |

### World Map

| | Criteria |
|---|----------|
| **RED** | Spreadsheet grid; misleading 10k scale; atlas regressed; not exciting |
| **YELLOW** | Map-like but weak wow; honest scale with one confusing label |
| **GREEN** | Atlas + Sector A-01 feel like one world; wow moment; 216 vs 10,000 honest |

### Claim land

| | Criteria |
|---|----------|
| **RED** | Claim broken; feels like paid/crypto purchase; persistence fails |
| **YELLOW** | Claim works; modal/tray friction; dashboard identity minor gaps |
| **GREEN** | Natural founder moment; mobile tray works; land persists correctly |

### Dashboard

| | Criteria |
|---|----------|
| **RED** | “Awaiting Claim” after claim; no origin land identity |
| **YELLOW** | Land shown but hierarchy weak |
| **GREEN** | PN ID, name, region, terrain clear; founder framing premium |

### Settlement

| | Criteria |
|---|----------|
| **RED** | Disconnected from claimed land; confusing create flow |
| **YELLOW** | Works; copy generic |
| **GREEN** | Feels like founding history from **their** land |

### Nation

| | Criteria |
|---|----------|
| **RED** | Unclear why nation exists; breaks arc |
| **YELLOW** | Milestone feels thin |
| **GREEN** | Clear strategic step; identity from land/city carries through |

### Empire

| | Criteria |
|---|----------|
| **RED** | Anticlimactic; overpromises; placeholder |
| **YELLOW** | Satisfying enough for demo end |
| **GREEN** | Demo climax; future fantasy clear without fake features |

### Mobile

| | Criteria |
|---|----------|
| **RED** | Page horizontal overflow; claim unreachable; broken layout on 390px |
| **YELLOW** | Usable with minor polish issues |
| **GREEN** | Core flow usable; tray/modal OK; QA mobile captures clean |

### Technical stability

| | Criteria |
|---|----------|
| **RED** | Build fails; broken routes; no QA run for UI sprint |
| **YELLOW** | Build passes; minor non-blocking issues |
| **GREEN** | Build passes; QA reviewed; no broken demo routes |

### No crypto confusion

| | Criteria |
|---|----------|
| **RED** | Wallet/token/mint/NFT language; “buy land” framing |
| **YELLOW** | One ambiguous phrase testers might misread |
| **GREEN** | Consistent strategy/founder language; no crypto confusion in tests |

---

## Overall gate decision

| Overall | Rule |
|---------|------|
| **RED** | Any critical area RED → no external tests |
| **YELLOW** | No RED; at most YELLOW in non-critical areas → trusted internal only |
| **GREEN** | All critical areas GREEN; World Map + Claim + Mobile + No crypto = GREEN → external 3–5 user script |

**Critical areas for external test:** World Map, Claim, Mobile, No crypto confusion, Technical stability.

---

## Checklist before scheduling first external test

- [ ] World Map v7 merged and rubric passed (`docs/WORLD_MAP_V7_REVIEW_RUBRIC.md`)
- [ ] Sprint 2–4 polish complete or explicitly waived with YELLOW acceptance
- [ ] `npm run build` passes on `main`
- [ ] QA report reviewed
- [ ] `docs/FIRST_USER_TEST_SCRIPT.md` printed / ready
- [ ] 3–5 testers scheduled; no product lecture before test

---

## Ready statement

Pixel Nations is ready for **first external users** when the first **3 minutes** make someone feel:

> **“This is a strategy world that is just beginning, and I want a place in it.”**

Not: “I bought a tile.” Not: “This is Web3.” Not: “I’m not sure what to do.”

---

## Related documents

- `docs/FIRST_USER_TEST_SCRIPT.md`
- `docs/WORLD_MAP_V7_REVIEW_RUBRIC.md`
- `docs/NEXT_SPRINT_PLAN.md` (Sprints 5–6)
- `docs/PRODUCT_SCOPE_CUT.md`
- `docs/ONE_PAGE_PRODUCT_BRIEF.md`
