// Prototype v0.17 Daily Chaos Mode.
// Generates one deterministic daily challenge from the local date. No backend required.

const DAILY = {
  card: document.getElementById("dailyChaosCard"),
  title: document.getElementById("dailyChaosTitle"),
  meta: document.getElementById("dailyChaosMeta"),
  rule: document.getElementById("dailyChaosRule"),
  playBtn: document.getElementById("playDailyBtn"),
  copyBtn: document.getElementById("copyDailyBtn"),
  banner: document.getElementById("dailyModeBanner")
};

const DAILY_TEMPLATES = [
  {
    name: "Influencer Apocalypse",
    character: "The Influencer",
    cycle: "Blue Cycle",
    ruleId: "scandalDoubleFirst",
    rule: "The first Scandal draw triggers one bonus Scandal draw.",
    goalId: "influence5",
    goal: "Survive with Influence 5+."
  },
  {
    name: "Prepper Vindication Day",
    character: "The Prepper",
    cycle: "Red Cycle",
    ruleId: "marketChaos",
    rule: "Market Crash spaces draw Headline instead of acting normal.",
    goalId: "freedom4",
    goal: "Survive with Freedom 4+."
  },
  {
    name: "Crypto Winter Reversal",
    character: "The Crypto Bro",
    cycle: "Red Cycle",
    ruleId: "cryptoWinter",
    rule: "Money gains and losses from cards are doubled.",
    goalId: "money4",
    goal: "Survive with Money 4+."
  },
  {
    name: "Remote Work Forever-ish",
    character: "The Remote Worker",
    cycle: "Blue Cycle",
    ruleId: "headlinePressure",
    rule: "Headline cards hit the current player with 1 extra Sanity loss.",
    goalId: "sanity5",
    goal: "Survive with Sanity 5+."
  },
  {
    name: "Activist Pressure Cooker",
    character: "The Activist",
    cycle: "Blue Cycle",
    ruleId: "controlTax",
    rule: "Every Scandal costs the current player 1 Freedom after resolving.",
    goalId: "influence5",
    goal: "Survive with Influence 5+."
  },
  {
    name: "Normie Final Exam",
    character: "The Normie",
    cycle: "Red Cycle",
    ruleId: "conspiracyHurts",
    rule: "Conspiracy cards also cost the current player 1 Sanity.",
    goalId: "balanced",
    goal: "Survive with all four stats at 3+."
  }
];

function dailyDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getDailyChallenge() {
  const dateKey = dailyDateKey();
  const index = hashString(dateKey) % DAILY_TEMPLATES.length;
  return {
    ...DAILY_TEMPLATES[index],
    dateKey,
    label: new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
    ruleUsed: false
  };
}

function getCharacterIndex(name) {
  const index = GAME.characters.findIndex(c => c.name === name);
  return index >= 0 ? index : 0;
}

function renderDailySetup() {
  const challenge = getDailyChallenge();
  DAILY.title.textContent = challenge.name;
  DAILY.meta.textContent = `${challenge.label} — Required character: ${challenge.character}. Starting cycle: ${challenge.cycle}.`;
  DAILY.rule.innerHTML = `<strong>Special Rule:</strong> ${challenge.rule}<br><strong>Goal:</strong> ${challenge.goal}`;
}

