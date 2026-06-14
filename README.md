# 2020s: The Board Game

**Prototype v0.18 — QA / Hardening Pass**

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

The visual language is **satirical retro-futurist news broadcast meets comic-book apocalypse**. The art system includes reusable character portrait slots, event art frames, lower-third broadcast styling, halftone texture, Dystopia / Utopia color direction, prompt guidance for generated artwork, AI-generated character portraits, and a 16:9 broadcast hero panel.

## Board Game Digital Playtest

```text
https://weswuy.github.io/2020s/play.html
```

The board game digital playtest now runs the **v0.18 QA / hardening pass**. The live play page keeps the existing comic-broadcast UI while wiring in the v0.16 tabletop prototype data and hardening the v0.17 browser integration: six archetypes, a 60-space 2020-to-2030 board path, 80 structured prototype cards, Freedom as a fourth player stat, choice-card prompts, Panic / Control / Market collapse meters, NPC Mode, Red Cycle / Blue Cycle board modifiers, Daily Chaos updates, held Survival card controls, Normie reroll/redraw windows, and richer QA exports.

## v0.18 QA / Hardening Pass

v0.18 stabilizes the v0.17 browser integration without replacing the visual identity.

New hardening files:

```text
docs/v018-hardening.js
docs/v018-qa-finalizer.js
```

Still powered by the v0.16 source prototype data:

```text
data/prototype/characters-v0.16.csv
data/prototype/card-decks-v0.16.csv
data/prototype/board-spaces-v0.16.csv
```

### What v0.18 hardens

- Loads `docs/v018-hardening.js` and `docs/v018-qa-finalizer.js` last so they can repair older extension-file monkey patches safely
- Repairs the `statLabel()` naming collision caused by the older polish layer
- Ensures every game state has four stats, meters, collapse counts, playtest counters, held cards, and power-use flags
- Fixes Quick Start Chaos so it creates valid v0.18 players, Freedom stats, held cards, meters, and playtest fields
- Restores all four stats in player cards after the older polish renderer dropped Freedom
- Adds visible held Survival card UI with **Use / Resolve** buttons
- Adds a proper Normie reroll window before a Normie space is resolved
- Adds a proper Normie card redraw window before a Normie card effect is resolved
- Blocks End Turn while a pending Normie space/card window is unresolved
- Replaces the old export button handler with a v0.18 QA report including pending space/card state and powers used
- Adds visible Panic / Control / Market meter bars using the existing stat-meter styling
- Updates spectacle board icons/year labels for the v0.16 board-space model

## Known v0.18 Constraints

This is a hardening pass, not a complete automated rules engine.

- Some Survival cards still require table judgment after clicking **Use / Resolve**, especially reaction cards like cancel/prevent/ignore effects.
- Complex choice cards are surfaced and logged, but not every branch has a fully automatic mechanical resolution yet.
- Normie reroll/redraw is now stable because the effect window opens **before** space/card resolution, but it should still be playtested at the table.
- The browser loader still compiles the v0.16 CSV data into `docs/v017-data-loader.js` for stable GitHub Pages loading rather than dynamically fetching root CSV files at runtime.
- This pass was completed through code inspection and targeted hardening. A full browser-console playthrough should be the next QA step.

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

Run a rough 20–45 minute test. For the board game, judge clarity, humor, balance, agency, and shareability. For the video game mode, judge whether the choice loop, visual identity, and Dystopia / Utopia split feel fun enough to become a real browser/mobile game.

The most important question:

> Did players laugh, make decisions, and want one more round?

## Recommended Next Claude Code Tasks

1. Run a browser-console v0.18 smoke test on the live GitHub Pages page.
2. Simulate a full 3-player game through 2030 and log every runtime issue.
3. Add automatic branch resolution for the most common choice-card patterns.
4. Add better UI for reaction timing on Survival cards.
5. Add meter-specific visual collapse animations.
6. Audit all older extension files and either migrate or retire obsolete v0.4–v0.11 assumptions.
7. Add a one-click GitHub Issue export for v0.18 playtest feedback.

## Version Roadmap

- **v0.12:** video game mode foundation with Dystopia Run, Utopia Run, choice events, Timeline Health, and final timeline reports.
- **v0.13:** video game feel pass with character identity, event categories, outcome feedback, and mode-specific visual styling.
- **v0.14:** art direction and atmosphere pass with broadcast/comic placeholder art slots and an art direction page.
- **v0.15:** comic-broadcast UI pass — shared design system (`tokens.css`) with Anton/Inter/Space Mono type, unified broadcast palette, chunky comic buttons, live ticker + chromatic-aberration hero, global halftone/scanline atmosphere, favicon + social share image, print-kit cleanup, real hand-built SVG scene art for all six event categories plus character studio backdrops, and AI-generated character portraits plus a 16:9 broadcast hero panel wired across the hub and video mode.
- **v0.16:** playability pass — tabletop-first rules, quickstart, six character archetypes, 80-card prototype deck, 60-space board path, stronger chaos meter structure, and focused playtest feedback template.
- **v0.17:** browser integration pass — v0.16 data loader, four-stat browser engine, 60-space board, 80-card deck, choice prompts, Panic / Control / Market collapses, NPC Mode, cycle modifiers, and updated share/daily/restart flows.
- **v0.18:** QA / hardening pass — last-loaded hardening/finalizer layers, four-stat renderer repair, Quick Start repair, held Survival card controls, Normie reroll/redraw windows, pending-resolution guard, meter bars, and v0.18 QA exports.
- **v0.19:** browser-console playthrough, rules automation, and obsolete-extension cleanup.
- **v1.0:** public preview build.
