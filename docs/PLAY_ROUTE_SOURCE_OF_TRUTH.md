# Play route source of truth

`/play` is the source-of-truth route for the current Pixel Nations playable game.

Legacy routes may exist only as compatibility redirects while the project is in transition:

- `/world`
- `/dashboard`
- `/settlement`
- `/nation`
- `/empire`

They must not be treated as active gameplay surfaces for new implementation, Fable runs, Cursor prompts, QA planning, or player-facing navigation.

New gameplay work should target `/play` unless a product decision explicitly changes the source of truth.

The current demo remains Sector A-01 / Aurelian Basin, and the core loop remains:

land -> settlement/city -> nation -> empire.
