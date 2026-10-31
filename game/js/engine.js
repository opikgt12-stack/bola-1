"use strict";

// Canvas fallback for older mobile Safari/Chromium.
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r = 0) {
    r = Array.isArray(r) ? r[0] : r;
    r = Math.max(0, Math.min(Number(r) || 0, Math.abs(w) / 2, Math.abs(h) / 2));
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  canvas = $("#game"),
  ctx = canvas.getContext("2d");
const coarse428 = matchMedia('(pointer:coarse)');
function worldViewWidth428(){return canvas.logicalWidth428||canvas.width}
function worldViewHeight428(){return 560}
function configureCanvas428(width=worldViewWidth428(),lite=false){
 const scale=1; // 4.29: same native backing resolution as PC; effects never change raster size.
 canvas.logicalWidth428=width;const w=Math.round(width*scale),h=Math.round(560*scale);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.setTransform(w/width,0,0,h/560,0,0);window.menuCanvasDirty43=true;}
 canvas.renderScale428=scale;
}
const STORE = "arena-managed-v4";
let saved = {
  coins: 500,
  goals: 0,
  wins: 0,
  owned: ["volt", "night"],
  kit: "volt",
  arena: "night",
  trail: "none",
  photo: null,
  name: "",
  volume: 0.35,
};
try {
  Object.assign(saved, JSON.parse(localStorage.getItem(STORE) || "{}"));
} catch (e) {}
if (saved.name === "The Challenger") saved.name = "";
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(saved));
  } catch (e) {
    toast("Penyimpanan penuh. Gunakan foto yang lebih kecil.");
  }
  updateStats();
}

const catalog = [
  {
    id: "volt",
    name: "Volt kit",
    type: "kit",
    price: 0,
    color: "#c3ff53",
    info: "Warna khas sang penantang",
  },
  {
    id: "royal",
    name: "Royal blue",
    type: "kit",
    price: 250,
    color: "#699cff",
    info: "Dingin, tenang, mematikan",
  },
  {
    id: "rose",
    name: "Pink striker",
    type: "kit",
    price: 300,
    color: "#ff80b9",
    info: "Beda warna. Tetap berbahaya.",
  },
  {
    id: "sunset",
    name: "Sunset stadium",
    type: "arena",
    price: 450,
    color: "#f6a768",
    info: "Kickoff di bawah langit senja",
  },
  {
    id: "ice",
    name: "Arctic stadium",
    type: "arena",
    price: 600,
    color: "#9be6ff",
    info: "Lapangan bernuansa es",
  },
  {
    id: "fire",
    name: "Blaze trail",
    type: "trail",
    price: 350,
    color: "#ff9e49",
    info: "Jejak api untuk power shot",
  },
];
let headImage = null;
let mode = "quick",
  state = "menu",
  score = [0, 0],
  time = 60,
  keys = {},
  particles = [],
  trail = [],
  shake = 0,
  goalTimer = 0,
  startTimer = 0,
  sudden = false,
  lastScorer = 0,
  matchReward = 0,
  pausedFrom = "playing",
  muted = true,
  audio = null,
  simTime = 0,
  toastTimer,
  cup = null;
let p1, p2, ball;
let rivalIndex = 1,
  cameraX = 0,
  combo = 0,
  goalFlash = 0,
  weatherTime = 0;
const GROUND = 485,
  POST = 347,
  LEFT = 112,
  RIGHT = 1008;
function player(x, side) {
  return {
    x,
    y: GROUND,
    vx: 0,
    vy: 0,
    side,
    character: side === 0 ? Number(saved.face) || 0 : rivalIndex || 1,
    r: 32,
    power: 0,
    cool: 0,
    kick: 0,
    face: side === 0 ? 1 : -1,
    onGround: true,
  };
}
function resetPositions() {
  p1 = player(335, 0);
  p2 = player(785, 1);
  if (mode === 'world' && typeof activeTeams !== 'undefined' && activeTeams) {
    p1.nation = activeTeams.left.id; p2.nation = activeTeams.right.id;
  }
  ball = {
    x: 560,
    y: 230,
    vx: 0,
    vy: 0,
    r: window.GAME_CONFIG?.gameplay.ballRadius || 14,
    spin: 0,
    hot: 0,
  };
  trail = [];
  keys = {};
  if (typeof projectiles !== "undefined") projectiles = [];
  if (typeof skillWaves !== "undefined") skillWaves = [];
}
resetPositions();

