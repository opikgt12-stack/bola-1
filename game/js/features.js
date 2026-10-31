"use strict";
saved.owned = [
  ...new Set([
    ...(saved.owned || []),
    "volt",
    "none",
    ...ARENAS.map((a) => a.id),
    "classicball",
  ]),
];
saved.ball ??= "classicball";
saved.worldCups ??= 0;
saved.sound ??= false;
saved.nation ??= "ID";
saved.effects ??= true;
saved.haptics ??= true;
saved.customNames ??= {};
saved.world ??= null;
selectedFace = Math.max(
  0,
  Math.min(ROSTER.length - 1, Number(saved.face) || 0),
);
saved.face = selectedFace;
muted = !saved.sound;
let world = saved.world,
  tournamentKind = "world",
  rosterPage = 0,
  rosterPurpose = "match",
  selectSide = 0,
  rivalChoice = 1,
  activeTeams = null,
  notifications = 0,
  matchId = 0;
const existingArena = new Set(
  catalog.filter((x) => x.type === "arena").map((x) => x.id),
);
for (const a of ARENAS) {
  if (!existingArena.has(a.id))
    catalog.push({
      id: a.id,
      name: a.name,
      type: "arena",
      price: 0,
      color: a.color,
      info: "ARENA / " + a.weather.toUpperCase(),
    });
}
for (const a of ARENAS) {
  const item = catalog.find((x) => x.id === a.id);
  if (item) {
    item.name = a.name;
    item.color = a.color;
    item.info = a.weather.toUpperCase() + " / STADIUM";
  }
}
catalog.push(
  {
    id: "classicball",
    name: "Classic",
    type: "ball",
    price: 0,
    color: "#eef6ff",
    info: "Original match ball",
  },
  {
    id: "goldball",
    name: "Golden touch",
    type: "ball",
    price: 300,
    color: "#ffdc7b",
    info: "Gold match ball",
  },
  {
    id: "iceball",
    name: "Glacier",
    type: "ball",
    price: 250,
    color: "#b8f1ff",
    info: "Ice blue match ball",
  },
  {
    id: "neonball",
    name: "Neon strike",
    type: "ball",
    price: 350,
    color: "#c3ff53",
    info: "Electric match ball",
  },
);
function faceName(i) {
  return saved.customNames[i] || ROSTER[i]?.name || "PLAYER";
}
function ownName() {
  return faceName(selectedFace);
}
function nation(id) {
  return NATIONS.find((n) => n.id === id) || NATIONS[0];
}
function updateStats() {
  $$("[data-wallet]").forEach(
    (e) => (e.textContent = saved.coins.toLocaleString("id-ID")),
  );
}
function applyFaces() {
  selectedFace = Math.max(
    0,
    Math.min(ROSTER.length - 1, Number(saved.face) || 0),
  );
  headImage = faceImages[selectedFace] || null;
  rivalImage = faceImages[rivalIndex] || null;
  if (saved.photo) {
    const i = new Image();
    i.onload = () => {
      headImage = i;
      renderCharacters();
    };
    i.src = saved.photo;
  } else renderCharacters();
}
function renderCharacters() {
  $$("canvas[data-character]").forEach(el=>{
    const c=el.getContext('2d'),which=el.dataset.character;
    const index=which==='rival'?rivalIndex:which.startsWith('face')?Number(which.slice(4)):selectedFace;
    const photo=index===selectedFace&&which!=='rival'?headImage:faceImages[index]||null;
    const p={x:0,y:0,side:which==='rival'?1:0,character:index,preview:true,
      neutralBoot:view==='home'||which==='rival'||(selectSide===1&&view==='roster'),
      nation:portraitNation(el,index,which),onGround:true,vx:0,vy:0,
      face:which==='rival'||el.closest('.cast-two')?-1:1,kick:0};
    c.clearRect(0,0,el.width,el.height);
    if(window.fitAvatarCanvas473)fitAvatarCanvas473(el,p,photo,{padding:14});
    else{c.save();c.translate(el.width/2,el.height-24);c.scale(el.width/100,el.width/100);drawPlayer(c,p,photo,true);c.restore();}
  });
}

