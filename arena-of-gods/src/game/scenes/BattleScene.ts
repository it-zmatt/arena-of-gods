import Phaser from 'phaser'

interface HeroAttributes {
  strength: number
  defense: number
  intelligence: number
  accuracy: number
  agility: number
  stamina: number
}

interface Hero {
  name: string
  attributes: HeroAttributes
  health: number
  maxHealth: number
  healthBar?: Phaser.GameObjects.Rectangle
  healthBarBg?: Phaser.GameObjects.Rectangle
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

  constructor() {
    super('BattleScene')
  }

  init(data: { player1Name: string; player2Name: string }) {
    this.player1Name = data.player1Name
    this.player2Name = data.player2Name
  }

  create() {
    const { width, height } = this.cameras.main

    // Background
    this.cameras.main.setBackgroundColor('#ffffff')

    // Main panel with rounded corners effect (using rectangle)
    const panelWidth = width * 0.95
    const panelHeight = height * 0.9
    const panelX = width / 2
    const panelY = height / 2

    this.add
      .rectangle(panelX, panelY, panelWidth, panelHeight, 0xf5f5f5)
      .setStrokeStyle(3, 0x000000)

    // Load hero data from registry
    const player1HeroesData = this.registry.get('player1Heroes') as HeroAttributes[] || []
    const player2HeroesData = this.registry.get('player2Heroes') as HeroAttributes[] || []

    // Initialize heroes with health (stamina * 10 as max health)
    const heroNames = ['Kael', 'Kael', 'Kael', 'Kael', 'Kael']
    
    this.player1Heroes = heroNames.map((name, index) => {
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
        name,
        attributes: attrs,
        health: maxHealth,
        maxHealth
      }
    })

