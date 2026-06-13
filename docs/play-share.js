// Prototype v0.6 Social Loop Build.
// Creates shareable survival certificates, copyable result text, downloadable image cards, and achievements.

function getWinner() {
  return state.players?.find(p => p.winner) || null;
}

function getWinnerCharacter(winner) {
  return GAME.characters[winner.characterIndex];
}

function shareEndingTitle(player) {
  const total = player.sanity + player.money + player.influence;
  if (total >= 24) return "Verified Prophet of the Timeline";
  if (player.influence >= 8) return "Algorithmic Overlord";
  if (player.money >= 8) return "Monetized the Collapse";
  if (player.sanity >= 8) return "Disturbingly Stable Survivor";
  if (total <= 8) return "Barely Escaped the Decade";
  return "Certified Timeline Survivor";
}

function calculateTimelineDamage(winner) {
  const total = winner.sanity + winner.money + winner.influence;
  const cardLoad = state.cardHistory?.length || 0;
  const cycleFlips = (state.log || []).filter(line => line.toLowerCase().includes("cycle flipped") || line.toLowerCase().includes("board flipped")).length;
  return Math.min(99, 38 + total * 3 + cardLoad + cycleFlips * 4);
}

function narrativeStability(winner) {
  const total = winner.sanity + winner.money + winner.influence;
  if (total >= 24) return "Suspiciously Stable";
  if (total >= 16) return "Fragile";
  return "Critical";
}

function finalDiagnosis(winner) {
  const character = getWinnerCharacter(winner).name;
  if (winner.sanity <= 2) return "Alive, but the comment section lives rent-free in their head.";
  if (winner.money <= 2) return "Survived spiritually. Financially, the timeline took a bite.";
  if (winner.influence <= 2) return "Made it to 2030, but the algorithm refuses to verify their existence.";
  if (character === "Crypto Bro") return "Still early, somehow. The spreadsheet says this is victory.";
  if (character === "The Prepper") return "The pantry was right. The vibe was stressful, but the pantry was right.";
  if (character === "The Influencer") return "Monetized the collapse and called it a personal brand journey.";
  if (character === "The Bureaucrat") return "Filed the decade in triplicate and survived pending review.";
  if (character === "The Wellness Guru") return "Regulated their nervous system while history screamed in the background.";
  if (character === "The Podcaster") return "Survived by asking questions for longer than civilization had answers.";
  return "Survived the decade with a suspicious amount of narrative protection.";
}

function getAchievements(winner) {
  const achievements = [];
  const character = getWinnerCharacter(winner).name;
  const mediaDraws = (state.cardHistory || []).filter(c => c.deckName === "Media Meltdown").length;
  const hiddenDraws = (state.cardHistory || []).filter(c => c.deckName === "Hidden Hand").length;
  const cycleFlips = (state.log || []).filter(line => line.toLowerCase().includes("cycle flipped") || line.toLowerCase().includes("board flipped")).length;

  if (winner.sanity <= 2) achievements.push("Doomscroll Champion");
  if (winner.money >= 8) achievements.push("Monetized Collapse");
  if (winner.influence >= 8) achievements.push("Algorithmic Overlord");
  if (character === "The Prepper") achievements.push("Canned Goods Prophet");
  if (character === "Crypto Bro" && winner.money <= 2) achievements.push("Still Early");
  if (mediaDraws >= 3) achievements.push("Main Character Syndrome");
  if (hiddenDraws >= 3) achievements.push("Lodge Adjacent");
  if (cycleFlips >= 3) achievements.push("Narrative Survivor");
  if (winner.sanity >= 8) achievements.push("Disturbingly Stable");

  if (achievements.length === 0) achievements.push("Certified Timeline Survivor");
  return achievements.slice(0, 6);
}

function getShareData() {
  const winner = getWinner();
  if (!winner) return null;
  const character = getWinnerCharacter(winner);
  const timelineDamage = calculateTimelineDamage(winner);
  const publicTrust = Math.max(1, 100 - timelineDamage);
  return {
    winner,
    character,
    title: shareEndingTitle(winner),
    timelineDamage,
    publicTrust,
    stability: narrativeStability(winner),
    diagnosis: finalDiagnosis(winner),
    achievements: getAchievements(winner),
    url: "https://weswuy.github.io/2020s/play.html"
  };
}

function shareText(data) {
  return `${data.winner.name} survived the 2020s as ${data.character.name}.\n\nEnding Title: ${data.title}\nSanity: ${data.winner.sanity}/9\nMoney: ${data.winner.money}/9\nInfluence: ${data.winner.influence}/9\nTimeline Damage: ${data.timelineDamage}%\nPublic Trust Remaining: ${data.publicTrust}%\nNarrative Stability: ${data.stability}\nAchievements: ${data.achievements.join(", ")}\n\nFinal Diagnosis: ${data.diagnosis}\n\nCan you survive the decade better?\n${data.url}`;
}

