// ============================================================================
// HE OR SHE? - a two-stage mini platformer for Portesche & Brendon's reveal.
// Stage 1: jump into the balloon you believe in (your guess).
// Stage 2: jump into a gift box (your RSVP). Then a tiny form, saved to
// Netlify Forms so the parents can read every answer in one list.
// Vanilla JS + <canvas>, vector art drawn in code, soft Web Audio sounds.
// ============================================================================

"use strict";

// ---- event facts (edit here, everything else follows) ----------------------

const EVENT = {
  url: "https://brendonpedro.netlify.app/reveal/",
  title: "Gender Reveal - Portesche & Brendon",
  placeName: "上山喝咖啡",
  placeAddress: "No. 1-20, Nanchang Village, Hengshan Township, Hsinchu County 312, Taiwan",
  // 11:00 to 14:00 Taiwan time (UTC+8), written in UTC for calendars
  startUtc: "20261025T030000Z",
  endUtc: "20261025T060000Z",
  prettyWhen: "Sunday 25 October at 11:00",
  // online guests (mostly South Africa, UTC+2): the reveal itself
  meetUrl: "https://meet.google.com/mhs-dycf-dvh",
  onlineTw: "11:30 to 12:00 Taiwan time",
  onlineSa: "05:30 to 06:00 South Africa time",
  onlineStartUtc: "20261025T033000Z",
  onlineEndUtc: "20261025T040000Z",
};

const FORM_ENDPOINT = "/reveal/";
const DEV = ["localhost", "127.0.0.1"].includes(location.hostname);
const STORE_KEY = "reveal-rsvp";

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  },
};

// ---- game constants ---------------------------------------------------------

const W = 640;
// phones get a taller screen (more sky above, more ground below) so the
// action is not a letterbox; the world itself is laid out for 400px
const NARROW = window.matchMedia("(max-width: 600px)").matches;
const H = NARROW ? 480 : 400;
const OY = (H - 400) / 2; // world offset when the screen is taller
const GROUND_Y = 340;
const GRAVITY = 0.5;
const JUMP_V = -10.6;
const RUN_V = 3.1;
const MAX_FALL = 11;
const COYOTE = 7;
const JUMP_BUFFER = 8;

const COL = {
  skyTop: "#f3f6ee",
  skyBottom: "#dfe9d8",
  hillFar: "#d3dfcb",
  hillMid: "#bfd0b5",
  hillNear: "#a9bea2",
  cloud: "#ffffff",
  slab: "#fffdf8",
  slabEdge: "#e5dcc4",
  slabTop: "#cfdcc7",
  ground: "#b7cbb0",
  groundTop: "#9cb496",
  gold: "#c6a25c",
  goldDeep: "#a8853f",
  sage: "#9db398",
  sageLight: "#d9e3d2",
  sageDeep: "#6f8a70",
  ink: "#4a5649",
  bear: "#d2b48c",
  bearDark: "#b8976a",
  bearLight: "#efe0c6",
  he: "#dbe8f2",
  heDeep: "#b8cfe2",
  she: "#f8e1e5",
  sheDeep: "#e9bfc8",
};

// ---- stages -----------------------------------------------------------------
// Everything is in world pixels. Platforms are solid; clouds are one-way and
// drift; balls roll along a ground run and bounce the bear back; stars are
// collectible; choices end the stage.

const STAGES = [
  {
    key: "guess",
    kicker: "stage 1 of 2",
    name: "The Guess",
    hint: "jump into the balloon you believe in",
    bar: "stage 1 · the guess",
    width: 2400,
    spawn: { x: 60, y: GROUND_Y - 40 },
    platforms: [
      { x: 0, y: GROUND_Y, w: 520, h: 80, kind: "ground" },
      { x: 600, y: GROUND_Y, w: 400, h: 80, kind: "ground" },
      { x: 1180, y: GROUND_Y, w: 540, h: 80, kind: "ground" },
      { x: 1820, y: GROUND_Y, w: 580, h: 80, kind: "ground" },
      { x: 720, y: 268, w: 120, h: 20, kind: "slab" },
      { x: 900, y: 212, w: 100, h: 20, kind: "slab" },
      { x: 1350, y: 262, w: 110, h: 20, kind: "slab" },
      { x: 1520, y: 204, w: 110, h: 20, kind: "slab" },
      { x: 1030, y: 292, w: 96, h: 18, kind: "cloud", move: { range: 50, speed: 0.011, phase: 0 } },
    ],
    stars: [
      [300, 290], [560, 232], [770, 228], [950, 172], [1078, 246], [1405, 222], [1575, 164], [1770, 250],
    ],
    balls: [
      { x: 800, y: GROUND_Y - 16, r: 16, x0: 610, x1: 990, speed: 1.3, dir: 1 },
      { x: 1300, y: GROUND_Y - 16, r: 16, x0: 1190, x1: 1710, speed: 1.7, dir: -1 },
    ],
    checkpoints: [{ x: 1200 }, { x: 1840 }],
    choices: [
      { id: "he", kind: "balloon", x: 2040, y: 218, label: "HE" },
      { id: "she", kind: "balloon", x: 2240, y: 218, label: "SHE" },
    ],
  },
  {
    key: "rsvp",
    kicker: "stage 2 of 2",
    name: "The RSVP",
    hint: "jump into your answer",
    bar: "stage 2 · the rsvp",
    width: 2400,
    spawn: { x: 60, y: GROUND_Y - 40 },
    platforms: [
      { x: 0, y: GROUND_Y, w: 440, h: 80, kind: "ground" },
      { x: 560, y: GROUND_Y, w: 420, h: 80, kind: "ground" },
      { x: 1120, y: GROUND_Y, w: 460, h: 80, kind: "ground" },
      { x: 1700, y: GROUND_Y, w: 700, h: 80, kind: "ground" },
      { x: 280, y: 270, w: 100, h: 20, kind: "slab" },
      { x: 640, y: 266, w: 110, h: 20, kind: "slab" },
      { x: 820, y: 208, w: 100, h: 20, kind: "slab" },
      { x: 1240, y: 262, w: 120, h: 20, kind: "slab" },
      { x: 1420, y: 204, w: 110, h: 20, kind: "slab" },
      { x: 1000, y: 290, w: 90, h: 18, kind: "cloud", move: { range: 40, speed: 0.013, phase: 1.3 } },
    ],
    stars: [
      [330, 232], [500, 236], [690, 228], [870, 168], [1050, 246], [1300, 222], [1475, 164], [1640, 250],
    ],
    balls: [
      { x: 760, y: GROUND_Y - 16, r: 16, x0: 570, x1: 970, speed: 1.5, dir: -1 },
      { x: 1350, y: GROUND_Y - 16, r: 16, x0: 1130, x1: 1570, speed: 1.9, dir: 1 },
    ],
    checkpoints: [{ x: 1140 }, { x: 1720 }],
    // the gifts hang from balloons at jump height, so you walk under the
    // ones you do not want and jump into the one you do (y = box bottom)
    choices: [
      { id: "yes", kind: "gift", x: 1900, y: 250, label: "I'll be there" },
      { id: "online", kind: "gift", x: 2070, y: 250, label: "I'll join online" },
      { id: "no", kind: "gift", x: 2240, y: 250, label: "can't make it" },
    ],
    bunny: { x: 1790, y: GROUND_Y },
  },
];

