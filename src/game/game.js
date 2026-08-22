// ============================================================================
// BRENDON'S WORLD — a Dangerous-Dave-style portfolio platformer.
// 100% vanilla JS + <canvas>. All pixels original, drawn in code.
// ============================================================================

"use strict";

// ---- constants -------------------------------------------------------------

const TILE = 16;
const ROWS = 13; // playfield rows (below the HUD)
const HUD_H = 24;
const VIEW_W = 320;
const VIEW_H = HUD_H + ROWS * TILE; // 232

const GRAVITY = 0.32;
const JUMP_V = -5.9;
const RUN_V = 1.4;
const MAX_FALL = 6;

const SOLID = new Set(["#", "="]);
const DEADLY = new Set(["S", "F"]);

// pickup tile -> loot id (loot ids match data-loot in the HTML panel)
const LOOT_TILES = {
  H: "thesis",
  P: "pbc",
  G: "cemta",
  J: "jokes",
  B: "slang",
  N: "nycu",
  R: "resume",
};

const LOOT_NAMES = {
  thesis: "\u{1F4DC} SECRET THESIS FOUND! (password protected, obviously)",
  pbc: "\u{1F437} PBC UNLOCKED! AI & Engineering Lead — builder of Cortex",
  cemta: "\u{1F35C} CEMTA CARTRIDGE COLLECTED! Menus, translated",
  jokes: "\u{1F602} JOKE GENERATOR 3000 CARTRIDGE COLLECTED!",
  slang: "\u{1F4AC} SLANG TRANSLATOR CARTRIDGE COLLECTED! Aweh!",
  nycu: "\u{1F393} NYCU STUDENT CARD FOUND! M.S. EECS, expected 2028",
  resume: "\u{1F4C4} THE LEGENDARY RESUME IS YOURS!",
};

// ---- level definitions -----------------------------------------------------
// Built programmatically so the geometry is always consistent.
// put(row, colStart, colEnd, char) paints a run of tiles.

function makeLevel(def) {
  const grid = Array.from({ length: ROWS }, () => Array(def.width).fill("."));
  const put = (row, c0, c1, ch) => {
    for (let c = c0; c <= c1; c++) grid[row][c] = ch;
  };
  def.build(put);
  return { name: def.name, sub: def.sub, width: def.width, theme: def.theme, grid };
}

const LEVELS = [
  makeLevel({
    name: "CAPE TOWN",
    sub: "where it all began · sniff out the hidden thesis",
    width: 60,
    theme: { sky1: "#2a1a3e", sky2: "#c2452e", hill: "#1a1028" },
    build(put) {
      put(12, 0, 21, "#");
      put(12, 25, 37, "#");
      put(12, 41, 59, "#"); // ground with two pits
      put(11, 1, 1, "@");
      put(11, 5, 7, "C");
      put(10, 10, 13, "=");
      put(9, 11, 12, "C");
      put(8, 15, 18, "=");
      put(7, 16, 16, "T");
      put(6, 20, 22, "=");
      put(5, 21, 21, "C");
      put(4, 25, 27, "=");
      put(3, 26, 26, "H"); // the thesis, hidden up high
      put(10, 28, 28, "C");
      put(10, 30, 30, "C");
      put(11, 34, 34, "F");
      put(11, 44, 45, "S");
      put(11, 49, 49, "E");
      put(10, 54, 54, "C");
      put(11, 57, 57, "D");
    },
  }),
  makeLevel({
    name: "PBC HQ",
    sub: "day job: ship Cortex · find the pork belly pig",
    width: 60,
    theme: { sky1: "#2e1230", sky2: "#8a2e4a", hill: "#20101f" },
    build(put) {
      put(12, 0, 14, "#");
      put(12, 18, 29, "#");
      put(12, 33, 44, "#");
      put(12, 48, 59, "#"); // three pits
      put(11, 1, 1, "@");
      put(11, 4, 5, "C");
      put(10, 8, 10, "=");
      put(8, 12, 14, "=");
      put(7, 13, 13, "C");
      put(6, 17, 19, "=");
      put(5, 18, 18, "P"); // the pig itself
      put(10, 20, 20, "C");
      put(11, 26, 27, "F");
      put(10, 31, 31, "C"); // floats over the pit, grab mid-jump
      put(9, 34, 36, "=");
      put(8, 35, 35, "T");
      put(10, 38, 40, "=");
      put(10, 43, 43, "C");
      put(11, 50, 51, "S");
      put(11, 54, 54, "E");
      put(11, 57, 57, "D");
    },
  }),
  makeLevel({
    name: "PROJECT VAULT",
    sub: "three cartridges · three real projects",
    width: 60,
    theme: { sky1: "#0f1e38", sky2: "#1f4a6e", hill: "#0a1626" },
    build(put) {
      put(12, 0, 11, "#");
      put(12, 15, 26, "#");
      put(12, 30, 41, "#");
      put(12, 45, 59, "#"); // three pits
      put(11, 1, 1, "@");
      put(11, 4, 5, "C");
      put(10, 6, 8, "=");
      put(8, 9, 11, "=");
      put(7, 10, 10, "G"); // CEMTA cartridge
      put(9, 13, 13, "C"); // over pit one
      put(10, 17, 18, "=");
      put(8, 20, 22, "=");
      put(7, 21, 21, "J"); // Joke Generator cartridge
      put(6, 24, 26, "=");
      put(5, 25, 25, "T");
      put(10, 28, 28, "C"); // over pit two
      put(10, 32, 33, "=");
      put(8, 35, 37, "=");
      put(7, 36, 36, "B"); // Slang Translator cartridge
      put(11, 39, 40, "F");
      put(10, 43, 43, "C"); // over pit three
      put(11, 47, 48, "S");
      put(11, 52, 52, "E");
      put(11, 57, 57, "D");
    },
  }),
  makeLevel({
    name: "NYCU NIGHT SCHOOL",
    sub: "final exam · grab the legendary resume",
    width: 60,
    theme: { sky1: "#090914", sky2: "#20174a", hill: "#0c0a1c" },
    build(put) {
      put(12, 0, 9, "#");
      put(12, 13, 23, "#");
      put(12, 27, 37, "#");
      put(12, 41, 49, "#");
      put(12, 53, 59, "#"); // four pits
      put(11, 1, 1, "@");
      put(10, 5, 7, "=");
      put(9, 6, 6, "C");
      put(9, 11, 11, "C"); // over pit one
      put(10, 15, 16, "=");
      put(8, 18, 20, "=");
      put(7, 19, 19, "N"); // NYCU student card
      put(11, 21, 22, "F");
      put(9, 25, 25, "C"); // over pit two
      put(10, 29, 30, "=");
      put(8, 32, 34, "=");
      put(7, 33, 33, "R"); // THE RESUME
      put(11, 31, 31, "E");
      put(11, 36, 37, "S");
      put(9, 39, 39, "C"); // over pit three
      put(10, 43, 44, "=");
      put(8, 46, 48, "=");
      put(7, 47, 47, "T");
      put(9, 51, 51, "C"); // over pit four
      put(11, 55, 55, "E");
      put(11, 58, 58, "D");
    },
  }),
];

