# Pixel Nations — Landing to Waitlist Strategy

Strategy for adding a **waitlist** only **after validation** — not before the vertical slice proves the fantasy.

---

## Current decision

**Do not implement waitlist now.**

Waitlist is a **Phase 2** signal capture tool, not an MVP requirement. Building it early distracts from World Map v7 and the demo arc.

---

## Waitlist only after

All must be true (or explicitly waived with written YELLOW acceptance):

| Gate | Source |
|------|--------|
| World Map v7 wow | `docs/WORLD_MAP_V7_REVIEW_RUBRIC.md` |
| Coherent demo arc | land → city → nation → empire |
| Mobile usability | QA + manual 390px check |
| **3–5 user tests** with **YELLOW or GREEN** signal | `docs/FIRST_USER_TEST_SCRIPT.md` |
| **No strong crypto confusion** in tests | `docs/VERTICAL_SLICE_QUALITY_GATE.md` |

If tests read the product as NFT land sale → **fix positioning first**; no waitlist.

---

## Core positioning (waitlist and landing)

**One line:**

> A player-built strategy world where every city, nation, and empire begins with one claimed land.

Supporting messages:

- Choose where your history begins.
- Join the First Age.
- One land can become an empire.

---

## Waitlist CTA copy

### Best (primary)

**“Join the First Age”**

Frames era and founder myth — not SaaS signup.

### Alternative

**“Be notified before the first lands open”**

Honest scarcity of **lands in the world**, not “buy now.”

### Avoid — SaaS tone

- Subscribe
- Newsletter
- Sign up for updates
- Get the latest news

### Avoid — crypto tone

- wallet
- mint
- NFT
- token
- asset
- whitelist (unless carefully reframed as “early access list”)

---

## Placement strategy

**Recommended:** Waitlist CTA **after** the user understands world and fantasy.

| Good placement | Poor placement |
|----------------|----------------|
| After empire demo climax / “what’s next” | Hero-only before any context |
| End of landing scroll once world scale explained | Blocking “sign up first” wall |
| Post-demo return path (“save your founder interest”) | Pop-up on first second |

User should feel: *I want a place in this world* — then *Join the First Age*.

---

## Funnel events to measure (when implemented)

Track in analytics (privacy-respecting; no implementation in current phase):

| Event | Meaning |
|-------|---------|
| `landing_view` | Hit landing |
| `start_demo_click` | Entered demo path |
| `view_world_click` | Reached `/world` intent |
| `land_selected` | Tile selected |
| `land_claimed` | Claim completed |
| `settlement_created` | Settlement founded |
| `nation_created` | Nation founded |
| `empire_created` | Empire founded |
| `waitlist_joined` | Email / interest captured |

### Best signal

**User completes demo arc, then joins waitlist.**

Completion → waitlist is stronger than landing → waitlist alone.

Secondary: `land_claimed` → `waitlist_joined` if empire not reached in session.

---

## Implementation scope (future — not now)

When GREEN from user tests, minimal waitlist MVP might include:

- Single field (email) + First Age CTA
- Double opt-in if legally required
- Provider TBD (not in scope until approved)
- No wallet connect, no payment

**Do not** bundle waitlist with monetization or land sale.

---

## What not to do before validation

- Mailchimp/ConvertKit full integration without test signal
- Paid ads to waitlist
- “Reserve your land” (implies purchase)
- Tiered waitlist with price hints

---

## Related documents

- `docs/VERTICAL_SLICE_QUALITY_GATE.md`
- `docs/FIRST_USER_TEST_SCRIPT.md`
- `docs/MONETIZATION_STRATEGY.md`
- `docs/ONE_PAGE_PRODUCT_BRIEF.md`
- `docs/PRODUCT_SCOPE_CUT.md`
