"use strict";
let worldTab = 0;
let worldTableStage414 = "";
function shuffled(a) {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function saveWorld() {
  saved.world = world;
  save();
}
function initWorld(team = saved.nation) {
  const others = shuffled(
    NATIONS.filter((t) => t.id !== team).map((t) => t.id),
  );
  const ids = [team, ...others];
  world = {
    team,
    phase: "group",
    day: 0,
    groups: Array.from({ length: 8 }, (_, i) =>
      ids
        .slice(i * 4, i * 4 + 4)
        .map((id) => ({ id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 })),
    ),
    status: "active",
    history: [],
    knockRound: 0,
    rounds: [],
    champion: null,
  };
  saved.nation = team;
  worldTab = 0;
  worldTableStage414 = "";
  saveWorld();
}
function rankGroup(rows) {
  return [...rows].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.gf - b.ga - (a.gf - a.ga) ||
      b.gf - a.gf ||
      a.id.localeCompare(b.id),
  );
}
function groupSchedule(day) {
  return [
    [
      [0, 1],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 3],
    ],
    [
      [0, 3],
      [1, 2],
    ],
  ][day];
}
function currentWorldFixture() {
  if (!world || world.status !== "active") return null;
  if (world.phase === "group") {
    const g = world.groups[0];
    const pair = groupSchedule(world.day).find(
      ([a, b]) => g[a].id === world.team || g[b].id === world.team,
    );
    return { a: g[pair[0]].id, b: g[pair[1]].id };
  }
  return world.rounds[world.knockRound].find(
    (f) => f.a === world.team || f.b === world.team,
  );
}
function currentWorldOpponent() {
  const f = currentWorldFixture();
  return f ? (f.a === world.team ? f.b : f.a) : "BR";
}
function simulatedScore(drawAllowed = true) {
  let a = Math.floor(Math.random() * 5),
    b = Math.floor(Math.random() * 5);
  if (!drawAllowed && a === b) {
    if (Math.random() > 0.5) a++;
    else b++;
  }
  return [a, b];
}
function recordGroup(g, a, b, s) {
  const x = g.find((t) => t.id === a),
    y = g.find((t) => t.id === b);
  x.p++;
  y.p++;
  x.gf += s[0];
  x.ga += s[1];
  y.gf += s[1];
  y.ga += s[0];
  if (s[0] > s[1]) {
    x.w++;
    y.l++;
    x.pts += 3;
  } else if (s[0] < s[1]) {
    y.w++;
    x.l++;
    y.pts += 3;
  } else {
    x.d++;
    y.d++;
    x.pts++;
    y.pts++;
  }
}
function advanceWorld(result) {
  if (!world || world.status !== "active") return "active";
  const f = currentWorldFixture(),
    opp = currentWorldOpponent();
  world.history.push({
    phase: world.phase,
    stage:
      world.phase === "group"
        ? "GROUP " + (world.day + 1)
        : WC_ROUNDS[world.knockRound],
    opponent: opp,
    score: result,
  });
  if (world.phase === "group") {
    for (let gi = 0; gi < 8; gi++) {
      const g = world.groups[gi];
      for (const [a, b] of groupSchedule(world.day)) {
        const aa = g[a].id,
          bb = g[b].id;
        const own = aa === world.team || bb === world.team;
        const s = own
          ? aa === world.team
            ? result
            : [result[1], result[0]]
          : simulatedScore(true);
        recordGroup(g, aa, bb, s);
      }
    }
    world.day++;
    if (world.day >= 3) {
      const qualifiers = world.groups.map((g) =>
        rankGroup(g)
          .slice(0, 2)
          .map((t) => t.id),
      );
      if (!qualifiers[0].includes(world.team)) {
        world.status = "eliminated";
        saveWorld();
        return "eliminated";
      }
      const q = qualifiers;
      const pairs = [
        [q[0][0], q[1][1]],
        [q[2][0], q[3][1]],
        [q[4][0], q[5][1]],
        [q[6][0], q[7][1]],
        [q[1][0], q[0][1]],
        [q[3][0], q[2][1]],
        [q[5][0], q[4][1]],
        [q[7][0], q[6][1]],
      ];
      world.phase = "knockout";
      world.knockRound = 0;
      worldTab = 0;
      world.rounds = [
        pairs.map(([a, b]) => ({ a, b, score: null, winner: null })),
      ];
      toast("Lolos ke 16 besar!", "🏆");
    }
  } else {
    const fixtures = world.rounds[world.knockRound];
    for (const m of fixtures) {
      const own = m.a === world.team || m.b === world.team;
      m.score = own
        ? m.a === world.team
          ? result
          : [result[1], result[0]]
        : simulatedScore(false);
      m.winner = m.score[0] > m.score[1] ? m.a : m.b;
    }
    if (result[0] < result[1]) {
      world.status = "eliminated";
      saveWorld();
      return "eliminated";
    }
    if (world.knockRound === 3) {
      world.status = "champion";
      world.champion = world.team;
      saveWorld();
      return "champion";
    }
    const winners = fixtures.map((m) => m.winner);
    world.rounds.push(
      Array.from({ length: winners.length / 2 }, (_, i) => ({
        a: winners[i * 2],
        b: winners[i * 2 + 1],
        score: null,
        winner: null,
      })),
    );
    world.knockRound++;
    worldTab = world.knockRound;
    toast("Lolos " + WC_ROUNDS[world.knockRound].toLowerCase(), "🏆");
  }
  saveWorld();
  return "active";
}
function showWorldSetup() {
  state = "menu";
  let picked = saved.nation;
  renderPage(
    "world-setup",
    heading(
      "32 NATIONS / WORLD CUP",
      "Pilih negaramu.",
      "",
      `<span class="pill">GROUPS → FINAL</span>`,
    ) +
      `<div class="nation-grid">${NATIONS.map((t) => `<button data-nation="${t.id}" class="nation-card ${picked === t.id ? "selected" : ""}"><span class="flag">${flagMarkup(t.id)}</span><strong>${t.id}</strong><span class="nation-name">${t.name}</span></button>`).join("")}</div><div class="bottom-action"><span id="chosenNation" class="subtle">${flagMarkup(picked)} ${nation(picked).name}</span><button class="primary" id="createWorld">MULAI PIALA DUNIA →</button></div>`,
  );
  $$("[data-nation]").forEach(
    (b) =>
      (b.onclick = () => {
        picked = b.dataset.nation;
        $$("[data-nation]").forEach((x) =>
          x.classList.toggle("selected", x.dataset.nation === picked),
        );
        $("#chosenNation").innerHTML =
          flagMarkup(picked) + " " + esc(nation(picked).name);
        beep(550, 0.04, "sine", 0.06);
      }),
  );
  $("#createWorld").onclick = () => {
    initWorld(picked);
    showWorldHub();
  };
}
function worldTable() {
  const rows = rankGroup(world.groups[worldTab]);
  return `<div class="group-tabs">${world.groups.map((g, i) => `<button data-group="${i}" class="${worldTab === i ? "active" : ""}">${String.fromCharCode(65 + i)}</button>`).join("")}</div><div class="standings"><table><thead><tr><th>#</th><th>NEGARA</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>PTS</th></tr></thead><tbody>${rows.map((t, i) => `<tr class="${t.id === world.team ? "your-team" : ""}"><td>${i + 1}</td><td><span class="flag">${flagMarkup(t.id)}</span> ${nation(t.id).name}${t.id === world.team ? "<i>YOU</i>" : ""}</td><td>${t.p}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td><td>${t.gf - t.ga}</td><td><b>${t.pts}</b></td></tr>`).join("")}</tbody></table></div>`;
}
function knockoutView() {
  return `<div class="knockout-tabs">${WC_ROUNDS.map((s, i) => `<button data-ko="${i}" ${!world.rounds[i] ? "disabled" : ""} class="${worldTab === i ? "active" : ""}">${s}</button>`).join("")}</div><div class="knockout-list">${(world.rounds[worldTab] || []).map((f) => `<div class="knockout-match ${f.a === world.team || f.b === world.team ? "own" : ""}"><span>${flagMarkup(f.a)} ${nation(f.a).name}</span><b>${f.score ? f.score.join(" : ") : "VS"}</b><span>${nation(f.b).name} ${flagMarkup(f.b)}</span></div>`).join("")}</div>`;
}
function showWorldHub() {
  state = "menu";
  if (!world) {
    showWorldSetup();
    return;
  }
  if (world.status === "champion") {
    renderPage(
      "world-champion",
      `<div class="champion-screen"><div class="champion-trophy">🏆</div><p class="eyebrow">WORLD CUP WINNER</p><h1>${flagMarkup(world.team)} ${nation(world.team).name.toUpperCase()}</h1><div class="champion-record">${world.history.map((h) => `<span class="${h.score[0] > h.score[1] ? "win" : h.score[0] === h.score[1] ? "draw" : "loss"}">${h.score.join("–")}</span>`).join("")}</div><div class="champion-actions"><button class="primary" id="newWorld">PIALA DUNIA BARU →</button><button id="championHome">MENU UTAMA</button></div></div>`,
    );
    $("#newWorld").onclick = showWorldSetup;
    $("#championHome").onclick = showHome;
    return;
  }
  // Follow a newly reached stage, while keeping manual history tabs usable.
  const tableStage = world.team + ":" + world.phase + ":" + (world.phase === "group" ? world.day : world.knockRound);
  if (worldTableStage414 !== tableStage) {
    worldTab = world.phase === "group" ? 0 : world.knockRound;
    worldTableStage414 = tableStage;
  }
  const eliminated = world.status === "eliminated";
  if (world.phase === "group") worldTab = Math.min(7, worldTab);
  else worldTab = Math.min(world.knockRound, worldTab);
  const opp = eliminated ? null : nation(currentWorldOpponent()),
    stage =
      world.phase === "group"
        ? "GROUP A / MATCHDAY " + (world.day + 1)
        : WC_ROUNDS[world.knockRound];
  renderPage(
    "world",
    heading(
      "WORLD CUP / " + nation(world.team).id,
      eliminated ? "Perjalanan berakhir." : stage,
      "",
      `<span class="pill">● 1.500 BONUS JUARA</span>`,
    ) +
      `<div class="world-layout"><div class="world-main">${world.phase === "group" ? worldTable() : knockoutView()}</div><aside class="world-next">${eliminated ? '<div class="next-icon">⚔</div><h2>ELIMINATED</h2>' : `<span class="page-label">NEXT MATCH</span><div class="next-flags">${flagMarkup(world.team)}<small>VS</small>${flagMarkup(opp.id)}</div><h2>${nation(world.team).id} <span>×</span> ${opp.id}</h2><p>${opp.name}</p>`}<div class="journey-dots">${Array.from({ length: 7 }, (_, i) => `<i class="${i < world.history.length ? "done" : ""}"></i>`).join("")}</div><button class="primary" id="playWorld">${eliminated ? "COBA LAGI →" : "KICK OFF →"}</button><button id="newWorld" class="ghost">TURNAMEN BARU</button></aside></div><div class="world-history">${world.history.map((h) => `<span class="history-chip ${h.score[0] > h.score[1] ? "win" : h.score[0] === h.score[1] ? "draw" : "loss"}">${nation(h.opponent).id} <b>${h.score.join(" : ")}</b></span>`).join("")}</div>`,
  );
  $$("[data-group]").forEach(
    (b) =>
      (b.onclick = () => {
        worldTab = Number(b.dataset.group);
        showWorldHub();
      }),
  );
  $$("[data-ko]").forEach(
    (b) =>
      (b.onclick = () => {
        worldTab = Number(b.dataset.ko);
        showWorldHub();
      }),
  );
  $("#playWorld").onclick = () => {
    if (eliminated) {
      showWorldSetup();
      return;
    }
    mode = "world";
    startMatch();
  };
  $("#newWorld").onclick = () => {
    const b = $("#newWorld");
    if (b.dataset.confirm === "yes") {
      showWorldSetup();
      return;
    }
    b.dataset.confirm = "yes";
    b.textContent = "KONFIRMASI RESET?";
  };
}
