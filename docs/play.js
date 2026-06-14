const STORAGE_KEY = "twentiesGameStateV017";

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
const STAT_KEYS = ["sanity", "money", "freedom", "influence"];
const METER_KEYS = ["panic", "control", "market"];

let state = loadState() || createEmptyState();
normalizeState();

function createEmptyState() {
  return {
    started: false,
    cycle: "Red Cycle",
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    hasRolledThisTurn: false,
    lastSummary: "Set up players to begin.",
    activeCard: null,
    players: [],
    cardHistory: [],
    log: [],
    meters: { panic: 0, control: 0, market: 0 },
    meterCollapses: { panic: 0, control: 0, market: 0 },
    playtest: { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 }
  };
}

function normalizeState() {
  if (typeof state.hasRolledThisTurn !== "boolean") state.hasRolledThisTurn = false;
  if (!Array.isArray(state.cardHistory)) state.cardHistory = [];
  if (!Array.isArray(state.log)) state.log = [];
  if (!state.lastSummary) state.lastSummary = "Ready.";
  if (!state.meters) state.meters = { panic: 0, control: 0, market: 0 };
  if (!state.meterCollapses) state.meterCollapses = { panic: 0, control: 0, market: 0 };
  if (!state.playtest) state.playtest = { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 };
  METER_KEYS.forEach(key => {
    state.meters[key] = clampMeter(state.meters[key]);
    state.meterCollapses[key] = Number(state.meterCollapses[key]) || 0;
  });
  if (!Array.isArray(state.players)) state.players = [];
  state.players.forEach(player => {
    STAT_KEYS.forEach(stat => {
      if (typeof player[stat] !== "number") player[stat] = stat === "freedom" ? 5 : clampStat(player[stat]);
      player[stat] = clampStat(player[stat]);
    });
    if (!Array.isArray(player.heldCards)) player.heldCards = [];
    if (!player.powerUsed) player.powerUsed = {};
    if (typeof player.npcMode !== "boolean") player.npcMode = false;
  });
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
  state.log = state.log.slice(0, 260);
  saveState();
}

function setSummary(message) {
  state.lastSummary = message;
  saveState();
}

function clampStat(value) {
  return Math.max(0, Math.min(9, Number(value) || 0));
}

function clampMeter(value) {
  return Math.max(0, Math.min(6, Number(value) || 0));
}

function statLabel(stat) {
  return stat.charAt(0).toUpperCase() + stat.slice(1);
}

function getCurrentPlayer() {
  return state.players[state.currentPlayer];
}

function getCharacter(player) {
  return GAME.characters[player.characterIndex] || GAME.characters[0];
}

function getSpace(position) {
  return GAME.board.find(s => s.n === position) || GAME.board[0];
}

