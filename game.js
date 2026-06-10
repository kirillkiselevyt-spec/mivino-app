// Запуск игрового цикла строго после инициализации ассетов
Assets.load(() => {
  Engine.init();
  Engine.frameCount = 0;

  function gameLoop() {
    if (GameState.state === "play") {
      Engine.frameCount++;
    }
    Engine.update();
    Renderer.draw(Engine.ctx);
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});