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

let caughtCount = 0;
let balls = [];
let levelBalls = [];

// COLORS
const colors = ["#ff5c7a","#ffcc66","#7a4dff","#5ad1ff","#34d399"];


// =====================
// 🔥 FIX INPUT (MOBILE + DESKTOP)
// =====================

// Pointer Events = лучший вариант
function setConePosition(clientX) {
  coneX = clientX;
}

// mouse
window.addEventListener("mousemove", (e) => {
  setConePosition(e.clientX);
});

// touch (fallback)
window.addEventListener("touchmove", (e) => {
  setConePosition(e.touches[0].clientX);
}, { passive: true });

// pointer (главный фикс для мобильных)
window.addEventListener("pointermove", (e) => {
  setConePosition(e.clientX);
});

// =====================
// UI
// =====================
function showScreen(id) {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("nextLevelScreen").style.display = "none";
  document.getElementById("gameOver").style.display = "none";

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
function startLevel() {
  balls = [];
  levelBalls = [];
  caughtCount = 0;

  for (let i = 0; i < 20; i++) {
    const trigger = 0.6 - 0.2 * (i / 19);

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

  roundCounter.innerText = "0 / 20";
}

// =====================
function drawCone() {
  const x = coneX;
  const y = canvas.height - 120;

  ctx.fillStyle = "#d8a15a";

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
function drawBall(b) {
  ctx.fillStyle = b.color;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
}

// =====================
function update() {
  if (state !== "play") return;

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
      Math.abs(b.x - coneX) < 60;

    if (hit) {
      score++;
      caughtCount++;

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

  roundCounter.innerText = `${caughtCount} / 20`;

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
