// Restart and flip-board controls for Prototype v0.17.

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
      freedom: character.stats.freedom,
      influence: character.stats.influence,
      heldCards: [],
      powerUsed: {},
      skipNextTurn: false,
      shadowbanned: false,
      npcMode: false,
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
    log: [],
    meters: { panic: 0, control: 0, market: 0 },
    meterCollapses: { panic: 0, control: 0, market: 0 },
    playtest: { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: flipBoard ? 1 : 0 }
  };

  players.forEach(player => {
    const character = GAME.characters[player.characterIndex];
    const survivalCount = character.name === "The Prepper" ? 2 : 1;
    for (let i = 0; i < survivalCount; i++) dealSurvivalCard(player, "restart opening hand");
  });

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
  const ending = state.ending || getEndingTitle?.(winner) || "Survivor Ending";
  els.winnerPanel.classList.remove("hidden");
  els.winnerPanel.innerHTML = `
    <h2>${winner.name} survived the 2020s.</h2>
    <p>${winner.name} reached 2030 as ${character.name} with Money ${winner.money}, Sanity ${winner.sanity}, Freedom ${winner.freedom}, and Influence ${winner.influence}.</p>
    <div class="share-stats">
      <div><span>Ending</span><strong>${ending}</strong></div>
      <div><span>Panic</span><strong>${state.meterCollapses?.panic || 0}</strong></div>
      <div><span>Control</span><strong>${state.meterCollapses?.control || 0}</strong></div>
      <div><span>Market</span><strong>${state.meterCollapses?.market || 0}</strong></div>
    </div>
    <div class="cta-row left">
      <button class="button" type="button" onclick="restartGame(false)">Restart Game</button>
      <button class="button secondary" type="button" onclick="restartGame(true)">Flip Board & Restart</button>
      <button class="button secondary" type="button" onclick="resetGame()">Clear Saved Game</button>
    </div>
  `;
};

render();
