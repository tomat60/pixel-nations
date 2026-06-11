# Pixel Nations — First User Test Script

Neutral script for the **first small user test** (3–5 people).

---

## When to run this test

Run **only after**:

- [ ] World Map v7 (wow moment, honest scale)
- [ ] Demo arc polish (claim → settlement → nation → empire continuity)
- [ ] Mobile usability on core flow
- [ ] QA report reviewed (`public/qa/latest/`)
- [ ] `docs/VERTICAL_SLICE_QUALITY_GATE.md` ≥ **YELLOW** overall; **GREEN** on World Map, Claim, Mobile, No crypto

Do **not** run if vertical slice gate is **RED**.

---

## Session setup

| Item | Detail |
|------|--------|
| **Group size** | **3–5** people |
| **Profile** | Neutral — not team, not crypto natives, not game devs if possible |
| **Device** | Mix mobile + desktop if you can |
| **Recording** | Notes only unless tester consents to screen record |
| **Facilitator** | One person observes; minimal talk |

---

## Facilitator rules

1. **Do not explain the product** before the test.
2. Do not defend design during the test.
3. Do not lead (“Isn’t the map cool?”).
4. Let them struggle **2–3 minutes** before a tiny hint — only if completely stuck.
5. Hint allowed: “Try clicking what draws you” — not “Go to World Map.”

---

## Tester instruction (Polish — say exactly)

> Przejdź demo tak, jakbyś trafił na tę stronę pierwszy raz. Po wszystkim powiedz, co według Ciebie to jest i co tu można robić.

**English equivalent (if needed):**

> Go through the demo as if you found this site for the first time. When you’re done, tell me what you think this is and what you can do here.

---

## What to observe (silent notes)

| Signal | Notes |
|--------|-------|
| Do they find and click **demo / world**? | |
| Do they understand **10,000 lands** (full world scale)? | |
| Do they understand **Sector A-01** vs full world? | |
| Do they **want** to click / claim land? | |
| Do they understand **claim** (founder, not purchase)? | |
| Is **land → settlement → nation → empire** clear? | |
| **Where do they get stuck?** | |
| Do they mention **crypto / NFT / wallet / mint** unprompted? | |

---

## Post-test questions (neutral order)

Ask open-ended first; do not lead.

1. **What do you think this product is?**
2. **What can you do here?**
3. **Did the map feel like a world?** (If they say “what map?” — note failure)
4. **Did you want to claim land?** Why or why not?
5. **Did claim feel paid, risky, crypto, or natural?**
6. **Was land → city → nation → empire clear?**
7. **What looked premium?**
8. **What looked cheap or placeholder?**
9. **Would you join early access?** (Do not describe waitlist mechanics first)

Optional probes **only if vague**:

- “What was unclear?”
- “What did this feel like?”
- “What would you do next if this were real?”

---

## What not to ask

| Avoid | Why |
|-------|-----|
| “Does the map look premium?” | Leading |
| “Do you like the black and gold design?” | Leading |
| “Isn’t this better than NFT games?” | Frames crypto |
| “Would you pay for land?” | Too early; biases monetization |
| “Did you understand our vision?” | Leading |

Prefer: **“What did this feel like?”** and **“What was unclear?”**

---

## Score each session (facilitator)

| Dimension | 1 (poor) – 5 (strong) |
|-----------|------------------------|
| Understood product | |
| Wanted to claim | |
| Map as world | |
| Arc clarity (land→empire) | |
| Premium feel | |
| Crypto confusion (5 = none) | |

---

## Decision after 3–5 tests

| Outcome | Decision |
|---------|----------|
| **RED** | Majority: confused product, crypto read, no claim desire, map not a world → **no external scale-up**; return to scoped sprints (World Map / copy / mobile) |
| **YELLOW** | Mixed signals; some wow, some stuck → **1–2 more trusted tests** after fixes; waitlist strategy only (`docs/LANDING_TO_WAITLIST_STRATEGY.md`) |
| **GREEN** | Majority: strategy world, wanted a place, claim natural, arc clear, minimal crypto mentions → **approve small waitlist planning**; log top 3 fixes as POLISH backlog |

Document: test date, device, scores, quotes, RED/YELLOW/GREEN decision.

---

## After GREEN only

- Turn top issues into `docs/CURSOR_TASK_TEMPLATE.md` tasks — **not** vague “improve everything.”
- Revisit `docs/VERTICAL_SLICE_QUALITY_GATE.md` before expanding beyond 5 testers.

---

## Related documents

- `docs/VERTICAL_SLICE_QUALITY_GATE.md`
- `docs/LANDING_TO_WAITLIST_STRATEGY.md`
- `docs/PRODUCT_SIMPLICITY_DOCTRINE.md`