// ---- audio: soft, short, zero assets ---------------------------------------

const audio = {
  ctx: null,
  muted: storage.get("reveal-muted") === "1",
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  },
  tone(freq, dur = 0.1, type = "sine", vol = 0.06, slideTo = null, when = 0) {
    if (this.muted || !this.ensure()) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  },
  chord(notes, step = 0.09, dur = 0.22, type = "sine", vol = 0.05) {
    notes.forEach((f, i) => this.tone(f, dur, type, vol, null, i * step));
  },
  jump() { this.tone(360, 0.12, "triangle", 0.045, 620); },
  star() { this.chord([1318, 1760], 0.05, 0.16, "sine", 0.04); },
  bonk() { this.tone(170, 0.16, "square", 0.03, 90); },
  whoops() { this.tone(420, 0.3, "triangle", 0.04, 180); },
  pop() {
    this.tone(700, 0.08, "square", 0.04, 220);
    this.chord([1046, 1318, 1568], 0.06, 0.3, "sine", 0.04);
  },
  open() { this.chord([523, 659, 784, 1046], 0.08, 0.35, "triangle", 0.045); },
  checkpoint() { this.chord([880, 1174], 0.07, 0.2, "sine", 0.035); },
  success() { this.chord([523, 659, 784, 1046, 1318, 1568], 0.1, 0.5, "sine", 0.05); },
  setMuted(m) {
    this.muted = m;
    storage.set("reveal-muted", m ? "1" : "0");
  },
};

// ---- DOM ----------------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const canvas = $("game");
const ctx = canvas.getContext("2d");

const panels = {
  title: $("panel-title"),
  stage: $("panel-stage"),
  form: $("panel-form"),
  done: $("panel-done"),
};

function showPanel(name) {
  for (const [key, el] of Object.entries(panels)) {
    el.classList.toggle("panel--visible", key === name);
  }
  const grown = name && panels[name].classList.contains("panel--grow");
  document.querySelector(".screen__bezel").classList.toggle("is-grown", !!grown);
}

let toastTimer = null;
function toast(msg, ms = 2200) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("toast--show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("toast--show"), ms);
}

// ---- state ----------------------------------------------------------------------

const game = {
  state: "title", // title | intro | playing | choosing | form | done
  stageIndex: 0,
  stage: null,
  platforms: [],
  stars: [],
  balls: [],
  choices: [],
  checkpoints: [],
  player: null,
  camera: 0,
  particles: [],
  sparkles: 0,
  sparkleTotal: 16,
  tumbles: 0,
  time: 0,
  timer: 0,
  guess: null,
  attending: null,
  played: false,
  startedAt: 0,
};

const keys = { left: false, right: false, jump: false, jumpPressed: 0 };

// ---- stage lifecycle ----------------------------------------------------------

function loadStage(index) {
  const s = STAGES[index];
  game.stageIndex = index;
  game.stage = s;
  game.platforms = s.platforms.map((p) => ({ ...p, baseX: p.x, dx: 0 }));
  game.stars = s.stars.map(([x, y]) => ({ x, y, taken: false, seed: Math.random() * 6.28 }));
  game.balls = s.balls.map((b) => ({ ...b, rot: 0 }));
  game.choices = s.choices.map((c) => ({ ...c, state: "idle", t: 0 }));
  game.checkpoints = s.checkpoints.map((c) => ({ ...c, reached: false }));
  game.particles = [];
  game.player = {
    x: s.spawn.x,
    y: s.spawn.y,
    w: 28,
    h: 40,
    vx: 0,
    vy: 0,
    onGround: false,
    coyote: 0,
    facing: 1,
    knock: 0,
    invuln: 0,
    runPhase: 0,
    squash: 0,
    spawn: { ...s.spawn },
    ride: null,
  };
  game.camera = 0;
  game.time = 0;

  $("stage-kicker").textContent = s.kicker;
  $("stage-name").textContent = s.name;
  $("stage-hint").textContent = s.hint;
  $("stat-stage").textContent = s.bar;
  showPanel("stage");
  game.state = "intro";
  game.timer = 95;
}

function startGame() {
  game.sparkles = 0;
  game.tumbles = 0;
  game.guess = null;
  game.attending = null;
  game.played = true;
  game.startedAt = Date.now();
  updateSparkleStat();
  loadStage(0);
  canvas.focus({ preventScroll: true });
}

function updateSparkleStat() {
  $("stat-sparkles").textContent = "✦ " + game.sparkles + " / " + game.sparkleTotal;
}

// ---- physics ------------------------------------------------------------------

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function solidAt(rect, prevBottom) {
  for (const p of game.platforms) {
    if (!rectsOverlap(rect, p)) continue;
    if (p.kind === "cloud") {
      // one-way: only solid when coming down from above
      if (prevBottom !== undefined && prevBottom <= p.y + 1) return p;
      continue;
    }
    return p;
  }
  return null;
}

function respawn() {
  const p = game.player;
  p.x = p.spawn.x;
  p.y = p.spawn.y;
  p.vx = 0;
  p.vy = 0;
  p.knock = 0;
  p.invuln = 40;
  game.tumbles++;
  audio.whoops();
  toast(["whoops, try again", "teddy bounced back", "almost! one more go"][game.tumbles % 3]);
}

function updatePlatforms() {
  for (const p of game.platforms) {
    if (!p.move) continue;
    const nx = p.baseX + Math.sin(game.time * p.move.speed + p.move.phase) * p.move.range;
    p.dx = nx - p.x;
    p.x = nx;
  }
}