function getFinalSpaceNumber() {
  return Math.max(...GAME.board.map(space => space.n));
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function resolveDeckName(deckName) {
  if (GAME.decks?.[deckName]) return deckName;
  return GAME.deckAliases?.[deckName] || deckName;
}

function drawCard(deckName) {
  const resolvedDeck = resolveDeckName(deckName);
  const deck = GAME.decks?.[resolvedDeck];
  if (!deck || deck.length === 0) return null;
  return { ...deck[Math.floor(Math.random() * deck.length)], deck: resolvedDeck };
}

function dealSurvivalCard(player, reason = "setup") {
  const card = drawCard("Survival");
  if (!card) return;
  player.heldCards.push({ id: card.id, title: card.title, text: card.text, deck: "Survival" });
  log(`${player.name} received Survival card: ${card.title} (${reason}).`);
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
      <p class="setup-hint">v0.17 uses Money, Sanity, Freedom, and Influence.</p>
    `;
    els.playerSetup.appendChild(wrap);
  }
}

function createPlayerFromCharacter(i, name, characterIndex) {
  const character = GAME.characters[characterIndex];
  return {
    id: i,
    token: TOKEN_LABELS[i] || String(i + 1),
    name,
    characterIndex,
    position: 1,
    sanity: clampStat(character.stats.sanity),
    money: clampStat(character.stats.money),
    freedom: clampStat(character.stats.freedom),
    influence: clampStat(character.stats.influence),
    heldCards: [],
    powerUsed: {},
    skipNextTurn: false,
    shadowbanned: false,
    npcMode: false,
    winner: false
  };
}

function startGame() {
  const count = Number(els.playerCount.value);
  const players = [];

  for (let i = 0; i < count; i++) {
    const name = document.getElementById(`playerName${i}`).value.trim() || `Player ${i + 1}`;
    const characterIndex = Number(document.getElementById(`playerCharacter${i}`).value);
    players.push(createPlayerFromCharacter(i, name, characterIndex));
  }

  state = {
    started: true,
    cycle: Math.random() > 0.5 ? "Red Cycle" : "Blue Cycle",
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    hasRolledThisTurn: false,
    lastSummary: "Game started with v0.17 data. First player is up.",
    activeCard: null,
    players,
    cardHistory: [],
    log: [],
    meters: { panic: 0, control: 0, market: 0 },
    meterCollapses: { panic: 0, control: 0, market: 0 },
    playtest: { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 }
  };

  players.forEach(player => {
    const character = getCharacter(player);
    const survivalCount = character.name === "The Prepper" ? 2 : 1;
    for (let i = 0; i < survivalCount; i++) dealSurvivalCard(player, "opening hand");
  });

  log(`Game started in ${state.cycle} using ${GAME.version || "browser"} data.`);
  saveState();
  render();
}

function toggleCycle(reason = "manual toggle") {
  const oldCycle = state.cycle;
  state.cycle = state.cycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
  state.playtest.cycleSwitches += 1;
  log(`Board cycle changed from ${oldCycle} to ${state.cycle} (${reason}).`);
  setSummary(`Board cycle changed to ${state.cycle}.`);
  render();
}

function applyStatDelta(player, stat, delta, reason = "effect", options = {}) {
  if (!STAT_KEYS.includes(stat) || !delta) return;
  const character = getCharacter(player);
  let adjustedDelta = Number(delta);

  if (stat === "influence" && adjustedDelta < 0 && character.name === "The Influencer" && !player.powerUsed.influencerShield && options.source === "card") {
    player.powerUsed.influencerShield = true;
    adjustedDelta = Math.abs(adjustedDelta);
    log(`${player.name}'s Influencer power turned an Influence loss into a gain.`);
  }

  if (stat === "money" && adjustedDelta > 0 && character.name === "The Crypto Bro" && options.source === "card") {
    adjustedDelta += 1;
    log(`${player.name}'s Crypto Bro power added +1 Money.`);
  }

  const before = player[stat];
  player[stat] = clampStat(player[stat] + adjustedDelta);
  const sign = adjustedDelta > 0 ? "+" : "";
  log(`${player.name}: ${statLabel(stat)} ${before} to ${player[stat]} (${sign}${adjustedDelta}, ${reason}).`);
  checkZeroStats(player);
}

function adjustStat(player, stat, delta, reason = "manual adjustment") {
  applyStatDelta(player, stat, delta, reason, { source: "manual" });
  setSummary(`${player.name} ${statLabel(stat)} adjusted by ${delta}.`);
  saveState();
  render();
}

function checkZeroStats(player) {
  const zeroStats = STAT_KEYS.filter(stat => player[stat] <= 0);
  if (!zeroStats.length) return;

  zeroStats.forEach(stat => {
    player[stat] = 2;
  });

  if (!player.npcMode) {
    player.npcMode = true;
    player.skipNextTurn = true;
    state.playtest.npcEvents += 1;
    log(`${player.name} hit zero in ${zeroStats.map(statLabel).join(", ")} and enters NPC Mode. Zero stat(s) reset to 2.`);
    setSummary(`${player.name} entered NPC Mode and will miss one turn.`);
  }
}

