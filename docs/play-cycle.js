// Board Cycle automation patch for Prototype v0.4.
// Ensures cycle-changing cards outside the Political Flip deck also update the board state.

function flipBoardCycle(reason) {
  const oldCycle = state.cycle || "Red Cycle";
  state.cycle = oldCycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
  log(`Automatic effect: board cycle flipped from ${oldCycle} to ${state.cycle} (${reason}).`);
  setSummary(`Board cycle flipped from ${oldCycle} to ${state.cycle}.`);
}

function setBoardCycle(cycle, reason) {
  const oldCycle = state.cycle || "Red Cycle";
  state.cycle = cycle;
  log(`Automatic effect: board cycle changed from ${oldCycle} to ${state.cycle} (${reason}).`);
  setSummary(`Board cycle changed from ${oldCycle} to ${state.cycle}.`);
}

const originalApplyRecognizedCardEffect = applyRecognizedCardEffect;
applyRecognizedCardEffect = function cycleAwareCardEffect(deckName, card, player) {
  const text = card.text.toLowerCase();
  const title = card.title || "card effect";

  // Run the original effect engine first. It already handles Political Flip cards that say
  // "Flip the board cycle", "Set board to Red Cycle", or "Set board to Blue Cycle".
  originalApplyRecognizedCardEffect(deckName, card, player);

  // Missing case: Political Flip card "Narrative Realignment" says to set the board
  // to the opposite of its current state, but does not use the exact original trigger text.
  if (text.includes("set the board cycle to the opposite")) {
    flipBoardCycle(title);
    return;
  }

  // Missing case: non-Political Flip cards can also say "Flip the board cycle".
  // Example: Global Vibe Shift and History Gets Rewritten.
  if (deckName !== "Political Flip" && text.includes("flip the board cycle")) {
    flipBoardCycle(title);
    return;
  }

  // More flexible future-proofing for card copy variations.
  if (text.includes("set board to red cycle")) {
    setBoardCycle("Red Cycle", title);
    return;
  }

  if (text.includes("set board to blue cycle")) {
    setBoardCycle("Blue Cycle", title);
    return;
  }
};
