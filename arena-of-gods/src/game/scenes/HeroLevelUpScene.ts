import Phaser from 'phaser'

interface HeroAttributes {
  strength: number
  defense: number
  intelligence: number
  accuracy: number
  agility: number
  stamina: number
}

export default class HeroLevelUpScene extends Phaser.Scene {
  private playerName!: string
  private player1Name!: string
  private player2Name!: string
  private heroes: HeroAttributes[] = []
  private currentHeroIndex: number = 0
  private heroNames: string[] = ['Kael', 'Hero 2', 'Hero 3', 'Hero 4', 'Hero 5']
  
  // UI elements
  private heroSlots: Phaser.GameObjects.Rectangle[] = []
  private heroImagePlaceholder!: Phaser.GameObjects.Rectangle
  private attributeTexts: Phaser.GameObjects.Text[] = []
  private attributeValues: Phaser.GameObjects.Text[] = []
  private attributesTitle!: Phaser.GameObjects.Text
  private playerNameText!: Phaser.GameObjects.Text

  constructor() {
    super('HeroLevelUpScene')
  }

  init(data: { player1Name: string; player2Name?: string; currentPlayer?: string }) {
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name || 'Player 2'
    this.playerName = data.currentPlayer || data.player1Name
    
    // Initialize all heroes with default attributes (all = 1)
    this.heroes = Array(5).fill(null).map(() => ({
      strength: 1,
      defense: 1,
      intelligence: 1,
      accuracy: 1,
      agility: 1,
      stamina: 1
    }))
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#0f172a')

    // Player name at the top
    this.playerNameText = this.add
      .text(this.cameras.main.width / 2, 50, `${this.playerName} — Level Up Your Heroes`, {
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    // Main panel (centered)
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2
    const panelWidth = 700
    const panelHeight = 500

    const mainPanel = this.add
      .rectangle(centerX, centerY, panelWidth, panelHeight, 0xffffff)
      .setStrokeStyle(4, 0x000000)

    // Hero selection slots at the top
    const slotStartX = centerX - 200
    const slotY = centerY - 200
    const slotSpacing = 80
    const slotSize = 60

    for (let i = 0; i < 5; i++) {
      const slot = this.add
        .rectangle(slotStartX + i * slotSpacing, slotY, slotSize, slotSize, 0xffffff)
        .setStrokeStyle(2, 0x000000)
        .setInteractive({ useHandCursor: true })

      this.heroSlots.push(slot)

      slot.on('pointerdown', () => {
        this.selectHero(i)
      })

      slot.on('pointerover', () => {
        if (i !== this.currentHeroIndex) {
          slot.setFillStyle(0xf0f0f0)
        }
      })

      slot.on('pointerout', () => {
        if (i !== this.currentHeroIndex) {
          slot.setFillStyle(0xffffff)
        }
      })
    }

    // Hero image placeholder (left side)
    const imageX = centerX - 200
    const imageY = centerY + 50
    this.heroImagePlaceholder = this.add
      .rectangle(imageX, imageY, 200, 250, 0xe0e0e0)
      .setStrokeStyle(2, 0x000000)

    // Attributes section (right side)
    const attributesX = centerX + 150
    const attributesY = centerY - 50
    const attributeSpacing = 50

    this.attributesTitle = this.add
      .text(attributesX, attributesY - 100, `${this.heroNames[this.currentHeroIndex]}'s Attributes`, {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    const attributeNames = ['Strength', 'Defense', 'Intelligence', 'Accuracy', 'Agility', 'Stamina']
    const attributeKeys: (keyof HeroAttributes)[] = ['strength', 'defense', 'intelligence', 'accuracy', 'agility', 'stamina']

    attributeNames.forEach((name, index) => {
      const y = attributesY + index * attributeSpacing
      const key = attributeKeys[index]

      // Attribute container
      const attrContainer = this.add
        .rectangle(attributesX, y, 300, 40, 0xf5f5f5)
        .setStrokeStyle(1, 0x000000)

      // Attribute name
      this.add
        .text(attributesX - 100, y, `${name} -`, {
          fontSize: '16px',
          color: '#000000'
        })
        .setOrigin(0.5, 0.5)

      // Minus button
      const minusBtn = this.add
        .rectangle(attributesX - 20, y, 30, 30, 0xff6b6b)
        .setStrokeStyle(1, 0x000000)
        .setInteractive({ useHandCursor: true })

      this.add
        .text(attributesX - 20, y, '-', {
          fontSize: '20px',
          color: '#ffffff',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)

      minusBtn.on('pointerdown', () => {
        if (this.heroes[this.currentHeroIndex][key] > 1) {
          this.heroes[this.currentHeroIndex][key]--
          this.updateAttributeDisplay()
        }
      })

      minusBtn.on('pointerover', () => {
        minusBtn.setFillStyle(0xff5252)
      })

      minusBtn.on('pointerout', () => {
        minusBtn.setFillStyle(0xff6b6b)
      })

      // Attribute value
      const valueText = this.add
        .text(attributesX, y, '1', {
          fontSize: '18px',
          color: '#000000',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)

      this.attributeValues.push(valueText)

      // Plus button
      const plusBtn = this.add
        .rectangle(attributesX + 20, y, 30, 30, 0x4caf50)
        .setStrokeStyle(1, 0x000000)
        .setInteractive({ useHandCursor: true })

      this.add
        .text(attributesX + 20, y, '+', {
          fontSize: '20px',
          color: '#ffffff',
          fontStyle: 'bold'
        })
        .setOrigin(0.5)

      plusBtn.on('pointerdown', () => {
        this.heroes[this.currentHeroIndex][key]++
        this.updateAttributeDisplay()
      })

      plusBtn.on('pointerover', () => {
        plusBtn.setFillStyle(0x45a049)
      })

      plusBtn.on('pointerout', () => {
        plusBtn.setFillStyle(0x4caf50)
      })
    })

    // Next button (bottom right)
    const nextButtonX = centerX + 250
    const nextButtonY = centerY + 200
    const nextButton = this.add
      .rectangle(nextButtonX, nextButtonY, 120, 40, 0x2196f3)
      .setStrokeStyle(2, 0x000000)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(nextButtonX, nextButtonY, 'Next', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    nextButton.on('pointerdown', () => {
      this.proceedToNextScene()
    })

    nextButton.on('pointerover', () => {
      nextButton.setFillStyle(0x1976d2)
    })

    nextButton.on('pointerout', () => {
      nextButton.setFillStyle(0x2196f3)
    })

    // Update initial display
    this.updateHeroSelection()
    this.updateAttributeDisplay()
  }

  private selectHero(index: number) {
    this.currentHeroIndex = index
    this.updateHeroSelection()
    this.updateAttributeDisplay()
    this.updateHeroName()
  }

  private updateHeroSelection() {
    this.heroSlots.forEach((slot, index) => {
      if (index === this.currentHeroIndex) {
        slot.setFillStyle(0x90ee90) // Light green for selected
      } else {
        slot.setFillStyle(0xffffff) // White for unselected
      }
    })
  }

  private updateAttributeDisplay() {
    const hero = this.heroes[this.currentHeroIndex]
    const attributeKeys: (keyof HeroAttributes)[] = ['strength', 'defense', 'intelligence', 'accuracy', 'agility', 'stamina']

    attributeKeys.forEach((key, index) => {
      this.attributeValues[index].setText(hero[key].toString())
    })
  }

  private updateHeroName() {
    this.attributesTitle.setText(`${this.heroNames[this.currentHeroIndex]}'s Attributes`)
  }

  private proceedToNextScene() {
    // Store player 1's heroes data if this is player 1
    if (this.playerName === this.player1Name) {
      // Save player 1's heroes data to registry for later use
      this.registry.set('player1Heroes', this.heroes)
      
      // Transition to Player 2's hero selection screen
      this.scene.start('Player2HeroSelectScene', {
        player1Name: this.player1Name,
        player2Name: this.player2Name
      })
    } else {
      // Player 2 is done, save their heroes data
      this.registry.set('player2Heroes', this.heroes)
      
      // Both players are done - proceed to next scene (game start, etc.)
      console.log('Player 1 Heroes:', this.registry.get('player1Heroes'))
      console.log('Player 2 Heroes:', this.heroes)
      
      // TODO: Transition to game scene or next phase
      // this.scene.start('GameScene', { player1Heroes: this.registry.get('player1Heroes'), player2Heroes: this.heroes })
    }
  }
}