function beep(f = 440, d = 0.1, type = "sine", vol = 0.2) {
  if (muted) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(saved.volume * vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + d);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + d);
  } catch (e) {}
}
function splash(
  title,
  text,
  label,
  action,
  tag = "READY TO PLAY",
  secondary = "",
) {
  const el = $("#splash");
  el.replaceChildren();
  const eyebrow = document.createElement("div");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = tag;
  const h = document.createElement("h2");
  h.textContent = title;
  const p = document.createElement("p");
  p.textContent = text;
  const b = document.createElement("button");
  b.className = "primary";
  b.textContent = label;
  b.onclick = action;
  el.append(eyebrow, h, p, b);
  if (secondary) {
    const x = document.createElement("div");
    x.style.marginTop = "10px";
    const bt = document.createElement("button");
    bt.className = "ghost";
    bt.style.minHeight = "34px";
    bt.textContent = secondary;
    bt.onclick = () => {
      state = "menu";
      menu();
    };
    x.append(bt);
    el.append(x);
  }
  translateNodes(el);
  $("#overlay").classList.remove("hidden");
}

function burst(x, y, n, color) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2,
      s = 80 + Math.random() * 300;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 80,
      life: 0.5 + Math.random() * 0.8,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}

function scoreGoal(side) {
  if (side === 0) {
    matchMetrics.goals++;
    if (p1.y < GROUND - 35) matchMetrics.airGoals++;
    if ((p1.size || 1) > 1.2) matchMetrics.giantGoals++;
  }
  sfx("goal");
  score[side]++;
  lastScorer = side;
  state = "goal";
  goalTimer = 2.0;
  shake = 10;
  goalFlash = 0.6;
  combo = side === 0 ? combo + 1 : 0;
  announce(
    side === 0 ? "GOOOAL!" : "RIVAL GOAL",
    score[0] + " — " + score[1],
    side === 0 ? "good" : "bad",
  );
  if (side === 0) {
    saved.streak = Math.max(saved.streak || 0, combo);
    if (navigator.vibrate && saved.haptics !== false)
      navigator.vibrate([50, 30, 90]);
  }
  burst(side === 0 ? 1030 : 90, 390, 65, side === 0 ? "#c3ff53" : "#ff8394");
  if (side === 0 && mode !== "training") {
    saved.goals++;
    save();
  }
  beep(600, 0.22, "triangle", 0.2);
  setTimeout(() => beep(850, 0.25, "triangle", 0.2), 100);
  updateHud();
}
function simulate(dt) {
  presentationTick(dt);
  goalAnimation(dt);
  simTime += dt;
  goalFlash = Math.max(0, goalFlash - dt);
  weatherTime += dt;
  particles.forEach((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 450 * dt;
    p.life -= dt;
  });
  particles = particles.filter((p) => p.life > 0);
  shake *= 0.88;
  if (state === "countdown") {
    if (introRemaining > 0) return;
    startTimer -= dt;
    if (startTimer <= 0) {
      state = "playing";
      beep(750, 0.18, "sine", 0.2);
    }
    return;
  }
  if (state === "goal") {
    goalTimer -= dt;
    if (goalTimer <= 0) {
      if (sudden) {
        finish();
        return;
      }
      resetPositions();
      state = "countdown";
      startTimer = 0.35; // After a goal: GO only, no countdown.
    }
    return;
  }
  if (state !== "playing") return;
  tickSkills(dt);
  tickSkillEffects(dt);
  if (mode !== "training") time = Math.max(0, time - dt);
  movePlayer(
    p1,
    analog.active ? analog.x : (keys.d ? 1 : 0) - (keys.a ? 1 : 0),
    keys.w || analog.jump,
    dt,
  );
  if (mode === "versus")
    movePlayer(
      p2,
      (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0),
      keys.ArrowUp,
      dt,
    );
  else if (mode === "training") movePlayer(p2, 0, false, dt);
  else ai(dt);
  bodyDuel(dt);
  if (keys.q && p1.power >= 100) shoot(p1, true);
  else if (keys.x) {
    const w = keys.w;
    keys.w = true;
    shoot(p1);
    keys.w = w;
  } else if (keys[" "]) shoot(p1, false);
  if (mode === "versus") {
    if (keys.Enter) shoot(p2, false);
    if (keys.Shift) shoot(p2, true);
  }
  const prevX = ball.x,
    prevY = ball.y;
  ball.vy += settings().gravity * dt;
  ball.vx *= Math.exp(-settings().ballDrag * dt);
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  ball.spin += (ball.vx * dt) / ball.r;
  ball.hot = Math.max(0, ball.hot - dt);
  if (ball.y + ball.r > GROUND) {
    ball.y = GROUND - ball.r;
    if (Math.abs(ball.vy) > 110)
      sfx("bounce", Math.min(1, Math.abs(ball.vy) / 700));
    ball.vy = -Math.abs(ball.vy) * settings().bounce;
    ball.vx *= 0.985;
    if (Math.abs(ball.vy) < 45) ball.vy = 0;
  }
  if (!settings().skyOpen && ball.y < ball.r + 8) {
    ball.y = ball.r + 8;
    ball.vy = Math.abs(ball.vy) * 0.8;
  }
  collideBoot(p1);
  collideBoot(p2);
  collideHead(p1);
  collideHead(p2);
  if(window.netStep48){if(netStep48(prevX,prevY))return;}else{
  postCollision(LEFT);
  postCollision(RIGHT);
  // Goal roofs are physical surfaces, not invisible walls at the mouth.
  for (const [a, b] of [
    [28, LEFT],
    [RIGHT, 1092],
  ]) {
    if (
      ball.x + ball.r > a &&
      ball.x - ball.r < b &&
      ball.vy > 0 &&
      prevY + ball.r <= POST &&
      ball.y + ball.r >= POST
    ) {
      ball.y = POST - ball.r;
      ball.vy = -Math.abs(ball.vy) * 0.75;
      beep(520, 0.06, "triangle", 0.08);
    }
  }
  for (const [a, b] of [
    [28, LEFT],
    [RIGHT, 1092],
  ]) {
    if (
      ball.x + ball.r > a &&
      ball.x - ball.r < b &&
      ball.vy < 0 &&
      prevY - ball.r >= POST &&
      ball.y - ball.r < POST
    ) {
      ball.y = POST + ball.r + 5;
      ball.vy = Math.abs(ball.vy) * 0.7;
      sfx("post", 0.5);
    }
  }
  if (ball.x < ball.r + 28) {
    ball.x = ball.r + 28;
    ball.vx = Math.abs(ball.vx) * 0.82;
  }
  if (ball.x > 1092 - ball.r) {
    ball.x = 1092 - ball.r;
    ball.vx = -Math.abs(ball.vx) * 0.82;
  }
  if (ball.y > POST + ball.r) {
    if (ball.x < LEFT - ball.r && prevX >= LEFT - ball.r && ball.vx < 0) {
      goal(1);
      return;
    }
    if (ball.x > RIGHT + ball.r && prevX <= RIGHT + ball.r && ball.vx > 0) {
      goal(0);
      return;
    }
  }
  }
  releaseStuckBall(dt);
  ball.vx = Math.max(-ballSpeedLimit(), Math.min(ballSpeedLimit(), ball.vx));
  ball.vy = Math.max(-1100, Math.min(1100, ball.vy));
  trail.push({ x: ball.x, y: ball.y, hot: ball.hot });
  if (trail.length > 12) trail.shift();
  if (mode !== "training" && time <= 0 && !sudden) {
    if (
      score[0] === score[1] &&
      !(mode === "world" && world?.phase === "group")
    ) {
      sudden = true;
      announce("GOLDEN GOAL", "Gol berikutnya menang", "gold");
      beep(800, 0.2, "triangle", 0.15);
    } else finish();
  }
  updateHud();
}

