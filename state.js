const GameState = {
  state: "menu",
  BASE_W: 450, BASE_H: 800,
  score: 0, lives: 5, level: 1,
  caught: 0, missed: 0,
  balls: [], pool: [],
  coneX: 225, targetX: 225, coneV: 0,
  coneScaleX: 1, coneScaleY: 1,
  popups: [],
  statsOpenedFrom: "menu",
  
  // Данные магазина
  selectedSkin: "cone",
  shopItems: {
    cone: { id: "cone", name: "Рожок", owned: true },
    krem: { id: "krem", name: "Креманка", owned: false, vkId: "item_krem_01" }
  },

  init() {
    const saved = localStorage.getItem("mivino_inv");
    if (saved) {
      const data = JSON.parse(saved);
      this.selectedSkin = data.selectedSkin || "cone";
      if (data.ownedItems) {
        Object.keys(data.ownedItems).forEach(id => {
          if (this.shopItems[id]) this.shopItems[id].owned = data.ownedItems[id];
        });
      }
    }
  },

  saveInventory() {
    const ownedItems = {};
    Object.keys(this.shopItems).forEach(id => ownedItems[id] = this.shopItems[id].owned);
    localStorage.setItem("mivino_inv", JSON.stringify({ selectedSkin: this.selectedSkin, ownedItems }));
  },

  initLevel() {
    this.balls = []; this.pool = []; this.caught = 0; this.missed = 0; this.popups = [];
    const availableBallImages = Assets.balls.length > 0 ? Assets.balls.length : 4;
    for (let i = 0; i < 20; i++) {
      this.pool.push({
        x: Math.random() * (this.BASE_W - 120) + 60, y: -60, r: 25,
        speed: 2.5 + this.level * 0.45,
        imgIndex: Math.floor(Math.random() * availableBallImages),
        active: false, spawnDelay: i * 75
      });
    }
  }
};
GameState.init();