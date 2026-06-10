const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const roundCounter = document.getElementById("roundCounter");

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// STATE
let state = "menu";

// GAME
let coneX = innerWidth / 2;

let score = 0;
let lives = 5;
let level = 1;

let caughtCount = 0;     // ✅ ВАЖНО: пойманные
let spawnedCount = 0;    // служебный (не для UI)

let balls = [];
let levelBalls = [];

const colors = ["#ff5c7a","#ffcc66","#7a4dff","#5ad1ff","#34d399"];

// INPUT
addEventListener("mousemove", e => coneX = e.clientX);

// =====================
// SCREEN CONTROL
// =====================
function showScreen(id) {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("nextLevelScreen").style.display = "none";
  document.getElementById("gameOver").style.display = "none";

  if (id) document.getElementById(id).style.display = "flex";
}

// =====================
// START GAME
// =====================
window.startGame = function () {
  score = 0;
  lives = 5;
  level = 1;

  caughtCount = 0;   // ✅ reset
  startLevel();

  state = "play";
  showScreen(null);
};

// =====================
window.nextLevel = function () {
  level++;
  if (level > 20) return gameOver();

  startLevel();
  state = "play";
  showScreen(null);
};

// =====================
window.restartGame = function () {
  startGame();
};

// =====================
window.backToMenu = function () {
  state = "menu";
  showScreen("startScreen");
};

// =====================
// LEVEL SETUP
// =====================
function startLevel() {
  balls = [];
  levelBalls = [];
  spawnedCount = 0;
  caughtCount = 0;

  for (let i = 0; i < 20; i++) {
    const t = i / 19;
    const trigger = 0.6 - 0.2 * t;

    levelBalls.push({
      x: Math.random() * canvas.width,
      y: -50,
      r: 22,
      speed: 2 + level * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      spawned: false,
      trigger
    });
  }

  updateCounter();
}

// =====================
// CONE + UI ANCHOR
// =====================
function drawCone() {
  const x = coneX;
  const y = canvas.height - 120;

  const g = ctx.createLinearGradient(x, y, x, y + 140);
  g.addColorStop(0, "#f6d7a7");
  g.addColorStop(1, "#b8874f");

  ctx.fillStyle = g;

  ctx.beginPath();
  ctx.moveTo(x - 60, y);
  ctx.lineTo(x + 60, y);
  ctx.lineTo(x, y + 140);
  ctx.closePath();
  ctx.fill();

  roundCounter.style.left = x + "px";
  roundCounter.style.top = (y + 20) + "px";
}

// =====================
// BALL
// =====================
function drawBall(b) {
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
}

// =====================
// UPDATE COUNTER (FIX)
// =====================
function updateCounter() {
  roundCounter.innerText = `${caughtCount} / 20`;
}

// =====================
// UPDATE
// =====================
function update() {
  if (state !== "play") return;

  // spawn
  for (let b of levelBalls) {
    if (!b.spawned) {
      const last = balls[balls.length - 1];
      const triggerY = canvas.height * b.trigger;

      if (!last || last.y > triggerY) {
        b.spawned = true;
        balls.push(b);
        spawnedCount++;
      }
    }
  }

  for (let i = 0; i < balls.length; i++) {
    let b = balls[i];
    b.y += b.speed;

    const hit =
      b.y > canvas.height - 100 &&
      Math.abs(b.x - coneX) < 60;

    if (hit) {
      score++;
      caughtCount++;     // ✅ ВОТ ГЛАВНЫЙ ФИКС

      updateCounter();

      balls.splice(i, 1);
      i--;
      continue;
    }

    if (b.y > canvas.height) {
      lives--;
      balls.splice(i, 1);
      i--;
    }
  }

  if (caughtCount >= 20 && balls.length === 0) {
    score += 100;
    state = "next";
    showScreen("nextLevelScreen");
  }

  if (lives <= 0) gameOver();
}

// =====================
function gameOver() {
  state = "gameover";
  showScreen("gameOver");
  document.getElementById("finalScore").innerText = "Счёт: " + score;
}

// =====================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCone();

  for (let b of balls) drawBall(b);

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

showScreen("startScreen");
loop();