function showHome() {
  state = "menu";
  keys = {};
  activeTeams = null;
  time = Number($("#duration").value);
  score = [0, 0];
  resetPositions();
  renderPage(
    "home",
    `<div class="home-grid"><div class="home-copy"><p class="eyebrow">WORLD TOUR / SEASON 03</p><h1 class="wordmark">HEAD<span>ARENA.</span></h1><div class="home-badges"><span>18 PLAYERS</span><span>6 ARENAS</span><span>32 NATIONS</span></div><div class="menu-buttons"><button class="primary" id="playNow">MAIN <span>→</span></button><button id="worldMenu">🏆 PIALA DUNIA <span>↗</span></button><button id="cupMenu">⚔ ARENA CUP <span>↗</span></button><button id="shopMenu">◉ SHOP <span>↗</span></button><button id="playerMenu">☺ PEMAIN <span>↗</span></button><button id="arenaMenu">▣ ARENA <span>↗</span></button><button id="careerMenu">↗ KARIER <span>${saved.wins} W</span></button></div></div><div class="hero"><div class="hero-top">WORLD TOUR / 03</div><div class="hero-player a">${portrait("player")}<div class="hero-tag">${esc(ownName())}</div></div><span class="versus-stamp">VS</span><div class="hero-player b">${portrait("rival")}<div class="hero-tag">${esc(faceName(rivalIndex))}</div></div></div></div>`,
  );
  $("#playNow").onclick = showModes;
  $("#worldMenu").onclick = () => {
    tournamentKind = "world";
    showWorldHub();
  };
  $("#cupMenu").onclick = showCup;
  $("#shopMenu").onclick = showShop;
  $("#playerMenu").onclick = () => showRoster("locker");
  $("#arenaMenu").onclick = showArenas;
  $("#careerMenu").onclick = showCareer;
  addSettingsButton();
}
function addSettingsButton() {
  const e = document.createElement("button");
  e.className = "icon";
  e.id = "settingsMenu";
  e.textContent = "⚙";
  e.setAttribute("aria-label", "Pengaturan");
  e.onclick = () => showSettings("home");
  $("#screen .header-actions").append(e);
}
function showPlayers() {
  rosterPage = 0;
  selectSide = 0;
  showRoster("match");
}
function showRoster(purpose = "match") {
  state = "menu";
  rosterPurpose = purpose;
  const selected = selectSide === 0 ? selectedFace : rivalChoice;
  const items = ROSTER.map((r, i) => ({ r, i })).slice(
    rosterPage * 6,
    rosterPage * 6 + 6,
  );
  renderPage(
    "roster",
    heading(
      purpose === "match"
        ? "SELECT / " + (selectSide === 0 ? "PLAYER 1" : "PLAYER 2")
        : "PLAYER ROSTER",
      "Pilih pemain.",
      "",
      `<span class="pill">${selected + 1} / ${ROSTER.length}</span>`,
    ) +
      `<div class="roster-grid">${items.map(({ r, i }) => `<button class="roster-card ${selected === i ? "selected" : ""}" data-select-player="${i}"><span class="roster-number">${String(i + 1).padStart(2, "0")}</span>${portrait("face" + i, "", 150, 176)}<strong>${esc(faceName(i))}</strong><small><img class="roster-skill" src="${skillDef(r.skill).icon}" alt=""> ${esc(skillDef(r.skill).name)}</small><span class="selected-mark">✓</span></button>`).join("")}</div><div class="roster-bottom"><div class="pager"><button id="prevRoster" aria-label="Halaman sebelumnya" ${rosterPage === 0 ? "disabled" : ""}>←</button><span>${rosterPage + 1} / ${Math.ceil(ROSTER.length / 6)}</span><button id="nextRoster" aria-label="Halaman berikutnya" ${rosterPage >= Math.ceil(ROSTER.length / 6) - 1 ? "disabled" : ""}>→</button></div><div class="player-stats"><span>SPD <b>${Math.round(ROSTER[selected].pace * 85)}</b></span><span>SHOT <b>${Math.round(ROSTER[selected].shot * 85)}</b></span><span>JUMP <b>${Math.round(ROSTER[selected].jump * 85)}</b></span></div><button class="primary" id="rosterConfirm">${purpose === "locker" ? "CUSTOMIZE →" : mode === "versus" && selectSide === 0 ? "PILIH PLAYER 2 →" : "KICK OFF →"}</button></div>`,
    purpose === "match" ? showModes : showHome,
  );
  $$("[data-select-player]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = Number(b.dataset.selectPlayer);
        if (selectSide === 0) {
          selectedFace = i;
          saved.face = i;
          saved.photo = null;
          save();
          applyFaces();
        } else rivalChoice = i;
        showRoster(purpose);
        beep(500, 0.045, "sine", 0.08);
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
  $("#rosterConfirm").onclick = () => {
    if (purpose === "locker") {
      showHome();
      return;
    }
    if (mode === "versus" && selectSide === 0) {
      selectSide = 1;
      rosterPage = Math.floor(rivalChoice / 6);
      showRoster("match");
      return;
    }
    startMatch();
  };
}
function showLocker() {
  state = "menu";
  renderPage(
    "locker",
    heading("PLAYER / CUSTOMIZE", esc(ownName())) +
      `<div class="locker-grid"><div class="locker-portrait">${portrait("player", "", 220, 260)}<span class="pill">${esc(ROSTER[selectedFace].tag)}</span></div><div class="locker-info"><label for="nameInput">Nama pemain</label><input id="nameInput" type="text" maxlength="15" value="${esc(ownName())}"><div class="upload-actions" style="margin:20px 0"><label class="file-label">＋ Foto kepala<input id="photoInput" type="file" accept="image/*"></label><button id="resetPhoto">Reset foto</button><button id="changePlayer">Ganti pemain</button></div><div class="subtle">KIT</div><div class="kit-row">${catalog
        .filter((x) => x.type === "kit" && saved.owned.includes(x.id))
        .map(
          (x) =>
            `<button data-kit="${x.id}" aria-label="${x.name}" style="background:${x.color}">${saved.kit === x.id ? "✓" : "7"}</button>`,
        )
        .join(
          "",
        )}</div><button class="primary" id="savePlayer" style="margin-top:20px">SIMPAN ✓</button></div></div>`,
  );
  $("#savePlayer").onclick = () => {
    saved.customNames[selectedFace] =
      $("#nameInput").value.trim() || ROSTER[selectedFace].name;
    save();
    showHome();
    toast("Pemain disimpan", "✓");
  };
  $("#changePlayer").onclick = () => {
    rosterPage = Math.floor(selectedFace / 6);
    selectSide = 0;
    showRoster("locker");
  };
  $("#resetPhoto").onclick = () => {
    saved.photo = null;
    applyFaces();
    save();
    showLocker();
  };
  $$("[data-kit]").forEach(
    (b) =>
      (b.onclick = () => {
        saved.kit = b.dataset.kit;
        save();
        showLocker();
      }),
  );
  $("#photoInput").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) {
      toast("Maksimal 12 MB", "!");
      return;
    }
    try {
      const img = await decodePhoto(f),
        c = document.createElement("canvas");
      c.width = c.height = 320;
      const sz = Math.min(img.width, img.height);
      c.getContext("2d").drawImage(
        img,
        (img.width - sz) / 2,
        (img.height - sz) / 2,
        sz,
        sz,
        0,
        0,
        320,
        320,
      );
      saved.photo = c.toDataURL("image/webp", .82);
      img.close?.();
      applyFaces();
      save();
      showLocker();
      toast("Foto terpasang", "✓");
    } catch (e) {
      toast("Foto tidak terbaca", "!");
    }
  };
}
function showArenas() {
  state = "menu";
  renderPage(
    "arenas",
    heading("MATCH / VENUE", "Pilih arena.") +
      `<div class="arena-grid">${ARENAS.map((a, i) => `<button class="arena-card ${saved.arena === a.id ? "selected" : ""}" data-arena="${a.id}"><div class="arena-art" style="--sky1:${a.sky[0]};--sky2:${a.sky[1]};--grass:${a.pitch}"><div class="mini-flood left"></div><div class="mini-flood right"></div><div class="mini-pitch"><i></i></div><span>${String(i + 1).padStart(2, "0")}</span></div><div class="arena-caption"><strong>${esc(a.name)}</strong><small>${a.weather.toUpperCase()}</small><span class="selected-mark">✓</span></div></button>`).join("")}</div>`,
  );
  $$("[data-arena]").forEach(
    (b) =>
      (b.onclick = () => {
        saved.arena = b.dataset.arena;
        save();
        showArenas();
        toast(ARENAS.find((a) => a.id === saved.arena).name, "▣");
      }),
  );
}
function startBaseMatch() {
  resetPositions();
  score = [0, 0];
  sudden = false;
  combo = 0;
  time = Number($("#duration").value);
  particles = [];
  matchId++;
  if (mode === "world") {
    const opp = currentWorldOpponent();
    activeTeams = { left: nation(world.team), right: nation(opp) };
    rivalIndex = activeTeams.right.avatar;
    saved.arena = settings().worldRandomArena
      ? ARENAS[Math.floor(Math.random() * ARENAS.length)].id
      : saved.arena;
  } else {
    activeTeams = null;
    rivalIndex =
      mode === "versus"
        ? rivalChoice
        : mode === "quick"
          ? quickRival !== null &&
            ROSTER[quickRival] &&
            ROSTER[quickRival].enabled !== false
            ? quickRival
            : enabledRival()
          : 2 + Math.floor(Math.random() * 16);
    if (mode === "cup") {
      rivalIndex = 2 + ((cup.round * 5 + 3) % 16);
      saved.arena = ARENAS[(cup.round * 2) % ARENAS.length].id;
    }
  }
  applyFaces();
  resetPositions();
  state = "countdown";
  startTimer = 1.4;
  $("#overlay").classList.add("hidden");
  $("#announce").classList.add("hidden");
  $("#screen").classList.add("hidden");
  $("#app").classList.remove("menu-state");
  setMatchUI(true);
  keys = {};
  updateHud();
  beep(400, 0.1, "triangle", 0.12);
  if (navigator.vibrate && saved.haptics !== false) navigator.vibrate(25);
}
function updateHud() {
  $("#score").textContent = score[0] + " : " + score[1];
  $("#clock").textContent =
    mode === "training"
      ? "TRAINING"
      : sudden
        ? "GOLDEN GOAL"
        : String(Math.floor(Math.ceil(time) / 60)).padStart(2, "0") +
          ":" +
          String(Math.ceil(time) % 60).padStart(2, "0");
  $("#leftName").textContent = activeTeams
    ? activeTeams.left.id
    : ownName().slice(0, 11);
  $("#rightName").textContent = activeTeams
    ? activeTeams.right.id
    : mode === "versus"
      ? faceName(rivalIndex).slice(0, 11)
      : mode === "training"
        ? "DUMMY"
        : mode === "cup" && cup
          ? cup.opponents[Math.min(cup.round, 2)]
          : "CPU";
  $("#powerFill").style.width = p1.power + "%";
  $("#powerLabel").textContent = p1.power >= 100 ? "SKILL READY" : "SKILL";
  if (typeof updatePresentationHUD === "function") updatePresentationHUD();
}
function finishBase() {
  if (state === "finished") return;
  state = "finished";
  keys = {};
  const win = score[0] > score[1],
    drawn = score[0] === score[1];
  matchReward = mode === "versus" ? 60 : drawn ? 100 : win ? 180 : 60;
  saved.coins += matchReward;
  saved.matches++;
  saved.best = Math.max(saved.best, score[0]);
  if (win) saved.wins++;
  let next = startMatch,
    label = "REMATCH →",
    title = win ? "VICTORY!" : drawn ? "FULL TIME." : "DEFEAT.",
    tag = score[0] + " — " + score[1],
    bonus = 0;
  if (mode === "world") {
    const result = advanceWorld([...score]);
    next = showWorldHub;
    label = "LANJUT PIALA DUNIA →";
    if (result === "champion") {
      title = "WORLD CHAMPION!";
      tag = nation(world.team).name.toUpperCase();
      bonus = 1500;
      saved.coins += bonus;
      saved.worldCups++;
      saved.cups++;
      for (let i = 0; i < 6; i++)
        burst(250 + i * 125, 150, 35, ["#c5ff59", "#ffcf65", "#a8d6ff"][i % 3]);
      label = "ANGKAT PIALA →";
      announce("WORLD CHAMPION", nation(world.team).name, "gold");
      beep(880, 0.5, "triangle", 0.3);
    } else if (result === "eliminated") {
      title = "TERELIMINASI.";
      label = "LIHAT HASIL →";
    } else if (world.phase === "knockout" && world.day === 3)
      title = win ? "NEXT ROUND." : drawn ? "FULL TIME." : "NEXT MATCH.";
    saveWorld();
  }
  if (mode === "cup" && cup) {
    cup.results.push([...score]);
    if (win) {
      cup.round++;
      if (cup.round >= 3) {
        cup.champion = true;
        saved.cups++;
        bonus = 500;
        saved.coins += bonus;
        title = "ARENA CHAMPION!";
        label = "ANGKAT PIALA →";
        burst(560, 200, 130, "#f7d477");
      } else {
        title = "NEXT ROUND.";
        label = "LANJUT TURNAMEN →";
      }
    } else {
      cup.eliminated = true;
      title = "TERELIMINASI.";
      label = "LIHAT HASIL →";
    }
    next = showCup;
    saved.cup = cup;
  }
  save();
  splash(
    title,
    tag + " · +" + (matchReward + bonus) + " koin",
    label,
    next,
    mode === "world" ? "WORLD CUP" : mode === "cup" ? "ARENA CUP" : "FULL TIME",
    "Menu utama",
  );
  $("#splash").classList.toggle("champion", title.includes("CHAMPION"));
  toast("+" + (matchReward + bonus) + " koin", win ? "★" : "●");
  beep(win ? 660 : 240, 0.25, "triangle", 0.18);
}
function initCup() {
  cup = {
    round: 0,
    results: [],
    opponents: ["ROVERS", "BLAZE FC", "ROYAL FC"],
    champion: false,
    eliminated: false,
  };
  saved.cup = cup;
  save();
}
function showCup() {
  state = "menu";
  if (!cup) cup = saved.cup || null;
  if (!cup) initCup();
  const done = cup.champion || cup.eliminated;
  const names = ["PEREMPAT FINAL", "SEMI-FINAL", "FINAL"];
  renderPage(
    "cup",
    heading(
      "8 TEAMS / KNOCKOUT",
      "Arena Cup.",
      "",
      `<span class="pill">● 500 BONUS</span>`,
    ) +
      `<div class="cup-road">${[0, 1, 2].map((i) => `<div class="cup-stage ${cup.round === i && !done ? "current" : ""} ${cup.results[i] ? "complete" : ""}"><span class="stage-number">0${i + 1}</span><div class="cup-icon">${icon(i === 2 ? "cup" : "ball")}</div><h3>${names[i]}</h3><div class="fixture"><b>YOU</b> <span>${cup.results[i] ? cup.results[i].join(" : ") : "VS"}</span> ${cup.opponents[i]}</div><span class="subtle">${cup.results[i] ? (cup.results[i][0] > cup.results[i][1] ? "VICTORY" : "DEFEAT") : cup.round === i ? "UP NEXT" : "LOCKED"}</span></div>`).join("")}</div><div class="bottom-action"><span class="subtle">${cup.champion ? "🏆 ARENA CHAMPION" : cup.eliminated ? "ELIMINATED" : names[cup.round]}</span><button class="primary" id="cupStart">${done ? "TURNAMEN BARU →" : "MAIN RONDE " + (cup.round + 1) + " →"}</button></div>`,
  );
  $("#cupStart").onclick = () => {
    if (done) {
      initCup();
      showCup();
      return;
    }
    mode = "cup";
    startMatch();
  };
}
function toast(text, icon = "✓") {
  const stack = $("#notifications");
  const el = document.createElement("div");
  el.className = "notification";
  const a = document.createElement("span");
  a.className = "notification-icon";
  a.textContent = icon;
  const b = document.createElement("span");
  b.textContent = text;
  el.append(a, b);
  stack.append(el);
  while (stack.children.length > 3) stack.firstElementChild.remove();
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 200);
  }, 2700);
}
let announceTimer;
function announce(title, sub = "", kind = "good") {
  const el = $("#announce");
  el.replaceChildren();
  const a = document.createElement("strong"),
    b = document.createElement("span");
  a.textContent = title;
  b.textContent = sub;
  el.append(a, b);
  el.className = "announce " + kind;
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => el.classList.add("hidden"), 1800);
}
// Tactical CPU: delayed decisions, legal movement and the same shooting rules as the player.
function cpuLevel() {
  return ({easy:0,normal:1,hard:2,elite:3})[$('#difficulty').value]??1;
}
function predictBallAt(t) {
  let x = ball.x,
    y = ball.y,
    vx = ball.vx,
    vy = ball.vy;
  const step = 1 / 60,
    g = settings().gravity;
  for (let a = 0; a < t; a += step) {
    const h = Math.min(step, t - a);
    vx *= Math.exp(-settings().ballDrag * h);
    vy += g * h;
    x += vx * h;
    y += vy * h;
    if (y > GROUND - ball.r) {
      y = GROUND - ball.r;
      vy = -Math.abs(vy) * settings().bounce;
      if (Math.abs(vy) < 45) vy = 0;
    }
    if (x < 28 + ball.r) {
      x = 28 + ball.r;
      vx = Math.abs(vx) * 0.82;
    }
    if (x > 1092 - ball.r) {
      x = 1092 - ball.r;
      vx = -Math.abs(vx) * 0.82;
    }
  }
  return { x, y, vx, vy };
}
function ai(dt) {
  const level = cpuLevel(),
    cfg = [
      { pace: 0.78, reaction: 0.32, look: 0.12 },
      { pace: 0.94, reaction: 0.19, look: 0.23 },
      { pace: 1, reaction: 0.12, look: 0.34 },
    ][level];
  const brain = (p2.brain ??= {
    wait: cfg.reaction,
    target: p2.x,
    jump: false,
    jumpLock: 0,
    shotWait: 0.25,
  });
  brain.wait -= dt;
  brain.jumpLock = Math.max(0, brain.jumpLock - dt);
  brain.shotWait = Math.max(0, brain.shotWait - dt);
  if (brain.wait <= 0) {
    brain.wait = cfg.reaction;
    const soon = predictBallAt(cfg.look),
      threat = ball.vx > 90 && ball.x > 470,
      behind = ball.x > p2.x + 25;
    let target;
    if (threat || behind) {
      target = Math.max(ball.x + 40, soon.x + 32);
      if (ball.y < POST - 45 && ball.vx > 160)
        target = Math.max(target, RIGHT - 70);
    } else if (ball.x > 480 || Math.abs(ball.x - p2.x) < 230) {
      target = soon.x + 50;
    } else {
      target = Math.max(610, Math.min(800, ball.x + 235));
    }
    brain.target = Math.max(LEFT + 55, Math.min(RIGHT - 42, target));
    const intercept = predictBallAt(0.22),
      near = Math.abs(intercept.x - p2.x) < 100 + level * 12,
      high = intercept.y < p2.y - 100 && intercept.y > POST - 100;
    brain.jump = near && high && ball.vy > -450 && brain.jumpLock <= 0;
  }
  const gap = brain.target - p2.x,
    dir = Math.abs(gap) < 12 ? 0 : Math.sign(gap) * cfg.pace,
    doJump = brain.jump && p2.onGround && brain.jumpLock <= 0;
  if (doJump) {
    brain.jumpLock = 0.65;
    brain.jump = false;
  }
  movePlayer(p2, dir, doJump, dt);
  const dx = ball.x - p2.x,
    dy = ball.y - (p2.y - 33 * (p2.size || 1));
  if (
    brain.shotWait <= 0 &&
    dx < 30 &&
    dx > -74 * (p2.size || 1) &&
    Math.abs(dy) < 62 * (p2.size || 1)
  ) {
    p2.face = -1;
    p2.aiLob =
      level > 0 &&
      p1.x < p2.x &&
      p2.x - p1.x < 245 &&
      p1.onGround &&
      ball.x > 420;
    shoot(p2, false);
    brain.shotWait = [0.58, 0.32, 0.23][level];
  }
}

