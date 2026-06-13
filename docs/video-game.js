// Prototype v0.13 Video Game Feel Pass.
// A lightweight browser game layer with Dystopia Run, Utopia Run, character identity, event feedback, and Timeline Health.

const VIDEO_KEY = "twentiesVideoRunV013";

const videoEls = {
  setup: document.getElementById("videoSetup"),
  game: document.getElementById("videoGame"),
  character: document.getElementById("videoCharacter"),
  characterPreview: document.getElementById("videoCharacterPreview"),
  characterDescription: document.getElementById("videoCharacterDescription"),
  activeCharacterCard: document.getElementById("activeCharacterCard"),
  chapterCard: document.getElementById("chapterCard"),
  reset: document.getElementById("resetVideoGameBtn"),
  hudMode: document.getElementById("hudMode"),
  hudYear: document.getElementById("hudYear"),
  hudSanity: document.getElementById("hudSanity"),
  hudMoney: document.getElementById("hudMoney"),
  hudInfluence: document.getElementById("hudInfluence"),
  hudTimeline: document.getElementById("hudTimeline"),
  timelineLabel: document.getElementById("timelineHealthLabel"),
  timelineFill: document.getElementById("timelineHealthFill"),
  eventScreen: document.getElementById("eventScreen"),
  eventEyebrow: document.getElementById("eventEyebrow"),
  eventTitle: document.getElementById("eventTitle"),
  eventText: document.getElementById("eventText"),
  choiceGrid: document.getElementById("choiceGrid"),
  ending: document.getElementById("videoEnding"),
  log: document.getElementById("videoLog")
};

const CHARACTER_FEEL = {
  "Crypto Bro": { icon: "₿", status: "Still Early", vibe: "Bullish during collapse" },
  "The Prepper": { icon: "🥫", status: "Prepared-ish", vibe: "Canned goods prophet" },
  "The Influencer": { icon: "📱", status: "Main Character", vibe: "Turns crisis into content" },
  "The Bureaucrat": { icon: "📋", status: "Process Owner", vibe: "Files paperwork at the abyss" },
  "The Wellness Guru": { icon: "🧘", status: "Regulated", vibe: "Breathwork in a burning feed" },
  "The Podcaster": { icon: "🎙", status: "Just Asking", vibe: "Three hours from the truth" }
};