// ---- pixel-art sprites -----------------------------------------------------

function buildSprite(rows, palette) {
  const w = rows[0].length;
  const h = rows.length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = palette[row[x]];
      if (col) {
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
  });
  return c;
}

const PLAYER_PAL = {
  c: "#2fae2f", // cap
  s: "#f0c8a0", // skin
  k: "#1a1a1a", // eyes / shoes
  g: "#3ecf3e", // shirt
  b: "#2456c8", // pants
};

const PLAYER_BODY = [
  "...cccccc...",
  "..cccccccc..",
  "..ssssssss..",
  "..sskssks...",
  "..ssssssss..",
  "...ssssss...",
  "..gggggggg..",
  ".gggggggggg.",
  ".gggggggggg.",
  ".sggggggggs.",
  "..gggggggg..",
];

const PLAYER_LEGS = {
  idle: ["..bbbbbbbb..", "..bbb..bbb..", "..bbb..bbb..", "..bbb..bbb..", ".kkkk..kkkk."],
  run1: ["..bbbbbbbb..", ".bbb...bbb..", ".bb.....bb..", "kkk......kkk", "............"],
  run2: ["..bbbbbbbb..", "..bbb.bbb...", "..bb...bb...", "..kk...kk...", "............"],
  jump: ["..bbbbbbbb..", ".bbb....bbb.", ".kk......kk.", "............", "............"],
};

const PLAYER_SPRITES = {};
for (const [pose, legs] of Object.entries(PLAYER_LEGS)) {
  PLAYER_SPRITES[pose] = buildSprite(PLAYER_BODY.concat(legs), PLAYER_PAL);
}

const ENEMY_PAL = { m: "#9aa4b8", d: "#5a6478", r: "#e83030", k: "#20242e" };
const ENEMY_FRAMES = [
  buildSprite(
    [
      "...mmmmmmmm...",
      "..mmmmmmmmmm..",
      "..mrrmmmmrrm..",
      "..mmmmmmmmmm..",
      "...dddddddd...",
      "....dkkkkd....",
      "...mmmmmmmm...",
      "..mmmmmmmmmm..",
      ".kk........kk.",
      ".kk........kk.",
    ],
    ENEMY_PAL
  ),
  buildSprite(
    [
      "...mmmmmmmm...",
      "..mmmmmmmmmm..",
      "..mrrmmmmrrm..",
      "..mmmmmmmmmm..",
      "...dddddddd...",
      "....dkkkkd....",
      "...mmmmmmmm...",
      "..mmmmmmmmmm..",
      "..kk......kk..",
      "..kk......kk..",
    ],
    ENEMY_PAL
  ),
];

// ---- audio (8-bit style, Web Audio, zero assets) ---------------------------

