# Prototype v0.19 — Legacy Extension Cleanup Map

## Purpose

v0.19 retires the old live `play.html` extension chain from the browser page and replaces it with a cleaner unified layer.

The old scripts remain in the repository for reference, but they are no longer loaded by the live v0.19 board-game page.

## Live v0.19 script stack

```text
game-data.js
v017-data-loader.js
play.js
v019-unified-engine.js
v019-controls.js
```

## Retired from live board-game loading

```text
play-cycle.js
play-guard.js
play-restart.js
play-polish.js
play-share.js
play-content.js
play-daily.js
play-chaos.js
play-spectacle.js
play-readiness.js
v018-hardening.js
v018-qa-finalizer.js
```

## Why this was necessary

The old extension files were built across several prototype phases and relied on earlier assumptions:

- three stats instead of four
- old character names such as `Crypto Bro` without `The`
- old deck names such as `Global Chaos`, `Hidden Hand`, and `Media Meltdown`
- old board lengths and year mapping
- multiple chained monkey patches of the same functions
- duplicate render overrides
- duplicate export/share/restart logic

This made v0.17/v0.18 increasingly fragile.

## What moved into `v019-unified-engine.js`

- four-stat player rendering
- held Survival card UI
- Normie reroll before space resolution
- Normie redraw before card resolution
- Panic / Control / Market display
- Quick Start Chaos
- Daily Chaos
- simplified chaos dashboard
- card reveal overlay
- breaking-news overlay
- landing moment overlay
- winner certificate
- export notes
- browser smoke test harness

## What moved into `v019-controls.js`

- header Restart Game button
- header Flip Board & Restart button

## What remains in `play.js`

`play.js` is still the core rules engine and source of truth for:

- setup rendering
- player creation
- base state storage
- turn order
- rolling and moving
- space resolution
- card draw basics
- stat deltas
- meter collapse logic
- NPC Mode
- Red Cycle / Blue Cycle modifiers

## Next cleanup decision

After a full manual browser playthrough, decide whether to:

1. move retired scripts into an `archive/legacy-play/` folder, or
2. delete them once their migrated behavior is verified.

Do not delete them before a full manual playthrough confirms that v0.19 covers all desired behavior.
