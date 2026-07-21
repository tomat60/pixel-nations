# Pixel Nations — Godot runtime foundation

This directory is the new game runtime defined by `docs/ADR_001_GODOT_DESKTOP_FIRST.md`.

## Pinned engine

- Godot **4.7.1 Standard**
- GDScript
- Compatibility renderer

The existing Next.js `/play` route remains frozen as behavioral reference and rollback during migration.

## Sprint 1 scope

This foundation proves only:

- deterministic engine-neutral action replay;
- claim land → found settlement → complete one Village order;
- idempotent order completion;
- JSON save/load round trip;
- native desktop export;
- web export from the same project.

The bootstrap screen is not a visual direction or game-art milestone.

## Local validation

Set `GODOT` to the pinned executable if it is not on PATH.

```bash
export GODOT=Godot_v4.7.1-stable_linux.x86_64

$GODOT --headless --path game --editor --quit
$GODOT --headless --path game --script res://tests/run_all.gd
mkdir -p game/build/linux game/build/web
$GODOT --headless --path game --export-release "Linux/X11" build/linux/pixel-nations-foundation.x86_64
$GODOT --headless --path game --export-release "Web" build/web/index.html
```

Run the native proof from the artifact directory so the executable resolves its adjacent `.pck`:

```bash
cd game/build/linux
./pixel-nations-foundation.x86_64 --headless
```

## Golden fixture

`../migration/golden_run_v1.json` is the engine-neutral canonical migration contract. Godot imports an identical mirror at `tests/fixtures/golden_run_v1.json`; CI performs a byte-for-byte comparison before running the state tests so the runtime fixture cannot drift from the canonical source.

## Acceptance boundary

Sprint 1 does not pass merely because files exist or CI is green. The headless test output and exported artifact must be inspected. Any generated `.godot/` or `build/` content must remain untracked.
