import Phaser from 'phaser'
import GeminiService from '../services/GeminiService'
import type { CombatContext, HeroContext } from '../types/gemini'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']
const HEROES = [
  { id: 'brutus', name: 'Brutus' },
  { id: 'kael', name: 'Kael' },
  { id: 'lyra', name: 'Lyra' },
  { id: 'marcus', name: 'Marcus' },
  { id: 'thea', name: 'Thea' }
]

interface HeroAttributes {
  strength: number
  defense: number
  intelligence: number
  accuracy: number
  agility: number
  stamina: number
}

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
  private geminiService!: GeminiService
  private characterMetadata!: Array<any>
  private isProcessingTurn: boolean = false
  private currentEnvironment!: string
  private loadingText?: Phaser.GameObjects.Text

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
    // Load character metadata for AI context
    this.load.json('characterData', 'src/characters.json')
  }

  create() {
    const { width, height } = this.cameras.main

    // Load character metadata
    this.characterMetadata = this.cache.json.get('characterData').characters

    // Random background
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
    this.currentEnvironment = randomBg
    const bg = this.add.image(0, 0, `bg_${randomBg}`).setOrigin(0, 0)
    bg.setDisplaySize(width, height)

    // Dark overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)

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
      const attrs = player1HeroesData[index] || {
        strength: 1,
        defense: 1,
        intelligence: 1,
        accuracy: 1,
        agility: 1,
        stamina: 1
      }
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
      const attrs = player2HeroesData[index] || {
        strength: 1,
        defense: 1,
        intelligence: 1,
        accuracy: 1,
        agility: 1,
        stamina: 1
      }
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

    // Initialize battle log with starting message
    this.battleLog = ['The battle begins...']

    // Display battle log
    this.updateBattleLog(centerColumnX, narrativeStartY, maxLogLines)

    // Start battle simulation
    this.startBattleSimulation()
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
      const logText = this.add
        .text(centerX, y, logEntry, {
          fontFamily: '"Press Start 2P"',
          fontSize: '8px',
          color: '#e2e8f0',
          wordWrap: { width: 450 }
        })
        .setOrigin(0.5, 0)

      this.logTexts.push(logText)
    })
  }

  private startBattleSimulation() {
    // Simulate battle events periodically
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

    // Transition to winner scene after a short delay
    this.time.delayedCall(2000, () => {
      this.scene.start('WinnerScene', {
        winnerName,
        player1Name: this.player1Name,
        player2Name: this.player2Name
      })
    })
  }

  private updateHealthBars() {
    // Update Player 1 health bars
    this.player1Heroes.forEach((hero, index) => {
      if (hero.healthBar && hero.healthText) {
        const healthPercent = hero.health / hero.maxHealth
        const y = this.heroStartY + index * 80
        hero.healthBar.setSize(150 * healthPercent, 16)
        hero.healthText.setText(`${Math.ceil(hero.health)}/${hero.maxHealth}`)

        // Gray out dead heroes
        if (hero.health <= 0 && hero.heroImage) {
          hero.heroImage.setTint(0x666666)
          hero.heroImage.setAlpha(0.5)
        }
      }
    })

    // Update Player 2 health bars
    this.player2Heroes.forEach((hero, index) => {
      if (hero.healthBar && hero.healthText) {
        const healthPercent = hero.health / hero.maxHealth
        const y = this.heroStartY + index * 80
        hero.healthBar.setSize(150 * healthPercent, 16)
        hero.healthText.setText(`${Math.ceil(hero.health)}/${hero.maxHealth}`)

        // Gray out dead heroes
        if (hero.health <= 0 && hero.heroImage) {
          hero.heroImage.setTint(0x666666)
          hero.heroImage.setAlpha(0.5)
        }
      }
    })
  }

  private buildHeroContext(hero: Hero): HeroContext {
    // Find matching character metadata
    const metadata = this.characterMetadata.find(
      char => char.name.toLowerCase().includes(hero.id.toLowerCase())
    )

    return {
      id: hero.id,
      name: hero.name,
      fullName: metadata?.name || hero.name,
      overview: metadata?.overview || '',
      appearance: metadata?.appearance_clothing || '',
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
