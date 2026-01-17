import Phaser from 'phaser'
import { HEROES } from '../constants/heroes'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']

export default class HeroSelectScene extends Phaser.Scene {
  private playerName!: string
  private player1Name!: string
  private player2Name!: string

  constructor() {
    super('HeroSelectScene')
  }

  init(data: { player1Name: string; player2Name?: string }) {
    this.playerName = data.player1Name
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name || 'Player 2'
  }

  preload() {
    // Load backgrounds
    BACKGROUNDS.forEach((bg) => {
      this.load.image(`bg_${bg}`, `src/assets/backgrounds/${bg}.png`)
    })
    // Load character images
    HEROES.forEach((hero) => {
      this.load.image(hero.id, `src/assets/characters/${hero.id}.png`)
    })
  }

  create() {
    const { width, height } = this.cameras.main

    // Fade in transition
    this.cameras.main.fadeIn(500, 0, 0, 0)

    // Random background (no overlay)
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
    const bg = this.add.image(0, 0, `bg_${randomBg}`).setOrigin(0, 0)
    bg.setDisplaySize(width, height)

    // Subtle background animation
    this.tweens.add({
      targets: bg,
      alpha: 0.95,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Title banner at top
    const bannerHeight = 100
    const bannerBg = this.add.graphics()
    bannerBg.fillGradientStyle(0x0f172a, 0x0f172a, 0x0f172a, 0x0f172a, 1, 1, 0, 0)
    bannerBg.fillRect(0, 0, width, bannerHeight)

    // Decorative gold line under banner
    this.add.rectangle(width / 2, bannerHeight, width, 4, 0xfbbf24)

    // Player name with glow effect
    this.add
      .text(width / 2, 35, this.playerName, {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#fbbf24', 8, true, true)

    // Subtitle
    this.add
      .text(width / 2, 70, '— Your Heroes —', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#e2e8f0'
      })
      .setOrigin(0.5)

    // Hero cards section (non-interactive display)
    const cardWidth = 160
    const cardHeight = 240
    const spacing = 25
    const totalWidth = HEROES.length * cardWidth + (HEROES.length - 1) * spacing
    const startX = (width - totalWidth) / 2 + cardWidth / 2
    const cardY = height / 2 + 30

    HEROES.forEach((hero, i) => {
      const x = startX + i * (cardWidth + spacing)

      // Card container
      const container = this.add.container(x, cardY)

      // Card shadow
      const shadow = this.add
        .rectangle(6, 6, cardWidth, cardHeight, 0x000000, 0.5)

      // Card background with gradient effect (using multiple rectangles)
      const cardBg = this.add
        .rectangle(0, 0, cardWidth, cardHeight, 0x1e293b)

      // Inner card area (slightly lighter)
      const cardInner = this.add
        .rectangle(0, -15, cardWidth - 16, cardHeight - 70, 0x334155)

      // Outer border (gold accent)
      const outerBorder = this.add
        .rectangle(0, 0, cardWidth + 4, cardHeight + 4)
        .setStrokeStyle(2, 0xfbbf24, 0.3)
        .setFillStyle(0x000000, 0)

      // Main border
      const border = this.add
        .rectangle(0, 0, cardWidth, cardHeight)
        .setStrokeStyle(3, 0x475569)
        .setFillStyle(0x000000, 0)

      // Character image
      const charImage = this.add.image(0, -20, hero.id)
      const scale = Math.min((cardWidth - 30) / charImage.width, (cardHeight - 80) / charImage.height)
      charImage.setScale(scale)

      // Name plate background
      const namePlateBg = this.add
        .rectangle(0, cardHeight / 2 - 30, cardWidth - 10, 36, 0x0f172a)
        .setStrokeStyle(2, 0x475569)

      // Hero name
      const nameText = this.add
        .text(0, cardHeight / 2 - 30, hero.name.toUpperCase(), {
          fontFamily: '"Press Start 2P"',
          fontSize: '11px',
          color: '#fbbf24'
        })
        .setOrigin(0.5)
        .setShadow(2, 2, '#000000', 2)

      container.add([shadow, cardBg, cardInner, outerBorder, border, charImage, namePlateBg, nameText])
      
      // Entrance animation for cards
      container.setAlpha(0)
      container.setScale(0.5)
      this.tweens.add({
        targets: container,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        delay: i * 100,
        ease: 'Back.easeOut'
      })

      // Subtle hover animation
      this.tweens.add({
        targets: container,
        y: cardY - 5,
        duration: 2000,
        delay: i * 100 + 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      })
    })

    // Bottom panel with buttons
    const bottomPanelBg = this.add.graphics()
    bottomPanelBg.fillGradientStyle(0x0f172a, 0x0f172a, 0x0f172a, 0x0f172a, 0, 0, 1, 1)
    bottomPanelBg.fillRect(0, height - 80, width, 80)

    // Decorative gold line above bottom panel
    this.add.rectangle(width / 2, height - 80, width, 2, 0xfbbf24, 0.5)

    // Back button (left)
    const backButtonWidth = 150
    const backButtonHeight = 50
    const buttonY = height - 45

    const backButton = this.add
      .rectangle(width / 2 - 200, buttonY, backButtonWidth, backButtonHeight, 0x6b7280)
      .setStrokeStyle(3, 0x9ca3af)
      .setInteractive({ useHandCursor: true })

    const backButtonText = this.add
      .text(width / 2 - 200, buttonY, 'BACK', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setShadow(2, 2, '#000000', 2)

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x9ca3af)
      this.tweens.add({
        targets: [backButton, backButtonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Back.easeOut'
      })
    })

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x6b7280)
      this.tweens.add({
        targets: [backButton, backButtonText],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeOut'
      })
    })

    backButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.time.delayedCall(300, () => {
        this.scene.start('StartScene')
      })
    })

    // Next button (right)
    const nextButtonWidth = 200
    const nextButton = this.add
      .rectangle(width / 2 + 200, buttonY, nextButtonWidth, backButtonHeight, 0x16a34a)
      .setStrokeStyle(3, 0x22c55e)
      .setInteractive({ useHandCursor: true })

    const nextButtonText = this.add
      .text(width / 2 + 200, buttonY, 'NEXT', {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setShadow(2, 2, '#000000', 2)

    // Button hover effects
    nextButton.on('pointerover', () => {
      nextButton.setFillStyle(0x22c55e)
      this.tweens.add({
        targets: [nextButton, nextButtonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Back.easeOut'
      })
    })

    nextButton.on('pointerout', () => {
      nextButton.setFillStyle(0x16a34a)
      this.tweens.add({
        targets: [nextButton, nextButtonText],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeOut'
      })
    })

    nextButton.on('pointerdown', () => {
      // Celebration effect
      const { width, height } = this.cameras.main
      for (let i = 0; i < 15; i++) {
        this.time.delayedCall(i * 50, () => {
          const particle = this.add.circle(
            width / 2 + (Math.random() - 0.5) * 400,
            height / 2 + (Math.random() - 0.5) * 400,
            4,
            0xfbbf24
          )
          this.tweens.add({
            targets: particle,
            y: particle.y - 100,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          })
        })
      }
      
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.time.delayedCall(300, () => {
        this.proceedToNextScene()
      })
    })
  }

  private proceedToNextScene() {
    this.scene.start('HeroLevelUpScene', {
      player1Name: this.player1Name,
      player2Name: this.player2Name,
      currentPlayer: this.player1Name
    })
  }
}
