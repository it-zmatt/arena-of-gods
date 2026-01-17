import Phaser from 'phaser'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene')
  }

  preload() {
    // Load all background images
    BACKGROUNDS.forEach((bg) => {
      this.load.image(bg, `src/assets/backgrounds/${bg}.png`)
    })
  }

  create() {
    // Select and display a random background
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
    const bg = this.add.image(0, 0, randomBg).setOrigin(0, 0)

    // Scale background to fit the game canvas
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height)
    // Ensure UI is visible when scene starts
    const ui = document.getElementById('start-ui')
    ui?.classList.remove('hidden')

    const startBtn = document.getElementById('start-btn')
    startBtn?.addEventListener('click', this.handleStart)
  }

  handleStart = () => {
    const p1Input = document.getElementById('player1') as HTMLInputElement
    const p2Input = document.getElementById('player2') as HTMLInputElement

    const player1 = p1Input.value.trim()
    const player2 = p2Input.value.trim()

    if (!player1 || !player2) {
      alert('Both players must enter a name')
      return
    }

    // Hide UI
    document.getElementById('start-ui')?.classList.add('hidden')

    // Move to next scene
    this.scene.start('HeroSelectScene', {
      player1Name: player1,
      player2Name: player2
    })
  }
}