const audio = {
  ctx: null,
  muted: localStorage.getItem("bw-muted") === "1",
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },
  blip(freq, dur = 0.08, type = "square", vol = 0.08, slideTo = null) {
    if (this.muted || !this.ensure()) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },
  tune(notes, step = 0.09, type = "square", vol = 0.07) {
    if (this.muted || !this.ensure()) return;
    notes.forEach((f, i) => {
      setTimeout(() => this.blip(f, step * 0.95, type, vol), i * step * 1000);
    });
  },
  jump() {
    this.blip(200, 0.12, "square", 0.06, 500);
  },
  coin() {
    this.tune([988, 1319], 0.06);
  },
  pickup() {
    this.tune([659, 880, 1109, 1319], 0.07);
  },
  trophy() {
    this.tune([523, 659, 784, 1047, 1319], 0.09);
  },
  door() {
    this.tune([392, 494, 587, 784], 0.1, "triangle", 0.1);
  },
  death() {
    this.blip(300, 0.5, "sawtooth", 0.08, 60);
  },
  win() {
    this.tune([523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.12);
  },

  // ---- background music: a looping Am–F–C–G chiptune, sequenced live ------
  MUSIC_STEP: 0.145, // seconds per 8th note (~103 BPM)
  MELODY: [
    440, 523, 659, 523, 440, 523, 659, 784, // Am
    349, 440, 523, 440, 349, 440, 523, 659, // F
    523, 659, 784, 659, 523, 659, 784, 988, // C
    392, 494, 587, 494, 392, 494, 587, 698, // G
  ],
  BASS: [
    110, 0, 110, 0, 110, 0, 110, 0, // A2
    87.31, 0, 87.31, 0, 87.31, 0, 87.31, 0, // F2
    130.81, 0, 130.81, 0, 130.81, 0, 130.81, 0, // C3
    98, 0, 98, 0, 98, 0, 98, 0, // G2
  ],
  musicTimer: null,
  musicStep: 0,
  musicNextTime: 0,
  note(freq, when, dur, type, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(vol, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  },
  startMusic() {
    if (this.musicTimer || !this.ensure()) return;
    this.musicNextTime = this.ctx.currentTime + 0.1;
    this.musicTimer = setInterval(() => {
      // schedule a little ahead so the loop survives timer jitter
      while (this.musicNextTime < this.ctx.currentTime + 0.18) {
        const i = this.musicStep % this.MELODY.length;
        if (!this.muted) {
          if (this.MELODY[i]) this.note(this.MELODY[i], this.musicNextTime, this.MUSIC_STEP * 0.85, "square", 0.022);
          if (this.BASS[i]) this.note(this.BASS[i], this.musicNextTime, this.MUSIC_STEP * 1.7, "triangle", 0.05);
        }
        this.musicNextTime += this.MUSIC_STEP;
        this.musicStep++;
      }
    }, 60);
  },
  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
  },
};

// ---- DOM handles -----------------------------------------------------------

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const overlays = {
  title: document.getElementById("overlay-title"),
  level: document.getElementById("overlay-level"),
  pause: document.getElementById("overlay-pause"),
  win: document.getElementById("overlay-win"),
};
const toastEl = document.getElementById("toast");
const lootPanel = document.getElementById("loot-panel");

function showOverlay(name) {
  for (const [key, el] of Object.entries(overlays)) {
    el.classList.toggle("overlay--visible", key === name);
  }
}

// ---- game state ------------------------------------------------------------

const game = {
  state: "title", // title | intro | playing | paused | leveldone | dead | won
  levelIndex: 0,
  level: null,
  tiles: [],
  player: null,
  enemies: [],
  camera: 0,
  floppies: 0,
  floppyTotal: 0,
  deaths: 0,
  hasTrophy: false,
  doorFlash: 0,
  time: 0,
  timer: 0,
  loot: JSON.parse(localStorage.getItem("bw-loot") || "{}"),
};

function syncLootPanel() {
  document.querySelectorAll(".loot__item").forEach((li) => {
    li.classList.toggle("loot__item--unlocked", !!game.loot[li.dataset.loot]);
  });
}

let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("toast--show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("toast--show"), 2600);
}

function unlock(id) {
  const isNew = !game.loot[id];
  game.loot[id] = true;
  localStorage.setItem("bw-loot", JSON.stringify(game.loot));
  syncLootPanel();
  toast(isNew ? LOOT_NAMES[id] : LOOT_NAMES[id] + " (already in loot)");
  audio.pickup();
}

// ---- level lifecycle -------------------------------------------------------

function loadLevel(index) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  // deep copy of the grid so pickups can be removed per run
  game.tiles = game.level.grid.map((row) => row.slice());
  game.enemies = [];
  game.hasTrophy = false;
  game.doorFlash = 0;

  let spawn = { x: TILE, y: TILE * 11 };
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < game.level.width; c++) {
      const ch = game.tiles[r][c];
      if (ch === "@") {
        spawn = { x: c * TILE + 2, y: r * TILE + 2 };
        game.tiles[r][c] = ".";
      } else if (ch === "E") {
        game.enemies.push({ x: c * TILE + 1, y: r * TILE + 6, w: 14, h: 10, dir: -1, frame: 0 });
        game.tiles[r][c] = ".";
      }
    }
  }

  game.player = {
    x: spawn.x,
    y: spawn.y,
    w: 10,
    h: 14,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    frame: 0,
    spawn,
  };
  game.camera = 0;

  // level intro card
  document.getElementById("level-kicker").textContent = "LEVEL " + (index + 1) + " OF " + LEVELS.length;
  document.getElementById("level-name").textContent = game.level.name;
  document.getElementById("level-sub").textContent = game.level.sub;
  showOverlay("level");
  game.state = "intro";
  game.timer = 110; // ~1.8s at 60fps
}