function applyMeterDelta(meter, delta, reason = "effect") {
  if (!METER_KEYS.includes(meter) || !delta) return;
  const before = state.meters[meter];
  state.meters[meter] = clampMeter(state.meters[meter] + Number(delta));
  const sign = delta > 0 ? "+" : "";
  log(`${statLabel(meter)} Meter ${before} to ${state.meters[meter]} (${sign}${delta}, ${reason}).`);

  if (meter === "control" && delta > 0) {
    state.players.forEach(player => {
      const character = getCharacter(player);
      if (character.name === "The Activist" && player.powerUsed.activistRound !== state.turn) {
        player.powerUsed.activistRound = state.turn;
        applyStatDelta(player, "influence", 1, "Activist power: Control rose", { source: "meter" });
      }
    });
  }

  checkMeterCollapse(meter);
}

function checkMeterCollapse(meter) {
  if (state.meters[meter] < 6) return;
  state.meters[meter] = 0;
  state.meterCollapses[meter] += 1;

  if (meter === "panic") {
    state.players.forEach(player => {
      applyStatDelta(player, "sanity", -1, "Panic Collapse", { source: "meter" });
      if (getCharacter(player).name === "The Activist") applyStatDelta(player, "sanity", -1, "Activist weakness: Panic Collapse", { source: "meter" });
    });
    announceCollapse("PANIC COLLAPSE", "Panic hit 6. Everyone loses 1 Sanity. Activists lose 1 extra Sanity.");
  }

  if (meter === "control") {
    state.players.forEach(player => applyStatDelta(player, "freedom", -1, "Control Collapse", { source: "meter" }));
    announceCollapse("CONTROL COLLAPSE", "Control hit 6. Everyone loses 1 Freedom.");
  }

  if (meter === "market") {
    state.players.forEach(player => {
      applyStatDelta(player, "money", -1, "Market Collapse", { source: "meter" });
      if (getCharacter(player).name === "The Crypto Bro") applyStatDelta(player, "money", -1, "Crypto Bro weakness: Market Collapse", { source: "meter" });
    });
    announceCollapse("MARKET COLLAPSE", "Market hit 6. Everyone loses 1 Money. Crypto Bros lose 1 extra Money.");
  }
}

function announceCollapse(title, text) {
  log(`${title}: ${text}`);
  setSummary(text);
  if (typeof showBreakingNews === "function") showBreakingNews(title, text);
}

function applyCardDeltas(deckName, card, player) {
  const targetsEveryone = /^(everyone|all players)/i.test(card.text || "");
  const targets = targetsEveryone ? state.players : [player];
  const statDeltas = {
    money: card.money_delta,
    sanity: card.sanity_delta,
    freedom: card.freedom_delta,
    influence: card.influence_delta
  };

  targets.forEach(target => {
    Object.entries(statDeltas).forEach(([stat, delta]) => {
      if (delta) applyStatDelta(target, stat, delta, `${card.title} (${deckName})`, { source: "card" });
    });
  });

  applyMeterDelta("panic", card.panic_delta, `${card.title} (${deckName})`);
  applyMeterDelta("control", card.control_delta, `${card.title} (${deckName})`);
  applyMeterDelta("market", card.market_delta, `${card.title} (${deckName})`);

  if (/switch red cycle and blue cycle|flip the board cycle|another historic election/i.test(card.text || "")) {
    toggleCycle(card.title);
  }

  if (deckName === "Scandal" && getCharacter(player).name === "The Prepper") {
    applyStatDelta(player, "influence", -1, "Prepper weakness: Scandal pressure", { source: "card" });
  }

  if (deckName === "Scandal" && getCharacter(player).name === "The Influencer") {
    applyStatDelta(player, "sanity", -1, "Influencer weakness: Scandal pressure", { source: "card" });
  }
}

