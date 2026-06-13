// Prototype v0.14 Art Direction & Atmosphere Pass.
// Wires placeholder art frames into the video game without replacing final artwork later.

const originalArtCharacterCardMarkup = characterCardMarkup;
characterCardMarkup = function artDirectedCharacterCardMarkup(character) {
  const feel = characterFeel(character.name);
  const art = artCharacter(character.name);
  return `
    ${portraitMarkup(character.name)}
    <div>
      <p class="eyebrow">${art.kicker}</p>
      <h3>${character.name}</h3>
      <p>${art.subtitle}</p>
      <span class="broadcast-snipe">${feel.status}</span>
      <span class="broadcast-snipe">Sanity ${character.stats.sanity}</span>
      <span class="broadcast-snipe">Money ${character.stats.money}</span>
      <span class="broadcast-snipe">Influence ${character.stats.influence}</span>
    </div>
  `;
};

const originalArtRenderEvent = renderEvent;
renderEvent = function artDirectedRenderEvent() {
  originalArtRenderEvent();
  const slot = document.getElementById("eventArt");
  if (!slot) return;
  const event = videoState && !videoState.ended ? currentEvent() : null;
  slot.innerHTML = event ? eventArtMarkup(event, videoState.mode) : "";
};

const originalArtRenderEnding = renderEnding;
renderEnding = function artDirectedRenderEnding() {
  originalArtRenderEnding();
  if (!videoState?.ended || !videoEls.ending || videoEls.ending.querySelector(".art-frame")) return;
  const reportArt = `
    <div class="art-frame ${videoState.mode === "utopia" ? "utopia-art event-utopia" : "dystopia-art event-election"}">
      <div class="art-frame-inner">
        <div>
          <span class="art-icon">${videoState.success ? "🏁" : "🌀"}</span>
          <span class="art-kicker">FINAL TIMELINE REPORT</span>
          <span class="art-title">${videoState.endingTitle}</span>
          <span class="art-subtitle">${videoState.mode === "utopia" ? "A repair broadcast from the better timeline." : "A survival broadcast from the noisy timeline."}</span>
        </div>
      </div>
    </div>
  `;
  videoEls.ending.insertAdjacentHTML("afterbegin", reportArt);
};

renderVideo();