function countFloppies() {
  let n = 0;
  for (const lvl of LEVELS) {
    for (const row of lvl.grid) {
      for (const ch of row) if (ch === "C") n++;
    }
  }
  return n;
}

function startGame() {
  game.floppies = 0;
  game.deaths = 0;
  game.floppyTotal = countFloppies();
  loadLevel(0);
  audio.startMusic();
  canvas.focus();
}

function winGame() {
  game.state = "won";
  audio.stopMusic();
  audio.win();
  const lootCount = Object.keys(game.loot).filter((k) => game.loot[k]).length;
  document.getElementById("win-stats").textContent =
    "\u{1F4BE} " + game.floppies + "/" + game.floppyTotal +
    " floppies · \u{1F480} " + game.deaths +
    " deaths · \u{1F392} " + lootCount + "/7 loot";
  showOverlay("win");
}

// ---- physics ---------------------------------------------------------------

function tileAt(px, py) {
  const c = Math.floor(px / TILE);
  const r = Math.floor(py / TILE);
  if (r < 0 || r >= ROWS) return ".";
  if (c < 0 || c >= game.level.width) return "#"; // walls at both ends
  return game.tiles[r][c];
}

function boxHitsSolid(x, y, w, h) {
  for (const [px, py] of [
    [x, y],
    [x + w - 1, y],
    [x, y + h - 1],
    [x + w - 1, y + h - 1],
    [x, y + h / 2],
    [x + w - 1, y + h / 2],
  ]) {
    if (SOLID.has(tileAt(px, py))) return true;
  }
  return false;
}

function overlappedTiles(x, y, w, h, cb) {
  const c0 = Math.floor(x / TILE);
  const c1 = Math.floor((x + w - 1) / TILE);
  const r0 = Math.floor(y / TILE);
  const r1 = Math.floor((y + h - 1) / TILE);
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < game.level.width) cb(r, c, game.tiles[r][c]);
    }
  }
}

function killPlayer() {
  if (game.state !== "playing") return;
  game.deaths++;
  game.state = "dead";
  game.timer = 40;
  audio.death();
}

function updatePlayer() {
  const p = game.player;

  const left = keys.left, right = keys.right;
  p.vx = 0;
  if (left && !right) {
    p.vx = -RUN_V;
    p.facing = -1;
  } else if (right && !left) {
    p.vx = RUN_V;
    p.facing = 1;
  }

  if (keys.jump && p.onGround) {
    p.vy = JUMP_V;
    p.onGround = false;
    audio.jump();
  }

  p.vy = Math.min(p.vy + GRAVITY, MAX_FALL);

  // horizontal
  let nx = p.x + p.vx;
  if (!boxHitsSolid(nx, p.y, p.w, p.h)) {
    p.x = nx;
  } else if (p.vx !== 0) {
    while (!boxHitsSolid(p.x + Math.sign(p.vx), p.y, p.w, p.h)) p.x += Math.sign(p.vx);
  }

  // vertical
  let ny = p.y + p.vy;
  if (!boxHitsSolid(p.x, ny, p.w, p.h)) {
    p.y = ny;
    p.onGround = false;
  } else {
    const dir = Math.sign(p.vy);
    while (!boxHitsSolid(p.x, p.y + dir, p.w, p.h)) p.y += dir;
    if (dir > 0) p.onGround = true;
    p.vy = 0;
  }

  // fell off the map
  if (p.y > ROWS * TILE + 8) {
    killPlayer();
    return;
  }

  // tile interactions (slightly shrunken hitbox for hazards = fairer)
  let touchedDoor = false;
  overlappedTiles(p.x + 2, p.y + 2, p.w - 4, p.h - 4, (r, c, ch) => {
    if (DEADLY.has(ch)) {
      killPlayer();
    } else if (ch === "C") {
      game.tiles[r][c] = ".";
      game.floppies++;
      audio.coin();
    } else if (ch === "T") {
      game.tiles[r][c] = ".";
      game.hasTrophy = true;
      game.doorFlash = 90;
      toast("\u{1F3C6} GOLD CUP! The exit door is open!");
      audio.trophy();
    } else if (LOOT_TILES[ch]) {
      game.tiles[r][c] = ".";
      unlock(LOOT_TILES[ch]);
    } else if (ch === "D") {
      touchedDoor = true;
    }
  });

  if (touchedDoor && game.hasTrophy && game.state === "playing") {
    audio.door();
    game.state = "leveldone";
    game.timer = 60;
  }

  // enemies
  for (const e of game.enemies) {
    if (
      p.x + 2 < e.x + e.w && p.x + p.w - 2 > e.x &&
      p.y + 2 < e.y + e.h && p.y + p.h - 2 > e.y
    ) {
      killPlayer();
    }
  }

  // camera
  const target = p.x + p.w / 2 - VIEW_W / 2;
  game.camera = Math.max(0, Math.min(target, game.level.width * TILE - VIEW_W));

  // animation frame
  if (!p.onGround) p.frame = 3;
  else if (p.vx !== 0) p.frame = Math.floor(game.time / 6) % 2 + 1;
  else p.frame = 0;
}

