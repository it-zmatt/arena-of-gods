import type { CombatContext, GeminiResponse, BattleOutcome } from '../types/gemini'

export default class GeminiService {
  private apiKey: string
  private model = 'gemini-2.5-flash-lite' // Fast model for real-time gameplay
  private cache: Map<string, BattleOutcome> = new Map()

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (!this.apiKey) {
      console.warn('VITE_GEMINI_API_KEY not found in environment variables')
    }
  }

  /**
   * Main method to generate battle outcome using Gemini AI
   */
  async generateBattleOutcome(context: CombatContext): Promise<GeminiResponse> {
    // Check cache first
    const cacheKey = this.getCacheKey(context)
    if (this.cache.has(cacheKey) && this.cache.size < 50) {
      const cached = this.cache.get(cacheKey)!
      return {
        success: true,
        outcome: { ...cached, narrative: this.varyNarrative(cached.narrative, context) },
        usedFallback: false
      }
    }

    try {
      // Build prompt with combat context
      const prompt = this.buildPrompt(context)

      // Call Gemini API
      const apiResponse = await this.callGeminiAPI(prompt)

      // Parse and validate response
      const outcome = this.parseResponse(apiResponse)

      // Store in cache
      if (this.cache.size < 50) {
        this.cache.set(cacheKey, outcome)
      }

      return {
        success: true,
        outcome,
        usedFallback: false
      }
    } catch (error) {
      console.warn('Gemini API error, using fallback:', error)

      // Return fallback outcome
      return {
        success: false,
        outcome: this.getFallbackOutcome(context),
        error: error instanceof Error ? error.message : 'Unknown error',
        usedFallback: true
      }
    }
  }

  /**
   * Build structured prompt for Gemini AI
   */
  private buildPrompt(context: CombatContext): string {
    const { attacker, defender, turnNumber, battleEnvironment } = context

    return `ROLE: You are a fantasy battle narrator for a turn-based combat game.

CONTEXT:
- Turn ${turnNumber} of an arena battle
- Environment: ${battleEnvironment}

ATTACKER:
- Name: ${attacker.fullName}
- Overview: ${attacker.overview}
- Appearance: ${attacker.appearance}
- Stats: STR:${attacker.attributes.strength} DEF:${attacker.attributes.defense} INT:${attacker.attributes.intelligence} ACC:${attacker.attributes.accuracy} AGI:${attacker.attributes.agility} STA:${attacker.attributes.stamina}
- Health: ${attacker.currentHealth}/${attacker.maxHealth}

DEFENDER:
- Name: ${defender.fullName}
- Overview: ${defender.overview}
- Appearance: ${defender.appearance}
- Stats: STR:${defender.attributes.strength} DEF:${defender.attributes.defense} INT:${defender.attributes.intelligence} ACC:${defender.attributes.accuracy} AGI:${defender.attributes.agility} STA:${defender.attributes.stamina}
- Health: ${defender.currentHealth}/${defender.maxHealth}

TASK:
Analyze both heroes' stats and generate a battle outcome in JSON format:
{
  "narrative": "Single sentence describing the action",
  "damage": number (calculated based on attacker's strength/intelligence/accuracy vs defender's defense/agility),
  "attackSuccess": boolean,
  "criticalHit": boolean (rare, only if attacker has 7+ accuracy AND 7+ strength/intelligence),
  "attackType": "melee" | "ranged" | "magic" | "defense"
}

RULES:
1. Damage calculation:
   - Base damage = attacker.strength OR attacker.intelligence (use higher)
   - Modified by defender.defense (reduce by defender.defense * 0.4)
   - Hit chance based on attacker.accuracy vs defender.agility
   - Critical multiplier: 1.5x if criticalHit is true
   - Range: 3-30 damage
2. Narrative MUST be 60-80 characters maximum - very short and punchy
3. Use short words and character first names only (e.g., "Brutus" not "Brutus the Executioner")
4. Reference fighting style briefly (e.g., "strikes", "blasts", "evades")
5. Keep it exciting but extremely concise

OUTPUT ONLY THE JSON, NO ADDITIONAL TEXT.`
  }

  /**
   * Call Gemini API with timeout and retry logic
   */
  private async callGeminiAPI(prompt: string, retries = 1): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1/models/${this.model}:generateContent?key=${this.apiKey}`

    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000) // 4s timeout (shorter for faster fallback)

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,     // Balance creativity and consistency
              maxOutputTokens: 150, // Keep responses concise to save quota
              topP: 0.9,
              topK: 40
            }
          }),
          signal: controller.signal
        })

        clearTimeout(timeout)

        if (!response.ok) {
          const errorText = await response.text()

          // Check for rate limit errors (429)
          if (response.status === 429) {
            console.warn('Gemini API rate limit exceeded')
            throw new Error('Rate limit exceeded')
          }

          // Check for quota exceeded errors
          if (errorText.includes('quota') || errorText.includes('RESOURCE_EXHAUSTED')) {
            console.warn('Gemini API quota exhausted')
            throw new Error('Quota exhausted')
          }

          throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
        }

        return await response.json()

      } catch (error) {
        // Don't retry on rate limit or quota errors - fail fast to fallback
        if (error instanceof Error &&
            (error.message.includes('Rate limit') || error.message.includes('Quota'))) {
          throw error
        }

        if (i === retries) throw error

        // Shorter exponential backoff for faster fallback
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
      }
    }
  }

  /**
   * Parse and validate Gemini API response
   */
  private parseResponse(apiResponse: any): BattleOutcome {
    try {
      const text = apiResponse.candidates[0].content.parts[0].text

      // Extract JSON from response (handle cases where AI adds text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const outcome = JSON.parse(jsonMatch[0]) as BattleOutcome

      // Validation
      if (!outcome.narrative || typeof outcome.damage !== 'number') {
        throw new Error('Invalid response structure')
      }

      // Sanitization
      outcome.damage = Math.max(3, Math.min(30, Math.floor(outcome.damage)))
      outcome.narrative = outcome.narrative.substring(0, 80).trim()

      return outcome
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Fallback outcome generation when API fails
   */
  private getFallbackOutcome(context: CombatContext): BattleOutcome {
    const { attacker, defender } = context

    // Calculate base damage
    const baseDamage = Math.max(
      attacker.attributes.strength,
      attacker.attributes.intelligence
    )

    // Apply defense reduction
    const damageReduction = defender.attributes.defense * 0.4
    const calculatedDamage = Math.max(3, Math.floor(baseDamage - damageReduction))

    // Calculate hit chance
    const hitChance = 0.6 + (attacker.attributes.accuracy - defender.attributes.agility) * 0.05
    const attackSuccess = Math.random() < Math.max(0.3, Math.min(0.95, hitChance))

    // Determine attack type
    const attackType = attacker.attributes.intelligence > attacker.attributes.strength ? 'magic' : 'melee'

    // Check for critical hit
    const criticalHit = attackSuccess &&
      attacker.attributes.accuracy >= 7 &&
      (attacker.attributes.strength >= 7 || attacker.attributes.intelligence >= 7) &&
      Math.random() < 0.15

    const finalDamage = attackSuccess ? (criticalHit ? Math.floor(calculatedDamage * 1.5) : calculatedDamage) : 0

    // Generate fallback narrative
    const narrative = this.generateFallbackNarrative(context, attackSuccess, criticalHit, attackType)

    return {
      narrative,
      damage: Math.min(30, finalDamage),
      attackSuccess,
      criticalHit,
      attackType
    }
  }

  /**
   * Generate stat-aware fallback narrative
   */
  private generateFallbackNarrative(
    context: CombatContext,
    success: boolean,
    critical: boolean,
    attackType: string
  ): string {
    const { attacker, defender } = context

    if (!success) {
      const missTemplates = [
        `${defender.name} dodges ${attacker.name}'s attack`,
        `${attacker.name} misses ${defender.name}`,
        `${defender.name} blocks ${attacker.name}'s strike`
      ]
      return missTemplates[Math.floor(Math.random() * missTemplates.length)]
    }

    if (critical) {
      const critTemplates = [
        `${attacker.name} lands a critical hit on ${defender.name}!`,
        `${attacker.name} strikes ${defender.name} critically!`,
        `${defender.name} takes a brutal hit from ${attacker.name}!`
      ]
      return critTemplates[Math.floor(Math.random() * critTemplates.length)]
    }

    // Regular hit templates based on attack type
    const magicTemplates = [
      `${attacker.name} blasts ${defender.name} with magic`,
      `${attacker.name} casts a spell on ${defender.name}`,
      `${defender.name} takes magical damage from ${attacker.name}`
    ]

    const meleeTemplates = [
      `${attacker.name} strikes ${defender.name}`,
      `${attacker.name} hits ${defender.name} hard`,
      `${defender.name} takes damage from ${attacker.name}`
    ]

    const templates = attackType === 'magic' ? magicTemplates : meleeTemplates
    return templates[Math.floor(Math.random() * templates.length)]
  }

  /**
   * Generate cache key based on hero matchup and stat ranges
   */
  private getCacheKey(context: CombatContext): string {
    const atkStats = `${context.attacker.id}-${Math.floor(context.attacker.attributes.strength / 2)}-${Math.floor(context.attacker.attributes.intelligence / 2)}`
    const defStats = `${context.defender.id}-${Math.floor(context.defender.attributes.defense / 2)}`
    return `${atkStats}_vs_${defStats}`
  }

  /**
   * Slightly vary cached narrative to avoid repetition
   */
  private varyNarrative(narrative: string, context: CombatContext): string {
    // Simple variation: occasionally add context-specific prefix
    if (Math.random() < 0.3) {
      const prefixes = [
        'Once again, ',
        'In a fierce exchange, ',
        'Continuing the battle, '
      ]
      return prefixes[Math.floor(Math.random() * prefixes.length)] + narrative.charAt(0).toLowerCase() + narrative.slice(1)
    }
    return narrative
  }
}
