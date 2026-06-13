// Entertainment Pass for Prototype v0.5.
// Adds ticker narration, card reveal drama, stat meters, and a stronger ending screen.

const POLISH = {
  ticker: document.getElementById("tickerText"),
  overlay: document.getElementById("cardRevealOverlay"),
  revealDeck: document.getElementById("revealDeck"),
  revealTitle: document.getElementById("revealTitle"),
  revealText: document.getElementById("revealText"),
  closeRevealBtn: document.getElementById("closeRevealBtn")
};

const tickerLines = [
  "Markets confused. Experts concerned. Influencers thriving. Reality under review.",
  "Sources confirm the timeline is still technically operational.",
  "Analysts warn that vibes remain highly leveraged.",
  "Public trust futures tumble after another completely normal headline.",
  "The algorithm has declined to comment.",
  "A spokesperson says everything is fine, which made everyone more nervous.",
  "Breaking: someone on the internet is wrong again.",
  "Narrative volatility remains elevated across all known dimensions."
];

const characterStatuses = {
  "Crypto Bro": "Currently monetizing uncertainty.",
  "The Prepper": "Quietly checking the pantry.",
  "The Influencer": "Currently monetizing chaos.",
  "The Bureaucrat": "Awaiting the correct form.",
  "The Wellness Guru": "Reframing collapse as transformation.",
  "The Podcaster": "Just asking questions loudly."
};

function setTicker(message) {
  if (!POLISH.ticker) return;
  POLISH.ticker.textContent = message || tickerLines[Math.floor(Math.random() * tickerLines.length)];
}

function statLabel(stat, value) {
  if (value <= 0) {
    if (stat === "sanity") return "DOOMSCROLL MODE";
    if (stat === "money") return "BROKE";
    if (stat === "influence") return "SHADOWBANNED";
  }
  if (value === 1) return "CRITICAL";
  if (value >= 8) return "OVERPOWERED";
  return "STABLE";
}

function endingTitle(player) {
  const total = player.sanity + player.money + player.influence;
  if (total >= 24) return "Verified Prophet of the Timeline";
  if (player.influence >= 8) return "Algorithmic Overlord";
  if (player.money >= 8) return "Monetized the Collapse";
  if (player.sanity >= 8) return "Disturbingly Stable Survivor";
  if (total <= 8) return "Barely Escaped the Decade";
  return "Certified Timeline Survivor";
}

function chaosMetric(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}

function showCardReveal(card) {
  if (!POLISH.overlay || !card) return;
  POLISH.revealDeck.textContent = `BREAKING: ${card.deckName}`;
  POLISH.revealTitle.textContent = card.title;
  POLISH.revealText.textContent = card.text;
  POLISH.overlay.classList.remove("hidden");
  setTicker(`BREAKING: ${card.title}. ${card.player} is now part of the story.`);
}

function closeReveal() {
  POLISH.overlay?.classList.add("hidden");
}

POLISH.closeRevealBtn?.addEventListener("click", closeReveal);
POLISH.overlay?.addEventListener("click", event => {
  if (event.target === POLISH.overlay) closeReveal();
});

const originalPolishHandleCardDraw = handleCardDraw;
handleCardDraw = function polishedHandleCardDraw(deckName, player) {
  originalPolishHandleCardDraw(deckName, player);
  showCardReveal(state.activeCard);
};

const originalPolishRollAndMove = rollAndMove;
rollAndMove = function polishedRollAndMove() {
  originalPolishRollAndMove();
  const player = getCurrentPlayer();
  if (state.lastRoll) {
    setTicker(`${player.name} rolled ${state.lastRoll}. Reality accepts the filing, reluctantly.`);
    els.lastRoll.classList.remove("roll-flash");
    void els.lastRoll.offsetWidth;
    els.lastRoll.classList.add("roll-flash");
  }
};

const originalPolishSetSummary = setSummary;
setSummary = function polishedSetSummary(message) {
  originalPolishSetSummary(message);
  if (message) setTicker(message);
};

