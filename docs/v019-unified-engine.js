// Prototype v0.19 Unified Browser Engine
// Replaces the old v0.4-v0.11 extension stack on play.html while preserving the comic-broadcast UI.
// Core rules still live in play.js. This file adds unified QA, spectacle, share, daily, quick-start,
// Survival-card controls, Normie windows, and smoke-test diagnostics without legacy monkey-patch chains.

(function v019UnifiedEngine() {
  const VERSION = "v0.19";
  const DAILY_CHALLENGES = [
    { name: "Influencer Apocalypse", character: "The Influencer", cycle: "Blue Cycle", goal: "Survive with Influence 5+.", goalId: "influence5", rule: "The first Scandal draw adds +1 Panic.", ruleId: "firstScandalPanic" },
    { name: "Prepper Vindication Day", character: "The Prepper", cycle: "Red Cycle", goal: "Survive with Freedom 4+.", goalId: "freedom4", rule: "Market Crash spaces also deal one Survival card.", ruleId: "marketSurvival" },
    { name: "Crypto Winter Reversal", character: "The Crypto Bro", cycle: "Red Cycle", goal: "Survive with Money 4+.", goalId: "money4", rule: "Market meter starts at 3.", ruleId: "marketStart3" },
    { name: "Remote Work Forever-ish", character: "The Remote Worker", cycle: "Blue Cycle", goal: "Survive with Sanity 5+.", goalId: "sanity5", rule: "Tech Leap spaces recover 1 Sanity.", ruleId: "techSanity" },
    { name: "Activist Pressure Cooker", character: "The Activist", cycle: "Blue Cycle", goal: "Survive with Influence 5+.", goalId: "influence5", rule: "Control starts at 3.", ruleId: "controlStart3" },
    { name: "Normie Final Exam", character: "The Normie", cycle: "Red Cycle", goal: "Survive with every stat at 3+.", goalId: "balanced3", rule: "Panic, Control, and Market each start at 2.", ruleId: "allMeters2" }
  ];

  const TICKERS = [
    "Markets confused. Experts concerned. Influencers thriving. Reality under review.",
    "Sources confirm the timeline is still technically operational.",
    "Analysts warn that vibes remain highly leveraged.",
    "Public trust futures tumble after another completely normal headline.",
    "The algorithm has declined to comment.",
    "A spokesperson says everything is fine, which made everyone more nervous.",
    "Breaking: someone on the internet is wrong again.",
    "Narrative volatility remains elevated across all known dimensions."
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function label(text = "") {
    const value = String(text || "");
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Stat";
  }

  // Repair global collision from retired polish stack for any remaining references.
  statLabel = label;

  function setTicker(message) {
    const ticker = $("tickerText");
    if (ticker) ticker.textContent = message || TICKERS[Math.floor(Math.random() * TICKERS.length)];
  }

  window.setTicker = setTicker;

  function characterIndexByName(name) {
    const index = GAME.characters.findIndex(character => character.name === name);
    return index >= 0 ? index : 0;
  }

  function characterName(player) {
    return GAME.characters[player.characterIndex]?.name || "Unknown Character";
  }

  function isNormie(player) {
    return characterName(player) === "The Normie";
  }

  function ensureState() {
    if (!state) return;
    if (!state.meters) state.meters = { panic: 0, control: 0, market: 0 };
    if (!state.meterCollapses) state.meterCollapses = { panic: 0, control: 0, market: 0 };
    if (!state.playtest) state.playtest = { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 };
    if (!Array.isArray(state.cardHistory)) state.cardHistory = [];
    if (!Array.isArray(state.log)) state.log = [];
    if (!state.qa) state.qa = { smokeRuns: 0, smokeFailures: 0, lastSmoke: null };

    METER_KEYS.forEach(key => {
      state.meters[key] = clampMeter(state.meters[key]);
      state.meterCollapses[key] = Number(state.meterCollapses[key]) || 0;
    });

    state.playtest.choicesPresented = Number(state.playtest.choicesPresented) || 0;
    state.playtest.choicesResolved = Number(state.playtest.choicesResolved) || 0;
    state.playtest.npcEvents = Number(state.playtest.npcEvents) || 0;
    state.playtest.cycleSwitches = Number(state.playtest.cycleSwitches) || 0;

    state.players?.forEach(player => {
      STAT_KEYS.forEach(stat => {
        if (typeof player[stat] !== "number") player[stat] = stat === "freedom" ? 5 : clampStat(player[stat]);
        player[stat] = clampStat(player[stat]);
      });
      if (!Array.isArray(player.heldCards)) player.heldCards = [];
      if (!player.powerUsed) player.powerUsed = {};
      if (typeof player.skipNextTurn !== "boolean") player.skipNextTurn = false;
      if (typeof player.npcMode !== "boolean") player.npcMode = false;
      if (typeof player.shadowbanned !== "boolean") player.shadowbanned = false;
      if (typeof player.winner !== "boolean") player.winner = false;
    });
  }

  function cardById(cardId, deckName = "Survival") {
    const deck = GAME.decks?.[resolveDeckName(deckName)] || [];
    return deck.find(card => card.id === cardId) || null;
  }

  function hasCardAutoDeltas(card) {
    return ["money_delta", "sanity_delta", "freedom_delta", "influence_delta", "panic_delta", "control_delta", "market_delta"].some(key => Number(card?.[key]) !== 0);
  }

  function cardRecord(deckName, card, player, extras = {}) {
    return {
      id: card.id,
      deckName: resolveDeckName(deckName),
      title: card.title,
      text: card.text,
      player: player.name,
      turn: state.turn,
      choiceRequired: Boolean(card.choice_required),
      choices: card.choice_required ? extractChoices(card.text) : [],
      tags: card.tags || [],
      ...extras
    };
  }

  function processSpecificCard(deckName, card, player) {
    const resolvedDeckName = resolveDeckName(deckName);
    state.pendingCardResolution = null;
    state.activeCard = cardRecord(resolvedDeckName, card, player);
    state.cardHistory.unshift(state.activeCard);
    state.cardHistory = state.cardHistory.slice(0, 30);
    log(`${player.name} resolved ${resolvedDeckName}: ${card.title}. Effect: ${card.text}`);
    setSummary(`${player.name} resolved ${card.title}. Resolve any table judgment, then press End Turn.`);

    if (card.holdable) {
      player.heldCards.push({ id: card.id, title: card.title, text: card.text, deck: resolvedDeckName });
      log(`${player.name} added ${card.title} to held Survival cards.`);
    } else {
      applyRecognizedCardEffect(resolvedDeckName, card, player);
    }

    if (card.choice_required) state.playtest.choicesPresented += 1;
    applyDailyAfterCard(resolvedDeckName, player);
    saveState();
    render();
    showCardReveal(state.activeCard);
  }

  const baseHandleCardDraw = handleCardDraw;
  handleCardDraw = function v019HandleCardDraw(deckName, player) {
    ensureState();
    if (!state.started || !player) return baseHandleCardDraw(deckName, player);

    if (isNormie(player) && !player.powerUsed.normieRedraw && !state.pendingCardResolution) {
      const card = drawCard(deckName);
      if (!card) return baseHandleCardDraw(deckName, player);
      state.pendingCardResolution = { playerId: player.id, deckName: resolveDeckName(deckName), card };
      state.activeCard = cardRecord(deckName, card, player, { normieCardPending: true });
      log(`${player.name} drew ${resolveDeckName(deckName)}: ${card.title}. Normie redraw window opened before effect resolution.`);
      setSummary(`${player.name} may resolve ${card.title} or use The Normie's once-per-game redraw.`);
      saveState();
      render();
      return;
    }

    baseHandleCardDraw(deckName, player);
    applyUnifiedChaosForCard(resolveDeckName(deckName), player);
    applyDailyAfterCard(resolveDeckName(deckName), player);
    showCardReveal(state.activeCard);
    saveState();
    render();
  };

  function resolvePendingCard() {
    const pending = state.pendingCardResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    processSpecificCard(pending.deckName, pending.card, player);
  }

  function normieRedrawPendingCard() {
    const pending = state.pendingCardResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    if (!isNormie(player) || player.powerUsed.normieRedraw) return;

    const replacement = drawCard(pending.deckName);
    if (!replacement) return;
    player.powerUsed.normieRedraw = true;
    state.pendingCardResolution = { playerId: player.id, deckName: resolveDeckName(pending.deckName), card: replacement };
    state.activeCard = cardRecord(pending.deckName, replacement, player, { normieCardPending: true, redrawUsed: true });
    log(`${player.name} used The Normie's redraw power. Replaced ${pending.card.title} with ${replacement.title}.`);
    setSummary(`${player.name} used The Normie's redraw. Resolve ${replacement.title}.`);
    saveState();
    render();
  }

  function normieRollWindow() {
    ensureState();
    const player = getCurrentPlayer();
    if (!player || !isNormie(player) || state.hasRolledThisTurn || player.winner || state.players.some(p => p.winner)) return;

    const roll = rollDie();
    const from = player.position;
    player.position = Math.min(getFinalSpaceNumber(), from + roll);
    state.hasRolledThisTurn = true;
    state.lastRoll = roll;
    state.pendingSpaceResolution = { playerId: player.id, from, to: player.position, roll, rerolled: false };
    const space = getSpace(player.position);
    state.activeCard = {
      deckName: "Normie Power",
      title: "Normie Reroll Window",
      text: `${player.name} rolled ${roll} and would land on Space ${player.position}: ${space.name}. Resolve the space or use The Normie's once-per-game reroll before any space effect applies.`,
      player: player.name,
      turn: state.turn,
      normieRollPending: true
    };
    log(`${player.name} rolled ${roll}, moved from Space ${from} to Space ${player.position}: ${space.name}. Normie reroll window opened before resolving the space.`);
    setSummary(`${player.name} may resolve ${space.name} or use The Normie's reroll.`);
    saveState();
    render();
  }

  function resolvePendingSpace() {
    const pending = state.pendingSpaceResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    const space = getSpace(player.position);
    state.pendingSpaceResolution = null;
    state.activeCard = null;
    log(`${player.name} resolved pending Space ${player.position}: ${space.name}.`);
    applySimpleSpace(space, player);
    applyDailyAfterSpace(space, player);
    render();
  }

  function normieRerollPendingSpace() {
    const pending = state.pendingSpaceResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    if (!isNormie(player) || player.powerUsed.normieReroll) return;

    const roll = rollDie();
    player.powerUsed.normieReroll = true;
    player.position = Math.min(getFinalSpaceNumber(), pending.from + roll);
    state.lastRoll = roll;
    state.pendingSpaceResolution = { playerId: player.id, from: pending.from, to: player.position, roll, rerolled: true };
    const space = getSpace(player.position);
    state.activeCard = {
      deckName: "Normie Power",
      title: "Normie Reroll Used",
      text: `${player.name} rerolled to ${roll} and now lands on Space ${player.position}: ${space.name}. Resolve this space.`,
      player: player.name,
      turn: state.turn,
      normieRollPending: true,
      rerollUsed: true
    };
    log(`${player.name} used The Normie's reroll power and landed on Space ${player.position}: ${space.name}.`);
    setSummary(`${player.name} used The Normie's reroll. Resolve ${space.name}.`);
    saveState();
    render();
  }

  els.rollBtn?.addEventListener("click", event => {
    const player = state.started ? getCurrentPlayer() : null;
    if (!player || !isNormie(player) || state.hasRolledThisTurn || player.winner || state.players.some(p => p.winner)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    normieRollWindow();
  }, true);

  els.endTurnBtn?.addEventListener("click", event => {
    if (!state.pendingSpaceResolution && !state.pendingCardResolution) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setSummary("Resolve the pending Normie space/card window before ending the turn.");
    log("Blocked End Turn while a pending Normie resolution was open.");
    render();
  }, true);

  function useHeldSurvivalCard(playerId, cardIndex) {
    ensureState();
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.heldCards?.[cardIndex]) return;

    const [held] = player.heldCards.splice(cardIndex, 1);
    const card = cardById(held.id, held.deck || "Survival") || {
      id: held.id || `HELD-${Date.now()}`,
      title: held.title || "Held Survival Card",
      text: held.text || "Resolve with table judgment.",
      deck: held.deck || "Survival",
      holdable: true,
      choice_required: true,
      money_delta: 0,
      sanity_delta: 0,
      freedom_delta: 0,
      influence_delta: 0,
      panic_delta: 0,
      control_delta: 0,
      market_delta: 0,
      tags: ["survival"]
    };

    log(`${player.name} used held Survival card: ${card.title}.`);
    state.activeCard = cardRecord("Survival", card, player, {
      choiceRequired: card.choice_required || !hasCardAutoDeltas(card),
      choices: extractChoices(card.text).length ? extractChoices(card.text) : ["Resolved with table judgment"]
    });

    if (state.activeCard.choiceRequired) {
      state.playtest.choicesPresented += 1;
      setSummary(`${player.name} used ${card.title}. Resolve the Survival effect with table judgment.`);
    } else {
      applyCardDeltas("Survival", card, player);
      setSummary(`${player.name} used ${card.title}.`);
    }

    saveState();
    render();
  }

  function statMeter(labelName, value, max = 9) {
    const safeValue = Math.max(0, Math.min(max, Number(value) || 0));
    const width = Math.round((safeValue / max) * 100);
    const low = max === 6 ? safeValue >= 5 : safeValue <= 2;
    return `
      <div class="stat-meter">
        <div class="stat-meter-top"><span>${escapeHtml(labelName)}</span><strong>${safeValue}/${max}</strong></div>
        <div class="stat-bar"><span class="stat-fill${low ? " low" : ""}" style="width:${width}%"></span></div>
      </div>
    `;
  }

  function renderHeldSurvival(player) {
    if (!player.heldCards?.length) return `<p class="setup-hint">No held Survival cards.</p>`;
    return `
      <details class="held-survival-panel">
        <summary>Held Survival Cards (${player.heldCards.length})</summary>
        <div class="card-history">
          ${player.heldCards.map((card, index) => `
            <article class="history-card">
              <p class="eyebrow">Survival</p>
              <h4>${escapeHtml(card.title)}</h4>
              <p>${escapeHtml(card.text)}</p>
              <button class="button secondary use-survival-card" type="button" data-player-id="${player.id}" data-card-index="${index}">Use / Resolve</button>
            </article>
          `).join("")}
        </div>
      </details>
    `;
  }

  renderPlayers = function v019RenderPlayers() {
    ensureState();
    els.playersGrid.innerHTML = "";
    state.players.forEach((player, index) => {
      const character = GAME.characters[player.characterIndex] || GAME.characters[0];
      const space = getSpace(player.position);
      const active = index === state.currentPlayer ? " active-player" : "";
      const winner = player.winner ? " winner" : "";
      const statuses = [];
      if (player.sanity <= 2) statuses.push(`<span class="status-badge danger">SANITY CRITICAL</span>`);
      if (player.money <= 2) statuses.push(`<span class="status-badge danger">MONEY CRITICAL</span>`);
      if (player.freedom <= 2) statuses.push(`<span class="status-badge danger">FREEDOM CRITICAL</span>`);
      if (player.influence <= 2) statuses.push(`<span class="status-badge danger">INFLUENCE CRITICAL</span>`);
      if (player.npcMode || player.skipNextTurn) statuses.push(`<span class="status-badge warning">NPC MODE</span>`);
      if (isNormie(player)) {
        statuses.push(`<span class="status-badge warning">Reroll: ${player.powerUsed?.normieReroll ? "USED" : "READY"}</span>`);
        statuses.push(`<span class="status-badge warning">Redraw: ${player.powerUsed?.normieRedraw ? "USED" : "READY"}</span>`);
      }
      if (player.winner) statuses.push(`<span class="status-badge warning">SURVIVED</span>`);

      const card = document.createElement("article");
      card.className = `player-card${active}${winner}`;
      card.innerHTML = `
        <div class="player-topline"><span class="token token-${player.id}">${player.token}</span><h3>${escapeHtml(player.name)}</h3></div>
        <p><strong>${escapeHtml(character.name)}</strong></p>
        <p class="character-flavor">${escapeHtml(character.flavor || character.power || "Surviving the decade one bad decision at a time.")}</p>
        <p><strong>Space ${player.position}</strong>: ${escapeHtml(space.name)}</p>
        ${statMeter("Money", player.money)}
        ${statMeter("Sanity", player.sanity)}
        ${statMeter("Freedom", player.freedom)}
        ${statMeter("Influence", player.influence)}
        <div class="status-badges">${statuses.join("")}</div>
        ${renderHeldSurvival(player)}
      `;
      els.playersGrid.appendChild(card);
    });
  };

  const baseRenderActiveCard = renderActiveCard;
  renderActiveCard = function v019RenderActiveCard() {
    const c = state.activeCard;
    if (c?.normieRollPending) {
      els.activeCard.classList.remove("hidden");
      const canReroll = !getCurrentPlayer()?.powerUsed?.normieReroll && !c.rerollUsed;
      els.activeCard.innerHTML = `
        <p class="eyebrow">${escapeHtml(c.deckName)}</p>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.text)}</p>
        <div class="cta-row left">
          <button class="button normie-resolve-space" type="button">Resolve This Space</button>
          ${canReroll ? `<button class="button secondary normie-reroll-pending" type="button">Use Normie Reroll</button>` : ""}
        </div>
      `;
      return;
    }

    if (c?.normieCardPending) {
      els.activeCard.classList.remove("hidden");
      const pendingPlayer = state.players.find(p => p.name === c.player) || getCurrentPlayer();
      const canRedraw = pendingPlayer && !pendingPlayer.powerUsed?.normieRedraw && !c.redrawUsed;
      els.activeCard.innerHTML = `
        <p class="eyebrow">${escapeHtml(c.deckName)} — Normie Redraw Window</p>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.text)}</p>
        <div class="cta-row left">
          <button class="button normie-resolve-card" type="button">Resolve This Card</button>
          ${canRedraw ? `<button class="button secondary normie-redraw-card" type="button">Use Normie Redraw</button>` : ""}
        </div>
      `;
      return;
    }

    baseRenderActiveCard();
  };

  renderV017Meters = function v019RenderMeters() {
    const dashboard = $("chaosDashboard");
    if (!dashboard) return;
    let panel = $("v017Meters");
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
      <p class="eyebrow">v0.19 Tabletop Meters</p>
      <h2>Panic / Control / Market</h2>
      ${statMeter("Panic", state.meters.panic, 6)}
      ${statMeter("Control", state.meters.control, 6)}
      ${statMeter("Market", state.meters.market, 6)}
      <p>Panic collapses: ${state.meterCollapses.panic} · Control collapses: ${state.meterCollapses.control} · Market collapses: ${state.meterCollapses.market}</p>
    `;
  };

  function boardIcon(space) {
    const type = space.space_type || space.type || "";
    const name = space.name || space.label || "";
    if (type.includes("Breaking News")) return "📰";
    if (type.includes("Scandal")) return "📣";
    if (type.includes("Square") || type.includes("Compass")) return "🧩";
    if (type.includes("Survival")) return "🛟";
    if (type.includes("Election")) return "🗳";
    if (type.includes("Market") || name.includes("Market")) return "💸";
    if (type.includes("Pandemic")) return "🦠";
    if (type.includes("Tech")) return "🤖";
    if (type.includes("Awakening")) return "🌱";
    if (type.includes("Finish")) return "🏁";
    return "⚡";
  }

  const baseRenderBoard = renderBoard;
  renderBoard = function v019RenderBoard() {
    baseRenderBoard();
    if (!els.boardTrack || !state.started) return;
    els.boardTrack.querySelectorAll(".board-cell").forEach((cell, index) => {
      const space = GAME.board[index];
      if (!space) return;
      cell.dataset.spaceNumber = String(space.n);
      if (!cell.querySelector(".board-icon")) cell.insertAdjacentHTML("afterbegin", `<span class="board-icon">${boardIcon(space)}</span>`);
      if (!cell.querySelector(".board-year")) cell.insertAdjacentHTML("beforeend", `<span class="board-year">${escapeHtml(space.year || "2020s")}</span>`);
    });
  };

  function showCardReveal(card) {
    const overlay = $("cardRevealOverlay");
    if (!overlay || !card) return;
    $("revealDeck").textContent = `BREAKING: ${card.deckName}`;
    $("revealTitle").textContent = card.title;
    $("revealText").textContent = card.text;
    overlay.classList.remove("hidden");
    setTicker(`BREAKING: ${card.title}. ${card.player || "The table"} is now part of the story.`);
  }

  function closeCardReveal() {
    $("cardRevealOverlay")?.classList.add("hidden");
  }

  function showBreakingNews(title, text) {
    const overlay = $("breakingNewsOverlay");
    if (!overlay) return;
    $("breakingNewsTitle").textContent = title;
    $("breakingNewsText").textContent = text;
    overlay.classList.remove("hidden");
    setTicker(`UNSCHEDULED INTERRUPTION: ${title}`);
  }

  window.showBreakingNews = showBreakingNews;

  function closeBreakingNews() {
    $("breakingNewsOverlay")?.classList.add("hidden");
  }

  function showLandingMoment(from, player) {
    const overlay = $("landingMomentOverlay");
    if (!overlay || !player || player.position === from) return;
    const space = getSpace(player.position);
    $("landingMomentEyebrow").textContent = `${boardIcon(space)} Timeline Landing`;
    $("landingMomentTitle").textContent = `${player.name} landed on ${space.name}.`;
    $("landingMomentText").textContent = `Space ${player.position} — ${space.space_type || space.type}: ${space.effect || "Resolve the space."} The timeline pretends this was inevitable.`;
    overlay.classList.remove("hidden");
  }

  const baseRollAndMove = rollAndMove;
  rollAndMove = function v019RollAndMove() {
    const player = state.started ? getCurrentPlayer() : null;
    const from = player?.position;
    baseRollAndMove();
    if (player && !state.pendingSpaceResolution) setTimeout(() => showLandingMoment(from, player), 160);
  };

  function closeLandingMoment() {
    $("landingMomentOverlay")?.classList.add("hidden");
  }

  function defaultChaosState() {
    return { reality: 100, scandal: 0, doNotPresses: 0, realityCollapses: 0, scandalOverloads: 0, breakingInterruptions: 0 };
  }

  function ensureChaos() {
    if (!state.started) return null;
    if (!state.chaos) state.chaos = defaultChaosState();
    state.chaos.reality = Math.max(0, Math.min(100, Number(state.chaos.reality) || 100));
    state.chaos.scandal = Math.max(0, Math.min(100, Number(state.chaos.scandal) || 0));
    return state.chaos;
  }

  function applyUnifiedChaosForCard(deckName, player) {
    const chaos = ensureChaos();
    if (!chaos || state.players.some(p => p.winner)) return;
    const impact = {
      Headline: [-4, 8],
      Scandal: [-6, 18],
      Conspiracy: [-7, 14],
      Survival: [2, -2]
    }[deckName] || [-3, 6];
    chaos.reality = Math.max(0, Math.min(100, chaos.reality + impact[0]));
    chaos.scandal = Math.max(0, Math.min(100, chaos.scandal + impact[1]));
    if (chaos.reality <= 0) {
      chaos.reality = 52;
      chaos.realityCollapses += 1;
      toggleCycle("Reality Collapse");
      state.players.forEach(p => applyStatDelta(p, "sanity", -1, "Reality Collapse", { source: "chaos" }));
      showBreakingNews("REALITY COLLAPSE", "The board cycle flips. Everyone loses 1 Sanity. Historians request a wellness day.");
    }
    if (chaos.scandal >= 100) {
      chaos.scandal = 0;
      chaos.scandalOverloads += 1;
      state.players.forEach(p => applyStatDelta(p, "sanity", -1, "Scandal Overload", { source: "chaos" }));
      showBreakingNews("SCANDAL OVERLOAD", "All players lose 1 Sanity. The timeline is feeding on attention.");
    }
  }

  function renderChaosDashboard() {
    const chaos = ensureChaos();
    const dashboard = $("chaosDashboard");
    if (!dashboard) return;
    if (!state.started || !chaos) {
      dashboard.classList.add("hidden");
      return;
    }
    dashboard.classList.remove("hidden");
    if ($("realityValue")) $("realityValue").textContent = `${chaos.reality}%`;
    if ($("realityFill")) $("realityFill").style.width = `${chaos.reality}%`;
    if ($("scandalValue")) $("scandalValue").textContent = `${chaos.scandal}%`;
    if ($("scandalFill")) $("scandalFill").style.width = `${chaos.scandal}%`;
    const villain = [...state.players].sort((a, b) => b.influence - a.influence || b.position - a.position)[0];
    if ($("villainName")) $("villainName").textContent = villain ? villain.name : "Pending";
    if ($("villainReason")) $("villainReason").textContent = villain ? "Too much Influence, not enough shame." : "Too early to blame anyone.";
    if ($("forbiddenPhrase")) $("forbiddenPhrase").textContent = "“Actually...”";
  }

  function doNotPress() {
    if (!state.started || state.players.some(p => p.winner)) return;
    const chaos = ensureChaos();
    const player = getCurrentPlayer();
    chaos.doNotPresses += 1;
    toggleCycle("Do Not Press button");
    applyStatDelta(player, "sanity", -1, "Pressed the button they should not press", { source: "chaos" });
    applyStatDelta(player, "influence", 1, "Everyone watched them press the button", { source: "chaos" });
    handleCardDraw("Conspiracy", player);
    showBreakingNews("YOU PRESSED IT", "Lose 1 Sanity. Gain 1 Influence. Flip the board cycle. Draw Conspiracy. This is why we cannot have normal timelines.");
    saveState();
    render();
  }

  function forbiddenPhrasePenalty() {
    if (!state.started || state.players.some(p => p.winner)) return;
    const player = getCurrentPlayer();
    applyStatDelta(player, "sanity", -1, "Said forbidden phrase", { source: "chaos" });
    setSummary(`${player.name} said the Forbidden Phrase and lost 1 Sanity.`);
    saveState();
    render();
  }

  function dailyDateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) - h) + text.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function getDailyChallenge() {
    const key = dailyDateKey();
    return { ...DAILY_CHALLENGES[hash(key) % DAILY_CHALLENGES.length], dateKey: key };
  }

  function renderDailySetup() {
    const challenge = getDailyChallenge();
    if ($("dailyChaosTitle")) $("dailyChaosTitle").textContent = challenge.name;
    if ($("dailyChaosMeta")) $("dailyChaosMeta").textContent = `${challenge.dateKey} — Required character: ${challenge.character}. Starting cycle: ${challenge.cycle}.`;
    if ($("dailyChaosRule")) $("dailyChaosRule").innerHTML = `<strong>Special Rule:</strong> ${escapeHtml(challenge.rule)}<br><strong>Goal:</strong> ${escapeHtml(challenge.goal)}`;
  }

  function createPlayerNamed(id, name, characterName) {
    return createPlayerFromCharacter(id, name, characterIndexByName(characterName));
  }

  function applyDailyStartingRule(challenge) {
    if (!challenge) return;
    if (challenge.ruleId === "marketStart3") state.meters.market = 3;
    if (challenge.ruleId === "controlStart3") state.meters.control = 3;
    if (challenge.ruleId === "allMeters2") state.meters = { panic: 2, control: 2, market: 2 };
  }

  function startDailyChaos() {
    const challenge = getDailyChallenge();
    const players = [
      createPlayerNamed(0, "Daily Challenger", challenge.character),
      createPlayerNamed(1, "Rival 2", "The Prepper"),
      createPlayerNamed(2, "Rival 3", "The Influencer")
    ];
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
      qa: { smokeRuns: 0, smokeFailures: 0, lastSmoke: null },
      dailyChallenge: challenge
    };
    applyDailyStartingRule(challenge);
    players.forEach(player => {
      const count = characterName(player) === "The Prepper" ? 2 : 1;
      for (let i = 0; i < count; i++) dealSurvivalCard(player, "daily opening hand");
    });
    log(`Daily Chaos started: ${challenge.name}. Rule: ${challenge.rule}`);
    saveState();
    render();
    setTicker(`Daily Chaos: ${challenge.name}. ${challenge.goal}`);
  }

  function applyDailyAfterCard(deckName, player) {
    const challenge = state.dailyChallenge;
    if (!challenge || challenge.ruleUsed) return;
    if (challenge.ruleId === "firstScandalPanic" && deckName === "Scandal") {
      challenge.ruleUsed = true;
      applyMeterDelta("panic", 1, "Daily Chaos: first Scandal panic");
    }
  }

  function applyDailyAfterSpace(space, player) {
    const challenge = state.dailyChallenge;
    if (!challenge) return;
    const type = space.space_type || space.type || "";
    if (challenge.ruleId === "marketSurvival" && type === "Market Crash") dealSurvivalCard(player, "Daily Chaos: Market survival");
    if (challenge.ruleId === "techSanity" && type === "Tech Leap") applyStatDelta(player, "sanity", 1, "Daily Chaos: Tech recovery", { source: "daily" });
  }

  function quickStartChaos() {
    const players = [
      createPlayerNamed(0, "Player 1", "The Crypto Bro"),
      createPlayerNamed(1, "Player 2", "The Prepper"),
      createPlayerNamed(2, "Player 3", "The Influencer")
    ];
    state = {
      started: true,
      cycle: Math.random() > 0.5 ? "Red Cycle" : "Blue Cycle",
      currentPlayer: 0,
      turn: 1,
      lastRoll: null,
      hasRolledThisTurn: false,
      lastSummary: "Quick Start Chaos v0.19 started. Roll once, resolve the space, then end the turn.",
      activeCard: null,
      players,
      cardHistory: [],
      log: [],
      meters: { panic: 0, control: 0, market: 0 },
      meterCollapses: { panic: 0, control: 0, market: 0 },
      playtest: { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 },
      qa: { smokeRuns: 0, smokeFailures: 0, lastSmoke: null },
      quickStart: true
    };
    players.forEach(player => {
      const count = characterName(player) === "The Prepper" ? 2 : 1;
      for (let i = 0; i < count; i++) dealSurvivalCard(player, "quick start opening hand");
    });
    log(`Quick Start Chaos v0.19 launched in ${state.cycle}.`);
    saveState();
    render();
  }

  function injectReadinessSetup() {
    if (!$('setupPanel') || $('quickStartBtn')) return;
    const quick = document.createElement("section");
    quick.className = "readiness-panel quickstart-panel";
    quick.innerHTML = `
      <p class="eyebrow">Fastest Way In</p>
      <h3>Quick Start Chaos</h3>
      <p>Instantly starts a 3-player game with The Crypto Bro, The Prepper, and The Influencer.</p>
      <div class="cta-row left"><button id="quickStartBtn" class="button" type="button">Quick Start Chaos</button></div>
    `;
    $('setupPanel').insertBefore(quick, $('setupPanel').children[2] || null);

    const how = document.createElement("section");
    how.className = "readiness-panel how-to-panel";
    how.innerHTML = `
      <p class="eyebrow">How to Play in 60 Seconds</p>
      <ol class="quick-rules">
        <li>Roll once.</li>
        <li>Move forward.</li>
        <li>Resolve the space and any drawn card.</li>
        <li>Keep Money, Sanity, Freedom, and Influence above 0.</li>
        <li>Panic, Control, and Market collapse at 6.</li>
        <li>Reach 2030 to win.</li>
      </ol>
    `;
    quick.insertAdjacentElement("afterend", how);

    const qa = document.createElement("section");
    qa.className = "readiness-panel known-notes-panel";
    qa.innerHTML = `
      <p class="eyebrow">v0.19 Diagnostics</p>
      <h3>Browser Smoke Test</h3>
      <p>Runs a non-destructive validation of data, state shape, UI hooks, and key controls. Open the browser console for detailed results.</p>
      <div class="cta-row left"><button id="runSmokeTestBtn" class="button secondary" type="button">Run Smoke Test</button></div>
      <div id="smokeTestPanel" class="setup-hint"></div>
    `;
    const daily = $("dailyChaosCard");
    if (daily) daily.insertAdjacentElement("afterend", qa);
    else $('setupPanel').appendChild(qa);

    $("quickStartBtn")?.addEventListener("click", quickStartChaos);
    $("runSmokeTestBtn")?.addEventListener("click", () => runSmokeTest(true));
  }

  function renderDailyBanner() {
    const banner = $("dailyModeBanner");
    if (!banner) return;
    const challenge = state.dailyChallenge;
    if (!state.started || !challenge) {
      banner.classList.add("hidden");
      banner.innerHTML = "";
      return;
    }
    banner.classList.remove("hidden");
    banner.innerHTML = `
      <p class="eyebrow">Daily Chaos Active</p>
      <h2>${escapeHtml(challenge.name)}</h2>
      <p><strong>Character:</strong> ${escapeHtml(challenge.character)} · <strong>Goal:</strong> ${escapeHtml(challenge.goal)}</p>
      <p><strong>Special Rule:</strong> ${escapeHtml(challenge.rule)}</p>
    `;
  }

  function endingTitle(player) {
    if (player.sanity >= 5 && player.freedom >= 5) return "Awakened Ending";
    if (player.influence >= 7) return "Influencer Ending";
    if (player.money >= 7 && player.influence <= 1) return "Bunker Ending";
    if (state.meterCollapses?.control >= 2) return "Great Reset Ending";
    if (state.meterCollapses?.panic >= 2) return "Doomscroll Ending";
    if (state.meterCollapses?.market >= 2) return "Black Swan Ending";
    return "Survivor Ending";
  }

  function renderWinnerUnified() {
    const winner = state.players?.find(p => p.winner);
    if (!winner) {
      els.winnerPanel.classList.add("hidden");
      els.winnerPanel.innerHTML = "";
      return;
    }
    const character = GAME.characters[winner.characterIndex];
    const ending = state.ending || endingTitle(winner);
    const chaos = state.chaos || defaultChaosState();
    els.winnerPanel.classList.remove("hidden");
    els.winnerPanel.innerHTML = `
      <h2>${escapeHtml(winner.name)} survived the 2020s.</h2>
      <p>${escapeHtml(winner.name)} reached 2030 as ${escapeHtml(character.name)} with Money ${winner.money}, Sanity ${winner.sanity}, Freedom ${winner.freedom}, and Influence ${winner.influence}.</p>
      <div id="certificateCard" class="certificate-card">
        <p class="eyebrow">Official Timeline Receipt</p>
        <h2 class="certificate-title">${escapeHtml(ending)}</h2>
        <div class="share-stats">
          <div><span>Money</span><strong>${winner.money}/9</strong></div>
          <div><span>Sanity</span><strong>${winner.sanity}/9</strong></div>
          <div><span>Freedom</span><strong>${winner.freedom}/9</strong></div>
          <div><span>Influence</span><strong>${winner.influence}/9</strong></div>
          <div><span>Panic</span><strong>${state.meterCollapses.panic}</strong></div>
          <div><span>Control</span><strong>${state.meterCollapses.control}</strong></div>
          <div><span>Market</span><strong>${state.meterCollapses.market}</strong></div>
          <div><span>Reality</span><strong>${chaos.reality ?? "—"}%</strong></div>
        </div>
      </div>
      <div class="cta-row left">
        <button id="copyResultBtn" class="button" type="button">Copy Result</button>
        <button class="button secondary" type="button" onclick="restartGame(false)">Restart Game</button>
        <button class="button secondary" type="button" onclick="restartGame(true)">Flip Board & Restart</button>
        <button class="button secondary" type="button" onclick="resetGame()">Clear Saved Game</button>
      </div>
    `;
    $("copyResultBtn")?.addEventListener("click", copyResult);
  }

  renderWinner = renderWinnerUnified;

  function copyResult() {
    const winner = state.players?.find(p => p.winner);
    if (!winner) return;
    const text = `${winner.name} survived the 2020s as ${characterName(winner)}.\nEnding: ${state.ending || endingTitle(winner)}\nMoney ${winner.money}, Sanity ${winner.sanity}, Freedom ${winner.freedom}, Influence ${winner.influence}\nPanic collapses ${state.meterCollapses.panic}, Control collapses ${state.meterCollapses.control}, Market collapses ${state.meterCollapses.market}\nhttps://weswuy.github.io/2020s/play.html`;
    navigator.clipboard?.writeText(text).then(() => alert("Result copied.")) || prompt("Copy result:", text);
  }

  function exportNotesUnified() {
    ensureState();
    const players = state.players.map(p => `${p.name} (${characterName(p)}) - Space ${p.position}, Money ${p.money}, Sanity ${p.sanity}, Freedom ${p.freedom}, Influence ${p.influence}, Held Survival ${p.heldCards?.length || 0}, Powers ${Object.keys(p.powerUsed || {}).filter(key => p.powerUsed[key]).join(", ") || "none"}`).join("\n");
    const cards = state.cardHistory.slice().reverse().map(c => `Turn ${c.turn}: ${c.player} drew ${c.deckName} - ${c.title}${c.choiceRequired ? " [choice]" : ""}`).join("\n");
    const report = `2020s: The Board Game - v0.19 Smoke/Playtest Report\n\nVersion: ${VERSION}\nData: ${GAME.version || "unknown"}\nCycle: ${state.cycle}\nTurn: ${state.turn}\nMeters: Panic ${state.meters.panic}/6 (${state.meterCollapses.panic}), Control ${state.meters.control}/6 (${state.meterCollapses.control}), Market ${state.meters.market}/6 (${state.meterCollapses.market})\nChoices: ${state.playtest.choicesResolved}/${state.playtest.choicesPresented}\nNPC Events: ${state.playtest.npcEvents}\nPending Space: ${state.pendingSpaceResolution ? "yes" : "no"}\nPending Card: ${state.pendingCardResolution ? "yes" : "no"}\nSmoke Test: ${state.qa?.lastSmoke || "not run"}\n\nPlayers:\n${players}\n\nCard History:\n${cards}\n\nTurn Log:\n${state.log.slice().reverse().join("\n")}`;
    navigator.clipboard?.writeText(report).then(() => alert("v0.19 report copied to clipboard.")) || prompt("Copy report:", report);
  }

  function restartGameUnified(flipBoard = false) {
    if (!state.started || !state.players?.length) return resetGame();
    const oldCycle = state.cycle || "Red Cycle";
    const players = state.players.map((p, index) => createPlayerFromCharacter(index, p.name, p.characterIndex));
    state = {
      started: true,
      cycle: flipBoard ? (oldCycle === "Red Cycle" ? "Blue Cycle" : "Red Cycle") : oldCycle,
      currentPlayer: 0,
      turn: 1,
      lastRoll: null,
      hasRolledThisTurn: false,
      lastSummary: flipBoard ? `Board flipped from ${oldCycle}. New v0.19 game started.` : "v0.19 game restarted with the same players.",
      activeCard: null,
      players,
      cardHistory: [],
      log: [],
      meters: { panic: 0, control: 0, market: 0 },
      meterCollapses: { panic: 0, control: 0, market: 0 },
      playtest: { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: flipBoard ? 1 : 0 },
      qa: { smokeRuns: 0, smokeFailures: 0, lastSmoke: null }
    };
    players.forEach(player => {
      const count = characterName(player) === "The Prepper" ? 2 : 1;
      for (let i = 0; i < count; i++) dealSurvivalCard(player, "restart opening hand");
    });
    log(`v0.19 restart complete. Cycle: ${state.cycle}.`);
    saveState();
    render();
  }

  window.restartGame = restartGameUnified;

  function runSmokeTest(updateUi = false) {
    const results = [];
    const check = (name, condition, detail = "") => {
      results.push({ name, ok: Boolean(condition), detail });
    };

    try {
      ensureState();
      check("GAME exists", typeof GAME === "object");
      check("Six characters loaded", GAME.characters?.length === 6, `found ${GAME.characters?.length || 0}`);
      check("60 board spaces loaded", GAME.board?.length === 60, `found ${GAME.board?.length || 0}`);
      check("Headline deck loaded", GAME.decks?.Headline?.length === 20, `found ${GAME.decks?.Headline?.length || 0}`);
      check("Conspiracy deck loaded", GAME.decks?.Conspiracy?.length === 20, `found ${GAME.decks?.Conspiracy?.length || 0}`);
      check("Survival deck loaded", GAME.decks?.Survival?.length === 20, `found ${GAME.decks?.Survival?.length || 0}`);
      check("Scandal deck loaded", GAME.decks?.Scandal?.length === 20, `found ${GAME.decks?.Scandal?.length || 0}`);
      check("Required DOM controls", Boolean(els.rollBtn && els.endTurnBtn && els.exportBtn && els.playersGrid && els.boardTrack));
      check("Required overlays", Boolean($("cardRevealOverlay") && $("breakingNewsOverlay") && $("landingMomentOverlay")));
      check("Core functions callable", [rollAndMove, handleCardDraw, applyMeterDelta, checkZeroStats, render].every(fn => typeof fn === "function"));

      const previousState = JSON.stringify(state);
      const testPlayer = createPlayerFromCharacter(0, "QA Normie", characterIndexByName("The Normie"));
      check("Normie has Freedom", typeof testPlayer.freedom === "number" && testPlayer.freedom > 0);
      check("Prepper starts valid", createPlayerFromCharacter(1, "QA Prepper", characterIndexByName("The Prepper")).freedom > 0);
      state = JSON.parse(previousState);
      ensureState();
    } catch (error) {
      results.push({ name: "Smoke test exception", ok: false, detail: error.message });
    }

    const failed = results.filter(result => !result.ok);
    state.qa = state.qa || {};
    state.qa.smokeRuns = (state.qa.smokeRuns || 0) + 1;
    state.qa.smokeFailures = failed.length;
    state.qa.lastSmoke = failed.length ? `FAIL: ${failed.map(f => f.name).join(", ")}` : "PASS";
    saveState();

    console.group(`2020s ${VERSION} smoke test`);
    results.forEach(result => console[result.ok ? "log" : "error"](`${result.ok ? "✅" : "❌"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`));
    console.groupEnd();

    const panel = $("smokeTestPanel");
    if (updateUi && panel) {
      panel.innerHTML = failed.length
        ? `<strong>Smoke test failed:</strong><br>${failed.map(f => `❌ ${escapeHtml(f.name)} ${escapeHtml(f.detail)}`).join("<br>")}`
        : `<strong>Smoke test passed.</strong> ${results.length} checks completed. See console for details.`;
    }
    return { ok: failed.length === 0, results };
  }

  function renderDiagnosticsPanel() {
    if (!state.started || $("v019StatusPanel")) return;
    const panel = document.createElement("section");
    panel.id = "v019StatusPanel";
    panel.className = "readiness-status-panel";
    panel.innerHTML = `
      <div><strong>v0.19 Unified Engine:</strong> Active</div>
      <div><strong>Legacy Extensions:</strong> Retired from live play.html</div>
      <div><strong>Smoke Test:</strong> ${escapeHtml(state.qa?.lastSmoke || "not run")}</div>
    `;
    els.gamePanel.insertBefore(panel, els.gamePanel.firstElementChild);
  }

  const baseRender = render;
  render = function v019Render() {
    ensureState();
    baseRender();
    renderChaosDashboard();
    renderDailyBanner();
    renderDiagnosticsPanel();
    if (els.endTurnBtn) {
      const pending = Boolean(state.pendingSpaceResolution || state.pendingCardResolution);
      els.endTurnBtn.disabled = pending;
      els.endTurnBtn.title = pending ? "Resolve the pending Normie window before ending the turn." : "End the current turn.";
    }
  };

  document.addEventListener("click", event => {
    const useSurvival = event.target.closest(".use-survival-card");
    if (useSurvival) {
      event.preventDefault();
      useHeldSurvivalCard(Number(useSurvival.dataset.playerId), Number(useSurvival.dataset.cardIndex));
      return;
    }
    if (event.target.closest(".normie-resolve-space")) {
      event.preventDefault();
      resolvePendingSpace();
      return;
    }
    if (event.target.closest(".normie-reroll-pending")) {
      event.preventDefault();
      normieRerollPendingSpace();
      return;
    }
    if (event.target.closest(".normie-resolve-card")) {
      event.preventDefault();
      resolvePendingCard();
      return;
    }
    if (event.target.closest(".normie-redraw-card")) {
      event.preventDefault();
      normieRedrawPendingCard();
    }
  });

  $("closeRevealBtn")?.addEventListener("click", closeCardReveal);
  $("cardRevealOverlay")?.addEventListener("click", event => { if (event.target === $("cardRevealOverlay")) closeCardReveal(); });
  $("closeBreakingNewsBtn")?.addEventListener("click", closeBreakingNews);
  $("breakingNewsOverlay")?.addEventListener("click", event => { if (event.target === $("breakingNewsOverlay")) closeBreakingNews(); });
  $("closeLandingMomentBtn")?.addEventListener("click", closeLandingMoment);
  $("landingMomentOverlay")?.addEventListener("click", event => { if (event.target === $("landingMomentOverlay")) closeLandingMoment(); });
  $("doNotPressBtn")?.addEventListener("click", doNotPress);
  $("phrasePenaltyBtn")?.addEventListener("click", forbiddenPhrasePenalty);
  $("playDailyBtn")?.addEventListener("click", startDailyChaos);
  $("copyDailyBtn")?.addEventListener("click", () => {
    const challenge = getDailyChallenge();
    const text = `Daily Chaos ${challenge.dateKey}: ${challenge.name}\nCharacter: ${challenge.character}\nCycle: ${challenge.cycle}\nRule: ${challenge.rule}\nGoal: ${challenge.goal}\nhttps://weswuy.github.io/2020s/play.html`;
    navigator.clipboard?.writeText(text).then(() => alert("Daily Challenge copied.")) || prompt("Copy Daily Challenge:", text);
  });

  if (els.exportBtn) {
    const clone = els.exportBtn.cloneNode(true);
    els.exportBtn.replaceWith(clone);
    els.exportBtn = clone;
    els.exportBtn.addEventListener("click", exportNotesUnified);
  }

  injectReadinessSetup();
  renderDailySetup();
  ensureState();
  render();
  window.v019QA = { version: VERSION, runSmokeTest, ensureState, quickStartChaos, startDailyChaos, resolvePendingCard, resolvePendingSpace };
  runSmokeTest(false);
})();
