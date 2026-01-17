import Phaser from 'phaser'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']
const HEROES = [
  { id: 'brutus', name: 'Brutus' },
  { id: 'kael', name: 'Kael' },
  { id: 'lyra', name: 'Lyra' },
  { id: 'thea', name: 'Thea' },
  { id: 'marcus', name: 'Marcus' }
]

interface HeroAttributes {
  strength: number
  defense: number
  intelligence: number
  accuracy: number
  agility: number
  stamina: number
}

export default class HeroLevelUpScene extends Phaser.Scene {
  private player1Name!: string
  private player2Name!: string
  private playerName!: string
  private heroes: HeroAttributes[] = []
  private currentHeroIndex: number = 0

  // UI elements
  private heroSlots: Phaser.GameObjects.Container[] = []
  private heroImage!: Phaser.GameObjects.Image
  private attributeValueTexts: Phaser.GameObjects.Text[] = []
  private heroNameText!: Phaser.GameObjects.Text

  constructor() {
    super('HeroLevelUpScene')
  }

  init(data: { player1Name: string; player2Name?: string; currentPlayer?: string }) {
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name || 'Player 2'
    this.playerName = data.currentPlayer || data.player1Name

    // Initialize all heroes with default attributes
    this.heroes = Array(5).fill(null).map(() => ({
      strength: 1,
      defense: 1,
      intelligence: 1,
      accuracy: 1,
      agility: 1,
      stamina: 1
    }))

    this.heroSlots = []
    this.attributeValueTexts = []
    this.currentHeroIndex = 0
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

    // Random background
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
      .text(width / 2, 70, '— Level Up Your Heroes —', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#e2e8f0'
      })
      .setOrigin(0.5)

    // Hero selection slots
    const slotSize = 70
    const slotSpacing = 90
    const slotsStartX = width / 2 - ((HEROES.length - 1) * slotSpacing) / 2
    const slotsY = 160

    HEROES.forEach((hero, i) => {
      const x = slotsStartX + i * slotSpacing
      const container = this.add.container(x, slotsY)

      // Slot background
      const slotBg = this.add.rectangle(0, 0, slotSize, slotSize, 0x1e293b)
        .setStrokeStyle(3, 0x475569)

      // Hero thumbnail
      const thumbnail = this.add.image(0, 0, hero.id)
      const scale = Math.min((slotSize - 10) / thumbnail.width, (slotSize - 10) / thumbnail.height)
      thumbnail.setScale(scale)

      container.add([slotBg, thumbnail])
      container.setSize(slotSize, slotSize)
      container.setInteractive({ useHandCursor: true })

      container.on('pointerover', () => {
        if (i !== this.currentHeroIndex) {
          slotBg.setStrokeStyle(3, 0xfbbf24)
        }
      })

      container.on('pointerout', () => {
        if (i !== this.currentHeroIndex) {
          slotBg.setStrokeStyle(3, 0x475569)
        }
      })

      container.on('pointerdown', () => {
        this.selectHero(i)
      })

      this.heroSlots.push(container)
    })

    // Main content area
    const contentY = height / 2 + 40

    // Hero image display (left side)
    const heroImageX = width / 3
    this.add.rectangle(heroImageX, contentY, 200, 260, 0x1e293b)
      .setStrokeStyle(3, 0x475569)

    this.heroImage = this.add.image(heroImageX, contentY, HEROES[0].id)
    const imgScale = Math.min(180 / this.heroImage.width, 240 / this.heroImage.height)
    this.heroImage.setScale(imgScale)