renderPlayers = function polishedRenderPlayers() {
  els.playersGrid.innerHTML = "";
  state.players.forEach((p, index) => {
    const character = GAME.characters[p.characterIndex];
    const space = getSpace(p.position);
    const active = index === state.currentPlayer ? " active-player" : "";
    const winner = p.winner ? " winner" : "";
    const statuses = [];

    if (p.sanity <= 1) statuses.push(`<span class="status-badge danger">${statLabel("sanity", p.sanity)}</span>`);
    if (p.money <= 1) statuses.push(`<span class="status-badge danger">${statLabel("money", p.money)}</span>`);
    if (p.influence <= 1) statuses.push(`<span class="status-badge danger">${statLabel("influence", p.influence)}</span>`);
    if (p.skipNextTurn) statuses.push(`<span class="status-badge warning">DOOMSCROLL NEXT</span>`);
    if (p.shadowbanned) statuses.push(`<span class="status-badge warning">SHADOWBANNED</span>`);
    if (p.winner) statuses.push(`<span class="status-badge warning">SURVIVED</span>`);

    const card = document.createElement("article");
    card.className = `player-card${active}${winner}`;
    card.innerHTML = `
      <div class="player-topline"><span class="token token-${p.id}">${p.token}</span><h3>${p.name}</h3></div>
      <p>${character.name}</p>
      <p class="character-flavor">${characterStatuses[character.name] || character.flavor}</p>
      <p><strong>Space ${p.position}</strong>: ${space.name}</p>
      ${renderStatMeter("Sanity", p.sanity)}
      ${renderStatMeter("Money", p.money)}
      ${renderStatMeter("Influence", p.influence)}
      <div class="status-badges">${statuses.join("")}</div>
    `;
    els.playersGrid.appendChild(card);
  });
};

function renderStatMeter(label, value) {
  const safeValue = Math.max(0, Math.min(9, value));
  const width = Math.round((safeValue / 9) * 100);
  const low = safeValue <= 2 ? " low" : "";
  return `
    <div class="stat-meter">
      <div class="stat-meter-top"><span>${label}</span><strong>${safeValue}/9</strong></div>
      <div class="stat-bar"><span class="stat-fill${low}" style="width:${width}%"></span></div>
    </div>
  `;
}

const originalPolishRenderWinner = renderWinner;
renderWinner = function polishedRenderWinner() {
  const winner = state.players.find(p => p.winner);
  if (!winner) return originalPolishRenderWinner();

  const character = GAME.characters[winner.characterIndex];
  const total = winner.sanity + winner.money + winner.influence;
  const timelineDamage = Math.min(99, 35 + total * 4 + state.cardHistory.length);
  const publicTrust = Math.max(1, 100 - timelineDamage);
  const narrativeStability = total >= 24 ? "Unsettling" : total >= 15 ? "Fragile" : "Critical";

  els.winnerPanel.classList.remove("hidden");
  els.winnerPanel.innerHTML = `
    <h2>${winner.name} survived the 2020s.</h2>
    <p>${winner.name} reached 2030 as ${character.name} with Sanity ${winner.sanity}, Money ${winner.money}, and Influence ${winner.influence}.</p>
    <span class="ending-title">${endingTitle(winner)}</span>
    <div class="chaos-score">
      ${chaosMetric("Timeline Damage", `${timelineDamage}%`)}
      ${chaosMetric("Public Trust", `${publicTrust}%`)}
      ${chaosMetric("Narrative Stability", narrativeStability)}
    </div>
    <div class="cta-row left">
      <button class="button" type="button" onclick="restartGame(false)">Restart Game</button>
      <button class="button secondary" type="button" onclick="restartGame(true)">Flip Board & Restart</button>
      <button class="button secondary" type="button" onclick="resetGame()">Clear Saved Game</button>
    </div>
  `;
  setTicker(`${winner.name} has survived the decade. Historians are refusing interviews.`);
};

const originalPolishRender = render;
render = function polishedRender() {
  originalPolishRender();
  if (!state.started) return;
  const player = getCurrentPlayer();
  const space = getSpace(player.position);
  document.title = `${player.name} at Space ${player.position} — 2020s`;
  if (!state.lastSummary) setTicker(`${player.name} is at ${space.name}. The timeline waits.`);
};

setTicker(tickerLines[0]);
render();
