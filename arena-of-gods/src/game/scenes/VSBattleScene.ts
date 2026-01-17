import Phaser from 'phaser'

const BACKGROUNDS = ['forest', 'river', 'volcanic_river', 'plains', 'fortress']

export default class VSBattleScene extends Phaser.Scene {
  private player1Name!: string
  private player2Name!: string

  constructor() {
    super('VSBattleScene')
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
  }

  create() {
    const { width, height } = this.cameras.main

    // Start with black screen
    this.cameras.main.setBackgroundColor('#000000')

    // Random background
    const randomBg = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
    const bg = this.add.image(0, 0, `bg_${randomBg}`).setOrigin(0, 0)
    bg.setDisplaySize(width, height)
    bg.setAlpha(0)

    // Fade in background
    this.tweens.add({
      targets: bg,
      alpha: 0.3,
      duration: 1000,
      ease: 'Power2'
    })

    // VS Text with dramatic entrance
    const vsText = this.add
      .text(width / 2, height / 2, 'VS', {
        fontFamily: '"Press Start 2P"',
        fontSize: '80px',
        color: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 8
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.1)
      .setShadow(0, 0, '#fbbf24', 30, true, true)

    // Player 1 name (left side)
    const player1Text = this.add
      .text(width / 2 - 200, height / 2 - 100, this.player1Name.toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#3b82f6',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setX(width / 2 - 400)
      .setShadow(0, 0, '#3b82f6', 15, true, true)

    // Player 2 name (right side)
    const player2Text = this.add
      .text(width / 2 + 200, height / 2 - 100, this.player2Name.toUpperCase(), {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        color: '#ef4444',
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setX(width / 2 + 400)
      .setShadow(0, 0, '#ef4444', 15, true, true)

    // Battle announcement
    const battleText = this.add
      .text(width / 2, height / 2 + 150, 'BATTLE BEGINS!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '20px',
        color: '#fbbf24',
        stroke: '#000000',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setShadow(0, 0, '#fbbf24', 10, true, true)

    // Animate entrance sequence
    // 1. Player names slide in
    this.tweens.add({
      targets: player1Text,
      x: width / 2 - 200,
      alpha: 1,
      duration: 800,
      delay: 300,
      ease: 'Back.easeOut'
    })

    this.tweens.add({
      targets: player2Text,
      x: width / 2 + 200,
      alpha: 1,
      duration: 800,
      delay: 300,
      ease: 'Back.easeOut'
    })

    // 2. VS text explodes in
    this.time.delayedCall(1200, () => {
      this.tweens.add({
        targets: vsText,
        alpha: 1,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 600,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Pulse effect
          this.tweens.add({
            targets: vsText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 500,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.easeInOut'
          })
        }
      })
    })

    // 3. Battle text fades in
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: battleText,
        alpha: 1,
        y: height / 2 + 120,
        duration: 500,
        ease: 'Power2'
      })
    })

    // Particle effects
    this.createParticleEffects(width, height)

    // Transition to battle after 3 seconds
    this.time.delayedCall(3500, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0)
      this.time.delayedCall(500, () => {
        this.scene.start('BattleScene', {
          player1Name: this.player1Name,
          player2Name: this.player2Name
        })
      })
    })
  }

  private createParticleEffects(width: number, height: number) {
    // Create simple animated circles as particles instead of using particle emitters
    const createParticleBurst = (x: number, y: number, color: number, count: number, delay: number) => {
      this.time.delayedCall(delay, () => {
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2
          const speed = 100 + Math.random() * 150
          const particle = this.add.circle(x, y, 4, color)
          particle.setAlpha(0.8)
          
          this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 1500 + Math.random() * 500,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          })
        }
      })
    }

    // Player 1 particles (blue) - burst at 1200ms
    createParticleBurst(width / 2 - 200, height / 2 - 100, 0x3b82f6, 20, 1200)
    
    // Player 2 particles (red) - burst at 1200ms
    createParticleBurst(width / 2 + 200, height / 2 - 100, 0xef4444, 20, 1200)
    
    // VS center particles (gold) - burst at 1800ms
    createParticleBurst(width / 2, height / 2, 0xfbbf24, 30, 1800)

    // Continuous particles after initial burst
    const createContinuousParticles = (x: number, y: number, color: number, delay: number) => {
      this.time.delayedCall(delay, () => {
        const emitParticle = () => {
          if (!this.scene.isActive()) return
          
          const angle = Math.random() * Math.PI * 2
          const speed = 100 + Math.random() * 150
          const particle = this.add.circle(x, y, 3, color)
          particle.setAlpha(0.6)
          
          this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => particle.destroy()
          })
          
          this.time.delayedCall(200, emitParticle)
        }
        emitParticle()
      })
    }

    createContinuousParticles(width / 2 - 200, height / 2 - 100, 0x3b82f6, 2000)
    createContinuousParticles(width / 2 + 200, height / 2 - 100, 0xef4444, 2000)
    createContinuousParticles(width / 2, height / 2, 0xfbbf24, 2000)
  }
}