function updatePlayer() {
  const p = game.player;

  // input
  let want = 0;
  if (keys.left && !keys.right) want = -1;
  if (keys.right && !keys.left) want = 1;
  if (p.knock > 0) {
    p.knock--;
  } else {
    p.vx = want * RUN_V;
    if (want) p.facing = want;
  }
  if (p.invuln > 0) p.invuln--;

  // ride a moving cloud
  if (p.ride) p.x += p.ride.dx;

  // jump (with coyote time + buffer, so it feels kind)
  if (p.onGround) p.coyote = COYOTE;
  else if (p.coyote > 0) p.coyote--;
  if (keys.jumpPressed > 0) keys.jumpPressed--;
  if (keys.jumpPressed > 0 && p.coyote > 0 && p.knock === 0) {
    p.vy = JUMP_V;
    p.onGround = false;
    p.coyote = 0;
    keys.jumpPressed = 0;
    p.squash = 8;
    audio.jump();
  }
  // short hop when the key is released early
  if (!keys.jump && p.vy < -4) p.vy = -4;

  p.vy = Math.min(p.vy + GRAVITY, MAX_FALL);

  // horizontal
  p.x += p.vx;
  let hit = solidAt(p);
  if (hit) {
    if (p.vx > 0) p.x = hit.x - p.w;
    else if (p.vx < 0) p.x = hit.x + hit.w;
    p.vx = 0;
  }
  p.x = Math.max(0, Math.min(p.x, game.stage.width - p.w));

  // vertical
  const prevBottom = p.y + p.h;
  p.y += p.vy;
  p.ride = null;
  hit = solidAt(p, prevBottom);
  const wasAir = !p.onGround;
  p.onGround = false;
  if (hit) {
    if (p.vy > 0) {
      p.y = hit.y - p.h;
      p.onGround = true;
      if (hit.move) p.ride = hit;
      if (wasAir && p.vy > 6) p.squash = 8;
    } else if (p.vy < 0) {
      p.y = hit.y + hit.h;
    }
    p.vy = 0;
  }

  // fell off the world
  if (p.y > 400 + 60) {
    respawn();
    return;
  }

  // stars
  const core = { x: p.x + 4, y: p.y + 4, w: p.w - 8, h: p.h - 8 };
  for (const s of game.stars) {
    if (s.taken) continue;
    if (rectsOverlap(core, { x: s.x - 12, y: s.y - 12, w: 24, h: 24 })) {
      s.taken = true;
      game.sparkles++;
      updateSparkleStat();
      burst(s.x, s.y, 10, [COL.gold, "#fff3c4", "#fff"], 2.4, "star");
      audio.star();
    }
  }

  // checkpoints
  for (const c of game.checkpoints) {
    if (!c.reached && p.x + p.w / 2 > c.x) {
      c.reached = true;
      p.spawn = { x: c.x - 10, y: GROUND_Y - p.h };
      burst(c.x, GROUND_Y - 40, 8, [COL.sage, COL.gold, "#fff"], 1.6, "circle");
      audio.checkpoint();
    }
  }

  // balls knock you back (never "kill")
  if (p.invuln === 0) {
    for (const b of game.balls) {
      const cx = Math.max(p.x, Math.min(b.x, p.x + p.w));
      const cy = Math.max(p.y, Math.min(b.y, p.y + p.h));
      if ((cx - b.x) ** 2 + (cy - b.y) ** 2 < (b.r - 2) ** 2) {
        const dir = p.x + p.w / 2 < b.x ? -1 : 1;
        p.vx = dir * 5;
        p.vy = -6.5;
        p.knock = 14;
        p.invuln = 50;
        p.onGround = false;
        burst(b.x, b.y - b.r, 6, ["#fff", COL.sageDeep], 1.8, "circle");
        audio.bonk();
      }
    }
  }

  // choices
  for (const c of game.choices) {
    const rect = c.kind === "balloon"
      ? { x: c.x - 40, y: c.y - 46, w: 80, h: 92 }
      : { x: c.x - 34, y: c.y - 62, w: 68, h: 66 };
    if (c.state === "idle" && rectsOverlap(core, rect)) choose(c);
  }

  // animation bookkeeping
  if (p.onGround && p.vx !== 0) p.runPhase += 0.22;
  if (p.squash > 0) p.squash--;

  // camera follows with a little lead
  const target = p.x + p.w / 2 - W * 0.42;
  const clamped = Math.max(0, Math.min(target, game.stage.width - W));
  game.camera += (clamped - game.camera) * 0.12;
}

function updateBalls() {
  for (const b of game.balls) {
    b.x += b.dir * b.speed;
    if (b.x - b.r < b.x0) { b.x = b.x0 + b.r; b.dir = 1; }
    if (b.x + b.r > b.x1) { b.x = b.x1 - b.r; b.dir = -1; }
    b.rot += (b.dir * b.speed) / b.r;
  }
}

function choose(c) {
  c.state = "chosen";
  c.t = 0;
  game.state = "choosing";
  game.timer = 80;
  const p = game.player;
  p.vx = 0;
  if (c.kind === "balloon") {
    game.guess = c.id;
    const cols = c.id === "he" ? [COL.heDeep, "#fff", COL.gold] : [COL.sheDeep, "#fff", COL.gold];
    burst(c.x, c.y, 46, cols, 5, "confetti");
    burst(c.x, c.y, 14, ["#fff", COL.gold], 3, "heart");
    audio.pop();
    p.vy = -6;
    toast(c.id === "he" ? "you're team HE \u{1F499}" : "you're team SHE \u{1FA77}", 2600);
  } else {
    game.attending = c.id;
    const cols = [COL.sage, COL.gold, "#fff", COL.sageDeep];
    burst(c.x, c.y - 40, 40, cols, 4.5, "confetti");
    burst(c.x, c.y - 40, 10, [COL.gold, "#fff"], 2.5, "heart");
    audio.open();
    p.vy = -5;
    toast({ yes: "see you there!", online: "see you on the call!", no: "we'll miss you" }[c.id], 2600);
  }
}

// ---- particles ------------------------------------------------------------------

function burst(x, y, n, colors, speed, shape) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = speed * (0.4 + Math.random() * 0.8);
    game.particles.push({
      x, y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - speed * 0.6,
      life: 50 + Math.random() * 40,
      max: 90,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: shape === "confetti" ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
      rot: Math.random() * 6.28,
      spin: (Math.random() - 0.5) * 0.3,
      shape,
    });
  }
}

