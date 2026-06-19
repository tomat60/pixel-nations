# Visual QA and Prompt Gate Protocol v0.1

Status: ACTIVE  
Owner: Product Lead / Visual QA Lead / Prompt QA Lead / Frontend Layout Lead / First-Time Tester Proxy / Cost-Control Lead  
Purpose: prevent repeated Cursor-driven visual regressions and stop visual bug loops before they consume budget.

## Why This Exists

Pixel Nations spent too much Cursor budget on a small landing map/frame issue. The root problem was not only CSS. The system failed in four places:

1. Screenshot evidence was treated as acceptance.
2. The assistant visually accepted too narrowly.
3. Cursor prompts were allowed before a strict diagnosis gate.
4. Merge proceeded without a public-preview visual gate.

This protocol turns those lessons into mandatory project rules.

## Core Rule

A visual/layout complaint is not an implementation request. It is a diagnosis gate.

The order is always:

1. Diagnose exact visible artifact.
2. Separate primary bug from secondary observations.
3. Decide: fix now, document as visual debt, or defer to future engine.
4. Prefer zero-Cursor deterministic patch.
5. Use Cursor only if the patch is too broad or unsafe.
6. Before merge, inspect public-preview / public QA evidence.
7. Smoke PASS never means visual PASS.

## Visual Work Classifications

Use one of these before implementation:

- BLOCKER: breaks first impression, trust, claim flow, or public demo credibility.
- FIX NOW: small, obvious, low-risk correction with clear acceptance criteria.
- VISUAL DEBT: visible imperfection accepted temporarily because fixing it now risks loop/cost.
- FUTURE ENGINE ISSUE: belongs to map/atlas/game engine, not current UI patch.
- DO NOT TOUCH: change would be cosmetic churn or budget waste.

## Prompt QA Gate

Before any Cursor prompt for visual/layout/UI work, the assistant must explicitly produce:

- Exact artifact being fixed.
- Exact likely file/component area.
- Do-not-change list.
- Layout invariants.
- Regression risks.
- Required screenshots/public-preview evidence.
- Rollback path.
- Cursor model and MAX setting.
- Cost risk.
- Stop condition.

Cursor prompt must be rejected if it says broad things like:
- “make it better”
- “polish the design”
- “improve the hero”
- “adjust layout as needed”
- “be creative”

Cursor is executor, not visual strategist.

## Visual QA Gate

A visual/layout change cannot be accepted unless all relevant checks pass:

- Text is not clipped.
- Image content does not bleed outside intended frame.
- Border/frame/image relationship is coherent.
- Important overlays have safe padding.
- Desktop first fold looks production-quality.
- Mobile first fold has no crop/overflow regression.
- Public QA report or preview is reachable when the branch is meant for public confidence.
- Any known issue is either fixed or explicitly classified as visual debt.

## Public Preview Rule

For visual work, local evidence is not enough when public presentation matters.

Preferred acceptance path:
- branch/preview exists,
- public QA report or preview URL is accessible,
- assistant inspects public evidence,
- visual verdict is written before merge.

If public preview is unavailable, visual merge is allowed only for:
- docs-only work,
- non-public internal changes,
- deterministic low-risk patches,
- emergency fixes with explicit rollback.

## Budget Rule

Cursor visual work is blocked by default.

Cursor can be used only when:
- Prompt QA gate passes,
- exact scope is known,
- deterministic patch was considered first,
- no broad creative redesign is allowed,
- cost risk is justified,
- at least 20% monthly Cursor budget remains reserved.

## Merge Rule

No merge after visual/layout work unless the assistant states:

- Visual QA verdict: ACCEPTED / REJECTED / VISUAL DEBT.
- Prompt QA verdict: PASS / NOT APPLICABLE.
- Technical QA: PASS / FAIL.
- Public evidence status: FRESH / STALE / NOT REQUIRED.
- Known issues created or updated.
- Stop condition met.