function rounded(c, x, y, w, h, r) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
function paintStadium(c) {
  const sunset = saved.arena === "sunset" || saved.arena === "desert",
    ice = saved.arena === "ice";
  let sky = c.createLinearGradient(0, 0, 0, GROUND);
  const ar = ARENAS.find((a) => a.id === saved.arena) || ARENAS[0];
  sky.addColorStop(0, ar.sky[0]);
  sky.addColorStop(0.75, ar.sky[1]);
  c.fillStyle = sky;
  c.fillRect(0, 0, 1120, 560);
  if (window.arenaBackgrounds?.[ar.id]) {
    c.globalAlpha = 0.4;
    c.drawImage(window.arenaBackgrounds[ar.id], 0, 0, 1120, 560);
    c.globalAlpha = 1;
  }
  // Skyline, floodlights, roof and grandstands.
  c.fillStyle = "#102039";
  for (let x = 0; x < 1120; x += 47) {
    let h = 35 + Math.sin(x * 3.7) * 24;
    c.fillRect(x, 190 - h, 35, h + 90);
  }
  c.strokeStyle = "#536b88";
  c.lineWidth = 5;
  for (const x of [135, 985]) {
    c.beginPath();
    c.moveTo(x, 250);
    c.lineTo(x, 76);
    c.stroke();
    c.fillStyle = "#b2c6d9";
    rounded(c, x - 39, 65, 78, 20, 3);
    c.fillStyle = "#f2f9ff";
    for (let i = 0; i < 6; i++) c.fillRect(x - 34 + i * 12, 69, 8, 11);
    const glow = c.createRadialGradient(x, 80, 5, x, 80, 180);
    glow.addColorStop(0, "#c5e8ff40");
    glow.addColorStop(1, "#c5e8ff00");
    c.fillStyle = glow;
    c.fillRect(x - 180, 0, 360, 260);
  }
  c.fillStyle = "#15263f";
  c.beginPath();
  c.moveTo(0, 182);
  c.quadraticCurveTo(560, 275, 1120, 182);
  c.lineTo(1120, 360);
  c.lineTo(0, 360);
  c.fill();
  for (let row = 0; row < 7; row++) {
    let yy = 230 + row * 15;
    c.strokeStyle = "#2e405b";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(0, yy + 8);
    c.lineTo(1120, yy + 8);
    c.stroke();
    for (let j = 0; j < 83; j++) {
      const x = j * 14 + (row % 2) * 6,
        y = yy + Math.sin(x * 0.007) * 12;
      const n = Math.sin(j * 72 + row * 37);
      c.fillStyle =
        n > 0.65
          ? "#a3b9bb"
          : n > 0.1
            ? "#5c7192"
            : n > -0.4
              ? "#3d587a"
              : "#24415f";
      c.beginPath();
      c.arc(x, y, 2.7, 0, Math.PI * 2);
      c.fill();
      c.fillRect(x - 2, y + 3, 4, 5);
    }
  }
  c.fillStyle = "#101b2d";
  c.fillRect(0, 335, 1120, 37);
  c.fillStyle = "#6f91b5";
  c.font = "bold 11px Arial";
  c.textAlign = "center";
  for (let i = 0; i < 6; i++) {
    c.fillText(
      i % 2 ? "PLAY WITHOUT LIMITS" : "HEAD / ARENA",
      88 + i * 190,
      358,
    );
  }
  c.fillStyle = ar.pitch;
  c.fillRect(0, 372, 1120, 188);
  for (let i = 0; i < 14; i++) {
    c.fillStyle = i % 2 ? "#123c3617" : "#c0e6cb07";
    c.fillRect(i * 80, 372, 80, 188);
  }
  c.strokeStyle = "#aad9b045";
  c.lineWidth = 2;
  c.strokeRect(65, 400, 990, 125);
  c.beginPath();
  c.moveTo(560, 400);
  c.lineTo(560, 525);
  c.moveTo(622, 461);
  c.ellipse(560, 461, 62, 36, 0, 0, Math.PI * 2);
  c.stroke();
  c.strokeRect(65, 421, 100, 80);
  c.strokeRect(955, 421, 100, 80);
  c.strokeStyle = "#9ed8af65";
  c.beginPath();
  c.moveTo(0, GROUND + 1);
  c.lineTo(1120, GROUND + 1);
  c.stroke();
  c.fillStyle = "#0a1b2540";
  c.fillRect(0, 530, 1120, 30);
  c.fillStyle = "#9ad7a1";
  for (let i = 0; i < 112; i++) {
    c.globalAlpha = 0.12;
    c.fillRect(i * 10, 484, 1, 3);
  }
  c.globalAlpha = 1;
}
const stadiumCache = document.createElement("canvas");
stadiumCache.width = 1120;
stadiumCache.height = 560;
let stadiumKey = "";
function drawStadium() {
  if (stadiumKey !== saved.arena + "|" + (window.CONFIG_REVISION || "")) {
    paintStadium(stadiumCache.getContext("2d"));
    stadiumKey = saved.arena + "|" + (window.CONFIG_REVISION || "");
  }
  ctx.drawImage(stadiumCache, 0, 0);
}