function createChoicePrompt(source, title, text, options = []) {
  state.playtest.choicesPresented += 1;
  state.activeCard = {
    deckName: source,
    title,
    text,
    choiceRequired: true,
    choices: options.length ? options : extractChoices(text),
    player: getCurrentPlayer()?.name || "Table",
    turn: state.turn
  };
  log(`Choice required: ${title}. ${text}`);
  setSummary(`${title}: choose an option, resolve it, then press End Turn.`);
}

function extractChoices(text = "") {
  const cleaned = text.replace(/^Choose:\s*/i, "").trim();
  if (!/\bor\b/i.test(cleaned)) return [];
  return cleaned.split(/\s+or\s+/i).map(choice => choice.replace(/\.$/, "").trim()).filter(Boolean).slice(0, 3);
}

function resolveChoice(choiceText) {
  if (!state.activeCard?.choiceRequired) return;
  state.activeCard.choiceResolved = choiceText || "Resolved by table judgment";
  state.playtest.choicesResolved += 1;
  log(`Choice resolved for ${state.activeCard.title}: ${state.activeCard.choiceResolved}.`);
  setSummary(`Choice resolved: ${state.activeCard.choiceResolved}. Press End Turn.`);
  saveState();
  render();
}

function applyTextEffect(text = "", player, reason = "board effect") {
  const lower = text.toLowerCase();
  if (!text || lower.includes("no effect")) return false;

  if (lower.startsWith("choose:") || lower.includes(" or ")) {
    createChoicePrompt("Board Choice", reason, text);
    return true;
  }

  const targetEveryone = lower.startsWith("everyone") || lower.startsWith("all players");
  const targets = targetEveryone ? state.players : [player];

  targets.forEach(target => {
    const statMatches = [...text.matchAll(/(gain|recover|lose)\s+(\d+)\s+(sanity|money|freedom|influence)/gi)];
    statMatches.forEach(match => {
      const action = match[1].toLowerCase();
      const amount = Number(match[2]);
      const stat = match[3].toLowerCase();
      const delta = action === "lose" ? -amount : amount;
      applyStatDelta(target, stat, delta, reason, { source: "board" });
    });
  });

  const meterMatches = [...text.matchAll(/(panic|control|market)\s+(?:meter\s+)?(?:rises|rise|increases|increase)\s+by\s+(\d+)/gi)];
  meterMatches.forEach(match => applyMeterDelta(match[1].toLowerCase(), Number(match[2]), reason));

  const lowerMeterMatches = [...text.matchAll(/(?:lower|reduce)\s+(panic|control|market)\s+by\s+(\d+)/gi)];
  lowerMeterMatches.forEach(match => applyMeterDelta(match[1].toLowerCase(), -Number(match[2]), reason));

  const moveForward = text.match(/move forward\s+(\d+)/i);
  if (moveForward) {
    const before = player.position;
    player.position = Math.min(getFinalSpaceNumber(), player.position + Number(moveForward[1]));
    log(`${player.name} moved forward from Space ${before} to ${player.position} (${reason}).`);
  }

  const moveBack = text.match(/move back(?:ward)?\s+(\d+)/i);
  if (moveBack) {
    const before = player.position;
    player.position = Math.max(1, player.position - Number(moveBack[1]));
    log(`${player.name} moved back from Space ${before} to ${player.position} (${reason}).`);
  }

  if (/draw one headline card/i.test(text)) handleCardDraw("Headline", player);
  if (/draw one conspiracy card/i.test(text)) handleCardDraw("Conspiracy", player);
  if (/draw one survival card/i.test(text)) handleCardDraw("Survival", player);
  if (/draw one scandal card/i.test(text)) handleCardDraw("Scandal", player);

  return true;
}