    // Hero name below image
    this.heroNameText = this.add
      .text(heroImageX, contentY + 155, HEROES[0].name.toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setShadow(2, 2, '#000000', 2)

    // Attributes panel (right side)
    const attrX = (width * 2) / 3
    const attrStartY = contentY - 120
    const attrSpacing = 45

    const attributeNames = ['Strength', 'Defense', 'Intelligence', 'Accuracy', 'Agility', 'Stamina']
    const attributeKeys: (keyof HeroAttributes)[] = ['strength', 'defense', 'intelligence', 'accuracy', 'agility', 'stamina']

    // Attributes title
    this.add
      .text(attrX, attrStartY - 40, 'ATTRIBUTES', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#fbbf24', 4, true, true)

    attributeNames.forEach((name, index) => {
      const y = attrStartY + index * attrSpacing
      const key = attributeKeys[index]

      // Attribute row background
      this.add.rectangle(attrX, y, 280, 36, 0x1e293b)
        .setStrokeStyle(2, 0x475569)

      // Attribute name
      this.add
        .text(attrX - 100, y, name, {
          fontFamily: '"Press Start 2P"',
          fontSize: '9px',
          color: '#e2e8f0'
        })
        .setOrigin(0, 0.5)

      // Minus button
      const minusBtn = this.add.rectangle(attrX + 60, y, 32, 28, 0x991b1b)
        .setStrokeStyle(2, 0xef4444)
        .setInteractive({ useHandCursor: true })

      this.add
        .text(attrX + 60, y, '-', {
          fontFamily: '"Press Start 2P"',
          fontSize: '14px',
          color: '#ffffff'
        })
        .setOrigin(0.5)

      minusBtn.on('pointerover', () => minusBtn.setFillStyle(0xb91c1c))
      minusBtn.on('pointerout', () => minusBtn.setFillStyle(0x991b1b))
      minusBtn.on('pointerdown', () => {
        if (this.heroes[this.currentHeroIndex][key] > 1) {
          this.heroes[this.currentHeroIndex][key]--
          this.updateAttributeDisplay()
        }
      })

      // Value text
      const valueText = this.add
        .text(attrX + 100, y, '1', {
          fontFamily: '"Press Start 2P"',
          fontSize: '12px',
          color: '#fbbf24'
        })
        .setOrigin(0.5)

      this.attributeValueTexts.push(valueText)

      // Plus button
      const plusBtn = this.add.rectangle(attrX + 140, y, 32, 28, 0x166534)
        .setStrokeStyle(2, 0x22c55e)
        .setInteractive({ useHandCursor: true })

      this.add
        .text(attrX + 140, y, '+', {
          fontFamily: '"Press Start 2P"',
          fontSize: '14px',
          color: '#ffffff'
        })
        .setOrigin(0.5)

      plusBtn.on('pointerover', () => plusBtn.setFillStyle(0x15803d))
      plusBtn.on('pointerout', () => plusBtn.setFillStyle(0x166534))
      plusBtn.on('pointerdown', () => {
        this.heroes[this.currentHeroIndex][key]++
        this.updateAttributeDisplay()
      })
    })

    // Bottom panel with Next button
    const bottomPanelBg = this.add.graphics()
    bottomPanelBg.fillGradientStyle(0x0f172a, 0x0f172a, 0x0f172a, 0x0f172a, 0, 0, 1, 1)
    bottomPanelBg.fillRect(0, height - 80, width, 80)

    // Decorative gold line above bottom panel
    this.add.rectangle(width / 2, height - 80, width, 2, 0xfbbf24, 0.5)

    // Next button
    const buttonWidth = 200
    const buttonHeight = 50
    const buttonY = height - 45

    const button = this.add
      .rectangle(width / 2, buttonY, buttonWidth, buttonHeight, 0x16a34a)
      .setStrokeStyle(3, 0x22c55e)
      .setInteractive({ useHandCursor: true })

    const buttonText = this.add
      .text(width / 2, buttonY, 'NEXT', {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setShadow(2, 2, '#000000', 2)

    button.on('pointerover', () => {
      button.setFillStyle(0x22c55e)
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Back.easeOut'
      })
    })

    button.on('pointerout', () => {
      button.setFillStyle(0x16a34a)
      this.tweens.add({
        targets: [button, buttonText],
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeOut'
      })
    })

    button.on('pointerdown', () => {
      this.proceedToNextScene()
    })

    // Initialize display
    this.updateHeroSelection()
    this.updateAttributeDisplay()
  }

  private selectHero(index: number) {
    this.currentHeroIndex = index
    this.updateHeroSelection()
    this.updateAttributeDisplay()
    this.updateHeroImage()
  }

  private updateHeroSelection() {
    this.heroSlots.forEach((container, index) => {
      const slotBg = container.getAt(0) as Phaser.GameObjects.Rectangle
      if (index === this.currentHeroIndex) {
        slotBg.setStrokeStyle(4, 0x22c55e)
        slotBg.setFillStyle(0x334155)
      } else {
        slotBg.setStrokeStyle(3, 0x475569)
        slotBg.setFillStyle(0x1e293b)
      }
    })
  }

  private updateAttributeDisplay() {
    const hero = this.heroes[this.currentHeroIndex]
    const attributeKeys: (keyof HeroAttributes)[] = ['strength', 'defense', 'intelligence', 'accuracy', 'agility', 'stamina']

    attributeKeys.forEach((key, index) => {
      this.attributeValueTexts[index].setText(hero[key].toString())
    })
  }

  private updateHeroImage() {
    const hero = HEROES[this.currentHeroIndex]
    this.heroImage.setTexture(hero.id)
    const imgScale = Math.min(180 / this.heroImage.width, 240 / this.heroImage.height)
    this.heroImage.setScale(imgScale)
    this.heroNameText.setText(hero.name.toUpperCase())
  }

  private proceedToNextScene() {
    if (this.playerName === this.player1Name) {
      this.registry.set('player1Heroes', this.heroes)
      this.scene.start('Player2HeroSelectScene', {
        player1Name: this.player1Name,
        player2Name: this.player2Name
      })
    } else {
      this.registry.set('player2Heroes', this.heroes)
      console.log('Player 1 Heroes:', this.registry.get('player1Heroes'))
      console.log('Player 2 Heroes:', this.heroes)
    }
  }
}
