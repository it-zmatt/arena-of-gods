import Phaser from 'phaser'
import { HEROES } from '../constants/heroes'
import type { HeroAttributes } from '../constants/heroes'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']

export default class HeroLevelUpScene extends Phaser.Scene {
  private player1Name!: string
  private player2Name!: string
  private playerName!: string
  private heroes: HeroAttributes[] = []
  private currentHeroIndex: number = 0
  private credits: number = 15

  // UI elements
  private heroSlots: Phaser.GameObjects.Container[] = []
  private heroImage!: Phaser.GameObjects.Image
  private attributeValueTexts: Phaser.GameObjects.Text[] = []
  private heroNameText!: Phaser.GameObjects.Text
  private creditsText!: Phaser.GameObjects.Text

  constructor() {
    super('HeroLevelUpScene')
  }

  init(data: { player1Name: string; player2Name?: string; currentPlayer?: string }) {
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name || 'Player 2'
    this.playerName = data.currentPlayer || data.player1Name

    // Initialize all heroes with their unique default attributes
    this.heroes = HEROES.map(hero => ({
      strength: hero.defaultAttributes.strength,
      defense: hero.defaultAttributes.defense,
      intelligence: hero.defaultAttributes.intelligence,
      accuracy: hero.defaultAttributes.accuracy,
      agility: hero.defaultAttributes.agility,
      stamina: hero.defaultAttributes.stamina
    }))

    // Each player starts with 15 credits
    this.credits = 15

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

    // Fade in transition
    this.cameras.main.fadeIn(500, 0, 0, 0)

    // Random background
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
      .text(width / 2, 70, '— Level Up Your Heroes —', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#e2e8f0'
      })
      .setOrigin(0.5)

