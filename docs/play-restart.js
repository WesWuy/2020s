// Restart and flip-board controls for Prototype v0.4.

function oppositeCycle(cycle) {
  return cycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
}

function freshPlayersFromCurrentGame() {
  return state.players.map((p, index) => {
    const character = GAME.characters[p.characterIndex];
    return {
      id: index,
      token: TOKEN_LABELS[index] || String(index + 1),
      name: p.name,
      characterIndex: p.characterIndex,
      position: 1,
      sanity: character.stats.sanity,
      money: character.stats.money,
      influence: character.stats.influence,
      skipNextTurn: false,
      shadowbanned: false,
      winner: false
    };
  });
}

function restartGame(flipBoard = false) {
  if (!state.started || !state.players || state.players.length === 0) {
    resetGame();
    return;
  }

  const oldCycle = state.cycle || "Red Cycle";
  const newCycle = flipBoard ? oppositeCycle(oldCycle) : oldCycle;
  const players = freshPlayersFromCurrentGame();

  state = {
    started: true,
    cycle: newCycle,
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    hasRolledThisTurn: false,
    lastSummary: flipBoard ? `Board flipped from ${oldCycle} to ${newCycle}. New game started.` : "Game restarted with the same players.",
    activeCard: null,
    players,
    cardHistory: [],
    log: []
  };

  log(flipBoard ? `Board flipped from ${oldCycle} to ${newCycle}. Game restarted.` : "Game restarted with the same players and board cycle.");
  saveState();
  render();
}

window.restartGame = restartGame;

document.getElementById("restartGameBtn")?.addEventListener("click", () => {
  if (confirm("Restart with the same players and same board cycle?")) restartGame(false);
});

document.getElementById("flipRestartBtn")?.addEventListener("click", () => {
  if (confirm("Flip the board cycle and restart with the same players?")) restartGame(true);
});

const previousRenderWinner = renderWinner;
renderWinner = function renderWinnerWithRestartOptions() {
  const winner = state.players.find(p => p.winner);
  if (!winner) {
    return previousRenderWinner();
  }

  const character = GAME.characters[winner.characterIndex];
  els.winnerPanel.classList.remove("hidden");
  els.winnerPanel.innerHTML = `
    <h2>${winner.name} survived the 2020s.</h2>
    <p>${winner.name} reached 2030 as ${character.name} with Sanity ${winner.sanity}, Money ${winner.money}, and Influence ${winner.influence}.</p>
    <div class="cta-row left">
      <button class="button" type="button" onclick="restartGame(false)">Restart Game</button>
      <button class="button secondary" type="button" onclick="restartGame(true)">Flip Board & Restart</button>
      <button class="button secondary" type="button" onclick="resetGame()">Clear Saved Game</button>
    </div>
  `;
};

render();
