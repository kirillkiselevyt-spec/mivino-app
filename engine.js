const Engine = {
  canvas: document.getElementById("game"),
  ctx: null,

  init() {
    this.ctx = this.canvas.getContext("2d");
    this.resize();

    window.addEventListener("resize", () => this.resize());

    window.addEventListener("pointermove", e => {
      GameState.coneX = e.clientX;
    });
  },

  resize() {
    this.canvas.width = innerWidth;
    this.canvas.height = innerHeight;
  },

  update() {
    if (GameState.state !== "play") return;

    this.spawn();

    const g = GameState;

    for (let i = 0; i < g.balls.length; i++) {
      let b = g.balls[i];
      b.y += b.speed;

      // 🔥 увеличенный хитбокс
      const hit =
        Math.abs(b.x - g.coneX) < 160 &&
        b.y > innerHeight - 180;

      if (hit) {
        g.score++;
        g.caught++;
        g.balls.splice(i--, 1);

        FX.spawnParticles(b.x, b.y);
        FX.addShake(6);
        continue;
      }

      if (b.y > innerHeight) {
        g.lives--;
        g.missed++;
        g.balls.splice(i--, 1);

        FX.addShake(3);
      }
    }

    document.getElementById("round").innerText =
      `${g.caught + g.missed} / 20`;

    if (g.caught + g.missed === 20) {
      g.state = "next";
      UI.show("next");
    }

    if (g.lives <= 0) {
      g.state = "over";
      UI.show("over");
    }

    FX.update();
  },

  spawn() {
    const g = GameState;

    for (let b of g.pool) {
      if (!b.active) {
        const last = g.balls[g.balls.length - 1];
        if (!last || last.y > innerHeight * 0.6) {
          b.active = true;
          g.balls.push(b);
        }
      }
    }
  },

  loop() {
    this.update();
    Renderer.draw(this.ctx);
    requestAnimationFrame(() => this.loop());
  }
};