import Phaser from 'phaser'

export default class HeroSelectScene extends Phaser.Scene {
  private playerName!: string
  private selectedHeroId: number | null = null

  constructor() {
    super('HeroSelectScene')
  }

  init(data: { player1Name: string }) {
    this.playerName = data.player1Name
  }

  create() {
    // Background
    this.cameras.main.setBackgroundColor('#0f172a')

    // Player Name
    this.add
      .text(400, 60, `${this.playerName} — Choose Your Hero`, {
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5)

    // Hero cards (placeholders)
    const startX = 150
    const y = 250
    const spacing = 130

    for (let i = 0; i < 5; i++) {
      const card = this.add
        .rectangle(startX + i * spacing, y, 100, 140, 0x334155)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true })

      const label = this.add
        .text(card.x, card.y, `Hero ${i + 1}`, {
          fontSize: '16px',
          color: '#ffffff'
        })
        .setOrigin(0.5)

      card.on('pointerdown', () => {
        this.selectHero(i, card)
      })
    }
  }

  private selectHero(heroId: number, card: Phaser.GameObjects.Rectangle) {
    if (this.selectedHeroId !== null) return

    this.selectedHeroId = heroId

    // Visual feedback
    card.setFillStyle(0x16a34a)

    // Small delay before next scene
    this.time.delayedCall(600, () => {
      this.scene.start('HeroSelectSceneP2', {
        player1Name: this.playerName,
        player1HeroId: heroId
      })
    })
  }
}

