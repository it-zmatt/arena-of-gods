import Phaser from 'phaser'

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene')
  }

  create() {
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
  player1Name: 'Player One'
})
  }
}