function updateParticles() {
  for (const q of game.particles) {
    q.x += q.vx;
    q.y += q.vy;
    q.vy += q.shape === "confetti" ? 0.12 : 0.08;
    q.vx *= 0.98;
    q.rot += q.spin;
    q.life--;
  }
  game.particles = game.particles.filter((q) => q.life > 0);
}

// ---- main loop ------------------------------------------------------------------

function update() {
  game.time++;
  updatePlatforms();
  updateParticles();

  if (game.state === "intro") {
    if (--game.timer <= 0) {
      showPanel(null);
      game.state = "playing";
    }
    return;
  }

  if (game.state === "playing") {
    updateBalls();
    updatePlayer();
    return;
  }

  if (game.state === "choosing") {
    // the bear floats gently while the choice animates
    const p = game.player;
    p.vy = Math.min(p.vy + GRAVITY * 0.6, 4);
    p.y += p.vy;
    const hit = solidAt(p, p.y + p.h - p.vy);
    if (hit && p.vy > 0) { p.y = hit.y - p.h; p.vy = 0; p.onGround = true; }
    for (const c of game.choices) if (c.state === "chosen") c.t++;
    if (--game.timer <= 0) {
      if (game.stageIndex === 0) loadStage(1);
      else openForm("game");
    }
  }
}

// ---- rendering --------------------------------------------------------------------

let dpr = 1;
function fitCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  canvas.style.aspectRatio = W + " / " + H;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
}

function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(x, y, rx, ry, fill, stroke) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
}

function heart(x, y, s, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.4, y - s * 0.2, x - s * 0.6, y - s * 1.1, x, y - s * 0.35);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.1, x + s * 1.4, y - s * 0.2, x, y + s * 0.9);
  ctx.fillStyle = fill;
  ctx.fill();
}

function star4(x, y, s, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.quadraticCurveTo(x, y, x + s, y);
  ctx.quadraticCurveTo(x, y, x, y + s);
  ctx.quadraticCurveTo(x, y, x - s, y);
  ctx.quadraticCurveTo(x, y, x, y - s);
  ctx.fillStyle = fill;
  ctx.fill();
}

function leaf(x, y, len, angle, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -len * 0.42, len, 0);
  ctx.quadraticCurveTo(len * 0.5, len * 0.42, 0, 0);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(90,120,95,0.35)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(len * 0.1, 0);
  ctx.lineTo(len * 0.9, 0);
  ctx.stroke();
  ctx.restore();
}

function branch(x, y, angle, scale, sway) {
  // a eucalyptus sprig: stem + alternating leaves
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + sway);
  ctx.scale(scale, scale);
  ctx.strokeStyle = "#8aa68d";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(60, -10, 150, -40);
  ctx.stroke();
  const fills = ["#c3d4bb", "#a9bfa5", "#b9cdb3"];
  for (let i = 0; i < 7; i++) {
    const t = 0.15 + i * 0.12;
    const px = 2 * (1 - t) * t * 60 + t * t * 150;
    const py = 2 * (1 - t) * t * -10 + t * t * -40;
    const side = i % 2 ? 1 : -1;
    leaf(px, py, 30 - i * 2, side * 1.1 + -0.3, fills[i % 3]);
  }
  ctx.restore();
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, COL.skyTop);
  sky.addColorStop(1, COL.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // soft sun
  const sun = ctx.createRadialGradient(W * 0.78, 70, 10, W * 0.78, 70, 160);
  sun.addColorStop(0, "rgba(255,246,214,0.9)");
  sun.addColorStop(1, "rgba(255,246,214,0)");
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, W, H);

  // hills, three parallax layers of soft bumps
  const layers = [
    { col: COL.hillFar, par: 0.15, base: 250 + OY, amp: 50, len: 420 },
    { col: COL.hillMid, par: 0.3, base: 285 + OY, amp: 40, len: 300 },
    { col: COL.hillNear, par: 0.5, base: 318 + OY, amp: 26, len: 200 },
  ];
  for (const L of layers) {
    ctx.fillStyle = L.col;
    ctx.beginPath();
    ctx.moveTo(0, H);
    const off = game.camera * L.par;
    for (let x = -20; x <= W + 20; x += 8) {
      const wx = x + off;
      const y = L.base - Math.abs(Math.sin(wx / L.len * Math.PI)) * L.amp - Math.sin(wx / 53) * 4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  // drifting clouds
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 230 + game.time * 0.15 - game.camera * 0.25) % (W + 200) + W + 200) % (W + 200) - 100;
    const cy = 50 + OY * 0.5 + (i % 3) * 38;
    ellipse(cx, cy, 34, 12, "rgba(255,255,255,0.85)");
    ellipse(cx - 16, cy + 2, 20, 10, "rgba(255,255,255,0.85)");
    ellipse(cx + 18, cy + 3, 22, 9, "rgba(255,255,255,0.85)");
  }

  // gold dust
  for (let i = 0; i < 18; i++) {
    const sx = ((i * 137 + game.time * 0.2 - game.camera * 0.6) % W + W) % W;
    const sy = 40 + ((i * 97) % 260) + Math.sin(game.time / 40 + i) * 6;
    const a = 0.25 + 0.25 * Math.sin(game.time / 15 + i * 2);
    star4(sx, sy, 2.2, "rgba(198,162,92," + a.toFixed(2) + ")");
  }
}

function drawPlatform(p) {
  const x = p.x - game.camera;
  if (x + p.w < -10 || x > W + 10) return;
  if (p.kind === "ground") {
    ctx.fillStyle = COL.ground;
    ctx.fillRect(x, p.y + 10, p.w, p.h);
    rr(x, p.y, p.w, 22, 11);
    ctx.fillStyle = COL.groundTop;
    ctx.fill();
    // little tufts
    ctx.strokeStyle = "rgba(111,138,112,0.6)";
    ctx.lineWidth = 1.2;
    for (let gx = p.x + 18; gx < p.x + p.w - 10; gx += 37) {
      const tx = gx - game.camera;
      ctx.beginPath();
      ctx.moveTo(tx, p.y + 1);
      ctx.lineTo(tx - 3, p.y - 6);
      ctx.moveTo(tx + 3, p.y + 1);
      ctx.lineTo(tx + 5, p.y - 5);
      ctx.stroke();
    }
  } else if (p.kind === "slab") {
    ctx.fillStyle = "rgba(70,90,70,0.12)";
    rr(x + 2, p.y + 4, p.w, p.h, 8);
    ctx.fill();
    rr(x, p.y, p.w, p.h, 8);
    ctx.fillStyle = COL.slab;
    ctx.fill();
    ctx.strokeStyle = COL.slabEdge;
    ctx.lineWidth = 1;
    ctx.stroke();
    rr(x + 4, p.y + 3, p.w - 8, 5, 2.5);
    ctx.fillStyle = COL.slabTop;
    ctx.fill();
  } else if (p.kind === "cloud") {
    ctx.fillStyle = "rgba(70,90,70,0.1)";
    ellipse(x + p.w / 2, p.y + 14, p.w / 2, 9, "rgba(70,90,70,0.1)");
    ellipse(x + p.w / 2, p.y + 8, p.w / 2, 10, COL.cloud);
    ellipse(x + p.w * 0.3, p.y + 4, p.w * 0.22, 12, COL.cloud);
    ellipse(x + p.w * 0.65, p.y + 3, p.w * 0.25, 13, COL.cloud);
  }
}

