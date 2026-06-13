// Prototype v0.8 Chaos Engine.
// Adds Reality Stability, Scandal Meter, Villain of the Week, Forbidden Phrase, breaking interruptions, the Do Not Press button, and player roasts.

const CHAOS = {
  dashboard: document.getElementById("chaosDashboard"),
  realityValue: document.getElementById("realityValue"),
  realityFill: document.getElementById("realityFill"),
  scandalValue: document.getElementById("scandalValue"),
  scandalFill: document.getElementById("scandalFill"),
  villainName: document.getElementById("villainName"),
  villainReason: document.getElementById("villainReason"),
  forbiddenPhrase: document.getElementById("forbiddenPhrase"),
  phrasePenaltyBtn: document.getElementById("phrasePenaltyBtn"),
  doNotPressBtn: document.getElementById("doNotPressBtn"),
  overlay: document.getElementById("breakingNewsOverlay"),
  overlayTitle: document.getElementById("breakingNewsTitle"),
  overlayText: document.getElementById("breakingNewsText"),
  overlayClose: document.getElementById("closeBreakingNewsBtn")
};

const FORBIDDEN_PHRASES = [
  "Do your own research",
  "Actually...",
  "This is unprecedented",
  "Trust the plan",
  "Source?",
  "Let me explain",
  "Late-stage capitalism",
  "Mainstream media",
  "Just asking questions",
  "The algorithm",
  "Both sides",
  "I saw a thread about this"
];

const BREAKING_NEWS = [
  {
    title: "A Billionaire Purchased the Concept of Time",
    text: "All players lose 1 Sanity. Crypto Bro gains 1 Money for calling it bullish.",
    effect(player) {
      state.players.forEach(p => quickAdjust(p, "sanity", -1, "Breaking News: time was privatized"));
      state.players.forEach(p => {
        if (GAME.characters[p.characterIndex].name === "Crypto Bro") quickAdjust(p, "money", 1, "Called privatized time bullish");
      });
    }
  },
  {
    title: "Celebrity Issues Notes App Apology",
    text: "Influencers gain 1 Influence. Everyone else loses patience, but not enough to uninstall the app.",
    effect(player) {
      state.players.forEach(p => {
        if (GAME.characters[p.characterIndex].name === "The Influencer") quickAdjust(p, "influence", 1, "Notes App apology wave");
      });
    }
  },
  {
    title: "The Timeline Issued a Correction",
    text: "The player furthest ahead moves back 3 spaces. The correction receives 12 likes.",
    effect(player) {
      const leader = [...state.players].sort((a, b) => b.position - a.position)[0];
      if (leader) {
        leader.position = Math.max(1, leader.position - 3);
        log(`${leader.name} was timeline-corrected back 3 spaces.`);
      }
    }
  },
  {
    title: "Experts Are Concerned",
    text: "Current player loses 1 Sanity. Bureaucrats gain 1 Influence for forming a committee.",
    effect(player) {
      quickAdjust(player, "sanity", -1, "Experts were concerned");
      state.players.forEach(p => {
        if (GAME.characters[p.characterIndex].name === "The Bureaucrat") quickAdjust(p, "influence", 1, "Formed a committee");
      });
    }
  },
  {
    title: "The Group Chat Has Leaked",
    text: "Scandal rises. The player with the most Influence becomes even more suspicious.",
    effect(player) {
      const villain = getVillainCandidate();
      if (villain) quickAdjust(villain, "sanity", -1, "Group chat leak pressure");
    }
  }
];

function chaosHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function defaultChaosState() {
  return {
    reality: 100,
    scandal: 0,
    villainId: null,
    villainRound: 0,
    forbiddenPhrase: FORBIDDEN_PHRASES[0],
    forbiddenRound: 0,
    doNotPresses: 0,
    breakingInterruptions: 0,
    realityCollapses: 0,
    scandalOverloads: 0
  };
}

function ensureChaosState() {
  if (!state.started) return null;
  if (!state.chaos) state.chaos = defaultChaosState();
  state.chaos.reality = clampPercent(state.chaos.reality ?? 100);
  state.chaos.scandal = clampPercent(state.chaos.scandal ?? 0);
  if (!state.chaos.forbiddenPhrase) state.chaos.forbiddenPhrase = FORBIDDEN_PHRASES[0];
  return state.chaos;
}

function chooseForbiddenPhrase(round) {
  return FORBIDDEN_PHRASES[chaosHash(`${round}-${dailyDateKey?.() || "timeline"}`) % FORBIDDEN_PHRASES.length];
}

function getVillainCandidate() {
  if (!state.players?.length) return null;
  return [...state.players].sort((a, b) => {
    const influenceDiff = b.influence - a.influence;
    if (influenceDiff !== 0) return influenceDiff;
    return b.position - a.position;
  })[0];
}

