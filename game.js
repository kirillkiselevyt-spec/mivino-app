const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const roundCounter = document.getElementById("roundCounter");

// =====================
// RESIZE
// =====================
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// =====================
// STATE
// =====================
let state = "menu";

let score = 0;
let lives = 5;
let level = 1;
let caughtCount = 0;

let balls = [];
let levelBalls = [];

// =====================
// INPUT + PHYSICS (V18 base)
// =====================
let targetX = innerWidth / 2;
let coneX = innerWidth / 2;
let coneVelocity = 0;

// =====================
// JUICE STATE
// =====================
let particles = [];
let shake = 0;

// =====================
// AUDIO (no files)
// =====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, time, type = "sine", vol = 0.05) {
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();

  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;

  o.connect(g);
  g.connect(audioCtx.destination);

  o.start();
  o.stop(audioCtx.currentTime + time);
}

// =====================
// HAPTIC
// =====================
function vibrate(ms) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

// =====================
// INPUT
// =====================
function setInput(x) {
  targetX = x;
}

window.addEventListener("pointermove", (e) => setInput(e.clientX));
window.addEventListener("touchmove", (e) => setInput(e.touches[0].clientX), { passive: true });

// =====================
// SCREEN
// =====================
function setScreen(id) {
  ["startScreen","nextLevelScreen","gameOver"]
    .forEach(i => document.getElementById(i).style.display = "none");

  if (id) document.getElementById(id).style.display = "flex";
}

// =====================
window.startGame = function () {
  score = 0;
  lives = 5;
  level = 1;
  caughtCount = 0;

  startLevel();
  state = "play";
  setScreen(null);
};

window.nextLevel = function () {
  level++;
  if (level > 20) return gameOver();

  startLevel();
  state = "play";
  setScreen(null);
};

window.restartGame = function () {
  startGame();
};

// =====================
function startLevel() {
  balls = [];
  levelBalls = [];
  caughtCount = 0;
  particles = [];

  for (let i = 0; i < 20; i++) {
    const trigger = 0.6 - 0.2 * (i / 19);

    levelBalls.push({
      x: Math.random() * canvas.width,
      y: -50,
      r: 22,
      speed: 2 + level * 0.4,
      color: ["#ff5c7a","#ffcc66","#7a4dff","#5ad1ff","#34d399"][i % 5],
      spawned: false,
      trigger
    });
  }

  roundCounter.innerText = "0 / 20";
}

// =====================
// V19 CONE PHYSICS + JUICE
// =====================
function updateCone() {
  const attraction = 0.18;
  const damping = 0.82;
  const maxSpeed = 28;

  const force = (targetX - coneX) * attraction;

  coneVelocity += force;
  coneVelocity *= damping;

  coneVelocity = Math.max(-maxSpeed, Math.min(maxSpeed, coneVelocity));

  coneX += coneVelocity;

  const margin = 60;
  coneX = Math.max(margin, Math.min(canvas.width - margin, coneX));

  // 🍦 squash & stretch (visual feel)
  coneScale = 1 + Math.abs(coneVelocity) * 0.01;
  coneScale = Math.min(1.25, coneScale);
}

let coneScale = 1;

// =====================
// PARTICLES
// =====================
function spawnParticle(x, y, color) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      color
    });
  }
}

function updateParticles() {
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
}

// =====================
// DRAW CONE (JUICED)
// =====================
function drawCone() {
  const x = coneX;
  const y = canvas.height - 120;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(coneScale, 1);

  ctx.fillStyle = "#d8a15a";

  ctx.beginPath();
  ctx.moveTo(-60, 0);
  ctx.lineTo(60, 0);
  ctx.lineTo(0, 140);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  roundCounter.style.left = x + "px";
  roundCounter.style.top = (y + 20) + "px";
}

// =====================
function drawBall(b) {
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
}

// =====================
// UPDATE GAME
// =====================
function update() {
  if (state !== "play") return;

  updateCone();
  updateParticles();

  for (let b of levelBalls) {
    if (!b.spawned) {
      const last = balls[balls.length - 1];
      const triggerY = canvas.height * b.trigger;

      if (!last || last.y > triggerY) {
        b.spawned = true;
        balls.push(b);
      }
    }
  }

  for (let i = 0; i < balls.length; i++) {
    let b = balls[i];
    b.y += b.speed;

    const hit =
      b.y > canvas.height - 100 &&
      Math.abs(b.x - coneX) < 65; // 🎯 slight assist

    if (hit) {
      score++;
      caughtCount++;

      spawnParticle(b.x, b.y, b.color);

      beep(600, 0.05, "sine", 0.04);
      vibrate(15);

      balls.splice(i, 1);
      i--;
      continue;
    }

    if (b.y > canvas.height) {
      lives--;

      shake = 10;
      beep(200, 0.08, "square", 0.03);
      vibrate(40);

      balls.splice(i, 1);
      i--;
    }
  }

  roundCounter.innerText = `${caughtCount} / 20`;

  if (caughtCount >= 20 && balls.length === 0) {
    score += 100;
    state = "next";
    setScreen("nextLevelScreen");
  }

  if (lives <= 0) gameOver();
}

// =====================
function gameOver() {
  state = "gameover";
  setScreen("gameOver");
  document.getElementById("finalScore").innerText = "Счёт: " + score;
}

// =====================
// RENDER (with shake + particles)
// =====================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  if (shake > 0) {
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    shake *= 0.9;
  }

  drawCone();

  for (let b of balls) drawBall(b);

  // particles
  for (let p of particles) {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.fillRect(p.x, p.y, 3, 3);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  document.getElementById("score").innerText = "Очки: " + score;
  document.getElementById("lives").innerText = "❤️".repeat(lives);
  document.getElementById("level").innerText = "Уровень: " + level;
}

// =====================
function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

setScreen("startScreen");
loop();
