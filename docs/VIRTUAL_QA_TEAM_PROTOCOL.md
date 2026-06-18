# Pixel Nations Virtual QA Team Protocol

Status: ACTIVE PROJECT RULE
Date: 2026-06-18
Applies to: all future Pixel Nations QA, review, release-readiness, and sprint acceptance decisions

## Core Decision

Human external testers are paused for now.

Until Pixel Nations has a stronger playable engine, a more complete first final version, and a real reason for players to register, return, and participate in longer-term gameplay, testing will be performed by a controlled virtual tester team led by ChatGPT.

This does not mean quality standards are lower.

It means human tester time is conserved until the product can learn from real engagement, not just first-impression confusion.

## Why Human Testing Is Paused

Current Pixel Nations is still a public demo / prototype layer.

Human testers should not be used too early because:

- the game loop is not yet deep enough for long-term play
- registration/retention behavior cannot be measured meaningfully yet
- feedback may over-index on obvious prototype gaps
- asking people too early can waste attention and credibility
- the project needs disciplined internal QA before broader exposure

Human testing becomes valuable later when the game supports:

- meaningful ongoing gameplay
- account/registration flow
- persistence
- longer-term choices
- repeat sessions
- real feedback on engagement and retention

## Current QA Model

The default QA model is now:

# Virtual QA Team First

The assistant must simulate and command a dedicated virtual QA team before accepting major work.

This team should be adapted to the task, but the default roster is:

## 1. Product QA Lead

Checks whether the feature improves the product and supports the core promise:

> One land can become an empire.

## 2. First-Time Player Proxy

Reviews whether a player with no explanation understands what to do.

## 3. Confused User Proxy

Assumes the player misunderstands labels, misses hidden mechanics, and does not know devtools or project context.

## 4. Mobile QA Tester

Checks small-screen layout, clipping, horizontal overflow, touch usability, and first impression.

## 5. Desktop QA Tester

Checks desktop layout, visual hierarchy, and flow clarity.

## 6. Visual QA / Art Direction Reviewer

Checks whether the screen looks intentional, premium, and aligned with the Pixel Nations visual direction.

## 7. Game Flow Tester

Walks the full chain:

land → settlement/city → trade route → alliance → nation → empire

## 8. State/Replay Tester

Checks completed-state UX, review/reset paths, localStorage confusion, replay paths, and stale state.

## 9. Technical QA Tester

Checks build, smoke, screenshots, handoff, clean branch, changed files, and scope discipline.

## 10. Business/Fundraising Lens

Checks whether the current state would improve or hurt credibility if shown to a collaborator, investor, partner, or future player.

## Virtual QA Required Outputs

For meaningful visual/gameplay changes, the assistant must explicitly classify:

- accepted
- rejected
- technically accepted but UX pending
- visually accepted but technically pending
- blocked

The assistant must not call a sprint accepted only because smoke passed.

## Review Bundle Rule

Whenever screenshots or QA artifacts matter, the process should produce one upload bundle whenever practical.

The bundle should include:

- handoff.txt
- report.html
- relevant screenshots
- review notes or contact sheet
- any specific debug/review txt file

The user should not be asked to hunt through many files manually if a bundle can be generated.

## QA Evidence Freshness Rule

For visual, mobile, landing, map, or public-demo acceptance, the Virtual QA Team must check the `QA Evidence Freshness` section in `public/qa/latest/handoff.txt` or the `qaEvidenceFreshness.status` field in `public/qa/latest/handoff.json`.

Visual/mobile work cannot be fully accepted when evidence status is `STALE`, `MISSING`, or `UNKNOWN`, unless the user uploads current screenshots or a current review bundle directly into ChatGPT for manual inspection.

## Human Tester Freeze Rule

Do not recommend asking friends, public users, or external testers to test Pixel Nations until the user explicitly reopens that decision or the project reaches a stronger playable stage.

Allowed instead:

- virtual tester review
- manual user review by the project owner
- screenshot/contact-sheet review
- small internal QA matrices
- structured assistant-led critique

## When Human Testers Become Useful

Human testers may become useful after:

- the first final playable version exists
- core engine/game loop is stable
- players can register or persist progress
- there is a meaningful reason to return
- feedback can measure engagement, not just confusion
- the user explicitly approves a human testing round

## Merge Rule

A branch can be merged only after:

- technical QA passes
- virtual QA accepts the relevant screens/flows
- the user manually accepts if the change is visual, gameplay-critical, or public-facing
- known blockers are either fixed or explicitly deferred

## Stop Coding Rule

Stop coding and create a brief/review when:

- the same type of issue repeats
- a mobile visual issue survives multiple passes
- the assistant or Cursor misses an obvious user-visible defect
- review evidence is incomplete
- the scope starts expanding

## Current Priority

The immediate project priority after locking this protocol is:

# Public Demo Readiness Review with Virtual QA Team Only

No human tester round is recommended now.
