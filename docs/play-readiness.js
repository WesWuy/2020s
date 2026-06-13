// Prototype v0.11 Public Playtest Readiness.
// Adds quick start, 60-second rules, chaos tuning, card tags, known notes, and feedback links.

const READINESS = {
  setupPanel: document.getElementById("setupPanel"),
  gamePanel: document.getElementById("gamePanel"),
  quickStartBtn: null,
  chaosLevelSelect: null,
  chaosLevelDescription: null,
  statusPanel: null
};

const ISSUE_LINKS = {
  feedback: "https://github.com/WesWuy/2020s/issues/new?template=playtest-feedback.md",
  bug: "https://github.com/WesWuy/2020s/issues/new?template=broken-rule.md",
  card: "https://github.com/WesWuy/2020s/issues/new?template=card-idea.md",
  balance: "https://github.com/WesWuy/2020s/issues/new?template=balance-issue.md"
};

const CHAOS_LEVELS = {
  mild: {
    label: "Mild",
    description: "Fewer interruptions. Better for first-time players learning the loop.",
    realityMultiplier: 0.55,
    scandalMultiplier: 0.55,
    newsChance: 0.06,
    lowRealityNewsChance: 0.25
  },
  unhinged: {
    label: "Unhinged",
    description: "Recommended default. Chaotic, but still playable.",
    realityMultiplier: 1,
    scandalMultiplier: 1,
    newsChance: 0.18,
    lowRealityNewsChance: 1
  },
  apocalyptic: {
    label: "Apocalyptic",
    description: "Maximum nonsense. Use when the table wants the machine to misbehave.",
    realityMultiplier: 1.45,
    scandalMultiplier: 1.55,
    newsChance: 0.3,
    lowRealityNewsChance: 1
  }
};

function storedChaosLevel() {
  return localStorage.getItem("twentiesChaosLevel") || state.chaosLevel || "unhinged";
}

function setChaosLevel(level) {
  const safeLevel = CHAOS_LEVELS[level] ? level : "unhinged";
  localStorage.setItem("twentiesChaosLevel", safeLevel);
  state.chaosLevel = safeLevel;
  if (READINESS.chaosLevelSelect) READINESS.chaosLevelSelect.value = safeLevel;
  if (READINESS.chaosLevelDescription) READINESS.chaosLevelDescription.textContent = CHAOS_LEVELS[safeLevel].description;
  saveState();
  renderReadinessStatus();
}

function injectReadinessSetup() {
  if (!READINESS.setupPanel || document.getElementById("quickStartBtn")) return;

  const quickStart = document.createElement("section");
  quickStart.className = "readiness-panel quickstart-panel";
  quickStart.innerHTML = `
    <p class="eyebrow">Fastest Way In</p>
    <h3>Quick Start Chaos</h3>
    <p>Instantly starts a 3-player game with Crypto Bro, The Prepper, and The Influencer. Use this when sending the prototype to someone who just wants to try it.</p>
    <div class="cta-row left">
      <button id="quickStartBtn" class="button" type="button">Quick Start Chaos</button>
    </div>
  `;
  READINESS.setupPanel.insertBefore(quickStart, READINESS.setupPanel.children[2] || null);

  const howTo = document.createElement("section");
  howTo.className = "readiness-panel how-to-panel";
  howTo.innerHTML = `
    <p class="eyebrow">How to Play in 60 Seconds</p>
    <ol class="quick-rules">
      <li>Roll once.</li>
      <li>Move forward.</li>
      <li>Resolve the space.</li>
      <li>Draw a card when told.</li>
      <li>Keep Sanity, Money, and Influence above 0.</li>
      <li>Reach 2030 to win.</li>
      <li>The Chaos Engine makes everything worse.</li>
    </ol>
  `;
  quickStart.insertAdjacentElement("afterend", howTo);

  const tuning = document.createElement("section");
  tuning.className = "readiness-panel chaos-settings-panel";
  tuning.innerHTML = `
    <p class="eyebrow">Playtest Tuning</p>
    <h3>Chaos Level</h3>
    <label for="chaosLevelSelect"><strong>Choose chaos intensity</strong></label>
    <select id="chaosLevelSelect">
      <option value="mild">Mild — fewer interruptions</option>
      <option value="unhinged">Unhinged — recommended default</option>
      <option value="apocalyptic">Apocalyptic — maximum nonsense</option>
    </select>
    <p id="chaosLevelDescription" class="setup-hint"></p>
  `;
  howTo.insertAdjacentElement("afterend", tuning);

  const notes = document.createElement("section");
  notes.className = "readiness-panel known-notes-panel";
  notes.innerHTML = `
    <p class="eyebrow">Known Playtest Notes</p>
    <ul>
      <li>Some cards intentionally require table judgment.</li>
      <li>Balance is still loose while the funny parts are being tested.</li>
      <li>Chaos frequency is now tunable but still needs real table feedback.</li>
      <li>Mobile layout is playable, not final.</li>
    </ul>
  `;
  const daily = document.getElementById("dailyChaosCard");
  if (daily) daily.insertAdjacentElement("afterend", notes);
  else READINESS.setupPanel.appendChild(notes);

  READINESS.quickStartBtn = document.getElementById("quickStartBtn");
  READINESS.chaosLevelSelect = document.getElementById("chaosLevelSelect");
  READINESS.chaosLevelDescription = document.getElementById("chaosLevelDescription");

  READINESS.quickStartBtn?.addEventListener("click", quickStartChaos);
  READINESS.chaosLevelSelect?.addEventListener("change", event => setChaosLevel(event.target.value));
  setChaosLevel(storedChaosLevel());
}

