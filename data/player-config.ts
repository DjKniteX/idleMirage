"use client"
import type { Player } from "@/components/game"
import { BASE_PLAYER_STATS, GAME_BALANCE } from "./game-config"
import { getRaceConfig, getClassConfig } from "./character-config"

// Create a new player with proper stats
export function createNewPlayer(
  name: string,
  race: string,
  characterClass: string,
  imageUrl = "/placeholder.svg?height=150&width=150",
): Player {
  // Start with base stats
  const baseStats = { ...BASE_PLAYER_STATS }

  // Apply race modifiers
  const raceConfig = getRaceConfig(race)
  const raceModifiers = raceConfig?.stats || {}

  // Apply class modifiers
  const classConfig = getClassConfig(characterClass)
  const classModifiers = classConfig?.stats || {}

  // Calculate stats
  const maxHealth = baseStats.health + (raceModifiers.health || 0) + (classModifiers.health || 0)
  const maxMana = baseStats.mana + (raceModifiers.mana || 0) + (classModifiers.mana || 0)

  // Create RPG stats
  const rpgStats = {
    strength: baseStats.strength + (raceModifiers.strength || 0) + (classModifiers.strength || 0),
    dexterity: baseStats.dexterity + (raceModifiers.dexterity || 0) + (classModifiers.dexterity || 0),
    constitution: baseStats.constitution + (raceModifiers.constitution || 0) + (classModifiers.constitution || 0),
    intelligence: baseStats.intelligence + (raceModifiers.intelligence || 0) + (classModifiers.intelligence || 0),
    wisdom: baseStats.wisdom + (raceModifiers.wisdom || 0) + (classModifiers.wisdom || 0),
    charisma: baseStats.charisma + (raceModifiers.charisma || 0) + (classModifiers.charisma || 0),
  }

  // Create new player
  const newPlayer: Player = {
    name,
    race,
    class: characterClass,
    level: 1,
    experience: 0,
    experienceToNextLevel: GAME_BALANCE.baseExperienceToNextLevel,
    gold: GAME_BALANCE.startingGold,
    stats: {
      health: maxHealth, // Start with FULL health
      maxHealth: maxHealth,
      attack: baseStats.attack + (raceModifiers.attack || 0) + (classModifiers.attack || 0),
      defense: baseStats.defense + (raceModifiers.defense || 0) + (classModifiers.defense || 0),
      mana: maxMana, // Start with FULL mana
      maxMana: maxMana,
    },
    rpgStats,
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      helmet: null,
      boots: null,
      accessory: null,
    },
    skills: [],
    skillPoints: 1, // Start with 1 skill point
    spells: [], // Start with no spells (will be added based on class in the Game component)
    statPoints: 0,
    imageUrl,
  }

  return newPlayer
}

// Helper functions

// Get race description
export function getRaceDescription(raceId: string): string {
  const RACES = {
    human: {
      description: "Humans are versatile and adaptable, with balanced stats.",
    },
    elf: {
      description: "Elves are graceful and magical, with higher mana but lower health.",
    },
    dwarf: {
      description: "Dwarves are sturdy and resilient, with higher health and defense.",
    },
    orc: {
      description: "Orcs are powerful and fierce, with higher attack and health.",
    },
  }
  return RACES[raceId]?.description || "No description available."
}

// Get class description
export function getClassDescription(classId: string): string {
  const CLASSES = {
    warrior: {
      description: "Warriors excel in combat with high strength and constitution.",
    },
    ranger: {
      description: "Rangers are skilled in ranged combat with high dexterity.",
    },
    mage: {
      description: "Mages harness arcane power with high intelligence and mana.",
    },
    cleric: {
      description: "Clerics channel divine power with high wisdom and charisma.",
    },
  }
  return CLASSES[classId]?.description || "No description available."
}