const VIDEO_EVENTS = [
  {
    year: 2020,
    category: "Collapse Tutorial",
    title: "The Timeline Locks the Door",
    text: "The decade begins with uncertainty, isolation, and way too many people becoming experts overnight.",
    choices: [
      { label: "Panic-buy supplies", text: "Feel prepared, look intense.", effects: { sanity: -1, money: -1, influence: 1, timeline: -3 } },
      { label: "Build a neighborhood check-in list", text: "Small acts stabilize the timeline.", effects: { sanity: 1, money: 0, influence: 1, timeline: 7 } },
      { label: "Start posting predictions", text: "Somehow people listen.", effects: { sanity: -1, money: 0, influence: 2, timeline: -4 } }
    ]
  },
  {
    year: 2021,
    category: "Algorithm Test",
    title: "The Algorithm Offers You Fame",
    text: "A viral post is waiting. It might help. It might consume you.",
    choices: [
      { label: "Accept the viral deal", text: "Attention is still attention.", effects: { sanity: -2, money: 1, influence: 3, timeline: -8 } },
      { label: "Log off and help locally", text: "Less glamorous. More useful.", effects: { sanity: 2, money: 0, influence: -1, timeline: 8 } },
      { label: "Start a podcast about it", text: "Nobody asked, which makes it authentic.", effects: { sanity: -1, money: 0, influence: 2, timeline: -2 } }
    ]
  },
  {
    year: 2022,
    category: "Economic Pressure",
    title: "Inflation Enters the Chat",
    text: "Everything costs more, including being normal.",
    choices: [
      { label: "Chase risky money", text: "Could work. Could become a cautionary tale.", effects: { sanity: -1, money: 3, influence: 1, timeline: -6 } },
      { label: "Share resources", text: "Community beats panic buying.", effects: { sanity: 1, money: -1, influence: 1, timeline: 7 } },
      { label: "Blame the other players", text: "Bad economics, good engagement.", effects: { sanity: -1, money: 0, influence: 2, timeline: -5 } }
    ]
  },
  {
    year: 2023,
    category: "Tech Fork",
    title: "AI Becomes Everyone's Intern",
    text: "The machine is helpful, weird, and somehow already in the meeting.",
    choices: [
      { label: "Automate everything", text: "Efficiency rises. Trust gets weird.", effects: { sanity: 1, money: 2, influence: 1, timeline: -3 } },
      { label: "Use it transparently", text: "Not flashy, but healthier.", effects: { sanity: 1, money: 1, influence: 1, timeline: 6 } },
      { label: "Pretend you invented it", text: "Bold. Gross. Effective for one year.", effects: { sanity: -1, money: 2, influence: 2, timeline: -8 } }
    ]
  },
  {
    year: 2024,
    category: "Mini-Boss: Election Fever",
    title: "Election Fever Dream",
    text: "Every dinner table becomes a debate stage with worse lighting.",
    choices: [
      { label: "Go full tribal", text: "Gain followers. Lose nuance.", effects: { sanity: -2, money: 0, influence: 3, timeline: -10 } },
      { label: "Host a civil conversation", text: "Rare. Suspicious. Useful.", effects: { sanity: 1, money: 0, influence: 1, timeline: 9 } },
      { label: "Monetize outrage", text: "The timeline notices and files a complaint.", effects: { sanity: -2, money: 2, influence: 2, timeline: -9 } }
    ]
  },
  {
    year: 2025,
    category: "Culture War Subscription",
    title: "The Culture War Goes Subscription-Based",
    text: "Even opinions now have premium tiers.",
    choices: [
      { label: "Buy the premium outrage pack", text: "Monthly billing, eternal irritation.", effects: { sanity: -2, money: -1, influence: 2, timeline: -6 } },
      { label: "Build something useful", text: "Less noise, more traction.", effects: { sanity: 1, money: 1, influence: 1, timeline: 6 } },
      { label: "Become a reply goblin", text: "You gain influence in the worst possible way.", effects: { sanity: -2, money: 0, influence: 3, timeline: -7 } }
    ]
  },
  {
    year: 2026,
    category: "Group Chat Governance",
    title: "The Group Chat Becomes a Government",
    text: "Decisions are made by screenshots, vibes, and the loudest notification.",
    choices: [
      { label: "Lead the chaos", text: "Power comes with push notifications.", effects: { sanity: -1, money: 0, influence: 3, timeline: -5 } },
      { label: "Create a real plan", text: "Boring people save timelines.", effects: { sanity: 1, money: 1, influence: 1, timeline: 8 } },
      { label: "Leak the chat", text: "Massive attention. Terrible trust.", effects: { sanity: -2, money: 1, influence: 2, timeline: -10 } }
    ]
  },
  {
    year: 2027,
    category: "Reality Warning",
    title: "Reality Stability Warning",
    text: "The timeline flashes a warning and asks whether anyone has tried being sincere.",
    choices: [
      { label: "Double down", text: "Classic mistake. Great drama.", effects: { sanity: -2, money: 1, influence: 2, timeline: -8 } },
      { label: "Tell the truth clearly", text: "Risky. Almost extinct.", effects: { sanity: 2, money: 0, influence: 1, timeline: 9 } },
      { label: "Outsource morality", text: "Convenient. Unstable.", effects: { sanity: -1, money: 2, influence: 1, timeline: -5 } }
    ]
  },
  {
    year: 2028,
    category: "Utopia Window",
    title: "The Utopia Window Opens",
    text: "For one turn, the timeline can be improved faster than it collapses.",
    choices: [
      { label: "Invest in community systems", text: "Trust compounds slowly.", effects: { sanity: 1, money: -1, influence: 1, timeline: 12 } },
      { label: "Exploit the optimism", text: "Villain behavior, but profitable.", effects: { sanity: -1, money: 3, influence: 2, timeline: -12 } },
      { label: "Teach people what worked", text: "Influence without rot.", effects: { sanity: 1, money: 0, influence: 2, timeline: 8 } }
    ]
  },
  {
    year: 2029,
    category: "Final Mini-Boss",
    title: "The Final Doomscroll",
    text: "The decade tries one last time to eat your attention span.",
    choices: [
      { label: "Keep scrolling", text: "The ancient curse remains undefeated.", effects: { sanity: -3, money: 0, influence: 2, timeline: -9 } },
      { label: "Rally the people around a better ending", text: "Corny. Effective. Dangerous to cynicism.", effects: { sanity: 1, money: 0, influence: 2, timeline: 12 } },
      { label: "Sell survival merch", text: "Profitable, spiritually questionable.", effects: { sanity: -1, money: 3, influence: 1, timeline: -5 } }
    ]
  }
];

