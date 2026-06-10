const Assets = {
  loaded: false, ballCount: 4,
  balls: [], cone: new Image(), krem: new Image(), bg: new Image(),
  load(callback) {
    let loadedCount = 0;
    const total = this.ballCount + 3; // 4 шара + рожок + креманка + фон
    const onLoad = () => { if (++loadedCount === total) { this.loaded = true; callback(); } };
    for (let i = 1; i <= this.ballCount; i++) {
      const img = new Image(); img.onload = onLoad; img.onerror = onLoad;
      img.src = `assets/ball_${i}.png`; this.balls.push(img);
    }
    this.cone.onload = onLoad; this.cone.src = "assets/cone.png";
    this.krem.onload = onLoad; this.krem.src = "assets/krem.png";
    this.bg.onload = onLoad; this.bg.src = "assets/bg.png";
  }
};