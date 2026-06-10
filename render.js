const Renderer = {
  draw(ctx, scale, offsetX, offsetY) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 1. Размытый фон во весь экран
    if (Assets.loaded && Assets.bg.complete) {
      ctx.save();
      ctx.filter = "blur(15px) brightness(0.85)";
      ctx.drawImage(Assets.bg, 0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    // 2. Вход в виртуальное игровое пространство
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.rect(0, 0, GameState.BASE_W, GameState.BASE_H);
    ctx.clip();

    if (Assets.loaded && Assets.bg.complete) {
      ctx.drawImage(Assets.bg, 0, 0, GameState.BASE_W, GameState.BASE_H);
    }

    FX.applyShake(ctx);

    const g = GameState;

    // 3. ОТРИСОВКА РОЖКА С ЭФФЕКТОМ ЖЕЛЕ (Squash & Stretch)
    ctx.save();
    // Переносим центр координат в точку опоры рожка (низ стаканчика)
    ctx.translate(g.coneX, g.BASE_H - 40);
    // Деформируем контекст на основе динамических масштабов пружины
    ctx.scale(g.coneScaleX, g.coneScaleY);

    if (Assets.loaded && Assets.cone.complete) {
      // Рисуем рожок относительно локального смещенного центра
      ctx.drawImage(Assets.cone, -220, -160, 440, 220);
    } else {
      ctx.fillStyle = "#d9a066";
      ctx.fillRect(-140, -120, 280, 160);
    }
    ctx.restore(); // Сбрасываем деформацию желе, чтобы она не влияла на шарики

    // 4. Отрисовка шариков (Крупные сочные эллипсы)
    g.balls.forEach(b => {
      const ballW = b.r * 6;
      const ballH = b.r * 3;
      
      if (Assets.loaded && Assets.balls[b.imgIndex] && Assets.balls[b.imgIndex].complete) {
        ctx.drawImage(Assets.balls[b.imgIndex], b.x - ballW / 2, b.y - ballH / 2, ballW, ballH);
      } else {
        ctx.fillStyle = "#ff6b6b";
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, ballW / 2, ballH / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 5. Отрисовка брызг мороженого
    FX.particles.forEach(p => {
      const maxLife = p.maxLife || 40; 
      const lifeRatio = Math.max(0, Math.min(1, p.life / maxLife));
      
      ctx.save();
      ctx.globalAlpha = lifeRatio;
      
      const currentRadius = p.r * lifeRatio;
      const velocityAngle = Math.atan2(p.vy, p.vx);
      
      ctx.fillStyle = "#fff8f0";
      ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
      ctx.shadowBlur = 8 * lifeRatio;

      ctx.beginPath();
      const stretch = Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 0.12;
      ctx.ellipse(
        p.x, 
        p.y, 
        currentRadius + stretch, 
        Math.max(1, currentRadius), 
        velocityAngle, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    });

    // 6. ОТРИСОВКА ВСПЛЫВАЮЩЕГО ТЕКСТА ОЧКОВ (+10)
    g.popups.forEach(p => {
      ctx.save();
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#ff4791";
      ctx.shadowBlur = 6;
      ctx.font = "bold 24px 'Lora', serif";
      ctx.textAlign = "center";
      
      // Выводим текст
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    });

    ctx.restore();

    this.updateDOMUI(scale, offsetX, offsetY);
  },

  updateDOMUI(scale, offsetX, offsetY) {
    const g = GameState;
    document.getElementById("score").innerText = "Очки: " + g.score;
    document.getElementById("lives").innerText = "❤️".repeat(Math.max(0, g.lives));
    document.getElementById("level").innerText = "Уровень: " + g.level;

    const counter = document.getElementById("roundCounter");
    if (counter) {
      counter.innerText = `${g.caught + g.missed} / 20`;
      counter.style.left = (g.coneX * scale + offsetX) + "px";
      counter.style.top = ((g.BASE_H - 220) * scale + offsetY) + "px";
    }
  }
};

const UI = {
  show(screenId) {
    const list = ["startScreen", "statsScreen", "nextLevelScreen", "gameOver"];
    list.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    if (screenId === "play") return;

    const target = document.getElementById(screenId) || document.getElementById(screenId + "Screen");
    if (target) target.style.display = "flex";
  },

  buildLeaderboardHTML(games, limit = 5) {
    if (!games || games.length === 0) return "<p>Нет записей</p>";
    const topGames = [...games].sort((a, b) => b.score - a.score).slice(0, limit);
    
    let html = `<table class="stats-table"><tr><th>Место</th><th>Очки</th><th>Уровень</th><th>Дата</th></tr>`;
    topGames.forEach((game, index) => {
      html += `<tr><td><strong>#${index + 1}</strong></td><td>${game.score}</td><td>${game.level}</td><td style="font-size:11px">${game.date}</td></tr>`;
    });
    html += `</table>`;
    return html;
  },

  buildHistoryHTML(games) {
    if (!games || games.length === 0) return "<p style='text-align:center'>Вы еще не сыграли ни одной игры</p>";
    const chronological = [...games].reverse();
    
    let html = `<div class="scroll-box"><table class="stats-table" style="margin:0; max-width:100%;"><tr><th>Дата/Время</th><th>Очки</th><th>Ур.</th></tr>`;
    chronological.forEach(game => {
      html += `<tr><td style="font-size:11px">${game.date}</td><td>${game.score}</td><td>${game.level}</td></tr>`;
    });
    html += `</table></div>`;
    return html;
  }
};

window.startGame = () => {
  GameState.score = 0;
  GameState.lives = 5;
  GameState.level = 1;
  GameState.initLevel();
  Engine.frameCount = 0;
  GameState.state = "play";
  UI.show("play");
};

window.restartGame = () => window.startGame();

window.nextLevel = () => {
  GameState.level++;
  GameState.initLevel();
  Engine.frameCount = 0;
  GameState.state = "play";
  UI.show("play");
};

window.openStats = () => {
  GameState.statsOpenedFrom = "menu";
  const rawData = localStorage.getItem("mivino_games_history") || "[]";
  const games = JSON.parse(rawData);
  
  document.getElementById("leaderboardContainer").innerHTML = UI.buildLeaderboardHTML(games, 5);
  document.getElementById("historyContainer").innerHTML = UI.buildHistoryHTML(games);
  UI.show("statsScreen");
};

window.openStatsFromGameOver = () => {
  GameState.statsOpenedFrom = "over";
  const rawData = localStorage.getItem("mivino_games_history") || "[]";
  const games = JSON.parse(rawData);
  
  document.getElementById("leaderboardContainer").innerHTML = UI.buildLeaderboardHTML(games, 5);
  document.getElementById("historyContainer").innerHTML = UI.buildHistoryHTML(games);
  UI.show("statsScreen");
};

window.closeStats = () => {
  if (GameState.statsOpenedFrom === "over") {
    UI.show("gameOver");
  } else {
    UI.show("startScreen");
  }
};