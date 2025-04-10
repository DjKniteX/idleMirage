import type { Spell } from "@/components/game"

// Extended spell type with additional properties
export interface SpellData extends Spell {
  id: string
  name: string
  description: string
  type: "damage" | "heal" | "buff" | "debuff" | "utility"
  power: number
  manaCost: number
  learned: boolean
  learnedFromScroll: boolean
  requiredLevel: number
  cooldown: number // in seconds
  areaOfEffect: boolean
  targetType: "enemy" | "self" | "ally" | "all"
  element?: "fire" | "ice" | "lightning" | "holy" | "shadow" | "nature" | "arcane" | "physical"
  classRestrictions?: string[] // Which classes can learn this spell
}

// All spells in the game
export const allSpells: SpellData[] = [
  {
    id: "fireball",
    name: "Fireball",
    description: "Launches a ball of fire at the enemy, dealing moderate damage.",
    type: "damage",
    power: 25,
    manaCost: 15,
    learned: false,
    learnedFromScroll: true,
    requiredLevel: 1,
    cooldown: 2,
    areaOfEffect: false,
    targetType: "enemy",
    element: "fire",
    classRestrictions: [""],
  },
  
]

// Get spells available to a specific class
export function getSpellsForClass(characterClass: string): SpellData[] {
  return allSpells.filter((spell) => !spell.classRestrictions || spell.classRestrictions.includes(characterClass))
}

// Get a spell by ID
export function getSpellById(spellId: string): SpellData | undefined {
  return allSpells.find((spell) => spell.id === spellId)
}

// Update content statistics
export function getSpellsCount(): number {
  return allSpells.length
}