function drawStar(s) {
  if (s.taken) return;
  const x = s.x - game.camera;
  if (x < -20 || x > W + 20) return;
  const bob = Math.sin(game.time / 18 + s.seed) * 3;
  const y = s.y + bob;
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 16);
  glow.addColorStop(0, "rgba(255,240,190,0.9)");
  glow.addColorStop(1, "rgba(255,240,190,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - 16, y - 16, 32, 32);
  star4(x, y, 8, COL.gold);
  star4(x, y, 4, "#fff4cf");
}

function drawBall(b) {
  const x = b.x - game.camera;
  if (x < -30 || x > W + 30) return;
  ellipse(x, GROUND_Y + 2, b.r * 0.9, 4, "rgba(70,90,70,0.18)");
  ctx.save();
  ctx.translate(x, b.y);
  ctx.rotate(b.rot);
  ellipse(0, 0, b.r, b.r, "#fff");
  ctx.beginPath();
  ctx.arc(0, 0, b.r, -0.5, 0.5);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = COL.sage;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, b.r, Math.PI - 0.5, Math.PI + 0.5);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = COL.sage;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, b.r, 0, Math.PI * 2);
  ctx.strokeStyle = COL.gold;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  heart(0, 1, 4, COL.gold);
  ctx.restore();
  ellipse(x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.28, b.r * 0.18, "rgba(255,255,255,0.7)");
}

function drawCheckpoint(c) {
  const x = c.x - game.camera;
  if (x < -30 || x > W + 30) return;
  ctx.strokeStyle = COL.gold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y);
  ctx.lineTo(x, GROUND_Y - 52);
  ctx.stroke();
  const wave = Math.sin(game.time / 10) * 3;
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y - 52);
  ctx.quadraticCurveTo(x + 14, GROUND_Y - 50 + wave, x + 26, GROUND_Y - 46);
  ctx.quadraticCurveTo(x + 14, GROUND_Y - 40 + wave, x, GROUND_Y - 36);
  ctx.closePath();
  ctx.fillStyle = c.reached ? COL.gold : COL.sageLight;
  ctx.fill();
  heart(x + 12, GROUND_Y - 44, 3, c.reached ? "#fff" : COL.sageDeep);
}

function drawBalloon(c) {
  const x = c.x - game.camera;
  if (x < -80 || x > W + 80) return;
  const chosen = c.state === "chosen";
  if (chosen && c.t > 6) {
    // popped: just the drifting string and a floating label
    ctx.strokeStyle = COL.goldDeep;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.quadraticCurveTo(x + 10, GROUND_Y - 50, x + 2, c.y + 40 + c.t);
    ctx.stroke();
    ctx.font = "italic 500 20px 'Cormorant Garamond', serif";
    ctx.textAlign = "center";
    ctx.fillStyle = COL.goldDeep;
    ctx.fillText("team " + c.label.toLowerCase(), x, c.y - 10 - c.t * 0.4);
    return;
  }
  const sway = Math.sin(game.time / 30 + c.x) * 6;
  const bob = Math.sin(game.time / 22 + c.x) * 4;
  const bx = x + sway;
  const by = c.y + bob;
  const scale = chosen ? 1 + c.t * 0.08 : 1;
  const he = c.id === "he";

  // string
  ctx.strokeStyle = COL.goldDeep;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, GROUND_Y);
  ctx.quadraticCurveTo(x + sway * 0.4, (GROUND_Y + by) / 2, bx, by + 50 * scale);
  ctx.stroke();

  ctx.save();
  ctx.translate(bx, by);
  ctx.scale(scale, scale);
  // body
  const g = ctx.createRadialGradient(-14, -18, 6, 0, 0, 52);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, he ? COL.he : COL.she);
  g.addColorStop(1, he ? COL.heDeep : COL.sheDeep);
  ellipse(0, 0, 40, 48, g);
  ctx.strokeStyle = "rgba(198,162,92,0.5)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 48, 0, 0, Math.PI * 2);
  ctx.stroke();
  // gold dots like the invitation balloons
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const r = 10 + (i * 7) % 28;
    const dx = Math.cos(a) * r * 0.8;
    const dy = Math.sin(a) * r;
    ellipse(dx, dy, 1.6, 1.6, "rgba(198,162,92,0.55)");
  }
  // knot
  ctx.beginPath();
  ctx.moveTo(-5, 48);
  ctx.lineTo(5, 48);
  ctx.lineTo(0, 54);
  ctx.closePath();
  ctx.fillStyle = he ? COL.heDeep : COL.sheDeep;
  ctx.fill();
  // highlight
  ellipse(-14, -20, 7, 12, "rgba(255,255,255,0.75)");
  // label
  ctx.font = "32px 'Great Vibes', cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COL.goldDeep;
  ctx.fillText(he ? "He" : "She", 0, 4);
  ctx.restore();

  // a question mark hint above the balloon
  ctx.font = "italic 500 17px 'Cormorant Garamond', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COL.ink;
  ctx.fillText("jump in to guess", x, by - 64);
}