    // Credits display
    this.creditsText = this.add
      .text(width / 2, 100, `Credits: ${this.credits}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setShadow(2, 2, '#000000', 2)

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
        const hero = this.heroes[this.currentHeroIndex]
        const defaultAttr = HEROES[this.currentHeroIndex].defaultAttributes[key]
        
        // Can only decrease if above default value
        if (hero[key] > defaultAttr) {
          hero[key]--
          this.credits++ // Return credit when decreasing
          
          // Button press animation
          this.tweens.add({
            targets: minusBtn,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          })
          
          // Particle effect
          this.createAttributeParticle(attrX + 60, y, 0x44ff44, false)
          
          this.updateAttributeDisplay()
          this.updateCreditsDisplay()
        } else {
          // Shake animation when can't decrease
          this.tweens.add({
            targets: minusBtn,
            x: attrX + 60 + (Math.random() - 0.5) * 5,
            duration: 100,
            repeat: 3,
            yoyo: true
          })
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

      plusBtn.on('pointerover', () => {
        if (this.credits > 0) {
          plusBtn.setFillStyle(0x15803d)
        } else {
          plusBtn.setFillStyle(0x374151) // Gray when no credits
        }
      })
      plusBtn.on('pointerout', () => {
        if (this.credits > 0) {
          plusBtn.setFillStyle(0x166534)
        } else {
          plusBtn.setFillStyle(0x374151) // Gray when no credits
        }
      })
      plusBtn.on('pointerdown', () => {
        if (this.credits > 0) {
          this.heroes[this.currentHeroIndex][key]++
          this.credits--
          
          // Button press animation
          this.tweens.add({
            targets: plusBtn,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          })
          
          // Particle effect
          this.createAttributeParticle(attrX + 140, y, 0xfbbf24, true)
          
          // Hero image glow effect
          if (this.heroImage) {
            this.tweens.add({
              targets: this.heroImage,
              scaleX: 1.1,
              scaleY: 1.1,
              duration: 200,
              yoyo: true,
              ease: 'Back.easeOut'
            })
          }
          
          this.updateAttributeDisplay()
          this.updateCreditsDisplay()
          
          // Update button color after spending credit
          if (this.credits === 0) {
            plusBtn.setFillStyle(0x374151)
          }
        } else {
          // Shake animation when no credits
          this.tweens.add({
            targets: plusBtn,
            x: attrX + 140 + (Math.random() - 0.5) * 5,
            duration: 100,
            repeat: 3,
            yoyo: true
          })
        }
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
        if (this.playerName === this.player1Name) {
          // Go back to hero selection
          this.scene.start('HeroSelectScene', {
            player1Name: this.player1Name,
            player2Name: this.player2Name
          })
        } else {
          // Go back to Player 2 hero selection
          this.scene.start('Player2HeroSelectScene', {
            player1Name: this.player1Name,
            player2Name: this.player2Name
          })
        }
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
      // Celebration particles
      for (let i = 0; i < 10; i++) {
        this.time.delayedCall(i * 50, () => {
          this.createAttributeParticle(
            width / 2 + (Math.random() - 0.5) * 200,
            height / 2 + (Math.random() - 0.5) * 200,
            0xfbbf24,
            true
          )
        })
      }
      
      this.cameras.main.fadeOut(300, 0, 0, 0)
      this.time.delayedCall(300, () => {
        this.proceedToNextScene()
      })
    })

    // Initialize display
    this.updateHeroSelection()
    this.updateAttributeDisplay()
    this.updateCreditsDisplay()
  }

  private selectHero(index: number) {
    this.currentHeroIndex = index
    
    // Animate hero slot selection
    const selectedSlot = this.heroSlots[index]
    this.tweens.add({
      targets: selectedSlot,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Back.easeOut'
    })
    
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
      const text = this.attributeValueTexts[index]
      const oldValue = parseInt(text.text) || 0
      const newValue = hero[key]
      
      if (oldValue !== newValue) {
        // Animate value change
        this.tweens.add({
          targets: text,
          scaleX: 1.3,
          scaleY: 1.3,
          duration: 150,
          yoyo: true,
          ease: 'Back.easeOut',
          onComplete: () => {
            text.setText(newValue.toString())
          }
        })
      } else {
        text.setText(newValue.toString())
      }
    })
  }

  private updateCreditsDisplay() {
    const oldText = this.creditsText.text
    this.creditsText.setText(`Credits: ${this.credits}`)
    
    // Animate credit change
    if (oldText !== this.creditsText.text) {
      this.tweens.add({
        targets: this.creditsText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      })
    }
    
    // Change color based on credits remaining
    if (this.credits === 0) {
      this.creditsText.setColor('#ef4444') // Red when out of credits
    } else if (this.credits <= 5) {
      this.creditsText.setColor('#f59e0b') // Orange when low
    } else {
      this.creditsText.setColor('#fbbf24') // Gold when plenty
    }

    // Update all plus buttons to reflect credit availability
    // This is a workaround since we don't store button references
    // In a production app, you'd want to store button references
  }

  private updateHeroImage() {
    const hero = HEROES[this.currentHeroIndex]
    
    // Fade out old image
    this.tweens.add({
      targets: this.heroImage,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 200,
      onComplete: () => {
        this.heroImage.setTexture(hero.id)
        const imgScale = Math.min(180 / this.heroImage.width, 240 / this.heroImage.height)
        this.heroImage.setScale(imgScale)
        
        // Fade in new image with bounce
        this.heroImage.setAlpha(0)
        this.heroImage.setScale(imgScale * 0.8)
        this.tweens.add({
          targets: this.heroImage,
          alpha: 1,
          scaleX: imgScale,
          scaleY: imgScale,
          duration: 300,
          ease: 'Back.easeOut'
        })
      }
    })
    
    // Update name with animation
    this.tweens.add({
      targets: this.heroNameText,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.heroNameText.setText(hero.name.toUpperCase())
        this.tweens.add({
          targets: this.heroNameText,
          alpha: 1,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 200,
          yoyo: true,
          ease: 'Back.easeOut'
        })
      }
    })
  }

  private createAttributeParticle(x: number, y: number, color: number, isUp: boolean) {
    const particle = this.add.circle(x, y, 3, color)
    particle.setAlpha(0.8)
    
    this.tweens.add({
      targets: particle,
      y: y + (isUp ? -30 : 30),
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      ease: 'Power2',
      onComplete: () => particle.destroy()
    })
  }

  private proceedToNextScene() {
    if (this.playerName === this.player1Name) {
      // Store player 1's heroes data
      this.registry.set('player1Heroes', this.heroes)
      
      // Transition to Player 2's hero selection screen
      this.scene.start('Player2HeroSelectScene', {
        player1Name: this.player1Name,
        player2Name: this.player2Name
      })
    } else {
      // Player 2 is done, save their heroes data
      this.registry.set('player2Heroes', this.heroes)
      
      // Both players are done - start the battle
      this.scene.start('BattleScene', {
        player1Name: this.player1Name,
        player2Name: this.player2Name
      })
    }
  }
}
