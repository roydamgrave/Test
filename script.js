/* Cottontail Cage Run - a small canvas platformer.
   The rabbit runs and hops through several rooms of its cage,
   collecting carrots and reaching the exit door on each level. */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const CANVAS_W = canvas.width;
const CANVAS_H = canvas.height;

const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayText = document.getElementById('overlay-text');
const overlayBtn = document.getElementById('overlay-btn');
const hudLevel = document.getElementById('hud-level');
const hudCarrots = document.getElementById('hud-carrots');
const hudLives = document.getElementById('hud-lives');

const GRAVITY = 0.62;
const MAX_FALL = 15;
const MOVE_SPEED = 3.6;
const JUMP_VELOCITY = -11.6;
const FRICTION = 0.78;

// ---------- Level data ----------
// Coordinates are in "world" space. floor/platforms are solid rectangles.
// spikes hurt on touch. carrots are collectibles. goal is the exit door.
const LEVELS = [
  {
    name: 'First Hops',
    width: 1500,
    start: { x: 40, y: 300 },
    platforms: [
      { x: 0, y: 380, w: 380, h: 70 },
      { x: 460, y: 380, w: 260, h: 70 },
      { x: 800, y: 380, w: 200, h: 70 },
      { x: 1080, y: 380, w: 420, h: 70 },
      { x: 560, y: 300, w: 120, h: 20 },
      { x: 900, y: 290, w: 120, h: 20 },
    ],
    spikes: [],
    carrots: [
      { x: 200, y: 340 }, { x: 500, y: 260 }, { x: 640, y: 340 },
      { x: 940, y: 250 }, { x: 1200, y: 340 }, { x: 1400, y: 340 },
    ],
    goal: { x: 1440, y: 300, w: 40, h: 80 },
  },
  {
    name: 'Sawdust Steps',
    width: 1900,
    start: { x: 40, y: 300 },
    platforms: [
      { x: 0, y: 380, w: 300, h: 70 },
      { x: 380, y: 380, w: 160, h: 70 },
      { x: 620, y: 380, w: 140, h: 70 },
      { x: 620, y: 300, w: 140, h: 16 },
      { x: 840, y: 380, w: 90, h: 70 },
      { x: 1010, y: 380, w: 90, h: 70 },
      { x: 1180, y: 380, w: 260, h: 70 },
      { x: 1520, y: 380, w: 380, h: 70 },
      { x: 1120, y: 260, w: 100, h: 16 },
      { x: 1300, y: 200, w: 100, h: 16 },
    ],
    spikes: [
      { x: 780, y: 360, w: 30, h: 20 },
      { x: 940, y: 360, w: 30, h: 20 },
      { x: 1460, y: 360, w: 30, h: 20 },
    ],
    carrots: [
      { x: 420, y: 340 }, { x: 660, y: 260 }, { x: 1150, y: 220 },
      { x: 1330, y: 160 }, { x: 1250, y: 340 }, { x: 1700, y: 340 },
    ],
    goal: { x: 1840, y: 300, w: 40, h: 80 },
    moving: [
      { x: 950, y: 330, w: 90, h: 18, axis: 'y', min: 260, max: 340, speed: 0.9, dir: 1 },
    ],
  },
  {
    name: 'Wheel Works',
    width: 2200,
    start: { x: 40, y: 300 },
    platforms: [
      { x: 0, y: 380, w: 260, h: 70 },
      { x: 420, y: 380, w: 140, h: 70 },
      { x: 420, y: 260, w: 140, h: 16 },
      { x: 760, y: 380, w: 100, h: 70 },
      { x: 1120, y: 380, w: 100, h: 70 },
      { x: 1420, y: 380, w: 160, h: 70 },
      { x: 1420, y: 240, w: 160, h: 16 },
      { x: 1780, y: 380, w: 420, h: 70 },
      { x: 660, y: 200, w: 100, h: 16 },
      { x: 960, y: 300, w: 100, h: 16 },
      { x: 1780, y: 260, w: 120, h: 16 },
      { x: 1980, y: 180, w: 120, h: 16 },
    ],
    spikes: [
      { x: 300, y: 360, w: 100, h: 20 },
      { x: 880, y: 360, w: 220, h: 20 },
      { x: 1600, y: 360, w: 160, h: 20 },
    ],
    carrots: [
      { x: 680, y: 160 }, { x: 460, y: 220 }, { x: 1000, y: 260 },
      { x: 1450, y: 200 }, { x: 1820, y: 220 }, { x: 2020, y: 140 }, { x: 2120, y: 340 },
    ],
    goal: { x: 2150, y: 300, w: 40, h: 80 },
    moving: [
      { x: 600, y: 380, w: 110, h: 18, axis: 'x', min: 600, max: 850, speed: 1.1, dir: 1 },
      { x: 1220, y: 380, w: 110, h: 18, axis: 'x', min: 1220, max: 1400, speed: 1.3, dir: 1 },
    ],
  },
  {
    name: 'The Great Escape',
    width: 2600,
    start: { x: 40, y: 300 },
    platforms: [
      { x: 0, y: 380, w: 240, h: 70 },
      { x: 520, y: 380, w: 120, h: 70 },
      { x: 900, y: 380, w: 100, h: 70 },
      { x: 900, y: 260, w: 100, h: 16 },
      { x: 1260, y: 380, w: 90, h: 70 },
      { x: 1620, y: 380, w: 120, h: 70 },
      { x: 1620, y: 240, w: 120, h: 16 },
      { x: 2000, y: 380, w: 90, h: 70 },
      { x: 2260, y: 380, w: 340, h: 70 },
      { x: 300, y: 260, w: 100, h: 16 },
      { x: 1050, y: 200, w: 100, h: 16 },
      { x: 1440, y: 300, w: 100, h: 16 },
      { x: 1900, y: 180, w: 100, h: 16 },
      { x: 2150, y: 260, w: 90, h: 16 },
    ],
    spikes: [
      { x: 240, y: 360, w: 280, h: 20 },
      { x: 640, y: 360, w: 260, h: 20 },
      { x: 1000, y: 360, w: 260, h: 20 },
      { x: 1350, y: 360, w: 270, h: 20 },
      { x: 1740, y: 360, w: 260, h: 20 },
      { x: 2090, y: 360, w: 170, h: 20 },
    ],
    carrots: [
      { x: 330, y: 220 }, { x: 940, y: 220 }, { x: 1080, y: 160 },
      { x: 1470, y: 260 }, { x: 1930, y: 140 }, { x: 2180, y: 220 },
      { x: 2400, y: 340 }, { x: 2500, y: 340 },
    ],
    goal: { x: 2550, y: 300, w: 40, h: 80 },
    moving: [
      { x: 700, y: 300, w: 100, h: 18, axis: 'y', min: 220, max: 330, speed: 1.0, dir: 1 },
      { x: 1130, y: 380, w: 110, h: 18, axis: 'x', min: 1130, max: 1370, speed: 1.4, dir: 1 },
      { x: 1780, y: 380, w: 100, h: 18, axis: 'x', min: 1780, max: 1990, speed: 1.5, dir: -1 },
    ],
  },
];

