import type { Monster } from "@/components/game"
import { getMonsterLoot } from "./items"

// Base monster templates
export const monsterTemplates: Monster[] = [
  {
    id: "slime",
    name: "Slime",
    level: 1,
    health: 20,
    maxHealth: 20,
    attack: 3,
    defense: 1,
    experience: 10,
    gold: 5,
    loot: getMonsterLoot("slime"),
    imageUrl: "/placeholder.svg?height=100&width=100",
  },

]

// Generate a random monster with scaled stats based on level
export const generateRandomMonster = (playerLevel: number): Monster => {
  // Select a random monster template
  const template = monsterTemplates[Math.floor(Math.random() * monsterTemplates.length)]

  // Calculate a random level based on player level (between player level -2 and player level +3)
  const minLevel = Math.max(1, playerLevel - 2)
  const maxLevel = playerLevel + 3
  const monsterLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel

  // Scale stats based on level difference from template
  const levelMultiplier = monsterLevel / template.level

  // Create a new monster with scaled stats
  return {
    ...template,
    id: `${template.id}-${Date.now()}`, // Unique ID
    name: monsterLevel > template.level * 1.5 ? `Elite ${template.name}` : template.name,
    level: monsterLevel,
    health: Math.round(template.health * levelMultiplier),
    maxHealth: Math.round(template.maxHealth * levelMultiplier),
    attack: Math.round(template.attack * levelMultiplier),
    defense: Math.round(template.defense * levelMultiplier),
    experience: Math.round(template.experience * levelMultiplier),
    gold: Math.round(template.gold * levelMultiplier),
  }
}

// Generate a set of random monsters with no duplicates
export const generateRandomMonsters = (count: number, playerLevel: number): Monster[] => {
  const monsters: Monster[] = []
  const usedTemplateIds = new Set<string>()

  // First, determine how many unique monster types we need
  const numUniqueMonsters = Math.min(count, monsterTemplates.length)

  // Create a shuffled copy of the monster templates
  const shuffledTemplates = [...monsterTemplates].sort(() => 0.5 - Math.random())

  // Generate the requested number of monsters
  for (let i = 0; i < count; i++) {
    // If we've used all templates, reset the used templates set
    if (usedTemplateIds.size >= numUniqueMonsters) {
      usedTemplateIds.clear()
    }

    // Find a template we haven't used yet
    let template
    for (const t of shuffledTemplates) {
      if (!usedTemplateIds.has(t.id)) {
        template = t
        usedTemplateIds.add(t.id)
        break
      }
    }

    // If somehow we didn't find a template (shouldn't happen), use a random one
    if (!template) {
      template = shuffledTemplates[Math.floor(Math.random() * shuffledTemplates.length)]
    }

    // Calculate a random level based on player level
    const minLevel = Math.max(1, playerLevel - 2)
    const maxLevel = playerLevel + 3
    const monsterLevel = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel

    // Scale stats based on level difference from template
    const levelMultiplier = monsterLevel / template.level

    // Create a new monster with scaled stats
    monsters.push({
      ...template,
      id: `${template.id}-${Date.now()}-${i}`, // Unique ID
      name: monsterLevel > template.level * 1.5 ? `Elite ${template.name}` : template.name,
      level: monsterLevel,
      health: Math.round(template.health * levelMultiplier),
      maxHealth: Math.round(template.maxHealth * levelMultiplier),
      attack: Math.round(template.attack * levelMultiplier),
      defense: Math.round(template.defense * levelMultiplier),
      experience: Math.round(template.experience * levelMultiplier),
      gold: Math.round(template.gold * levelMultiplier),
    })
  }

  return monsters
}

// Helper function to get a specific monster by ID
export const getMonsterById = (id: string): Monster | undefined => {
  return monsterTemplates.find((monster) => monster.id === id)
}

