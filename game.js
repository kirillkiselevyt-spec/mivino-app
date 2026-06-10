window.startGame = () => {
  GameState.score = 0; GameState.lives = 5; GameState.level = 1;
  GameState.initLevel(); Engine.frameCount = 0; GameState.state = "play"; UI.show("play");
};
Assets.load(() => {
  Engine.init();
  function loop() {
    if (GameState.state === "play") Engine.frameCount++;
    Engine.update(); Renderer.draw(Engine.ctx, Engine.scale, Engine.offsetX, Engine.offsetY);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
});