// ---------- Game state ----------
let state = 'menu'; // menu | playing | paused | levelComplete | gameOver | win
let levelIndex = 0;
let lives = 3;
let totalCarrots = 0;
let levelCarrotFlags = [];
let movingState = [];
let camX = 0;
let hurtTimer = 0;
let winFlourish = 0;

const rabbit = {
  x: 40, y: 300, w: 28, h: 26, vx: 0, vy: 0, onGround: false, facing: 1, animT: 0,
};

const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyP' && (state === 'playing' || state === 'paused')) togglePause();
  if (e.code === 'KeyR' && (state === 'playing' || state === 'paused')) restartLevel();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

overlayBtn.addEventListener('click', () => {
  if (state === 'menu') startGame();
  else if (state === 'levelComplete') nextLevel();
  else if (state === 'gameOver') startGame();
  else if (state === 'win') startGame();
  else if (state === 'paused') togglePause();
});

// ---------- Audio (tiny WebAudio beeps, no assets needed) ----------
let audioCtx = null;
function beep(freq, dur, type = 'sine', vol = 0.15) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) { /* audio not available, ignore */ }
}

function sndJump() { beep(520, 0.12, 'square', 0.1); }
function sndCarrot() { beep(880, 0.1, 'triangle', 0.12); beep(1320, 0.08, 'triangle', 0.08); }
function sndHurt() { beep(140, 0.25, 'sawtooth', 0.15); }
function sndGoal() { beep(660, 0.15, 'triangle', 0.12); setTimeout(() => beep(990, 0.2, 'triangle', 0.12), 120); }

