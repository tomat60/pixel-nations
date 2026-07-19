# Pixel Nations

**One land can become an empire.**

Pixel Nations is a player-built strategy world where every settlement, nation, and empire begins with one claimed piece of land. The current playable vertical slice takes place in **Sector A-01 / Aurelian Basin**, the first region of a planned 10,000-land world.

- **Live demo:** https://pixel-nations.vercel.app/play
- **Active gameplay route:** `/play`
- **Build Week track:** Apps for Your Life

## What the player does

The demo presents one continuous strategic arc:

```text
claim land → found a settlement → form a nation → declare an empire
→ survive a crisis → answer a rival → secure the frontier payoff
```

The player can:

- inspect and claim land on the local atlas;
- watch a camp grow into a functioning settlement;
- complete orders that visibly add roads, housing, food, storage, markets and institutions;
- establish a nation and declare an empire;
- respond to an imperial crisis and a rival counter-move;
- secure a persistent frontier reward that changes the world state.

The core promise is simple: **choose where your history begins, then make the world remember it.**

## OpenAI Build Week 2026

Pixel Nations existed as an early prototype before Build Week. During the submission period, the playable slice was substantially developed and hardened, including:

- a complete post-crisis rival and frontier-payoff loop;
- persisted, reload-safe and idempotent strategic outcomes;
- a compact shared HUD that gives the map and settlement more screen space;
- a redesigned illuminated-atlas local map with clear ownership, scouting, trade and rival pressure states;
- visible settlement progression and Village cohesion work;
- guarded agent workflows with bounded files, cost caps, preserved raw outputs and no automatic merges;
- automated gameplay evidence for the main vertical slice;
- repeated screenshot-based review that rejected visually incorrect changes even when CI was green.

The relevant Build Week work is visible in the repository history, especially the merged PR sequence around state, UI, QA and visual-polish issues.

## How GPT-5.6 and Codex were used

GPT-5.6 acted as the project's **co-creator, Product Lead, Creative Director, Technical Strategist and QA Lead**.

It did not merely generate isolated components. It managed the full development loop:

1. inspected the current repository and product source of truth;
2. selected the next highest-value product problem;
3. chose the appropriate execution tool;
4. wrote bounded implementation or design contracts;
5. delegated art-direction work to Fable and code patches to guarded executors;
6. reviewed generated diffs line by line;
7. inspected CI, Playwright evidence and real screenshots;
8. rejected unsafe, duplicated or visually misleading implementations;
9. repaired the automation pipeline when context, diff or artifact handling failed;
10. approved and merged only validated work.

Fable, the scoped executor, GitHub Actions and Playwright were **delegated tools inside the GPT-5.6-led workflow**. Their output was never accepted automatically.

The primary Codex `/feedback` Session ID is provided in the Devpost submission.

## Judge-friendly demo path

The fastest way to understand the project is the hosted `/play` route.

1. Open https://pixel-nations.vercel.app/play.
2. Use the local map to inspect and claim the highlighted starting land.
3. Switch to **Village** and complete the available settlement orders.
4. Observe the settlement scene change as structures and activity appear.
5. Continue through nation and empire formation.
6. Resolve the imperial crisis and rival response.
7. Secure the post-crisis frontier payoff and reload to confirm persistence.

No account or test credentials are required.

## Run locally

Requirements:

- Node.js 22+
- npm

```bash
git clone https://github.com/tomat60/pixel-nations.git
cd pixel-nations
npm install
npm run dev
```

Open http://localhost:3000/play.

## Validation

Build and lint:

```bash
npm run lint
npm run build
```

Useful focused checks:

```bash
npm run qa:smoke
npm run qa:village
npm run qa:world
npm run qa:expansion
```

Full local validation:

```bash
npm run pn:finish
```

GitHub pull requests also run Pixel Nations CI and the full Play Visual QA evidence workflow.

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Playwright-based gameplay and visual QA
- localStorage-backed deterministic demo state

The current demo intentionally avoids a backend, accounts, payments, multiplayer and a full simulation engine. The goal is a clear and convincing vertical slice before expanding the system.

## Product scope

Pixel Nations is not a crypto, NFT, token, wallet or pay-to-win project.

The current product loop is:

```text
land → settlement/city → nation → empire
```

The full world is designed as a 100 × 100 grid containing 10,000 lands. Aurelian Basin is the first bounded playable sector, not the entire world.

## Repository guidance

- Product source of truth: `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`
- One-page product brief: `docs/ONE_PAGE_PRODUCT_BRIEF.md`
- Product simplicity doctrine: `docs/PRODUCT_SIMPLICITY_DOCTRINE.md`
- Build Week orchestration note: `docs/contest-build-week-orchestration-note.md`

## Copyright

Copyright © 2026 Paweł Tomczak. All rights reserved unless explicitly stated otherwise.