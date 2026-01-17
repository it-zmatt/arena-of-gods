import Phaser from 'phaser'
import { HEROES } from '../constants/heroes'
import type { HeroAttributes } from '../constants/heroes'
import GeminiService from '../services/GeminiService'
import type { CombatContext, HeroContext } from '../types/gemini'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']

interface Hero {
  id: string
  name: string
  attributes: HeroAttributes
  health: number
  maxHealth: number
  healthBar?: Phaser.GameObjects.Rectangle
  healthBarBg?: Phaser.GameObjects.Rectangle
  heroImage?: Phaser.GameObjects.Image
  healthText?: Phaser.GameObjects.Text
  damageText?: Phaser.GameObjects.Text
  glowEffect?: Phaser.GameObjects.Graphics
}


export default class BattleScene extends Phaser.Scene {
  private player1Name!: string
  private player2Name!: string
  private player1Heroes: Hero[] = []
  private player2Heroes: Hero[] = []
  private battleLog: string[] = []
  private currentTurn: number = 1
  private logTexts: Phaser.GameObjects.Text[] = []
  private turnIndicator!: Phaser.GameObjects.Text
  private leftColumnX!: number
  private rightColumnX!: number
  private heroStartY!: number
  private battleTimer!: Phaser.Time.TimerEvent
  private battleEnded: boolean = false
  private particleManager!: any
  private attackParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private criticalParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private healParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private deathParticles!: Phaser.GameObjects.Particles.ParticleEmitter


