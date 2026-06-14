// Prototype v0.18 QA / Hardening Pass.
// Loaded last so it can repair older monkey-patches without disturbing the comic-broadcast UI.

(function v018HardeningPass() {
  const V018_VERSION = "v0.18";

  function safeStatName(stat) {
    const text = String(stat || "");
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Stat";
  }

  // Repair a v0.17/v0.5 naming collision where play-polish.js redefined statLabel().
  statLabel = safeStatName;

  function ensureV018State() {
    if (!state) return;
    if (!state.meters) state.meters = { panic: 0, control: 0, market: 0 };
    if (!state.meterCollapses) state.meterCollapses = { panic: 0, control: 0, market: 0 };
    if (!state.playtest) state.playtest = { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 };
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
      if (typeof player.npcMode !== "boolean") player.npcMode = false;
      if (typeof player.skipNextTurn !== "boolean") player.skipNextTurn = false;
      if (typeof player.shadowbanned !== "boolean") player.shadowbanned = false;
      if (typeof player.winner !== "boolean") player.winner = false;
    });
  }

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getCharacterName(player) {
    return GAME.characters[player.characterIndex]?.name || "Unknown Character";
  }

  function isNormie(player) {
    return getCharacterName(player) === "The Normie";
  }

  function findCardById(cardId, deckName = "Survival") {
    const deck = GAME.decks?.[resolveDeckName(deckName)] || [];
    return deck.find(card => card.id === cardId) || null;
  }

  function hasCardAutoDeltas(card) {
    return [
      "money_delta",
      "sanity_delta",
      "freedom_delta",
      "influence_delta",
      "panic_delta",
      "control_delta",
      "market_delta"
    ].some(key => Number(card?.[key]) !== 0);
  }

  function v018CardRecord(deckName, card, player, extras = {}) {
    return {
      id: card.id,
      deckName,
      title: card.title,
      text: card.text,
      player: player.name,
      turn: state.turn,
      choiceRequired: Boolean(card.choice_required),
      tags: card.tags || [],
      ...extras
    };
  }

  function processSpecificCard(deckName, card, player) {
    const resolvedDeckName = resolveDeckName(deckName);
    const cardRecord = v018CardRecord(resolvedDeckName, card, player);

    state.pendingCardResolution = null;
    state.activeCard = cardRecord;
    state.cardHistory.unshift(cardRecord);
    state.cardHistory = state.cardHistory.slice(0, 30);
    log(`${player.name} resolved ${resolvedDeckName}: ${card.title}. Effect: ${card.text}`);
    setSummary(`${player.name} resolved ${card.title}. Resolve any table judgment, then press End Turn.`);

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

  function presentNormiePendingCard(deckName, player, card) {
    const resolvedDeckName = resolveDeckName(deckName);
    state.pendingCardResolution = {
      playerId: player.id,
      deckName: resolvedDeckName,
      card
    };
    state.activeCard = v018CardRecord(resolvedDeckName, card, player, { normieCardPending: true });
    log(`${player.name} drew ${resolvedDeckName}: ${card.title}. Normie may resolve or redraw before the effect applies.`);
    setSummary(`${player.name} drew ${card.title}. Normie may resolve it or spend the once-per-game redraw.`);
    saveState();
    render();
  }

  const previousHandleCardDraw = handleCardDraw;
  handleCardDraw = function v018HandleCardDraw(deckName, player) {
    ensureV018State();
    if (player && isNormie(player) && !player.powerUsed.normieRedraw && !state.pendingCardResolution) {
      const card = drawCard(deckName);
      if (!card) return previousHandleCardDraw(deckName, player);
      return presentNormiePendingCard(deckName, player, card);
    }
    return previousHandleCardDraw(deckName, player);
  };

  function resolvePendingCard() {
    ensureV018State();
    const pending = state.pendingCardResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    processSpecificCard(pending.deckName, pending.card, player);
  }

  function normieRedrawPendingCard() {
    ensureV018State();
    const pending = state.pendingCardResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    if (!isNormie(player) || player.powerUsed.normieRedraw) return;

    const replacement = drawCard(pending.deckName);
    if (!replacement) return;
    player.powerUsed.normieRedraw = true;
    state.pendingCardResolution = {
      playerId: player.id,
      deckName: resolveDeckName(pending.deckName),
      card: replacement
    };
    state.activeCard = v018CardRecord(resolveDeckName(pending.deckName), replacement, player, { normieCardPending: true, redrawUsed: true });
    log(`${player.name} used The Normie's redraw power. Replaced ${pending.card.title} with ${replacement.title}.`);
    setSummary(`${player.name} used The Normie's redraw. Resolve ${replacement.title}.`);
    saveState();
    render();
  }

  function normieRollWindow() {
    ensureV018State();
    const player = getCurrentPlayer();
    if (!player || !isNormie(player) || player.winner || state.hasRolledThisTurn || state.players.some(p => p.winner)) return;

    const roll = rollDie();
    const oldPosition = player.position;
    player.position = Math.min(getFinalSpaceNumber(), oldPosition + roll);
    state.hasRolledThisTurn = true;
    state.lastRoll = roll;
    state.pendingSpaceResolution = {
      playerId: player.id,
      from: oldPosition,
      to: player.position,
      roll,
      rerolled: false
    };

    const space = getSpace(player.position);
    state.activeCard = {
      deckName: "Normie Power",
      title: "Normie Reroll Window",
      text: `${player.name} rolled ${roll} and would land on Space ${player.position}: ${space.name}. Resolve the space or use The Normie's once-per-game reroll before any space effect applies.`,
      player: player.name,
      turn: state.turn,
      normieRollPending: true
    };
    log(`${player.name} rolled ${roll}, moved from Space ${oldPosition} to Space ${player.position}: ${space.name}. Normie reroll window opened before resolving the space.`);
    setSummary(`${player.name} may resolve ${space.name} or use The Normie's reroll.`);
    saveState();
    render();
  }

  function resolvePendingSpace() {
    ensureV018State();
    const pending = state.pendingSpaceResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    const space = getSpace(player.position);
    state.pendingSpaceResolution = null;
    state.activeCard = null;
    log(`${player.name} resolved pending Space ${player.position}: ${space.name}.`);
    applySimpleSpace(space, player);
  }

  function normieRerollPendingSpace() {
    ensureV018State();
    const pending = state.pendingSpaceResolution;
    if (!pending) return;
    const player = state.players.find(p => p.id === pending.playerId) || getCurrentPlayer();
    if (!isNormie(player) || player.powerUsed.normieReroll) return;

    const roll = rollDie();
    player.powerUsed.normieReroll = true;
    player.position = Math.min(getFinalSpaceNumber(), pending.from + roll);
    state.lastRoll = roll;
    state.pendingSpaceResolution = {
      playerId: player.id,
      from: pending.from,
      to: player.position,
      roll,
      rerolled: true
    };

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

  // Capture Normie rolls before the original auto-resolving roll handler fires.
  els.rollBtn?.addEventListener("click", event => {
    const player = state.started ? getCurrentPlayer() : null;
    if (!player || !isNormie(player) || state.hasRolledThisTurn || player.winner || state.players.some(p => p.winner)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    normieRollWindow();
  }, true);

  function useHeldSurvivalCard(playerId, cardIndex) {
    ensureV018State();
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.heldCards?.[cardIndex]) return;

    const [held] = player.heldCards.splice(cardIndex, 1);
    const card = findCardById(held.id, held.deck || "Survival") || {
      ...held,
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

    if (card.choice_required || !hasCardAutoDeltas(card)) {
      state.activeCard = v018CardRecord("Survival", card, player, {
        choiceRequired: true,
        choices: extractChoices(card.text).length ? extractChoices(card.text) : ["Resolved with table judgment"]
      });
      state.playtest.choicesPresented += 1;
      setSummary(`${player.name} used ${card.title}. Resolve the Survival effect with table judgment.`);
    } else {
      state.activeCard = v018CardRecord("Survival", card, player);
      applyCardDeltas("Survival", card, player);
      setSummary(`${player.name} used ${card.title}.`);
    }

    saveState();
    render();
  }

  function renderV018StatMeter(label, value) {
    const safeValue = Math.max(0, Math.min(9, Number(value) || 0));
    const width = Math.round((safeValue / 9) * 100);
    const low = safeValue <= 2 ? " low" : "";
    return `
      <div class="stat-meter">
        <div class="stat-meter-top"><span>${label}</span><strong>${safeValue}/9</strong></div>
        <div class="stat-bar"><span class="stat-fill${low}" style="width:${width}%"></span></div>
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

  function renderNormieBadge(player, index) {
    if (!isNormie(player)) return "";
    const active = index === state.currentPlayer;
    const rerollUsed = player.powerUsed?.normieReroll;
    const redrawUsed = player.powerUsed?.normieRedraw;
    return `
      <div class="status-badges">
        <span class="status-badge warning">Normie Reroll: ${rerollUsed ? "USED" : active ? "READY" : "Available"}</span>
        <span class="status-badge warning">Normie Redraw: ${redrawUsed ? "USED" : active ? "READY" : "Available"}</span>
      </div>
    `;
  }

  renderPlayers = function v018RenderPlayers() {
    ensureV018State();
    els.playersGrid.innerHTML = "";
    state.players.forEach((p, index) => {
      const character = GAME.characters[p.characterIndex] || GAME.characters[0];
      const space = getSpace(p.position);
      const active = index === state.currentPlayer ? " active-player" : "";
      const winner = p.winner ? " winner" : "";
      const statuses = [];

      if (p.sanity <= 2) statuses.push(`<span class="status-badge danger">SANITY CRITICAL</span>`);
      if (p.money <= 2) statuses.push(`<span class="status-badge danger">MONEY CRITICAL</span>`);
      if (p.freedom <= 2) statuses.push(`<span class="status-badge danger">FREEDOM CRITICAL</span>`);
      if (p.influence <= 2) statuses.push(`<span class="status-badge danger">INFLUENCE CRITICAL</span>`);
      if (p.npcMode || p.skipNextTurn) statuses.push(`<span class="status-badge warning">NPC MODE</span>`);
      if (p.shadowbanned) statuses.push(`<span class="status-badge warning">SHADOWBANNED</span>`);
      if (p.winner) statuses.push(`<span class="status-badge warning">SURVIVED</span>`);

      const card = document.createElement("article");
      card.className = `player-card${active}${winner}`;
      card.innerHTML = `
        <div class="player-topline"><span class="token token-${p.id}">${p.token}</span><h3>${escapeHtml(p.name)}</h3></div>
        <p><strong>${escapeHtml(character.name)}</strong></p>
        <p class="character-flavor">${escapeHtml(character.flavor || character.power || "Surviving the decade one bad decision at a time.")}</p>
        <p><strong>Space ${p.position}</strong>: ${escapeHtml(space.name)}</p>
        ${renderV018StatMeter("Money", p.money)}
        ${renderV018StatMeter("Sanity", p.sanity)}
        ${renderV018StatMeter("Freedom", p.freedom)}
        ${renderV018StatMeter("Influence", p.influence)}
        <div class="status-badges">${statuses.join("")}</div>
        ${renderNormieBadge(p, index)}
        ${renderHeldSurvival(p)}
      `;
      els.playersGrid.appendChild(card);
    });
  };

  const previousRenderActiveCard = renderActiveCard;
  renderActiveCard = function v018RenderActiveCard() {
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

    previousRenderActiveCard();
  };

  renderV017Meters = function v018RenderMeters() {
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
    const meterMarkup = METER_KEYS.map(key => {
      const value = clampMeter(state.meters[key]);
      const width = Math.round((value / 6) * 100);
      return `
        <div class="stat-meter">
          <div class="stat-meter-top"><span>${safeStatName(key)}</span><strong>${value}/6</strong></div>
          <div class="stat-bar"><span class="stat-fill${value >= 5 ? " low" : ""}" style="width:${width}%"></span></div>
        </div>
      `;
    }).join("");
    panel.innerHTML = `
      <p class="eyebrow">v0.18 Tabletop Meters</p>
      <h2>Panic / Control / Market</h2>
      ${meterMarkup}
      <p>Panic collapses: ${state.meterCollapses.panic} · Control collapses: ${state.meterCollapses.control} · Market collapses: ${state.meterCollapses.market}</p>
    `;
  };

  function quickStartChaosV018() {
    const level = typeof storedChaosLevel === "function" ? storedChaosLevel() : "unhinged";
    const names = ["The Crypto Bro", "The Prepper", "The Influencer"];
    const players = names.map((characterName, index) => {
      const characterIndex = GAME.characters.findIndex(character => character.name === characterName);
      return createPlayerFromCharacter(index, `Player ${index + 1}`, characterIndex >= 0 ? characterIndex : index);
    });

    state = {
      started: true,
      cycle: Math.random() > 0.5 ? "Red Cycle" : "Blue Cycle",
      chaosLevel: level,
      currentPlayer: 0,
      turn: 1,
      lastRoll: null,
      hasRolledThisTurn: false,
      lastSummary: "Quick Start Chaos v0.18 started. Roll once, resolve the space, then end the turn.",
      activeCard: null,
      players,
      cardHistory: [],
      log: [],
      meters: { panic: 0, control: 0, market: 0 },
      meterCollapses: { panic: 0, control: 0, market: 0 },
      playtest: { choicesPresented: 0, choicesResolved: 0, npcEvents: 0, cycleSwitches: 0 },
      quickStart: true
    };

    players.forEach(player => {
      const character = GAME.characters[player.characterIndex];
      const survivalCount = character.name === "The Prepper" ? 2 : 1;
      for (let i = 0; i < survivalCount; i++) dealSurvivalCard(player, "quick start opening hand");
    });

    log(`Quick Start Chaos v0.18 launched in ${state.cycle}.`);
    saveState();
    render();
    if (typeof setTicker === "function") setTicker("QUICK START CHAOS v0.18: stable mode engaged.");
  }

  function replaceQuickStartButton() {
    const oldButton = document.getElementById("quickStartBtn");
    if (!oldButton || oldButton.dataset.v018 === "yes") return;
    const newButton = oldButton.cloneNode(true);
    newButton.dataset.v018 = "yes";
    oldButton.replaceWith(newButton);
    if (typeof READINESS !== "undefined") READINESS.quickStartBtn = newButton;
    newButton.addEventListener("click", quickStartChaosV018);
  }

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

  const previousExportNotes = exportNotes;
  exportNotes = function v018ExportNotes() {
    ensureV018State();
    const players = state.players.map(p => {
      const character = GAME.characters[p.characterIndex];
      const powers = p.powerUsed ? Object.keys(p.powerUsed).filter(key => p.powerUsed[key]).join(", ") || "none" : "none";
      return `${p.name} (${character.name}) - Space ${p.position}, Money ${p.money}, Sanity ${p.sanity}, Freedom ${p.freedom}, Influence ${p.influence}, Held Survival ${p.heldCards?.length || 0}, Powers Used: ${powers}`;
    }).join("\n");

    const cards = state.cardHistory.slice().reverse().map(c => {
      return `Turn ${c.turn}: ${c.player} drew ${c.deckName} - ${c.title}${c.choiceRequired ? " [choice]" : ""}`;
    }).join("\n");

    const meterReport = `Panic ${state.meters.panic}/6 (${state.meterCollapses.panic} collapses), Control ${state.meters.control}/6 (${state.meterCollapses.control} collapses), Market ${state.meters.market}/6 (${state.meterCollapses.market} collapses)`;
    const winner = state.players.find(p => p.winner);
    const report = `2020s: The Board Game - v0.18 QA Playtest Report\n\nData: ${GAME.version || "unknown"}\nCycle: ${state.cycle}\nTurn: ${state.turn}\nMeters: ${meterReport}\nChoices Presented: ${state.playtest.choicesPresented}\nChoices Resolved: ${state.playtest.choicesResolved}\nNPC Events: ${state.playtest.npcEvents}\nCycle Switches: ${state.playtest.cycleSwitches}\nPending Space: ${state.pendingSpaceResolution ? "yes" : "no"}\nPending Card: ${state.pendingCardResolution ? "yes" : "no"}\nWinner: ${winner ? `${winner.name} - ${state.ending || getEndingTitle(winner)}` : "None yet"}\n\nPlayers:\n${players}\n\nCard History:\n${cards}\n\nTurn Log:\n${state.log.slice().reverse().join("\n")}`;

    navigator.clipboard?.writeText(report).then(() => {
      alert("v0.18 QA playtest report copied to clipboard. Paste it into a GitHub Issue.");
    }).catch(() => {
      prompt("Copy this playtest report:", report);
    });
  };

  // Replace the original export listener by cloning the button. This avoids duplicate exports.
  if (els.exportBtn) {
    const exportClone = els.exportBtn.cloneNode(true);
    els.exportBtn.replaceWith(exportClone);
    els.exportBtn = exportClone;
    els.exportBtn.addEventListener("click", exportNotes);
  }

  const previousRender = render;
  render = function v018Render() {
    ensureV018State();
    previousRender();
    replaceQuickStartButton();
  };

  window.v018QA = {
    version: V018_VERSION,
    ensureState: ensureV018State,
    quickStart: quickStartChaosV018,
    resolvePendingSpace,
    resolvePendingCard
  };

  ensureV018State();
  replaceQuickStartButton();
  render();
})();
