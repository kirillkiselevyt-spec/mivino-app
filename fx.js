const FX = {

  particles: [],
  shake: 0,

  spawnParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30
      });
    }
  },

  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });

    this.particles = this.particles.filter(p => p.life > 0);

    this.shake *= 0.85;
  },

  addShake(amount) {
    this.shake = Math.min(20, this.shake + amount);
  },

  applyShake(ctx) {
    const dx = (Math.random() - 0.5) * this.shake;
    const dy = (Math.random() - 0.5) * this.shake;
    ctx.translate(dx, dy);
  }
};