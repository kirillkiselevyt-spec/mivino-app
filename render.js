const UI = {
  show(id) {
    ["startScreen", "statsScreen", "nextLevelScreen", "gameOver", "inventoryScreen"].forEach(s => {
      document.getElementById(s).style.display = (s === id) ? "block" : "none";
    });
  },
  buildLeaderboardHTML(games, limit) {
    games.sort((a, b) => b.score - a.score);
    let html = `<table class="stats-table"><tr><th>Очки</th><th>Уровень</th></tr>`;
    games.slice(0, limit).forEach(game => {
      html += `<tr><td>${game.score}</td><td>${game.level}</td></tr>`;
    });
    return html + `</table>`;
  },
  buildHistoryHTML(games) {
    let html = `<div class="history-scroll"><table class="stats-table">`;
    games.slice().reverse().forEach(game => {
      html += `<tr><td>${game.date}</td><td>${game.score}</td><td>${game.level}</td></tr>`;
    });
    return html + `</table></div>`;
  }
};

const Renderer = {
  draw(ctx, scale, offsetX, offsetY) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (Assets.loaded) {
      ctx.save(); ctx.filter = "blur(15px) brightness(0.85)";
      ctx.drawImage(Assets.bg, 0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
    ctx.save(); ctx.translate(offsetX, offsetY); ctx.scale(scale, scale);
    ctx.beginPath(); ctx.rect(0, 0, GameState.BASE_W, GameState.BASE_H); ctx.clip();
    if (Assets.loaded) ctx.drawImage(Assets.bg, 0, 0, GameState.BASE_W, GameState.BASE_H);
    FX.applyShake(ctx);
    
    // ОТРИСОВКА СКИНА
    const skinImg = (GameState.selectedSkin === "krem") ? Assets.krem : Assets.cone;
    ctx.save();
    ctx.translate(GameState.coneX, GameState.BASE_H - 40);
    ctx.scale(GameState.coneScaleX, GameState.coneScaleY);
    ctx.drawImage(skinImg, -220, -160, 440, 220);
    ctx.restore();

    GameState.pool.forEach(b => { if(b.active) ctx.drawImage(Assets.balls[b.imgIndex], b.x - 75, b.y - 35, 150, 75); });
    ctx.restore();
  }
};

window.openInventory = () => {
  const cont = document.getElementById("inventoryItemsContainer");
  cont.innerHTML = Object.keys(GameState.shopItems).map(id => `
    <div style="margin:10px; padding:10px; border:1px solid #ccc; border-radius:10px;">
      <b>${GameState.shopItems[id].name}</b><br>
      ${GameState.shopItems[id].owned 
        ? (GameState.selectedSkin === id ? "Выбрано" : `<button onclick="window.selectSkin('${id}')">Выбрать</button>`)
        : `<button onclick="window.buyItem('${id}')">КУПИТЬ</button>`}
    </div>`).join("");
  UI.show("inventoryScreen");
};

window.selectSkin = (id) => { GameState.selectedSkin = id; GameState.saveInventory(); window.openInventory(); };
window.buyItem = (id) => {
  vkBridge.send("VKWebAppShowOrderBox", {type: "item", item: GameState.shopItems[id].vkId})
    .then(() => { GameState.shopItems[id].owned = true; GameState.saveInventory(); window.openInventory(); });
};
window.closeStats = () => UI.show(GameState.statsOpenedFrom === "over" ? "gameOver" : "startScreen");