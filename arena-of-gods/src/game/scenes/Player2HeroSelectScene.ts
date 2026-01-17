import Phaser from 'phaser'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']
const HEROES = [
  { id: 'brutus', name: 'Brutus' },
  { id: 'kael', name: 'Kael' },
  { id: 'lyra', name: 'Lyra' },
  { id: 'thea', name: 'Thea' },
  { id: 'marcus', name: 'Marcus' }
]

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

    // Random background (no overlay)
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
    const bg = this.add.image(0, 0, `bg_${randomBg}`).setOrigin(0, 0)
    bg.setDisplaySize(width, height)

    // Title banner at top
    const bannerHeight = 100
    const bannerBg = this.add.graphics()
    bannerBg.fillGradientStyle(0x0f172a, 0x0f172a, 0x0f172a, 0x0f172a, 1, 1, 0, 0)
    bannerBg.fillRect(0, 0, width, bannerHeight)

    // Decorative gold line under banner
    this.add.rectangle(width / 2, bannerHeight, width, 4, 0xfbbf24)

    // Player name with glow effect
    this.add
      .text(width / 2, 35, this.player2Name, {
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

    // Hero cards section
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
    })

    // Continue button at the bottom
    const buttonY = height - 80
    const continueButton = this.add
      .rectangle(width / 2, buttonY, 200, 50, 0x16a34a)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const continueText = this.add
      .text(width / 2, buttonY, 'Continue', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    continueButton.on('pointerdown', () => {
      this.proceedToNextScene()
    })

    continueText.on('pointerdown', () => {
      this.proceedToNextScene()
    })

    continueButton.on('pointerover', () => {
      continueButton.setFillStyle(0x22c55e)
    })

    continueButton.on('pointerout', () => {
      continueButton.setFillStyle(0x16a34a)
    })

    continueText.on('pointerover', () => {
      continueButton.setFillStyle(0x22c55e)
    })

    continueText.on('pointerout', () => {
      continueButton.setFillStyle(0x16a34a)
    })
  }

  private proceedToNextScene() {
    this.scene.start('BattleScene', {
      player1Name: this.player1Name,
      player2Name: this.player2Name
    })
  }
}
