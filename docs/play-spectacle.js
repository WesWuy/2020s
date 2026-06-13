// Prototype v0.9 Board Feel & Spectacle Pass.
// Adds board icons, movement trails, landing moments, and a final broadcast panel.

const SPECTACLE = {
  landingOverlay: document.getElementById("landingMomentOverlay"),
  landingEyebrow: document.getElementById("landingMomentEyebrow"),
  landingTitle: document.getElementById("landingMomentTitle"),
  landingText: document.getElementById("landingMomentText"),
  closeLandingBtn: document.getElementById("closeLandingMomentBtn")
};

let pendingMovement = null;

function boardIcon(space) {
  const type = space.type || "";
  const name = space.name || "";
  if (type.includes("Global Chaos")) return "🌍";
  if (type.includes("Media Meltdown")) return "📱";
  if (type.includes("Hidden Hand")) return "👁";
  if (type.includes("Political Flip")) return "🗳";
  if (name.includes("Market")) return "💸";
  if (type.includes("Sanity")) return "🧠";
  if (type.includes("Money")) return "💰";
  if (type.includes("Influence")) return "📣";
  if (type.includes("Final")) return "🏁";
  if (name.includes("Timeline")) return "🌀";
  return "⚡";
}

function boardYear(position) {
  if (position <= 4) return "2020";
  if (position <= 8) return "2021";
  if (position <= 12) return "2022";
  if (position <= 16) return "2023";
  if (position <= 20) return "2024";
  if (position <= 24) return "2025";
  if (position <= 28) return "2026";
  if (position <= 32) return "2027";
  if (position <= 36) return "2028";
  if (position <= 39) return "2029";
  return "2030";
}

function effectText(space) {
  const type = space.type || "No automatic effect";
  return type.replace(/Draw /g, "Draw: ");
}

function captureMoveStart() {
  if (!state.started || state.players?.some(p => p.winner)) return;
  const player = getCurrentPlayer();
  pendingMovement = {
    playerId: player.id,
    playerName: player.name,
    token: player.token,
    from: player.position,
    turn: state.turn
  };
}

function renderSpectacleBoard() {
  if (!els.boardTrack || !state.started) return;
  els.boardTrack.querySelectorAll(".board-cell").forEach((cell, index) => {
    const space = GAME.board[index];
    if (!space || cell.dataset.spectacle === "yes") return;
    cell.dataset.spectacle = "yes";
    cell.dataset.spaceNumber = String(space.n);
    if ([1, 10, 20, 30, 40].includes(space.n)) cell.classList.add("milestone-space");
    if (space.type.includes("Final")) cell.classList.add("final-space");
    cell.insertAdjacentHTML("afterbegin", `<span class="board-icon">${boardIcon(space)}</span>`);
    cell.insertAdjacentHTML("beforeend", `<span class="board-year">${boardYear(space.n)}</span>`);
  });
}

function animateMovementTrail(move) {
  if (!move || !state.started) return;
  const player = state.players.find(p => p.id === move.playerId);
  if (!player || player.position === move.from) return;
  const start = Math.min(move.from + 1, player.position);
  const end = player.position;
  const path = [];
  for (let n = start; n <= end; n++) path.push(n);
  if (!path.length) return;

  path.forEach((position, index) => {
    setTimeout(() => {
      const cell = els.boardTrack.querySelector(`[data-space-number="${position}"]`);
      if (!cell) return;
      cell.classList.remove("path-highlight");
      void cell.offsetWidth;
      cell.classList.add("path-highlight");
      const ghost = document.createElement("span");
      ghost.className = "movement-ghost";
      ghost.textContent = move.token;
      ghost.style.left = "8px";
      ghost.style.bottom = "8px";
      cell.appendChild(ghost);
      setTimeout(() => ghost.remove(), 520);
    }, index * 150);
  });
}

function showLandingMoment(move) {
  if (!move || !state.started) return;
  const player = state.players.find(p => p.id === move.playerId);
  if (!player || player.position === move.from) return;
  const space = getSpace(player.position);

  if (!SPECTACLE.landingOverlay) return;
  SPECTACLE.landingEyebrow.textContent = `${boardIcon(space)} Timeline Landing`;
  SPECTACLE.landingTitle.textContent = `${player.name} landed on ${space.name}.`;
  SPECTACLE.landingText.textContent = `Space ${player.position} — ${effectText(space)} The timeline pretends this was inevitable.`;
  SPECTACLE.landingOverlay.classList.remove("hidden");
}

function closeLandingMoment() {
  SPECTACLE.landingOverlay?.classList.add("hidden");
}

function finalBroadcastText(winner, chaos) {
  const publicTrust = chaos ? Math.max(1, chaos.reality) : "Unknown";
  const scandal = chaos ? chaos.scandal : "Unknown";
  return `${winner.name} survived the 2020s. Final Broadcast: Reality Stability ${publicTrust}%, Scandal Meter ${scandal}%, Reality Collapses ${chaos?.realityCollapses || 0}, Forbidden Button Presses ${chaos?.doNotPresses || 0}.`;
}

function renderFinalBroadcast() {
  const winner = state.players?.find(p => p.winner);
  if (!winner || document.getElementById("finalBroadcast")) return;
  const chaos = state.chaos || null;
  const broadcast = document.createElement("section");
  broadcast.id = "finalBroadcast";
  broadcast.className = "final-broadcast";
  broadcast.innerHTML = `
    <p class="eyebrow">Final Timeline Broadcast</p>
    <h3>The decade has filed its report.</h3>
    <p>${finalBroadcastText(winner, chaos)}</p>
    <div class="final-broadcast-grid">
      <div><span>Reality Stability</span><strong>${chaos?.reality ?? "—"}%</strong></div>
      <div><span>Scandal Meter</span><strong>${chaos?.scandal ?? "—"}%</strong></div>
      <div><span>Reality Collapses</span><strong>${chaos?.realityCollapses || 0}</strong></div>
      <div><span>Button Presses</span><strong>${chaos?.doNotPresses || 0}</strong></div>
    </div>
  `;
  els.winnerPanel.appendChild(broadcast);
}

const originalSpectacleRenderBoard = renderBoard;
renderBoard = function spectacleRenderBoard() {
  originalSpectacleRenderBoard();
  renderSpectacleBoard();
};

const originalSpectacleRender = render;
render = function spectacleRender() {
  originalSpectacleRender();
  renderSpectacleBoard();
  renderFinalBroadcast();
};

els.rollBtn?.addEventListener("click", captureMoveStart, true);
els.rollBtn?.addEventListener("click", () => {
  const move = pendingMovement;
  setTimeout(() => {
    animateMovementTrail(move);
    setTimeout(() => showLandingMoment(move), 520);
    pendingMovement = null;
  }, 0);
});

SPECTACLE.closeLandingBtn?.addEventListener("click", closeLandingMoment);
SPECTACLE.landingOverlay?.addEventListener("click", event => {
  if (event.target === SPECTACLE.landingOverlay) closeLandingMoment();
});

render();