function drawGoal(left, front = false) {
  const x = left ? LEFT : RIGHT,
    back = left ? 16 : 1104;
  if (!front) {
    ctx.fillStyle = "#d9eaff09";
    ctx.beginPath();
    ctx.moveTo(x, POST);
    ctx.lineTo(back, POST);
    ctx.lineTo(back, GROUND);
    ctx.lineTo(x, GROUND);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d4edff38";
    ctx.lineWidth = 1;
    for (let y = POST + 10; y < GROUND; y += 13) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(back, Math.min(y + 16, GROUND));
      ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      let xx = x + ((back - x) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(xx, POST);
      ctx.lineTo(xx, GROUND);
      ctx.stroke();
    }
    ctx.strokeStyle = "#b3c6db80";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, POST);
    ctx.lineTo(back, POST);
    ctx.lineTo(back, GROUND);
    ctx.lineTo(x, GROUND);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "#e8f4fc";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, GROUND);
    ctx.lineTo(x, POST);
    ctx.lineTo(left ? x - 9 : x + 9, POST);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, POST, 4, 0, 7);
    ctx.fill();
  }
}

function drawBall() {
  ctx.fillStyle = "#061c2b35";
  ctx.beginPath();
  ctx.ellipse(ball.x, GROUND - 2, ball.r + 5, 4, 0, 0, 7);
  ctx.fill();
  trail.forEach((p, i) => {
    if (ball.hot > 0 || Math.abs(ball.vx) > 220) {
      ctx.globalAlpha = (i / trail.length) * (ball.hot > 0 ? 0.38 : 0.1);
      ctx.fillStyle = saved.trail === "fire" ? "#ff964b" : "#c3ff53";
      ctx.beginPath();
      ctx.arc(p.x, p.y, (ball.r * i) / trail.length, 0, 7);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.spin);
  ctx.fillStyle =
    saved.ball === "goldball"
      ? "#ffdc7b"
      : saved.ball === "iceball"
        ? "#b8f1ff"
        : saved.ball === "neonball"
          ? "#c3ff53"
          : "#f4f9fc";
  ctx.beginPath();
  ctx.arc(0, 0, ball.r, 0, 7);
  ctx.fill();
  ctx.strokeStyle = "#c4d1e1";
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = "#17263a";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    let a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * 6, Math.sin(a) * 6);
  }
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -14, 4, 0, 7);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function draw() {
  ctx.save();
  const vw = worldViewWidth428(), online = window.HAOnline422, isOnline = !!online?.active(), mirrored = !!online?.mirrored();
  const own = mirrored ? p2 : p1;
  let focus = state === "menu" ? 560 : ball.x * 0.8 + own.x * 0.2;
  // Portrait online: never lose the local player when the ball crosses the pitch.
  if (isOnline && state !== "menu" && vw < 1120)
    focus = Math.max(own.x - vw / 2 + 90, Math.min(own.x + vw / 2 - 90, focus));
  let target = vw < 1120 ? Math.max(0, Math.min(1120 - vw, focus - vw / 2)) : 0;
  // A portrait phone must not scroll the entire world on each ball correction.
  // Use a stable local-player dead zone, rather than chasing the delayed ball feed.
  if(isOnline&&coarse428.matches&&vw<1120){const margin=100,screen=own.x-cameraX;target=cameraX;if(screen<margin)target=own.x-margin;else if(screen>vw-margin)target=own.x-vw+margin;target=Math.max(0,Math.min(1120-vw,target));}
  cameraX += (target - cameraX) * (1 - Math.exp(-renderDelta4221 * 5));
  // Background remains readable; only the physical playfield changes viewpoint.
  ctx.save();ctx.translate(-(mirrored ? 1120 - cameraX - vw : cameraX), 0);
  drawStadium();ctx.restore();
  if (mirrored) {ctx.translate(vw, 0);ctx.scale(-1, 1);}
  ctx.translate(-cameraX, 0);
  if (shake > 0.3 && saved.effects !== false && settings().cameraShake)
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  drawGoal(true);
  drawGoal(false);
  if (state !== "menu") {
    drawPlayer(ctx, p1, headImage);
    drawPlayer(ctx, p2, rivalImage);
    drawProjectiles();
    drawBall();
    drawSkillEffects();
  }
  drawGoal(true, true);
  drawGoal(false, true);
  particles.forEach((p) => {
    ctx.globalAlpha = Math.min(1, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  });
  ctx.globalAlpha = 1;
  if (p1.power >= 100) {
    ctx.strokeStyle = "#c3ff5366";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(p1.x, p1.y - 2, 35, 8, 0, 0, 7);
    ctx.stroke();
  }
  if (state === "countdown" && introRemaining <= 0) drawKickoff();
  if (false) {
    ctx.fillStyle = "#0a172e77";
    ctx.fillRect(0, 180, 1120, 165);
    ctx.fillStyle = lastScorer === 0 ? "#c3ff53" : "#ff8195";
    ctx.font = "italic 900 85px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GOOOAL!", 560, 285);
  }
  drawAtmosphere();
  ctx.restore();
  drawRadar();
  drawSkyMarker();
}
let renderDelta4221 = 1 / 60;
let last = 0,
  acc = 0;