function applyCycleModifier(space, player) {
  const modifier = state.cycle === "Red Cycle" ? space.red_cycle_effect : space.blue_cycle_effect;
  if (!modifier || /no effect/i.test(modifier)) return;
  log(`${state.cycle} modifier on ${space.name}: ${modifier}`);
  applyTextEffect(modifier, player, `${state.cycle} modifier: ${space.name}`);
}

function applySimpleSpace(space, player) {
  const type = space.space_type || space.type || "Timeline";

  if (type === "Breaking News") handleCardDraw("Headline", player);
  else if (type === "Square & Compass") handleCardDraw("Conspiracy", player);
  else if (type === "Survival Check") handleCardDraw("Survival", player);
  else if (type === "Scandal") handleCardDraw("Scandal", player);
  else if (type === "Pandemic Panic" && getCharacter(player).name === "The Remote Worker" && !player.powerUsed.remoteWorkerPanic) {
    player.powerUsed.remoteWorkerPanic = true;
    log(`${player.name}'s Remote Worker power ignored the first Pandemic Panic penalty.`);
    setSummary(`${player.name} ignored Pandemic Panic with Remote Worker power.`);
  } else if (type === "Finish") {
    return resolveFinish(player, space);
  } else {
    applyTextEffect(space.effect || type, player, space.name);
  }

  applyCycleModifier(space, player);

  if (type === "Election Year") toggleCycle(`${space.name} election flip`);

  log(`${player.name} resolved ${space.name}.`);
  saveState();
  render();
}

function resolveFinish(player, space) {
  if (STAT_KEYS.every(stat => player[stat] >= 1)) {
    player.winner = true;
    state.ending = getEndingTitle(player);
    log(`${player.name} reached 2030 with Money ${player.money}, Sanity ${player.sanity}, Freedom ${player.freedom}, Influence ${player.influence}. WINNER.`);
    setSummary(`${player.name} reached 2030 and won: ${state.ending}.`);
    saveState();
    return render();
  }
  createChoicePrompt("Final Check", space.name, "You reached 2030, but one or more stats are too low. Enter NPC Mode, recover, and try again.");
  checkZeroStats(player);
  render();
}

function handleCardDraw(deckName, player) {
  const resolvedDeckName = resolveDeckName(deckName);
  const card = drawCard(deckName);
  if (!card) {
    log(`No cards found for ${deckName}.`);
    return render();
  }

  const cardRecord = {
    id: card.id,
    deckName: resolvedDeckName,
    title: card.title,
    text: card.text,
    player: player.name,
    turn: state.turn,
    choiceRequired: Boolean(card.choice_required),
    tags: card.tags || []
  };

  state.activeCard = cardRecord;
  state.cardHistory.unshift(cardRecord);
  state.cardHistory = state.cardHistory.slice(0, 30);
  log(`${player.name} drew ${resolvedDeckName}: ${card.title}. Effect: ${card.text}`);
  setSummary(`${player.name} drew ${card.title}. Resolve the card, then press End Turn.`);

  if (card.holdable) {
    player.heldCards.push({ id: card.id, title: card.title, text: card.text, deck: resolvedDeckName });
    log(`${player.name} added ${card.title} to held Survival cards.`);
  } else {
    applyRecognizedCardEffect(resolvedDeckName, card, player);
  }

  if (card.choice_required) {
    state.activeCard.choiceRequired = true;
    state.activeCard.choices = extractChoices(card.text);
    state.playtest.choicesPresented += 1;
  }

  saveState();
  render();
}

function applyRecognizedCardEffect(deckName, card, player) {
  applyCardDeltas(deckName, card, player);
}

function quickAdjust(player, stat, delta, reason) {
  applyStatDelta(player, stat, delta, reason, { source: "quick" });
  saveState();
}

