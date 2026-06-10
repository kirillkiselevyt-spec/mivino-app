const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// UI
// =====================
const screens = {
  start: document.getElementById("startScreen"),
  stats: document.getElementById("statsScreen"),
  next: document.getElementById("nextScreen"),
  over: document.getElementById("gameOverScreen")
};

const ui = {
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  level: document.getElementById("level"),
  round: document.getElementById("roundCounter"),
  best: document.getElementById("bestScore"),
  last: document.getElementById("lastScore"),
  final: document.getElementById("finalScore")
};

// =====================
let state = "menu";

let score = 0;
let lives = 5;
let level = 1;

let caught = 0;
let missed = 0;

let balls = [];
let pool = [];

// cone
let coneX = 0;

// =====================
function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  coneX = innerWidth / 2;
}
addEventListener("resize", resize);
resize();

// =====================
// INPUT
// =====================
addEventListener("pointermove", e => {
  coneX = e.clientX;
});

// =====================
// SAFE UI SWITCH
// =====================
function showScreen(name){
  Object.values(screens).forEach(s => s.style.display = "none");
  if(name) screens[name].style.display = "flex";
}

// =====================
// INIT GAME
// =====================
function initGame(){
  score = 0;
  lives = 5;
  level = 1;
  caught = 0;
  missed = 0;

  startLevel();
  state = "play";
  showScreen(null);
}

// =====================
function startLevel(){
  balls = [];
  pool = [];

  caught = 0;
  missed = 0;

  for(let i=0;i<20;i++){
    pool.push({
      x: Math.random()*canvas.width,
      y: -50,
      r: 20,
      speed: 2 + level*0.3,
      color: ["#ff5c7a","#ffcc66","#7a4dff","#5ad1ff","#34d399"][i%5],
      active: false,
      done: false
    });
  }
}

// =====================
// ROUND LOGIC (FIXED)
// =====================
function checkRound(){
  const total = caught + missed;

  if(total === 20){
    if(lives > 0){
      score += 100;
      saveStats();
      state = "next";
      showScreen("next");
    } else {
      gameOver();
    }
  }
}

// =====================
function saveStats(){
  localStorage.setItem("lastScore", score);

  let best = localStorage.getItem("best") || 0;
  if(score > best){
    localStorage.setItem("best", score);
  }
}

// =====================
function spawnLogic(){
  for(let b of pool){
    if(!b.active){
      const last = balls[balls.length - 1];
      if(!last || last.y > canvas.height * 0.5){
        b.active = true;
        balls.push(b);
      }
    }
  }
}

// =====================
function update(){
  if(state !== "play") return;

  spawnLogic();

  for(let i=0;i<balls.length;i++){
    let b = balls[i];
    b.y += b.speed;

    const hit = Math.abs(b.x - coneX) < 60 && b.y > canvas.height - 120;

    if(hit){
      score++;
      caught++;
      b.done = true;
      balls.splice(i--,1);
      continue;
    }

    if(b.y > canvas.height){
      lives--;
      missed++;
      b.done = true;
      balls.splice(i--,1);
    }
  }

  ui.round.innerText = `${caught+missed}/20`;

  if(lives <= 0){
    gameOver();
  }

  checkRound();
}

// =====================
function gameOver(){
  state = "over";
  showScreen("over");

  ui.final.innerText = "Счёт: " + score;
  ui.best.innerText = localStorage.getItem("best") || 0;
  ui.last.innerText = localStorage.getItem("lastScore") || 0;
}

// =====================
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = "#d8a15a";
  ctx.beginPath();
  ctx.moveTo(coneX - 60, canvas.height - 120);
  ctx.lineTo(coneX + 60, canvas.height - 120);
  ctx.lineTo(coneX, canvas.height - 20);
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
// BUTTONS (SAFE BIND)
// =====================
window.addEventListener("load", () => {
  document.getElementById("btnStart").onclick = initGame;

  document.getElementById("btnStats").onclick = () => showScreen("stats");
  document.getElementById("btnBack").onclick = () => showScreen("start");

  document.getElementById("btnNext").onclick = () => {
    level++;
    startLevel();
    state = "play";
    showScreen(null);
  };

  document.getElementById("btnRestart").onclick = initGame;

  showScreen("start");
  loop();
});