function captureRender428(){return {phase:state,p:[p1,p2,ball].map(p=>({x:p.x,y:p.y,spin:p.spin}))}}
function renderFrame428(previous){
 if(!previous||previous.phase!==state)return draw();
 const objects=[p1,p2,ball],current=objects.map(p=>({x:p.x,y:p.y,spin:p.spin})),alpha=Math.max(0,Math.min(1,acc*120));
 try{objects.forEach((p,i)=>{const a=previous.p[i],b=current[i];if(Math.hypot(b.x-a.x,b.y-a.y)>180)return;p.x=a.x+(b.x-a.x)*alpha;p.y=a.y+(b.y-a.y)*alpha;if(Number.isFinite(a.spin)&&Number.isFinite(b.spin))p.spin=a.spin+(b.spin-a.spin)*alpha});draw()}
 finally{objects.forEach((p,i)=>{p.x=current[i].x;p.y=current[i].y;if(Number.isFinite(current[i].spin))p.spin=current[i].spin})}
}
function frame(t) {
  if (!last) last = t;
  const dt = Math.min((t - last) / 1000, window.HAOnline422?.active()?0.12:0.05);
  last = t;
  renderDelta4221 = dt;
  let previous428=null;const onlineHost428=!!window.HAOnline422?.active()&&!window.HAOnline422?.guest();
  if (!document.hidden && state !== "menu" && state !== "paused") {
    // Guest interpolates once per display frame, not 120 times/second.
    // Local prediction internally substeps; the host keeps 120 Hz collision physics.
    if(window.HAOnline422?.guest()){simulate(dt);if(window.HAOnline422.sharedMobile433?.()){previous428=window.HAOnline422.renderPrevious433();acc=(window.HAOnline422.frameFraction433()||0)/120}else acc=0;}
    else {
      acc = Math.min(acc + dt, onlineHost428?.12:.05);
      while (acc >= 1 / 120) {if(onlineHost428)previous428=captureRender428();simulate(1 / 120);acc -= 1 / 120;}
    }
  } else acc = 0;
  window.tickLobby414?.(t);
  if (state !== "menu" && state !== "paused" || window.menuCanvasDirty43) {
    renderFrame428(previous428); window.menuCanvasDirty43 = false;
  }
  requestAnimationFrame(frame);
}
