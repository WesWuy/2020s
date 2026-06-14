# 2020s: The Board Game

**Prototype v0.16 — Playability Pass**

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

The board game digital playtest includes a visible board, player tokens, character setup, Quick Start Chaos, How to Play in 60 Seconds, Chaos Level tuning, card tags, end-screen feedback links, dice movement, card reveals, card history, stat tracking, Red Cycle / Blue Cycle switching, a turn log, win state, exportable playtest notes, breaking-news ticker, dramatic card reveal overlay, stat meters, character flavor text, improved ending screen, shareable survival certificate, downloadable result image, achievement badges, Daily Chaos Mode, Chaos Engine, board icons, movement trails, landing moments, Final Timeline Broadcast, prototype cards, table-action prompts, audience-vote cards, conspiracy-corkboard moments, and outrageous ending titles.

## v0.16 Playability Pass

v0.16 adds a tabletop-first gameplay layer for prototype testing.

New files:

```text
docs/playability-pass-v0.16.md
rules/rules-v0.16.md
rules/quickstart-v0.16.md
data/prototype/characters-v0.16.csv
data/prototype/card-decks-v0.16.csv
data/prototype/board-spaces-v0.16.csv
playtest/playtest-feedback-v0.16.md
```

### What v0.16 is for

The previous pass made the game look and feel more like a comic-broadcast chaos machine. This pass is about proving the game is actually playable.

The focus is:

- Faster rules explanation
- More meaningful player choices
- Six asymmetric character archetypes
- 80 structured prototype cards
- A 60-space board path from 2020 to 2030
- Stronger Panic / Control / Market chaos meter usage
- Better Red Cycle / Blue Cycle tabletop handling
- Clearer playtest feedback capture

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

1. Load `data/prototype/characters-v0.16.csv` into character selection.
2. Load `data/prototype/card-decks-v0.16.csv` into the board game card engine.
3. Load `data/prototype/board-spaces-v0.16.csv` into the board path data model.
4. Add visible choice prompts for cards where `choice_required` is true.
5. Add chaos meter collapse states at 6.
6. Add character powers and weaknesses.
7. Add v0.16 playtest feedback export.

## Version Roadmap

- **v0.12:** video game mode foundation with Dystopia Run, Utopia Run, choice events, Timeline Health, and final timeline reports.
- **v0.13:** video game feel pass with character identity, event categories, outcome feedback, and mode-specific visual styling.
- **v0.14:** art direction and atmosphere pass with broadcast/comic placeholder art slots and an art direction page.
- **v0.15:** comic-broadcast UI pass — shared design system (`tokens.css`) with Anton/Inter/Space Mono type, unified broadcast palette, chunky comic buttons, live ticker + chromatic-aberration hero, global halftone/scanline atmosphere, favicon + social share image, print-kit cleanup, real hand-built SVG scene art for all six event categories plus character studio backdrops, and AI-generated character portraits plus a 16:9 broadcast hero panel wired across the hub and video mode.
- **v0.16:** playability pass — tabletop-first rules, quickstart, six character archetypes, 80-card prototype deck, 60-space board path, stronger chaos meter structure, and focused playtest feedback template.
- **v0.17:** browser integration pass for v0.16 data files.
- **v1.0:** public preview build.
