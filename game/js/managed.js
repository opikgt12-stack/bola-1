"use strict";
let managedConfig = null,
  challenge = null,
  projectiles = [],
  duelCooldown = 0,
  matchMetrics = {
    goals: 0,
    airGoals: 0,
    giantGoals: 0,
    skillUse: 0,
    skillHits: 0,
    bodyHits: 0,
  };
const analog = { active: false, x: 0, jump: false };
window.arenaBackgrounds = {};
const fallbackSettings = {
  gravity: 1180,
  bounce: 0.73,
  ballDrag: 0.16,
  ballRadius: 14,
  playerSpeed: 320,
  jumpSpeed: 650,
  shotSpeed: 670,
  lobSpeed: 850,
  bodyForce: 1,
  skillCharge: 8,
  skillDuration: 5,
  worldRandomArena: true,
  cameraShake: true,
  skillEnabled: true,
  skyOpen: true,
};
const fallbackSkills = [
  "titan",
  "freeze",
  "fire",
  "inflate",
  "storm",
  "shield",
].map((id, i) => ({
  id,
  name: ["Titan", "Freeze", "Fire", "Inflate", "Storm", "Shield"][i],
  icon: "assets/skills/" + id + ".svg",
  color: ["#ffcd70", "#9fe8ff", "#ff8a56", "#ed9aff", "#c5ff59", "#79bdff"][i],
  duration: 5,
  enabled: true,
}));
function settings() {
  return managedConfig?.gameplay || fallbackSettings;
}
function skillDef(id) {
  return (
    (managedConfig?.skills || fallbackSkills).find((s) => s.id === id) ||
    fallbackSkills[0]
  );
}
function skillFor(p) {
  return skillDef(
    p.side === 0 && challenge
      ? challenge.skill
      : ROSTER[p.character]?.skill || "titan",
  );
}
function eventMetric(event) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event }),
  }).catch(() => {});
}
// Keep browser icons in sync with the same branding used by the menu.
function applyBrandingIcons() {
  const logo = managedConfig?.branding?.logo || "";
  const revision = encodeURIComponent(String(window.CONFIG_REVISION || "4.15.2"));
  for (const [id, rel, fallback] of [
    ["siteFavicon", "icon", "assets/icon.svg"],
    ["siteTouchIcon", "apple-touch-icon", "assets/icon-192.png"],
  ]) {
    const source = logo || fallback;
    const href = source + (source.includes("?") ? "&" : "?") + "brand=" + revision;
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = rel;
      document.head.append(link);
    }
    // Do not force SVG MIME type when the uploaded logo is PNG/JPG/WebP/GIF.
    link.removeAttribute("type");
    if (link.getAttribute("href") !== href) link.setAttribute("href", href);
  }
}
async function bootManaged() {
  try {
    const r = await fetch("/api/public", { cache: "no-store" });
    const b = await r.json();
    if (b.setupRequired) {
      location.replace("install.php");
      return false;
    }
    if (!r.ok) throw Error();
    if(b.config?.maintenance?.enabled&&!new URLSearchParams(location.search).has("avatarPreview45")){location.reload();return false;}
    managedConfig = b.config;
    window.GAME_CONFIG = managedConfig;
    window.CONFIG_REVISION = b.revision;
    applyBrandingIcons();
    normalizeMatchdayConfig(managedConfig);
    ROSTER.splice(0, ROSTER.length, ...managedConfig.players);
    ARENAS.splice(
      0,
      ARENAS.length,
      ...managedConfig.arenas.filter((a) => a.enabled),
    );
    FACE_SOURCES.splice(
      0,
      FACE_SOURCES.length,
      ...ROSTER.map((r) => r.image || ""),
    );
    saved.customNames = {};
    saved.photo = null;
    if (!ROSTER[saved.face]?.enabled)
      saved.face = ROSTER.findIndex((p) => p.enabled);
    selectedFace = Number(saved.face) || 0;
    if (!ARENAS.some((a) => a.id === saved.arena)) saved.arena = ARENAS[0].id;
    for (const a of ARENAS) {
      saved.owned.push(a.id);
      if (a.background) {
        const im = new Image();
        im.onload = () => {
          window.arenaBackgrounds[a.id] = im;
          stadiumKey = "";
        };
        im.src = a.background;
      }
    }
    for (const item of catalog) {
      item.info = "";
      const x = managedConfig.shop[item.id];
      if (x) item.price = x.price;
      const a = ARENAS.find((a) => a.id === item.id);
      if (a) {
        item.name = a.name;
        item.color = a.color;
      }
    }
    for (const a of ARENAS)
      if (!catalog.some((x) => x.id === a.id))
        catalog.push({
          id: a.id,
          name: a.name,
          type: "arena",
          color: a.color,
          price: 0,
          info: "",
        });
    document.title = managedConfig.branding.title;
    document.documentElement.style.setProperty(
      "--lime",
      managedConfig.branding.accent,
    );
    document.documentElement.style.setProperty(
      "--blue",
      managedConfig.branding.accent,
    );
    await loadBootImages();
    eventMetric("visits");
    return true;
  } catch (e) {
    $("#screen").innerHTML =
      '<div class="loading-error"><h1>Koneksi tidak tersedia</h1><p>Jalankan server aplikasi, lalu muat ulang halaman.</p><button id="reloadGame">Muat ulang</button></div>';
    $("#reloadGame").onclick = () => location.reload();
    return false;
  }
}
function translateNodes(root) {
  if (!managedConfig || !root) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const key = n.textContent.trim();
    if (Object.hasOwn(managedConfig.texts, key))
      n.textContent = n.textContent.replace(key, managedConfig.texts[key]);
  }
}
function hydrateGame() {
  if (!managedConfig) return;
  $$(".page-heading .page-label,.screen-footer").forEach((e) => e.remove());
  const s = $("#screen"),
    title = managedConfig.branding.title;
  $$(".mini-brand,.screen-footer>span:nth-child(2)").forEach(
    (e) => (e.textContent = title),
  );
  $$(
    ".version,.screen-footer>span:first-child,.screen-footer>span:last-child,.hero-top,.home-copy>.eyebrow,.home-badges",
  ).forEach((e) => e.remove());
  const mark = $(".wordmark");
  if (mark) {
    mark.textContent = title;
    mark.style.fontSize = "clamp(40px,6vw,76px)";
    if (
      managedConfig.branding.subtitle &&
      !s.querySelector(".brand-subtitle")
    ) {
      const sub = document.createElement("p");
      sub.className = "brand-subtitle";
      sub.textContent = managedConfig.branding.subtitle;
      mark.after(sub);
    }
  }
  if (managedConfig.branding.logo && !s.querySelector(".brand-logo")) {
    const im = document.createElement("img");
    im.className = "brand-logo";
    im.src = managedConfig.branding.logo;
    im.alt = title;
    $(".header-left>div")?.prepend(im);
  }
  for (const [id, flag] of [
    ["worldMenu", "worldCup"],
    ["cupMenu", "arenaCup"],
  ])
    if (!managedConfig.features[flag]) $("#" + id)?.remove();
  for (const flag of ["versus", "training"])
    if (!managedConfig.features[flag])
      s.querySelector('[data-mode="' + flag + '"]')?.remove();
  $$("[data-select-player]").forEach((b) => {
    if (!ROSTER[Number(b.dataset.selectPlayer)]?.enabled) {
      b.disabled = true;
      b.classList.add("unavailable");
    }
  });
  $$("[data-buy]").forEach((b) => {
    if (managedConfig.shop[b.dataset.buy]?.enabled === false)
      b.closest(".product").remove();
    const item = catalog.find((x) => x.id === b.dataset.buy);
    if (item?.type === "arena" && !ARENAS.some((a) => a.id === item.id))
      b.closest(".product").remove();
  });
  if (
    view === "home" &&
    managedConfig.features.challenges &&
    !$("#challengeMenu")
  ) {
    const b = document.createElement("button");
    b.id = "challengeMenu";
    b.textContent = managedConfig.texts.CHALLENGES || "TANTANGAN";
    b.onclick = showChallenges;
    $(".menu-buttons").append(b);
  }
  translateNodes(s);
  if (view === "roster" && rosterPurpose === "locker")
    $("#rosterConfirm").textContent = "PILIH →";
}
function faceName(i) {
  return ROSTER[i]?.name || "Player";
}
function showLocker() {
  showRoster("locker");
  $("#rosterConfirm").textContent = "SELESAI →";
  $("#rosterConfirm").onclick = showHome;
}
function sfx(name, volume = 1) {
  if (muted) return;
  let url = managedConfig?.sounds[name];
  if (name === "goal" && (!url || url === "assets/audio/goal.wav"))
    url = "assets/audio/goal-premium.ogg";
  if (!url) return;
  try {
    const a = new Audio(url);
    a.volume = Math.min(1, saved.volume * volume);
    a.play().catch(() => {});
  } catch {}
}
function moveBasePlayer(p, dir, j, dt) {
  const size = p.size || 1,
    frozen = (p.frozen || 0) > 0 || (p.stun || 0) > 0,
    heavy = (p.heavy || 0) > 0;
  p.cool = Math.max(0, (p.cool || 0) - dt);
  p.kick = Math.max(0, (p.kick || 0) - dt);
  if (frozen) dir = 0;
  const speed =
    (settings().playerSpeed *
      (ROSTER[p.character]?.pace || 1) *
      bootFor(p).speed *
      (heavy ? 0.55 : 1)) /
    Math.sqrt(size);
  p.vx += (dir * speed - p.vx) * Math.min(1, dt * (p.onGround ? 14 : 6) * (p.controlAgility417 || p.aiAgility417 || 1));
  if (Math.abs(dir) > 0.08) p.face = Math.sign(dir);
  if (j && p.onGround && !frozen) {
    p.vy =
      -settings().jumpSpeed *
      (ROSTER[p.character]?.jump || 1) *
      bootFor(p).jump;
    p.onGround = false;
    p.support = null;
    beep(240, 0.07, "sine", 0.05);
  }
  p.x += p.vx * dt;
  p.vy += settings().gravity * 1.4 * dt;
  p.y += p.vy * dt;
  if (p.y >= GROUND) {
    p.y = GROUND;
    p.vy = 0;
    p.onGround = true;
  }
  p.x = Math.max(35 * size, Math.min(1120 - 35 * size, p.x));
}
function shoot(p, power = false) {
  if (state !== "playing" || p.cool > 0 || p.frozen > 0) return;
  if (power) {
    if (p.power >= 100) activateSkill(p);
    return;
  }
  p.cool = 0.44;
  p.kick = 0.26;
  sfx("kick", 0.45);
  const size = p.size || 1,
    dx = ball.x - p.x,
    dy = ball.y - (p.y - 33 * size);
  if (Math.abs(dx) > 74 * size || Math.abs(dy) > 64 * size) return;
  const lob =
      p.side === 0
        ? keys.w || keys.x || analog.jump
        : mode === "versus"
          ? keys.ArrowUp
          : p.aiLob,
    low = p.side === 0 && keys.s;
  const shot = settings().shotSpeed * (ROSTER[p.character]?.shot || 1);
  ball.vx = p.face * shot * (lob ? 0.67 : 1) + p.vx * 0.18;
  ball.vy = lob ? -settings().lobSpeed * 0.9 : low ? -85 : -240;
  ball.hot = p.fire > 0 ? 2 : 0;
  ball.lastTouch = p.side;
  matchMetrics.shots = (matchMetrics.shots || 0) + (p.side === 0 ? 1 : 0);
  sfx("kick");
  burst(ball.x, ball.y, 6, "#ffffff");
}
function bodyDuel(dt) {
  duelCooldown = Math.max(0, duelCooldown - dt);
  for (const [rider, base] of [[p1,p2],[p2,p1]]) {
    const top = base.y - 106 * (base.size || 1), reach = 28 * (base.size || 1);
    const aligned = Math.abs(rider.x - base.x) < reach;
    const supported = rider.support === base.side && rider.vy >= 0;
    const landing = rider.vy >= base.vy && (rider.prevY ?? rider.y) <= top + 10 && rider.y >= top - 3;
    if (aligned && (supported || landing) && rider.y < base.y - 65) {
      rider.y = top; rider.vy = 0; rider.onGround = true; rider.support = base.side;
      rider.x += base.x - (base.prevX ?? base.x);
      return;
    }
    rider.support = null;
  }
  const min = 31 * ((p1.size || 1) + (p2.size || 1)), dx = p2.x - p1.x;
  if (Math.abs(dx) < min && Math.abs(p1.y-p2.y) < 76) {
    const sign = dx >= 0 ? 1 : -1, overlap = min - Math.abs(dx);
    p1.x -= sign * overlap / 2; p2.x += sign * overlap / 2;
    p1.x = Math.max(61, Math.min(1059,p1.x)); p2.x = Math.max(61, Math.min(1059,p2.x));
    if (Math.abs(p1.vx-p2.vx)>160 && duelCooldown===0) {
      duelCooldown=.5; sfx('body',.25); matchMetrics.bodyHits++;
    }
  }
}
function collideBoot(p) {
  p.bootCool = Math.max(0,(p.bootCool||0)-1/120);
  if (p.bootCool>0 || p.frozen>0 || p.stun>0) return;
  const size=p.size||1, dx=ball.x-p.x, dy=ball.y-(p.y-8*size);
  if (Math.abs(dx)<38*size+ball.r && Math.abs(dy)<12*size+ball.r) {
    const dir=p.side===0?1:-1;
    ball.x=p.x+dir*(39*size+ball.r);
    ball.vx=dir*Math.max(290, settings().shotSpeed*.62*bootFor(p).shot);
    ball.vy=-165; ball.lastTouch=p.side; p.bootCool=.18; p.kick=.18;
    ball.stuckTime=0; sfx('kick',.25);
  }
}
function collideHead(p) {
  const size = p.size || 1,
    cx = p.x,
    cy = p.y - 77 * size,
    dx = ball.x - cx,
    dy = ball.y - cy,
    dist = Math.hypot(dx, dy),
    r = 32 * size + ball.r;
  if (dist < r) {
    const nx = dist ? dx / dist : 0,
      ny = dist ? dy / dist : -1;
    ball.x = cx + nx * r;
    ball.y = cy + ny * r;
    const v = (ball.vx - p.vx) * nx + (ball.vy - p.vy) * ny;
    if (v < 0) {
      ball.vx -= 1.65 * v * nx;
      ball.vy -= 1.65 * v * ny;
      ball.vx += p.vx * 0.32;
      ball.lastTouch = p.side;
      sfx("bounce", 0.4);
      if (p.fire > 0) {
        ball.hot = 1.5;
        ball.vx += p.face * 140;
      }
    }
  }
  if (
    Math.abs(ball.x - p.x) < 23 * size + ball.r &&
    ball.y > p.y - 36 * size &&
    ball.y < p.y + ball.r
  ) {
    const dir = ball.x >= p.x ? 1 : -1;
    ball.x = p.x + dir * (23 * size + ball.r);
    ball.vx = dir * Math.max(120, Math.abs(ball.vx) * 0.7) + p.vx * 0.6;
    ball.vy -= 55;
  }
}
function postCollision(x) {
  const dx = ball.x - x,
    dy = ball.y - POST,
    d = Math.hypot(dx, dy),
    r = ball.r + 5;
  if (d < r) {
    const nx = d ? dx / d : 0,
      ny = d ? dy / d : -1;
    ball.x = x + nx * r;
    ball.y = POST + ny * r;
    const v = ball.vx * nx + ball.vy * ny;
    if (v < 0) {
      ball.vx -= 1.8 * v * nx;
      ball.vy -= 1.8 * v * ny;
      sfx("post");
    }
  }
}
function activateSkill(p) {
  const s = skillFor(p);
  if (!settings().skillEnabled || !s.enabled) return;
  p.power = 0;
  p.kick = 0.3;
  sfx("skill");
  const duration = Math.min(15, (s.duration * settings().skillDuration) / 5);
  if (p.side === 0) matchMetrics.skillUse++;
  if (s.id === "titan") {
    p.giant = duration;
    p.size = 1.6;
  } else if (s.id === "shield") p.shield = duration;
  else if (s.id === "fire") {
    p.fire = duration;
    const old = p.cool;
    p.cool = 0;
    shoot(p);
    p.cool = Math.max(old, 0.3);
    ball.hot = 2;
  } else {
    projectiles.push({
      x: p.x + p.face * 40,
      y: p.y - 65,
      vx: p.face * (s.id === "storm" ? 740 : 510),
      side: p.side,
      id: s.id,
      life: 2,
      color: s.color,
    });
  }
  burst(p.x, p.y - 55, 22, s.color);
  announce(
    s.name,
    p.side === 0 ? ownName() : faceName(p.character),
    p.side === 0 ? "good" : "bad",
  );
}
function tickSkills(dt) {
  if (!settings().skillEnabled) {
    p1.power = p2.power = 0;
    projectiles = [];
    return;
  }
  for (const p of [p1, p2]) {
    p.power = Math.min(100, p.power + settings().skillCharge * dt);
    for (const key of ["giant", "frozen", "heavy", "shield", "fire"])
      p[key] = Math.max(0, (p[key] || 0) - dt);
    p.size = p.giant > 0 ? 1.6 : p.heavy > 0 ? 1.35 : 1;
  }
  for (const q of projectiles) {
    q.x += q.vx * dt;
    q.life -= dt;
    const target = q.side === 0 ? p2 : p1;
    if (
      Math.abs(q.x - target.x) < 45 * (target.size || 1) &&
      Math.abs(q.y - (target.y - 60)) < 65
    ) {
      if (target.shield <= 0) {
        if (q.id === "freeze") target.frozen = 4;
        if (q.id === "inflate") target.heavy = 5;
        if (q.id === "storm") {
          target.vx = Math.sign(q.vx) * 650;
          target.vy = -220;
          target.frozen = 0.35;
        }
        if (q.side === 0) matchMetrics.skillHits++;
      }
      q.life = 0;
      burst(q.x, q.y, 20, q.color);
      sfx("body");
    }
    if (Math.hypot(q.x - ball.x, q.y - ball.y) < ball.r + 20) {
      ball.vx = Math.sign(q.vx) * 900;
      ball.vy = -320;
      ball.hot = 1.5;
      q.life = 0;
    }
  }
  projectiles = projectiles.filter(
    (q) => q.life > 0 && q.x > -40 && q.x < 1160,
  );
  if (
    p2.power >= 100 &&
    mode !== "versus" &&
    mode !== "training" &&
    cpuLevel() < 3 &&
    Math.random() < dt * 0.9
  )
    activateSkill(p2);
  const button = $('[data-key="q"]');
  button.classList.toggle("ready", p1.power >= 100);
  button.setAttribute(
    "aria-label",
    p1.power >= 100
      ? "Skill siap"
      : "Skill mengisi " + Math.floor(p1.power) + " persen",
  );
  if (button.querySelector("span"))
    button.querySelector("span").textContent =
      p1.power >= 100 ? "READY" : Math.floor(p1.power) + "%";
  const s = skillFor(p1);
  $("#activeSkillName").textContent = s.name;
  $("#activeSkillIcon").src = s.icon;
  $(".skill-button-icon").src = s.icon;
  $("#challengeProgress").classList.toggle(
    "hidden",
    mode !== "challenge" || !challenge,
  );
  if (mode === "challenge" && challenge)
    $("#challengeProgress").textContent =
      challenge.name +
      " · " +
      Math.min(challenge.target, matchMetrics[challenge.type] || 0) +
      " / " +
      challenge.target;
}
function drawProjectiles() {
  for (const q of projectiles) {
    ctx.save();
    ctx.shadowColor = q.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = q.color;
    ctx.beginPath();
    ctx.arc(q.x, q.y, 15, 0, 7);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(q.x - 8, q.y);
    ctx.lineTo(q.x + 8, q.y);
    ctx.moveTo(q.x, q.y - 8);
    ctx.lineTo(q.x, q.y + 8);
    ctx.stroke();
    ctx.restore();
  }
}
function drawPlayer(c, p, photo = null, mini = false) {
  c.save();
  c.translate(p.x, p.y);
  const size = p.size || 1;
  c.scale(size, size);
  drawBasePlayer(c, { ...p, x: 0, y: 0 }, photo, mini);
  if (!mini) {
    if (p.frozen > 0) {
      c.fillStyle = "#a5eaff66";
      rounded(c, -35, -105, 70, 105, 10);
    }
    if (p.shield > 0) {
      c.strokeStyle = "#8dd6ff";
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(0, -50, 42, 58, 0, 0, 7);
      c.stroke();
    }
    if (p.fire > 0) {
      c.strokeStyle = "#ffad55";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, -60, 38, 0, 7);
      c.stroke();
    }
  }
  c.restore();
}
function drawLegs(c, p, skin) {
  const walk =
      Math.sin(simTime * 16) * Math.min(1, Math.abs(p.vx) / 250) * 0.45,
    phase =
      p.kick > 0 ? Math.sin(Math.max(0, (0.26 - p.kick) / 0.26) * Math.PI) : 0;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * 9, -10);
    c.rotate(side === p.face ? -p.face * phase * 1.25 : walk * side);
    c.fillStyle = skin;
    rounded(c, -5, 0, 10, 14, 4);
    c.translate(0, 10);
    c.rotate(side === p.face ? -p.face * phase * 0.45 : -walk * side * 0.4);
    rounded(c, -4, 0, 9, 11, 3);
    c.fillStyle = "#eef5fc";
    rounded(c, p.face > 0 ? -5 : -14, 7, 19, 9, 3);
    c.fillStyle = "#27374f";
    c.fillRect(p.face > 0 ? -5 : -14, 13, 19, 3);
    c.restore();
  }
}
const kitColors = {
  ID: ["#db2439", "#fff"],
  BR: ["#ffe23d", "#18864c"],
  AR: ["#fff", "#72caff"],
  FR: ["#1949a5", "#fff"],
  DE: ["#fff", "#141b24"],
  ES: ["#d82237", "#ffcf46"],
  PT: ["#cf243c", "#168450"],
  NL: ["#ff861f", "#171f30"],
  IT: ["#2674df", "#fff"],
  GB: ["#fff", "#d32240"],
  EN: ["#fff", "#d32240"],
  JP: ["#1757bf", "#fff"],
  KR: ["#e83343", "#172f46"],
  US: ["#fff", "#c52a44"],
  BE: ["#bd2438", "#f2d146"],
  HR: ["#fff", "#e72c42"],
};
Object.assign(kitColors, {
  UY: ["#80c7ec", "#161f33"],
  CO: ["#ffdc3e", "#164aad"],
  MX: ["#18884b", "#d82c3e"],
  AU: ["#ffd639", "#248349"],
  MA: ["#d92438", "#176640"],
  SN: ["#20884d", "#ffe047"],
  NG: ["#258c52", "#fff"],
  GH: ["#ec3941", "#ffdb43"],
  CM: ["#18894a", "#d82f42"],
  EG: ["#dc2c39", "#fff"],
  SA: ["#18834d", "#fff"],
  IR: ["#fff", "#198b50"],
  CA: ["#d9233b", "#fff"],
  CH: ["#e12a40", "#fff"],
  DK: ["#c8273b", "#fff"],
  SE: ["#ffdb39", "#2368ad"],
  TR: ["#d82b40", "#fff"],
});
function drawNationalKit(c, id) {
  const pair = kitColors[id] || [nation(id).color, "#ffffff"];
  c.save();
  c.beginPath();
  c.moveTo(-18, -43);
  c.lineTo(16, -43);
  c.lineTo(23, -17);
  c.lineTo(-23, -17);
  c.clip();
  c.fillStyle = pair[0];
  c.fillRect(-24, -44, 48, 28);
  c.fillStyle = pair[1];
  if (["AR", "US", "HR"].includes(id)) {
    if (id === "HR") {
      for (let x = -24; x < 24; x += 8)
        for (let y = -44; y < -16; y += 8)
          if ((x / 8 + y / 8) % 2 === 0) c.fillRect(x, y, 8, 8);
    } else for (let x = -18; x < 24; x += 14) c.fillRect(x, -44, 6, 28);
  } else if (["ID", "PL", "EG", "IR", "CO", "GH"].includes(id)) {
    c.fillRect(-24, -26, 48, 10);
    if (id === "CO") {
      c.fillStyle = "#d62d39";
      c.fillRect(-24, -21, 48, 5);
    }
    if (id === "IR") {
      c.fillStyle = "#d62d39";
      c.fillRect(-24, -21, 48, 5);
    }
  } else if (["FR", "IT", "PT", "BE", "MX", "SN", "CM"].includes(id)) {
    c.fillRect(-5, -44, 10, 28);
    c.fillStyle = ["FR", "IT", "MX", "SN", "CM"].includes(id)
      ? "#d62d39"
      : "#151c24";
    c.fillRect(11, -44, 13, 28);
  } else if (id === "GB" || id === "EN") {
    c.fillRect(-3, -44, 6, 28);
    c.fillRect(-24, -34, 48, 5);
  } else {
    c.fillRect(-24, -43, 48, 4);
    c.fillRect(-24, -20, 48, 3);
  }
  c.restore();
}
function drawSkyMarker() {
  if (state === "menu" || ball.y >= 0) return;
  const x = Math.max(25, Math.min(worldViewWidth428() - 25, ball.x - cameraX));
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(x, 58);
  ctx.lineTo(x - 8, 71);
  ctx.lineTo(x + 8, 71);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.font = "bold 12px Arial";
  ctx.fillText(Math.round(-ball.y) + " m", x, 87);
}
function enabledRival() {
  const ids = ROSTER.map((p, i) =>
    p.enabled === false || i === selectedFace ? -1 : i,
  ).filter((i) => i >= 0);
  return ids[Math.floor(Math.random() * ids.length)] ?? 0;
}
function startMatch() {
  $(".power").classList.toggle("hidden", !settings().skillEnabled);
  $('[data-key="q"]').classList.toggle("hidden", !settings().skillEnabled);
  if (mode !== "challenge") challenge = null;
  startBaseMatch();
  if (!ROSTER[rivalIndex]?.enabled) rivalIndex = enabledRival();
  if (!["versus", "quick", "cup"].includes(mode) && !activeTeams)
    rivalIndex = enabledRival();
  p2.character = rivalIndex;
  applyFaces();
  projectiles = [];
  duelCooldown = 0;
  matchMetrics = {
    goals: 0,
    airGoals: 0,
    giantGoals: 0,
    skillUse: 0,
    skillHits: 0,
    bodyHits: 0,
  };
  matchMetrics.difficulty = $("#difficulty").value;
  ball.r = settings().ballRadius;
  if (challenge) {
    time = challenge.duration;
    p1.power = 70;
  }
  analog.active = false;
  analog.x = 0;
  analog.jump = false;
  $("#analogKnob").style.transform = "translate(0,0)";
  $("#challengeProgress").classList.toggle("hidden", !challenge);
  eventMetric("matches");
  tickSkills(0);
  updateHud();
  showMatchIntro();
}
function finish() {
  const was = state;
  if (was === "finished") return;
  const c = mode === "challenge" ? challenge : null;
  if (["quick", "cup", "world"].includes(mode) && score[0] > score[1]) {
    if (score[1] === 0) saved.cleanSheets = (saved.cleanSheets || 0) + 1;
    if (["hard","elite"].includes(matchMetrics.difficulty))
      saved.proWins = (saved.proWins || 0) + 1;
  }
  finishBase();
  if (c) {
    const success =
      (matchMetrics[c.type] || 0) >= c.target &&
      (!c.win || score[0] > score[1]);
    saved.challengeClaims ??= [];
    const earned = success && !saved.challengeClaims.includes(c.id);
    if (earned) {
      saved.challengeClaims.push(c.id);
      saved.coins += c.reward;
      save();
    }
    splash(
      success ? "TANTANGAN SELESAI" : "TANTANGAN BERAKHIR",
      Math.min(c.target, matchMetrics[c.type] || 0) +
        " / " +
        c.target +
        (earned ? " · +" + c.reward + " koin" : ""),
      "TANTANGAN →",
      showChallenges,
      c.name,
      "Menu utama",
    );
  }
  $("#challengeProgress").classList.add("hidden");
  for (let i = 0; i < score[0]; i++) eventMetric("goals");
}
function showChallenges() {
  state = "menu";
  const list = managedConfig?.challenges.filter((c) => c.enabled) || [];
  renderPage(
    "challenges",
    heading("SKILL", "Tantangan") +
      `<div class="challenge-grid">${list
        .map((c) => {
          const s = skillDef(c.skill);
          return `<button class="challenge-card" data-challenge="${c.id}"><img src="${esc(s.icon)}" alt="${esc(s.name)}"><h2>${esc(c.name)}</h2><p>${c.target} × ${esc({ skillUse: "Gunakan skill", bodyHits: "Adu badan", skillHits: "Skill mengenai lawan", giantGoals: "Gol saat membesar", airGoals: "Gol saat melompat", goals: "Gol" }[c.type])}${c.win ? " · Menangkan laga" : ""}</p><span>${c.duration} detik · ${saved.challengeClaims?.includes(c.id) ? "Selesai ✓" : "● " + c.reward}</span></button>`;
        })
        .join("")}</div>`,
  );
  $$("[data-challenge]").forEach(
    (b) =>
      (b.onclick = () => {
        challenge = list.find((c) => c.id === b.dataset.challenge);
        mode = "challenge";
        startMatch();
      }),
  );
}
// Mobile input is implemented in matchday.js: full left-half floating joystick.
const pad = $("#analog"), knob = $("#analogKnob");
let analogPointer = null;
