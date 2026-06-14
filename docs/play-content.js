// Prototype v0.17 Content Pack.
// Adds outrageous ending titles, expanded achievements, and stronger final diagnosis language for the four-stat v0.17 rules.

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
  "Public Trust Liability",
  "Permission Slip Dodger",
  "The Last Free Range Human",
  "Remote Work Revenant",
  "Normie of Destiny"
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
  if (state.ending) return state.ending;
  if (typeof getEndingTitle === "function") return getEndingTitle(player);

  const character = GAME.characters[player.characterIndex].name;
  const total = (player.sanity || 0) + (player.money || 0) + (player.freedom || 0) + (player.influence || 0);

  if (player.influence >= 8 && player.sanity <= 2) return "Blue Check Warlord";
  if (player.freedom >= 8 && player.sanity >= 6) return "The Last Free Range Human";
  if (player.money >= 8 && character === "The Prepper") return "Bunker Billionaire";
  if (player.money >= 8) return "CEO of Consequences";
  if (player.influence >= 8) return "Lord of the Comment Section";
  if (player.sanity >= 8) return "The Last Sane Person, Allegedly";
  if (player.sanity <= 1) return "Certified Timeline Goblin";
  if (character === "The Prepper") return "Canned Goods Messiah";
  if (character === "The Influencer") return "Main Character of the Collapse";
  if (character === "The Remote Worker") return "Remote Work Revenant";
  if (character === "The Activist") return "Minister of Vibes-Based Policy";
  if (character === "The Normie") return "Normie of Destiny";
  if (total >= 28) return "Verified Prophet of the Algorithm";

  return CONTENT_EXPLOSION_TITLES[contentHash(`${player.name}-${character}-${total}`) % CONTENT_EXPLOSION_TITLES.length];
};

const originalContentAchievements = getAchievements;
getAchievements = function contentExplosionAchievements(winner) {
  const achievements = originalContentAchievements(winner);
  const titles = (state.cardHistory || []).map(c => c.title).join(" | ");

  if (titles.includes("Conspiracy Corkboard")) achievements.push("Red String Scholar");
  if (titles.includes("Emergency Podcast Appearance")) achievements.push("Explained Everything Badly");
  if (titles.includes("Touch Grass") || titles.includes("Digital Detox")) achievements.push("Touched Grass Under Protest");
  if ((state.chaos?.doNotPresses || 0) >= 2) achievements.push("Button Goblin");
  if ((state.chaos?.scandalOverloads || 0) >= 1) achievements.push("Scandal Proof-ish");
  if ((state.meterCollapses?.panic || 0) >= 1) achievements.push("Panic Collapse Witness");
  if ((state.meterCollapses?.control || 0) >= 1) achievements.push("Control Collapse Survivor");
  if ((state.meterCollapses?.market || 0) >= 1) achievements.push("Market Collapse Rodeo");
  if ((state.playtest?.choicesResolved || 0) >= 3) achievements.push("Decision Fatigue Graduate");

  return [...new Set(achievements)].slice(0, 8);
};

finalDiagnosis = function contentExplosionFinalDiagnosis(winner) {
  const character = GAME.characters[winner.characterIndex].name;
  const chaos = state.chaos || {};

  if ((chaos.doNotPresses || 0) >= 3) return "Survived the decade despite repeatedly pressing the one button clearly labeled as a bad idea.";
  if ((chaos.realityCollapses || 0) >= 2) return "Lived through multiple Reality Collapses and still somehow demanded a normal ending.";
  if ((state.meterCollapses?.control || 0) >= 2) return "Escaped an impressive amount of institutional pressure with just enough Freedom left to complain about it.";
  if (winner.freedom <= 2) return "Technically free, spiritually still waiting for approval from a form nobody can locate.";
  if (winner.sanity <= 2 && winner.influence >= 7) return "Dangerously persuasive for someone held together by notifications and vibes.";
  if (winner.money >= 8 && winner.influence <= 2) return "Financially secure, socially unexplained, spiritually untaggable.";
  if (winner.influence >= 8) return "Society’s fault, technically. The algorithm merely provided the stage.";
  if (winner.sanity >= 8) return "Disturbingly stable. The timeline has opened an investigation.";
  if (character === "The Crypto Bro") return "Still early, still bullish, still describing a chart nobody asked to see.";
  if (character === "The Prepper") return "The pantry was correct. The personality consequences remain under review.";
  if (character === "The Influencer") return "Turned decline into engagement and called it a healing era.";
  if (character === "The Remote Worker") return "Logged into the collapse from home and somehow kept the camera off at the right times.";
  if (character === "The Activist") return "Transformed pressure into a movement, then accidentally became a scheduling problem.";
  if (character === "The Normie") return "Just wanted a normal decade and accidentally became the control group.";

  return "Survived with enough plausible deniability to be invited back for the expansion pack.";
};
