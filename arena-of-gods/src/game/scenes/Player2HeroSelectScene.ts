import Phaser from 'phaser'

export default class Player2HeroSelectScene extends Phaser.Scene {
  private player1Name!: string
  private player2Name!: string

  constructor() {
    super('Player2HeroSelectScene')
  }

  init(data: { player1Name: string; player2Name: string }) {
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#0f172a')

    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    // Player Name
    this.add
      .text(centerX, 60, `${this.player2Name} — Choose Your Hero`, {
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    // Hero cards (non-interactive images)
    const startX = centerX - 260
    const y = centerY
    const spacing = 130

    for (let i = 0; i < 5; i++) {
      const card = this.add
        .rectangle(startX + i * spacing, y, 100, 140, 0x334155)
        .setStrokeStyle(2, 0xffffff)

      this.add
        .text(card.x, card.y, `Hero ${i + 1}`, {
          fontSize: '16px',
          color: '#ffffff'
        })
        .setOrigin(0.5)
    }

    // Next/Continue button
    const buttonY = y + 120
    const button = this.add
      .rectangle(centerX, buttonY, 150, 50, 0x16a34a)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })
      .setDepth(10)

    const buttonText = this.add
      .text(centerX, buttonY, 'Next / Continue', {
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setDepth(11)
      .setInteractive({ useHandCursor: true })

    // Make both the button and text clickable
    const handleClick = () => {
      console.log('Button clicked - transitioning to level up scene for', this.player2Name)
      this.proceedToNextScene()
    }

    button.on('pointerdown', handleClick)
    buttonText.on('pointerdown', handleClick)

    button.on('pointerover', () => {
      button.setFillStyle(0x22c55e)
    })

    button.on('pointerout', () => {
      button.setFillStyle(0x16a34a)
    })

    buttonText.on('pointerover', () => {
      button.setFillStyle(0x22c55e)
    })

    buttonText.on('pointerout', () => {
      button.setFillStyle(0x16a34a)
    })
  }

  private proceedToNextScene() {
    console.log('Proceeding to level up scene for:', this.player2Name)
    console.log('Player 1:', this.player1Name, 'Player 2:', this.player2Name)
    
    this.scene.start('HeroLevelUpScene', {
      player1Name: this.player1Name,
      player2Name: this.player2Name,
      currentPlayer: this.player2Name
    })
  }
}