function drawBasePlayer(c, p, photo = null, mini = false) {
  const d =
      ROSTER[p.character ?? (p.side === 0 ? selectedFace : rivalIndex)] ||
      ROSTER[2],
    kit =
      p.side === 0
        ? activeTeams?.left.color ||
          catalog.find((x) => x.id === saved.kit)?.color ||
          "#c5ff59"
        : activeTeams?.right.color || "#ff758b",
    bob = p.onGround
      ? Math.sin(simTime * 15) * Math.min(Math.abs(p.vx) / 340, 1) * 2
      : 0;
  const bodySkin = photo && d.autoSkin !== false ? (headSurface(photo,d).skin || d.skin) : d.skin;
  c.save();
  c.translate(p.x, p.y + bob);
  if (!mini) {
    c.fillStyle = "#07152245";
    c.beginPath();
    c.ellipse(0, -2, 29, 6, 0, 0, 7);
    c.fill();
  }
  const swing =
    p.kick > 0
      ? p.face * 24
      : Math.sin(simTime * 15) * Math.min(Math.abs(p.vx) / 340, 1) * 9;
  const jerseyId = p.nation || playerNation(p.character ?? selectedFace).id;
  const pair = kitColors[jerseyId] || [nation(jerseyId).color, '#fff'];
  // A small neck, tapered shoulders and bent forearms keep the silhouette readable.
  c.fillStyle=bodySkin;rounded(c,-6,-53,12,16,4);
  for(const side of [-1,1]){
    c.save();c.translate(side*20,-39);c.rotate(side*(.16 + Math.min(1,Math.abs(p.vx)/320)*Math.sin(simTime*14)*.18));
    c.fillStyle=pair[0];rounded(c,-6,0,12,14,4);
    c.fillStyle=bodySkin;rounded(c,-5,10,10,18,5);
    c.fillStyle='#00000018';rounded(c,side>0?1:-5,12,4,14,2);c.restore();
  }
  drawNationalKit(c,jerseyId);
  const shorts = jerseyId === 'ID' ? '#f5f5ee' : ['BR','FR','AR','GB','US'].includes(jerseyId) ? '#16385e' : '#162b3d';
  c.fillStyle=shorts;c.beginPath();c.moveTo(-17,-22);c.lineTo(17,-22);c.lineTo(20,-4);
  c.quadraticCurveTo(12,-1,4,-3);c.lineTo(0,-13);c.lineTo(-4,-3);c.quadraticCurveTo(-12,-1,-20,-4);c.closePath();c.fill();
  c.fillStyle='#ffffff25';c.fillRect(-16,-19,3,11);c.fillRect(13,-19,3,11);
  c.strokeStyle='#071b2c77';c.lineWidth=1;c.beginPath();c.moveTo(-16,-21);c.lineTo(16,-21);c.moveTo(0,-19);c.lineTo(0,-12);c.stroke();
  drawLegs(c, p, bodySkin);
  drawGear(c, p);
  c.save();
  c.translate(0, -77);
  if (photo) {
    drawIntegratedHead(c,p,d,photo);
  } else {
    c.fillStyle = "#0e1b2f";
    c.beginPath();
    c.ellipse(0, 1, 32, 33, 0, 0, 7);
    c.fill();
    c.fillStyle = bodySkin;
    c.beginPath();
    c.ellipse(0, 0, 30, 31, 0, 0, 7);
    c.fill();
    c.beginPath();
    c.ellipse(-28, 3, 6, 9, 0, 0, 7);
    c.ellipse(28, 3, 6, 9, 0, 0, 7);
    c.fill();
    c.fillStyle = "#ffffff15";
    c.beginPath();
    c.ellipse(-11, -4, 12, 20, -0.3, 0, 7);
    c.fill();
    c.fillStyle = d.hair;
    if (d.style === 0) {
      c.beginPath();
      c.moveTo(-29, -4);
      c.lineTo(-28, -24);
      c.lineTo(-12, -34);
      c.lineTo(7, -38);
      c.lineTo(29, -22);
      c.lineTo(29, -7);
      c.lineTo(18, -16);
      c.lineTo(10, -24);
      c.lineTo(-18, -19);
      c.lineTo(-23, -2);
      c.fill();
    }
    if (d.style === 1) {
      c.beginPath();
      c.moveTo(-28, -13);
      for (let i = 0; i < 7; i++) c.lineTo(-28 + i * 9, -30 - (i % 2) * 10);
      c.lineTo(30, -8);
      c.lineTo(16, -19);
      c.lineTo(-22, -16);
      c.fill();
    }
    if (d.style === 2) {
      c.beginPath();
      c.arc(0, -10, 29, Math.PI, Math.PI * 2);
      c.lineTo(25, -6);
      c.quadraticCurveTo(6, -5, -15, -22);
      c.lineTo(-26, -1);
      c.fill();
    }
    if (d.style === 3) {
      c.beginPath();
      c.moveTo(-26, -10);
      c.lineTo(-23, -27);
      c.lineTo(22, -27);
      c.lineTo(28, -9);
      c.lineTo(23, -19);
      c.lineTo(-20, -19);
      c.fill();
      c.fillStyle = "#f4dd8d";
      c.fillRect(-29, -18, 58, 5);
    }
    if (d.style === 4) {
      c.beginPath();
      c.arc(0, -7, 31, Math.PI, Math.PI * 2);
      c.lineTo(31, 16);
      c.lineTo(23, 22);
      c.lineTo(21, -14);
      c.quadraticCurveTo(0, -4, -17, -22);
      c.lineTo(-23, 22);
      c.lineTo(-32, 14);
      c.fill();
      c.beginPath();
      c.arc(27, -22, 10, 0, 7);
      c.fill();
    }
    if (d.style === 5) {
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        c.arc(-23 + (i % 5) * 12, -20 - Math.floor(i / 5) * 10, 9, 0, 7);
        c.fill();
      }
    }
    c.fillStyle = "#fff";
    c.beginPath();
    c.ellipse(-11, -1, 7.5, 8, 0, 0, 7);
    c.ellipse(12, -1, 7.5, 8, 0, 0, 7);
    c.fill();
    c.fillStyle = "#1b2b40";
    c.beginPath();
    c.arc(-10 + p.face * 1.7, -1, 3.7, 0, 7);
    c.arc(12 + p.face * 1.7, -1, 3.7, 0, 7);
    c.fill();
    c.strokeStyle = d.hair;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(-19, -13);
    c.lineTo(-5, -10);
    c.moveTo(5, -10);
    c.lineTo(19, -13);
    c.stroke();
    c.strokeStyle = "#754d3b";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(1, 2);
    c.lineTo(-1, 9);
    c.lineTo(4, 9);
    c.stroke();
    c.beginPath();
    c.arc(1, 11, 10, 0.2, 2.8);
    c.stroke();
    if ([5, 11, 16].includes(p.character)) {
      c.fillStyle = d.hair;
      c.globalAlpha = 0.6;
      c.beginPath();
      c.arc(0, 12, 24, 0.15, 3);
      c.lineTo(-19, 14);
      c.quadraticCurveTo(0, 27, 20, 12);
      c.fill();
      c.globalAlpha = 1;
    }
  }
  c.restore();
  c.restore();
}
function drawAtmosphere() {
  const ar = ARENAS.find((a) => a.id === saved.arena) || ARENAS[0];
  if (
    saved.effects !== false &&
    (ar.weather === "rain" || ar.weather === "snow")
  ) {
    ctx.save();
    ctx.strokeStyle = "#b9e6ff50";
    ctx.fillStyle = "#ebf8ff99";
    ctx.lineWidth = 1;
    for (let i = 0; i < 55; i++) {
      const x =
          (i * 137 + weatherTime * (ar.weather === "rain" ? -130 : 15) + 2240) %
          1120,
        y = (i * 71 + weatherTime * (ar.weather === "rain" ? 560 : 55)) % 560;
      if (ar.weather === "rain") {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 7, y + 18);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 1 + (i % 3) * 0.6, 0, 7);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  if (goalFlash > 0 && saved.effects !== false) {
    ctx.fillStyle = `rgba(220,255,180,${goalFlash * 0.12})`;
    ctx.fillRect(0, 0, 1120, 560);
  }
}
function drawRadar() {
  if (worldViewWidth428() >= 1120 || state === "menu") return;
  const w = 130,
    x = (worldViewWidth428() - w) / 2,
    y = 520;
  ctx.fillStyle = "#07192ec9";
  rounded(ctx, x, y, w, 25, 4);
  ctx.strokeStyle = "#a6c7dd66";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y + 4, w - 8, 17);
  for (const [p, color] of [
    [p1, "#c5ff59"],
    [p2, "#ff7c94"],
    [ball, "#fff"],
  ]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 5 + (p.x / 1120) * (w - 10), y + 12, p === ball ? 2 : 3, 0, 7);
    ctx.fill();
  }
}

async function decodePhoto(file) {
  if (window.createImageBitmap) {
    try {
      return await createImageBitmap(file);
    } catch (e) {}
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file),
      i = new Image();
    i.onload = () => {
      URL.revokeObjectURL(url);
      resolve(i);
    };
    i.onerror = () => {
      URL.revokeObjectURL(url);
      reject(Error("Image decode failed"));
    };
    i.src = url;
  });
}
