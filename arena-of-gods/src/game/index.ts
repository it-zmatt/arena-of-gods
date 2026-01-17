import Phaser from "phaser";
import HeroSelectScene from './scenes/HeroSelectScene'
import HeroLevelUpScene from './scenes/HeroLevelUpScene'
import Player2HeroSelectScene from './scenes/Player2HeroSelectScene'
import VSBattleScene from './scenes/VSBattleScene'
import BattleScene from './scenes/BattleScene'
import WinnerScene from './scenes/WinnerScene'
import { StartScene } from './scenes/MenuScene'


const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [StartScene, HeroSelectScene, HeroLevelUpScene, Player2HeroSelectScene, VSBattleScene, BattleScene, WinnerScene],
  parent: "game-root",
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

