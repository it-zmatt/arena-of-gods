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

    // Fade in transition
    this.cameras.main.fadeIn(800, 0, 0, 0)

    // Stop fight music when game ends
    const fightMusic = this.sound.get('fightMusic')
    if (fightMusic && fightMusic.isPlaying) {
      fightMusic.stop()
    }

    // Animated background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a)
    this.tweens.add({
      targets: bg,
      fillColor: 0x1e293b,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Winner announcement with entrance animation
    const winnerText = this.add
      .text(width / 2, height / 2 - 100, `${this.winnerName} Wins!`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#fbbf24', 20, true, true)
      .setAlpha(0)
      .setScale(0.5)

    // Entrance animation
    this.tweens.add({
      targets: winnerText,
      alpha: 1,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Continuous glow animation
        this.tweens.add({
          targets: winnerText,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      }
    })

    // Celebration particles
    this.startCelebrationParticles(width, height)

    // Victory message with animation
    const victoryText = this.add
      .text(width / 2, height / 2 - 30, 'Victory!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#e2e8f0',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setAlpha(0)

    this.time.delayedCall(500, () => {
      this.tweens.add({
        targets: victoryText,
        alpha: 1,
        y: height / 2 - 10,
        duration: 500,
        ease: 'Back.easeOut'
      })
    })

    // Rotating stars effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const star = this.add.text(
        width / 2 + Math.cos(angle) * 150,
        height / 2 + Math.sin(angle) * 150,
        '★',
        {
          fontFamily: '"Press Start 2P"',
          fontSize: '24px',
          color: '#fbbf24'
        }
      ).setOrigin(0.5).setAlpha(0)

      this.time.delayedCall(800 + i * 100, () => {
        this.tweens.add({
          targets: star,
          alpha: 1,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 300,
          yoyo: true,
          ease: 'Back.easeOut'
        })

        // Rotate around center
        this.tweens.add({
          targets: star,
          x: width / 2 + Math.cos(angle) * 200,
          y: height / 2 + Math.sin(angle) * 200,
          duration: 3000,
          repeat: -1,
          ease: 'Linear'
        })
      })
    }

    // Back button (top left)
    const backButton = this.add
      .rectangle(50, 30, 120, 40, 0x6b7280)
      .setStrokeStyle(3, 0x9ca3af)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(50, 30, 'BACK', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setShadow(2, 2, '#000000', 2)

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x9ca3af)
    })

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x6b7280)
    })

    backButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.time.delayedCall(300, () => {
        // Go back to battle scene
        this.scene.start('BattleScene', {
          player1Name: this.player1Name,
          player2Name: this.player2Name
        })
      })
    })

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
      this.tweens.add({
        targets: [resumeButton, resumeText],
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => this.handleResume()
      })
    })

    resumeText.on('pointerdown', () => {
      this.tweens.add({
        targets: [resumeButton, resumeText],
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => this.handleResume()
      })
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
      this.tweens.add({
        targets: [tryAgainButton, tryAgainText],
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => this.handleTryAgain()
      })
    })

    tryAgainText.on('pointerdown', () => {
      this.tweens.add({
        targets: [tryAgainButton, tryAgainText],
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: () => this.handleTryAgain()
      })
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

  private startCelebrationParticles(width: number, height: number) {
    // Create particle system
    const graphics = this.add.graphics()
    graphics.fillStyle(0xffffff)
    graphics.fillCircle(0, 0, 4)
    graphics.generateTexture('particle', 8, 8)
    graphics.destroy()

    const particles = this.add.particles(0, 0, 'particle', {
      tint: [0xfbbf24, 0xffd700, 0xffff00],
      scale: { start: 0.5, end: 0 },
      speed: { min: 50, max: 150 },
      lifespan: 2000,
      frequency: 100,
      quantity: 3
    })

    // Create multiple emitters for different areas
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 500, () => {
        const emitter = particles.createEmitter({
          x: Math.random() * width,
          y: Math.random() * height,
          tint: [0xfbbf24, 0xffd700, 0xffff00],
          scale: { start: 0.8, end: 0 },
          speed: { min: 100, max: 250 },
          lifespan: 2000,
          quantity: 20,
          frequency: -1
        })
        emitter.explode(20)
      })
    }
  }

  private handleResume() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(300, () => {
      // Resume could go back to battle or to a menu
      // For now, let's go back to the start menu
      this.scene.start('StartScene')
    })
  }

  private handleTryAgain() {
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(300, () => {
      // Restart the game from the beginning
      // Clear registry data
      this.registry.remove('player1Heroes')
      this.registry.remove('player2Heroes')
      
      // Go back to hero selection for player 1
      this.scene.start('HeroSelectScene', {
        player1Name: this.player1Name,
        player2Name: this.player2Name
      })
    })
  }
}