function drawGift(c) {
  const x = c.x - game.camera;
  if (x < -90 || x > W + 90) return;
  const chosen = c.state === "chosen";
  const bw = 64, bh = 50;
  const bob = Math.sin(game.time / 24 + c.x) * 4;
  const top = c.y - bh + bob;
  const theme = {
    yes: { box: "#f7f3e8", ribbon: COL.sage, knot: COL.sageDeep, balloon: ["#ffffff", "#dfe8d6", "#b9cbb0"] },
    online: { box: "#f7f3e8", ribbon: "#d9bf7a", knot: COL.goldDeep, balloon: ["#ffffff", "#f6ecd2", "#e4cd98"] },
    no: { box: "#eef0ea", ribbon: "#c9ccc3", knot: "#aeb2a8", balloon: ["#ffffff", "#ececec", "#cfd2cc"] },
  }[c.id];

  // balloon holding the gift up (pops when chosen)
  const by = top - 92;
  if (!(chosen && c.t > 6)) {
    ctx.strokeStyle = COL.goldDeep;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, by + 40);
    ctx.lineTo(x, top - 12);
    ctx.stroke();
    const g = ctx.createRadialGradient(x - 10, by - 14, 4, x, by, 42);
    g.addColorStop(0, theme.balloon[0]);
    g.addColorStop(0.6, theme.balloon[1]);
    g.addColorStop(1, theme.balloon[2]);
    ellipse(x, by, 30, 36, g);
    ctx.strokeStyle = "rgba(198,162,92,0.45)";
    ctx.beginPath();
    ctx.ellipse(x, by, 30, 36, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4;
      const r = 8 + (i * 7) % 20;
      ellipse(x + Math.cos(a) * r * 0.8, by + Math.sin(a) * r, 1.4, 1.4, "rgba(198,162,92,0.5)");
    }
    ellipse(x - 11, by - 15, 5, 9, "rgba(255,255,255,0.8)");
    ctx.beginPath();
    ctx.moveTo(x - 4, by + 36);
    ctx.lineTo(x + 4, by + 36);
    ctx.lineTo(x, by + 41);
    ctx.closePath();
    ctx.fillStyle = theme.balloon[2];
    ctx.fill();
  }

  // box
  ctx.fillStyle = "rgba(70,90,70,0.12)";
  rr(x - bw / 2 + 3, top + 4, bw, bh, 5);
  ctx.fill();
  rr(x - bw / 2, top, bw, bh, 5);
  ctx.fillStyle = theme.box;
  ctx.fill();
  ctx.strokeStyle = COL.slabEdge;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = theme.ribbon;
  ctx.fillRect(x - 7, top, 14, bh);
  ctx.font = "bold 22px 'Cormorant Garamond', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COL.gold;
  ctx.fillText("?", x - 20, top + bh / 2 + 2);
  ctx.fillText("?", x + 20, top + bh / 2 + 2);

  // lid (flies off when chosen)
  const lift = chosen ? Math.min(c.t * 2.2, 70) : 0;
  const tilt = chosen ? Math.min(c.t * 0.03, 0.5) : 0;
  ctx.save();
  ctx.translate(x, top - lift);
  ctx.rotate(tilt);
  rr(-bw / 2 - 4, -12, bw + 8, 14, 4);
  ctx.fillStyle = theme.box;
  ctx.fill();
  ctx.strokeStyle = COL.slabEdge;
  ctx.stroke();
  ctx.fillStyle = theme.ribbon;
  ctx.fillRect(-7, -12, 14, 14);
  ellipse(-11, -17, 10, 6, theme.ribbon);
  ellipse(11, -17, 10, 6, theme.ribbon);
  ellipse(0, -16, 4, 4, theme.knot);
  ctx.restore();

  // the answer, written above the balloon
  ctx.font = "italic 500 17px 'Cormorant Garamond', serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = COL.ink;
  ctx.fillText(c.label, x, by - 48 - (chosen ? c.t * 0.5 : 0));
  heart(x, by - 62 - (chosen ? c.t * 0.5 : 0), 4, theme.knot);
}

function drawBunny(b) {
  const x = b.x - game.camera;
  if (x < -60 || x > W + 60) return;
  const y = b.y;
  const hop = Math.abs(Math.sin(game.time / 14)) * 3;
  ellipse(x, y + 1, 18, 4, "rgba(70,90,70,0.15)");
  ctx.save();
  ctx.translate(x, y - hop);
  // ears
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 7, -46);
    ctx.rotate(s * 0.18);
    ellipse(0, 0, 5, 15, "#f6f1e8");
    ellipse(0, 1, 2.5, 10, "#f0cdd1");
    ctx.restore();
  }
  ellipse(0, -14, 15, 14, "#f6f1e8"); // body
  ellipse(0, -31, 13, 12, "#f6f1e8"); // head
  ellipse(-7, -4, 6, 4, "#f6f1e8"); // feet
  ellipse(7, -4, 6, 4, "#f6f1e8");
  ellipse(-4, -32, 1.6, 1.8, COL.ink); // eyes
  ellipse(4, -32, 1.6, 1.8, COL.ink);
  ellipse(-7, -28, 2.5, 1.6, "rgba(235,150,160,0.5)"); // blush
  ellipse(7, -28, 2.5, 1.6, "rgba(235,150,160,0.5)");
  ellipse(0, -27, 1.6, 1.2, "#e6a2ab"); // nose
  // bow on the ear
  ellipse(10, -58, 5, 3, COL.sage);
  ellipse(16, -56, 5, 3, COL.sage);
  ellipse(13, -57, 2, 2, COL.sageDeep);
  ctx.restore();
}

function drawBear() {
  const p = game.player;
  const fx = p.x + p.w / 2 - game.camera;
  const fy = p.y + p.h;
  const air = !p.onGround;
  const running = p.onGround && p.vx !== 0;
  const blink = p.invuln > 0 && Math.floor(game.time / 4) % 2 === 0;
  if (blink) return;

  ellipse(fx, fy + 1, 16, 4, "rgba(70,90,70,0.16)");

  ctx.save();
  ctx.translate(fx, fy);
  const sq = p.squash > 0 ? 1 - p.squash * 0.015 : 1;
  ctx.scale(p.facing * (air ? 1.02 : 1 / sq), air ? 1.02 : sq);
  if (running) ctx.rotate(p.facing * 0.06);

  const legSwing = running ? Math.sin(p.runPhase * 4) * 5 : 0;
  // legs
  ellipse(-7, -5 + (air ? 2 : legSwing * 0.4), 6, 5, COL.bearDark);
  ellipse(7, -5 + (air ? 2 : -legSwing * 0.4), 6, 5, COL.bearDark);
  // body
  ellipse(0, -18, 14, 14, COL.bear);
  ellipse(0, -16, 8, 9, COL.bearLight);
  // arms
  const armY = air ? -30 : -18;
  const armX = air ? 14 : 15;
  ellipse(-armX, armY, 5, 6, COL.bearDark);
  ellipse(armX, armY, 5, 6, COL.bearDark);
  // head
  ellipse(-10, -46, 5, 5, COL.bear);
  ellipse(10, -46, 5, 5, COL.bear);
  ellipse(-10, -46, 2.5, 2.5, COL.bearLight);
  ellipse(10, -46, 2.5, 2.5, COL.bearLight);
  ellipse(0, -37, 13, 12, COL.bear);
  ellipse(0, -33, 6.5, 5, COL.bearLight); // muzzle
  ellipse(0, -35, 2.2, 1.6, "#4a3a2a"); // nose
  ellipse(-5, -40, 1.7, 2, "#2e2420"); // eyes
  ellipse(5, -40, 1.7, 2, "#2e2420");
  ellipse(-4.4, -40.6, 0.6, 0.6, "#fff");
  ellipse(5.6, -40.6, 0.6, 0.6, "#fff");
  ellipse(-8, -34, 2.6, 1.6, "rgba(235,150,160,0.45)"); // blush
  ellipse(8, -34, 2.6, 1.6, "rgba(235,150,160,0.45)");
  // smile
  ctx.strokeStyle = "#4a3a2a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -32.5, 2.6, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // sage bow at the neck
  ellipse(-5, -26, 5, 3.2, COL.sage);
  ellipse(5, -26, 5, 3.2, COL.sage);
  ellipse(0, -26, 2.2, 2.2, COL.sageDeep);
  ctx.restore();
}

