# Prototype v0.16 — Playability Pass Brief

## Purpose

This pass turns the current strong concept and visual identity into a more testable tabletop/gameplay prototype.

The project already has a strong satire hook and a strong comic-broadcast interface direction. The weak point is not theme. The weak point is proving that the underlying game loop is fun enough to replay.

## Strategic Direction

Do not expand the lore before testing the game engine.

The next build priority is:

1. Faster rules explanation
2. Stronger player agency
3. Clearer character asymmetry
4. More meaningful chaos meters
5. More card choices
6. Better playtest feedback capture

## Core Design Thesis

Players should feel like ordinary people trying to survive a ridiculous decade, not passive victims of random cards.

A good turn should usually include at least one of these:

- A risky choice
- A funny consequence
- A tradeoff between stats
- A group reaction
- A chaos meter shift
- A survival tool being used at the right moment

## Non-Negotiables

- No player elimination
- 2–6 players
- 20–45 minute target playtime
- Clear enough to teach in under 5 minutes
- Satire hits multiple sides, not one side only
- Cards stay short and punchy
- The reversible Red Cycle / Blue Cycle mechanic remains a signature feature
- The chaos meters must matter, not sit decorative

## Playtest Question

The first real question is not whether the game looks good.

The first question is:

> Did players laugh, make decisions, and want one more round?

## What v0.16 Adds

This pass adds:

- Six playable character archetypes
- A paper-first ruleset
- A one-page quickstart
- A 60-space prototype board path
- An 80-card prototype deck system
- A focused playtest feedback sheet

## Main Risks Still Open

### 1. Randomness may overwhelm agency

Many early cards simply moved stats up or down. v0.16 adds more choice-based cards, but this still needs testing.

### 2. Political satire may become exhausting

The Red Cycle / Blue Cycle system should stay mirrored and absurd. The game should make polarization look ridiculous, not become propaganda.

### 3. Too many systems could slow the table

Stats, cards, characters, chaos meters, and board spaces must be easy to manage physically. If setup feels heavy, cut complexity.

## Recommended Next Implementation

Claude Code should wire these files into the browser prototype carefully, not all at once.

Suggested order:

1. Add character archetype selection from `data/prototype/characters-v0.16.csv`
2. Load the new card deck CSV into the board game mode
3. Add visible choice prompts for choice cards
4. Add chaos meter thresholds and collapse effects
5. Add Red Cycle / Blue Cycle modifiers to election/checkpoint spaces
6. Add end-screen feedback based on the v0.16 playtest sheet

## Success Criteria

A good v0.16 test should show:

- Players understand the goal quickly
- Players remember their character power
- At least half the table laughs within the first 5 turns
- Choices feel meaningful but not slow
- The chaos meters create tension
- Nobody feels permanently punished
- The ending creates a story worth sharing
