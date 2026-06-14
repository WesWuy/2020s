// Prototype v0.19 header control wiring.
// Kept separate from the large unified engine so small control fixes are easy to audit.

(function v019Controls() {
  function byId(id) {
    return document.getElementById(id);
  }

  byId("restartGameBtn")?.addEventListener("click", () => {
    if (!window.restartGame) return;
    if (!window.state?.started) {
      window.resetGame?.();
      return;
    }
    if (confirm("Restart with the same players and same board cycle?")) window.restartGame(false);
  });

  byId("flipRestartBtn")?.addEventListener("click", () => {
    if (!window.restartGame) return;
    if (!window.state?.started) {
      window.resetGame?.();
      return;
    }
    if (confirm("Flip the board cycle and restart with the same players?")) window.restartGame(true);
  });
})();