function updateEnemies() {
  for (const e of game.enemies) {
    const speed = 0.45;
    const nx = e.x + e.dir * speed;
    const footY = e.y + e.h + 1;
    const aheadX = e.dir > 0 ? nx + e.w : nx;
    const wallAhead = SOLID.has(tileAt(aheadX, e.y + e.h - 2));
    const groundAhead = SOLID.has(tileAt(aheadX, footY));
    const offMap = aheadX <= 0 || aheadX >= game.level.width * TILE;
    if (wallAhead || !groundAhead || offMap) {
      e.dir *= -1;
    } else {
      e.x = nx;
    }
    e.frame = Math.floor(game.time / 10) % 2;
  }
}

// ---- rendering -------------------------------------------------------------

function seededStars(seed, count, w, h) {
  let s = seed;
  const rand = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const stars = [];
  for (let i = 0; i < count; i++) stars.push({ x: rand() * w, y: rand() * h, b: rand() });
  return stars;
}
const STAR_FIELDS = LEVELS.map((_, i) => seededStars(1234 + i * 999, 40, 60 * TILE, ROWS * TILE * 0.6));

function drawBackground() {
  const th = game.level.theme;
  const grad = ctx.createLinearGradient(0, HUD_H, 0, VIEW_H);
  grad.addColorStop(0, th.sky1);
  grad.addColorStop(1, th.sky2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);

  // stars (slow parallax)
  ctx.fillStyle = "#e8e3f7";
  for (const st of STAR_FIELDS[game.levelIndex]) {
    const sx = Math.floor((st.x - game.camera * 0.3) % (VIEW_W + 40));
    if (sx < 0 || sx > VIEW_W) continue;
    if (st.b > 0.6) ctx.fillRect(sx, HUD_H + Math.floor(st.y), 1, 1);
  }

  // distant silhouette (Table Mountain-ish flat top, parallax)
  ctx.fillStyle = game.level.theme.hill;
  const hx = Math.floor(-game.camera * 0.15);
  for (let i = -1; i < 4; i++) {
    const bx = hx + i * 260;
    ctx.fillRect(bx + 30, VIEW_H - 60, 180, 60);
    ctx.fillRect(bx + 10, VIEW_H - 44, 20, 44);
    ctx.fillRect(bx + 210, VIEW_H - 44, 20, 44);
  }
}

function px(n) {
  return Math.floor(n);
}

function drawBrick(x, y) {
  ctx.fillStyle = "#8a4a2a";
  ctx.fillRect(x, y, TILE, TILE);
  ctx.fillStyle = "#b06038";
  ctx.fillRect(x, y, TILE, 2);
  ctx.fillStyle = "#5e2e18";
  ctx.fillRect(x, y + 7, TILE, 1);
  ctx.fillRect(x, y + 15, TILE, 1);
  ctx.fillRect(x + 4, y + 2, 1, 5);
  ctx.fillRect(x + 12, y + 8, 1, 7);
}

function drawPlatform(x, y) {
  ctx.fillStyle = "#5a4a8a";
  ctx.fillRect(x, y, TILE, 6);
  ctx.fillStyle = "#9a86e8";
  ctx.fillRect(x, y, TILE, 2);
  ctx.fillStyle = "#3a2a5e";
  ctx.fillRect(x + 1, y + 3, 2, 2);
  ctx.fillRect(x + 13, y + 3, 2, 2);
}

function drawSpike(x, y) {
  ctx.fillStyle = "#aab4c8";
  for (let i = 0; i < 2; i++) {
    const bx = x + i * 8;
    ctx.fillRect(bx + 3, y + 4, 2, 4);
    ctx.fillRect(bx + 2, y + 8, 4, 4);
    ctx.fillRect(bx + 1, y + 12, 6, 4);
  }
  ctx.fillStyle = "#e8ecf4";
  ctx.fillRect(x + 3, y + 4, 1, 8);
  ctx.fillRect(x + 11, y + 4, 1, 8);
}

function drawFire(x, y, t) {
  const f = Math.floor(t / 8) % 2;
  ctx.fillStyle = "#c2452e";
  ctx.fillRect(x + 2, y + 10 - f, 12, 6 + f);
  ctx.fillRect(x + 4, y + 6 - f, 3, 4);
  ctx.fillRect(x + 10, y + 7 + f, 3, 3);
  ctx.fillStyle = "#ff9a3e";
  ctx.fillRect(x + 4, y + 11, 8, 5);
  ctx.fillRect(x + 6, y + 8 - f, 3, 3);
  ctx.fillStyle = "#ffd23e";
  ctx.fillRect(x + 6, y + 12 + f, 4, 4 - f);
}

