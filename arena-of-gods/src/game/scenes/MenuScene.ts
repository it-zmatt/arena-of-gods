import Phaser from 'phaser'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene')
  }

  preload() {
    // Load all background images
    BACKGROUNDS.forEach((bg) => {
      this.load.image(`bg_${bg}`, `src/assets/backgrounds/${bg}.png`)
    })
  }

  create() {
    // Fade in transition
    this.cameras.main.fadeIn(500, 0, 0, 0)

    // Select and display a random background
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
    const bg = this.add.image(0, 0, `bg_${randomBg}`).setOrigin(0, 0)

    // Scale background to fit the game canvas
    bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height)
    
    // Subtle background animation
    this.tweens.add({
      targets: bg,
      alpha: 0.9,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Ensure UI is visible when scene starts
    const ui = document.getElementById('start-ui')
    ui?.classList.remove('hidden')

    // Animate UI entrance
    if (ui) {
      ui.style.opacity = '0'
      ui.style.transform = 'translateY(-20px)'
      setTimeout(() => {
        ui.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
        ui.style.opacity = '1'
        ui.style.transform = 'translateY(0)'
      }, 100)
    }

    // Wait for DOM to be ready
    this.time.delayedCall(100, () => {
      const startBtn = document.getElementById('start-btn')
      if (startBtn) {
        startBtn.addEventListener('click', this.handleStart)
        
        // Add hover effect to start button
        startBtn.addEventListener('mouseenter', () => {
          startBtn.style.transform = 'scale(1.05)'
          startBtn.style.transition = 'transform 0.2s ease'
        })
        startBtn.addEventListener('mouseleave', () => {
          startBtn.style.transform = 'scale(1)'
        })
      }
    })
  }

  handleStart = () => {
    const p1Input = document.getElementById('player1') as HTMLInputElement
    const p2Input = document.getElementById('player2') as HTMLInputElement

    const player1 = p1Input.value.trim()
    const player2 = p2Input.value.trim()

    if (!player1 || !player2) {
      // Shake animation for error
      const ui = document.getElementById('start-ui')
      if (ui) {
        ui.style.animation = 'shake 0.5s'
        setTimeout(() => {
          ui.style.animation = ''
        }, 500)
      }
      alert('Both players must enter a name')
      return
    }

    // Fade out transition
    this.cameras.main.fadeOut(500, 0, 0, 0)
    
    // Hide UI with fade
    const ui = document.getElementById('start-ui')
    if (ui) {
      ui.style.transition = 'opacity 0.3s ease'
      ui.style.opacity = '0'
    }

    // Move to next scene after fade
    this.time.delayedCall(500, () => {
      ui?.classList.add('hidden')
      this.scene.start('HeroSelectScene', {
        player1Name: player1,
        player2Name: player2
      })
    })
  }
}

