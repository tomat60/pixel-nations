# Public Demo Readiness Review v0.2

Status: REVIEW GATE
Date: 2026-06-18
Project: Pixel Nations
Scope: public demo readiness after gameplay spine v0.2 and mobile map framing v0.1

## Purpose

This review decides whether Pixel Nations is ready for a small external testing round, or whether one more focused polish sprint is required first.

This is not a feature sprint. The goal is to protect first impression, demo clarity, and product credibility before showing the game to more people.

## Current Accepted Baselines

The current public demo includes the accepted v0.2 gameplay spine:

- land claim
- settlement/city path
- settlement focus
- trade route choice
- alliance choice
- nation ideology
- governing doctrine
- first imperial direction
- demo completion / feedback CTA

Current locked baselines and governance:

- World Map v9 baseline
- Gameplay Vertical Slice v0.2 baseline
- Nation v0.2 baseline
- Empire v0.2 baseline
- QA Governance Protocol
- Mobile Map Framing known issue and v0.1 fix

## Review Team

Before any release/polish decision, evaluate through:

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

The assistant makes the final recommendation after these perspectives.

## Non-Negotiable Rule

Manual user confusion and first-time tester feedback override:

- smoke PASS
- screenshot generation
- clean branch
- assistant confidence
- Cursor summary

Smoke passing means the demo is mechanically clickable. It does not mean the demo is ready.

## Readiness Checklist

### 1. Landing First Impression

Check mobile and desktop landing hero, map preview, primary CTA clarity, and whether “one land can become an empire” is obvious.

Pass criteria:

- no clipped text
- no broken map framing
- clear first action
- strong enough visual promise

### 2. First 60 Seconds

Check whether a new player understands:

- claim one land
- Sector A-01 is a demo sector, not the full 10,000-land world
- the next step after claiming
- why the chosen land matters
- how to continue toward settlement, nation, and empire

Pass criteria:

- no explanation from the creator is needed
- no devtools/localStorage knowledge is needed

### 3. World / Map Experience

Check:

- mobile World Atlas
- mobile Aurelian Basin sector
- selected land panel
- claim tray
- fit/zoom controls if present
- desktop world map
- no accidental-looking crop

Pass criteria:

- map looks intentional
- map is understandable
- selected state is usable
- first-time tester does not call it cropped or broken

### 4. Gameplay Spine

Check:

- settlement focus
- trade route
- alliance
- nation ideology
- governing doctrine
- empire direction

Pass criteria:

- each step has one clear decision
- each step has a visible consequence
- recommended path makes sense
- the player feels an identity forming

### 5. End State / Feedback

Check:

- empire completion state
- demo complete CTA
- feedback CTA
- ability to replay/reset where needed

Pass criteria:

- tester knows they finished the demo
- tester knows how to give feedback
- tester can understand the path they created

### 6. Mobile Quality

Mobile is not secondary. Check mobile separately for:

- landing
- world
- claim flow
- nation create
- empire create
- feedback/end state

Pass criteria:

- no obvious clipping
- no horizontal overflow
- no impossible-to-use core flow
- no “this looks broken” first impression

## Blockers

A blocker is any issue that would make a first-time tester think:

- the project is broken
- the map is accidentally cropped
- the core flow is unclear
- the demo ends without explanation
- the UI hides a core mechanic
- the product feels less serious than the idea

Blockers must be fixed before broader testing.

## Non-Blockers

These are acceptable for a small tester round:

- placeholder economy depth
- limited world shown as Sector A-01
- no backend persistence
- no multiplayer
- no AI nations
- no full combat/economy
- limited art asset set
- simple resource/stat model

The demo is allowed to be small. It is not allowed to be confusing or obviously broken.

## Decision Framework

After review, choose exactly one:

### A — Ready for 3–5 External Testers

Use this if first impression is clean, mobile and desktop are acceptable, gameplay spine is understandable, and no obvious visual blockers remain.

Next step:
Prepare a tester script and feedback message.

### B — One Focused Polish Sprint First

Use this if the demo is mostly strong but one or two scoped quality risks remain.

Next step:
Create one polish sprint brief with narrow scope.

### C — Blocked

Use this if a core flow is unclear, a serious mobile/layout issue remains, or the demo cannot be understood without explanation.

Next step:
Stop feature work and fix the blocker.

## Required Evidence

Future readiness review should collect one review bundle, not scattered files.

Bundle should include:

- handoff.txt
- QA report
- landing mobile screenshots
- world mobile screenshots
- desktop critical screenshots
- first-time tester notes if available

## Current Recommendation Before Review

Default expected decision is likely:

B — One Focused Polish Sprint First

Reason:
The gameplay spine is now strong, but the project should still pass a deliberate public-demo readiness review before asking more external testers.

Do not assume readiness only because recent branches passed smoke.

## Stop Condition

This review is complete when the repository contains this document and the next decision is recorded in chat:

A — tester round
B — focused polish sprint
C — blocked

## Superseding Decision — Virtual QA Only Before First Final Playable Version

Human external testing is paused for now.

The previous readiness framework allowed a possible decision of showing the demo to 3–5 external testers. That option is now superseded by the user's strategic decision:

> No human testers until the game has a stronger playable engine / first final version and there is a meaningful reason for players to register, return, and participate in longer-term gameplay.

Until then, readiness review should use:

- virtual tester team review
- project-owner manual review
- screenshot/contact-sheet review
- structured assistant-led QA
- technical smoke/build/handoff checks

The decision framework is updated:

### A — Ready for Virtual QA Signoff

Use this if first impression is clean, mobile and desktop are acceptable, gameplay spine is understandable, and no obvious visual blockers remain.

Next step:
Prepare the next focused product sprint or internal demo package.

### B — One Focused Polish Sprint First

Use this if the demo is mostly strong but one or two scoped quality risks remain.

Next step:
Create one polish sprint brief with narrow scope.

### C — Blocked

Use this if a core flow is unclear, a serious mobile/layout issue remains, or the demo cannot be understood without explanation.

Next step:
Stop feature work and fix the blocker.

Human testers remain blocked until explicitly reopened.
