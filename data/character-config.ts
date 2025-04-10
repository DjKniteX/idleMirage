// Race definitions
export interface RaceConfig {
  name: string
  description: string
  stats: {
    health: number
    mana: number
    attack: number
    defense: number
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  abilities?: string[]
  lore?: string
  availableClasses?: string[] // Optional restriction on which classes this race can choose
}

// Class definitions
export interface ClassConfig {
  name: string
  description: string
  stats: {
    health: number
    mana: number
    attack: number
    defense: number
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  startingSpells: string[] // IDs of spells this class starts with
  abilities?: string[]
  lore?: string
  primaryAttribute: "strength" | "dexterity" | "intelligence" | "wisdom" | "charisma"
  recommendedRaces?: string[] // Optional suggestion for which races work well with this class
}

// Race configurations
export const RACES: Record<string, RaceConfig> = {
  human: {
    name: "Human",
    description: "Humans are versatile and adaptable, with balanced stats.",
    stats: {
      health: 10,
      mana: 0,
      attack: 2,
      defense: 2,
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    lore: "Humans are known for their adaptability and ambition. They can excel in any profession and are found in all corners of the world.",
  },
  elf: {
    name: "Elf",
    description: "Elves are graceful and magical, with higher mana but lower health.",
    stats: {
      health: 0,
      mana: 25,
      attack: 1,
      defense: 0,
      strength: 0,
      dexterity: 2,
      constitution: 0,
      intelligence: 2,
      wisdom: 1,
      charisma: 1,
    },
    lore: "Elves are an ancient race with deep connections to magic and nature. They live for centuries, giving them a long-term perspective on the world.",
  },
  dwarf: {
    name: "Dwarf",
    description: "Dwarves are sturdy and resilient, with higher health and defense.",
    stats: {
      health: 25,
      mana: -10,
      attack: 0,
      defense: 3,
      strength: 2,
      dexterity: 0,
      constitution: 3,
      intelligence: 0,
      wisdom: 1,
      charisma: 0,
    },
    lore: "Dwarves are a hardy folk who dwell in mountains and deep caves. They are master craftsmen and fierce warriors when defending their homes.",
  },
  orc: {
    name: "Orc",
    description: "Orcs are powerful and fierce, with higher attack and health.",
    stats: {
      health: 15,
      mana: -15,
      attack: 5,
      defense: 0,
      strength: 3,
      dexterity: 0,
      constitution: 2,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    lore: "Orcs are a tribal warrior race known for their physical prowess and battle tactics. They value strength and honor above all else.",
  },
}

// Class configurations
export const CLASSES: Record<string, ClassConfig> = {
  warrior: {
    name: "Warrior",
    description: "Warriors excel in combat with high strength and constitution.",
    stats: {
      health: 20,
      mana: 0,
      attack: 3,
      defense: 2,
      strength: 5,
      dexterity: 0,
      constitution: 3,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
    },
    startingSpells: [],
    primaryAttribute: "strength",
    lore: "Warriors are masters of combat, trained in the use of weapons and armor. They rely on physical strength and endurance to overcome challenges.",
  },
  ranger: {
    name: "Ranger",
    description: "Rangers are skilled in ranged combat with high dexterity.",
    stats: {
      health: 0,
      mana: 0,
      attack: 2,
      defense: 0,
      strength: 0,
      dexterity: 5,
      constitution: 0,
      intelligence: 0,
      wisdom: 2,
      charisma: 0,
    },
    startingSpells: ["hunters-mark"],
    primaryAttribute: "dexterity",
    lore: "Rangers are wilderness experts who specialize in tracking, survival, and ranged combat. They often serve as scouts and hunters.",
  },
  mage: {
    name: "Mage",
    description:
      "Mages harness arcane power with high intelligence and mana. Starts with Fireball and Frost Spike spells.",
    stats: {
      health: 0,
      mana: 30,
      attack: 0,
      defense: 0,
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 5,
      wisdom: 2,
      charisma: 0,
    },
    startingSpells: ["fireball", "frost"],
    primaryAttribute: "intelligence",
    lore: "Mages study the arcane arts, manipulating the elements and forces of nature. Their power comes from knowledge and understanding of magical theory.",
  },
  cleric: {
    name: "Cleric",
    description: "Clerics channel divine power with high wisdom and charisma. Starts with Heal spell.",
    stats: {
      health: 0,
      mana: 20,
      attack: 0,
      defense: 1,
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 5,
      charisma: 3,
    },
    startingSpells: ["heal"],
    primaryAttribute: "wisdom",
    lore: "Clerics are devoted servants of deities who channel divine power. They can heal wounds, protect allies, and smite enemies in the name of their faith.",
  },
}

// Helper functions

// Get race configuration
export function getRaceConfig(raceId: string): RaceConfig | undefined {
  return RACES[raceId]
}

// Get class configuration
export function getClassConfig(classId: string): ClassConfig | undefined {
  return CLASSES[classId]
}

// Get race description
export function getRaceDescription(raceId: string): string {
  return RACES[raceId]?.description || "No description available."
}

// Get class description
export function getClassDescription(classId: string): string {
  return CLASSES[classId]?.description || "No description available."
}

// Get starting spell IDs for a class
export function getClassStartingSpellIds(classId: string): string[] {
  return CLASSES[classId]?.startingSpells || []
}

// Get all available races
export function getAvailableRaces(): string[] {
  return Object.keys(RACES)
}

// Get all available classes
export function getAvailableClasses(): string[] {
  return Object.keys(CLASSES)
}

