// Prototype v0.10 Content Explosion Pack.
// Adds outrageous ending titles, expanded achievements, and stronger final diagnosis language.

const CONTENT_EXPLOSION_TITLES = [
  "Certified Timeline Goblin",
  "Verified Prophet of the Algorithm",
  "Bunker Billionaire",
  "Doomscroll Duke",
  "Blue Check Warlord",
  "Canned Goods Messiah",
  "The Final Reply Guy",
  "Lord of the Comment Section",
  "The Last Sane Person, Allegedly",
  "CEO of Consequences",
  "Algorithmic Goblin King",
  "Emotionally Unavailable Economist",
  "Minister of Vibes-Based Policy",
  "Main Character of the Collapse",
  "Public Trust Liability"
];

function contentHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

shareEndingTitle = function contentExplosionEndingTitle(player) {
  const character = GAME.characters[player.characterIndex].name;
  const total = player.sanity + player.money + player.influence;

  if (player.influence >= 8 && player.sanity <= 2) return "Blue Check Warlord";
  if (player.money >= 8 && character === "The Prepper") return "Bunker Billionaire";
  if (player.money >= 8) return "CEO of Consequences";
  if (player.influence >= 8) return "Lord of the Comment Section";
  if (player.sanity >= 8) return "The Last Sane Person, Allegedly";
  if (player.sanity <= 1) return "Certified Timeline Goblin";
  if (character === "The Prepper") return "Canned Goods Messiah";
  if (character === "The Podcaster") return "The Final Reply Guy";
  if (character === "The Influencer") return "Main Character of the Collapse";
  if (total >= 24) return "Verified Prophet of the Algorithm";

  return CONTENT_EXPLOSION_TITLES[contentHash(`${player.name}-${character}-${total}`) % CONTENT_EXPLOSION_TITLES.length];
};

const originalContentAchievements = getAchievements;
getAchievements = function contentExplosionAchievements(winner) {
  const achievements = originalContentAchievements(winner);
  const titles = (state.cardHistory || []).map(c => c.title).join(" | ");

  if (titles.includes("Conspiracy Corkboard")) achievements.push("Red String Scholar");
  if (titles.includes("Emergency Podcast Appearance")) achievements.push("Explained Everything Badly");
  if (titles.includes("Touch Grass Mandate")) achievements.push("Touched Grass Under Protest");
  if (titles.includes("The Timeline Demands a Monologue")) achievements.push("Final Monologue Survivor");
  if ((state.chaos?.doNotPresses || 0) >= 2) achievements.push("Button Goblin");
  if ((state.chaos?.scandalOverloads || 0) >= 1) achievements.push("Scandal Proof-ish");

  return [...new Set(achievements)].slice(0, 8);
};

finalDiagnosis = function contentExplosionFinalDiagnosis(winner) {
  const character = GAME.characters[winner.characterIndex].name;
  const chaos = state.chaos || {};

  if ((chaos.doNotPresses || 0) >= 3) return "Survived the decade despite repeatedly pressing the one button clearly labeled as a bad idea.";
  if ((chaos.realityCollapses || 0) >= 2) return "Lived through multiple Reality Collapses and still somehow demanded a normal ending.";
  if (winner.sanity <= 2 && winner.influence >= 7) return "Dangerously persuasive for someone held together by notifications and vibes.";
  if (winner.money >= 8 && winner.influence <= 2) return "Financially secure, socially unexplained, spiritually untaggable.";
  if (winner.influence >= 8) return "Society’s fault, technically. The algorithm merely provided the stage.";
  if (winner.sanity >= 8) return "Disturbingly stable. The timeline has opened an investigation.";
  if (character === "Crypto Bro") return "Still early, still bullish, still describing a chart nobody asked to see.";
  if (character === "The Prepper") return "The pantry was correct. The personality consequences remain under review.";
  if (character === "The Influencer") return "Turned decline into engagement and called it a healing era.";
  if (character === "The Bureaucrat") return "Outlasted the decade by converting panic into procedure.";
  if (character === "The Wellness Guru") return "Regulated the nervous system while the group chat became a weather event.";
  if (character === "The Podcaster") return "Asked questions so long the decade gave up and let them pass.";

  return "Survived with enough plausible deniability to be invited back for the expansion pack.";
};
