"use strict";
const icons = {
  ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6zM12 3v4M3 10l4 1m10 0 4-1M6 19l3-2m6 0 3 2"/>',
  cup: '<path d="M7 3h10v7a5 5 0 0 1-10 0zM7 5H3v3a5 5 0 0 0 5 5m9-8h4v3a5 5 0 0 1-5 5M12 15v6M7 21h10"/>',
  bolt: '<path d="m14 2-10 12h7l-1 8L20 9h-7z"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
  arena: '<path d="M3 6h18v14H3zM12 6v14M3 10h4v6H3m18-6h-4v6h4"/>',
  shop: '<path d="m4 7 2 14h12l2-14zM8 7V5a4 4 0 0 1 8 0v2"/>',
  chart: '<path d="M4 20V10m8 10V4m8 16v-7M1 20h22"/>',
  sound:
    '<path d="m4 10 5-5v14l-5-5H1v-4zM14 8a6 6 0 0 1 0 8m4-12a11 11 0 0 1 0 16"/>',
  settings: '<path d="M4 7h16M4 17h16M9 4v6m6 4v6"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};
function icon(id) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id] || icons.ball}</svg>`;
}
function header(back) {
  return `<header class="screen-header"><div class="header-left">${back ? `<button class="back" id="backButton" aria-label="Kembali">${icon("back")}</button>` : ""}<a class="brand" href="./">${managedConfig?.branding.logo ? `<img class="brand-logo" src="${esc(managedConfig.branding.logo)}" alt="">` : '<span class="brand-mark">H<span>↗</span></span>'}<span class="mini-brand">${esc(managedConfig?.branding.title || "Head Arena")}</span></a></div><div class="header-actions"><div class="money"><i>●</i><span data-wallet>${saved.coins.toLocaleString("id-ID")}</span></div><button class="icon" id="menuSound" aria-label="Suara">${icon("sound")}</button><button class="icon" id="menuFull" aria-label="Layar penuh">${icon("expand")}</button><button class="icon" id="menuSettings" aria-label="Pengaturan">${icon("settings")}</button></div></header>`;
}
function renderPage(name, body, back = showHome) {
  view = name;
  resetAnalog();
  $("#notifications")?.replaceChildren();
  $("#screen").dataset.view = name;
  $("#overlay").classList.add("hidden");
  $("#screen").className =
    "screen " + (name === "home" ? "home" : "") + " fade-in";
  $("#screen").innerHTML =
    header(name === "home" ? null : back) +
    `<div class="screen-body">${body}</div>`;
  $("#app").classList.add("menu-state");
  setMatchUI(false);
  $("#announce").classList.add("hidden");
  if ($("#backButton")) $("#backButton").onclick = back;
  $("#menuSound").onclick = toggleSound;
  $("#menuFull").onclick = toggleFull;
  $("#menuSettings").onclick = () =>
    showSettings(state === "paused" ? "pause" : "home");
  renderCharacters();
  requestAnimationFrame(hydrateGame);
}
function heading(k, t, p = "", extra = "") {
  return `<div class="page-heading"><div><h1>${t.replace(/\.$/, "")}</h1>${p ? `<p>${p}</p>` : ""}</div>${extra}</div>`;
}
function showHome() {
  state = "menu";
  keys = {};
  activeTeams = null;
  time = Number($("#duration").value);
  score = [0, 0];
  resetPositions();
  const s = skillDef(ROSTER[selectedFace]?.skill),
    rank = Math.floor(saved.wins / 5) + 1,
    progress = ((saved.wins % 5) / 5) * 100;
  renderPage(
    "home",
    `<div class="lobby"><aside class="player-panel"><div class="player-panel-top"><span>PEMAINMU</span><span class="rank-tag">LV. ${rank}</span></div><div class="lobby-portrait">${portrait("player", "", 230, 255)}</div><h2>${esc(ownName())}</h2><div class="lobby-skill"><img src="${esc(s.icon)}" alt=""><span>${esc(s.name)}</span></div><button class="outline" id="playerMenu">${icon("user")} Ganti pemain</button><div class="rank-progress"><span>${saved.wins} kemenangan</span><b>${5 - (saved.wins % 5)} lagi naik level</b><i><em style="width:${progress}%"></em></i></div></aside><section class="lobby-main"><div class="match-hero"><div class="hero-shade"></div><div class="hero-copy"><span class="match-label"><i></i> 1 VS 1 FOOTBALL</span><h1>Panggungmu.<br><span>Golmu.</span></h1><p>${esc(managedConfig?.branding.subtitle || "Bawa permainan terbaikmu ke lapangan.")}</p><button id="playNow" class="primary hero-play">Main sekarang ${icon("arrow")}</button></div><div class="hero-rival">${portrait("rival", "", 260, 290)}<span class="versus-chip">NEXT RIVAL</span></div></div><div class="mode-tiles"><button id="worldMenu" class="mode-tile world-tile"><span class="tile-icon">${icon("cup")}</span><div><small>32 NEGARA</small><h3>Piala Dunia</h3></div><b>↗</b></button><button id="cupMenu" class="mode-tile"><span class="tile-icon">${icon("ball")}</span><div><small>KNOCKOUT</small><h3>Arcade Cup</h3></div><b>↗</b></button><button id="challengeMenu" class="mode-tile challenge-tile"><span class="tile-icon">${icon("bolt")}</span><div><small>UJI SKILL</small><h3>Tantangan</h3></div><b>↗</b></button><button id="practiceMenu" class="mode-tile"><span class="tile-icon">${icon("target")}</span><div><small>TANPA BATAS WAKTU</small><h3>Latihan</h3></div><b>↗</b></button></div></section></div><nav class="lobby-dock"><button id="shopMenu">${icon("shop")}<span>Shop</span></button><button id="arenaMenu">${icon("arena")}<span>Stadion</span></button><button id="careerMenu">${icon("chart")}<span>Karier</span><i>${saved.wins} W</i></button><button id="dailyMenu">${icon("bolt")}<span>Bonus harian</span><i>${dailyReady() ? "+100" : "✓"}</i></button></nav>`,
  );
  $("#playNow").onclick = showModes;
  $("#worldMenu").onclick = showWorldHub;
  $("#cupMenu").onclick = showCup;
  $("#challengeMenu").onclick = showChallenges;
  $("#practiceMenu").onclick = () => {
    mode = "training";
    showPlayers();
  };
  $("#playerMenu").onclick = () => {
    selectSide = 0;
    rosterPage = Math.floor(selectedFace / 6);
    showRoster("locker");
  };
  $("#shopMenu").onclick = showShop;
  $("#arenaMenu").onclick = showArenas;
  $("#careerMenu").onclick = showCareer;
  $("#dailyMenu").onclick = claimDaily;
  for (const [id, key] of [
    ["worldMenu", "worldCup"],
    ["cupMenu", "arenaCup"],
    ["challengeMenu", "challenges"],
    ["practiceMenu", "training"],
  ])
    if (managedConfig && !managedConfig.features[key]) $("#" + id)?.remove();
}
function dailyReady() {
  return saved.daily !== new Date().toISOString().slice(0, 10);
}
function claimDaily() {
  if (!dailyReady()) {
    toast("Bonus hari ini sudah diambil. Sampai besok!");
    return;
  }
  saved.daily = new Date().toISOString().slice(0, 10);
  saved.coins += 100;
  save();
  showHome();
  toast("+100 koin · Bonus harian");
}
function showModes() {
  state = "menu";
  if (!["quick", "versus", "training"].includes(mode)) mode = "quick";
  const modes = [
    [
      "quick",
      "ball",
      "Quick Match",
      "Cari celah, jaga gawang, dan kalahkan CPU.",
    ],
    ["versus", "user", "Local Versus", "Dua pemain, satu keyboard."],
    ["training", "target", "Latihan", "Bebas bermain tanpa batas waktu."],
  ].filter((m) => m[0] === "quick" || managedConfig?.features[m[0]] !== false);
  renderPage(
    "modes",
    heading(
      "",
      "Pilih permainan",
      "Normal untuk reli seimbang. Pro untuk lawan yang lebih sigap bertahan.",
    ) +
      `<div class="cards">${modes.map(([id, ic, title, desc]) => `<button class="mode-card ${mode === id ? "selected" : ""}" data-mode="${id}"><span class="mode-symbol">${icon(ic)}</span><strong>${title}</strong><p>${desc}</p><span class="selected-mark">✓</span></button>`).join("")}</div><div class="config-row"><label>CPU<select id="difficultyUI"><option value="easy">Santai</option><option value="normal">Normal</option><option value="hard">Pro</option><option value="elite">Paling Jago</option></select></label><label>Durasi<select id="durationUI"><option value="30">30 detik</option><option value="60">60 detik</option><option value="90">90 detik</option><option value="120">120 detik</option><option value="180">180 detik</option></select></label><button class="primary" id="choosePlayers">Pilih pemain ${icon("arrow")}</button></div>`,
  );
  $("#difficultyUI").value = $("#difficulty").value;
  $("#durationUI").value = $("#duration").value;
  $("#difficultyUI").onchange = (e) =>
    ($("#difficulty").value = e.target.value);
  $("#durationUI").onchange = (e) => ($("#duration").value = e.target.value);
  $$("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        mode = b.dataset.mode;
        showModes();
      }),
  );
  $("#choosePlayers").onclick = showPlayers;
}
const fieldArt = new Image();
fieldArt.onload = () => (stadiumKey = "");
fieldArt.src = "assets/stadium.webp";
function paintStadium(c) {
  const ar = ARENAS.find((a) => a.id === saved.arena) || ARENAS[0];
  c.fillStyle = "#5ba0e9";
  c.fillRect(0, 0, 1120, 560);
  if (fieldArt.complete && fieldArt.naturalWidth)
    c.drawImage(fieldArt, 0, 0, 1120, 520);
  if (ar.weather === "rain") {
    c.fillStyle = "#22395450";
    c.fillRect(0, 0, 1120, 410);
  } else if (saved.arena === "sunset" || saved.arena === "desert") {
    c.fillStyle = "#ff91442b";
    c.fillRect(0, 0, 1120, 410);
  }
  c.save();
  c.globalCompositeOperation = "soft-light";
  c.globalAlpha = 0.35;
  const skyTint = c.createLinearGradient(0, 0, 0, 397);
  skyTint.addColorStop(0, ar.sky[0]);
  skyTint.addColorStop(1, ar.sky[1]);
  c.fillStyle = skyTint;
  c.fillRect(0, 0, 1120, 397);
  c.restore();
  if (window.arenaBackgrounds[ar.id])
    c.drawImage(window.arenaBackgrounds[ar.id], 0, 0, 1120, 410);
  const g = c.createLinearGradient(0, 390, 0, 560);
  g.addColorStop(0, ar.pitch);
  g.addColorStop(1, "#145b3b");
  c.fillStyle = g;
  c.fillRect(0, 397, 1120, 163);
  for (let i = 0; i < 16; i++) {
    c.fillStyle = i % 2 ? "#fff00005" : "#002c2812";
    c.fillRect(i * 70, 397, 70, 163);
  }
  c.strokeStyle = "#e1f7cf70";
  c.lineWidth = 2;
  c.strokeRect(24, 413, 1072, 124);
  c.beginPath();
  c.moveTo(560, 413);
  c.lineTo(560, 537);
  c.ellipse(560, 475, 60, 38, 0, 0, 7);
  c.stroke();
  c.strokeRect(24, 431, 175, 80);
  c.strokeRect(921, 431, 175, 80);
  c.strokeStyle = "#d4efb969";
  c.beginPath();
  c.moveTo(0, GROUND + 3);
  c.lineTo(1120, GROUND + 3);
  c.stroke();
  c.fillStyle = "#062d3225";
  c.fillRect(0, 540, 1120, 20);
  c.fillStyle = "#183b56";
  c.fillRect(0, 384, 1120, 13);
  c.fillStyle = "#d6e8f4";
  c.textAlign = "center";
  c.font = "700 7px Arial";
  for (let i = 0; i < 8; i++)
    c.fillText(
      managedConfig?.branding.title.toUpperCase() || "HEAD ARENA",
      70 + i * 140,
      393,
    );
}
let netWaves = [0, 0],
  goalBall = null;
function drawGoal(left, front = false) {
  const x = left ? LEFT : RIGHT,
    back = left ? 28 : 1092,
    dir = left ? -1 : 1,
    depth = 15,
    side = left ? 0 : 1,
    pulse = netWaves[side] * Math.sin(simTime * 30) * 8;
  ctx.save();
  if (!front) {
    ctx.fillStyle = "#06264430";
    ctx.beginPath();
    ctx.ellipse(
      (x + back) / 2,
      GROUND + 3,
      Math.abs(x - back) / 2 + 15,
      10,
      0,
      0,
      7,
    );
    ctx.fill();
    ctx.fillStyle = "#e9f9ff17";
    ctx.beginPath();
    ctx.moveTo(x, POST);
    ctx.lineTo(back, POST + depth);
    ctx.lineTo(back, GROUND);
    ctx.lineTo(x, GROUND);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#f5fdff73";
    ctx.lineWidth = 0.9;
    for (let y = POST + 12; y < GROUND; y += 12) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        (x + back) / 2 + dir * pulse,
        y + 8,
        back + dir * pulse * 0.3,
        Math.min(GROUND, y + depth),
      );
      ctx.stroke();
    }
    for (let i = 0; i <= 9; i++) {
      const t = i / 9,
        xx = x + (back - x) * t;
      ctx.beginPath();
      ctx.moveTo(xx, POST + depth * t);
      ctx.quadraticCurveTo(
        xx + dir * pulse,
        POST + (GROUND - POST) * 0.6,
        xx,
        GROUND,
      );
      ctx.stroke();
    }
    ctx.strokeStyle = "#becdd0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, POST);
    ctx.lineTo(back, POST + depth);
    ctx.lineTo(back, GROUND);
    ctx.lineTo(x, GROUND);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff96";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, POST);
    ctx.lineTo(back, POST + depth);
    ctx.stroke();
  } else {
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f2a4299";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(x + 2, GROUND);
    ctx.lineTo(x + 2, POST);
    ctx.lineTo(back, POST);
    ctx.stroke();
    ctx.strokeStyle = "#f8fcff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, GROUND);
    ctx.lineTo(x, POST);
    ctx.lineTo(back, POST);
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 2, GROUND - 2);
    ctx.lineTo(x - 2, POST + 3);
    ctx.lineTo(back, POST + 3);
    ctx.stroke();
    for (let y = POST + 12; y < GROUND; y += 22) {
      ctx.strokeStyle = "#225ede";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 6);
      ctx.stroke();
    }
    if (
      (left && (p1.x < LEFT || p2.x < LEFT)) ||
      (!left && (p1.x > RIGHT || p2.x > RIGHT))
    ) {
      ctx.strokeStyle = "#effbff70";
      ctx.lineWidth = 0.8;
      for (let y = POST + 14; y < GROUND; y += 14) {
        ctx.beginPath();
        ctx.moveTo(back, y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      for (let xx = Math.min(x, back); xx < Math.max(x, back); xx += 13) {
        ctx.beginPath();
        ctx.moveTo(xx, POST + 5);
        ctx.lineTo(xx, GROUND);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}
function collidePlayerGoal(p, oldX, oldY) {
  const s = p.size || 1,
    hp = window.headPose47 ? headPose47(p) : {x:0,y:-77},
    head = Math.max(110, -hp.y + (window.G47?.headR || 38)) * s,
    r = (window.G47?.headR || 42) * s;
  for (const [a, b, left] of [
    [28, LEFT, true],
    [RIGHT, 1092, false],
  ]) {
    const spans = p.x + 24 * s > a && p.x - 24 * s < b,
      oldTop = oldY - head,
      newTop = p.y - head;
    if (
      spans &&
      head > GROUND - POST - 9 &&
      p.y > POST &&
      p.y - head < POST + 5
    ) {
      p.x = left ? b + r - hp.x*s + 5 : a - r - hp.x*s - 5;
      p.vx = 0;
      continue;
    }
    if (spans) {
      if (p.vy < 0 && oldTop >= POST + 4 && newTop < POST + 5) {
        p.y = POST + 5 + head;
        p.vy = Math.max(30, -p.vy * 0.15);
        p.onGround = false;
        sfx("post", 0.35);
      } else if (p.vy >= 0 && oldY <= POST - 4 && p.y >= POST - 5) {
        p.y = POST - 5;
        p.vy = 0;
        p.onGround = true;
      } else if (p.y - head < POST + 5 && p.y > POST - 5) {
        if (oldTop >= POST + 4) {
          p.y = POST + 5 + head;
          p.vy = Math.max(0, p.vy);
        } else if (oldY <= POST) {
          p.y = POST - 5;
          p.vy = 0;
          p.onGround = true;
        } else {
          if ((left && oldX >= b) || (!left && oldX <= a)) {
            p.x = left ? b + r - hp.x*s + 5 : a - r - hp.x*s - 5;
            p.vx = 0;
          }
        }
      }
    }
    const x = left ? LEFT : RIGHT,
      dx = p.x + hp.x*s - x,
      dy = p.y + hp.y*s - POST,
      d = Math.hypot(dx, dy);
    if (d < r + 5 && d > 0.01) {
      const nx = dx / d,
        ny = dy / d;
      p.x = x + nx * (r + 5) - hp.x*s;
      p.y = POST + ny * (r + 5) - hp.y*s;
      const v = p.vx * nx + p.vy * ny;
      if (v < 0) {
        p.vx -= v * nx;
        p.vy -= 1.1 * v * ny;
      }
    }
  }
  p.x = Math.max(28 + 33 * s, Math.min(1092 - 33 * s, p.x));
}
function movePlayer(p, dir, j, dt) {
  const ox = p.x, oy = p.y;
  p.prevX = ox; p.prevY = oy;
  if (p.support !== null && p.support !== undefined) {
    const base = p.support === 0 ? p1 : p2;
    if (Math.abs(p.x-base.x) < 28*(base.size||1) && Math.abs(p.y-(base.y-106*(base.size||1))) < 8) p.onGround=true;
    else p.support=null;
  }
  if (
    p.support == null && p.y < GROUND - 0.5 &&
    !(
      Math.abs(p.y - (POST - 5)) < 1 &&
      (p.x < LEFT + 24 * (p.size || 1) || p.x > RIGHT - 24 * (p.size || 1))
    )
  )
    p.onGround = false;
  moveBasePlayer(p, dir, j, dt);
  collidePlayerGoal(p, ox, oy);
}
function drawBall() {
  ctx.save();
  ctx.fillStyle = "#071b292a";
  ctx.beginPath();
  ctx.ellipse(ball.x, GROUND + 2, ball.r * 1.25, 4, 0, 0, 7);
  ctx.fill();
  if (saved.effects !== false)
    trail.forEach((p, i) => {
      ctx.globalAlpha = (i / trail.length) * (ball.hot > 0 ? 0.5 : 0.12);
      ctx.fillStyle = ball.hot > 0 ? "#ffb02c" : "#fff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, (ball.r * i) / trail.length, 0, 7);
      ctx.fill();
    });
  ctx.globalAlpha = 1;
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.spin);
  const g = ctx.createRadialGradient(-5, -6, 1, 2, 4, ball.r);
  g.addColorStop(0, saved.ball === "goldball" ? "#ffe396" : "#fff");
  g.addColorStop(1, saved.ball === "goldball" ? "#b88820" : "#b9c7d3");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, ball.r, 0, 7);
  ctx.fill();
  ctx.strokeStyle = "#152e47";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#162c45";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * ball.r * 0.45, Math.sin(a) * ball.r * 0.45);
  }
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.strokeStyle = "#294057";
    ctx.beginPath();
    ctx.moveTo(0, -ball.r * 0.43);
    ctx.lineTo(0, -ball.r);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -ball.r, ball.r * 0.27, 0, 7);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function goal(side) {
  netWaves[side === 0 ? 1 : 0] = 1;
  goalBall = { x: ball.x, y: ball.y, vx: ball.vx * 0.28, vy: ball.vy * 0.3 };
  scoreGoal(side);
  celebrateGoal(side);
}
function goalAnimation(dt) {
  for (let i = 0; i < 2; i++)
    netWaves[i] = Math.max(0, netWaves[i] - dt * 0.65);
  if (state === "goal" && goalBall) {
    goalBall.vy += settings().gravity * dt * 0.5;
    goalBall.x += goalBall.vx * dt;
    goalBall.y += goalBall.vy * dt;
    const lo = lastScorer === 0 ? RIGHT + ball.r : 28 + ball.r,
      hi = lastScorer === 0 ? 1092 - ball.r : LEFT - ball.r;
    if (goalBall.x < lo) {
      goalBall.x = lo;
      goalBall.vx = Math.abs(goalBall.vx) * 0.25;
    }
    if (goalBall.x > hi) {
      goalBall.x = hi;
      goalBall.vx = -Math.abs(goalBall.vx) * 0.25;
    }
    if (goalBall.y > GROUND - ball.r) {
      goalBall.y = GROUND - ball.r;
      goalBall.vy = -Math.abs(goalBall.vy) * 0.35;
    }
    ball.x = goalBall.x;
    ball.y = goalBall.y;
    ball.spin += (goalBall.vx * dt) / ball.r;
  }
}
function drawSkyMarker() {
  if (state === "menu" || ball.y >= 20) return;
  const x = Math.max(25, Math.min(worldViewWidth428() - 25, ball.x - cameraX));
  ctx.fillStyle = "#19375f";
  rounded(ctx, x - 22, 75, 44, 27, 8);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("↑ " + Math.round((20 - ball.y) / 10), x, 93);
}
function setMatchUI(on) {
  ["matchHud", "matchTools", "matchBottom", "touchControls"].forEach((id) =>
    $("#" + id).classList.toggle("hidden", !on),
  );
  if (!on) $("#challengeProgress").classList.add("hidden");
}
function showSettings(from = "home") {
  settingsFrom = from;
  renderPage(
    "settings",
    heading("", "Pengaturan") +
      `<div class="settings-grid"><section class="settings-panel"><h3>Suara & tampilan</h3><div class="settings-field"><span>Suara game</span><button id="audioToggle">${muted ? "Nonaktif" : "Aktif"}</button></div><label class="settings-field">Volume<input id="volume" type="range" min="0" max="1" step="0.05" value="${saved.volume}"></label><div class="settings-field"><span>Efek kamera</span><button id="fxToggle">${saved.effects ? "Aktif" : "Nonaktif"}</button></div><div class="settings-field"><span>Tampilan</span><button id="settingFull">Layar penuh ↗</button></div></section><section class="settings-panel"><h3>Kontrol mobile</h3><div class="control-guide"><div class="guide-stick">↑<span>← • →</span></div><p><b>Geser analog ke atas untuk lompat.</b><br>Diagonal atas untuk lompat sambil bergerak. Tahan untuk melompat lagi saat mendarat.</p></div><p>Gerak + lompat dari satu analog.<br>Dua tombol: <b>Shoot</b> dan <b>Skill</b>.</p><details class="keyboard-help"><summary>Kontrol keyboard</summary><p>A/D gerak · W lompat · Spasi shoot · Q skill<br>P2: ←/→ gerak · ↑ lompat · Enter shoot · Shift skill<br>Esc untuk jeda.</p></details></section></div>`,
    () => (from === "pause" ? showPause() : showHome()),
  );
  $("#audioToggle").onclick = () => {
    toggleSound();
    $("#audioToggle").textContent = muted ? "Nonaktif" : "Aktif";
  };
  $("#volume").oninput = (e) => {
    saved.volume = Number(e.target.value);
    saved.sound = true;
    muted = false;
    save();
    beep();
  };
  $("#fxToggle").onclick = () => {
    saved.effects = !saved.effects;
    save();
    $("#fxToggle").textContent = saved.effects ? "Aktif" : "Nonaktif";
  };
  $("#settingFull").onclick = toggleFull;
}
function showPause() {
  resetAnalog();
  $("#announce").classList.add("hidden");
  $("#screen").classList.add("hidden");
  $("#app").classList.remove("menu-state");
  setMatchUI(true);
  state = "paused";
  splash("Jeda", "", "Lanjut bermain", resumeGame, "AMBIL NAPAS", "Menu utama");
  const b = document.createElement("button");
  b.textContent = "Pengaturan";
  b.className = "ghost";
  b.onclick = () => showSettings("pause");
  $("#splash").append(b);
}
$("#sound").innerHTML = icon("sound");
$("#fullscreen").innerHTML = icon("expand");
function drawLegs(c, p, skin) {
  const walk =
      Math.sin(simTime * 16) * Math.min(1, Math.abs(p.vx) / 250) * 0.55,
    phase =
      p.kick > 0 ? Math.sin(Math.max(0, (0.26 - p.kick) / 0.26) * Math.PI) : 0;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * 9, -15);
    c.rotate(side === p.face ? -p.face * phase * 1.2 : walk * side);
    c.fillStyle = skin;
    rounded(c, -5, 0, 10, 10, 4);
    c.translate(0, 8);
    c.rotate(side === p.face ? -p.face * phase * 0.45 : -walk * side * 0.3);
    rounded(c, -4, 0, 9, 8, 3);
    c.fillStyle = "#f9fcff";
    rounded(c, p.face > 0 ? -5 : -9, 0, 14, 7, 3);
    c.fillStyle = "#285085";
    c.fillRect(p.face > 0 ? -5 : -9, 5, 14, 2);
    c.restore();
  }
}

// Long-term goals reuse the existing device-local career, without resetting saves.
saved.cleanSheets ??= 0;
saved.proWins ??= 0;
function showCareer() {
  state = "menu";
  const awards = [
    {
      id: "first",
      title: "Gol perdana",
      desc: "Buka perjalananmu dengan satu gol.",
      value: saved.goals,
      target: 1,
      prize: 75,
    },
    {
      id: "wins",
      title: "Mulai panas",
      desc: "Kumpulkan lima kemenangan.",
      value: saved.wins,
      target: 5,
      prize: 250,
    },
    {
      id: "cup",
      title: "Angkat piala",
      desc: "Juara Arcade Cup atau Piala Dunia.",
      value: saved.cups,
      target: 1,
      prize: 350,
    },
    {
      id: "goals25",
      title: "Pemburu celah",
      desc: "Cetak 25 gol sepanjang karier.",
      value: saved.goals,
      target: 25,
      prize: 300,
    },
    {
      id: "clean5",
      title: "Benteng kokoh",
      desc: "Menang tanpa kebobolan lima kali melawan CPU.",
      value: saved.cleanSheets,
      target: 5,
      prize: 350,
    },
    {
      id: "wins25",
      title: "Pemain andalan",
      desc: "Kumpulkan 25 kemenangan.",
      value: saved.wins,
      target: 25,
      prize: 500,
    },
    {
      id: "pro10",
      title: "Penakluk Pro",
      desc: "Menang sepuluh kali melawan CPU level Pro.",
      value: saved.proWins,
      target: 10,
      prize: 650,
    },
    {
      id: "goals100",
      title: "Seratus cerita",
      desc: "Cetak 100 gol sepanjang karier.",
      value: saved.goals,
      target: 100,
      prize: 700,
    },
    {
      id: "cups5",
      title: "Lemari piala",
      desc: "Menangkan lima turnamen.",
      value: saved.cups,
      target: 5,
      prize: 900,
    },
  ];
  renderPage(
    "career",
    heading(
      "",
      "Karier",
      "Target bertahap, hadiah sekali klaim. Progres tersimpan di browser ini.",
    ) +
      `<div class="career"><div><small>TOTAL GOL</small><strong>${saved.goals}</strong></div><div><small>KEMENANGAN</small><strong>${saved.wins}</strong></div><div><small>GELAR JUARA</small><strong>${saved.cups}</strong></div></div><div class="career-goals">${awards
        .map((a) => {
          const done = saved.claims.includes(a.id),
            ready = a.value >= a.target;
          return `<article class="career-goal"><h3>${a.title}</h3><p>${a.desc}</p><div class="progress-track"><i style="width:${Math.min(100, (a.value / a.target) * 100)}%"></i></div><small>${Math.min(a.value, a.target)} / ${a.target} · Hadiah ${a.prize} koin</small><button data-career-claim="${a.id}" class="${ready && !done ? "primary" : "ghost"}" ${!ready || done ? "disabled" : ""}>${done ? "Sudah diklaim ✓" : ready ? "Klaim hadiah" : "Belum tercapai"}</button></article>`;
        })
        .join("")}</div>`,
  );
  $$("[data-career-claim]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = awards.find((x) => x.id === b.dataset.careerClaim);
        if (!a || a.value < a.target || saved.claims.includes(a.id)) return;
        saved.claims.push(a.id);
        saved.coins += a.prize;
        save();
        showCareer();
        toast("+" + a.prize + " koin · " + a.title);
      }),
  );
}