function updateRoundChaos() {
  const chaos = ensureChaosState();
  if (!chaos || state.players.some(p => p.winner)) return;

  if (chaos.forbiddenRound !== state.turn) {
    chaos.forbiddenRound = state.turn;
    chaos.forbiddenPhrase = chooseForbiddenPhrase(state.turn);
    log(`Forbidden Phrase for Round ${state.turn}: "${chaos.forbiddenPhrase}".`);
  }

  if (chaos.villainRound !== state.turn) {
    chaos.villainRound = state.turn;
    const villain = getVillainCandidate();
    if (villain) {
      const wasNew = chaos.villainId !== villain.id;
      chaos.villainId = villain.id;
      log(`Villain of the Week: ${villain.name}. Reason: too much Influence, not enough shame.`);
      if (state.turn > 1 && wasNew) {
        quickAdjust(villain, "influence", 1, "Villain of the Week attention");
        quickAdjust(villain, "sanity", -1, "Villain of the Week pressure");
        setSummary(`${villain.name} became Villain of the Week: +1 Influence, -1 Sanity.`);
      }
    }
  }
  saveState();
}

function applyChaosDelta(realityDelta, scandalDelta, reason) {
  const chaos = ensureChaosState();
  if (!chaos) return;
  const oldReality = chaos.reality;
  const oldScandal = chaos.scandal;
  chaos.reality = clampPercent(chaos.reality + realityDelta);
  chaos.scandal = clampPercent(chaos.scandal + scandalDelta);
  log(`Chaos Engine: ${reason}. Reality ${oldReality}% to ${chaos.reality}%. Scandal ${oldScandal}% to ${chaos.scandal}%.`);

  if (chaos.scandal >= 100) scandalOverload();
  if (chaos.reality <= 0) realityCollapse();
  saveState();
}

function scandalOverload() {
  const chaos = ensureChaosState();
  if (!chaos) return;
  chaos.scandal = 0;
  chaos.scandalOverloads += 1;
  const villain = getVillainCandidate();
  state.players.forEach(p => quickAdjust(p, "sanity", -1, "Scandal Overload"));
  if (villain) quickAdjust(villain, "influence", 1, "Villain benefited from Scandal Overload");
  showBreakingNews("SCANDAL OVERLOAD", "All players lose 1 Sanity. The Villain of the Week gains 1 Influence because attention is still attention.");
  setSummary("Scandal Overload: everyone loses 1 Sanity. The villain gets stronger.");
}

function realityCollapse() {
  const chaos = ensureChaosState();
  if (!chaos) return;
  chaos.reality = 52;
  chaos.realityCollapses += 1;
  state.cycle = state.cycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
  state.players.forEach(p => {
    const oldMoney = p.money;
    p.money = p.influence;
    p.influence = oldMoney;
    p.sanity = clampStat(p.sanity - 1);
    checkZeroStats(p);
  });
  showBreakingNews("REALITY COLLAPSE", "The board cycle flips. Everyone swaps Money and Influence. Everyone loses 1 Sanity. Historians request a wellness day.");
  log("Reality Collapse triggered: board cycle flipped, Money and Influence swapped, all players lost 1 Sanity.");
  setSummary("Reality Collapse: cycle flipped, Money/Influence swapped, all players lost 1 Sanity.");
}

function showBreakingNews(title, text) {
  if (!CHAOS.overlay) return;
  CHAOS.overlayTitle.textContent = title;
  CHAOS.overlayText.textContent = text;
  CHAOS.overlay.classList.remove("hidden");
  if (typeof setTicker === "function") setTicker(`UNSCHEDULED INTERRUPTION: ${title}`);
}

function closeBreakingNews() {
  CHAOS.overlay?.classList.add("hidden");
}

function maybeBreakingNews(player) {
  const chaos = ensureChaosState();
  if (!chaos || state.players.some(p => p.winner)) return;
  const trigger = Math.random() < 0.18 || chaos.reality <= 35;
  if (!trigger) return;

  const story = BREAKING_NEWS[Math.floor(Math.random() * BREAKING_NEWS.length)];
  chaos.breakingInterruptions += 1;
  applyChaosDelta(-5, 12, `Breaking News: ${story.title}`);
  story.effect(player);
  showBreakingNews(story.title, story.text);
}

function forbiddenPhrasePenalty() {
  if (!state.started || state.players.some(p => p.winner)) return;
  const player = getCurrentPlayer();
  quickAdjust(player, "sanity", -1, `Said forbidden phrase: ${state.chaos?.forbiddenPhrase || "unknown"}`);
  applyChaosDelta(-3, 5, `${player.name} said the Forbidden Phrase`);
  setSummary(`${player.name} said the Forbidden Phrase and lost 1 Sanity.`);
  render();
}

