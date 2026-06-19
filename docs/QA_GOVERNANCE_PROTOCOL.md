# Pixel Nations QA Governance Protocol

Status: ACTIVE PROJECT RULE
Date: 2026-06-17
Applies to: all future Pixel Nations implementation, design, QA, and merge decisions

## Why This Exists

A manual tester found a mobile landing-map issue that automated smoke tests and screenshot-based approval did not stop.

This is now a project-level rule:

> Manual user confusion and real tester feedback override automated QA, screenshot reports, and assistant confidence.

Pixel Nations is treated as a project of life. Small visual/UX misses are not acceptable when they affect first impression, public demo credibility, or tester trust.

## Non-Negotiable QA Hierarchy

Use this order of truth:

1. Manual user/tester report
2. Direct product/UX reasoning
3. Visual/mobile QA review
4. Automated smoke test
5. Screenshot report
6. Code-level correctness

A smoke PASS never means a sprint is product-approved.

A screenshot report never means a sprint is visually-approved unless the screenshots are actually inspected and the manual experience is coherent.

## Required Virtual Review Team

Before accepting any gameplay, map, landing, mobile, or public-demo sprint, the assistant must silently review the result through these roles:

- Product Lead
- UX Director
- Mobile QA Lead
- Visual QA Lead
- Game Designer
- Frontend Lead
- Design Department
- External First-Time Tester Proxy
- Cost-Control Lead
- Business/Fundraising Lead

The assistant must make the final recommendation after this review.

Cursor is executor, not strategist.

## Public Demo Acceptance Gates

A sprint is not accepted until these gates are considered:

### Mechanical Gate

- Build passes.
- Smoke passes.
- Handoff is generated.
- Branch is clean and pushed.

### Product Gate

- The player understands what changed.
- The core flow remains land → city → nation → empire.
- The change improves clarity, engagement, or strategic identity.
- It does not overbuild the system.

### UX Gate

- The primary action is visible.
- The player can recover from already-completed demo state.
- No core mechanic is hidden behind localStorage state.
- No devtools knowledge is required.

### Visual Gate

- Mobile is checked separately from desktop.
- Landing page first impression is checked separately from inner game screens.
- Important text is not clipped.
- Important map/UI content is not cropped in a way that damages comprehension.
- Scroll and layout are smooth on mobile.
- `public/qa/latest/handoff.txt` and `handoff.json` must report QA evidence status as `FRESH` before visual/mobile acceptance.

If QA evidence status is `STALE`, `MISSING`, or `UNKNOWN`, Virtual QA cannot fully accept visual/mobile work unless the user uploads current screenshots or a current review bundle directly into ChatGPT for manual inspection.

Public QA evidence cannot be used for Virtual QA acceptance unless the public report, public handoff TXT, and public handoff JSON are reachable after deploy, and the public report timestamp matches or is not older than the current QA evidence window. If public evidence is stale, missing, or unreachable, the user must upload the current bundle directly into ChatGPT for manual inspection.

### First-Time Tester Gate

- A friend/tester who does not know the project should not immediately spot an obvious layout flaw.
- If they do, that issue outranks screenshot-based approval.

## Mobile Map Rule

The landing-page map and the playable world map must not be accepted merely because they appear in screenshots.

They must be judged by first-impression usability:

- Is the map readable?
- Is important content clipped?
- Does the map feel intentionally framed?
- Can the player understand what is selectable?
- Does mobile framing damage the product promise?
- Is the interaction obvious enough?

If the map is draggable but the default view is badly cropped, that is still a UX issue.

## Communication Rule

After any strategic decision or handoff review, the assistant should state:

- What happened
- Result: accepted / rejected / pending
- Next concrete step
- Which tools are allowed or blocked
- Stop condition

## Review Upload Bundle Rule

Future review/debug packages should create one upload bundle whenever possible: one folder or one `.zip` that includes the handoff, relevant screenshots, and review `.txt`/`.json` files. Avoid asking the user to hunt for many separate files.

## Merge Rule

Do not merge a feature only because:

- smoke passed
- screenshots generated
- branch is clean
- Cursor says it is done

Merge only after product acceptance.

## When to Stop Coding

Stop coding and create/adjust a brief when:

- A visual issue survives multiple passes
- The user reports confusion
- A first-time tester catches a basic problem
- The assistant is relying on smoke/screenshots instead of product judgment

## Current Known Lesson

Nation v0.2 succeeded because manual review caught hidden-state confusion before merge.

Future systems must include review/reset paths when demo progress can hide core mechanics.

## Current Known Risk

Mobile map presentation on the landing page and playable map requires dedicated review before public/demo polish can be considered strong.

This is not necessarily the next implementation task, but it is now a known quality risk and must not be forgotten.


## Continuous Operating-System Audit Rule

Pixel Nations must regularly review and improve its own project operating system.

When repeated friction appears in QA, Cursor use, budget, screenshots, handoffs, or user confusion, stop normal sprinting and audit the process before continuing feature work.

This protects quality, speed, and cost control.