function startDailyChaos() {
  const challenge = getDailyChallenge();
  const count = Math.max(2, Number(els.playerCount.value) || 3);
  const requiredIndex = getCharacterIndex(challenge.character);
  const players = [];

  for (let i = 0; i < count; i++) {
    const characterIndex = i === 0 ? requiredIndex : (requiredIndex + i) % GAME.characters.length;
    players.push(createPlayerFromCharacter(i, i === 0 ? "Daily Challenger" : `Rival ${i + 1}`, characterIndex));
  }

  state = {
    started: true,
    cycle: challenge.cycle,
    currentPlayer: 0,
    turn: 1,
    lastRoll: null,
    hasRolledThisTurn: false,
    lastSummary: `Daily Chaos started: ${challenge.name}. ${challenge.goal}`,
    activeCard: null,
    players,
    cardHistory: [],
    log: [],
    meters: { panic: 0, control: 0, market: 0 },
    meterCollapses: { panic: 0, control: 0, market: 0 },
    playtest: { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 },
    dailyChallenge: challenge
  };

  players.forEach(player => {
    const character = GAME.characters[player.characterIndex];
    const survivalCount = character.name === "The Prepper" ? 2 : 1;
    for (let i = 0; i < survivalCount; i++) dealSurvivalCard(player, "daily opening hand");
  });

  log(`Daily Chaos started: ${challenge.name} (${challenge.dateKey}). Required character: ${challenge.character}. Rule: ${challenge.rule}`);
  saveState();
  render();
  if (typeof setTicker === "function") setTicker(`Daily Chaos: ${challenge.name}. ${challenge.goal}`);
}

function dailyChallengeText() {
  const challenge = getDailyChallenge();
  return `Daily Chaos — ${challenge.label}\n\n${challenge.name}\nRequired Character: ${challenge.character}\nStarting Cycle: ${challenge.cycle}\nSpecial Rule: ${challenge.rule}\nGoal: ${challenge.goal}\n\nCan you survive today's timeline?\nhttps://weswuy.github.io/2020s/play.html`;
}

function copyDailyChallenge() {
  const text = dailyChallengeText();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof showToast === "function") showToast("Daily Challenge copied.");
      else alert("Daily Challenge copied.");
    }).catch(() => prompt("Copy this Daily Challenge:", text));
  } else {
    prompt("Copy this Daily Challenge:", text);
  }
}

function getActiveDaily() {
  return state.dailyChallenge || null;
}

function renderDailyBanner() {
  const challenge = getActiveDaily();
  if (!DAILY.banner) return;

  if (!state.started || !challenge) {
    DAILY.banner.classList.add("hidden");
    DAILY.banner.innerHTML = "";
    return;
  }

  DAILY.banner.classList.remove("hidden");
  DAILY.banner.innerHTML = `
    <p class="eyebrow">Daily Chaos Active</p>
    <h2>${challenge.name}</h2>
    <p>${challenge.label}</p>
    <div class="daily-mode-grid">
      <div><span>Required Character</span><strong>${challenge.character}</strong></div>
      <div><span>Starting Cycle</span><strong>${challenge.cycle}</strong></div>
      <div><span>Goal</span><strong>${challenge.goal}</strong></div>
      <div><span>Special Rule</span><strong>${challenge.rule}</strong></div>
    </div>
  `;
}

function evaluateDailyGoal(winner, challenge) {
  if (!winner || !challenge) return false;
  if (challenge.goalId === "influence5") return winner.influence >= 5;
  if (challenge.goalId === "freedom4") return winner.freedom >= 4;
  if (challenge.goalId === "money4") return winner.money >= 4;
  if (challenge.goalId === "sanity5") return winner.sanity >= 5;
  if (challenge.goalId === "balanced") return STAT_KEYS.every(stat => winner[stat] >= 3);
  return true;
}

