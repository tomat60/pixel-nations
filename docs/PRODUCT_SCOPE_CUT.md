# Pixel Nations — Product Scope Cut

Strict definition of what Pixel Nations **must not build** before first user tests.

**Current goal:** A simple, premium **vertical slice** where the player understands and feels:

```text
land → city → nation → empire
```

---

## Do not build before first tests

| Category | Cut |
|----------|-----|
| **Economy** | Full economy, resources simulation, trading systems beyond demo stubs |
| **Combat** | Battles, units, war loops |
| **Diplomacy** | Diplomacy as a system (alliances as deep mechanics, treaties, AI relations) |
| **Multiplayer** | Real-time or async multiplayer, leaderboards with live backend |
| **Backend** | Production backend, real ownership registry, server-authoritative state |
| **Marketplace** | Buying/selling land between players |
| **Payments** | Checkout, subscriptions, paid land |
| **Web3** | NFT, wallet, mint, chain, token gating |
| **Customization** | Large avatar/building/cosmetic systems |
| **NPC kingdoms** | AI factions, simulated rival empires |
| **Full world map** | Full **10,000-tile interactive DOM** map (entire 100×100 clickable) |
| **Accounts** | Login, signup, password, OAuth |
| **Page sprawl** | Too many new routes/pages beyond the demo arc |
| **Landing** | Landing redesign without a **specific** strategic reason |
| **Process waste** | Vague polish loops (“make it better,” endless map v8/v9) |

**Waitlist:** Strategy and copy OK; **full waitlist implementation** (backend, email provider, CRM) is cut until after first tests unless explicitly scoped.

---

## Allowed before first tests

| Area | Allowed work |
|------|----------------|
| **`/world`** | World Map v7 — atlas + Sector A-01 playable sector |
| **Claim flow** | Select land, claim modal, mobile tray, persistence |
| **Land identity** | PN ID, name, region, terrain across demo state |
| **Dashboard** | Clarity of origin land, founder framing |
| **Settlement** | Create + page copy and continuity from claimed land |
| **Nation / Empire** | Demo arc polish, premium copy, identity continuity |
| **Mobile** | Usability, overflow, tray/modal access |
| **QA** | Build + `qa:screens`, public report review |
| **Docs / rules** | Specs, runbooks, product direction (this file) |

---

## Kill criteria

A feature is **cut** (not deferred politely — **killed** for this phase) if it:

1. **Increases scope** without supporting land → city → nation → empire
2. **Requires backend** before validation
3. **Smells like crypto** (wallet, mint, NFT, yield, digital real estate)
4. **Increases cost** (API, infra, deps) without validation
5. **Requires many prompts** — vague, unbounded agent iterations
6. **Distracts from World Map v7** — the current priority wow moment
7. **Is not needed before first user tests** — see `docs/NEXT_SPRINT_PLAN.md` Sprint 6 gate

When in doubt, apply `docs/PRODUCT_SIMPLICITY_DOCTRINE.md` anti-complexity checklist.

---

## World map honesty (in scope, not cut)

These are **required truth**, not scope creep:

- Full world: **100 × 100** lands, **10,000** total
- Playable demo: **Sector A-01**, **216 visible lands**
- Sector is a **window**, not the entire world

---

## After first tests

Revisit cuts with real feedback — bundled into **scoped sprints**, not ad-hoc feature adds. ChatGPT + human own reprioritization; Cursor executes handoffs.

---

## Simple first. Deep later.
