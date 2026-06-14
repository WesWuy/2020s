// Prototype v0.18 QA Finalizer.
// Small last-loaded guard layer for pending-resolution safety and v0.16 board labels.

(function v018QaFinalizer() {
  function hasPendingResolution() {
    return Boolean(state?.pendingSpaceResolution || state?.pendingCardResolution);
  }

  if (typeof boardIcon === "function") {
    boardIcon = function v018BoardIcon(space) {
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
    };
  }

  if (typeof boardYear === "function") {
    boardYear = function v018BoardYear(position) {
      return getSpace(position)?.year || "2020s";
    };
  }

  if (typeof effectText === "function") {
    effectText = function v018EffectText(space) {
      const type = space.space_type || space.type || "Timeline";
      const effect = space.effect || "Resolve the space.";
      return `${type}: ${effect}`;
    };
  }

  els.endTurnBtn?.addEventListener("click", event => {
    if (!hasPendingResolution()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setSummary("Resolve the pending Normie space/card window before ending the turn.");
    log("Blocked End Turn while a pending Normie resolution was open.");
    render();
  }, true);

  const previousRender = render;
  render = function v018FinalizedRender() {
    previousRender();
    const pending = hasPendingResolution();
    if (els.endTurnBtn) {
      els.endTurnBtn.disabled = pending;
      els.endTurnBtn.title = pending ? "Resolve the pending Normie window before ending the turn." : "End the current turn.";
    }
  };

  render();
})();
