const STORAGE_KEY = "twentiesGameStateV04";

const els = {
  setupPanel: document.getElementById("setupPanel"),
  gamePanel: document.getElementById("gamePanel"),
  winnerPanel: document.getElementById("winnerPanel"),
  boardTrack: document.getElementById("boardTrack"),
  playerCount: document.getElementById("playerCount"),
  playerSetup: document.getElementById("playerSetup"),
  startGameBtn: document.getElementById("startGameBtn"),
  resetGameBtn: document.getElementById("resetGameBtn"),
  currentPlayerName: document.getElementById("currentPlayerName"),
  currentSpace: document.getElementById("currentSpace"),
  turnSummary: document.getElementById("turnSummary"),
  lastRoll: document.getElementById("lastRoll"),
  cycleBtn: document.getElementById("cycleBtn"),
  rollBtn: document.getElementById("rollBtn"),
  endTurnBtn: document.getElementById("endTurnBtn"),
  exportBtn: document.getElementById("exportBtn"),
  activeCard: document.getElementById("activeCard"),
  playersGrid: document.getElementById("playersGrid"),
  cardHistory: document.getElementById("cardHistory"),
  turnLog: document.getElementById("turnLog")
};

const TOKEN_LABELS = ["A", "B", "C", "D", "E", "F"];
let state = loadState() || createEmptyState();