function characterIndexByName(name) {
  const index = GAME.characters.findIndex(character => character.name === name);
  return index >= 0 ? index : 0;
}

function createReadyPlayer(id, name, characterName) {
  const characterIndex = characterIndexByName(characterName);
  const character = GAME.characters[characterIndex];
  return {
    id,
    token: TOKEN_LABELS[id] || String(id + 1),
    name,
    characterIndex,
    position: 1,
    sanity: character.stats.sanity,
    money: character.stats.money,
    influence: character.stats.influence,
    skipNextTurn: false,
    shadowbanned: false,
    winner: false
  };
}

function quickStartChaos() {
  const level = storedChaosLevel();
  state = {
    started: true,
    cycle: Math.random() > 0.5 ? "Red Cycle" : "Blue Cycle",
    chaosLevel: level,
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    hasRolledThisTurn: false,
    lastSummary: "Quick Start Chaos started. Roll once, resolve the space, then end the turn.",
    activeCard: null,
    players: [
      createReadyPlayer(0, "Player 1", "Crypto Bro"),
      createReadyPlayer(1, "Player 2", "The Prepper"),
      createReadyPlayer(2, "Player 3", "The Influencer")
    ],
    cardHistory: [],
    log: [],
    quickStart: true
  };
  log(`Quick Start Chaos launched in ${state.cycle} with Chaos Level: ${CHAOS_LEVELS[level].label}.`);
  saveState();
  render();
  if (typeof setTicker === "function") setTicker(`QUICK START CHAOS: ${CHAOS_LEVELS[level].label} mode engaged.`);
}

// Attach chaos level to normal Start Game and Daily Chaos starts after their own handlers run.
els.startGameBtn?.addEventListener("click", () => {
  setTimeout(() => {
    if (!state.started) return;
    state.chaosLevel = storedChaosLevel();
    log(`Chaos Level set to ${CHAOS_LEVELS[state.chaosLevel].label}.`);
    saveState();
    render();
  }, 0);
});

const playDailyButton = document.getElementById("playDailyBtn");
playDailyButton?.addEventListener("click", () => {
  setTimeout(() => {
    if (!state.started) return;
    state.chaosLevel = storedChaosLevel();
    log(`Daily Chaos using Chaos Level: ${CHAOS_LEVELS[state.chaosLevel].label}.`);
    saveState();
    render();
  }, 0);
});

const originalReadinessApplyChaosDelta = applyChaosDelta;
applyChaosDelta = function tunedChaosDelta(realityDelta, scandalDelta, reason) {
  const level = state.chaosLevel || storedChaosLevel();
  const config = CHAOS_LEVELS[level] || CHAOS_LEVELS.unhinged;
  const tunedReality = Math.round(realityDelta * config.realityMultiplier);
  const tunedScandal = Math.round(scandalDelta * config.scandalMultiplier);
  return originalReadinessApplyChaosDelta(tunedReality, tunedScandal, reason);
};

maybeBreakingNews = function tunedBreakingNews(player) {
  const chaos = ensureChaosState();
  if (!chaos || state.players.some(p => p.winner)) return;
  const level = state.chaosLevel || storedChaosLevel();
  const config = CHAOS_LEVELS[level] || CHAOS_LEVELS.unhinged;
  const lowReality = chaos.reality <= 35;
  const trigger = Math.random() < config.newsChance || (lowReality && Math.random() < config.lowRealityNewsChance);
  if (!trigger) return;

  const stories = typeof BREAKING_NEWS !== "undefined" ? BREAKING_NEWS : [];
  if (!stories.length) return;
  const story = stories[Math.floor(Math.random() * stories.length)];
  chaos.breakingInterruptions += 1;
  applyChaosDelta(-5, 12, `Breaking News: ${story.title}`);
  story.effect(player);
  showBreakingNews(story.title, story.text);
};

