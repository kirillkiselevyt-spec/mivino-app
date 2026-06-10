const Engine = {
  canvas: document.getElementById("game"),
  ctx: null,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  frameCount: 0,

  init() {
    this.ctx = this.canvas.getContext("2d");
    this.resize();

    window.addEventListener("resize", () => this.resize());

    const handleMove = (clientX) => {
      if (GameState.state !== "play") return;
      const xInGameSpace = (clientX - this.offsetX) / this.scale;
      GameState.targetX = Math.max(50, Math.min(GameState.BASE_W - 50, xInGameSpace));
    };

    window.addEventListener("pointermove", e => handleMove(e.clientX));
    window.addEventListener("touchmove", e => {
      if (e.touches && e.touches[0]) handleMove(e.touches[0].clientX);
    }, { passive: true });

    UI.show("startScreen");
  },

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;

    const scaleX = w / GameState.BASE_W;
    const scaleY = h / GameState.BASE_H;
    this.scale = Math.min(scaleX, scaleY);

    this.offsetX = (w - GameState.BASE_W * this.scale) / 2;
    this.offsetY = (h - GameState.BASE_H * this.scale) / 2;

    document.documentElement.style.setProperty('--ui-scale', this.scale);
  },

  update() {
    if (GameState.state !== "play") return;
    this.frameCount++;

    const g = GameState;

    // Расчет движения рожка
    const force = (g.targetX - g.coneX) * 0.22;
    g.coneV = (g.coneV + force) * 0.76;
    g.coneX += g.coneV;

    // ЭФФЕКТ ЖЕЛЕ: Изменение формы рожка от скорости движения
    g.coneScaleX = 1 - Math.abs(g.coneV) * 0.015;
    g.coneScaleY = 1 + Math.abs(g.coneV) * 0.015;

    // Плавное возвращение формы рожка к стандартным 1.0 (затухание пружины)
    g.coneScaleX += (1 - g.coneScaleX) * 0.15;
    g.coneScaleY += (1 - g.coneScaleY) * 0.15;

    // Обновление логики всплывающего текста (+10)
    g.popups.forEach(p => {
      p.y -= 1.5; // Текст плавно летит вверх
      p.life--;
    });
    g.popups = g.popups.filter(p => p.life > 0);

    g.pool.forEach(b => {
      if (!b.active && this.frameCount >= b.spawnDelay) {
        b.active = true;
        g.balls.push(b);
      }
    });

    for (let i = 0; i < g.balls.length; i++) {
      let b = g.balls[i];
      b.y += b.speed;

      const hit = Math.abs(b.x - g.coneX) < 140 && b.y >= (g.BASE_H - 160) && b.y <= (g.BASE_H - 100);

      if (hit) {
        g.score += 10;
        g.caught++;

        // Создаем сочный поп-ап текст в месте поимки
        g.popups.push({
          x: b.x,
          y: g.BASE_H - 180,
          text: "+10",
          life: 35,
          maxLife: 35
        });

        g.balls.splice(i--, 1);

        // Импульс деформации рожка: при падении шарика рожок сжимается по вертикали
        g.coneScaleX = 1.3;
        g.coneScaleY = 0.7;

        FX.spawnParticles(b.x, b.y);
        FX.addShake(6);

        // НАДЕЖНАЯ ВИБРАЦИЯ: Работает в VK App и обычных браузерах на смартфонах
        if (navigator.vibrate) {
          navigator.vibrate(40); // Короткий тактильный отклик 40мс
        }
        if (window.vkBridge) {
          window.vkBridge.send("VKWebAppTapticNotificationOccurred", { type: "success" }).catch(() => {});
        }
        continue;
      }

      if (b.y > g.BASE_H) {
        g.lives--;
        g.missed++;
        g.balls.splice(i--, 1);

        FX.addShake(14);

        // Вибрация при промахе (более длинная и ощутимая)
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]); 
        }
        if (window.vkBridge) {
          window.vkBridge.send("VKWebAppTapticNotificationOccurred", { type: "warning" }).catch(() => {});
        }
      }
    }

    if (g.lives <= 0) {
      this.endSession("over");
    } else if (g.caught + g.missed === 20) {
      this.endSession("next");
    }

    FX.update();
  },

  endSession(status) {
    const g = GameState;
    g.state = status;

    if (status === "over") {
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const rawHistory = localStorage.getItem("mivino_games_history") || "[]";
      const history = JSON.parse(rawHistory);
      
      history.push({
        score: g.score,
        level: g.level,
        date: dateStr
      });
      
      localStorage.setItem("mivino_games_history", JSON.stringify(history));

      document.getElementById("finalScore").innerText = "Итоговый счёт: " + g.score;
      document.getElementById("finalLevel").innerText = "Достигнут уровень: " + g.level;
      
      document.getElementById("endLeaderboardContainer").innerHTML = UI.buildLeaderboardHTML(history, 3);
      UI.show("gameOver");
      
    } else if (status === "next") {
      const bonusAlert = document.getElementById("levelBonusAlert");
      if (g.level % 10 === 0) {
        g.score += 300;
        if (bonusAlert) bonusAlert.style.display = "block";
      } else {
        if (bonusAlert) bonusAlert.style.display = "none";
      }
      UI.show("nextLevelScreen");
    }
  },

  loop() {
    this.update();
    Renderer.draw(this.ctx, this.scale, this.offsetX, this.offsetY);
    requestAnimationFrame(() => this.loop());
  }
};