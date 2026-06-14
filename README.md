# 2020s: The Board Game

**Prototype v0.17 — Browser Integration Pass**

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

The board game digital playtest now runs the **v0.17 browser integration pass**. The live play page keeps the existing comic-broadcast UI while wiring in the v0.16 tabletop prototype data: six archetypes, a 60-space 2020-to-2030 board path, 80 structured prototype cards, Freedom as a fourth player stat, choice-card prompts, Panic / Control / Market collapse meters, NPC Mode, Red Cycle / Blue Cycle board modifiers, Daily Chaos updates, and richer playtest exports.

## v0.17 Browser Integration Pass

v0.17 turns the v0.16 tabletop layer into a browser-playable prototype.

Integrated browser files:

```text
docs/v017-data-loader.js
docs/play.html
docs/play.js
docs/play-restart.js
docs/play-daily.js
docs/play-share.js
docs/play-content.js
```

Source prototype data remains in:

```text
data/prototype/characters-v0.16.csv
data/prototype/card-decks-v0.16.csv
data/prototype/board-spaces-v0.16.csv
```

### What v0.17 adds

- Loads the v0.16 tabletop dataset into the browser through `docs/v017-data-loader.js`
- Replaces the old 40-space browser board with the 60-space 2020-to-2030 board path
- Replaces the old deck naming with Headline, Conspiracy, Survival, and Scandal decks
- Adds Freedom as the fourth tracked player stat
- Adds six v0.16 character archetypes
- Adds opening Survival card hands, with The Prepper starting with two
- Adds `choice_required` card prompts and choice-resolution logging
- Adds Panic, Control, and Market meters that collapse at 6
- Adds NPC Mode when a player hits zero in any stat
- Adds Red Cycle / Blue Cycle board-space modifier handling
- Adds richer end-game summary fields for playtesting
- Updates Daily Chaos, sharing, endings, achievements, and restart handling for the four-stat rules

## Known v0.17 Constraints

This is a browser integration pass, not a finished QA pass.

- Complex choices are surfaced with buttons and logged, but many nuanced effects still rely on table judgment or GM correction tools.
- Survival cards can be held and counted, but not every held-card use has a dedicated UI button yet.
- The Normie reroll/redraw power is documented in the character data but still needs a dedicated browser control.
- The browser loader compiles the v0.16 CSV data into `docs/v017-data-loader.js` for stable GitHub Pages loading rather than dynamically fetching root CSV files at runtime.
- The existing spectacle/chaos modules are preserved, but they should be tested against the new four-stat state model.

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

1. Run a v0.18 QA / hardening pass on the live browser game.
2. Simulate a full 3-player game and fix any JavaScript/runtime issues.
3. Add dedicated UI actions for held Survival cards.
4. Add a dedicated Normie reroll/redraw control.
5. Tune choice cards so more choices produce automatic mechanical outcomes.
6. Add visible meter bars for Panic, Control, and Market using the existing comic-broadcast visual style.
7. Run a balance audit on character powers and collapse penalties.
8. Add a one-click GitHub Issue export for v0.17 playtest feedback.

## Version Roadmap

- **v0.12:** video game mode foundation with Dystopia Run, Utopia Run, choice events, Timeline Health, and final timeline reports.
- **v0.13:** video game feel pass with character identity, event categories, outcome feedback, and mode-specific visual styling.
- **v0.14:** art direction and atmosphere pass with broadcast/comic placeholder art slots and an art direction page.
- **v0.15:** comic-broadcast UI pass — shared design system (`tokens.css`) with Anton/Inter/Space Mono type, unified broadcast palette, chunky comic buttons, live ticker + chromatic-aberration hero, global halftone/scanline atmosphere, favicon + social share image, print-kit cleanup, real hand-built SVG scene art for all six event categories plus character studio backdrops, and AI-generated character portraits plus a 16:9 broadcast hero panel wired across the hub and video mode.
- **v0.16:** playability pass — tabletop-first rules, quickstart, six character archetypes, 80-card prototype deck, 60-space board path, stronger chaos meter structure, and focused playtest feedback template.
- **v0.17:** browser integration pass — v0.16 data loader, four-stat browser engine, 60-space board, 80-card deck, choice prompts, Panic / Control / Market collapses, NPC Mode, cycle modifiers, and updated share/daily/restart flows.
- **v0.18:** browser QA, balance, and survival-card usability pass.
- **v1.0:** public preview build.