// ---------- Setup / flow ----------
function startGame() {
  levelIndex = 0;
  lives = 3;
  totalCarrots = 0;
  loadLevel(0);
  state = 'playing';
  overlay.classList.add('hidden');
}

function loadLevel(idx) {
  const lvl = LEVELS[idx];
  rabbit.x = lvl.start.x;
  rabbit.y = lvl.start.y;
  rabbit.vx = 0; rabbit.vy = 0; rabbit.onGround = false;
  levelCarrotFlags = lvl.carrots.map(() => false);
  movingState = (lvl.moving || []).map((m) => ({ ...m }));
  camX = 0;
  hurtTimer = 0;
  updateHud();
}

function restartLevel() {
  loadLevel(levelIndex);
  state = 'playing';
  overlay.classList.add('hidden');
}

function nextLevel() {
  if (levelIndex >= LEVELS.length - 1) {
    state = 'win';
    showOverlay('You Escaped the Cage!', `Cottontail made it through all ${LEVELS.length} rooms with ${totalCarrots} carrots collected. What a hop!`, 'Play Again');
    return;
  }
  levelIndex++;
  loadLevel(levelIndex);
  state = 'playing';
  overlay.classList.add('hidden');
}

function loseLife() {
  lives--;
  hurtTimer = 60;
  sndHurt();
  if (lives <= 0) {
    state = 'gameOver';
    showOverlay('Game Over', `Cottontail ran out of hops on "${LEVELS[levelIndex].name}". Try again from the start of the level.`, 'Restart Game');
  } else {
    const lvl = LEVELS[levelIndex];
    rabbit.x = lvl.start.x;
    rabbit.y = lvl.start.y;
    rabbit.vx = 0; rabbit.vy = 0;
  }
  updateHud();
}

function togglePause() {
  if (state === 'playing') {
    state = 'paused';
    showOverlay('Paused', 'Take a breather.', 'Resume');
  } else if (state === 'paused') {
    state = 'playing';
    overlay.classList.add('hidden');
  }
}

function showOverlay(title, text, btnLabel) {
  overlayTitle.textContent = title;
  overlayText.innerHTML = text;
  overlayBtn.textContent = btnLabel;
  overlay.classList.remove('hidden');
}

function updateHud() {
  hudLevel.textContent = `Level ${levelIndex + 1} / ${LEVELS.length} — ${LEVELS[levelIndex] ? LEVELS[levelIndex].name : ''}`;
  hudCarrots.textContent = `🥕 x ${totalCarrots}`;
  hudLives.textContent = `Lives: ${'❤️'.repeat(Math.max(lives, 0))}${'🖤'.repeat(Math.max(3 - lives, 0))}`;
}

// ---------- Collision helpers ----------
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function allSolids() {
  const lvl = LEVELS[levelIndex];
  return lvl.platforms.concat(movingState);
}

