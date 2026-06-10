const Engine = {
  canvas: document.getElementById("game"),
  ctx: null, scale: 1,
  init() {
    this.ctx = this.canvas.getContext("2d");
    window.addEventListener("resize", () => this.resize());
    this.resize();
  },
  resize() {
    this.scale = window.innerWidth / GameState.BASE_W;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },
  update() {
    const range = (GameState.selectedSkin === "krem") ? 182 : 140;
    // Логика ловли: проверка дистанции между шаром и coneX
  }
};