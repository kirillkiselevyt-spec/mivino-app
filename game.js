const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// UI
// =====================
const screens = {
  start: document.getElementById("startScreen"),
  stats: document.getElementById("statsScreen"),
  next: document.getElementById("nextLevelScreen"),
  over: document.getElementById("gameOver")
};

const roundCounter = document.getElementById("roundCounter");

// =====================
function resize(){
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

let caught = 0;
let missed = 0;

let balls = [];
let levelBalls = [];

// =====================
// INPUT
// =====================
let targetX = innerWidth/2;
let coneX = innerWidth/2;
let coneV = 0;

window.addEventListener("pointermove", e => targetX = e.clientX);
window.addEventListener("touchmove", e => targetX = e.touches[0].clientX, {passive:true});

// =====================
// UI FIX (ГЛАВНОЕ)
// =====================
function show(screen){
  Object.values(screens).forEach(s => {
    if(s) s.style.display = "none";
  });

  if(screen) screen.style.display = "flex";
}

// 🔥 ГАРАНТИРОВАННЫЕ ФУНКЦИИ
window.openStats = function(){
  show(screens.stats);
};

window.closeStats = function(){
  show(screens.start);
};

// =====================
window.startGame = function(){
  score=0;
  lives=5;
  level=1;
  caught=0;
  missed=0;

  startLevel();
  state="play";
  show(null);
};

window.restartGame = startGame;

window.nextLevel = function(){
  level++;
  if(level>20) return gameOver();

  startLevel();
  state="play";
  show(null);
};

// =====================
function startLevel(){
  balls=[];
  levelBalls=[];
  caught=0;
  missed=0;

  for(let i=0;i<20;i++){
    const trigger=0.6-0.2*(i/19);

    levelBalls.push({
      x:Math.random()*canvas.width,
      y:-50,
      r:22,
      speed:2+level*0.35,
      color:["#ff5c7a","#ffcc66","#7a4dff","#5ad1ff","#34d399"][i%5],
      spawned:false,
      trigger
    });
  }
}

// =====================
// PHYSICS
// =====================
function updateCone(){
  const force=(targetX-coneX)*0.16;
  coneV=(coneV+force)*0.84;
  coneX+=coneV;

  coneX=Math.max(60,Math.min(canvas.width-60,coneX));
}

// =====================
// ROUND END LOGIC (FIXED V22)
// =====================
function checkRoundEnd(){
  const total = caught + missed;

  if(total >= 20){
    if(lives > 0){
      score += 100;

      localStorage.setItem("lastScore", score);

      let best = localStorage.getItem("best")||0;
      if(score > best){
        localStorage.setItem("best", score);
      }

      state="next";
      show(screens.next);
    } else {
      gameOver();
    }
  }
}

// =====================
function update(){
  if(state!=="play") return;

  updateCone();

  for(let b of levelBalls){
    if(!b.spawned){
      const last = balls[balls.length-1];
      if(!last || last.y > canvas.height*b.trigger){
        b.spawned=true;
        balls.push(b);
      }
    }
  }

  for(let i=0;i<balls.length;i++){
    let b=balls[i];

    b.y += b.speed;

    const hit = b.y > canvas.height-100 && Math.abs(b.x-coneX)<65;

    if(hit){
      score++;
      caught++;
      balls.splice(i--,1);
      continue;
    }

    if(b.y > canvas.height){
      lives--;
      missed++;
      balls.splice(i--,1);
    }
  }

  roundCounter.innerText = `${caught+missed}/20`;

  if(lives <= 0) gameOver();

  checkRoundEnd();
}

// =====================
function gameOver(){
  state="over";
  show(screens.over);

  document.getElementById("finalScore").innerText = "Счёт: " + score;

  document.getElementById("bestScore").innerText =
    localStorage.getItem("best") || 0;

  document.getElementById("lastScore").innerText =
    localStorage.getItem("lastScore") || 0;
}

// =====================
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#d8a15a";
  ctx.beginPath();
  ctx.moveTo(coneX-60,canvas.height-120);
  ctx.lineTo(coneX+60,canvas.height-120);
  ctx.lineTo(coneX,canvas.height-20);
  ctx.fill();

  for(let b of balls){
    ctx.fillStyle=b.color;
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.fill();
  }

  document.getElementById("score").innerText="Очки: "+score;
  document.getElementById("lives").innerText="❤️".repeat(lives);
  document.getElementById("level").innerText="Уровень: "+level;
}

// =====================
function loop(){
  update();
  render();
  requestAnimationFrame(loop);
}

show(screens.start);
loop();