function drawParticles() {
  for (const q of game.particles) {
    const x = q.x - game.camera;
    const a = Math.min(1, q.life / 30);
    ctx.globalAlpha = a;
    if (q.shape === "heart") heart(x, q.y, q.size, q.color);
    else if (q.shape === "star") star4(x, q.y, q.size, q.color);
    else if (q.shape === "confetti") {
      ctx.save();
      ctx.translate(x, q.y);
      ctx.rotate(q.rot);
      ctx.fillStyle = q.color;
      ctx.fillRect(-q.size / 2, -q.size / 4, q.size, q.size / 2);
      ctx.restore();
    } else ellipse(x, q.y, q.size, q.size, q.color);
    ctx.globalAlpha = 1;
  }
}

function drawForeground() {
  // eucalyptus sprigs framing the screen, like the invitation
  const sway = Math.sin(game.time / 60) * 0.03;
  branch(-10, H - 20, -0.9, 1.1, sway);
  branch(W + 10, 30, 2.3, 1.0, -sway);
  branch(W + 6, H - 10, -2.2, 0.9, sway);
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawBackground();
  if (!game.stage) {
    drawForeground();
    return;
  }
  ctx.translate(0, OY);
  for (const p of game.platforms) drawPlatform(p);
  for (const c of game.checkpoints) drawCheckpoint(c);
  for (const s of game.stars) drawStar(s);
  for (const c of game.choices) (c.kind === "balloon" ? drawBalloon : drawGift)(c);
  if (game.stage.bunny) drawBunny(game.stage.bunny);
  for (const b of game.balls) drawBall(b);
  drawBear();
  drawParticles();
  ctx.translate(0, -OY);
  drawForeground();
}

let last = 0;
let acc = 0;
function frame(ts) {
  const dt = Math.min(ts - last, 100);
  last = ts;
  acc += dt;
  while (acc >= 1000 / 60) {
    if (game.stage) update();
    else game.time++;
    acc -= 1000 / 60;
  }
  render();
  requestAnimationFrame(frame);
}

// ---- input --------------------------------------------------------------------------

const KEYMAP = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  Space: "jump", ArrowUp: "jump", KeyW: "jump",
};

function pressJump() {
  keys.jump = true;
  keys.jumpPressed = JUMP_BUFFER;
}

const GAME_STATES = new Set(["intro", "playing", "choosing"]);

function gameHasKeyboard(e) {
  return GAME_STATES.has(game.state) && !e.target.matches("input, textarea, select, a, button:not(.touch__btn)");
}

function refocusGame() {
  if (GAME_STATES.has(game.state)) canvas.focus({ preventScroll: true });
}

function releaseKeys() {
  keys.left = false;
  keys.right = false;
  keys.jump = false;
  keys.jumpPressed = 0;
}

document.addEventListener("keydown", (e) => {
  const k = KEYMAP[e.code];
  if (!k || !gameHasKeyboard(e)) return;
  e.preventDefault();
  if (k === "jump") { if (!keys.jump) pressJump(); }
  else keys[k] = true;
});
document.addEventListener("keyup", (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  keys[k] = false;
});
window.addEventListener("blur", releaseKeys);

function bindTouch(id, key) {
  const el = $(id);
  const down = (e) => {
    e.preventDefault();
    el.classList.add("is-down");
    audio.ensure();
    if (key === "jump") pressJump();
    else keys[key] = true;
  };
  const up = (e) => {
    e.preventDefault();
    el.classList.remove("is-down");
    keys[key] = false;
  };
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("pointerleave", up);
  el.addEventListener("contextmenu", (e) => e.preventDefault());
}
bindTouch("touch-left", "left");
bindTouch("touch-right", "right");
bindTouch("touch-jump", "jump");

// tapping the screen itself also jumps (handy on phones)
canvas.addEventListener("pointerdown", (e) => {
  if (game.state !== "playing") return;
  e.preventDefault();
  pressJump();
});
canvas.addEventListener("pointerup", () => { keys.jump = false; });

// ---- the form ---------------------------------------------------------------------

const form = $("rsvp-form");
const choicesBox = $("rsvp-choices");

function setRadio(name, value) {
  form.querySelectorAll('input[name="' + name + '"]').forEach((r) => { r.checked = r.value === value; });
}

function syncGuests() {
  const attending = form.querySelector('input[name="attending"]:checked');
  $("field-guests").hidden = !attending || attending.value !== "yes";
}

function openForm(mode) {
  game.state = "form";
  if (mode !== "game") game.played = false;
  $("rsvp-error").textContent = "";
  $("f-sparkles").value = game.played ? game.sparkles + "/" + game.sparkleTotal : "";
  $("f-played").value = game.played ? "yes" : "no";
  if (mode === "game") {
    setRadio("guess", game.guess);
    setRadio("attending", game.attending);
    choicesBox.hidden = true;
    $("form-kicker").textContent = "stage 2 complete";
    $("form-title").textContent = "Lovely. Who are you?";
    $("rsvp-summary").textContent =
      "You're team " + String(game.guess || "?").toUpperCase() +
      { yes: " and you'll be there.", online: " and you'll join us online.", no: " and you can't make it this time." }[game.attending];
  } else {
    choicesBox.hidden = false;
    $("form-kicker").textContent = "no game, no problem";
    $("form-title").textContent = "Your guess, your RSVP";
    $("rsvp-summary").textContent = "";
  }
  syncGuests();
  showPanel("form");
  setTimeout(() => $("f-name").focus({ preventScroll: true }), 50);
}

