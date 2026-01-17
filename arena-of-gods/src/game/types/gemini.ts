// Type definitions for Gemini AI integration

interface HeroAttributes {
  strength: number
  defense: number
  intelligence: number
  accuracy: number
  agility: number
  stamina: number
}

// Hero context sent to Gemini API
export interface HeroContext {
  id: string
  name: string
  fullName: string           // e.g., "Kael the Vanguard"
  overview: string            // Character personality/fighting style
  appearance: string          // Visual description
  attributes: HeroAttributes  // STR, DEF, INT, ACC, AGI, STA
  currentHealth: number
  maxHealth: number
}

// Combat scenario for AI analysis
export interface CombatContext {
  attacker: HeroContext
  defender: HeroContext
  turnNumber: number
  battleEnvironment: string   // e.g., "forest", "volcanic_river"
}

// Expected AI response structure
export interface BattleOutcome {
  narrative: string           // AI-generated description (100-150 chars)
  damage: number              // Stat-based damage calculation
  attackSuccess: boolean      // Did the attack land?
  criticalHit: boolean        // Was it critical?
  attackType: 'melee' | 'ranged' | 'magic' | 'defense'
}

// Service response wrapper
export interface GeminiResponse {
  success: boolean
  outcome?: BattleOutcome
  error?: string
  usedFallback: boolean
}
