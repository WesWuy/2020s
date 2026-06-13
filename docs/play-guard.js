// Guard rails for Prototype v0.5.
// These keep Game Master correction tools from being mistaken for normal player actions.

const originalAdjustStat = adjustStat;
adjustStat = function guardedAdjustStat(player, stat, delta, reason = "GM correction") {
  const winnerExists = state.players?.some(p => p.winner);
  if (winnerExists) {
    setSummary("Game is over. Start a new game before making more changes.");
    log("Blocked a manual stat adjustment after the game had ended.");
    render();
    return;
  }

  const sign = delta > 0 ? "+" : "";
  log(`GM correction used for ${player.name}: ${stat} ${sign}${delta}.`);
  setSummary(`GM correction: ${player.name} ${stat} ${sign}${delta}.`);
  return originalAdjustStat(player, stat, delta, reason);
};

const originalRender = render;
render = function guardedRender() {
  originalRender();

  if (!state.started) return;

  const winnerExists = state.players?.some(p => p.winner);
  document.querySelectorAll(".gm-adjust").forEach(button => {
    button.disabled = Boolean(winnerExists);
    button.title = winnerExists ? "Game is over. Start a new game to make changes." : "Game Master correction only.";
  });
};

render();