function rollAndMove() {
  const player = getCurrentPlayer();

  if (player.winner) {
    setSummary(`${player.name} has already won. Reset the game to play again.`);
    return render();
  }

  if (state.hasRolledThisTurn) {
    setSummary(`${player.name} has already rolled this turn. Resolve the space/card, then press End Turn.`);
    log(`${player.name} tried to roll again, but each player only rolls once per turn.`);
    return render();
  }

  if (player.skipNextTurn || player.npcMode) {
    player.skipNextTurn = false;
    player.npcMode = false;
    state.hasRolledThisTurn = true;
    log(`${player.name} skipped this turn due to NPC Mode and returns next turn.`);
    setSummary(`${player.name} skipped this turn due to NPC Mode. Press End Turn.`);
    saveState();
    return render();
  }

  if (player.shadowbanned) {
    player.shadowbanned = false;
    log(`${player.name} is no longer Shadowbanned.`);
  }

  const roll = rollDie();
  state.hasRolledThisTurn = true;
  state.lastRoll = roll;
  const oldPosition = player.position;
  player.position = Math.min(getFinalSpaceNumber(), player.position + roll);
  const space = getSpace(player.position);

  log(`${player.name} rolled ${roll}, moved from Space ${oldPosition} to Space ${player.position}: ${space.name}.`);
  setSummary(`${player.name} rolled ${roll} and moved to Space ${player.position}: ${space.name}. Resolve the space, then press End Turn.`);
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
  state.hasRolledThisTurn = false;
  state.activeCard = null;
  setSummary(`${player.name} is up next. Roll once, resolve the space, then end the turn.`);
  saveState();
  render();
}

function exportNotes() {
  const players = state.players.map(p => {
    const character = getCharacter(p);
    return `${p.name} (${character.name}) - Space ${p.position}, Money ${p.money}, Sanity ${p.sanity}, Freedom ${p.freedom}, Influence ${p.influence}, Held Survival ${p.heldCards?.length || 0}`;
  }).join("\n");

  const cards = state.cardHistory.slice().reverse().map(c => {
    return `Turn ${c.turn}: ${c.player} drew ${c.deckName} - ${c.title}${c.choiceRequired ? " [choice]" : ""}`;
  }).join("\n");

  const meterReport = `Panic ${state.meters.panic}/6 (${state.meterCollapses.panic} collapses), Control ${state.meters.control}/6 (${state.meterCollapses.control} collapses), Market ${state.meters.market}/6 (${state.meterCollapses.market} collapses)`;
  const winner = state.players.find(p => p.winner);
  const report = `2020s: The Board Game - v0.17 Digital Playtest Report\n\nData: ${GAME.version || "unknown"}\nCycle: ${state.cycle}\nTurn: ${state.turn}\nMeters: ${meterReport}\nChoices Presented: ${state.playtest.choicesPresented}\nChoices Resolved: ${state.playtest.choicesResolved}\nNPC Events: ${state.playtest.npcEvents}\nCycle Switches: ${state.playtest.cycleSwitches}\nWinner: ${winner ? `${winner.name} - ${state.ending || getEndingTitle(winner)}` : "None yet"}\n\nPlayers:\n${players}\n\nCard History:\n${cards}\n\nTurn Log:\n${state.log.slice().reverse().join("\n")}`;

  navigator.clipboard?.writeText(report).then(() => {
    alert("v0.17 playtest report copied to clipboard. Paste it into a GitHub Issue.");
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
    const type = space.space_type || space.type || "Timeline";
    const spaceClass = type.includes("News") || type.includes("Scandal") || type.includes("Compass") || type.includes("Survival") ? " draw-space" : type.includes("Finish") ? " final-space" : "";
    cell.className = `board-cell${isCurrent ? " current-cell" : ""}${spaceClass}`;

    const tokens = state.players
      .filter(p => p.position === space.n)
      .map(p => `<span class="token token-${p.id}" title="${p.name}">${p.token}</span>`)
      .join("");

    cell.innerHTML = `
      <div class="board-number">${space.n}</div>
      <strong>${space.name}</strong>
      <small>${space.year || ""} — ${type}</small>
      <div class="tokens">${tokens}</div>
    `;
    els.boardTrack.appendChild(cell);
  });
}

