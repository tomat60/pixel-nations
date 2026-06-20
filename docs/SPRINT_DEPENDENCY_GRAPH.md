# Pixel Nations — Sprint Dependency Graph v1.0

Status: ACTIVE STRATEGY RAIL  
Purpose: prevent Cursor/agents from skipping required product dependencies.

## Rule

A sprint may only start when its prerequisites are satisfied. If a gate fails, the agent must stop and report instead of improvising.

## Dependency graph

```text
P0: Project status clean
  ↓
P1: Core loop clarity
  ↓
P2: Settlement foundation choice
  ↓
P3: City identity milestone
  ↓
P4: Connection layer: trade/alliance
  ↓
P5: Nation formation
  ↓
P6: Empire horizon
  ↓
P7: Visual/world polish
  ↓
P8: Cloud/headless agent execution
```

## Active gates

### P0 — Project status clean

Must pass:

- `npm run pn:status`
- clean git status
- public QA check pass

### P1 — Core loop clarity

Must not rebuild:

- full map system
- backend economy
- multiplayer
- crypto/NFT/wallet/token

Must improve:

- post-claim direction
- dashboard/settlement objective clarity
- visible path to nation/empire

### P2 — Settlement foundation choice

Requires P1.

Must implement one simple but meaningful settlement choice path. Do not add full simulation.

### P3 — City identity milestone

Requires P2.

Must show that settlement choices lead toward a city identity.

### P4 — Connection layer

Requires P3.

Must show at least one reason lands/cities interact: trade, alliance, route, pressure, or expansion.

### P5 — Nation formation

Requires P4.

Must connect nation identity to prior settlement/city decisions.

### P6 — Empire horizon

Requires P5.

Must show empire as reachable horizon, not as empty label.

### P7 — Visual/world polish

Requires P1 at minimum, preferably P3+.

Allowed earlier only for:

- severe first-impression bug
- broken responsive layout
- bug that blocks player comprehension

### P8 — Cloud/headless agent execution

Requires:

- strategy docs in repo
- clear branch policy
- CI gates
- cost limits
- rollback policy

## Agent stop conditions

The agent must stop if:

- build fails
- smoke fails
- screenshot QA fails on unclassified issue
- public QA fails after deploy sync window
- repo is dirty unexpectedly
- requirements conflict
- task requires product decision not covered by docs
- cost estimate exceeds approved budget tier