function challengeText(data) {
  return `I survived the 2020s as ${data.character.name} with ${data.timelineDamage}% Timeline Damage.\n\nCan you beat my ending?\n${data.url}`;
}

function renderShareCertificate() {
  const data = getShareData();
  if (!data || document.getElementById("shareCertificate")) return;

  const certificate = document.createElement("section");
  certificate.id = "shareCertificate";
  certificate.className = "share-certificate";
  certificate.innerHTML = `
    <h3>Shareable Survival Certificate</h3>
    <p class="share-note">Copy, download, or challenge someone else to survive the decade better.</p>
    <div id="certificateCard" class="certificate-card">
      <p class="eyebrow">Official Timeline Receipt</p>
      <h2 class="certificate-title">${data.winner.name} survived the 2020s.</h2>
      <p class="certificate-subtitle">As ${data.character.name} — ${data.title}</p>
      <div class="share-stats">
        <div><span>Sanity</span><strong>${data.winner.sanity}/9</strong></div>
        <div><span>Money</span><strong>${data.winner.money}/9</strong></div>
        <div><span>Influence</span><strong>${data.winner.influence}/9</strong></div>
        <div><span>Damage</span><strong>${data.timelineDamage}%</strong></div>
      </div>
      <div class="achievement-list">${data.achievements.map(a => `<span class="achievement-badge">🏆 ${a}</span>`).join("")}</div>
      <p class="final-diagnosis"><strong>Final Diagnosis:</strong> ${data.diagnosis}</p>
    </div>
    <div class="share-actions">
      <button id="copyResultBtn" class="button" type="button">Copy Result</button>
      <button id="downloadResultBtn" class="button secondary" type="button">Download Result Image</button>
      <button id="challengeFriendsBtn" class="button secondary" type="button">Challenge Friends</button>
      <a class="button secondary" href="https://github.com/WesWuy/2020s/issues/new?template=card-idea.md" target="_blank" rel="noopener">Submit Card Idea</a>
    </div>
  `;

  els.winnerPanel.appendChild(certificate);

  document.getElementById("copyResultBtn")?.addEventListener("click", () => copyToClipboard(shareText(data), "Result copied. Paste it anywhere.");
  document.getElementById("challengeFriendsBtn")?.addEventListener("click", () => copyToClipboard(challengeText(data), "Challenge copied. Send it to someone brave.");
  document.getElementById("downloadResultBtn")?.addEventListener("click", () => downloadResultImage(data));
}

function copyToClipboard(text, successMessage) {
  navigator.clipboard?.writeText(text).then(() => {
    showToast(successMessage);
  }).catch(() => {
    prompt("Copy this:", text);
  });
}

function showToast(message) {
  let toast = document.getElementById("toastMessage");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMessage";
    toast.className = "toast-message";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const testLine = line + word + " ";
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
}

function downloadResultImage(data) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, "#1c1720");
  gradient.addColorStop(1, "#0c0b0f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = "rgba(242,201,76,.12)";
  ctx.beginPath();
  ctx.arc(140, 100, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f2c94c";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.fillText("2020s: The Board Game", 70, 74);

  ctx.fillStyle = "#f5edf7";
  ctx.font = "bold 58px Arial, sans-serif";
  drawWrappedText(ctx, `${data.winner.name} survived the 2020s.`, 70, 155, 960, 66);

  ctx.fillStyle = "#c8b9ce";
  ctx.font = "28px Arial, sans-serif";
  ctx.fillText(`As ${data.character.name} — ${data.title}`, 70, 290);

  ctx.fillStyle = "#f5edf7";
  ctx.font = "bold 34px Arial, sans-serif";
  ctx.fillText(`Sanity ${data.winner.sanity}/9`, 70, 370);
  ctx.fillText(`Money ${data.winner.money}/9`, 330, 370);
  ctx.fillText(`Influence ${data.winner.influence}/9`, 570, 370);

  ctx.fillStyle = "#f2c94c";
  ctx.font = "bold 44px Arial, sans-serif";
  ctx.fillText(`Timeline Damage: ${data.timelineDamage}%`, 70, 455);

  ctx.fillStyle = "#c8b9ce";
  ctx.font = "24px Arial, sans-serif";
  drawWrappedText(ctx, data.diagnosis, 70, 505, 980, 32);

  ctx.fillStyle = "#91c9ff";
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText("Can you survive the decade better? weswuy.github.io/2020s/play.html", 70, 592);

  const link = document.createElement("a");
  link.download = `2020s-survival-certificate-${data.winner.name.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("Result image downloaded.");
}

const originalShareRenderWinner = renderWinner;
renderWinner = function socialRenderWinner() {
  originalShareRenderWinner();
  if (getWinner()) renderShareCertificate();
};

render();