function renderPlayers() {
  els.playersGrid.innerHTML = "";
  state.players.forEach((p, index) => {
    const character = getCharacter(p);
    const space = getSpace(p.position);
    const active = index === state.currentPlayer ? " active-player" : "";
    const winner = p.winner ? " winner" : "";
    const card = document.createElement("article");
    card.className = `player-card${active}${winner}`;
    card.innerHTML = `
      <div class="player-topline"><span class="token token-${p.id}">${p.token}</span><h3>${p.name}</h3></div>
      <p><strong>${character.name}</strong></p>
      <p>${character.flavor || ""}</p>
      <p><strong>Space ${p.position}</strong>: ${space.name}</p>
      <div class="stat-row"><span>Money</span><strong>${p.money}</strong></div>
      <div class="stat-row"><span>Sanity</span><strong>${p.sanity}</strong></div>
      <div class="stat-row"><span>Freedom</span><strong>${p.freedom}</strong></div>
      <div class="stat-row"><span>Influence</span><strong>${p.influence}</strong></div>
      <small>${p.npcMode ? "NPC Mode. " : ""}${p.heldCards?.length ? `Held Survival: ${p.heldCards.length}. ` : ""}${p.shadowbanned ? "Shadowbanned" : ""}</small>
    `;
    els.playersGrid.appendChild(card);
  });
}

