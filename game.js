const UI = {

  show(name) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    if (name) document.getElementById(name).style.display = "flex";
  },

  bind() {

    document.getElementById("playBtn").onclick = () => {
      GameState.score = 0;
      GameState.lives = 5;
      GameState.level = 1;

      GameState.initLevel();
      GameState.state = "play";

      this.show(null);
    };

    document.getElementById("statsBtn").onclick = () => this.show("stats");
    document.getElementById("backBtn").onclick = () => this.show("start");

    document.getElementById("nextBtn").onclick = () => {
      GameState.level++;
      GameState.initLevel();
      GameState.state = "play";
      this.show(null);
    };

    document.getElementById("restartBtn").onclick = () => {
      GameState.score = 0;
      GameState.lives = 5;
      GameState.level = 1;

      GameState.initLevel();
      GameState.state = "play";

      this.show(null);
    };
  }
};

window.onload = () => {

  UI.bind();

  Assets.load(() => {
    UI.show("start");

    Engine.init();
    Engine.loop();
  });
};