// ---------- Physics / update ----------
function update(dt) {
  if (state !== 'playing') return;
  const lvl = LEVELS[levelIndex];

  // moving platforms
  movingState.forEach((m) => {
    const delta = m.speed * dt * m.dir;
    if (m.axis === 'x') {
      m.x += delta;
      if (m.x < m.min) { m.x = m.min; m.dir = 1; }
      if (m.x > m.max) { m.x = m.max; m.dir = -1; }
      m._delta = delta; m._deltaY = 0;
    } else {
      m.y += delta;
      if (m.y < m.min) { m.y = m.min; m.dir = 1; }
      if (m.y > m.max) { m.y = m.max; m.dir = -1; }
      m._delta = 0; m._deltaY = delta;
    }
  });

  // horizontal input
  const left = keys['ArrowLeft'] || keys['KeyA'];
  const right = keys['ArrowRight'] || keys['KeyD'];
  if (left && !right) { rabbit.vx = -MOVE_SPEED; rabbit.facing = -1; }
  else if (right && !left) { rabbit.vx = MOVE_SPEED; rabbit.facing = 1; }
  else { rabbit.vx *= FRICTION; if (Math.abs(rabbit.vx) < 0.05) rabbit.vx = 0; }

  // jump
  const jumpPressed = keys['ArrowUp'] || keys['KeyW'] || keys['Space'];
  if (jumpPressed && rabbit.onGround) {
    rabbit.vy = JUMP_VELOCITY;
    rabbit.onGround = false;
    sndJump();
  }
  if (!jumpPressed && rabbit.vy < -4) {
    rabbit.vy *= 0.9; // short-hop cut
  }

  // gravity
  rabbit.vy += GRAVITY * dt;
  if (rabbit.vy > MAX_FALL) rabbit.vy = MAX_FALL;

  const solids = allSolids();

  // move X and resolve
  rabbit.x += rabbit.vx * dt;
  for (const p of solids) {
    if (rectsOverlap(rabbit, p)) {
      if (rabbit.vx > 0) rabbit.x = p.x - rabbit.w;
      else if (rabbit.vx < 0) rabbit.x = p.x + p.w;
      rabbit.vx = 0;
    }
  }
  if (rabbit.x < 0) rabbit.x = 0;
  if (rabbit.x + rabbit.w > lvl.width) rabbit.x = lvl.width - rabbit.w;

  // move Y and resolve
  rabbit.y += rabbit.vy * dt;
  rabbit.onGround = false;
  for (const p of solids) {
    if (rectsOverlap(rabbit, p)) {
      if (rabbit.vy > 0) {
        rabbit.y = p.y - rabbit.h;
        rabbit.vy = 0;
        rabbit.onGround = true;
        if (p._delta) rabbit.x += p._delta;
      } else if (rabbit.vy < 0) {
        rabbit.y = p.y + p.h;
        rabbit.vy = 0;
      }
    }
  }

  // carry along moving platform even without vy this frame
  if (rabbit.onGround) {
    const standing = movingState.find((m) => Math.abs((rabbit.y + rabbit.h) - m.y) < 1 &&
      rabbit.x + rabbit.w > m.x && rabbit.x < m.x + m.w);
    if (standing && standing._deltaY) rabbit.y += 0; // handled by resolution above next frame
  }

  // spikes
  for (const s of lvl.spikes) {
    if (rectsOverlap(rabbit, s) && hurtTimer <= 0) {
      loseLife();
      return;
    }
  }

  // fell out of the cage
  if (rabbit.y > CANVAS_H + 60) {
    loseLife();
    return;
  }

  // carrots
  lvl.carrots.forEach((c, i) => {
    if (levelCarrotFlags[i]) return;
    const cRect = { x: c.x - 10, y: c.y - 10, w: 20, h: 20 };
    if (rectsOverlap(rabbit, cRect)) {
      levelCarrotFlags[i] = true;
      totalCarrots++;
      sndCarrot();
      updateHud();
    }
  });

  // goal
  if (rectsOverlap(rabbit, lvl.goal)) {
    sndGoal();
    state = 'levelComplete';
    const isLast = levelIndex === LEVELS.length - 1;
    showOverlay(
      isLast ? 'Final Room Cleared!' : 'Level Complete!',
      `You cleared "${lvl.name}" with ${levelCarrotFlags.filter(Boolean).length}/${lvl.carrots.length} carrots this room.`,
      isLast ? 'Finish' : 'Next Level'
    );
  }

  if (hurtTimer > 0) hurtTimer -= dt;

  // camera
  camX = rabbit.x - CANVAS_W / 2 + rabbit.w / 2;
  camX = Math.max(0, Math.min(camX, Math.max(0, lvl.width - CANVAS_W)));

  rabbit.animT += dt;
}

// ---------- Rendering ----------
function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // background
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#f3e3c0');
  grad.addColorStop(1, '#d8bd85');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (state === 'menu') { drawCageBars(0); return; }

  const lvl = LEVELS[levelIndex];
  ctx.save();
  ctx.translate(-camX, 0);

  // sawdust speckles
  ctx.fillStyle = 'rgba(150,110,60,0.25)';
  for (let i = 0; i < lvl.width; i += 37) {
    ctx.fillRect(i, 410, 4, 4);
  }

  // platforms
  lvl.platforms.forEach((p) => drawPlatform(p, '#8a5a34', '#5c3a20'));
  movingState.forEach((p) => drawPlatform(p, '#c97b3d', '#7a441c'));

  // spikes
  ctx.fillStyle = '#9aa0a8';
  lvl.spikes.forEach((s) => {
    const count = Math.max(1, Math.round(s.w / 20));
    const step = s.w / count;
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.moveTo(s.x + i * step, s.y + s.h);
      ctx.lineTo(s.x + i * step + step / 2, s.y);
      ctx.lineTo(s.x + i * step + step, s.y + s.h);
      ctx.closePath();
      ctx.fill();
    }
  });

  // carrots
  lvl.carrots.forEach((c, i) => { if (!levelCarrotFlags[i]) drawCarrot(c.x, c.y); });

  // goal door
  drawGoal(lvl.goal);

  // rabbit
  drawRabbit();

  ctx.restore();

  drawCageBars(camX);

  if (hurtTimer > 0 && Math.floor(hurtTimer / 6) % 2 === 0) {
    ctx.fillStyle = 'rgba(255,0,0,0.15)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }
}

