const Assets = {
  loaded: false,
  ballCount: 5, // ИСПРАВЛЕНО: было 4, шариков в проекте 5

  balls: [],
  cone: new Image(),
  bg: new Image(),

  load(callback) {
    let loadedCount = 0;
    const total = this.ballCount + 2;

    const onLoad = () => {
      loadedCount++;
      if (loadedCount === total) {
        this.loaded = true;
        callback();
      }
    };

    for (let i = 1; i <= this.ballCount; i++) {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = onLoad;
      img.src = `assets/ball_${i}.png`;
      this.balls.push(img);
    }

    this.cone.onload = onLoad;
    this.cone.onerror = onLoad;
    this.cone.src = "assets/cone.png";

    this.bg.onload = onLoad;
    this.bg.onerror = onLoad;
    this.bg.src = "assets/bg.png";
  }
};
