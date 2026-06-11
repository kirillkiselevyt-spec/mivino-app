const Game = {

  start() {
    GameState.state = "play";
    GameState.score = 0;
    GameState.lives = 5;
    GameState.level = 1;

    GameState.initLevel();

    document.getElementById("menu").style.display = "none";
  },

  restart() {
    document.getElementById("gameover").style.display = "none";
    this.start();
  },

  end() {
    GameState.state = "over";

    let history = JSON.parse(localStorage.getItem("history")) || [];
    history.push({
      score: GameState.score,
      level: GameState.level
    });
    localStorage.setItem("history", JSON.stringify(history));

    document.getElementById("final").innerText =
      "Счёт: " + GameState.score;

    document.getElementById("gameover").style.display = "block";
  },

  next() {
    GameState.level++;
    GameState.initLevel();
  },

  showStats() {
    let history = JSON.parse(localStorage.getItem("history")) || [];

    let list = document.getElementById("statsList");
    list.innerHTML = "";

    history.slice(-10).reverse().forEach(h=>{
      let div = document.createElement("div");
      div.innerText = `Очки ${h.score} | Уровень ${h.level}`;
      list.appendChild(div);
    });

    document.getElementById("stats").style.display = "block";
  },

  closeStats() {
    document.getElementById("stats").style.display = "none";
  }
};
