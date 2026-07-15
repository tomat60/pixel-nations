# Pixel Nations — Product Scope Cut

Strict definition of what Pixel Nations **must not build** before first user tests.

**Current goal:** a simple, premium **vertical slice** on `/play` where the player understands and feels:

```text
land → settlement/city → nation → empire → consequence
```

## Current source of truth

- Active playable route: **`/play`**
- Current demo: **Sector A-01 / Aurelian Basin**
- Legacy routes are not active product surfaces: `/world`, `/dashboard`, `/settlement`, `/nation`, `/empire`
- See `docs/PLAY_ROUTE_SOURCE_OF_TRUTH.md`

## Do not build before first tests

| Category | Cut |
|----------|-----|
| **Economy** | Full economy, resource simulation, trading systems beyond demo-scale consequences |
| **Combat** | Battles, units, war loops |
| **Diplomacy** | Diplomacy as a system: alliances, treaties, AI relation simulation |
| **Multiplayer** | Real-time or async multiplayer, live leaderboards, server-authoritative shared world |
| **Backend** | Production backend, real ownership registry, accounts, auth, database |
| **Marketplace** | Buying/selling land between players |
| **Payments** | Checkout, subscriptions, paid land |
| **Web3** | NFT, wallet, mint, chain, token gating |
| **Customization** | Large avatar/building/cosmetic systems |
| **NPC kingdoms** | Simulated AI empires or autonomous world factions |
| **Full world map** | Full 10,000-tile interactive DOM map |
| **Accounts** | Login, signup, password, OAuth |
| **Page sprawl** | New active gameplay routes outside `/play` |
| **Landing** | Landing redesign without a specific route/product clarity reason |
| **Process waste** | Vague polish loops: “make it better,” “check everything,” endless v8/v9 map passes |

**Waitlist:** strategy and copy are OK; full waitlist implementation is cut until after first tests unless explicitly scoped.

## Allowed before first tests

| Area | Allowed work |
|------|--------------|
| **`/play`** | The full source-of-truth playable vertical slice |
| **Claim flow** | Select land, claim, enter village/settlement flow, persistence |
| **Settlement/city seed** | Make the origin land visibly become a settlement/city seed |
| **Nation / Empire** | Preserve and clarify the rise into nation and empire |
| **Crisis / rival consequence** | Bounded consequence-bearing decisions after empire finale |
| **Current objective** | Clear next-step guidance when player confusion appears |
| **Route hygiene** | Redirect or retire stale legacy pages that compete with `/play` |
| **QA** | Build, smoke, play visual QA, dedicated evidence scripts |
| **Docs / rules** | Product direction, source-of-truth rules, scoped sprint specs |

## Kill criteria

A feature is **cut** if it:

1. Increases scope without strengthening **land → settlement/city → nation → empire**
2. Requires backend before validation
3. Smells like crypto: wallet, mint, NFT, yield, digital real estate
4. Increases cost without increasing learning or product quality
5. Requires vague/unbounded agent exploration
6. Reopens stale legacy routes instead of improving `/play`
7. Is not needed before first user tests

When in doubt, apply `docs/PRODUCT_SIMPLICITY_DOCTRINE.md`.

## World map honesty

These remain required truths, but they must be expressed through `/play` unless a later product decision reopens a dedicated world route:

- Full world: **100 × 100** lands, **10,000** total
- Current playable demo: **Sector A-01 / Aurelian Basin**
- Sector is a **window**, not the entire world

## After first tests

Revisit cuts with real feedback — bundled into scoped sprints, not ad-hoc feature adds.

## Simple first. Deep later.