function doNotPress() {
  if (!state.started || state.players.some(p => p.winner)) return;
  const chaos = ensureChaosState();
  const player = getCurrentPlayer();
  chaos.doNotPresses += 1;
  state.cycle = state.cycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle";
  quickAdjust(player, "sanity", -1, "Pressed the button they should not press");
  quickAdjust(player, "influence", 1, "Everyone watched them press the button");
  applyChaosDelta(-18, 25, `${player.name} pressed the Do Not Press button`);
  log(`${player.name} pressed the forbidden button. Board cycle flipped and Hidden Hand was summoned.`);
  setSummary(`${player.name} pressed the forbidden button. Of course they did.`);
  showBreakingNews("YOU PRESSED IT", "Lose 1 Sanity. Gain 1 Influence. Flip the board cycle. Draw Hidden Hand. This is why we cannot have normal timelines.");
  handleCardDraw("Hidden Hand", player);
  render();
}

const originalChaosHandleCardDraw = handleCardDraw;
handleCardDraw = function chaosHandleCardDraw(deckName, player) {
  originalChaosHandleCardDraw(deckName, player);
  if (!state.started || state.players.some(p => p.winner)) return;

  const impact = {
    "Global Chaos": [-5, 10],
    "Media Meltdown": [-6, 24],
    "Hidden Hand": [-8, 20],
    "Political Flip": [-10, 16],
    "Final Reckoning": [-14, 30]
  }[deckName] || [-3, 6];

  applyChaosDelta(impact[0], impact[1], `${deckName} card drawn`);
  maybeBreakingNews(player);
  render();
};

function renderChaosDashboard() {
  const chaos = ensureChaosState();
  if (!CHAOS.dashboard) return;

  if (!state.started || !chaos) {
    CHAOS.dashboard.classList.add("hidden");
    return;
  }

  updateRoundChaos();
  const villain = state.players.find(p => p.id === chaos.villainId) || getVillainCandidate();
  CHAOS.dashboard.classList.remove("hidden");
  CHAOS.realityValue.textContent = `${chaos.reality}%`;
  CHAOS.realityFill.style.width = `${chaos.reality}%`;
  CHAOS.scandalValue.textContent = `${chaos.scandal}%`;
  CHAOS.scandalFill.style.width = `${chaos.scandal}%`;
  CHAOS.villainName.textContent = villain ? villain.name : "Pending";
  CHAOS.villainReason.textContent = villain ? "Too much Influence, not enough shame." : "Too early to blame anyone.";
  CHAOS.forbiddenPhrase.textContent = `“${chaos.forbiddenPhrase}”`;
}

function roastPlayer(player) {
  const character = GAME.characters[player.characterIndex].name;
  if (player.winner) return "Won the decade. This will be used against them in future arguments.";
  if (player.sanity <= 1) return "Mentally still buffering somewhere between 2024 and a comment thread.";
  if (player.money <= 1) return "Spiritually wealthy. Financially in a deleted spreadsheet.";
  if (player.influence <= 1) return "Technically present, algorithmically invisible.";
  if (character === "Crypto Bro") return "Still early. Still explaining the chart. Still not blinking.";
  if (character === "The Prepper") return "Had the pantry ready but forgot people are the real emergency.";
  if (character === "The Influencer") return "Turned instability into content and called it healing.";
  if (character === "The Bureaucrat") return "Survived by creating a process nobody understood.";
  if (character === "The Wellness Guru") return "Breathed through the collapse and charged for the workshop.";
  if (character === "The Podcaster") return "Asked questions until reality filed a noise complaint.";
  return "Survived with enough plausible deniability to keep playing.";
}

function renderRoastResults() {
  const winner = state.players?.find(p => p.winner);
  if (!winner || document.getElementById("roastResults")) return;
  const chaos = ensureChaosState();
  const wrap = document.createElement("section");
  wrap.id = "roastResults";
  wrap.className = "roast-results";
  wrap.innerHTML = `
    <p class="eyebrow">Post-Game Roast Results</p>
    <h3>Everyone gets judged by the timeline.</h3>
    <div>
      <span class="chaos-chip">Reality Collapses: ${chaos?.realityCollapses || 0}</span>
      <span class="chaos-chip">Scandal Overloads: ${chaos?.scandalOverloads || 0}</span>
      <span class="chaos-chip">Forbidden Button Presses: ${chaos?.doNotPresses || 0}</span>
    </div>
    ${state.players.map(p => `
      <article class="roast-card">
        <strong>${p.name}</strong> — ${GAME.characters[p.characterIndex].name}<br>
        ${roastPlayer(p)}
      </article>
    `).join("")}
  `;
  els.winnerPanel.appendChild(wrap);
}

const originalChaosRender = render;
render = function chaosRender() {
  originalChaosRender();
  renderChaosDashboard();
  renderRoastResults();
};

CHAOS.overlayClose?.addEventListener("click", closeBreakingNews);
CHAOS.overlay?.addEventListener("click", event => {
  if (event.target === CHAOS.overlay) closeBreakingNews();
});
CHAOS.phrasePenaltyBtn?.addEventListener("click", forbiddenPhrasePenalty);
CHAOS.doNotPressBtn?.addEventListener("click", doNotPress);
els.cycleBtn?.addEventListener("click", () => {
  setTimeout(() => {
    if (state.started && !state.players.some(p => p.winner)) applyChaosDelta(-6, 8, "Manual board cycle change");
  }, 0);
});

render();