let videoState = loadVideoState() || null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function loadVideoState() {
  try {
    const raw = localStorage.getItem(VIDEO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveVideoState() {
  localStorage.setItem(VIDEO_KEY, JSON.stringify(videoState));
}

function resetVideoRun() {
  localStorage.removeItem(VIDEO_KEY);
  videoState = null;
  document.body.classList.remove("mode-dystopia", "mode-utopia");
  renderVideo();
}

function characterFeel(characterName) {
  return CHARACTER_FEEL[characterName] || { icon: "⚡", status: "Survivor", vibe: "Improvising through the timeline" };
}

function characterCardMarkup(character) {
  const feel = characterFeel(character.name);
  return `
    <div class="character-icon">${feel.icon}</div>
    <div>
      <p class="eyebrow">${feel.status}</p>
      <h3>${character.name}</h3>
      <p>${feel.vibe}</p>
      <span>Sanity ${character.stats.sanity}</span>
      <span>Money ${character.stats.money}</span>
      <span>Influence ${character.stats.influence}</span>
    </div>
  `;
}

function setupCharacterOptions() {
  videoEls.character.innerHTML = GAME.characters.map((character, index) => `<option value="${index}">${character.name}</option>`).join("");
  updateCharacterDescription();
}

function updateCharacterDescription() {
  const character = GAME.characters[Number(videoEls.character.value) || 0];
  videoEls.characterDescription.textContent = `${character.name}: ${character.flavor}`;
  if (videoEls.characterPreview) videoEls.characterPreview.innerHTML = characterCardMarkup(character);
}

function startVideoRun(mode) {
  const characterIndex = Number(videoEls.character.value) || 0;
  const character = GAME.characters[characterIndex];
  videoState = {
    mode,
    characterIndex,
    characterName: character.name,
    step: 0,
    year: VIDEO_EVENTS[0].year,
    sanity: character.stats.sanity + (mode === "utopia" ? 1 : 0),
    money: character.stats.money,
    influence: character.stats.influence,
    timeline: mode === "utopia" ? 55 : 45,
    log: [`Started ${mode === "utopia" ? "Utopia Run" : "Dystopia Run"} as ${character.name}.`],
    ended: false,
    endingTitle: null,
    lastOutcome: null
  };
  saveVideoState();
  renderVideo();
}

function currentEvent() {
  return VIDEO_EVENTS[videoState.step] || null;
}

function effectSummary(effects) {
  return Object.entries(effects).map(([key, value]) => `${key === "timeline" ? "Timeline" : key}: ${value > 0 ? "+" : ""}${value}`);
}\n
function timelineStatus() {
  if (!videoState) return "Reality is buffering.";
  if (videoState.timeline >= 80) return "Utopia window open.";
  if (videoState.timeline >= 60) return "Timeline improving.";
  if (videoState.timeline >= 40) return "Reality unstable but playable.";
  if (videoState.timeline >= 20) return "Timeline emergency.";
  return "Reality collapse imminent.";
}

function applyModeTilt(effects) {
  const tilted = { ...effects };
  if (videoState.mode === "utopia" && tilted.timeline > 0) tilted.timeline += 2;
  if (videoState.mode === "dystopia" && tilted.timeline < 0) tilted.timeline -= 1;
  return tilted;
}

function applyChoice(choice) {
  if (!videoState || videoState.ended) return;
  const event = currentEvent();
  const effects = applyModeTilt(choice.effects || {});
  videoState.sanity = clamp(videoState.sanity + (effects.sanity || 0), 0, 9);
  videoState.money = clamp(videoState.money + (effects.money || 0), 0, 9);
  videoState.influence = clamp(videoState.influence + (effects.influence || 0), 0, 9);
  videoState.timeline = clamp(videoState.timeline + (effects.timeline || 0), 0, 100);
  videoState.lastOutcome = {
    year: event.year,
    label: choice.label,
    text: choice.text,
    effects
  };
  videoState.log.unshift(`${event.year}: ${choice.label}. ${effectSummary(effects).join(", ")}.`);

  if (videoState.sanity <= 0 || videoState.money <= 0 || videoState.influence <= 0 || videoState.timeline <= 0) {
    endVideoRun(false);
    return;
  }

  videoState.step += 1;
  if (videoState.step >= VIDEO_EVENTS.length) {
    const success = videoState.mode === "utopia" ? videoState.timeline >= 60 : true;
    endVideoRun(success);
    return;
  }

  videoState.year = VIDEO_EVENTS[videoState.step].year;
  saveVideoState();
  renderVideo();
}

function endingTitle(success) {
  if (!success && videoState.timeline <= 0) return "Timeline Collapse";
  if (!success) return "Survived by a Thread, Then Lost the Plot";
  if (videoState.mode === "utopia" && videoState.timeline >= 80) return "Utopia Architect";
  if (videoState.mode === "utopia") return "Timeline Repair Crew";
  if (videoState.influence >= 7 && videoState.sanity <= 2) return "Main Character of the Collapse";
  if (videoState.money >= 7) return "CEO of Consequences";
  return "Certified Timeline Survivor";
}

function endingText(success) {
  if (!success) return "The decade overwhelmed your run. The timeline recommends a reset and several better choices.";
  if (videoState.mode === "utopia") return "You did more than survive. You left the timeline healthier than you found it.";
  return "You survived the 2020s. Historians remain concerned, but your stats are technically alive.";
}

function endVideoRun(success) {
  videoState.ended = true;
  videoState.success = success;
  videoState.endingTitle = endingTitle(success);
  videoState.log.unshift(`${videoState.endingTitle}: ${endingText(success)}`);
  saveVideoState();
  renderVideo();
}

function renderModeClass() {
  document.body.classList.toggle("mode-dystopia", videoState?.mode === "dystopia");
  document.body.classList.toggle("mode-utopia", videoState?.mode === "utopia");
}

function renderHud() {
  videoEls.hudMode.textContent = videoState.mode === "utopia" ? "Utopia" : "Dystopia";
  videoEls.hudYear.textContent = videoState.year;
  videoEls.hudSanity.textContent = videoState.sanity;
  videoEls.hudMoney.textContent = videoState.money;
  videoEls.hudInfluence.textContent = videoState.influence;
  videoEls.hudTimeline.textContent = `${videoState.timeline}%`;
  videoEls.timelineLabel.textContent = `${videoState.timeline}% — ${timelineStatus()}`;
  videoEls.timelineFill.style.width = `${videoState.timeline}%`;
}

function renderTopline() {
  const character = GAME.characters[videoState.characterIndex];
  if (videoEls.activeCharacterCard) videoEls.activeCharacterCard.innerHTML = characterCardMarkup(character);
  const event = currentEvent();
  if (videoEls.chapterCard) {
    videoEls.chapterCard.innerHTML = `
      <p class="eyebrow">Current Chapter</p>
      <h3>${event ? event.year : "2030"}</h3>
      <p>${event ? event.category : "Final Timeline Report"}</p>
      <span>${videoState.mode === "utopia" ? "Repair the timeline" : "Survive the timeline"}</span>
    `;
  }
}

function renderOutcome() {
  let outcome = document.getElementById("eventOutcome");
  if (!outcome) {
    outcome = document.createElement("div");
    outcome.id = "eventOutcome";
    outcome.className = "event-outcome hidden";
    videoEls.eventScreen.insertBefore(outcome, videoEls.choiceGrid);
  }

  if (!videoState.lastOutcome || videoState.ended) {
    outcome.classList.add("hidden");
    outcome.innerHTML = "";
    return;
  }

  outcome.classList.remove("hidden");
  outcome.innerHTML = `
    <strong>Previous choice:</strong> ${videoState.lastOutcome.label}<br>
    <span>${effectSummary(videoState.lastOutcome.effects).join(" · ")}</span>
  `;
}

function renderEvent() {
  const event = currentEvent();
  if (!event || videoState.ended) {
    videoEls.eventScreen.classList.add("hidden");
    return;
  }
  videoEls.eventScreen.classList.remove("hidden");
  videoEls.eventScreen.classList.remove("event-pulse");
  void videoEls.eventScreen.offsetWidth;
  videoEls.eventScreen.classList.add("event-pulse");
  videoEls.eventEyebrow.textContent = `${event.year} — ${event.category}`;
  videoEls.eventTitle.textContent = event.title;
  videoEls.eventText.textContent = event.text;
  videoEls.choiceGrid.innerHTML = event.choices.map((choice, index) => {
    const effects = applyModeTilt(choice.effects || {});
    return `
      <button class="choice-card" type="button" data-choice="${index}">
        <strong>${choice.label}</strong>
        <span>${choice.text}</span>
        <span class="choice-effects">${effectSummary(effects).map(effect => `<span>${effect}</span>`).join("")}</span>
      </button>
    `;
  }).join("");
  videoEls.choiceGrid.querySelectorAll(".choice-card").forEach(button => {
    button.addEventListener("click", () => applyChoice(event.choices[Number(button.dataset.choice)]));
  });
  renderOutcome();
}

function renderEnding() {
  if (!videoState.ended) {
    videoEls.ending.classList.add("hidden");
    videoEls.ending.innerHTML = "";
    return;
  }
  videoEls.ending.classList.remove("hidden");
  videoEls.ending.innerHTML = `
    <p class="eyebrow">Final Timeline Report</p>
    <h2>${videoState.endingTitle}</h2>
    <p>${endingText(videoState.success)}</p>
    <div class="ending-grid">
      <div><span>Sanity</span><strong>${videoState.sanity}</strong></div>
      <div><span>Money</span><strong>${videoState.money}</strong></div>
      <div><span>Influence</span><strong>${videoState.influence}</strong></div>
      <div><span>Timeline Health</span><strong>${videoState.timeline}%</strong></div>
    </div>
    <div class="cta-row left">
      <button class="button" type="button" id="playAgainVideoBtn">Play Another Run</button>
      <a class="button secondary" href="play.html">Try Board Game Mode</a>
    </div>
  `;
  document.getElementById("playAgainVideoBtn")?.addEventListener("click", resetVideoRun);
}

function renderVideo() {
  if (!videoState) {
    document.body.classList.remove("mode-dystopia", "mode-utopia");
    videoEls.setup.classList.remove("hidden");
    videoEls.game.classList.add("hidden");
    return;
  }

  renderModeClass();
  videoEls.setup.classList.add("hidden");
  videoEls.game.classList.remove("hidden");
  renderTopline();
  renderHud();
  renderEvent();
  renderEnding();
  videoEls.log.value = videoState.log.join("\n");
}

videoEls.reset?.addEventListener("click", resetVideoRun);
videoEls.character?.addEventListener("change", updateCharacterDescription);
document.querySelectorAll("[data-mode]").forEach(button => {
  button.addEventListener("click", () => startVideoRun(button.dataset.mode));
});

setupCharacterOptions();
renderVideo();
