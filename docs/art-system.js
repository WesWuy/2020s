// Prototype v0.14 Art Direction & Atmosphere System.
// Placeholder art registry for satirical retro-futurist news broadcast meets comic-book apocalypse.

const ART_SYSTEM = {
  characters: {
    "Crypto Bro": { icon: "₿", kicker: "MARKET CULTIST", title: "Crypto Bro", subtitle: "Bullish during collapse. Allergic to zooming out." },
    "The Prepper": { icon: "🥫", kicker: "BUNKER SIGNAL", title: "The Prepper", subtitle: "Prepared for everything except group dynamics." },
    "The Influencer": { icon: "📱", kicker: "LIVE ENGAGEMENT", title: "The Influencer", subtitle: "Turns instability into content and calls it healing." },
    "The Bureaucrat": { icon: "📋", kicker: "PROCESS CONTROL", title: "The Bureaucrat", subtitle: "Files paperwork at the edge of the abyss." },
    "The Wellness Guru": { icon: "🧘", kicker: "NERVOUS SYSTEM NEWS", title: "The Wellness Guru", subtitle: "Breathwork in a burning feed." },
    "The Podcaster": { icon: "🎙", kicker: "LONGFORM ALERT", title: "The Podcaster", subtitle: "Three hours from the truth." }
  },
  events: {
    2020: { key: "event-lockdown", icon: "🚪", kicker: "LOCKDOWN BROADCAST", title: "Timeline Sealed", subtitle: "The first chapter of collective buffering." },
    2021: { key: "event-algorithm", icon: "📱", kicker: "ALGORITHM ALERT", title: "Fame Offered", subtitle: "The feed has selected a sacrifice." },
    2022: { key: "event-money", icon: "💸", kicker: "MARKET DISTORTION", title: "Prices Ascend", subtitle: "Everything costs more, including being calm." },
    2023: { key: "event-ai", icon: "🤖", kicker: "AUTOMATION SIGNAL", title: "Machine Intern", subtitle: "Helpful, weird, and already in the meeting." },
    2024: { key: "event-election", icon: "🗳", kicker: "MINI-BOSS EVENT", title: "Election Fever", subtitle: "Every dinner table becomes a debate stage." },
    2025: { key: "event-algorithm", icon: "🔥", kicker: "SUBSCRIPTION OUTRAGE", title: "Premium Opinions", subtitle: "Even the culture war has monthly billing." },
    2026: { key: "event-ai", icon: "💬", kicker: "GROUP CHAT GOVERNANCE", title: "Screenshots Rule", subtitle: "The loudest notification becomes policy." },
    2027: { key: "event-election", icon: "⚠️", kicker: "REALITY WARNING", title: "Stability Low", subtitle: "The timeline asks whether sincerity is installed." },
    2028: { key: "event-utopia", icon: "🌱", kicker: "UTOPIA WINDOW", title: "Repair Possible", subtitle: "For one turn, hope has leverage." },
    2029: { key: "event-algorithm", icon: "🌀", kicker: "FINAL DOOMSCROLL", title: "Attention Trial", subtitle: "The decade attempts one last possession." }
  }
};

function artCharacter(name) {
  return ART_SYSTEM.characters[name] || { icon: "⚡", kicker: "TIMELINE SURVIVOR", title: name || "Unknown", subtitle: "Improvising through the decade." };
}

function artEvent(year) {
  return ART_SYSTEM.events[year] || { key: "event-ai", icon: "⚡", kicker: "TIMELINE EVENT", title: String(year || "2020s"), subtitle: "Reality is still rendering." };
}

function portraitMarkup(characterName) {
  const art = artCharacter(characterName);
  return `
    <div class="portrait-frame" aria-label="${art.title} portrait placeholder">
      <span class="portrait-icon">${art.icon}</span>
    </div>
  `;
}

function eventArtMarkup(event, mode) {
  const art = artEvent(event?.year);
  const modeClass = mode === "utopia" ? "utopia-art" : "dystopia-art";
  return `
    <div class="art-frame ${modeClass} ${art.key}">
      <div class="art-frame-inner">
        <div>
          <span class="art-icon">${art.icon}</span>
          <span class="art-kicker">${art.kicker}</span>
          <span class="art-title">${art.title}</span>
          <span class="art-subtitle">${art.subtitle}</span>
        </div>
      </div>
      <div class="art-lower-third">
        <strong>${event?.year || "2020s"} // ${event?.category || "Timeline Event"}</strong>
        <span>${mode === "utopia" ? "Repair broadcast" : "Dystopia broadcast"} placeholder art slot</span>
      </div>
    </div>
  `;
}
