import Phaser from "phaser";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-root",
  backgroundColor: "#0f172a",
};

new Phaser.Game(config);

