"use strict";
// Matchday Edition: presentation and explicit Quick Match opponent selection.
let quickRival =
  Number.isInteger(saved.quickRival) && saved.quickRival >= 0
    ? saved.quickRival
    : null;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
function premiumButton(id, ic, title, sub) {
  return `<button id="${id}" class="competition-tile"><span class="competition-icon">${icon(ic)}</span><span><small>${sub}</small><strong>${title}</strong></span><b>↗</b></button>`;
}
function header(back) {
  return `<header class="screen-header"><div class="header-left">${back ? `<button class="back" id="backButton" aria-label="Kembali">${icon("back")}</button>` : ""}<a class="brand" href="./">${managedConfig?.branding.logo ? `<img class="brand-logo" src="${esc(managedConfig.branding.logo)}" alt="">` : '<span class="brand-mark">H<span>↗</span></span>'}<span><b class="mini-brand">${esc(managedConfig?.branding.title || "Head Arena")}</b><small class="brand-edition">MATCHDAY EDITION</small></span></a></div><div class="header-actions"><div class="money"><i>●</i><span data-wallet>${saved.coins.toLocaleString("id-ID")}</span></div><button class="icon" id="menuSound" aria-label="${muted ? "Aktifkan suara" : "Matikan suara"}">${icon("sound")}</button><button class="icon" id="menuFull" aria-label="Layar penuh">${icon("expand")}</button><button class="icon" id="menuSettings" aria-label="Pengaturan">${icon("settings")}</button></div></header>`;
}
function renderPage(name, body, back = showHome) {
  view = name;
  resetAnalog();
  clearPresentation();
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
function showHome() {
  state = "menu";
  keys = {};
  activeTeams = null;
  score = [0, 0];
  resetPositions();
  const homeText = { ...HOME_COPY, ...managedConfig?.home };
  const rank = Math.floor(saved.wins / 5) + 1,
    avatar = ROSTER[selectedFace],
    available = ROSTER.filter((r) => r.enabled !== false).length;
  renderPage(
    "home",
    `<div class="home-topline"><span><i></i> ${esc(homeText.tagline)}</span><button id="playerMenu" class="profile-chip"><img src="${esc(avatar?.image || "assets/icon-192.png")}" alt=""><span>${esc(ownName())}<small>LEVEL ${rank} · ${saved.wins} MENANG</small></span>${icon("back")}</button></div><section class="premium-hero"><div class="hero-vignette"></div><div class="premium-copy"><div class="eyebrow"><span></span> ${esc(homeText.eyebrow)}</div><h1>${esc(homeText.titleLine1)}<br><em>${esc(homeText.titleLine2)}</em></h1><p>${esc(homeText.description)}</p><button class="primary play-cta" id="playNow">${esc(homeText.playLabel)} ${icon("arrow")}</button><div class="hero-meta">${available} karakter <i>•</i> ${6+(window.PREMIUM419?.length||0)} skill <i>•</i> Pilih rivalmu</div></div><div class="hero-cast" aria-hidden="true"><span class="cast-orbit"></span><div class="cast-one" data-home-player="${homeCast(0)}">${portrait("face" + homeCast(0), "", 280, 330)}</div><div class="cast-two" data-home-player="${homeCast(1)}">${portrait("face" + homeCast(1), "", 280, 330)}</div><span class="cast-vs">VS</span></div><div class="hero-stamp"><span>01</span><small>MAKE IT<br>YOUR GAME.</small></div></section><div class="section-caption"><span>${esc(homeText.sectionLabel)}</span><span>${esc(homeText.sectionNote)}</span></div><div class="competition-grid">${premiumButton("worldMenu", "cup", "Piala Dunia", "32 NEGARA · SATU JUARA")}${premiumButton("cupMenu", "ball", "Arcade Cup", "3 RONDE · KNOCKOUT")}${premiumButton("practiceMenu", "target", "Latihan", "BEBAS · TANPA WAKTU")}</div><nav class="premium-dock"><button id="shopMenu">${icon("shop")}<span>Shop sepatu</span></button><button id="arenaMenu">${icon("arena")}<span>Stadion</span></button><button id="careerMenu">${icon("chart")}<span>Karier</span></button><button id="challengeMenu">${icon("bolt")}<span>Tantangan</span></button><button id="dailyMenu">${icon("target")}<span>Bonus harian</span><i>${dailyReady() ? "+100" : "✓"}</i></button></nav>`,
  );
  $("#playNow").onclick = showModes;
  $("#playerMenu").onclick = () => {
    selectSide = 0;
    rosterPage = Math.floor(selectedFace / 6);
    showRoster("locker");
  };
  $("#worldMenu").onclick = showWorldHub;
  $("#cupMenu").onclick = showCup;
  $("#practiceMenu").onclick = () => {
    mode = "training";
    showPlayers();
  };
  $("#shopMenu").onclick = showShop;
  $("#arenaMenu").onclick = showArenas;
  $("#careerMenu").onclick = showCareer;
  $("#challengeMenu").onclick = showChallenges;
  $("#dailyMenu").onclick = claimDaily;
  for (const [id, key] of [
    ["worldMenu", "worldCup"],
    ["cupMenu", "arenaCup"],
    ["practiceMenu", "training"],
    ["challengeMenu", "challenges"],
  ])
    if (managedConfig?.features[key] === false) $("#" + id)?.remove();
}
function showModes() {
  state = "menu";
  if (!["quick", "versus", "training"].includes(mode)) mode = "quick";
  const modes = [
    [
      "quick",
      "ball",
      "Quick Match",
      "Pilih pemainmu, tentukan lawan CPU, lalu kuasai lapangan.",
    ],
    [
      "versus",
      "user",
      "Local Versus",
      "Tantang teman. Dua pemain di satu keyboard.",
    ],
    [
      "training",
      "target",
      "Latihan",
      "Latih timing, lob, dan skill tanpa batas waktu.",
    ],
  ].filter((x) => x[0] === "quick" || managedConfig?.features[x[0]] !== false);
  renderPage(
    "modes",
    heading(
      "",
      "Main dengan caramu.",
      "Duel singkat atau pertandingan panjang. Kamu yang menentukan.",
    ) +
      `<div class="cards mode-cards">${modes.map(([id, ic, title, desc], i) => `<button class="mode-card ${mode === id ? "selected" : ""}" data-mode="${id}"><span class="mode-index">0${i + 1}</span><span class="mode-symbol">${icon(ic)}</span><strong>${title}</strong><p>${desc}</p><span class="selected-mark">✓</span></button>`).join("")}</div><div class="config-row"><label>Level CPU<select id="difficultyUI" ${mode !== "quick" ? "disabled" : ""}><option value="easy">Santai</option><option value="normal">Normal</option><option value="hard">Pro</option><option value="elite">Paling Jago</option></select></label><label>Durasi<select id="durationUI" ${mode === "training" ? "disabled" : ""}>${[30, 60, 90, 120, 180].map((n) => `<option value="${n}">${n} detik</option>`).join("")}</select></label><button class="primary" id="choosePlayers">Pilih pemain ${icon("arrow")}</button></div><p class="setup-note">${mode === "quick" ? "Lawan bisa dipilih sendiri atau diacak. Normal untuk duel seimbang; Paling Jago untuk intersep, pertahanan dan reaksi paling tajam." : mode === "versus" ? "Pemain 1: A/D/W + Spasi. Pemain 2: tombol arah + Enter." : "Mode latihan tidak memakai batas waktu. Lawan berupa dummy."}</p>`,
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
function showPlayers() {
  selectSide = 0;
  rosterPage = Math.floor(selectedFace / 6);
  showRoster("match");
}
function showRoster(purpose = "match") {
  state = "menu";
  rosterPurpose = purpose;
  if (
    quickRival !== null &&
    (!ROSTER[quickRival] || ROSTER[quickRival].enabled === false)
  ) {
    quickRival = null;
    saved.quickRival = null;
  }
  const opponent = selectSide === 1 && purpose === "match",
    selected = opponent
      ? mode === "quick"
        ? quickRival
        : rivalChoice
      : selectedFace,
    random = opponent && mode === "quick" && quickRival === null,
    preview = selected ?? enabledPreviewRival(),
    r = ROSTER[preview] || ROSTER[0],
    sk = skillFor({side: opponent ? 1 : 0, character: preview}),
    items = ROSTER.map((r, i) => ({ r, i })).slice(
      rosterPage * 6,
      rosterPage * 6 + 6,
    ),
    pages = Math.ceil(ROSTER.length / 6);
  renderPage(
    "roster",
    heading(
      "",
      purpose === "locker"
        ? "Pemain pilihanmu."
        : opponent
          ? "Pilih lawanmu."
          : "Siapa jagoanmu?",
      purpose === "locker"
        ? "Pilih karakter dan skill yang cocok dengan gayamu."
        : opponent
          ? "Karakter pilihanmu akan benar-benar dipakai oleh lawan."
          : "Berikutnya: " +
            (mode === "quick"
              ? "pilih rival CPU."
              : mode === "versus"
                ? "pilih pemain kedua."
                : "masuk ke lapangan latihan."),
      `<span class="pill">${purpose === "locker" ? "KOLEKSI" : opponent ? "02 / LAWAN" : "01 / PEMAIN"}</span>`,
    ) +
      `<div class="roster-preview"><div class="selected-portrait">${random ? '<span class="random-portrait">?</span>' : portrait("face" + preview, "", 130, 150)}</div><div class="selected-info"><small>${random ? "RIVAL ACAK" : opponent ? (mode === "quick" ? "LAWAN CPU" : "PEMAIN 2") : "PEMAINMU"}</small><h2>${random ? "Kejutan di lapangan" : esc(faceName(preview))}</h2><span><img src="${esc(sk.icon)}" alt="">${random ? "Lawan diacak setiap pertandingan" : esc(sk.name)}</span><p class="skill-explainer">${random ? "" : esc(skillDescription(sk.id))}</p><small class="player-nation">${random ? "" : flagMarkup(playerNation(preview).id) + " " + esc(playerNation(preview).name)}</small></div><div class="rating-bars">${[
        ["PACE", r.pace],
        ["SHOT", r.shot],
        ["JUMP", r.jump],
      ]
        .map(
          ([k, v]) =>
            `<label>${k}<i><b style="width:${Math.min(100, v * 75)}%"></b></i></label>`,
        )
        .join(
          "",
        )}</div>${opponent && mode === "quick" ? `<button class="ghost random-rival ${random ? "active" : ""}" id="randomOpponent">${icon("target")} Lawan acak${random ? " ✓" : ""}</button>` : ""}</div><div class="roster-grid">${items.map(({ r, i }) => `<button class="roster-card ${selected === i ? "selected" : ""}" data-select-player="${i}" ${r.enabled === false ? "disabled" : ""}><span class="roster-number">${String(i + 1).padStart(2, "0")}</span>${portrait("face" + i, "", 150, 176)}<strong>${esc(faceName(i))}</strong><span class="roster-nation">${flagMarkup(playerNation(i).id)} ${esc(playerNation(i).name)}</span><small><img class="roster-skill" src="${esc(skillFor({side: opponent ? 1 : 0, character: i}).icon)}" alt="">${esc(skillFor({side: opponent ? 1 : 0, character: i}).name)}</small><span class="selected-mark">✓</span></button>`).join("")}</div><div class="roster-bottom"><div class="pager"><button id="prevRoster" aria-label="Halaman sebelumnya" ${rosterPage === 0 ? "disabled" : ""}>←</button><span>${rosterPage + 1} / ${pages}</span><button id="nextRoster" aria-label="Halaman berikutnya" ${rosterPage >= pages - 1 ? "disabled" : ""}>→</button></div><button class="primary" id="rosterConfirm">${purpose === "locker" ? "Pakai pemain" : !opponent && ["quick", "versus"].includes(mode) ? "Pilih " + (mode === "quick" ? "lawan" : "pemain 2") : "Mulai pertandingan"} ${icon("arrow")}</button></div>`,
    () => {
      if (opponent) {
        selectSide = 0;
        rosterPage = Math.floor(selectedFace / 6);
        showRoster("match");
      } else purpose === "locker" ? showHome() : showModes();
    },
  );
  $$("[data-select-player]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = Number(b.dataset.selectPlayer);
        if (ROSTER[i]?.enabled === false) return;
        if (!opponent) {
          selectedFace = i;
          saved.face = i;
          save();
          applyFaces();
        } else {
          rivalChoice = i;
          if (mode === "quick") {
            quickRival = i;
            saved.quickRival = i;
            save();
          }
        }
        showRoster(purpose);
        beep(520, 0.045, "sine", 0.08);
      }),
  );
  $("#prevRoster").onclick = () => {
    rosterPage--;
    showRoster(purpose);
  };
  $("#nextRoster").onclick = () => {
    rosterPage++;
    showRoster(purpose);
  };
  if ($("#randomOpponent"))
    $("#randomOpponent").onclick = () => {
      quickRival = null;
      saved.quickRival = null;
      save();
      showRoster(purpose);
    };
  $("#rosterConfirm").onclick = () => {
    if (purpose === "locker") {
      showHome();
      return;
    }
    if (!opponent && ["quick", "versus"].includes(mode)) {
      selectSide = 1;
      const target =
        mode === "quick" ? (quickRival ?? rivalChoice) : rivalChoice;
      rosterPage = Math.floor(target / 6);
      showRoster("match");
      return;
    }
    startMatch();
  };
}
function enabledPreviewRival() {
  return ROSTER.findIndex(
    (r, i) => r.enabled !== false && i !== selectedFace,
  ) >= 0
    ? ROSTER.findIndex((r, i) => r.enabled !== false && i !== selectedFace)
    : selectedFace;
}
// All presentation layers are pointer-transparent; controls remain usable.
const intro = document.createElement("div");
intro.id = "versusIntro";
intro.className = "versus-intro hidden";
$("#app").append(intro);
const goalLayer = document.createElement("div");
goalLayer.id = "goalMoment";
goalLayer.className = "goal-moment hidden";
goalLayer.setAttribute("aria-live", "polite");
$("#app").append(goalLayer);
let introRemaining = 0,
  goalRemaining = 0;
function clearPresentation() {
  introRemaining = goalRemaining = 0;
  intro.classList.add("hidden");
  goalLayer.classList.add("hidden");
  $("#app").classList.remove("celebrating");
}
function showMatchIntro() {
  clearPresentation();
  introRemaining = 2.1;
  const right = mode === "training" ? "TRAINING DUMMY" : faceName(rivalIndex);
  intro.innerHTML = `<div class="intro-kicker">${mode === "world" ? "WORLD CUP" : mode === "cup" ? "ARCADE CUP" : mode === "training" ? "FREE PRACTICE" : mode === "versus" ? "LOCAL VERSUS" : "QUICK MATCH"}</div><div class="intro-duel"><div>${portrait("face" + selectedFace, "", 180, 210)}<strong>${esc(ownName())}</strong><small>PEMAIN 1</small></div><b>VS</b><div>${portrait("rival", "", 180, 210)}<strong>${esc(right)}</strong><small>${mode === "versus" ? "PEMAIN 2" : mode === "training" ? "LATIHAN" : $("#difficulty").selectedOptions[0].textContent.toUpperCase() + " CPU"}</small></div></div><p>SIAPKAN PERMAINAN TERBAIKMU.</p>`;
  if (mode === 'world' && activeTeams) {
    const portraits = intro.querySelectorAll('canvas[data-character]');
    portraits[0].dataset.teamNation = activeTeams.left.id;
    portraits[1].dataset.teamNation = activeTeams.right.id;
    portraits[0].parentElement.querySelector('small').innerHTML = flagMarkup(activeTeams.left.id) + ' ' + esc(activeTeams.left.name) + ' · PEMAIN 1';
    portraits[1].parentElement.querySelector('small').innerHTML = flagMarkup(activeTeams.right.id) + ' ' + esc(activeTeams.right.name) + ' · ' + $('#difficulty').selectedOptions[0].textContent.toUpperCase() + ' CPU';
  }
  intro.classList.remove("hidden");
  renderCharacters();
}
function celebrateGoal(side) {
  intro.classList.add("hidden");
  $("#announce").classList.add("hidden");
  goalRemaining = 2.6;
  goalTimer = 2.8;
  const fx = saved.effects !== false && !reducedMotion.matches;
  if (!fx) {
    particles = [];
    shake = 0;
    goalFlash = 0;
  }
  goalLayer.className =
    "goal-moment " +
    (side === 0 ? "home-goal" : "away-goal") +
    (fx ? " animated-goal" : "");
  goalLayer.innerHTML = `<div class="goal-flash"></div><div class="goal-ring"></div><div class="goal-message"><span class="goal-kicker">${side === 0 ? "THAT'S YOUR MOMENT" : "RIVAL MENEMUKAN CELAH"}</span><strong>GOAL<span>!</span></strong><div class="goal-score">${score[0]}<i>:</i>${score[1]}</div><span class="goal-scorer">${esc(side === 0 ? ownName() : faceName(rivalIndex))}</span></div>${fx ? '<div class="confetti">' + Array.from({ length: matchMedia("(pointer:coarse)").matches ? 26 : 42 }, (_, i) => `<i style="--x:${(i * 29) % 100}%;--delay:${(i % 7) * 0.045}s;--turn:${i * 31}deg;--drift:${(i % 2 ? 1 : -1) * (20 + (i % 80))}px;--tone:${i % 3 === 0 ? "#ffe0a3" : i % 3 === 1 ? "#58ebda" : "#fff"}"></i>`).join("") + "</div>" : ""}`;
  $("#app").classList.add("celebrating");
}
function presentationTick(dt) {
  if (!["playing", "countdown", "goal"].includes(state)) return;
  if (introRemaining > 0) {
    introRemaining -= dt;
    if (introRemaining <= 0) intro.classList.add("hidden");
  }
  if (goalRemaining > 0) {
    goalRemaining -= dt;
    if (goalRemaining <= 0) {
      goalLayer.classList.add("hidden");
      $("#app").classList.remove("celebrating");
    }
  }
}
function updatePresentationHUD() {
  if (mode === "quick")
    $("#rightName").textContent = faceName(rivalIndex).slice(0, 14);
}
const nightFieldArt = new Image();
nightFieldArt.src = "assets/night-arena.jpg";
nightFieldArt.onload = () => (stadiumKey = "");
// Retain established collision geometry; only change the arena's art direction.
function paintStadium(c) {
  const ar = ARENAS.find((a) => a.id === saved.arena) || ARENAS[0];
  c.fillStyle = "#0b2445";
  c.fillRect(0, 0, 1120, 560);
  const custom = window.arenaBackgrounds[ar.id];
  if (custom) c.drawImage(custom, 0, 0, 1120, 410);
  else if (nightFieldArt.complete && nightFieldArt.naturalWidth)
    c.drawImage(nightFieldArt, 0, 0, 1120, 530);
  if (ar.weather === "rain") {
    c.fillStyle = "#0a163c30";
    c.fillRect(0, 0, 1120, 397);
  } else if (saved.arena === "sunset" || saved.arena === "desert") {
    c.fillStyle = "#bb782f20";
    c.fillRect(0, 0, 1120, 397);
  }
  c.save();
  c.globalCompositeOperation = "soft-light";
  c.globalAlpha = 0.22;
  c.fillStyle = ar.sky[0];
  c.fillRect(0, 0, 1120, 397);
  c.restore();
  const g = c.createLinearGradient(0, 397, 0, 560);
  g.addColorStop(0, ar.pitch || "#168258");
  g.addColorStop(1, "#0b4c3e");
  c.fillStyle = g;
  c.fillRect(0, 397, 1120, 163);
  for (let i = 0; i < 16; i++) {
    c.fillStyle = i % 2 ? "#ffffff06" : "#002e291d";
    c.fillRect(i * 70, 397, 70, 163);
  }
  c.strokeStyle = "#b4f9df60";
  c.lineWidth = 1.8;
  c.strokeRect(24, 413, 1072, 124);
  c.beginPath();
  c.moveTo(560, 413);
  c.lineTo(560, 537);
  c.ellipse(560, 475, 60, 38, 0, 0, 7);
  c.stroke();
  c.strokeRect(24, 431, 175, 80);
  c.strokeRect(921, 431, 175, 80);
  c.strokeStyle = "#d1ffed85";
  c.beginPath();
  c.moveTo(0, GROUND + 3);
  c.lineTo(1120, GROUND + 3);
  c.stroke();
  c.fillStyle = "#071e30";
  c.fillRect(0, 384, 1120, 13);
  c.fillStyle = "#72d9d4";
  c.font = "700 7px Arial";
  c.textAlign = "center";
  for (let i = 0; i < 8; i++)
    c.fillText(
      (managedConfig?.branding.title || "HEAD ARENA").toUpperCase(),
      70 + i * 140,
      393,
    );
}