function drawPlatform(p, top, side) {
  ctx.fillStyle = side;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = top;
  ctx.fillRect(p.x, p.y, p.w, Math.min(10, p.h));
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  for (let gx = p.x + 20; gx < p.x + p.w; gx += 24) {
    ctx.beginPath(); ctx.moveTo(gx, p.y); ctx.lineTo(gx, p.y + p.h); ctx.stroke();
  }
}

function drawCarrot(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#ff8c2e';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(7, 10);
  ctx.lineTo(-7, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c25f0f';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#4caf50';
  ctx.fillRect(-2, -16, 4, 8);
  ctx.fillRect(-6, -14, 4, 6);
  ctx.fillRect(2, -14, 4, 6);
  ctx.restore();
}

function drawGoal(g) {
  ctx.fillStyle = '#4a3018';
  ctx.fillRect(g.x - 6, g.y - 6, g.w + 12, g.h + 12);
  const glow = 0.5 + 0.5 * Math.sin(Date.now() / 200);
  ctx.fillStyle = `rgba(120, 220, 140, ${0.4 + glow * 0.4})`;
  ctx.fillRect(g.x, g.y, g.w, g.h);
  ctx.strokeStyle = '#2e5c33';
  ctx.strokeRect(g.x, g.y, g.w, g.h);
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', g.x + g.w / 2, g.y - 10);
}

function drawRabbit() {
  const r = rabbit;
  const bob = r.onGround ? Math.sin(r.animT * 0.6) * (Math.abs(r.vx) > 0.3 ? 2 : 0) : 0;
  ctx.save();
  ctx.translate(r.x + r.w / 2, r.y + r.h / 2 + bob);
  ctx.scale(r.facing, 1);

  // ears
  ctx.fillStyle = '#f5f0e8';
  const earTilt = r.onGround ? 0 : -6;
  ctx.save();
  ctx.translate(-6, -14);
  ctx.rotate((earTilt - 8) * Math.PI / 180);
  ctx.fillRect(-3, -14, 6, 16);
  ctx.restore();
  ctx.save();
  ctx.translate(4, -14);
  ctx.rotate((earTilt + 8) * Math.PI / 180);
  ctx.fillRect(-3, -14, 6, 16);
  ctx.restore();
  ctx.fillStyle = '#f2b3c0';
  ctx.save();
  ctx.translate(-6, -14);
  ctx.rotate((earTilt - 8) * Math.PI / 180);
  ctx.fillRect(-1.5, -11, 3, 10);
  ctx.restore();
  ctx.save();
  ctx.translate(4, -14);
  ctx.rotate((earTilt + 8) * Math.PI / 180);
  ctx.fillRect(-1.5, -11, 3, 10);
  ctx.restore();

  // body
  ctx.fillStyle = '#fbf7ee';
  roundRect(-13, -9, 26, 22, 8);
  ctx.fill();

  // legs (simple run animation)
  const legPhase = Math.sin(r.animT * (Math.abs(r.vx) > 0.3 ? 0.9 : 0));
  ctx.fillStyle = '#e9e2d3';
  if (r.onGround) {
    ctx.fillRect(-9 + legPhase * 3, 9, 6, 6);
    ctx.fillRect(3 - legPhase * 3, 9, 6, 6);
  } else {
    ctx.fillRect(-9, 9, 6, 5);
    ctx.fillRect(3, 9, 6, 5);
  }

  // tail
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-13, 2, 4, 0, Math.PI * 2);
  ctx.fill();

  // face
  ctx.fillStyle = '#241812';
  ctx.beginPath();
  ctx.arc(8, -3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2b3c0';
  ctx.beginPath();
  ctx.arc(13, 0, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCageBars(offset) {
  ctx.strokeStyle = 'rgba(70,45,25,0.55)';
  ctx.lineWidth = 6;
  const spacing = 46;
  const start = -((offset) % spacing);
  for (let x = start; x < CANVAS_W + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 26);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(70,45,25,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, 6);
}

// ---------- Main loop ----------
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(2.2, (now - lastTime) / 16.6667);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

updateHud();
draw();
requestAnimationFrame(loop);
