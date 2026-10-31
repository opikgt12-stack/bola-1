"use strict";
// Matchday 3.1: active CPU, real oversized boots, national kits and readable skill effects.
const PLAYER_COUNTRIES = [
  "ID",
  "ID",
  "BR",
  "AR",
  "FR",
  "ES",
  "DE",
  "PT",
  "GB",
  "NL",
  "IT",
  "BE",
  "HR",
  "UY",
  "CO",
  "JP",
  "KR",
  "MX",
];
const SKILL_HELP = {
  titan:
    "Tubuh raksasa selama beberapa detik. Jangkauan sundulan dan tendangan ikut membesar.",
  freeze:
    "Proyektil es membekukan lawan. Lawan tidak bisa bergerak, melompat, atau menendang.",
  fire: "Sepatu berapi memperkuat setiap tembakan. Bola meninggalkan jejak meteor.",
  inflate:
    "Kutukan gravitasi memperlambat lawan tanpa mengubah ukuran tubuhnya. Rebut ruang untuk menyerang.",
  storm:
    "Pusaran angin mendorong lawan dan melontarkan bola. Arahkan ke jalur serangan.",
  shield:
    "Perisai menahan satu proyektil lawan lalu pecah. Cari celah sambil terlindungi.",
};
let skillWaves = [];
function skillDescription(id) {
  return SKILL_HELP[id] || "";
}
function normalizeMatchdayConfig(c) {
  const slow=c.skills.find(s=>s.id==='inflate');if(slow && ['Inflate','Inflation'].includes(slow.name))slow.name='Gravity';
  c.players.forEach((p, i) => {
    p.nation = p.nation || PLAYER_COUNTRIES[i] || NATIONS[i % NATIONS.length].id;
  });
  c.home ??= { leftPlayer: 0, rightPlayer: 1 };
  for (let i = catalog.length - 1; i >= 0; i--)
    if (catalog[i].type === "kit") catalog.splice(i, 1);
}
function playerNation(i) {
  return nation(ROSTER[i]?.nation || PLAYER_COUNTRIES[i] || 'ID');
}
function homeCast(side) {
  const enabled = ROSTER.map((p, i) => (p.enabled !== false ? i : -1)).filter(
      (i) => i >= 0,
    ),
    id = Number(
      managedConfig?.home?.[side === 0 ? "leftPlayer" : "rightPlayer"],
    );
  return enabled.includes(id) ? id : enabled[side % enabled.length] || 0;
}
function skillFX(x, y, color, label = "") {
  skillWaves.push({ x, y, color, label, life: 0.7, total: 0.7 });
  if (saved.effects !== false && !reducedMotion.matches) burst(x, y, 24, color);
}
function tickSkillEffects(dt) {
  skillWaves.forEach((w) => (w.life -= dt));
  skillWaves = skillWaves.filter((w) => w.life > 0);
  if (skillWaves.length > 12) skillWaves.splice(0, skillWaves.length - 12);
  if (particles.length > 240) particles.splice(0, particles.length - 240);
}
function releaseStuckBall(dt) {
  ball.rescueCool = Math.max(0, (ball.rescueCool || 0) - dt);
  const low = ball.y > GROUND - 115,
    near = (p) =>
      Math.abs(p.x - ball.x) < 70 * (p.size || 1) + ball.r &&
      Math.abs(p.y - ball.y) < 120 * (p.size || 1);
  const a = near(p1),
    b = near(p2),
    pinched =
      (a && b) ||
      (low && (a || b) && (ball.x < LEFT + 40 || ball.x > RIGHT - 40)),
    slow = Math.abs(ball.vx) < 145 && Math.abs(ball.vy) < 170;
  // Also detect a vibrating ball trapped in a small area rather than only zero velocity.
  if (!ball.stuckAnchor) ball.stuckAnchor = { x: ball.x, y: ball.y, t: 0 };
  const s = ball.stuckAnchor;
  if (Math.hypot(ball.x - s.x, ball.y - s.y) > 46) {
    s.x = ball.x;
    s.y = ball.y;
    s.t = 0;
  } else s.t += dt;
  ball.stuckTime =
    low && (pinched || (slow && (a || b))) ? (ball.stuckTime || 0) + dt : 0;
  if (
    ball.rescueCool <= 0 &&
    (ball.stuckTime > 0.65 || (s.t > 1.5 && low && (a || b)))
  ) {
    const nearPlayers = [p1, p2].filter(near),
      top = Math.min(
        ...nearPlayers.map((p) => p.y - 110 * (p.size || 1)),
        ball.y - 30,
      );
    ball.y = Math.max(32, Math.min(ball.y - 25, top - ball.r - 12));
    ball.vy = -780;
    ball.vx = (560 - ball.x) * 0.13;
    ball.stuckTime = 0;
    ball.rescueCool = 1.1;
    s.t = 0;
    s.x = ball.x;
    s.y = ball.y;
    skillFX(ball.x, ball.y, "#d5f6ff", "BOLA BEBAS ↑");
  }
}
function ai(dt) {
  const level = cpuLevel(),
    cfg = [
      { pace: 0.83, reaction: 0.26, look: 0.12 },
      { pace: 1, reaction: 0.15, look: 0.22 },
      { pace: 1, reaction: 0.09, look: 0.32 },
    ][level];
  const b = (p2.brain ??= {
    wait: 0,
    target: p2.x,
    jump: false,
    jumpLock: 0,
    shotWait: 0.15,
    blocked: 0,
    prevX: p2.x,
  });
  b.wait -= dt;
  b.jumpLock = Math.max(0, b.jumpLock - dt);
  b.shotWait = Math.max(0, b.shotWait - dt);
  if (p2.frozen > 0 || p2.stun > 0) {
    movePlayer(p2, 0, false, dt);
    b.wait = 0;
    return;
  }
  if (b.wait <= 0) {
    b.wait = cfg.reaction;
    const soon = predictBallAt(cfg.look),
      behind = ball.x > p2.x + 30,
      defending = ball.vx > 160 && ball.x > 700;
    // Always contest the ball, including the opponent's half. No idle defensive parking.
    b.target = Math.max(
      LEFT + 45,
      Math.min(
        RIGHT - 42,
        (behind ? Math.max(ball.x, soon.x) : soon.x) + 42 * (p2.size || 1),
      ),
    );
    if (defending && ball.y < POST - 60)
      b.target = Math.max(b.target, RIGHT - 65);
    const hit = predictBallAt(0.18);
    b.jump =
      Math.abs(hit.x - p2.x) < 125 &&
      hit.y < p2.y - 100 * (p2.size || 1) &&
      hit.y > p2.y - 290 &&
      hit.vy > -500;
    if (behind && Math.abs(ball.x - p2.x) < 120) b.jump = true;
  }
  const gap = b.target - p2.x,
    dir = Math.abs(gap) < 5 ? 0 : Math.sign(gap) * cfg.pace;
  b.blocked =
    Math.abs(dir) > 0.1 && Math.abs(p2.x - b.prevX) < 0.12
      ? b.blocked + dt
      : Math.max(0, b.blocked - dt * 2);
  b.prevX = p2.x;
  const jump = (b.jump || b.blocked > 0.3) && p2.onGround && b.jumpLock === 0;
  if (jump) {
    b.jumpLock = 0.62;
    b.jump = false;
    b.blocked = 0;
  }
  movePlayer(p2, dir, jump, dt);
  const dx = ball.x - p2.x,
    dy = ball.y - (p2.y - 33 * (p2.size || 1));
  if (
    b.shotWait <= 0 &&
    Math.abs(dx) < 76 * bootFor(p2).reach * (p2.size || 1) &&
    Math.abs(dy) < 76 * (p2.size || 1)
  ) {
    p2.face = -1;
    p2.aiLob =
      level > 0 &&
      p1.x < p2.x &&
      p2.x - p1.x < 240 &&
      p1.onGround &&
      ball.x > 350;
    shoot(p2);
    b.shotWait = [0.52, 0.31, 0.24][level];
  }
}
function shoot(p, power = false) {
  if (state !== "playing" || p.cool > 0 || p.frozen > 0 || p.stun > 0) return;
  if (power) {
    if (p.power >= 100) activateSkill(p);
    return;
  }
  const boot = bootFor(p);
  p.cool = boot.cooldown;
  p.kick = 0.26;
  const size = p.size || 1,
    dx = ball.x - p.x,
    dy = ball.y - (p.y - 33 * size);
  sfx("kick", 0.35);
  if (
    Math.abs(dx) > 76 * boot.reach * size + ball.r * 0.3 ||
    Math.abs(dy) > 76 * size
  )
    return;
  const lob =
      p.side === 0
        ? keys.w || keys.x || analog.jump
        : mode === "versus"
          ? keys.ArrowUp
          : p.aiLob,
    low = p.side === 0 && keys.s,
    fire = p.fire > 0;
  const shot =
    settings().shotSpeed *
    (ROSTER[p.character]?.shot || 1) *
    boot.shot *
    (fire ? 1.38 : 1);
  ball.vx = (p.side === 0 ? 1 : -1) * shot * (lob ? 0.7 : 1) + p.vx * 0.16;
  ball.vy = lob ? -settings().lobSpeed * 0.9 : low ? -100 : fire ? -285 : -250;
  ball.hot = fire ? 2 : 0;
  ball.lastTouch = p.side;
  ball.stuckTime = 0;
  matchMetrics.shots = (matchMetrics.shots || 0) + (p.side === 0 ? 1 : 0);
  sfx("kick");
  skillFX(ball.x, ball.y, fire ? "#ffb358" : "#fff");
  if (settings().cameraShake && saved.effects !== false) shake = fire ? 4 : 1.5;
}
function activateSkill(p) {
  const s = skillFor(p);
  if (
    state !== "playing" ||
    p.frozen > 0 ||
    p.stun > 0 ||
    p.power < 100 ||
    !settings().skillEnabled ||
    !s.enabled
  )
    return;
  p.power = 0;
  p.kick = 0.26;
  sfx("skill");
  const duration = Math.max(
    0.5,
    Math.min(15, (s.duration * settings().skillDuration) / 5),
  );
  if (p.side === 0) matchMetrics.skillUse++;
  p.skillPulse = 0.65;
  p.skillColor = s.color;
  if (s.id === "titan") {
    p.giant = duration;
    p.size = 1.6;
  } else if (s.id === "shield") p.shield = duration;
  else if (s.id === "fire") {
    p.fire = duration;
    p.cool = 0;
    shoot(p);
  } else
    projectiles.push({
      x: p.x + p.face * 45,
      y: p.y - 62 * (p.size || 1),
      vx: p.face * (s.id === "storm" ? 740 : 530),
      side: p.side,
      id: s.id,
      life: 2.2,
      color: s.color,
      duration,
      age: 0,
    });
  skillFX(p.x, p.y - 55, s.color);
  announce(s.name, skillDescription(s.id), p.side === 0 ? "good" : "bad");
}
function tickSkills(dt) {
  if (!settings().skillEnabled) {
    p1.power = p2.power = 0;
    projectiles = [];
    return;
  }
  for (const p of [p1, p2]) {
    p.power = Math.min(100, p.power + settings().skillCharge * dt);
    for (const k of [
      "giant",
      "frozen",
      "stun",
      "heavy",
      "shield",
      "fire",
      "skillPulse",
    ])
      p[k] = Math.max(0, (p[k] || 0) - dt);
    p.size = p.giant > 0 ? 1.6 : 1;
  }
  for (const q of projectiles) {
    const oldX = q.x;
    q.x += q.vx * dt;
    q.life -= dt;
    q.age += dt;
    const t = q.side === 0 ? p2 : p1,
      r = 46 * (t.size || 1),
      cross =
        q.x > oldX
          ? t.x + r >= oldX && t.x - r <= q.x
          : t.x - r <= oldX && t.x + r >= q.x;
    if (
      cross &&
      Math.abs(q.y - (t.y - 60 * (t.size || 1))) < 72 * (t.size || 1)
    ) {
      if ((t.shield || 0) > 0) {
        t.shield = 0;
        skillFX(t.x, t.y - 60, "#a9dfff", "BLOCK!");
      } else {
        if (q.id === "freeze") {
          t.frozen = q.duration;
          t.vx = 0;
        }
        if (q.id === "inflate") t.heavy = q.duration;
        if (q.id === "storm") {
          t.vx = Math.sign(q.vx) * 740;
          t.vy = -360;
          t.onGround = false;
          t.stun = Math.min(0.45, q.duration);
        }
        if (q.side === 0) matchMetrics.skillHits++;
        skillFX(
          t.x,
          t.y - 60,
          q.color,
          q.id === "freeze" ? "BEKU" : q.id === "inflate" ? "" : "TERDORONG",
        );
      }
      q.life = 0;
      sfx("body");
    }
    if (q.life > 0 && Math.hypot(q.x - ball.x, q.y - ball.y) < ball.r + 24) {
      ball.vx = Math.sign(q.vx) * 950;
      ball.vy = -390;
      ball.hot = 1.5;
      ball.lastTouch = q.side;
      q.life = 0;
      skillFX(ball.x, ball.y, q.color);
    }
  }
  projectiles = projectiles.filter(
    (q) => q.life > 0 && q.x > -40 && q.x < 1160,
  );
  if (
    p2.power >= 100 &&
    p2.frozen <= 0 &&
    p2.stun <= 0 &&
    mode !== "versus" &&
    mode !== "training"
  ) {
    p2.skillWait = (p2.skillWait || 0) + dt;
    const s = skillFor(p2),
      distance = Math.abs(p1.x - p2.x);
    if (
      p2.skillWait > 0.4 &&
      (distance < 650 ||
        s.id === "titan" ||
        s.id === "shield" ||
        (s.id === "fire" && Math.abs(ball.x - p2.x) < 180))
    ) {
      p2.face = p1.x < p2.x ? -1 : 1;
      activateSkill(p2);
      p2.skillWait = 0;
    }
  }
  // Online HUD is refreshed separately; keep 120 Hz skill physics free of DOM writes.
  if (window.HAOnline422?.active()) return;
  const button = $('[data-key="q"]');
  button.classList.toggle("ready", p1.power >= 100);
  button.setAttribute(
    "aria-label",
    p1.power >= 100
      ? "Skill siap"
      : "Skill mengisi " + Math.floor(p1.power) + " persen",
  );
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
function drawLegs(c, p, skin) {
  const walk = Math.sin(simTime * 16) * Math.min(1, Math.abs(p.vx) / 250) * 0.5,
    phase =
      p.kick > 0 ? Math.sin(Math.max(0, (0.26 - p.kick) / 0.26) * Math.PI) : 0;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(side * 11, -15);
    c.rotate(side === p.face ? -p.face * phase * 1.15 : walk * side);
    c.fillStyle = skin;
    rounded(c, -5, 0, 10, 10, 4);
    c.fillStyle = "#fafcff";
    rounded(c, -6, 7, 12, 8, 3);
    c.translate(0, 11);
    c.rotate(side === p.face ? -p.face * phase * 0.35 : -walk * side * 0.3);
    const x = p.face > 0 ? -12 : -39;
    c.fillStyle = "#07182d";
    rounded(c, x - 1, -2, 53, 20, 7);
    c.fillStyle = p.fire > 0 ? "#ff9c3e" : p.side === 0 ? "#eafaff" : "#87e8d6";
    rounded(c, x, -3, 51, 16, 6);
    c.fillStyle = "#23559d";
    rounded(c, x + 6, 0, 16, 7, 2);
    c.strokeStyle = "#fff";
    c.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(x + 10 + i * 4, -1);
      c.lineTo(x + 7 + i * 4, 5);
      c.stroke();
    }
    c.fillStyle = "#f9fcff";
    rounded(c, x, 11, 51, 4, 2);
    c.fillStyle = "#1b3350";
    for (let i = 0; i < 4; i++) c.fillRect(x + 5 + i * 11, 15, 5, 3);
    c.restore();
  }
}
const nationalKitCache414 = new Map();
function drawNationalKit(c, id) {
  let sprite = nationalKitCache414.get(id);
  if (!sprite) {
    sprite = document.createElement('canvas'); sprite.width = 128; sprite.height = 92;
    const g = sprite.getContext('2d'); g.scale(2,2); g.translate(32,46);
    const pair = kitColors[id] || [nation(id).color, '#fff'];
    g.save();g.beginPath();g.moveTo(-8,-44);g.lineTo(-17,-42);g.lineTo(-29,-32);g.lineTo(-24,-22);g.lineTo(-17,-26);g.lineTo(-18,-16);g.quadraticCurveTo(0,-13,18,-16);g.lineTo(17,-26);g.lineTo(24,-22);g.lineTo(29,-32);g.lineTo(17,-42);g.lineTo(8,-44);g.closePath();g.clip();
    g.fillStyle=pair[0];g.fillRect(-32,-46,64,34);g.fillStyle=pair[1];
    if (['AR','US'].includes(id)) for(let x=-16;x<22;x+=12)g.fillRect(x,-44,5,29);
    else if(id==='HR') for(let x=-24;x<28;x+=6)for(let y=-44;y<-14;y+=6)if((Math.round(x/6)+Math.round(y/6))%2===0)g.fillRect(x,y,6,6);
    else if(['GB','EN'].includes(id)){g.fillRect(-2,-44,4,29);g.fillRect(-28,-35,56,4);}
    else if(['FR','DE','BE'].includes(id)){g.globalAlpha=.8;g.fillRect(-21,-42,3,25);g.fillRect(18,-42,3,25);g.globalAlpha=1;}
    else {g.globalAlpha=.14;g.beginPath();g.moveTo(-20,-44);g.lineTo(-6,-44);g.lineTo(22,-17);g.lineTo(7,-17);g.fill();g.globalAlpha=1;}
    const shade=g.createLinearGradient(-27,0,27,0);shade.addColorStop(0,'#00000045');shade.addColorStop(.28,'#ffffff1f');shade.addColorStop(.55,'#ffffff05');shade.addColorStop(1,'#00000055');g.fillStyle=shade;g.fillRect(-32,-46,64,34);
    g.strokeStyle=pair[1];g.lineWidth=2.5;g.beginPath();g.moveTo(-29,-26);g.lineTo(-23,-23);g.moveTo(23,-23);g.lineTo(29,-26);g.stroke();
    g.strokeStyle='#ffffff35';g.lineWidth=.65;g.beginPath();g.moveTo(-16,-37);g.lineTo(-15,-19);g.moveTo(16,-37);g.lineTo(15,-19);g.moveTo(-17,-17);g.quadraticCurveTo(0,-15,17,-17);g.stroke();g.restore();
    // Ribbed V collar; no second shirt/neck layer.
    g.fillStyle=pair[1];g.beginPath();g.moveTo(-9,-44);g.quadraticCurveTo(0,-32,9,-44);g.lineTo(6,-44);g.quadraticCurveTo(0,-37,-6,-44);g.closePath();g.fill();
    // A stitched neutral shield rather than an imitation federation logo.
    g.fillStyle=pair[1];g.beginPath();g.moveTo(7,-37);g.lineTo(13,-37);g.lineTo(13,-33);g.lineTo(10,-30);g.lineTo(7,-33);g.closePath();g.fill();g.fillStyle=pair[0];g.fillRect(8,-36,4,2);
    g.strokeStyle=pair[1];g.lineWidth=1;g.beginPath();g.moveTo(-12,-34);g.lineTo(-7,-35);g.stroke();
    nationalKitCache414.set(id,sprite);
  }
  c.drawImage(sprite,-32,-46,64,46);
}

