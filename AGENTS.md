<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know
This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pixel Nations — agent entrypoint

On 2026-10-24, the former full AGENTS.md guidance was relocated **verbatim** into scoped reference guides below. These rules are not weakened or superseded by a shorter index.

## Mandatory first checks
1. Run `npm run pn:status` where environment permits. If `AUTHORITY_STATUS=FAIL` or `BLOCKED_STALE_PROJECT_STATE`, stop product work and repair the authority chain instead.
2. Read `docs/PROJECT_CURRENT_STATE.md`, current active issue and the task-relevant accepted ADR. For changes in direction, read `docs/GAME_STRATEGY_MASTER_PLAN.md`.
3. Fetch fresh current main, PRs, exact-head tests/artifacts and real screenshots; historical PR/head examples are not current truth.
4. Authority: current state > accepted ADRs > root AGENTS and scoped guides > strategy master plan > active execution issue > proven merged evidence > QA/operating docs > older records.

## Standing product and safety requirements
- Pixel Nations is a **real interactive strategy game**, not a crypto/NFT product, dashboard or collection of concept images. Core journey: one player-created land can become an empire.
- Godot is the production incumbent. No Unity migration, speculative engine restart, static full-scene illustration replacement or paid tool until current accepted gating decisions authorize it.
- Build one biggest meaningful playable improvement at a time: actual pointer/game input, authored 3D scene/resource changes, spend, world/village continuity, persistence and save/re-entry.
- New art/visual approaches must be checked against real game pixels, desktop/mobile screenshots and interaction, not judged from descriptions, generated concepts or green CI. Avoid repeat cycles on a rejected technique.
- Protect donor licensing, owner IP, secrets, costs, branch/review/rollback gates, release proof and existing single steward. No new paid service or unsupported claims.
- A merged PR alone is not accepted gameplay. Verify Godot runtime path, fresh user journey and pre/post release evidence; distinguish technical pass from owner visual acceptance.

## Read detailed guides only when relevant
- Gameplay, engine, map, assets, product and milestones: `docs/agent-guides/GAME_PRODUCT_AND_ENGINE.md`
- **Any** code, CI, hosting, runner, assets, external service, PR or deployment change: `docs/agent-guides/SAFETY_AUTHORITY_AND_RELEASE.md`
- Godot implementation, scene diff, agent delegation, screenshot/video, postmerge QA: `docs/agent-guides/REAL_GAME_DELIVERY_QA.md`
- Strategy, market research, player metrics, monetization: `docs/agent-guides/PLAYER_AND_BUSINESS_EVIDENCE.md`

For cross-cutting tasks, consult each relevant guide. Do not duplicate state, issues, stewards or handoff files to compensate for a lack of product progress.

## OWNER-WIDE NON-NEGOTIABLE TYPOGRAPHY RULE (2026-10-27)

Apply to this project, its agents, Claude/Codex tasks and every authored output: emails, casting submissions, notifications, social posts, documents, UI labels, in-app text, design copy, generated artifacts and reports.

- NEVER emit Unicode long dash characters U+2012, U+2013, U+2014 or U+2015. Use ASCII hyphen-minus (U+002D), a comma, colon or full stop instead. This includes email subjects, email bodies, signatures, source code strings, templates and generated copy.
- Check the FINAL outgoing payload before any external send/publish or commit. If a forbidden character is present in authored text, correct it before continuing. An instruction alone is not validation; add deterministic lint and a regression test wherever the application sends or generates text.
- For pasted third-party/legal material, preserve the source internally when necessary, but do not put forbidden punctuation into our authored public copy. Never silently alter the meaning of legal text.
- Treat this rule as higher priority than editorial or design style preferences. Apply it also to new repositories at bootstrap, not only existing projects.