function createEmptyState() {
  return {
    started: false,
    cycle: "Red Cycle",
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    lastSummary: "Set up players to begin.",
    activeCard: null,
    players: [],
    cardHistory: [],
    log: []
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function log(message) {
  const line = `Turn ${state.turn}: ${message}`;
  state.log.unshift(line);
  state.log = state.log.slice(0, 220);
  saveState();
}

function setSummary(message) {
  state.lastSummary = message;
  saveState();
}

function clampStat(value) {
  return Math.max(0, Math.min(9, Number(value) || 0));
}

function getCurrentPlayer() {
  return state.players[state.currentPlayer];
}

function getSpace(position) {
  return GAME.board.find(s => s.n === position) || GAME.board[0];
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function drawCard(deckName) {
  const deck = GAME.decks[deckName];
  if (!deck || deck.length === 0) return null;
  return deck[Math.floor(Math.random() * deck.length)];
}

function renderSetup() {
  const count = Number(els.playerCount.value);
  els.playerSetup.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement("div");
    wrap.className = "setup-card";

    const options = GAME.characters.map((c, index) => {
      const selected = index === i % GAME.characters.length ? "selected" : "";
      return `<option value="${index}" ${selected}>${c.name}</option>`;
    }).join("");

    wrap.innerHTML = `
      <h3>Player ${i + 1}</h3>
      <label>Name</label>
      <input id="playerName${i}" value="Player ${i + 1}">
      <label>Character</label>
      <select id="playerCharacter${i}">${options}</select>
      <p class="setup-hint">Token: ${TOKEN_LABELS[i]}</p>
    `;
    els.playerSetup.appendChild(wrap);
  }
}

function startGame() {
  const count = Number(els.playerCount.value);
  const players = [];

  for (let i = 0; i < count; i++) {
    const name = document.getElementById(`playerName${i}`).value.trim() || `Player ${i + 1}`;
    const characterIndex = Number(document.getElementById(`playerCharacter${i}`).value);
    const character = GAME.characters[characterIndex];
    players.push({
      id: i,
      token: TOKEN_LABELS[i],
      name,
      characterIndex,
      position: 1,
      sanity: character.stats.sanity,
      money: character.stats.money,
      influence: character.stats.influence,
      skipNextTurn: false,
      shadowbanned: false,
      winner: false
    });
  }

  state = {
    started: true,
    cycle: Math.random() > 0.5 ? "Red Cycle" : "Blue Cycle",
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    lastSummary: "Game started. First player is up.",
    activeCard: null,
    players,
    cardHistory: [],
    log: []
  };

  log(`Game started in ${state.cycle}.`);
  render();
}

function toggleCycle() {
  state.cycle = state.cycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
  log(`Board cycle changed to ${state.cycle}.`);
  setSummary(`Board cycle changed to ${state.cycle}.`);
  render();
}

function adjustStat(player, stat, delta, reason = "manual adjustment") {
  const before = player[stat];
  player[stat] = clampStat(player[stat] + Number(delta));
  const sign = delta > 0 ? "+" : "";
  log(`${player.name}: ${stat} ${before} to ${player[stat]} (${sign}${delta}, ${reason}).`);
  setSummary(`${player.name} ${stat}: ${before} to ${player[stat]}.`);
  checkZeroStats(player);
  render();
}

function checkZeroStats(player) {
  if (player.sanity <= 0 && !player.skipNextTurn) {
    player.skipNextTurn = true;
    log(`${player.name} hit 0 Sanity and enters Doomscroll Mode.`);
  }
  if (player.money <= 0) {
    player.position = Math.max(1, player.position - 2);
    player.sanity = clampStat(player.sanity + 1);
    log(`${player.name} hit 0 Money, moved back 2 spaces, and gained 1 Sanity.`);
  }
  if (player.influence <= 0 && !player.shadowbanned) {
    player.shadowbanned = true;
    log(`${player.name} hit 0 Influence and is Shadowbanned until their next turn.`);
  }
}

function applySimpleSpace(space, player) {
  const type = space.type;

  if (type.includes("Draw Global Chaos")) return handleCardDraw("Global Chaos", player);
  if (type.includes("Draw Media Meltdown")) return handleCardDraw("Media Meltdown", player);
  if (type.includes("Draw Hidden Hand")) return handleCardDraw("Hidden Hand", player);
  if (type.includes("Draw Political Flip")) return handleCardDraw("Political Flip", player);

  if (type.includes("Lose 1 Sanity")) return adjustStat(player, "sanity", -1, space.name);
  if (type.includes("Gain 1 Sanity")) return adjustStat(player, "sanity", 1, space.name);
  if (type.includes("Lose 1 Money")) return adjustStat(player, "money", -1, space.name);
  if (type.includes("Gain 1 Influence") || type.includes("Gain Influence")) return adjustStat(player, "influence", 1, space.name);

  if (type.includes("Move back 2")) {
    player.position = Math.max(1, player.position - 2);
    log(`${player.name} hit a Timeline Glitch and moved back 2 spaces.`);
    setSummary(`${player.name} glitched backward 2 spaces.`);
    return render();
  }

  if (type.includes("Roll again backward")) {
    const back = rollDie();
    player.position = Math.max(1, player.position - back);
    log(`${player.name} rolled ${back} backward through a Timeline Glitch.`);
    setSummary(`${player.name} rolled ${back} backward through a Timeline Glitch.`);
    return render();
  }

  if (type.includes("Swap places")) {
    log(`${player.name} hit Swap Places. Table decision required.`);
    setSummary(`${player.name} hit Swap Places. Choose another player and swap positions manually if desired.`);
    return render();
  }

  if (type.includes("Final Check")) {
    if (player.sanity >= 1 && player.money >= 1 && player.influence >= 1) {
      player.winner = true;
      log(`${player.name} reached 2030 with enough Sanity, Money, and Influence. WINNER.`);
      setSummary(`${player.name} reached 2030 and won the game.`);
      return render();
    }
    return handleCardDraw("Final Reckoning", player);
  }

  log(`${player.name} resolved ${space.name}. No automatic effect.`);
  setSummary(`${player.name} landed on ${space.name}.`);
  render();
}

function handleCardDraw(deckName, player) {
  const card = drawCard(deckName);
  if (!card) {
    log(`No cards found for ${deckName}.`);
    return render();
  }

  const cardRecord = {
    deckName,
    title: card.title,
    text: card.text,
    player: player.name,
    turn: state.turn
  };

  state.activeCard = cardRecord;
  state.cardHistory.unshift(cardRecord);
  state.cardHistory = state.cardHistory.slice(0, 20);
  log(`${player.name} drew ${deckName}: ${card.title}. Effect: ${card.text}`);
  setSummary(`${player.name} drew ${card.title}.`);
  applyRecognizedCardEffect(deckName, card, player);
  render();
}

function applyRecognizedCardEffect(deckName, card, player) {
  const text = card.text.toLowerCase();

  if (deckName === "Political Flip" && text.includes("flip the board cycle")) {
    state.cycle = state.cycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
    log(`Automatic effect: board cycle flipped to ${state.cycle}.`);
  }

  if (deckName === "Political Flip" && text.includes("set board to red cycle")) {
    state.cycle = "Red Cycle";
    log("Automatic effect: board set to Red Cycle.");
  }

  if (deckName === "Political Flip" && text.includes("set board to blue cycle")) {
    state.cycle = "Blue Cycle";
    log("Automatic effect: board set to Blue Cycle.");
  }

  if (text.startsWith("lose 1 sanity")) quickAdjust(player, "sanity", -1, card.title);
  if (text.startsWith("gain 1 sanity")) quickAdjust(player, "sanity", 1, card.title);
  if (text.startsWith("lose 1 money")) quickAdjust(player, "money", -1, card.title);
  if (text.startsWith("gain 1 money")) quickAdjust(player, "money", 1, card.title);
  if (text.startsWith("lose 1 influence")) quickAdjust(player, "influence", -1, card.title);
  if (text.startsWith("gain 1 influence")) quickAdjust(player, "influence", 1, card.title);
  if (text.startsWith("lose 2 influence")) quickAdjust(player, "influence", -2, card.title);
  if (text.startsWith("gain 2 influence")) quickAdjust(player, "influence", 2, card.title);
  if (text.startsWith("gain 2 money")) quickAdjust(player, "money", 2, card.title);
  if (text.startsWith("gain 3 money")) quickAdjust(player, "money", 3, card.title);
  if (text.startsWith("gain 3 influence")) quickAdjust(player, "influence", 3, card.title);
}

function quickAdjust(player, stat, delta, reason) {
  const before = player[stat];
  player[stat] = clampStat(player[stat] + Number(delta));
  log(`${player.name}: ${stat} ${before} to ${player[stat]} from ${reason}.`);
  checkZeroStats(player);
}

function rollAndMove() {
  const player = getCurrentPlayer();

  if (player.winner) {
    setSummary(`${player.name} has already won. Reset the game to play again.`);
    return render();
  }

  if (player.skipNextTurn) {
    player.skipNextTurn = false;
    log(`${player.name} skipped this turn due to Doomscroll Mode.`);
    setSummary(`${player.name} skipped this turn due to Doomscroll Mode.`);
    nextTurn();
    return;
  }

  if (player.shadowbanned) {
    player.shadowbanned = false;
    log(`${player.name} is no longer Shadowbanned.`);
  }

  const roll = rollDie();
  state.lastRoll = roll;
  const oldPosition = player.position;
  player.position = Math.min(40, player.position + roll);
  const space = getSpace(player.position);

  log(`${player.name} rolled ${roll}, moved from Space ${oldPosition} to Space ${player.position}: ${space.name}.`);
  setSummary(`${player.name} rolled ${roll} and moved to Space ${player.position}: ${space.name}.`);
  applySimpleSpace(space, player);
  saveState();
  render();
}

function nextTurn() {
  if (!state.started) return;
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  if (state.currentPlayer === 0) state.turn += 1;
  const player = getCurrentPlayer();
  state.lastRoll = null;
  setSummary(`${player.name} is up next.`);
  saveState();
  render();
}

function exportNotes() {
  const players = state.players.map(p => {
    const character = GAME.characters[p.characterIndex];
    return `${p.name} (${character.name}) - Space ${p.position}, Sanity ${p.sanity}, Money ${p.money}, Influence ${p.influence}`;
  }).join("\n");

  const cards = state.cardHistory.slice().reverse().map(c => {
    return `Turn ${c.turn}: ${c.player} drew ${c.deckName} - ${c.title}`;
  }).join("\n");

  const report = `2020s: The Board Game - Digital Playtest Report\n\nCycle: ${state.cycle}\nTurn: ${state.turn}\n\nPlayers:\n${players}\n\nCard History:\n${cards}\n\nTurn Log:\n${state.log.slice().reverse().join("\n")}`;

  navigator.clipboard?.writeText(report).then(() => {
    alert("Playtest report copied to clipboard. Paste it into a GitHub Issue.");
  }).catch(() => {
    prompt("Copy this playtest report:", report);
  });
}

function resetGame() {
  if (!confirm("Reset the saved game?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = createEmptyState();
  renderSetup();
  render();
}

function renderBoard() {
  els.boardTrack.innerHTML = "";
  GAME.board.forEach(space => {
    const cell = document.createElement("div");
    const isCurrent = state.started && getCurrentPlayer() && getCurrentPlayer().position === space.n;
    const spaceClass = space.type.includes("Draw") ? " draw-space" : space.type.includes("Final") ? " final-space" : "";
    cell.className = `board-cell${isCurrent ? " current-cell" : ""}${spaceClass}`;

    const tokens = state.players
      .filter(p => p.position === space.n)
      .map(p => `<span class="token token-${p.id}" title="${p.name}">${p.token}</span>`)
      .join("");

    cell.innerHTML = `
      <div class="board-number">${space.n}</div>
      <strong>${space.name}</strong>
      <small>${space.type}</small>
      <div class="tokens">${tokens}</div>
    `;
    els.boardTrack.appendChild(cell);
  });
}

function renderPlayers() {
  els.playersGrid.innerHTML = "";
  state.players.forEach((p, index) => {
    const character = GAME.characters[p.characterIndex];
    const space = getSpace(p.position);
    const active = index === state.currentPlayer ? " active-player" : "";
    const winner = p.winner ? " winner" : "";
    const card = document.createElement("article");
    card.className = `player-card${active}${winner}`;
    card.innerHTML = `
      <div class="player-topline"><span class="token token-${p.id}">${p.token}</span><h3>${p.name}</h3></div>
      <p>${character.name}</p>
      <p><strong>Space ${p.position}</strong>: ${space.name}</p>
      <div class="stat-row"><span>Sanity</span><strong>${p.sanity}</strong></div>
      <div class="stat-row"><span>Money</span><strong>${p.money}</strong></div>
      <div class="stat-row"><span>Influence</span><strong>${p.influence}</strong></div>
      <small>${p.skipNextTurn ? "Doomscroll Mode. " : ""}${p.shadowbanned ? "Shadowbanned" : ""}</small>
    `;
    els.playersGrid.appendChild(card);
  });
}

function renderCardHistory() {
  if (!state.cardHistory || state.cardHistory.length === 0) {
    els.cardHistory.innerHTML = `<p>No cards drawn yet.</p>`;
    return;
  }

  els.cardHistory.innerHTML = state.cardHistory.slice(0, 8).map(c => `
    <article class="history-card">
      <p class="eyebrow">Turn ${c.turn} - ${c.deckName}</p>
      <h4>${c.title}</h4>
      <p>${c.player}</p>
    </article>
  `).join("");
}

function renderActiveCard() {
  if (!state.activeCard) {
    els.activeCard.classList.add("hidden");
    els.activeCard.innerHTML = "";
    return;
  }

  const c = state.activeCard;
  els.activeCard.classList.remove("hidden");
  els.activeCard.innerHTML = `
    <p class="eyebrow">${c.deckName}</p>
    <h3>${c.title}</h3>
    <p>${c.text}</p>
    <p><em>Apply table judgment or use manual adjustments if needed.</em></p>
  `;
}

function renderWinner() {
  const winner = state.players.find(p => p.winner);
  if (!winner) {
    els.winnerPanel.classList.add("hidden");
    els.winnerPanel.innerHTML = "";
    return;
  }

  const character = GAME.characters[winner.characterIndex];
  els.winnerPanel.classList.remove("hidden");
  els.winnerPanel.innerHTML = `
    <h2>${winner.name} survived the 2020s.</h2>
    <p>${winner.name} reached 2030 as ${character.name} with Sanity ${winner.sanity}, Money ${winner.money}, and Influence ${winner.influence}.</p>
    <button class="button" type="button" onclick="resetGame()">Start New Game</button>
  `;
}

function render() {
  if (!state.started) {
    els.setupPanel.classList.remove("hidden");
    els.gamePanel.classList.add("hidden");
    return;
  }

  els.setupPanel.classList.add("hidden");
  els.gamePanel.classList.remove("hidden");

  const player = getCurrentPlayer();
  const space = getSpace(player.position);
  els.currentPlayerName.textContent = `${player.name} (${player.token})`;
  els.currentSpace.textContent = `Space ${player.position}: ${space.name} - ${space.type}`;
  els.turnSummary.textContent = state.lastSummary || "Ready.";
  els.lastRoll.textContent = state.lastRoll || "—";
  els.cycleBtn.textContent = state.cycle;
  els.cycleBtn.className = state.cycle === "Red Cycle" ? "cycle-btn red" : "cycle-btn blue";
  els.turnLog.value = state.log.join("\n");

  renderBoard();
  renderPlayers();
  renderCardHistory();
  renderActiveCard();
  renderWinner();
}

els.playerCount.addEventListener("change", renderSetup);
els.startGameBtn.addEventListener("click", startGame);
els.resetGameBtn.addEventListener("click", resetGame);
els.cycleBtn.addEventListener("click", toggleCycle);
els.rollBtn.addEventListener("click", rollAndMove);
els.endTurnBtn.addEventListener("click", nextTurn);
els.exportBtn.addEventListener("click", exportNotes);

document.querySelectorAll(".manual-tools button").forEach(button => {
  button.addEventListener("click", () => {
    const player = getCurrentPlayer();
    adjustStat(player, button.dataset.stat, Number(button.dataset.delta));
  });
});

renderSetup();
render();