function drawTrophy(x, y, t) {
  const bob = Math.floor(Math.sin(t / 15) * 2);
  const yy = y + bob;
  ctx.fillStyle = "#ffd23e";
  ctx.fillRect(x + 3, yy + 1, 10, 7);
  ctx.fillRect(x + 1, yy + 1, 2, 4);
  ctx.fillRect(x + 13, yy + 1, 2, 4);
  ctx.fillRect(x + 6, yy + 8, 4, 3);
  ctx.fillRect(x + 4, yy + 11, 8, 3);
  ctx.fillStyle = "#fff2b0";
  ctx.fillRect(x + 4, yy + 2, 2, 3);
  ctx.fillStyle = "#c89a1e";
  ctx.fillRect(x + 10, yy + 2, 2, 5);
}

function drawDoor(x, y, open, flash) {
  // door tile is at (x, y); sprite is 16x32 anchored at its bottom row
  const topY = y - TILE;
  ctx.fillStyle = "#5e3a18";
  ctx.fillRect(x, topY, TILE, TILE * 2);
  if (open) {
    ctx.fillStyle = flash && Math.floor(flash / 6) % 2 ? "#ffd23e" : "#12081f";
    ctx.fillRect(x + 2, topY + 2, 12, 30);
    ctx.fillStyle = "#ffd23e";
    ctx.fillRect(x + 2, topY + 2, 12, 2);
  } else {
    ctx.fillStyle = "#8a5a28";
    ctx.fillRect(x + 2, topY + 2, 12, 30);
    ctx.fillStyle = "#5e3a18";
    ctx.fillRect(x + 4, topY + 4, 3, 10);
    ctx.fillRect(x + 9, topY + 4, 3, 10);
    ctx.fillRect(x + 4, topY + 17, 3, 10);
    ctx.fillRect(x + 9, topY + 17, 3, 10);
    ctx.fillStyle = "#ffd23e";
    ctx.fillRect(x + 12, topY + 15, 2, 2);
  }
}

function drawFloppy(x, y, t) {
  const bob = Math.floor(Math.sin(t / 12 + x) * 1.5);
  const yy = y + 2 + bob;
  ctx.fillStyle = "#2456c8";
  ctx.fillRect(x + 2, yy, 12, 12);
  ctx.fillStyle = "#b8c4e8";
  ctx.fillRect(x + 5, yy, 6, 4);
  ctx.fillStyle = "#20242e";
  ctx.fillRect(x + 8, yy + 1, 2, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 4, yy + 6, 8, 5);
}

function drawResume(x, y, t) {
  const bob = Math.floor(Math.sin(t / 12) * 2);
  const yy = y + 1 + bob;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 3, yy, 10, 13);
  ctx.fillStyle = "#9aa4b8";
  ctx.fillRect(x + 5, yy + 3, 6, 1);
  ctx.fillRect(x + 5, yy + 5, 6, 1);
  ctx.fillRect(x + 5, yy + 7, 4, 1);
  ctx.fillStyle = "#c2452e";
  ctx.fillRect(x + 9, yy + 9, 3, 3);
  // sparkle
  if (Math.floor(t / 10) % 3 === 0) {
    ctx.fillStyle = "#ffd23e";
    ctx.fillRect(x + 1, yy - 2, 2, 2);
    ctx.fillRect(x + 13, yy + 12, 2, 2);
  }
}

function drawPig(x, y, t) {
  const bob = Math.floor(Math.sin(t / 12) * 2);
  const yy = y + 2 + bob;
  ctx.fillStyle = "#ff9bb0";
  ctx.fillRect(x + 2, yy + 2, 12, 10);
  ctx.fillRect(x + 2, yy, 3, 3); // ears
  ctx.fillRect(x + 11, yy, 3, 3);
  ctx.fillStyle = "#e87a92";
  ctx.fillRect(x + 5, yy + 6, 6, 4); // snout
  ctx.fillStyle = "#20242e";
  ctx.fillRect(x + 6, yy + 7, 1, 2);
  ctx.fillRect(x + 9, yy + 7, 1, 2);
  ctx.fillRect(x + 4, yy + 4, 1, 1); // eyes
  ctx.fillRect(x + 11, yy + 4, 1, 1);
}

function drawCartridge(x, y, t, label) {
  const bob = Math.floor(Math.sin(t / 12 + y) * 2);
  const yy = y + 1 + bob;
  ctx.fillStyle = "#9aa4b8";
  ctx.fillRect(x + 2, yy, 12, 13);
  ctx.fillStyle = "#5a6478";
  ctx.fillRect(x + 2, yy + 11, 12, 2);
  ctx.fillStyle = label;
  ctx.fillRect(x + 4, yy + 2, 8, 7);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 5, yy + 3, 6, 2);
}