function tagsForCard(card) {
  const text = `${card?.title || ""} ${card?.text || ""}`.toLowerCase();
  const tags = [];
  if (text.includes("table action")) tags.push("Table Action");
  if (text.includes("audience vote") || text.includes("table votes")) tags.push("Audience Vote");
  if (text.includes("lose")) tags.push("Stat Loss");
  if (text.includes("gain")) tags.push("Stat Gain");
  if (text.includes("all players") || text.includes("every player")) tags.push("Group Effect");
  if (text.includes("move")) tags.push("Movement");
  if (text.includes("cycle") || text.includes("red cycle") || text.includes("blue cycle")) tags.push("Cycle");
  if (text.includes("final") || card?.deckName === "Final Reckoning") tags.push("Finale");
  if (!tags.length) tags.push("Table Judgment");
  return [...new Set(tags)].slice(0, 4);
}

function tagMarkup(card) {
  return `<div class="card-tags">${tagsForCard(card).map(tag => `<span class="card-tag">${tag}</span>`).join("")}</div>`;
}

const originalReadinessRenderActiveCard = renderActiveCard;
renderActiveCard = function readinessRenderActiveCard() {
  originalReadinessRenderActiveCard();
  if (!state.activeCard || els.activeCard.classList.contains("hidden")) return;
  if (!els.activeCard.querySelector(".card-tags")) els.activeCard.insertAdjacentHTML("beforeend", tagMarkup(state.activeCard));
};

const originalReadinessRenderCardHistory = renderCardHistory;
renderCardHistory = function readinessRenderCardHistory() {
  originalReadinessRenderCardHistory();
  const historyCards = els.cardHistory.querySelectorAll(".history-card");
  historyCards.forEach((element, index) => {
    const card = state.cardHistory[index];
    if (card && !element.querySelector(".card-tags")) element.insertAdjacentHTML("beforeend", tagMarkup(card));
  });
};

function renderReadinessStatus() {
  if (!state.started || !READINESS.gamePanel) return;
  let panel = document.getElementById("playtestStatusPanel");
  if (!panel) {
    panel = document.createElement("section");
    panel.id = "playtestStatusPanel";
    panel.className = "readiness-status-panel";
    READINESS.gamePanel.insertBefore(panel, READINESS.gamePanel.firstElementChild);
  }
  READINESS.statusPanel = panel;
  const level = state.chaosLevel || storedChaosLevel();
  panel.classList.remove("hidden");
  panel.innerHTML = `
    <div><strong>Public Playtest Mode:</strong> ${state.quickStart ? "Quick Start" : "Custom Setup"}</div>
    <div><strong>Chaos Level:</strong> ${CHAOS_LEVELS[level].label}</div>
    <div><strong>Card Tags:</strong> Enabled</div>
  `;
}

function renderFeedbackPanel() {
  const winner = state.players?.find(player => player.winner);
  if (!winner || document.getElementById("playtestFeedbackPanel")) return;
  const panel = document.createElement("section");
  panel.id = "playtestFeedbackPanel";
  panel.className = "feedback-panel";
  panel.innerHTML = `
    <p class="eyebrow">Playtest Feedback</p>
    <h3>Help tune the chaos.</h3>
    <p>Use these after a real table test. Best feedback: what confused people, what made them laugh, what felt too punishing, and which cards need work.</p>
    <div class="feedback-actions">
      <a class="button" href="${ISSUE_LINKS.feedback}" target="_blank" rel="noopener">Submit Playtest Feedback</a>
      <a class="button secondary" href="${ISSUE_LINKS.bug}" target="_blank" rel="noopener">Report Bug</a>
      <a class="button secondary" href="${ISSUE_LINKS.card}" target="_blank" rel="noopener">Submit Card Idea</a>
      <a class="button secondary" href="${ISSUE_LINKS.balance}" target="_blank" rel="noopener">Balance Feedback</a>
    </div>
  `;
  els.winnerPanel.appendChild(panel);
}

const originalReadinessRender = render;
render = function readinessRender() {
  originalReadinessRender();
  renderReadinessStatus();
  renderFeedbackPanel();
};

injectReadinessSetup();
render();