    this.player2Heroes = heroNames.map((name, index) => {
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
        name,
        attributes: attrs,
        health: maxHealth,
        maxHealth
      }
    })

    // Turn indicator (top left)
    this.turnIndicator = this.add
      .text(panelX - panelWidth / 2 + 30, panelY - panelHeight / 2 + 20, this.currentTurn.toString(), {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      })
      .setOrigin(0, 0)

    // Arrow pointing to panel (left side)
    const arrowX = panelX - panelWidth / 2 - 40
    const arrowY = panelY
    this.add
      .text(arrowX, arrowY, '→', {
        fontSize: '32px',
        color: '#000000'
      })
      .setOrigin(0.5)

    // Calculate column widths
    const leftColumnWidth = panelWidth * 0.25
    const rightColumnWidth = panelWidth * 0.25

    this.leftColumnX = panelX - panelWidth / 2 + leftColumnWidth / 2
    const centerColumnX = panelX
    this.rightColumnX = panelX + panelWidth / 2 - rightColumnWidth / 2

    // Player 1 Section (Left)
    this.add
      .text(this.leftColumnX, panelY - panelHeight / 2 + 30, 'Player 1', {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    this.heroStartY = panelY - panelHeight / 2 + 80
    const heroSpacing = 60

    // Player 1 Heroes
    this.player1Heroes.forEach((hero, index) => {
      const y = this.heroStartY + index * heroSpacing
      
      // Portrait placeholder (square on left)
      this.add
        .rectangle(this.leftColumnX - 80, y, 30, 30, 0xcccccc)
        .setStrokeStyle(1, 0x000000)

      // Hero name
      this.add
        .text(this.leftColumnX - 50, y, hero.name, {
          fontSize: '14px',
          color: '#000000'
        })
        .setOrigin(0, 0.5)

      // Health bar background
      hero.healthBarBg = this.add
        .rectangle(this.leftColumnX + 50, y, 100, 12, 0xeeeeee)
        .setStrokeStyle(1, 0x000000)

      // Health bar (green)
      const healthPercent = hero.health / hero.maxHealth
      hero.healthBar = this.add
        .rectangle(
          this.leftColumnX + 50,
          y,
          100 * healthPercent,
          12,
          0x4caf50
        )
        .setOrigin(0.5, 0.5)
    })

    // Player 2 Section (Right)
    this.add
      .text(this.rightColumnX, panelY - panelHeight / 2 + 30, 'Player 2', {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)

    // Player 2 Heroes
    this.player2Heroes.forEach((hero, index) => {
      const y = this.heroStartY + index * heroSpacing
      
      // Hero name
      this.add
        .text(this.rightColumnX - 50, y, hero.name, {
          fontSize: '14px',
          color: '#000000'
        })
        .setOrigin(1, 0.5)

      // Health bar background
      hero.healthBarBg = this.add
        .rectangle(this.rightColumnX - 50, y, 100, 12, 0xeeeeee)
        .setStrokeStyle(1, 0x000000)

      // Health bar (green)
      const healthPercent = hero.health / hero.maxHealth
      hero.healthBar = this.add
        .rectangle(
          this.rightColumnX - 50,
          y,
          100 * healthPercent,
          12,
          0x4caf50
        )
        .setOrigin(0.5, 0.5)

      // Portrait placeholder (square on right)
      this.add
        .rectangle(this.rightColumnX + 80, y, 30, 30, 0xcccccc)
        .setStrokeStyle(1, 0x000000)
    })

    // Center Section - Battle Narrative
    const narrativeStartY = this.heroStartY
    const narrativeHeight = panelHeight - 120
    const maxLogLines = Math.floor(narrativeHeight / 25)

    // Initialize battle log with some example events
    this.battleLog = [
      'Kael received an arrow on his chest',
      'Kael tripped and hit his head on a rock',
      'Kael got in a fight and lost his sword',
      'Kael hit Kael with the sword',
      'Kael hit Kael with the sword',
      'Kael hit Kael with the sword'
    ]

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
    const lineSpacing = 25

    displayLog.forEach((logEntry, index) => {
      const y = startY + index * lineSpacing
      const logText = this.add
        .text(centerX, y, logEntry, {
          fontSize: '12px',
          color: '#666666',
          wordWrap: { width: 400 }
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

  private simulateBattleEvent() {
    // Check if battle is already over
    if (this.battleEnded) {
      return
    }

    // Generate random battle events
    const events = [
      'Kael received an arrow on his chest',
      'Kael tripped and hit his head on a rock',
      'Kael got in a fight and lost his sword',
      'Kael hit Kael with the sword',
      'Kael dodged an attack',
      'Kael healed for 5 health',
      'Kael cast a fire spell',
      'Kael blocked with his shield'
    ]

    const randomEvent = events[Math.floor(Math.random() * events.length)]
    this.battleLog.push(randomEvent)

    // Update health bars randomly
    if (Math.random() > 0.5) {
      const randomHero = this.player1Heroes[Math.floor(Math.random() * this.player1Heroes.length)]
      const damage = Math.floor(Math.random() * 20) + 5
      randomHero.health = Math.max(0, randomHero.health - damage)
    } else {
      const randomHero = this.player2Heroes[Math.floor(Math.random() * this.player2Heroes.length)]
      const damage = Math.floor(Math.random() * 20) + 5
      randomHero.health = Math.max(0, randomHero.health - damage)
    }

    // Increment turn
    this.currentTurn++
    this.turnIndicator.setText(this.currentTurn.toString())

    // Update display
    this.updateHealthBars()
    this.updateBattleLog(this.cameras.main.width / 2, this.cameras.main.height / 2 - 200, 15)

    // Check if battle ended after this turn
    this.checkBattleEnd()
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
    this.updateBattleLog(this.cameras.main.width / 2, this.cameras.main.height / 2 - 200, 15)

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
    this.player1Heroes.forEach((hero) => {
      if (hero.healthBar) {
        const healthPercent = hero.health / hero.maxHealth
        hero.healthBar.setSize(100 * healthPercent, 12)
      }
    })

    // Update Player 2 health bars
    this.player2Heroes.forEach((hero) => {
      if (hero.healthBar) {
        const healthPercent = hero.health / hero.maxHealth
        hero.healthBar.setSize(100 * healthPercent, 12)
      }
    })
  }
}