function drawScroll(x, y, t) {
  const bob = Math.floor(Math.sin(t / 12) * 2);
  const yy = y + 2 + bob;
  ctx.fillStyle = "#f4e8c8";
  ctx.fillRect(x + 3, yy, 10, 12);
  ctx.fillStyle = "#d8c8a0";
  ctx.fillRect(x + 3, yy, 10, 2);
  ctx.fillRect(x + 3, yy + 10, 10, 2);
  ctx.fillStyle = "#ffd23e";
  ctx.fillRect(x + 6, yy + 4, 4, 5); // the lock
  ctx.fillStyle = "#20242e";
  ctx.fillRect(x + 7, yy + 6, 2, 2);
}

function drawCap(x, y, t) {
  const bob = Math.floor(Math.sin(t / 12) * 2);
  const yy = y + 3 + bob;
  ctx.fillStyle = "#20242e";
  ctx.fillRect(x + 1, yy + 3, 14, 3);
  ctx.fillRect(x + 4, yy + 6, 8, 4);
  ctx.fillStyle = "#ffd23e";
  ctx.fillRect(x + 13, yy + 4, 1, 6);
  ctx.fillRect(x + 12, yy + 10, 3, 2);
}

function drawTiles() {
  const c0 = Math.floor(game.camera / TILE);
  const c1 = Math.min(game.level.width - 1, c0 + Math.ceil(VIEW_W / TILE) + 1);
  for (let r = 0; r < ROWS; r++) {
    for (let c = c0; c <= c1; c++) {
      const ch = game.tiles[r][c];
      if (ch === ".") continue;
      const x = px(c * TILE - game.camera);
      const y = HUD_H + r * TILE;
      switch (ch) {
        case "#": drawBrick(x, y); break;
        case "=": drawPlatform(x, y); break;
        case "S": drawSpike(x, y); break;
        case "F": drawFire(x, y, game.time); break;
        case "T": drawTrophy(x, y, game.time); break;
        case "C": drawFloppy(x, y, game.time); break;
        case "D": drawDoor(x, y, game.hasTrophy, game.doorFlash); break;
        case "R": drawResume(x, y, game.time); break;
        case "P": drawPig(x, y, game.time); break;
        case "G": drawCartridge(x, y, game.time, "#c2452e"); break;
        case "J": drawCartridge(x, y, game.time, "#3ecf3e"); break;
        case "B": drawCartridge(x, y, game.time, "#ff9a3e"); break;
        case "H": drawScroll(x, y, game.time); break;
        case "N": drawCap(x, y, game.time); break;
      }
    }
  }
}

function drawPlayer() {
  const p = game.player;
  const poses = ["idle", "run1", "run2", "jump"];
  const sprite = PLAYER_SPRITES[poses[p.frame]];
  const x = px(p.x - 1 - game.camera);
  const y = HUD_H + px(p.y + p.h - 16);
  if (game.state === "dead" && Math.floor(game.timer / 4) % 2) return; // death flicker
  ctx.save();
  if (p.facing < 0) {
    ctx.translate(x + 12, y);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, 0, 0);
  } else {
    ctx.drawImage(sprite, x, y);
  }
  ctx.restore();
}

function drawEnemies() {
  for (const e of game.enemies) {
    const x = px(e.x - game.camera);
    const y = HUD_H + px(e.y);
    ctx.drawImage(ENEMY_FRAMES[e.frame], x, y);
  }
}

function drawHUD() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = "#2a2a3e";
  ctx.fillRect(0, HUD_H - 1, VIEW_W, 1);

  ctx.font = "bold 8px 'Courier New', monospace";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffd23e";
  ctx.fillText("L" + (game.levelIndex + 1) + " " + game.level.name, 4, 3);

  ctx.fillStyle = "#9a86c8";
  ctx.fillText("←→ SPACE · P PAUSE · R RETRY", 4, 13);

  // floppies
  drawFloppy(VIEW_W - 90, -1, 0);
  ctx.fillStyle = "#e8e3f7";
  ctx.fillText("x" + game.floppies, VIEW_W - 72, 3);

  // trophy state
  if (game.hasTrophy) {
    drawTrophy(VIEW_W - 46, 1, 0);
  } else {
    ctx.fillStyle = "#4a4a5e";
    ctx.fillText("CUP?", VIEW_W - 46, 3);
  }

  // deaths (skull drawn in pixels — emoji glyphs aren't reliable in canvas)
  ctx.fillStyle = "#e8e3f7";
  ctx.fillRect(VIEW_W - 28, 3, 6, 4);
  ctx.fillRect(VIEW_W - 27, 7, 4, 2);
  ctx.fillStyle = "#000";
  ctx.fillRect(VIEW_W - 27, 4, 1, 1);
  ctx.fillRect(VIEW_W - 24, 4, 1, 1);
  ctx.fillStyle = "#e8e3f7";
  ctx.fillText("x" + game.deaths, VIEW_W - 20, 3);
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawBackground();
  drawTiles();
  drawEnemies();
  if (game.player) drawPlayer();
  drawHUD();

  if (game.state === "leveldone") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H);
    ctx.fillStyle = "#ffd23e";
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.textBaseline = "middle";
    const msg = "LEVEL COMPLETE!";
    ctx.fillText(msg, (VIEW_W - ctx.measureText(msg).width) / 2, VIEW_H / 2);
    ctx.textBaseline = "top";
  }
}

