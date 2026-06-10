const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// UI
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

let balls = [];
let levelBalls = [];
let particles = [];
let shake = 0;

// cone
let coneX = innerWidth/2;
let coneV = 0;
let targetX = coneX;

// =====================
// INPUT (SAFE CROSS-BROWSER)
// =====================
function setInput(x){ targetX = x; }

window.addEventListener("pointermove", e => setInput(e.clientX));
window.addEventListener("touchmove", e => setInput(e.touches[0].clientX), { passive:true });

// =====================
// UI CONTROL
// =====================
function show(s){
  Object.values(screens).forEach(v => v.style.display="none");
  if(s) s.style.display="flex";
}

window.openStats = () => show(screens.stats);
window.closeStats = () => show(screens.start);

// =====================
window.startGame = function(){
  score=0;lives=5;level=1;caught=0;
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
  balls=[]; levelBalls=[]; caught=0; particles=[];

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
// PHYSICS (STABLE V20)
// =====================
function updateCone(){
  const force=(targetX-coneX)*0.16;
  coneV=(coneV+force)*0.84;
  coneV=Math.max(-26,Math.min(26,coneV));
  coneX+=coneV;
  coneX=Math.max(60,Math.min(canvas.width-60,coneX));
}

// =====================
// JUICE (SAFE)
// =====================
function vibrate(ms){
  if(navigator.vibrate) navigator.vibrate(ms);
}

let audioReady=false;
function beep(f){
  if(!audioReady){
    audioReady=true;
    return;
  }
  try{
    const a=new AudioContext();
    const o=a.createOscillator();
    o.frequency.value=f;
    o.connect(a.destination);
    o.start();
    o.stop(a.currentTime+0.05);
  }catch(e){}
}

function burst(x,y,c){
  for(let i=0;i<6;i++){
    particles.push({
      x,y,
      vx:(Math.random()-0.5)*3,
      vy:(Math.random()-0.5)*3,
      life:25,
      color:c
    });
  }
}

// =====================
function update(){
  if(state!=="play") return;

  updateCone();

  for(let b of levelBalls){
    if(!b.spawned){
      const last=balls[balls.length-1];
      if(!last||last.y>canvas.height*b.trigger){
        b.spawned=true;
        balls.push(b);
      }
    }
  }

  for(let i=0;i<balls.length;i++){
    let b=balls[i];
    b.y+=b.speed;

    const hit=b.y>canvas.height-100 && Math.abs(b.x-coneX)<65;

    if(hit){
      score++;caught++;
      burst(b.x,b.y,b.color);
      vibrate(10);
      beep(600);
      balls.splice(i--,1);
      continue;
    }

    if(b.y>canvas.height){
      lives--;shake=8;
      vibrate(30);
      beep(180);
      balls.splice(i--,1);
    }
  }

  roundCounter.innerText=`${caught}/20`;

  if(caught>=20 && balls.length===0){
    score+=100;
    state="next";
    show(screens.next);
  }

  if(lives<=0) gameOver();
}

// =====================
function gameOver(){
  state="over";
  show(screens.over);

  document.getElementById("finalScore").innerText="Счёт: "+score;

  let best=localStorage.getItem("best")||0;
  if(score>best){
    localStorage.setItem("best",score);
    best=score;
  }

  document.getElementById("bestScore").innerText=best;
}

// =====================
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // cone
  ctx.fillStyle="#d8a15a";
  ctx.beginPath();
  ctx.moveTo(coneX-60,canvas.height-120);
  ctx.lineTo(coneX+60,canvas.height-120);
  ctx.lineTo(coneX,canvas.height-20);
  ctx.fill();

  // balls
  for(let b of balls){
    ctx.fillStyle=b.color;
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
    ctx.fill();
  }

  // particles
  for(let p of particles){
    ctx.globalAlpha=p.life/25;
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x,p.y,3,3);
    p.x+=p.vx;p.y+=p.vy;p.life--;
  }
  ctx.globalAlpha=1;
  particles=particles.filter(p=>p.life>0);

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
