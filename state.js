const GameState = {
  state: "menu",
  BASE_W: 450,
  BASE_H: 800,

  score: 0,
  lives: 5,
  level: 1,

  caught: 0,
  missed: 0,

  balls: [],
  pool: [],

  coneX: 225, 
  targetX: 225,
  coneV: 0,

  // Параметры сочности (Juiciness) для анимации рожка-желе
  coneScaleX: 1,
  coneScaleY: 1,
  
  // Массив для всплывающего текста (+10 очков)
  popups: [],

  statsOpenedFrom: "menu",

  initLevel() {
    this.balls = [];
    this.pool = [];
    this.caught = 0;
    this.missed = 0;
    this.popups = []; // Очищаем поп-апы при старте уровня

    const availableBallImages = Assets.balls.length > 0 ? Assets.balls.length : 4;

    for (let i = 0; i < 20; i++) {
      this.pool.push({
        x: Math.random() * (this.BASE_W - 120) + 60,
        y: -60,
        r: 25, 
        speed: 2.5 + this.level * 0.45,
        imgIndex: Math.floor(Math.random() * availableBallImages),
        active: false,
        spawnDelay: i * 75
      });
    }
  }
};