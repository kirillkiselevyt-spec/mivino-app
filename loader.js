const Assets = {
  loaded: false,

  balls: [],
  cone: new Image(),
  bg: new Image(),

  load(callback) {

    const ballCount = 4; // поменяй если больше шариков
    let loadedCount = 0;
    const total = ballCount + 2;

    const onLoad = () => {
      loadedCount++;
      if (loadedCount === total) {
        this.loaded = true;
        callback();
      }
    };

    // шарики
    for (let i = 1; i <= ballCount; i++) {
      const img = new Image();
      img.onload = onLoad;
      img.src = `assets/ball_${i}.png`;
      this.balls.push(img);
    }

    // cone
    this.cone.onload = onLoad;
    this.cone.src = "assets/cone.png";

    // bg
    this.bg.onload = onLoad;
    this.bg.src = "assets/bg.png";
  }
};