function renderCardHistory() {
  if (!state.cardHistory || state.cardHistory.length === 0) {
    els.cardHistory.innerHTML = `<p>No cards drawn yet.</p>`;
    return;
  }

  els.cardHistory.innerHTML = state.cardHistory.slice(0, 10).map(c => `
    <article class="history-card">
      <p class="eyebrow">Turn ${c.turn} - ${c.deckName}${c.choiceRequired ? " - Choice" : ""}</p>
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
  const choices = c.choiceRequired ? (c.choices && c.choices.length ? c.choices : ["Option A", "Option B", "Resolved by table judgment"]) : [];
  els.activeCard.classList.remove("hidden");
  els.activeCard.innerHTML = `
    <p class="eyebrow">${c.deckName}${c.choiceRequired ? " - Choice Required" : ""}</p>
    <h3>${c.title}</h3>
    <p>${c.text}</p>
    ${c.tags?.length ? `<p><small>Tags: ${c.tags.join(", ")}</small></p>` : ""}
    ${c.choiceRequired ? `<div class="cta-row left">${choices.map(choice => `<button class="button secondary choice-resolve" type="button" data-choice="${choice.replace(/"/g, "&quot;")}">${choice}</button>`).join("")}</div><p><em>${c.choiceResolved ? `Resolved: ${c.choiceResolved}` : "Pick the table decision that was used. Complex choices can still use GM tools."}</em></p>` : `<p><em>Apply table judgment or use manual adjustments if needed.</em></p>`}
  `;
}

function getEndingTitle(player) {
  if (player.sanity >= 5 && player.freedom >= 5) return "Awakened Ending";
  if (player.influence >= 7) return "Influencer Ending";
  if (player.money >= 7 && player.influence <= 1) return "Bunker Ending";
  if (state.meterCollapses.control >= 2) return "Great Reset Ending";
  if (state.meterCollapses.panic >= 2) return "Doomscroll Ending";
  if (state.meterCollapses.market >= 2) return "Black Swan Ending";
  return "Survivor Ending";
}

function renderWinner() {
  const winner = state.players.find(p => p.winner);
  if (!winner) {
    els.winnerPanel.classList.add("hidden");
    els.winnerPanel.innerHTML = "";
    return;
  }

  const character = getCharacter(winner);
  const ending = state.ending || getEndingTitle(winner);
  els.winnerPanel.classList.remove("hidden");
  els.winnerPanel.innerHTML = `
    <h2>${winner.name} survived the 2020s.</h2>
    <p>${winner.name} reached 2030 as ${character.name} with Money ${winner.money}, Sanity ${winner.sanity}, Freedom ${winner.freedom}, and Influence ${winner.influence}.</p>
    <div class="share-stats">
      <div><span>Ending</span><strong>${ending}</strong></div>
      <div><span>Panic Collapses</span><strong>${state.meterCollapses.panic}</strong></div>
      <div><span>Control Collapses</span><strong>${state.meterCollapses.control}</strong></div>
      <div><span>Market Collapses</span><strong>${state.meterCollapses.market}</strong></div>
      <div><span>Choices</span><strong>${state.playtest.choicesResolved}/${state.playtest.choicesPresented}</strong></div>
      <div><span>NPC Events</span><strong>${state.playtest.npcEvents}</strong></div>
    </div>
    <button class="button" type="button" onclick="resetGame()">Start New Game</button>
  `;
}

function renderV017Meters() {
  const dashboard = document.getElementById("chaosDashboard");
  if (!dashboard) return;
  let panel = document.getElementById("v017Meters");
  if (!state.started) {
    panel?.remove();
    return;
  }
  dashboard.classList.remove("hidden");
  if (!panel) {
    panel = document.createElement("article");
    panel.id = "v017Meters";
    panel.className = "chaos-meter-card";
    dashboard.prepend(panel);
  }
  panel.innerHTML = `
    <p class="eyebrow">v0.17 Tabletop Meters</p>
    <h2>P ${state.meters.panic}/6 · C ${state.meters.control}/6 · M ${state.meters.market}/6</h2>
    <p>Panic collapses: ${state.meterCollapses.panic} · Control collapses: ${state.meterCollapses.control} · Market collapses: ${state.meterCollapses.market}</p>
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
  const winnerExists = state.players.some(p => p.winner);
  els.currentPlayerName.textContent = `${player.name} (${player.token})`;
  els.currentSpace.textContent = `Space ${player.position}: ${space.name} - ${space.space_type || space.type}`;
  els.turnSummary.textContent = state.lastSummary || "Ready.";
  els.lastRoll.textContent = state.lastRoll || "—";
  els.cycleBtn.textContent = state.cycle;
  els.cycleBtn.className = state.cycle === "Red Cycle" ? "cycle-btn red" : "cycle-btn blue";
  els.turnLog.value = state.log.join("\n");
  els.rollBtn.disabled = Boolean(state.hasRolledThisTurn || player.winner || winnerExists);
  els.rollBtn.textContent = state.hasRolledThisTurn ? "Roll Used This Turn" : "Roll & Move";
  els.endTurnBtn.classList.toggle("pulse", Boolean(state.hasRolledThisTurn && !winnerExists));

  renderBoard();
  renderPlayers();
  renderCardHistory();
  renderActiveCard();
  renderWinner();
  renderV017Meters();
}

els.playerCount.addEventListener("change", renderSetup);
els.startGameBtn.addEventListener("click", startGame);
els.resetGameBtn.addEventListener("click", resetGame);
els.cycleBtn.addEventListener("click", () => toggleCycle("manual toggle"));
els.rollBtn.addEventListener("click", rollAndMove);
els.endTurnBtn.addEventListener("click", nextTurn);
els.exportBtn.addEventListener("click", exportNotes);

document.addEventListener("click", event => {
  const choiceButton = event.target.closest(".choice-resolve");
  if (choiceButton) resolveChoice(choiceButton.dataset.choice);
});

document.querySelectorAll(".manual-tools button").forEach(button => {
  button.addEventListener("click", () => {
    const player = getCurrentPlayer();
    adjustStat(player, button.dataset.stat, Number(button.dataset.delta));
  });
});

renderSetup();
render();
