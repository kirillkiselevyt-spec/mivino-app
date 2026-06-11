const FX = {
  particles: [],
  shake: 0,

  // Настройки физики брызг мороженого
  settings: {
    count: 20,          // Количество капель при попадании
    gravity: 0.15,      // Сила притяжения (тянет брызги вниз)
    friction: 0.96,     // Трение (плавно замедляет капли в стороны)
    baseLife: 40,       // Время жизни капли в кадрах
    baseSize: 6         // Базовый радиус капли
  },

  spawnParticles(x, y) {
    for (let i = 0; i < this.settings.count; i++) {
      // Направляем брызги преимущественно вверх под случайными углами
      const angle = (Math.random() * (Math.PI * 0.8) + Math.PI * 1.1);
      const speed = Math.random() * 5 + 3;
      const calculatedLife = this.settings.baseLife + Math.floor((Math.random() - 0.5) * 10);

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: calculatedLife,
        maxLife: calculatedLife, // ЭТО ПОЛЕ ОБЯЗАТЕЛЬНО ДОЛЖНО БЫТЬ ТУТ
        r: this.settings.baseSize + (Math.random() - 0.5) * 3
      });
    }
  },

  update() {
    this.particles.forEach(p => {
      p.vx *= this.settings.friction;
      p.vy += this.settings.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });

    // Очищаем «мертвые» капли
    this.particles = this.particles.filter(p => p.life > 0);

    this.shake *= 0.88;
    if (this.shake < 0.1) this.shake = 0;
  },

  addShake(amount) {
    this.shake = Math.min(25, this.shake + amount);
  },

  applyShake(ctx) {
    if (this.shake === 0) return;
    const dx = (Math.random() - 0.5) * this.shake;
    const dy = (Math.random() - 0.5) * this.shake;
    ctx.translate(dx, dy);
  }
};