function renderDailyResult() {
  const winner = state.players?.find(p => p.winner);
  const challenge = getActiveDaily();
  if (!winner || !challenge || document.getElementById("dailyResult")) return;

  const passed = evaluateDailyGoal(winner, challenge);
  const result = document.createElement("section");
  result.id = "dailyResult";
  result.className = "daily-result";
  result.innerHTML = `
    <p class="eyebrow">Daily Chaos Result</p>
    <h3>${passed ? "Daily Goal Cleared" : "Survived, But Missed the Daily Goal"}</h3>
    <p><strong>${challenge.name}</strong> — ${challenge.goal}</p>
    <span class="daily-badge">${challenge.character}</span>
    <span class="daily-badge">${challenge.cycle}</span>
    <span class="daily-badge">${passed ? "GOAL CLEARED" : "GOAL MISSED"}</span>
    <div class="share-actions">
      <button id="copyDailyResultBtn" class="button secondary" type="button">Copy Daily Result</button>
    </div>
  `;
  els.winnerPanel.appendChild(result);

  document.getElementById("copyDailyResultBtn")?.addEventListener("click", () => {
    const text = `${winner.name} completed Daily Chaos: ${challenge.name}\nResult: ${passed ? "Goal cleared" : "Survived but missed the goal"}\nRequired Character: ${challenge.character}\nGoal: ${challenge.goal}\nStats: Money ${winner.money}, Sanity ${winner.sanity}, Freedom ${winner.freedom}, Influence ${winner.influence}\n\nTry today's challenge:\nhttps://weswuy.github.io/2020s/play.html`;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast("Daily result copied."));
    else prompt("Copy this Daily Result:", text);
  });
}

const originalDailyHandleCardDraw = handleCardDraw;
handleCardDraw = function dailyHandleCardDraw(deckName, player) {
  originalDailyHandleCardDraw(deckName, player);
  const challenge = getActiveDaily();
  if (!challenge) return;

  if (challenge.ruleId === "scandalDoubleFirst" && resolveDeckName(deckName) === "Scandal" && !challenge.ruleUsed) {
    challenge.ruleUsed = true;
    log("Daily Chaos rule triggered: bonus Scandal draw.");
    setSummary("Daily Chaos triggered: bonus Scandal draw.");
    saveState();
    originalDailyHandleCardDraw("Scandal", player);
  }

  if (challenge.ruleId === "controlTax" && resolveDeckName(deckName) === "Scandal") {
    quickAdjust(player, "freedom", -1, "Daily Chaos: Control Tax");
    setSummary(`${player.name} paid the Daily Chaos Control Tax: -1 Freedom.`);
  }

  if (challenge.ruleId === "conspiracyHurts" && resolveDeckName(deckName) === "Conspiracy") {
    quickAdjust(player, "sanity", -1, "Daily Chaos: Conspiracy backlash");
    setSummary(`${player.name} took Conspiracy backlash: -1 Sanity.`);
  }

  if (challenge.ruleId === "headlinePressure" && resolveDeckName(deckName) === "Headline") {
    quickAdjust(player, "sanity", -1, "Daily Chaos: Headline pressure");
    setSummary(`${player.name} took extra Headline pressure: -1 Sanity.`);
  }

  render();
};

const originalDailyQuickAdjust = quickAdjust;
quickAdjust = function dailyQuickAdjust(player, stat, delta, reason) {
  const challenge = getActiveDaily();
  if (challenge?.ruleId === "cryptoWinter" && stat === "money") {
    const doubled = delta * 2;
    log(`Daily Chaos rule doubled Money adjustment from ${delta} to ${doubled}.`);
    return originalDailyQuickAdjust(player, stat, doubled, reason);
  }
  return originalDailyQuickAdjust(player, stat, delta, reason);
};

const originalDailyApplySimpleSpace = applySimpleSpace;
applySimpleSpace = function dailyApplySimpleSpace(space, player) {
  const challenge = getActiveDaily();
  const type = space.space_type || space.type || "";
  if (challenge?.ruleId === "marketChaos" && type === "Market Crash") {
    log("Daily Chaos rule triggered: Market Crash became Headline.");
    setSummary("Daily Chaos: Market Crash became Headline.");
    return handleCardDraw("Headline", player);
  }
  return originalDailyApplySimpleSpace(space, player);
};

const originalDailyRender = render;
render = function dailyRender() {
  originalDailyRender();
  renderDailyBanner();
  renderDailyResult();
};

DAILY.playBtn?.addEventListener("click", startDailyChaos);
DAILY.copyBtn?.addEventListener("click", copyDailyChallenge);

renderDailySetup();
render();
