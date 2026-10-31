"use strict";
// 3.2 — illustrated cleats, a persistent local loadout, explicit OP bonuses, local flag assets.
const BOOTS = [
  {
    id: "boot-street",
    sprite: "street",
    name: "Aero Classic",
    rarity: "STARTER",
    price: 0,
    color: "#85dafa",
    shot: 1,
    speed: 1,
    jump: 1,
    reach: 1,
    cooldown: 0.3,
    info: "Sepatu standar dengan kontrol seimbang.",
  },
  {
    id: "boot-velocity",
    sprite: "velocity",
    name: "Velocity R",
    rarity: "RARE",
    price: 950,
    color: "#ff7c83",
    shot: 1.22,
    speed: 1.1,
    jump: 1.05,
    reach: 1.08,
    cooldown: 0.25,
    info: "Ringan dan agresif. Lebih cepat mengejar bola, lebih keras menembak.",
  },
  {
    id: "boot-phantom",
    sprite: "phantom",
    name: "Phantom X",
    rarity: "EPIC",
    price: 2400,
    color: "#6debe6",
    shot: 1.45,
    speed: 1.18,
    jump: 1.1,
    reach: 1.15,
    cooldown: 0.2,
    info: "Power boot hitam–cyan. Jangkauan panjang dan respons tendangan cepat.",
  },
  {
    id: "boot-prism",
    sprite: "prism",
    name: "Prism Overlord",
    rarity: "LEGENDARY · OP",
    price: 12000,
    color: "#d1a0ff",
    shot: 1.9,
    speed: 1.35,
    jump: 1.25,
    reach: 1.44,
    cooldown: 0.13,
    info: "Lapisan prisma violet, aura premium, dan respons tendangan tinggi.",
  },
];
const BOOT_COLORS = [
  ["violet", "Violet", "#b684f8"],
  ["blue", "Biru", "#69c5ff"],
  ["red", "Merah", "#ff6079"],
  ["mint", "Mint", "#56edbc"],
  ["gold", "Emas", "#ffd276"],
  [
    "cycle",
    "Auto warna",
    "linear-gradient(135deg,#f885b0,#a58bff,#58dfca,#ffe597)",
  ],
];
const bootImages = {};
saved.boot ??= "boot-street";
saved.bootColor ??= "violet";
saved.infinityColor ??= "cycle";
saved.owned = [...new Set([...saved.owned, "boot-street"])];
function flagMarkup(id, cls = "") {
  const t = nation(id);
  return `<img class="flag-image ${cls}" src="assets/flags/${t.id.toLowerCase()}.png" alt="Bendera ${esc(t.name)}" width="48" height="32" loading="eager">`;
}
function bootOwned(id) {
  return id === "boot-street" || saved.owned.includes(id);
}
function bootEnabled(id) {
  return id === "boot-street" || managedConfig?.shop?.[id]?.enabled !== false;
}
saved.playerBoots ??= { [String(selectedFace)]: saved.boot || 'boot-street' };
function selectedBoot() {
  return (
    BOOTS.find(
      (b) => b.id === saved.playerBoots[String(selectedFace)] && bootOwned(b.id) && bootEnabled(b.id),
    ) || BOOTS[0]
  );
}
function bootFor(p) {
  if (p.side !== 0 || p.neutralBoot || (p.preview && p.character !== selectedFace)) return BOOTS[0];
  const id = saved.playerBoots[String(p.character ?? selectedFace)];
  return BOOTS.find(b => b.id === id && bootOwned(id) && bootEnabled(id)) || BOOTS[0];
}
function ballSpeedLimit() {
  return ball.lastTouch === 0 && selectedBoot().id === "boot-prism"
    ? 1950
    : 1250;
}
function bootPrice(b) {
  return b.id === "boot-street"
    ? 0
    : (managedConfig?.shop?.[b.id]?.price ?? b.price);
}
function bootFile(b, color = b.id === "boot-infinity" ? saved.infinityColor : saved.bootColor) {
  return (
    "assets/boots/" +
    b.sprite +
    (b.id === "boot-infinity" && canBootColor416(b) && color !== "violet" && color !== "cycle"
      ? "-" + color
      : "") +
    ".png"
  );
}
async function loadBootImages() {
  const sources = [
    ...BOOTS.map((b) => [b.sprite, bootFile(b, "violet")]),
    ...BOOT_COLORS.filter(([c]) => !["violet", "cycle"].includes(c)).map(
      ([c]) => ["prism-" + c, bootFile(BOOTS[3], c)],
    ),
  ];
  for(const [color] of BOOT_COLORS)if(!["violet","cycle"].includes(color))sources.push(["infinity49-"+color,"assets/boots/infinity49-"+color+".png"]);
  if(!BOOT_COLORS.some(([c])=>c===saved.infinityColor))saved.infinityColor="cycle";
  await Promise.all(
    sources.map(
      ([key, src]) =>
        new Promise((resolve, reject) => {
          const im = new Image();
          im.onload = () => {
            bootImages[key] = im;
            resolve();
          };
          im.onerror = () =>
            reject(Error("Aset sepatu tidak tersedia: " + src));
          im.src = src;
        }),
    ),
  );
  if (!BOOT_COLORS.some(([c]) => c === saved.bootColor))
    saved.bootColor = "violet";
  if (!bootOwned(saved.boot) || !bootEnabled(saved.boot))
    saved.boot = "boot-street";
}
function bootFrame(b) {
  if (!canBootColor416(b))
    return { a: bootImages[b.sprite], b: null, mix: 0 };
  const c = b.id === "boot-infinity" ? saved.infinityColor : saved.bootColor, sprite=b.sprite;
  if (c !== "cycle" || reducedMotion.matches || saved.effects === false)
    return {
      a: bootImages[c === "violet" || c === "cycle" ? sprite : sprite+"-" + c],
      b: null,
      mix: 0,
    };
  const colors = [
      sprite, sprite+"-blue", sprite+"-red", sprite+"-mint", sprite+"-gold",
    ],
    t = simTime * (b.id === "boot-infinity" ? .85 : .65),
    i = Math.floor(t) % colors.length;
  return {
    a: bootImages[colors[i]],
    b: bootImages[colors[(i + 1) % colors.length]],
    mix: (1-Math.cos((t-Math.floor(t))*Math.PI))/2,
  };
}
function drawLegs(c, p, skin) {
  const b = bootFor(p),
    frame = bootFrame(b),
    walk = Math.sin(simTime * 16) * Math.min(1, Math.abs(p.vx) / 250) * 0.5,
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
    c.scale(p.face < 0 ? -1 : 1, 1);
    const w = 46, x = -14, h = 22;
    if (frame.a) {
      c.drawImage(frame.a, x, -17, w, h);
      if (frame.b) {
        c.globalAlpha = frame.mix;
        c.drawImage(frame.b, x, -17, w, h);
        c.globalAlpha = 1;
      }
    }
    if (
      b.id === "boot-infinity" &&
      saved.effects !== false &&
      !reducedMotion.matches
    ) {
      c.strokeStyle = BOOT_COLORS[Math.floor(simTime * 0.65) % 5][2];
      c.lineWidth = 1;
      c.globalAlpha = 0.7;
      c.beginPath();
      c.moveTo(x + 5, 8);
      c.lineTo(x + w - 4, 8);
      c.stroke();
      c.globalAlpha = 1;
    }
    c.restore();
  }
}
function bootStatRows(b) {
  return [
    ["SHOT", b.shot],
    ["SPEED", b.speed],
    ["JUMP", b.jump],
    ["REACH", b.reach],
  ]
    .map(
      ([k, v]) =>
        `<span><small>${k}</small><b>${v === 1 ? "BASE" : "+" + Math.round((v - 1) * 100) + "%"}</b></span>`,
    )
    .join("");
}
function showShop() {
  state = "menu";
  if (!["boot", "ball", "gear", "skill"].includes(shopTab)) shopTab = "boot";
  const equipped = selectedBoot(),
    bootTab = shopTab === "boot",
    ownedLegend = bootOwned("boot-prism");
  renderPage(
    "shop",
    heading(
      "",
      "Locker & shop",
      "Koleksi perlengkapan dan peningkatan performa.",
    ) +
      `<div class="shop-tabs">${[
        ["boot", "SEPATU"],
        ["ball", "BOLA"],
        ["gear", "AKSESORI"],
        ["skill", "SKILL"],
      ]
        .map(
          ([id, t]) =>
            `<button class="${shopTab === id ? "active" : ""}" data-tab="${id}">${t}</button>`,
        )
        .join("")}</div>${
        bootTab
          ? `<section class="equipped-strip"><img src="${bootFile(equipped)}" class="${canBootColor416(equipped) && (equipped.id === "boot-infinity" ? saved.infinityColor : saved.bootColor) === "cycle" ? "color-cycle" : ""}" alt="${esc(equipped.name)}"><div><small>LOADOUT PEMAINMU</small><strong>${esc(equipped.name)}</strong><span>${equipped.rarity} · Khusus ${esc(ownName())}</span></div><span class="equipped-check">TERPASANG ✓</span></section><div class="boot-grid">${BOOTS.filter(
              (b) => bootEnabled(b.id),
            ).sort((a,b)=>bootPrice(a)-bootPrice(b))
              .map((b) => {
                const own = bootOwned(b.id),
                  eq = equipped.id === b.id,
                  legend = ["boot-prism","boot-infinity"].includes(b.id);
                return `<article class="boot-card ${legend ? "legendary-boot" : ""}" style="--boot-accent:${b.color}"><div class="boot-card-top"><span>${b.rarity}</span><small>${eq ? "EQUIPPED" : own ? "OWNED" : "UNLOCK"}</small></div><div class="boot-art"><span class="boot-art-orbit"></span><img src="${bootFile(b)}" class="${canBootColor416(b) && (b.id === "boot-infinity" ? saved.infinityColor : saved.bootColor) === "cycle" ? "color-cycle" : ""}" alt="Sepatu ${esc(b.name)}"></div><h2>${b.name}</h2><p>${b.info}</p><div class="boot-stats">${bootStatRows(b)}</div><div class="boot-timing"><span>Jeda tembakan</span><b>${Math.max(.09,b.cooldown*.86).toFixed(2)} detik</b></div><button class="${eq ? "outline" : "primary"}" data-buy-boot="${b.id}" ${eq ? "disabled" : ""}>${eq ? "Terpasang ✓" : own ? "Pakai sepatu →" : "● " + bootPrice(b).toLocaleString("id-ID") + " · Beli & pakai"}</button></article>`;
              })
              .join(
                "",
              )}</div><section class="prism-customizer"></section><p class="boot-shop-note">Aero Classic selalu gratis. Pembelian dan loadout disimpan di browser ini, seperti progres game lainnya.</p>`
          : `<div class="shop-grid">${catalog
              .filter(
                (x) =>
                  x.type === shopTab &&
                  managedConfig?.shop?.[x.id]?.enabled !== false,
              )
              .sort((a,b)=>a.price-b.price)
              .map((x) => {
                const own = saved.owned.includes(x.id),
                  eq = saved[x.type] === x.id;
                return `<article class="product" style="--accent:${x.color}"><div class="art">${productArt(x)}</div><h3>${esc(x.name)}</h3><button class="${eq ? "outline" : "primary"}" data-buy="${x.id}" ${eq ? "disabled" : ""}>${eq ? "Terpasang" : own ? "Pakai" : "● " + x.price.toLocaleString("id-ID")}</button></article>`;
              })
              .join("")}</div>`
      }`,
  );
  $$("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        shopTab = b.dataset.tab;
        showShop();
      }),
  );
  $$("[data-buy-boot]").forEach(
    (el) =>
      (el.onclick = () => {
        const b = BOOTS.find((b) => b.id === el.dataset.buyBoot);
        if (!b || !bootEnabled(b.id)) return;
        if (!bootOwned(b.id)) {
          const price = bootPrice(b);
          if (saved.coins < price) {
            toast(
              "Koin belum cukup. Menangkan laga untuk membuka sepatu.",
              "!",
            );
            return;
          }
          saved.coins -= price;
          saved.owned.push(b.id);
        }
        saved.boot = b.id;
      saved.playerBoots[String(selectedFace)] = b.id;
        save();
        showShop();
        toast(b.name + " terpasang", "✓");
      }),
  );
  $$("[data-boot-color]").forEach(
    (el) =>
      (el.onclick = () => {
        if (!bootOwned("boot-prism")) return;
        saved.bootColor = el.dataset.bootColor;
        save();
        showShop();
        toast(
          "Warna sepatu: " +
            BOOT_COLORS.find(([id]) => id === saved.bootColor)[1],
        );
      }),
  );
  $$("[data-buy]").forEach(
    (el) =>
      (el.onclick = () => {
        const x = catalog.find((x) => x.id === el.dataset.buy);
        if (!x || managedConfig?.shop?.[x.id]?.enabled === false) return;
        if (!saved.owned.includes(x.id)) {
          if (saved.coins < x.price) {
            toast("Koin belum cukup", "!");
            return;
          }
          saved.coins -= x.price;
          saved.owned.push(x.id);
        }
        saved[x.type] = x.id;
        save();
        showShop();
        toast(x.name + " terpasang");
      }),
  );
}