form.addEventListener("change", syncGuests);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("rsvp-error");
  err.textContent = "";
  const guess = form.querySelector('input[name="guess"]:checked');
  const attending = form.querySelector('input[name="attending"]:checked');
  const name = $("f-name").value.trim();
  if (!guess) return (err.textContent = "pick a guess first: he or she?");
  if (!attending) return (err.textContent = "let us know if you can come.");
  if (!name) { err.textContent = "we'd love to know your name."; $("f-name").focus(); return; }

  const data = new FormData(form);
  if (attending.value !== "yes") data.set("guests", "0");
  data.set("name", name);
  const body = new URLSearchParams(data).toString();

  const btn = $("btn-submit");
  btn.disabled = true;
  btn.textContent = "sending…";
  try {
    if (DEV) {
      console.info("[reveal] dev mode, would submit:", Object.fromEntries(data));
      await new Promise((r) => setTimeout(r, 500));
    } else {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
    }
    const record = { name, guess: guess.value, attending: attending.value, guests: data.get("guests"), at: Date.now() };
    storage.set(STORE_KEY, JSON.stringify(record));
    showDone(record);
  } catch (ex) {
    console.error(ex);
    err.textContent = "that didn't send. please try again, or message Brendon directly.";
  } finally {
    btn.disabled = false;
    btn.textContent = "send my RSVP";
  }
});

$("btn-form-back").addEventListener("click", () => {
  showPanel("title");
  game.state = "title";
  game.stage = null;
});

function showDone(rec) {
  game.state = "done";
  const first = rec.name.split(" ")[0];
  const team = rec.guess === "he" ? "team HE \u{1F499}" : "team SHE \u{1FA77}";
  const wear = (rec.guess === "he" ? "Wear something blue" : "Wear something pink") +
    " if you already own it, no need to buy anything.";
  const found = game.played ? " You found " + game.sparkles + " of " + game.sparkleTotal + " sparkles." : "";
  $("done-title").textContent = "Thank you, " + first + "!";
  $("btn-map").hidden = rec.attending !== "yes";
  $("btn-meet").hidden = rec.attending !== "online";
  if (rec.attending === "yes") {
    $("done-kicker").textContent = "you're on the list";
    $("done-text").textContent =
      "You're " + team + ". See you " + EVENT.prettyWhen + " at " + EVENT.placeName + ". " + wear + found;
  } else if (rec.attending === "online") {
    $("done-kicker").textContent = "see you on the call";
    $("done-text").textContent =
      "You're " + team + ". The reveal is on Google Meet on Sunday 25 October, " + EVENT.onlineTw +
      ", that's " + EVENT.onlineSa + ". " + wear + found;
  } else {
    $("done-kicker").textContent = "we'll miss you";
    $("done-text").textContent =
      "You're " + team + ". Sorry you can't make it. We'll tell you what the cake said." + found;
  }
  showPanel("done");
  burst(W / 2 + game.camera, 200, 60, [COL.gold, COL.sage, "#fff", COL.sageDeep], 6, "confetti");
  audio.success();
}

// ---- buttons ----------------------------------------------------------------------

$("btn-start").addEventListener("click", () => {
  audio.ensure();
  startGame();
});
$("btn-again").addEventListener("click", () => {
  audio.ensure();
  startGame();
});
for (const id of ["btn-classic", "btn-classic-2"]) {
  $(id).addEventListener("click", () => {
    game.stage = null;
    openForm("classic");
    document.querySelector(".screen__bezel").scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function syncMute() {
  $("btn-mute").textContent = audio.muted ? "sound off" : "sound on";
}
$("btn-mute").addEventListener("click", () => {
  audio.setMuted(!audio.muted);
  syncMute();
  refocusGame();
});
syncMute();

$("btn-share").addEventListener("click", async () => {
  const text = "He or She? Portesche & Brendon's gender reveal, " + EVENT.prettyWhen + ". Guess and RSVP here:";
  try {
    if (navigator.share) {
      await navigator.share({ title: EVENT.title, text, url: EVENT.url });
      return;
    }
    await navigator.clipboard.writeText(EVENT.url);
    toast("invite link copied");
  } catch (ex) {
    if (ex && ex.name !== "AbortError") toast(EVENT.url, 4000);
  }
});

// ---- calendar links -----------------------------------------------------------------

$("link-gcal").href =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent(EVENT.title) +
  "&dates=" + EVENT.startUtc + "/" + EVENT.endUtc +
  "&ctz=Asia/Taipei" +
  "&location=" + encodeURIComponent(EVENT.placeName + ", " + EVENT.placeAddress) +
  "&details=" + encodeURIComponent("He or She? Guess and RSVP: " + EVENT.url);
$("btn-map").href = $("link-map").href;
$("btn-meet").href = EVENT.meetUrl;
$("link-meet").href = EVENT.meetUrl;
$("link-gcal-online").href =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  "&text=" + encodeURIComponent(EVENT.title + " (online)") +
  "&dates=" + EVENT.onlineStartUtc + "/" + EVENT.onlineEndUtc +
  "&location=" + encodeURIComponent(EVENT.meetUrl) +
  "&details=" + encodeURIComponent("The reveal, live on Google Meet: " + EVENT.meetUrl + " (" + EVENT.onlineTw + ", " + EVENT.onlineSa + ")");

// ---- returning guests ---------------------------------------------------------------

try {
  const prev = JSON.parse(storage.get(STORE_KEY) || "null");
  if (prev && prev.name) {
    $("title-note").textContent =
      "You already RSVP'd as " + prev.name + " (team " + prev.guess.toUpperCase() + ", " +
      ({ yes: "coming", online: "joining online", no: "not coming" }[prev.attending] || prev.attending) +
      "). Play again to change it.";
  }
} catch (_) { /* ignore */ }

// ---- go -------------------------------------------------------------------------------

if (DEV) window.__reveal = { game, keys, loadStage, choose, openForm, STAGES };

fitCanvas();
window.addEventListener("resize", fitCanvas);
document.addEventListener("visibilitychange", () => { last = performance.now(); acc = 0; });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render());
requestAnimationFrame((ts) => { last = ts; frame(ts); });