  constructor() {
    super('BattleScene')
    this.geminiService = new GeminiService()
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

    // Random background
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
    this.currentEnvironment = randomBg
    const bg = this.add.image(0, 0, `bg_${randomBg}`).setOrigin(0, 0)
    bg.setDisplaySize(width, height)

    // Subtle background animation
    this.tweens.add({
      targets: bg,
      alpha: 0.9,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Dark overlay with pulsing effect
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
    this.tweens.add({
      targets: overlay,
      alpha: 0.6,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Initialize particle systems
    this.initParticleSystems()

    // Title banner at top
    const bannerHeight = 100
    const bannerBg = this.add.graphics()
    bannerBg.fillGradientStyle(0x0f172a, 0x0f172a, 0x0f172a, 0x0f172a, 1, 1, 0, 0)
    bannerBg.fillRect(0, 0, width, bannerHeight)

    // Decorative gold line under banner
    this.add.rectangle(width / 2, bannerHeight, width, 4, 0xfbbf24)

    // Load hero data from registry
    const player1HeroesData = this.registry.get('player1Heroes') as HeroAttributes[] || []
    const player2HeroesData = this.registry.get('player2Heroes') as HeroAttributes[] || []

    // Initialize heroes with health (stamina * 10 as max health)
    this.player1Heroes = HEROES.map((hero, index) => {
      const attrs = player1HeroesData[index] || hero.defaultAttributes
      const maxHealth = attrs.stamina * 10
      return {
        id: hero.id,
        name: hero.name,
        attributes: attrs,
        health: maxHealth,
        maxHealth
      }
    })

    this.player2Heroes = HEROES.map((hero, index) => {
      const attrs = player2HeroesData[index] || hero.defaultAttributes
      const maxHealth = attrs.stamina * 10
      return {
        id: hero.id,
        name: hero.name,
        attributes: attrs,
        health: maxHealth,
        maxHealth
      }
    })

    // Battle title
    this.add
      .text(width / 2, 35, '⚔ BATTLE ARENA ⚔', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#fbbf24', 8, true, true)

    // Turn indicator
    this.turnIndicator = this.add
      .text(width / 2, 70, `Turn: ${this.currentTurn}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#e2e8f0'
      })
      .setOrigin(0.5)

    // Calculate positions
    this.leftColumnX = width * 0.2
    const centerColumnX = width / 2
    this.rightColumnX = width * 0.8

    // Player names with banners
    const playerBannerY = 140

    // Player 1 banner
    const p1Banner = this.add.graphics()
    p1Banner.fillStyle(0x1e293b, 0.9)
    p1Banner.fillRect(this.leftColumnX - 120, playerBannerY - 20, 240, 40)
    p1Banner.lineStyle(2, 0xfbbf24, 0.5)
    p1Banner.strokeRect(this.leftColumnX - 120, playerBannerY - 20, 240, 40)

    this.add
      .text(this.leftColumnX, playerBannerY, this.player1Name, {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)

    // Player 2 banner
    const p2Banner = this.add.graphics()
    p2Banner.fillStyle(0x1e293b, 0.9)
    p2Banner.fillRect(this.rightColumnX - 120, playerBannerY - 20, 240, 40)
    p2Banner.lineStyle(2, 0xfbbf24, 0.5)
    p2Banner.strokeRect(this.rightColumnX - 120, playerBannerY - 20, 240, 40)

    this.add
      .text(this.rightColumnX, playerBannerY, this.player2Name, {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)

    this.heroStartY = 220
    const heroSpacing = 80

    // Player 1 Heroes
    this.player1Heroes.forEach((hero, index) => {
      const y = this.heroStartY + index * heroSpacing

      // Hero card background
      const cardBg = this.add.graphics()
      cardBg.fillStyle(0x1e293b, 0.8)
      cardBg.fillRect(this.leftColumnX - 120, y - 30, 240, 60)
      cardBg.lineStyle(2, 0x475569)
      cardBg.strokeRect(this.leftColumnX - 120, y - 30, 240, 60)

      // Hero image on the left
      hero.heroImage = this.add.image(this.leftColumnX - 95, y, hero.id)
      const imageScale = Math.min(45 / hero.heroImage.width, 50 / hero.heroImage.height)
      hero.heroImage.setScale(imageScale)

      // Hero name
      this.add
        .text(this.leftColumnX - 45, y - 15, hero.name.toUpperCase(), {
          fontFamily: '"Press Start 2P"',
          fontSize: '10px',
          color: '#fbbf24'
        })
        .setOrigin(0, 0.5)

      // Health bar background
      hero.healthBarBg = this.add
        .rectangle(this.leftColumnX - 45, y + 10, 150, 16, 0x334155)
        .setStrokeStyle(2, 0x475569)
        .setOrigin(0, 0.5)

      // Health bar (green)
      const healthPercent = hero.health / hero.maxHealth
      hero.healthBar = this.add
        .rectangle(
          this.leftColumnX - 45,
          y + 10,
          150 * healthPercent,
          16,
          0x10b981
        )
        .setOrigin(0, 0.5)

      // Health text
      hero.healthText = this.add
        .text(this.leftColumnX + 30, y + 10, `${Math.ceil(hero.health)}/${hero.maxHealth}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: '8px',
          color: '#ffffff'
        })
        .setOrigin(0.5)
    })

    // Player 2 Heroes
    this.player2Heroes.forEach((hero, index) => {
      const y = this.heroStartY + index * heroSpacing

      // Hero card background
      const cardBg = this.add.graphics()
      cardBg.fillStyle(0x1e293b, 0.8)
      cardBg.fillRect(this.rightColumnX - 120, y - 30, 240, 60)
      cardBg.lineStyle(2, 0x475569)
      cardBg.strokeRect(this.rightColumnX - 120, y - 30, 240, 60)

      // Hero image on the right
      hero.heroImage = this.add.image(this.rightColumnX + 95, y, hero.id)
      const imageScale = Math.min(45 / hero.heroImage.width, 50 / hero.heroImage.height)
      hero.heroImage.setScale(imageScale)

      // Hero name
      this.add
        .text(this.rightColumnX + 45, y - 15, hero.name.toUpperCase(), {
          fontFamily: '"Press Start 2P"',
          fontSize: '10px',
          color: '#fbbf24'
        })
        .setOrigin(1, 0.5)

      // Health bar background
      hero.healthBarBg = this.add
        .rectangle(this.rightColumnX - 105, y + 10, 150, 16, 0x334155)
        .setStrokeStyle(2, 0x475569)
        .setOrigin(0, 0.5)

      // Health bar (green)
      const healthPercent = hero.health / hero.maxHealth
      hero.healthBar = this.add
        .rectangle(
          this.rightColumnX - 105,
          y + 10,
          150 * healthPercent,
          16,
          0x10b981
        )
        .setOrigin(0, 0.5)

      // Health text
      hero.healthText = this.add
        .text(this.rightColumnX - 30, y + 10, `${Math.ceil(hero.health)}/${hero.maxHealth}`, {
          fontFamily: '"Press Start 2P"',
          fontSize: '8px',
          color: '#ffffff'
        })
        .setOrigin(0.5)
    })

    // Center Section - Battle Log Panel
    const logPanelY = height / 2 + 50
    const logPanelWidth = 500
    const logPanelHeight = 300

    // Log panel background
    const logPanel = this.add.graphics()
    logPanel.fillStyle(0x0f172a, 0.9)
    logPanel.fillRect(centerColumnX - logPanelWidth / 2, logPanelY - logPanelHeight / 2, logPanelWidth, logPanelHeight)
    logPanel.lineStyle(3, 0xfbbf24, 0.5)
    logPanel.strokeRect(centerColumnX - logPanelWidth / 2, logPanelY - logPanelHeight / 2, logPanelWidth, logPanelHeight)

    // Log panel title
    this.add
      .text(centerColumnX, logPanelY - logPanelHeight / 2 + 20, '— BATTLE LOG —', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)

    const narrativeStartY = logPanelY - logPanelHeight / 2 + 50
    const maxLogLines = 10

    // Initialize battle log (will be populated when battle starts)
    this.battleLog = []

    // Display battle log
    this.updateBattleLog(centerColumnX, narrativeStartY, maxLogLines)

    // Back button (top left corner)
    const backButton = this.add
      .rectangle(50, 30, 120, 40, 0x6b7280)
      .setStrokeStyle(2, 0x9ca3af)
      .setInteractive({ useHandCursor: true })

    this.add
      .text(50, 30, 'BACK', {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x9ca3af)
    })

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x6b7280)
    })

    backButton.on('pointerdown', () => {
      // Stop battle simulation
      if (this.battleTimer) {
        this.battleTimer.remove()
      }
      this.battleEnded = true
      
      // Go back to Player 2's level up screen
      this.scene.start('HeroLevelUpScene', {
        player1Name: this.player1Name,
        player2Name: this.player2Name,
        currentPlayer: this.player2Name
      })
    })

    // Entrance animation for heroes
    this.animateHeroEntrance()

    // Start battle simulation after heroes have entered
    this.time.delayedCall(1000, () => {
      this.startBattleSimulation()
    })
  }

  private initParticleSystems() {
    // Create a simple particle texture using graphics
    const graphics = this.add.graphics()
    graphics.fillStyle(0xffffff)
    graphics.fillCircle(0, 0, 4)
    graphics.generateTexture('particle', 8, 8)
    graphics.destroy()

    // Create particle manager
    this.particleManager = this.add.particles(0, 0, 'particle', {
      scale: { start: 0.3, end: 0 },
      speed: { min: 50, max: 150 },
      lifespan: 500,
      quantity: 1
    })

    // Attack particles (red/orange)
    this.attackParticles = this.particleManager.createEmitter({
      tint: [0xff4444, 0xff8844, 0xffaa44],
      scale: { start: 0.5, end: 0 },
      speed: { min: 100, max: 200 },
      lifespan: 600,
      quantity: 15,
      frequency: -1
    })
    this.attackParticles.stop()

    // Critical hit particles (gold/yellow)
    this.criticalParticles = this.particleManager.createEmitter({
      tint: [0xffd700, 0xffff00, 0xffaa00],
      scale: { start: 0.8, end: 0 },
      speed: { min: 150, max: 300 },
      lifespan: 800,
      quantity: 30,
      frequency: -1,
      blendMode: 'ADD'
    })
    this.criticalParticles.stop()

    // Heal particles (green)
    this.healParticles = this.particleManager.createEmitter({
      tint: [0x44ff44, 0x88ff88, 0x44ff88],
      scale: { start: 0.4, end: 0 },
      speed: { min: 80, max: 150 },
      lifespan: 700,
      quantity: 12,
      frequency: -1
    })
    this.healParticles.stop()

    // Death particles (gray/black)
    this.deathParticles = this.particleManager.createEmitter({
      tint: [0x666666, 0x444444, 0x000000],
      scale: { start: 0.5, end: 0 },
      speed: { min: 80, max: 150 },
      lifespan: 800,
      quantity: 20,
      frequency: -1
    })
    this.deathParticles.stop()
  }

  private animateHeroEntrance() {
    // Animate Player 1 heroes sliding in from left
    this.player1Heroes.forEach((hero, index) => {
      if (hero.heroImage) {
        const startX = hero.heroImage.x - 200
        hero.heroImage.x = startX
        hero.heroImage.setAlpha(0)
        
        this.tweens.add({
          targets: hero.heroImage,
          x: hero.heroImage.x + 200,
          alpha: 1,
          duration: 500,
          delay: index * 100,
          ease: 'Back.easeOut'
        })
      }
    })

    // Animate Player 2 heroes sliding in from right
    this.player2Heroes.forEach((hero, index) => {
      if (hero.heroImage) {
        const startX = hero.heroImage.x + 200
        hero.heroImage.x = startX
        hero.heroImage.setAlpha(0)
        
        this.tweens.add({
          targets: hero.heroImage,
          x: hero.heroImage.x - 200,
          alpha: 1,
          duration: 500,
          delay: index * 100,
          ease: 'Back.easeOut'
        })
      }
    })
  }

  private updateBattleLog(centerX: number, startY: number, maxLines: number) {
    // Clear existing log texts
    this.logTexts.forEach(text => text.destroy())
    this.logTexts = []

    // Display the most recent log entries
    const displayLog = this.battleLog.slice(-maxLines)
    const lineSpacing = 22

    displayLog.forEach((logEntry, index) => {
      const y = startY + index * lineSpacing
      const isNew = index === displayLog.length - 1
      const isCritical = logEntry.includes('CRITICAL')
      
      const logText = this.add
        .text(centerX, y, logEntry, {
          fontFamily: '"Press Start 2P"',
          fontSize: isCritical ? '9px' : '8px',
          color: isCritical ? '#ffd700' : '#e2e8f0',
          wordWrap: { width: 450 },
          stroke: isCritical ? '#000000' : undefined,
          strokeThickness: isCritical ? 2 : 0
        })
        .setOrigin(0.5, 0)
        .setAlpha(isNew ? 0 : 1)

      // Animate new log entries
      if (isNew) {
        this.tweens.add({
          targets: logText,
          alpha: 1,
          x: centerX + (Math.random() - 0.5) * 20,
          duration: 300,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: logText,
              x: centerX,
              duration: 200
            })
          }
        })

        // Pulse effect for critical hits
        if (isCritical) {
          this.tweens.add({
            targets: logText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
          })
        }
      }

      this.logTexts.push(logText)
    })
  }

  private startBattleSimulation() {
    // Add initial battle start message
    this.battleLog.push('⚔ The battle begins! ⚔')
    const centerX = this.cameras.main.width / 2
    const logStartY = this.cameras.main.height / 2 + 50 - 300 / 2 + 50
    this.updateBattleLog(centerX, logStartY, 10)

    // Simulate battle events periodically - start immediately, then every 2 seconds
    this.battleTimer = this.time.addEvent({
      delay: 2000,
      callback: () => {
        if (!this.battleEnded) {
          this.simulateBattleEvent()
        }
      },
      loop: true
    })
  }

  private async simulateBattleEvent() {
    // Prevent concurrent API calls
    if (this.isProcessingTurn || this.battleEnded) {
      return
    }

    this.isProcessingTurn = true

    try {
      // Pick random attacker and defender
      const attackerTeam = Math.random() > 0.5 ? this.player1Heroes : this.player2Heroes
      const defenderTeam = attackerTeam === this.player1Heroes ? this.player2Heroes : this.player1Heroes

      // Filter out dead heroes
      const aliveAttackers = attackerTeam.filter(h => h.health > 0)
      const aliveDefenders = defenderTeam.filter(h => h.health > 0)

      if (aliveAttackers.length === 0 || aliveDefenders.length === 0) {
        this.isProcessingTurn = false
        return
      }

      const attacker = aliveAttackers[Math.floor(Math.random() * aliveAttackers.length)]
      const defender = aliveDefenders[Math.floor(Math.random() * aliveDefenders.length)]

      // Show loading indicator
      this.showLoadingIndicator()

      // Build context with character metadata
      const context: CombatContext = {
        attacker: this.buildHeroContext(attacker),
        defender: this.buildHeroContext(defender),
        turnNumber: this.currentTurn,
        battleEnvironment: this.currentEnvironment
      }

      // Call Gemini API
      const response = await this.geminiService.generateBattleOutcome(context)

      this.hideLoadingIndicator()

      if (!response.success) {
        console.warn('Gemini API failed, using fallback')
      }

      const outcome = response.outcome!

      // Update battle log with AI narrative
      this.battleLog.push(outcome.narrative)

      // Apply stat-based damage
      if (outcome.attackSuccess) {
        defender.health = Math.max(0, defender.health - outcome.damage)

        if (outcome.criticalHit) {
          this.showCriticalHitEffect(defender)
        }
      }

      // Increment turn
      this.currentTurn++
      this.turnIndicator.setText(`Turn: ${this.currentTurn}`)

      // Update display
      this.updateHealthBars()
      const centerX = this.cameras.main.width / 2
      const logStartY = this.cameras.main.height / 2 + 50 - 300 / 2 + 50
      this.updateBattleLog(centerX, logStartY, 10)

      // Check if battle ended after this turn
      this.checkBattleEnd()

    } catch (error) {
      console.error('Battle simulation error:', error)
    } finally {
      this.isProcessingTurn = false
    }
  }

  private checkBattleEnd(): boolean {
    // Check if all Player 1 heroes are dead
    const player1Alive = this.player1Heroes.some(hero => hero.health > 0)
    
    // Check if all Player 2 heroes are dead
    const player2Alive = this.player2Heroes.some(hero => hero.health > 0)

    if (!player1Alive) {
      // Player 2 wins
      this.endBattle(this.player2Name)
      return true
    }

    if (!player2Alive) {
      // Player 1 wins
      this.endBattle(this.player1Name)
      return true
    }

    return false
  }

  private endBattle(winnerName: string) {
    // Mark battle as ended
    this.battleEnded = true

    // Stop the battle simulation
    if (this.battleTimer) {
      this.battleTimer.remove()
    }

    // Add final battle log entry
    this.battleLog.push(`${winnerName} has won the battle!`)
    const centerX = this.cameras.main.width / 2
    const logStartY = this.cameras.main.height / 2 + 50 - 300 / 2 + 50
    this.updateBattleLog(centerX, logStartY, 10)

    // Victory celebration effects
    this.celebrateVictory(winnerName)

    // Transition to winner scene after a short delay
    this.time.delayedCall(3000, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this.time.delayedCall(500, () => {
        this.scene.start('WinnerScene', {
          winnerName,
          player1Name: this.player1Name,
          player2Name: this.player2Name
        })
      })
    })
  }

  private celebrateVictory(winnerName: string) {
    const { width, height } = this.cameras.main
    
    // Create victory text
    const victoryText = this.add
      .text(width / 2, height / 2, `${winnerName.toUpperCase()} WINS!`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '40px',
        color: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 0, '#fbbf24', 20, true, true)

    // Animate victory text
    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: victoryText,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        })
      }
    })

    // Celebration particles
    for (let i = 0; i < 5; i++) {
      this.time.delayedCall(i * 200, () => {
        this.criticalParticles.setPosition(
          Math.random() * width,
          Math.random() * height
        )
        this.criticalParticles.explode(50)
      })
    }

    // Screen flash
    const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff, 0.3)
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500
    })
  }

  private updateHealthBars() {
    // Update Player 1 health bars
    this.player1Heroes.forEach((hero) => {
      if (hero.healthBar && hero.healthText) {
        const healthPercent = hero.health / hero.maxHealth
        const newWidth = 150 * healthPercent
        
        // Animate health bar decrease
        this.tweens.add({
          targets: hero.healthBar,
          width: newWidth,
          duration: 300,
          ease: 'Power2'
        })
        
        hero.healthText.setText(`${Math.ceil(hero.health)}/${hero.maxHealth}`)

        // Change health bar color based on health
        if (healthPercent > 0.6) {
          hero.healthBar.setFillStyle(0x10b981) // Green
        } else if (healthPercent > 0.3) {
          hero.healthBar.setFillStyle(0xf59e0b) // Orange
        } else {
          hero.healthBar.setFillStyle(0xef4444) // Red
        }

        // Gray out dead heroes with animation
        if (hero.health <= 0 && hero.heroImage) {
          this.tweens.add({
            targets: hero.heroImage,
            tint: 0x666666,
            alpha: 0.3,
            scaleX: 0.8,
            scaleY: 0.8,
            rotation: Math.PI / 4,
            duration: 500,
            ease: 'Power2'
          })
          
          // Death particles
          this.deathParticles.setPosition(hero.heroImage.x, hero.heroImage.y)
          this.deathParticles.explode(20)
        }
      }
    })

    // Update Player 2 health bars
    this.player2Heroes.forEach((hero) => {
      if (hero.healthBar && hero.healthText) {
        const healthPercent = hero.health / hero.maxHealth
        const newWidth = 150 * healthPercent
        
        // Animate health bar decrease
        this.tweens.add({
          targets: hero.healthBar,
          width: newWidth,
          duration: 300,
          ease: 'Power2'
        })
        
        hero.healthText.setText(`${Math.ceil(hero.health)}/${hero.maxHealth}`)

        // Change health bar color based on health
        if (healthPercent > 0.6) {
          hero.healthBar.setFillStyle(0x10b981) // Green
        } else if (healthPercent > 0.3) {
          hero.healthBar.setFillStyle(0xf59e0b) // Orange
        } else {
          hero.healthBar.setFillStyle(0xef4444) // Red
        }

        // Gray out dead heroes with animation
        if (hero.health <= 0 && hero.heroImage) {
          this.tweens.add({
            targets: hero.heroImage,
            tint: 0x666666,
            alpha: 0.3,
            scaleX: 0.8,
            scaleY: 0.8,
            rotation: -Math.PI / 4,
            duration: 500,
            ease: 'Power2'
          })
          
          // Death particles
          this.deathParticles.setPosition(hero.heroImage.x, hero.heroImage.y)
          this.deathParticles.explode(20)
        }
      }
    })
  }

  private buildHeroContext(hero: Hero): HeroContext {
    // Find matching hero data from HEROES constant
    const heroData = HEROES.find(h => h.id === hero.id)

    return {
      id: hero.id,
      name: hero.name,
      fullName: heroData?.name || hero.name,
      overview: heroData?.overview || '',
      appearance: heroData?.appearance_clothing || '',
      attributes: hero.attributes,
      currentHealth: hero.health,
      maxHealth: hero.maxHealth
    }
  }

  private showLoadingIndicator() {
    const centerX = this.cameras.main.width / 2
    const centerY = this.cameras.main.height / 2

    this.loadingText = this.add
      .text(centerX, centerY - 250, '...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        color: '#fbbf24'
      })
      .setOrigin(0.5)
      .setAlpha(0)

    // Fade in animation
    this.tweens.add({
      targets: this.loadingText,
      alpha: 1,
      duration: 300
    })
  }

  private hideLoadingIndicator() {
    if (this.loadingText) {
      this.loadingText.destroy()
      this.loadingText = undefined
    }
  }

  private showCriticalHitEffect(defender: Hero) {
    if (!defender.heroImage) return

    // Flash effect
    this.tweens.add({
      targets: defender.heroImage,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2
    })

    // Screen shake
    this.cameras.main.shake(200, 0.01)

    // "CRITICAL!" text
    const critText = this.add
      .text(defender.heroImage.x, defender.heroImage.y - 50, 'CRITICAL!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '10px',
        color: '#ef4444'
      })
      .setOrigin(0.5)

    this.tweens.add({
      targets: critText,
      y: critText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => critText.destroy()
    })
  }
}
