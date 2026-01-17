import './style.css'
import "./game";


const menuUI = document.getElementById('menu-ui')!
const startBtn = document.getElementById('startBtn') as HTMLButtonElement

window.addEventListener('menu-ready', () => {
  menuUI.classList.remove('hidden')
})

startBtn.addEventListener('click', () => {
  const player1 = (document.getElementById('player1') as HTMLInputElement).value
  const player2 = (document.getElementById('player2') as HTMLInputElement).value

  if (!player1 || !player2) return

  menuUI.classList.add('hidden')

  const game = (window as any).phaserGame as Phaser.Game
  game.scene.start('UpgradeScene', { player1, player2 })
})

