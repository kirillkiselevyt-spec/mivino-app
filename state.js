const GameState = {
  state: "start",

  score: 0,
  lives: 5,
  level: 1,

  caught: 0,
  missed: 0,

  balls: [],
  pool: [],

  coneX: innerWidth / 2,

  initLevel() {
    this.balls = [];
    this.pool = [];
    this.caught = 0;
    this.missed = 0;

    for (let i = 0; i < 20; i++) {
      this.pool.push({
        x: Math.random() * innerWidth,
        y: -50,
        r: 20,
        speed: 2 + this.level * 0.35,
        img: Assets.balls[Math.floor(Math.random() * Assets.balls.length)],
        active: false
      });
    }
  }
};