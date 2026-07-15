# Pixel Nations — Play Route Source of Truth

`/play` is the **source-of-truth route** for the current Pixel Nations playable game.

## Current rule

All new gameplay, QA planning, Fable research, Cursor handoffs, and player-facing navigation must treat **`/play`** as the active product surface unless a later product decision explicitly changes this.

## Legacy routes

These routes are no longer active gameplay surfaces:

- `/world`
- `/dashboard`
- `/settlement`
- `/nation`
- `/empire`

They may exist only as compatibility redirects while the project transitions.

Do not build new features on those routes. Do not use old route docs as implementation instructions.

## Current demo truth

- Current demo: **Sector A-01 / Aurelian Basin**
- Full world promise: **10,000 lands**
- Current playable route: **`/play`**
- Core loop:

```text
land -> settlement/city -> nation -> empire -> consequence
```

## Agent rule

Before any Fable, Cursor, Codex, or other agent run, include this rule:

> `/play` is the current source-of-truth playable game. Legacy routes are redirects or archived context only.

If a prompt or document says to build on `/world`, `/dashboard`, `/settlement`, `/nation`, or `/empire`, treat that instruction as outdated unless the active GitHub issue explicitly reopens the route.

## QA rule

Current gameplay validation should prefer:

- `npm run lint`
- `npm run build`
- `npm run qa:smoke`
- `npm run qa:expansion`
- Pixel Nations Play Visual QA
- dedicated evidence scripts for new gameplay slices

## Product rule

Simple first. Deep later.

One land can become an empire.
