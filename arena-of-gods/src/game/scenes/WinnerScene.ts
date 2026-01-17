import Phaser from 'phaser'

export default class WinnerScene extends Phaser.Scene {
  private winnerName!: string
  private player1Name!: string
  private player2Name!: string

  constructor() {
    super('WinnerScene')
  }

  init(data: { winnerName: string; player1Name: string; player2Name: string }) {
    this.winnerName = data.winnerName
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.cameras.main.setBackgroundColor('#0f172a')

    // Winner announcement
    const winnerText = this.add
      .text(width / 2, height / 2 - 100, `${this.winnerName} Wins!`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#fbbf24', 10, true, true)

    // Add glow animation
    this.tweens.add({
      targets: winnerText,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Victory message
    this.add
      .text(width / 2, height / 2 - 30, 'Victory!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#e2e8f0'
      })
      .setOrigin(0.5)

    // Button container at the bottom
    const buttonY = height - 100
    const buttonSpacing = 200

    // Resume button
    const resumeButton = this.add
      .rectangle(width / 2 - buttonSpacing / 2, buttonY, 180, 50, 0x16a34a)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const resumeText = this.add
      .text(width / 2 - buttonSpacing / 2, buttonY, 'Resume', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    resumeButton.on('pointerdown', () => {
      this.handleResume()
    })

    resumeText.on('pointerdown', () => {
      this.handleResume()
    })

    resumeButton.on('pointerover', () => {
      resumeButton.setFillStyle(0x22c55e)
    })

    resumeButton.on('pointerout', () => {
      resumeButton.setFillStyle(0x16a34a)
    })

    resumeText.on('pointerover', () => {
      resumeButton.setFillStyle(0x22c55e)
    })

    resumeText.on('pointerout', () => {
      resumeButton.setFillStyle(0x16a34a)
    })

    // Try again button
    const tryAgainButton = this.add
      .rectangle(width / 2 + buttonSpacing / 2, buttonY, 180, 50, 0xdc2626)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const tryAgainText = this.add
      .text(width / 2 + buttonSpacing / 2, buttonY, 'Try Again', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    tryAgainButton.on('pointerdown', () => {
      this.handleTryAgain()
    })

    tryAgainText.on('pointerdown', () => {
      this.handleTryAgain()
    })

    tryAgainButton.on('pointerover', () => {
      tryAgainButton.setFillStyle(0xef4444)
    })

    tryAgainButton.on('pointerout', () => {
      tryAgainButton.setFillStyle(0xdc2626)
    })

    tryAgainText.on('pointerover', () => {
      tryAgainButton.setFillStyle(0xef4444)
    })

    tryAgainText.on('pointerout', () => {
      tryAgainButton.setFillStyle(0xdc2626)
    })
  }

  private handleResume() {
    // Resume could go back to battle or to a menu
    // For now, let's go back to the start menu
    this.scene.start('StartScene')
  }

  private handleTryAgain() {
    // Restart the game from the beginning
    // Clear registry data
    this.registry.remove('player1Heroes')
    this.registry.remove('player2Heroes')
    
    // Go back to hero selection for player 1
    this.scene.start('HeroSelectScene', {
      player1Name: this.player1Name,
      player2Name: this.player2Name
    })
  }
}
