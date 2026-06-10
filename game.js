const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;
function resize(){
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

// =====================
let state = "menu";

let score = 0;
let lives = 5;
let level = 1;

let caught = 0;
let missed = 0;

let balls = [];
let pool = [];

let coneX = innerWidth / 2;

// ===================== UI
const ui = {
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  level: document.getElementById("level"),
  round: document.getElementById("round"),
  best: document.getElementById("best"),
  last: document.getElementById("last"),
  final: document.getElementById("final")
};

const screens = {
  start: document.getElementById("start"),
  stats: document.getElementById("stats"),
  next: document.getElementById("next"),
  over: document.getElementById("over")
};

// =====================
addEventListener("pointermove", e => {
  coneX = e.clientX;
});

// =====================
function show(name){
  Object.values(screens).forEach(s => s.style.display = "none");
  if(name) screens[name].style.display = "flex";
}

// =====================
// 🌫 NEW: SOFT CANVAS BACKGROUND GRADIENT
// =====================
function drawBackground(){
  const g = ctx.createLinearGradient(0,0,W,H);

  g.addColorStop(0, "#f7f5ff");
  g.addColorStop(0.5, "#eef7ff");
  g.addColorStop(1, "#fff4f7");

  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);
}

// =====================
function startLevel(){
  balls = [];
  pool = [];
  caught = 0;
  missed = 0;

  for(let i=0;i<20;i++){
    pool.push({
      x: Math.random()*W,
      y: -50,
      r: 20,
      speed: 2 + level * 0.3,
      color: ["#ff5c7a","#ffcc66","#7a4dff","#5ad1ff","#34d399"][i%5],
      active: false
    });
  }
}

// =====================
function startGame(){
  score = 0;
  lives = 5;
  level = 1;

  startLevel();
  state = "play";
  show(null);
}

// =====================
function checkRound(){
  const total = caught + missed;

  if(total === 20){
    if(lives > 0){
      score += 100;
      save();
      state = "next";
      show("next");
    } else {
      gameOver();
    }
  }
}

// =====================
function save(){
  localStorage.setItem("last", score);
  let best = localStorage.getItem("best") || 0;
  if(score > best){
    localStorage.setItem("best", score);
  }
}

// =====================
function spawn(){
  for(let b of pool){
    if(!b.active){
      const last = balls[balls.length-1];
      if(!last || last.y > H * 0.6){
        b.active = true;
        balls.push(b);
      }
    }
  }
}

// =====================
function update(){
  if(state !== "play") return;

  spawn();

  for(let i=0;i<balls.length;i++){
    let b = balls[i];
    b.y += b.speed;

    const hit = Math.abs(b.x - coneX) < 60 && b.y > H - 120;

    if(hit){
      score++;
      caught++;
      balls.splice(i--,1);
      continue;
    }

    if(b.y > H){
      lives--;
      missed++;
      balls.splice(i--,1);
    }
  }

  ui.round.innerText = `${caught+missed}/20`;

  if(lives <= 0) gameOver();

  checkRound();
}

// =====================
function gameOver(){
  state = "over";
  show("over");

  ui.final.innerText = "Счёт: " + score;

  ui.best.innerText = localStorage.getItem("best") || 0;
  ui.last.innerText = localStorage.getItem("last") || 0;
}

// =====================
function render(){
  drawBackground(); // ✅ IMPORTANT FIX

  ctx.fillStyle = "#d8a15a";
  ctx.beginPath();
  ctx.moveTo(coneX - 60, H - 120);
  ctx.lineTo(coneX + 60, H - 120);
  ctx.lineTo(coneX, H - 20);
  ctx.fill();

  for(let b of balls){
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.fill();
  }

  ui.score.innerText = "Очки: " + score;
  ui.lives.innerText = "❤️".repeat(lives);
  ui.level.innerText = "Уровень: " + level;
}

// =====================
function loop(){
  update();
  render();
  requestAnimationFrame(loop);
}

// =====================
document.getElementById("playBtn").onclick = startGame;
document.getElementById("statsBtn").onclick = () => show("stats");
document.getElementById("backBtn").onclick = () => show("start");
document.getElementById("restartBtn").onclick = startGame;
document.getElementById("nextBtn").onclick = () => {
  level++;
  startLevel();
  state = "play";
  show(null);
};
document.getElementById("overStatsBtn").onclick = () => show("stats");

show("start");
loop();
