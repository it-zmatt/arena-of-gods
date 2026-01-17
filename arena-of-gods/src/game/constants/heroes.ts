export interface HeroAttributes {
  strength: number
  defense: number
  intelligence: number
  accuracy: number
  agility: number
  stamina: number
}

export interface HeroData {
  id: string
  name: string
  overview: string
  appearance_clothing: string
  defaultAttributes: HeroAttributes
}

export const HEROES: HeroData[] = [
  { 
    id: 'kael', 
    name: 'Kael the Vanguard',
    overview: 'A disciplined spearman who leads from the front. Reliable and steadfast, excelling in prolonged engagements through superior positioning and stamina management.',
    appearance_clothing: 'Broad-shouldered man with weathered bronze skin and a shaved head. Wears a bronze cuirass over a linen tunic, leather greaves, and carries a large shield bearing a lion emblem.',
    defaultAttributes: {
      strength: 7,
      defense: 8,
      intelligence: 5,
      accuracy: 6,
      agility: 5,
      stamina: 8
    }
  },
  { 
    id: 'lyra', 
    name: 'Lyra the Archer',
    overview: 'A quick and precise hunter-turned-warrior. Relies on positioning and careful aim rather than brute force, making her dangerous from range and difficult to pin down.',
    appearance_clothing: 'Lithe woman with dark skin and long braided hair tied back. Wears leather armor with reinforced shoulder guards, arm bracers, and a quiver across her back. Light on her feet.',
    defaultAttributes: {
      strength: 5,
      defense: 4,
      intelligence: 7,
      accuracy: 9,
      agility: 9,
      stamina: 6
    }
  },
  { 
    id: 'brutus', 
    name: 'Brutus the Executioner',
    overview: 'Raw power incarnate. A former gladiator who overwhelms opponents through sheer force and intimidation, though he tires quickly and struggles with intelligent opponents.',
    appearance_clothing: 'Massive, muscular man with a scarred face and long beard. Wears minimal armor—just a leather harness and wrapped wrists—to showcase his physique. Carries a brutal two-handed axe.',
    defaultAttributes: {
      strength: 9,
      defense: 3,
      intelligence: 3,
      accuracy: 6,
      agility: 4,
      stamina: 5
    }
  },
  { 
    id: 'thea', 
    name: 'Thea the Strategist',
    overview: 'A tactical genius who outsmarts her opponents through preparation and adaptation. Excels at reading enemy patterns and adjusting mid-battle, though physically unimposing.',
    appearance_clothing: 'Slender woman with sharp features and silver-streaked dark hair. Wears ornate robes over leather armor, decorated with mystical symbols. Carries a staff and wears multiple rings.',
    defaultAttributes: {
      strength: 4,
      defense: 5,
      intelligence: 9,
      accuracy: 7,
      agility: 6,
      stamina: 6
    }
  },
  { 
    id: 'marcus', 
    name: 'Marcus the Ironclad',
    overview: 'An unstoppable defensive wall. Trained in heavy armor combat, Marcus absorbs punishment and retaliates methodically, outlasting opponents through sheer toughness.',
    appearance_clothing: 'Tall, stocky man with a calm, scarred face and short dark hair. Wears full plate armor with a roman-style helmet, greaves, and carries a gladius and shield.',
    defaultAttributes: {
      strength: 6,
      defense: 9,
      intelligence: 6,
      accuracy: 5,
      agility: 4,
      stamina: 8
    }
  }
]