// ---- input -----------------------------------------------------------------

const keys = { left: false, right: false, jump: false };

const KEYMAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump",
};

document.addEventListener("keydown", (e) => {
  if (e.code in KEYMAP) {
    keys[KEYMAP[e.code]] = true;
    e.preventDefault();
  }
  if (e.code === "Enter" && game.state === "title") startGame();
  else if (e.code === "Enter" && game.state === "won") { showOverlay(null); startGame(); }
  else if (e.code === "KeyP" && (game.state === "playing" || game.state === "paused")) togglePause();
  else if (e.code === "KeyR" && (game.state === "playing" || game.state === "paused")) {
    showOverlay(null);
    loadLevel(game.levelIndex);
  } else if (e.code === "KeyM") toggleMute();
});

document.addEventListener("keyup", (e) => {
  if (e.code in KEYMAP) {
    keys[KEYMAP[e.code]] = false;
    e.preventDefault();
  }
});

// touch controls
function bindTouch(id, key) {
  const el = document.getElementById(id);
  const on = (e) => { e.preventDefault(); keys[key] = true; };
  const off = (e) => { e.preventDefault(); keys[key] = false; };
  el.addEventListener("pointerdown", on);
  el.addEventListener("pointerup", off);
  el.addEventListener("pointerleave", off);
  el.addEventListener("pointercancel", off);
}
bindTouch("touch-left", "left");
bindTouch("touch-right", "right");
bindTouch("touch-jump", "jump");

// tapping the canvas on the title screen also starts the game (mobile)
canvas.addEventListener("pointerdown", () => {
  if (game.state === "title") startGame();
});

// ---- buttons ---------------------------------------------------------------

function togglePause() {
  if (game.state === "playing") {
    game.state = "paused";
    audio.stopMusic();
    showOverlay("pause");
  } else if (game.state === "paused") {
    game.state = "playing";
    audio.startMusic();
    showOverlay(null);
    canvas.focus();
  }
}

function toggleMute() {
  audio.muted = !audio.muted;
  localStorage.setItem("bw-muted", audio.muted ? "1" : "0");
  updateMuteLabel();
}

function updateMuteLabel() {
  document.getElementById("btn-mute").innerHTML = audio.muted
    ? "&#128263; muted"
    : "&#128266; sound";
}

document.getElementById("btn-start").addEventListener("click", startGame);
document.getElementById("btn-again").addEventListener("click", () => { showOverlay(null); startGame(); });
document.getElementById("btn-resume").addEventListener("click", togglePause);
document.getElementById("btn-pause").addEventListener("click", () => {
  if (game.state === "playing" || game.state === "paused") togglePause();
});
document.getElementById("btn-mute").addEventListener("click", toggleMute);

const lootToggle = (open) => lootPanel.classList.toggle("loot--open", open);
document.getElementById("btn-loot").addEventListener("click", () => {
  lootToggle(!lootPanel.classList.contains("loot--open"));
  if (game.state === "playing") togglePause();
});
document.getElementById("btn-loot-close").addEventListener("click", () => lootToggle(false));
document.getElementById("btn-win-loot").addEventListener("click", () => lootToggle(true));

window.addEventListener("blur", () => {
  if (game.state === "playing") togglePause();
});

// ---- main loop -------------------------------------------------------------

let last = performance.now();
let acc = 0;
const STEP = 1000 / 60;

function frame(now) {
  acc += Math.min(now - last, 100);
  last = now;

  while (acc >= STEP) {
    acc -= STEP;
    game.time++;

    if (game.state === "intro") {
      if (--game.timer <= 0 || keys.jump || keys.left || keys.right) {
        showOverlay(null);
        game.state = "playing";
        canvas.focus();
      }
    } else if (game.state === "playing") {
      updatePlayer();
      updateEnemies();
      if (game.doorFlash > 0) game.doorFlash--;
    } else if (game.state === "dead") {
      if (--game.timer <= 0) {
        const p = game.player;
        p.x = p.spawn.x;
        p.y = p.spawn.y;
        p.vx = 0;
        p.vy = 0;
        game.state = "playing";
      }
    } else if (game.state === "leveldone") {
      if (--game.timer <= 0) {
        if (game.levelIndex + 1 < LEVELS.length) {
          loadLevel(game.levelIndex + 1);
        } else {
          winGame();
        }
      }
    }
  }

  if (game.level) render();
  requestAnimationFrame(frame);
}

// ---- boot ------------------------------------------------------------------

syncLootPanel();
updateMuteLabel();
game.level = LEVELS[0];
game.tiles = LEVELS[0].grid.map((r) => r.slice());
requestAnimationFrame(frame);

// tiny debug hook (also handy if you want to poke around in devtools — hi!)
window.__bw = { game, loadLevel, LEVELS, TILE, audio };
