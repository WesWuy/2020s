const STORAGE_KEY = "twentiesGameStateV03";

const els = {
  setupPanel: document.getElementById("setupPanel"),
  gamePanel: document.getElementById("gamePanel"),
  playerCount: document.getElementById("playerCount"),
  playerSetup: document.getElementById("playerSetup"),
  startGameBtn: document.getElementById("startGameBtn"),
  resetGameBtn: document.getElementById("resetGameBtn"),
  currentPlayerName: document.getElementById("currentPlayerName"),
  currentSpace: document.getElementById("currentSpace"),
  lastRoll: document.getElementById("lastRoll"),
  cycleBtn: document.getElementById("cycleBtn"),
  rollBtn: document.getElementById("rollBtn"),
  endTurnBtn: document.getElementById("endTurnBtn"),
  exportBtn: document.getElementById("exportBtn"),
  activeCard: document.getElementById("activeCard"),
  playersGrid: document.getElementById("playersGrid"),
  turnLog: document.getElementById("turnLog")
};

let state = loadState() || createEmptyState();

function createEmptyState() {
  return {
    started: false,
    cycle: "Red Cycle",
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    players: [],
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
  state.log = state.log.slice(0, 180);
  saveState();
  render();
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
    players,
    log: []
  };

  log(`Game started in ${state.cycle}.`);
}

function toggleCycle() {
  state.cycle = state.cycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
  log(`Board cycle changed to ${state.cycle}.`);
}

function adjustStat(player, stat, delta, reason = "manual adjustment") {
  const before = player[stat];
  player[stat] = clampStat(player[stat] + Number(delta));
  const sign = delta > 0 ? "+" : "";
  log(`${player.name}: ${stat} ${before} → ${player[stat]} (${sign}${delta}, ${reason}).`);
  checkZeroStats(player);
}

function checkZeroStats(player) {
  if (player.sanity <= 0) {
    player.skipNextTurn = true;
    log(`${player.name} hit 0 Sanity and enters Doomscroll Mode. They skip their next turn unless rescued with 1 Influence.`);
  }
  if (player.money <= 0) {
    player.position = Math.max(1, player.position - 2);
    player.sanity = clampStat(player.sanity + 1);
    log(`${player.name} hit 0 Money, moves back 2 spaces, and gains 1 Sanity because expectations are lower.`);
  }
  if (player.influence <= 0) {
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
    return log(`${player.name} hit a Timeline Glitch and moved back 2 spaces.`);
  }

  if (type.includes("Roll again backward")) {
    const back = rollDie();
    player.position = Math.max(1, player.position - back);
    return log(`${player.name} rolled ${back} backward through a Timeline Glitch.`);
  }

  if (type.includes("Swap places")) {
    return log(`${player.name} hit Swap Places. Table decision required: choose another player and swap positions manually if desired.`);
  }

  if (type.includes("Final Check")) {
    if (player.sanity >= 1 && player.money >= 1 && player.influence >= 1) {
      player.winner = true;
      return log(`${player.name} reached 2030 with enough Sanity, Money, and Influence. WINNER.`);
    }
    return handleCardDraw("Final Reckoning", player);
  }

  return log(`${player.name} resolved ${space.name}. No automatic effect.`);
}

function handleCardDraw(deckName, player) {
  const card = drawCard(deckName);
  if (!card) return log(`No cards found for ${deckName}.`);

  els.activeCard.classList.remove("hidden");
  els.activeCard.innerHTML = `<p class="eyebrow">${deckName}</p><h3>${card.title}</h3><p>${card.text}</p><p><em>Apply table judgment or use manual adjustments if needed.</em></p>`;

  log(`${player.name} drew ${deckName}: ${card.title}. Effect: ${card.text}`);
  applyRecognizedCardEffect(deckName, card, player);
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

  if (text.startsWith("lose 1 sanity")) adjustStat(player, "sanity", -1, card.title);
  if (text.startsWith("gain 1 sanity")) adjustStat(player, "sanity", 1, card.title);
  if (text.startsWith("lose 1 money")) adjustStat(player, "money", -1, card.title);
  if (text.startsWith("gain 1 money")) adjustStat(player, "money", 1, card.title);
  if (text.startsWith("lose 1 influence")) adjustStat(player, "influence", -1, card.title);
  if (text.startsWith("gain 1 influence")) adjustStat(player, "influence", 1, card.title);
  if (text.startsWith("lose 2 influence")) adjustStat(player, "influence", -2, card.title);
  if (text.startsWith("gain 2 influence")) adjustStat(player, "influence", 2, card.title);
  if (text.startsWith("gain 2 money")) adjustStat(player, "money", 2, card.title);
  if (text.startsWith("gain 3 money")) adjustStat(player, "money", 3, card.title);
  if (text.startsWith("gain 3 influence")) adjustStat(player, "influence", 3, card.title);
}

function rollAndMove() {
  const player = getCurrentPlayer();

  if (player.winner) {
    return log(`${player.name} has already won. Reset the game to play again.`);
  }

  if (player.skipNextTurn) {
    player.skipNextTurn = false;
    log(`${player.name} skipped this turn due to Doomscroll Mode.`);
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
  applySimpleSpace(space, player);
  saveState();
  render();
}

function nextTurn() {
  if (!state.started) return;
  state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
  if (state.currentPlayer === 0) state.turn += 1;
  saveState();
  render();
}

function exportNotes() {
  const players = state.players.map(p => {
    const character = GAME.characters[p.characterIndex];
    return `${p.name} (${character.name}) — Space ${p.position}, Sanity ${p.sanity}, Money ${p.money}, Influence ${p.influence}`;
  }).join("\n");

  const report = `2020s: The Board Game — Digital Playtest Report\n\nCycle: ${state.cycle}\nTurn: ${state.turn}\n\nPlayers:\n${players}\n\nTurn Log:\n${state.log.slice().reverse().join("\n")}`;

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
  els.activeCard.classList.add("hidden");
  renderSetup();
  render();
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
      <h3>${p.name}</h3>
      <p>${character.name}</p>
      <p><strong>Space ${p.position}</strong>: ${space.name}</p>
      <div class="stat-row"><span>Sanity</span><strong>${p.sanity}</strong></div>
      <div class="stat-row"><span>Money</span><strong>${p.money}</strong></div>
      <div class="stat-row"><span>Influence</span><strong>${p.influence}</strong></div>
      <small>${p.skipNextTurn ? "Doomscroll Mode · " : ""}${p.shadowbanned ? "Shadowbanned" : ""}</small>
    `;
    els.playersGrid.appendChild(card);
  });
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
  els.currentPlayerName.textContent = player.name;
  els.currentSpace.textContent = `Space ${player.position}: ${space.name} — ${space.type}`;
  els.lastRoll.textContent = state.lastRoll || "—";
  els.cycleBtn.textContent = state.cycle;
  els.cycleBtn.className = state.cycle === "Red Cycle" ? "cycle-btn red" : "cycle-btn blue";
  els.turnLog.value = state.log.join("\n");

  renderPlayers();
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