function drawPlayer(c, p, photo = null, mini = false) {
  c.save();
  c.translate(p.x, p.y);
  const size = p.size || 1;
  c.scale(size, size);
  if (!mini && p.giant > 0) {
    c.fillStyle = "#ffcc4824";
    c.beginPath();
    c.ellipse(0, -2, 44 + Math.sin(simTime * 5) * 3, 10, 0, 0, 7);
    c.fill();
  }
  drawBasePlayer(c, { ...p, x: 0, y: 0 }, photo, mini);
  if (!mini) {
    const fx = saved.effects !== false && !reducedMotion.matches;
    if (p.frozen > 0) {
      c.fillStyle = "#94e6ff68";
      c.strokeStyle = "#d3f7ff";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-40, -5);
      c.lineTo(-38, -93);
      c.lineTo(-22, -115);
      c.lineTo(28, -110);
      c.lineTo(40, -80);
      c.lineTo(36, -4);
      c.closePath();
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(-22, -94);
      c.lineTo(6, -65);
      c.lineTo(-4, -40);
      c.lineTo(19, -13);
      c.stroke();
    }
    if (p.shield > 0) {
      c.strokeStyle = "#8bdcff";
      c.lineWidth = 3;
      c.fillStyle = "#7dccff12";
      c.beginPath();
      c.ellipse(0, -54, 45, 61, 0, 0, 7);
      c.fill();
      c.stroke();
      if (fx) {
        c.strokeStyle = "#e4fbff";
        c.beginPath();
        c.ellipse(0, -54, 45, 61, 0, simTime * 3, simTime * 3 + 1);
        c.stroke();
      }
    }
    if (p.fire > 0) {
      c.fillStyle = "#ffbd4e";
      for (let i = 0; i < 5; i++) {
        const h = fx ? 10 + Math.sin(simTime * 14 + i * 3) * 6 : 10;
        c.beginPath();
        c.moveTo(-25 + i * 12, 0);
        c.quadraticCurveTo(-23 + i * 12, -h - 15, -16 + i * 12, -h);
        c.lineTo(-12 + i * 12, 0);
        c.fill();
      }
    }
    if (p.stun > 0) {
      c.strokeStyle = "#c5ff59";
      c.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(0, -42 - i * 20, 40 - i * 3, 10, -simTime * 4, 0, 5);
        c.stroke();
      }
    }
    if (p.heavy > 0) {
      c.strokeStyle = "#daacff";
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(0, -50, 43, 58, 0, 0, 7);
      c.stroke();
    }
    const statuses = [
      ["frozen", "BEKU", "#b7edff"],
      ["heavy", "LAMBAT", "#e2b5ff"],
      ["giant", "TITAN", "#ffdb88"],
      ["fire", "METEOR", "#ffc98d"],
      ["shield", "SHIELD", "#abdcff"],
    ].filter(([k]) => p[k] > 0);
    if (statuses.length) {
      c.font = "bold 9px Arial";
      c.textAlign = "center";
      statuses.forEach(([k, label, color], i) => {
        c.fillStyle = "#071b30ed";
        rounded(c, -36, -130 - i * 17, 72, 15, 4);
        c.fillStyle = color;
        c.fillText(label + " " + p[k].toFixed(1) + "s", 0, -119 - i * 17);
      });
    }
  }
  c.restore();
}
function drawProjectiles() {
  for (const q of projectiles) {
    ctx.save();
    ctx.translate(q.x, q.y);
    ctx.scale(Math.sign(q.vx), 1);
    ctx.strokeStyle = q.color;
    ctx.fillStyle = q.color;
    ctx.lineWidth = 3;
    if (saved.effects !== false && !reducedMotion.matches) {
      ctx.shadowColor = q.color;
      ctx.shadowBlur = 14;
      for (let i = 1; i <= 4; i++) {
        ctx.globalAlpha = 0.3 / i;
        ctx.beginPath();
        ctx.arc(-i * 12, 0, 18 - i * 2, 0, 7);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    if (q.id === "freeze") {
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3 + q.age);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(23, 0);
        ctx.moveTo(13, 0);
        ctx.lineTo(18, 7);
        ctx.moveTo(13, 0);
        ctx.lineTo(18, -7);
        ctx.stroke();
        ctx.restore();
      }
    } else if (q.id === "inflate") {
      ctx.fillStyle = "#c78fff44";
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, 7);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-5, -4, 9, 3.4, 5);
      ctx.stroke();
    } else {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(
          -i * 5,
          Math.sin(q.age * 10 + i) * 3,
          22 - i * 4,
          9 + i * 3,
          -q.age * 5,
          0,
          Math.PI * 1.65,
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
function drawSkillEffects() {
  for (const w of skillWaves) {
    const progress = 1 - w.life / w.total;
    ctx.save();
    ctx.globalAlpha = Math.min(1, w.life * 3);
    ctx.strokeStyle = w.color;
    ctx.lineWidth = 3;
    if (saved.effects !== false && !reducedMotion.matches) {
      ctx.beginPath();
      ctx.ellipse(w.x, w.y, 12 + progress * 65, 8 + progress * 40, 0, 0, 7);
      ctx.stroke();
    }
    if (w.label) {
      ctx.font = "900 14px Arial";
      ctx.textAlign = "center";
      const width = ctx.measureText(w.label).width + 24;
      ctx.fillStyle = "#071b30ed";
      const labelY = Math.max(90, w.y - 135);
      rounded(ctx, w.x - width / 2, labelY, width, 27, 6);
      ctx.fillStyle = w.color;
      ctx.fillText(w.label, w.x, labelY + 19);
    }
    ctx.restore();
  }
}
