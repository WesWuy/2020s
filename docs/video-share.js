// Prototype v0.16 Video Share Build.
// Appends a shareable Final Timeline Report certificate (copy text + downloadable
// image) to the video game ending, mirroring the board mode survival certificate.
// Wraps renderEnding (already wrapped by video-art-pass.js) so the certificate is
// rebuilt every time the ending renders. Reads the global videoState/videoEls/GAME
// and endingText defined in video-game.js.

function videoShareData() {
  if (!videoState || !videoState.ended) return null;
  const character = GAME.characters[videoState.characterIndex];
  return {
    name: videoState.characterName || character.name,
    character: character.name,
    mode: videoState.mode === "utopia" ? "Utopia Run" : "Dystopia Run",
    success: Boolean(videoState.success),
    title: videoState.endingTitle || "Certified Timeline Survivor",
    sanity: videoState.sanity,
    money: videoState.money,
    influence: videoState.influence,
    timeline: videoState.timeline,
    diagnosis: typeof endingText === "function" ? endingText(Boolean(videoState.success)) : "",
    url: "https://weswuy.github.io/2020s/video.html"
  };
}

function videoShareText(d) {
  const outcome = d.success ? "Outcome: Survived the decade." : "Outcome: The timeline won this round.";
  return `${d.name} ran the ${d.mode} of 2020s: The Game.\n\nEnding: ${d.title}\n${outcome}\nSanity: ${d.sanity}/9\nMoney: ${d.money}/9\nInfluence: ${d.influence}/9\nTimeline Health: ${d.timeline}%\n\nFinal Diagnosis: ${d.diagnosis}\n\nThink you can survive the decade better?\n${d.url}`;
}

function videoShowToast(message) {
  let toast = document.getElementById("videoToastMessage");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "videoToastMessage";
    toast.className = "toast-message";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2400);
}

function videoCopyToClipboard(text, successMessage) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => videoShowToast(successMessage)).catch(() => prompt("Copy this:", text));
  } else {
    prompt("Copy this:", text);
  }
}

function videoDrawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(" ");
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

function downloadVideoResultImage(d) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  const utopia = d.mode === "Utopia Run";

  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, utopia ? "#13291e" : "#361725");
  gradient.addColorStop(1, "#0a0c13");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = utopia ? "rgba(126,231,135,.14)" : "rgba(255,92,122,.14)";
  ctx.beginPath();
  ctx.arc(150, 90, 230, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f2c94c";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.fillText(`2020s: The Game — ${d.mode}`, 70, 76);

  ctx.fillStyle = "#f7f0ff";
  ctx.font = "bold 56px Arial, sans-serif";
  videoDrawWrappedText(ctx, d.success ? `${d.name} survived the 2020s.` : `${d.name} was consumed by the 2020s.`, 70, 158, 1010, 64);

  ctx.fillStyle = "#c8b9ce";
  ctx.font = "28px Arial, sans-serif";
  ctx.fillText(`As ${d.character} — ${d.title}`, 70, 292);

  ctx.fillStyle = "#f7f0ff";
  ctx.font = "bold 34px Arial, sans-serif";
  ctx.fillText(`Sanity ${d.sanity}/9`, 70, 372);
  ctx.fillText(`Money ${d.money}/9`, 320, 372);
  ctx.fillText(`Influence ${d.influence}/9`, 560, 372);

  ctx.fillStyle = utopia ? "#7ee787" : "#ff5c7a";
  ctx.font = "bold 44px Arial, sans-serif";
  ctx.fillText(`Timeline Health: ${d.timeline}%`, 70, 456);

  ctx.fillStyle = "#c8b9ce";
  ctx.font = "24px Arial, sans-serif";
  videoDrawWrappedText(ctx, d.diagnosis, 70, 506, 1010, 32);

  ctx.fillStyle = "#91c9ff";
  ctx.font = "bold 24px Arial, sans-serif";
  ctx.fillText("Survive your own decade: weswuy.github.io/2020s/video.html", 70, 596);

  const link = document.createElement("a");
  link.download = `2020s-timeline-report-${d.name.replace(/\s+/g, "-").toLowerCase()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  videoShowToast("Result image downloaded.");
}

function renderVideoShareCertificate() {
  const d = videoShareData();
  if (!d || !videoEls.ending) return;
  if (videoEls.ending.querySelector("#videoShareCertificate")) return;

  const certificate = document.createElement("section");
  certificate.id = "videoShareCertificate";
  certificate.className = "share-certificate";
  certificate.innerHTML = `
    <h3>Shareable Timeline Report</h3>
    <p class="share-note">Copy or download your final broadcast and dare someone to survive the decade better.</p>
    <div id="videoCertificateCard" class="certificate-card">
      <p class="eyebrow">${d.mode} // Final Broadcast</p>
      <h2 class="certificate-title">${d.success ? `${d.name} survived the 2020s.` : `${d.name} was consumed by the 2020s.`}</h2>
      <p class="certificate-subtitle">As ${d.character} — ${d.title}</p>
      <div class="share-stats">
        <div><span>Sanity</span><strong>${d.sanity}/9</strong></div>
        <div><span>Money</span><strong>${d.money}/9</strong></div>
        <div><span>Influence</span><strong>${d.influence}/9</strong></div>
        <div><span>Timeline</span><strong>${d.timeline}%</strong></div>
      </div>
      <p class="final-diagnosis"><strong>Final Diagnosis:</strong> ${d.diagnosis}</p>
    </div>
    <div class="share-actions">
      <button id="videoCopyResultBtn" class="button" type="button">Copy Result</button>
      <button id="videoDownloadResultBtn" class="button secondary" type="button">Download Result Image</button>
    </div>
  `;
  videoEls.ending.appendChild(certificate);

  document.getElementById("videoCopyResultBtn")?.addEventListener("click", () => videoCopyToClipboard(videoShareText(d), "Result copied. Paste it anywhere."));
  document.getElementById("videoDownloadResultBtn")?.addEventListener("click", () => downloadVideoResultImage(d));
}

const originalShareRenderEnding = renderEnding;
renderEnding = function shareRenderEnding() {
  originalShareRenderEnding();
  if (videoState && videoState.ended) renderVideoShareCertificate();
};

renderVideo();
