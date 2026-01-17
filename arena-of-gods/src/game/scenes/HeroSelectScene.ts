import Phaser from 'phaser'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']
const HEROES = [
  { id: 'brutus', name: 'Brutus' },
  { id: 'kael', name: 'Kael' },
  { id: 'lyra', name: 'Lyra' },
  { id: 'thea', name: 'Thea' },
  { id: 'marcus', name: 'Marcus' }
]

export default class HeroSelectScene extends Phaser.Scene {
  private playerName!: string
  private player1Name!: string
  private player2Name!: string
  private selectedHeroId: string | null = null
  private heroCards: Phaser.GameObjects.Container[] = []

  constructor() {
    super('HeroSelectScene')
  }

  init(data: { player1Name: string; player2Name?: string }) {
    this.playerName = data.player1Name
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name || 'Player 2'
    this.selectedHeroId = null
    this.heroCards = []
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
      .text(width / 2, 35, this.playerName, {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#fbbf24', 8, true, true)

    // Subtitle
    this.add
      .text(width / 2, 70, '— Select Your Champion —', {
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
      container.setSize(cardWidth, cardHeight)
      container.setInteractive({ useHandCursor: true })

      // Store references for hover effects
      const cardElements = { border, outerBorder, shadow, namePlateBg, nameText }

      // Hover effects
      container.on('pointerover', () => {
        if (this.selectedHeroId === null) {
          this.tweens.add({
            targets: container,
            scaleX: 1.08,
            scaleY: 1.08,
            y: cardY - 10,
            duration: 150,
            ease: 'Back.easeOut'
          })
          cardElements.border.setStrokeStyle(3, 0xfbbf24)
          cardElements.outerBorder.setStrokeStyle(2, 0xfbbf24, 0.8)
          cardElements.namePlateBg.setFillStyle(0x1e293b)
          cardElements.shadow.setAlpha(0.8)
        }
      })

      container.on('pointerout', () => {
        if (this.selectedHeroId !== hero.id) {
          this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            y: cardY,
            duration: 150,
            ease: 'Back.easeOut'
          })
          cardElements.border.setStrokeStyle(3, 0x475569)
          cardElements.outerBorder.setStrokeStyle(2, 0xfbbf24, 0.3)
          cardElements.namePlateBg.setFillStyle(0x0f172a)
          cardElements.shadow.setAlpha(0.5)
        }
      })

      container.on('pointerdown', () => {
        this.selectHero(hero.id, container, cardElements)
      })

      this.heroCards.push(container)
    })

    // Bottom hint panel
    const hintBg = this.add.graphics()
    hintBg.fillGradientStyle(0x0f172a, 0x0f172a, 0x0f172a, 0x0f172a, 0, 0, 1, 1)
    hintBg.fillRect(0, height - 60, width, 60)

    // Decorative gold line above hint
    this.add.rectangle(width / 2, height - 60, width, 2, 0xfbbf24, 0.5)

    // Hint text with blinking effect
    const hintText = this.add
      .text(width / 2, height - 30, 'Click a hero card to select your champion', {
        fontFamily: '"Press Start 2P"',
        fontSize: '9px',
        color: '#94a3b8'
      })
      .setOrigin(0.5)

    // Blinking animation for hint
    this.tweens.add({
      targets: hintText,
      alpha: 0.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private selectHero(
    heroId: string,
    container: Phaser.GameObjects.Container,
    cardElements: {
      border: Phaser.GameObjects.Rectangle
      outerBorder: Phaser.GameObjects.Rectangle
      shadow: Phaser.GameObjects.Rectangle
      namePlateBg: Phaser.GameObjects.Rectangle
      nameText: Phaser.GameObjects.Text
    }
  ) {
    if (this.selectedHeroId !== null) return

    this.selectedHeroId = heroId

    // Visual feedback - highlight selected card with green
    cardElements.border.setStrokeStyle(4, 0x22c55e)
    cardElements.outerBorder.setStrokeStyle(3, 0x22c55e, 1)
    cardElements.namePlateBg.setFillStyle(0x166534)
    cardElements.nameText.setColor('#ffffff')

    // Scale up animation
    this.tweens.add({
      targets: container,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 200,
      ease: 'Back.easeOut'
    })

    // Dim other cards
    this.heroCards.forEach((card) => {
      if (card !== container) {
        this.tweens.add({
          targets: card,
          alpha: 0.4,
          duration: 300
        })
      }
    })

    // Small delay before next scene
    this.time.delayedCall(800, () => {
      this.scene.start('HeroSelectSceneP2', {
        player1Name: this.playerName,
        player1HeroId: heroId
      })
    })
  }
}

