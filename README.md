# 2020s: The Board Game

**Prototype v0.19 — Unified Browser Engine / Smoke-Test Cleanup**

A satirical survival board game and browser game prototype where players race from **2020 to 2030** while trying not to lose their **Sanity**, **Money**, **Freedom**, or **Influence**.

> Survive the decade without losing your mind, your money, your freedom, or your grip on reality.

## Live Prototype Site

```text
https://weswuy.github.io/2020s/
```

## Video Game Mode

```text
https://weswuy.github.io/2020s/video.html
```

The video game mode includes **Dystopia Run** and **Utopia Run**, character identity cards, event art placeholders, retro-futurist broadcast frames, comic-apocalypse texture, mode-specific visual styling, year-by-year event scenes, player choices, Timeline Health, previous-choice outcome feedback, run logs, and final timeline reports.

## Art Direction

```text
https://weswuy.github.io/2020s/art-direction.html
```

The visual language is **satirical retro-futurist news broadcast meets comic-book apocalypse**.

## Board Game Digital Playtest

```text
https://weswuy.github.io/2020s/play.html
```

`play.html` now redirects to the v0.19 unified live page:

```text
https://weswuy.github.io/2020s/play-v019.html
```

The v0.19 live play page uses a cleaner script stack:

```text
docs/game-data.js
docs/v017-data-loader.js
docs/play.js
docs/v019-unified-engine.js
docs/v019-controls.js
```

The old extension scripts from v0.4–v0.11 are no longer loaded by the live play page. They remain in the repository for reference, but their behavior has been migrated into the unified v0.19 layer.

## v0.19 Unified Browser Engine

v0.19 consolidates the browser playtest into one cleaner layer while preserving the comic-broadcast UI.

New files:

```text
docs/v019-unified-engine.js
docs/v019-controls.js
docs/play-v019.html
```

Still powered by the v0.16 source prototype data:

```text
data/prototype/characters-v0.16.csv
data/prototype/card-decks-v0.16.csv
data/prototype/board-spaces-v0.16.csv
```

### What v0.19 does

- Retires the old live extension stack from `play.html`
- Adds `play-v019.html` as the clean live board-game page
- Keeps `play.html` as a redirect for existing links
- Uses the existing v0.17 core rules engine
- Consolidates quick start, Daily Chaos, spectacle, share/export, smoke test diagnostics, held Survival cards, and Normie powers into `v019-unified-engine.js`
- Adds header Restart and Flip Restart wiring in `v019-controls.js`
- Keeps the four-stat model: Money, Sanity, Freedom, Influence
- Keeps Panic / Control / Market collapse meters
- Keeps NPC Mode when any stat reaches zero
- Adds a browser-side smoke test available from the setup screen and console via `window.v019QA.runSmokeTest(true)`

## v0.19 Smoke Test Coverage

The built-in smoke test validates:

- GAME object presence
- 6 characters loaded
- 60 board spaces loaded
- 20 cards each in Headline, Conspiracy, Survival, and Scandal decks
- Required DOM controls
- Required overlays
- Core function availability
- Normie player shape
- Prepper player shape

## Known v0.19 Constraints

This pass still does not replace real manual browser QA.

- I could not open a true remote DevTools console from ChatGPT, so the smoke test was implemented into the page itself instead.
- Complex card branches are still partly table-judgment based.
- Survival reaction timing is usable, but not fully rules-automated.
- `play-v019.html` is the clean v0.19 live page; `play.html` redirects there for compatibility.
- The old v0.4–v0.11 scripts are retired from live loading but not deleted yet.

## Core Tabletop Loop

On your turn:

1. Roll one six-sided die.
2. Move forward.
3. Resolve the board space.
4. Draw a card if instructed.
5. Make a choice if the card gives one.
6. Check Panic, Control, and Market meters.

If any player stat reaches 0, that player enters **NPC Mode** for one skipped turn, resets that stat to 2, and keeps playing.

No player elimination.

## Playtest Goal

Run a rough 20–45 minute test. The most important question:

> Did players laugh, make decisions, and want one more round?

## Recommended Next Tasks

1. Open `play-v019.html` and run `window.v019QA.runSmokeTest(true)` in the browser console.
2. Play a full 3-player game through 2030.
3. Check Quick Start, Daily Chaos, held Survival card use, Normie reroll/redraw, collapse meters, NPC Mode, finish, copy result, and export notes.
4. Convert the highest-frequency table-judgment choice cards into automatic branch buttons.
5. Decide whether the old retired extension files should be archived or deleted.

## Version Roadmap

- **v0.12:** video game mode foundation with Dystopia Run, Utopia Run, choice events, Timeline Health, and final timeline reports.
- **v0.13:** video game feel pass with character identity, event categories, outcome feedback, and mode-specific visual styling.
- **v0.14:** art direction and atmosphere pass with broadcast/comic placeholder art slots and an art direction page.
- **v0.15:** comic-broadcast UI pass — shared design system, broadcast palette, comic buttons, ticker, halftone/scanline atmosphere, favicon/social image, print kit cleanup, SVG scene art, AI-generated character portraits, and a 16:9 broadcast hero panel.
- **v0.16:** playability pass — tabletop-first rules, quickstart, six character archetypes, 80-card prototype deck, 60-space board path, stronger chaos meter structure, and focused playtest feedback template.
- **v0.17:** browser integration pass — v0.16 data loader, four-stat browser engine, 60-space board, 80-card deck, choice prompts, Panic / Control / Market collapses, NPC Mode, cycle modifiers, and updated share/daily/restart flows.
- **v0.18:** QA / hardening pass — hardening/finalizer layers, four-stat renderer repair, Quick Start repair, held Survival card controls, Normie reroll/redraw windows, pending-resolution guard, meter bars, and v0.18 QA exports.
- **v0.19:** unified browser engine — old extension scripts retired from live page, unified engine loaded, smoke-test harness added, `play.html` redirects to `play-v019.html`.
- **v0.20:** full manual browser playthrough, automatic choice-branch resolution, and final legacy file archive/delete decision.
- **v1.0:** public preview build.
