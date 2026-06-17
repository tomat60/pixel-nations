# Empire v0.2 Implementation Brief

Status: READY FOR IMPLEMENTATION BRIEF  
Date: 2026-06-17  
Depends on: Nation v0.2 Baseline Lock  
Target stage: land → settlement/city → nation → empire

## Purpose

Empire v0.2 is the next gameplay layer after the accepted Nation v0.2 baseline.

The goal is not to create a complex empire simulator yet. The goal is to make the transition from nation to empire feel like a meaningful strategic identity choice rather than a static “Declare Empire” button.

Empire v0.2 must preserve the Pixel Nations doctrine:

> One land can become an empire. Simple first. Deep later.

## Product Decision

Empire v0.2 should introduce one clear player decision:

# First Imperial Direction

The player chooses what kind of empire their nation becomes.

This decision should be influenced by the player's earlier path and should create a visible identity, not just a larger number.

## Accepted Design Pattern

Empire v0.2 must follow the proven Nation v0.2 pattern:

1. One clear player decision
2. One recommendation based on previous path
3. One visible consequence
4. One identity change
5. One next objective

Do not implement Empire v0.2 as only a bigger success page.

## Imperial Direction Options

### 1. Crown Empire

Type: Legitimacy-Led Empire  
Theme: order, legitimacy, controlled rule  
Recommended for: Crown Rule, Civic Mandate, crown-heavy alliance path

Player fantasy:
The nation becomes an empire by claiming lawful authority and turning its capital into the symbolic center of rule.

Suggested bonus:
+ Imperial Legitimacy

Suggested identity:
The empire expands through law, banners, ceremonies, and controlled succession of power.

Suggested outcome:
- Higher influence
- Higher political authority
- Moderate lands controlled
- Status: Crown Emperor / Crown Empire Founder

### 2. Trade Empire

Type: Route-Led Empire  
Theme: wealth, routes, influence, soft power  
Recommended for: Free Cities, Trade Compact, market/trade route path

Player fantasy:
The nation becomes an empire by controlling exchange, trade routes, ports, markets, and commercial dependency.

Suggested bonus:
+ Imperial Trade Reach

Suggested identity:
The empire expands by making neighbors depend on its roads, markets, contracts, and resource flow.

Suggested outcome:
- Higher population/economy
- Higher route influence
- Moderate political authority
- Status: Trade Emperor / Trade Empire Founder

### 3. Frontier Empire

Type: Expansion-Led Empire  
Theme: land pressure, settlement growth, border momentum  
Recommended for: Iron Pact, Sovereign Command, defense/industrial path

Player fantasy:
The nation becomes an empire by pushing beyond old borders, founding new settlements, securing land, and creating expansion momentum.

Suggested bonus:
+ Frontier Expansion

Suggested identity:
The empire expands through settlement pressure, secured borders, frontier ambition, and controlled risk.

Suggested outcome:
- Higher lands controlled
- Higher defense/expansion identity
- Moderate influence
- Status: Frontier Emperor / Frontier Empire Founder

## Recommendation Logic

The recommended imperial direction should come from the existing player state.

Recommended mapping:

- If nation doctrine is Trade Compact → recommend Trade Empire.
- If nation ideology is Free Cities → recommend Trade Empire.
- If trade route or alliance contains market/trade/commercial language → recommend Trade Empire.
- If nation doctrine is Sovereign Command → recommend Frontier Empire.
- If ideology is Iron Pact → recommend Frontier Empire.
- If alliance or focus contains defense/industrial/border language → recommend Frontier Empire.
- Otherwise recommend Crown Empire.

The recommendation label should read:

Recommended by your path

This phrase worked in Nation v0.2 and should remain consistent.

## State Fields

Add only the minimum necessary fields to SettlementState:

- empireDirectionId
- empireDirection
- empireDirectionBonus
- empireDirectionIdentity
- imperialReach

Use existing empire fields where possible:

- empireFounded
- empireName
- empireDoctrine
- worldInfluence
- victoryStatus

Do not create a full empire policy system yet.

## Empire Create Page Requirements

The `/empire/create` page should include:

1. Empire Name
2. First Imperial Direction
3. Recommendation label
4. Expected Outcome
5. Declare Empire
6. Clear success state after founding
7. Option to review imperial direction
8. Option to start fresh demo path if needed

Suggested visible structure:

- Step 1 — Name Your Empire
- Step 2 — Choose First Imperial Direction
- Step 3 — Expected Imperial Identity

The player must immediately understand that empire formation is a strategic decision.

## Empire Page Requirements

The `/empire` page should display:

- Empire name
- Imperial direction
- Direction bonus
- Imperial identity
- World influence
- Victory status
- Why This Empire Works
- Demo Complete feedback CTA remains visible

The “Why This Empire Works” section should connect:

- land origin
- settlement focus
- trade route
- alliance
- nation ideology
- governing doctrine
- imperial direction

The empire should feel like the culmination of the full demo path.

## UX Safety Rule

If the player has already founded an empire, `/empire/create` must not hide the mechanic without explanation.

The founded state must provide:

- Enter Empire
- Review Imperial Direction
- Start Fresh Demo Path

This mirrors the Nation v0.2 UX safety patch and prevents tester confusion.

## Do Not Do Now

Do not add:

- Multiplayer
- AI empires
- War simulation
- Real-time expansion
- Full diplomacy
- Full economy
- Dozens of imperial policies
- Backend persistence
- Crypto, NFT, wallet, token, mint, or pay-to-win mechanics
- Complex sliders or spreadsheets
- More than three imperial directions

## Quality Bar

Empire v0.2 is accepted only if:

- The choice is visible above the fold or clearly reachable.
- The recommendation makes sense.
- The outcome changes based on the chosen direction.
- The empire identity is readable and emotionally satisfying.
- The player feels the full path from one land to empire.
- Manual test confirms the user can understand the decision without devtools or explanation.

## QA Requirements

Run:

- npm run build
- npm run qa:smoke
- npm run qa:screens
- npm run qa:smoke
- npm run pn:handoff

Smoke must remain PASS 9/9 or be intentionally updated if the flow changes.

Manual QA must check:

1. Fresh demo path
2. Existing empire-founded state
3. Review imperial direction
4. Start fresh demo path
5. Empire page identity
6. Demo complete feedback CTA

## Implementation Recommendation

Use a scoped package/script or Cursor UI only after this brief is accepted.

Preferred tool for implementation:

- Cursor UI GPT-5.5 Medium
- MAX OFF
- One branch only
- One sprint only

Do not use open-ended agent work.

If implementing manually through packages, keep the patch focused on:

- app/lib/settlement-state.ts
- app/empire/create/page.tsx
- app/empire/page.tsx
- public/qa/latest outputs

## Stop Condition

Empire v0.2 implementation stops when:

- branch is clean
- smoke is PASS
- handoff is generated
- manual user review confirms the choice is visible, understandable, and engaging

Only then merge to main and create:

docs/EMPIRE_V0_2_BASELINE.md
