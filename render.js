const Renderer = {

  draw(ctx) {

    ctx.save();
    FX.applyShake(ctx);

    this.background(ctx);
    this.cone(ctx);
    this.balls(ctx);
    this.particles(ctx);

    ctx.restore();

    this.ui();
  },

  background(ctx) {
    if (Assets.loaded) {

      // 🔥 blur + затемнение
      ctx.save();

      ctx.filter = "blur(8px) brightness(0.75)";
      ctx.drawImage(Assets.bg, 0, 0, innerWidth, innerHeight);

      ctx.restore();

    } else {
      ctx.fillStyle = "#f5f7ff";
      ctx.fillRect(0,0,innerWidth,innerHeight);
    }
  },

  cone(ctx) {
    const x = GameState.coneX;
    const y = innerHeight;

    if (Assets.loaded) {

      ctx.drawImage(
        Assets.cone,
        x - 180,
        y - 200,
        360,
        220
      );

    } else {
      ctx.fillStyle = "#d9a066";
      ctx.fillRect(x - 140, y - 140, 280, 140);
    }
  },

  balls(ctx) {
    for (let b of GameState.balls) {

      // 🔥 новый размер
      const base = b.r * 2 * 3;

      // 🔥 делаем шире (X ×2)
      const width = base * 2;
      const height = base;

      if (Assets.loaded && b.img) {

        ctx.drawImage(
          b.img,
          b.x - width / 2,
          b.y - height / 2,
          width,
          height
        );

      } else {

        ctx.fillStyle = "#ff6b6b";

        ctx.beginPath();
        ctx.ellipse(
          b.x,
          b.y,
          width / 2,
          height / 2,
          0,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    }
  },

  particles(ctx) {
    for (let p of FX.particles) {

      ctx.globalAlpha = p.life / 30;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  },

  ui() {
    const g = GameState;

    document.getElementById("score").innerText = "Очки: " + g.score;
    document.getElementById("lives").innerText = "❤️".repeat(g.lives);
    document.getElementById("level").innerText = "Уровень: " + g.level;
  }
};